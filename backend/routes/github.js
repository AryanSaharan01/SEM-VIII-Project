const router = require('express').Router();
const axios = require('axios');
const { query } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const { NotFoundError, AppError } = require('../utils/errors');
const rateLimit = require('express-rate-limit');

const githubLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

const getGitHubToken = async (userId) => {
  const { rows } = await query(
    'SELECT access_token FROM github_connections WHERE user_id = $1',
    [userId]
  );
  if (!rows[0]) throw new AppError('GitHub not connected. Please connect GitHub first.', 400);
  return rows[0].access_token;
};

const githubAPI = (token) => axios.create({
  baseURL: 'https://api.github.com',
  headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
});

// GET /api/github/status — check connection
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT github_login, connected_at FROM github_connections WHERE user_id = $1',
      [req.user.id]
    );
    success(res, { connected: !!rows[0], connection: rows[0] || null });
  } catch (err) { next(err); }
});

// GET /api/github/repos — list user's repos
router.get('/repos', authenticate, githubLimiter, async (req, res, next) => {
  try {
    const token = await getGitHubToken(req.user.id);
    const { data } = await githubAPI(token).get('/user/repos?per_page=100&sort=updated&type=all');

    const repos = data.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      language: r.language,
      private: r.private,
      html_url: r.html_url,
      updated_at: r.updated_at,
      stargazers_count: r.stargazers_count,
    }));

    // Cache in DB
    await query(
      'UPDATE github_connections SET repos = $1, updated_at = NOW() WHERE user_id = $2',
      [JSON.stringify(repos), req.user.id]
    );

    success(res, { repos });
  } catch (err) { next(err); }
});

// GET /api/github/tree/:owner/:repo — get full tree of a repo
router.get('/tree/:owner/:repo', authenticate, githubLimiter, async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const token = await getGitHubToken(req.user.id);
    const api = githubAPI(token);

    // Get default branch
    const { data: repoData } = await api.get(`/repos/${owner}/${repo}`);
    const branch = repoData.default_branch;

    // Get full recursive tree
    const { data: treeData } = await api.get(
      `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    // Convert flat tree to nested structure
    const buildTree = (items) => {
      const root = [];
      const map = {};
      items.forEach(item => {
        map[item.path] = { name: item.path.split('/').pop(), path: item.path, type: item.type === 'tree' ? 'dir' : 'file', sha: item.sha, children: [] };
      });
      items.forEach(item => {
        const parts = item.path.split('/');
        if (parts.length === 1) {
          root.push(map[item.path]);
        } else {
          const parentPath = parts.slice(0, -1).join('/');
          if (map[parentPath]) map[parentPath].children.push(map[item.path]);
        }
      });
      return root;
    };

    success(res, {
      repo: repo,
      branch,
      tree: buildTree(treeData.tree),
      flatTree: treeData.tree.map(i => ({ path: i.path, type: i.type === 'tree' ? 'dir' : 'file', sha: i.sha })),
    });
  } catch (err) { next(err); }
});

// GET /api/github/file/:owner/:repo — get file content
router.get('/file/:owner/:repo', authenticate, githubLimiter, async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const { path } = req.query;
    if (!path) throw new AppError('File path required', 400);

    const token = await getGitHubToken(req.user.id);
    const { data } = await githubAPI(token).get(`/repos/${owner}/${repo}/contents/${path}`);

    if (data.type !== 'file') throw new AppError('Path is not a file', 400);
    if (data.size > 500000) throw new AppError('File too large to preview (>500KB)', 400);

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    success(res, { path, content, sha: data.sha, size: data.size });
  } catch (err) { next(err); }
});

// DELETE /api/github/disconnect
router.delete('/disconnect', authenticate, async (req, res, next) => {
  try {
    await query('DELETE FROM github_connections WHERE user_id = $1', [req.user.id]);
    await query('UPDATE users SET github_id = NULL, github_login = NULL WHERE id = $1', [req.user.id]);
    success(res, {}, 'GitHub disconnected');
  } catch (err) { next(err); }
});

module.exports = router;
