const router = require('express').Router();
const axios = require('axios');
const { query } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const { NotFoundError, AppError, ForbiddenError } = require('../utils/errors');
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

// GET /api/github/status — check connection + return selected repos
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT github_login, connected_at, selected_repos FROM github_connections WHERE user_id = $1',
      [req.user.id]
    );
    success(res, {
      connected: !!rows[0],
      connection: rows[0] || null,
      selectedRepos: rows[0]?.selected_repos || [],
    });
  } catch (err) { next(err); }
});

// GET /api/github/repos — fetch all repos from GitHub API + cache them
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

// GET /api/github/selected-repos — get user's chosen repos
router.get('/selected-repos', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT selected_repos FROM github_connections WHERE user_id = $1',
      [req.user.id]
    );
    if (!rows[0]) throw new AppError('GitHub not connected', 400);
    success(res, { selectedRepos: rows[0].selected_repos || [] });
  } catch (err) { next(err); }
});

// PATCH /api/github/selected-repos — save user's chosen repos
// Body: { selectedRepos: [...repo objects] }
// We block removal of any repo currently linked to a skill (matched by full_name OR numeric id).
router.patch('/selected-repos', authenticate, async (req, res, next) => {
  try {
    const { selectedRepos } = req.body;
    if (!Array.isArray(selectedRepos)) throw new AppError('selectedRepos must be an array', 400);

    // Find all repos currently linked to this user's skills
    const { rows: linkedRows } = await query(
      `SELECT linked_repo_id, linked_repo_name FROM skills WHERE user_id = $1 AND linked_repo_id IS NOT NULL`,
      [req.user.id]
    );

    // Build lookup sets from the incoming selection — match by full_name OR numeric id
    const incomingByFullName = new Set(selectedRepos.map(r => r.full_name).filter(Boolean));
    const incomingByNumericId = new Set(selectedRepos.map(r => String(r.id)).filter(Boolean));

    for (const row of linkedRows) {
      const storedVal = String(row.linked_repo_id);
      // storedVal may be "owner/repo" (full_name) or a numeric GitHub repo id
      const isPresent =
        incomingByFullName.has(storedVal) ||           // stored as full_name
        incomingByNumericId.has(storedVal) ||           // stored as numeric id
        selectedRepos.some(r => r.full_name?.endsWith('/' + row.linked_repo_name)); // name fallback

      if (!isPresent) {
        throw new ForbiddenError(
          `Cannot deselect repository "${row.linked_repo_name || storedVal}" — it is linked to a skill. Unlink it from the skill first.`
        );
      }
    }

    await query(
      'UPDATE github_connections SET selected_repos = $1, updated_at = NOW() WHERE user_id = $2',
      [JSON.stringify(selectedRepos), req.user.id]
    );

    success(res, { selectedRepos });
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
