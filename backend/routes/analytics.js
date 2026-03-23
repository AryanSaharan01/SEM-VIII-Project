const router = require('express').Router();
const { query } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const xpService = require('../services/xp.service');

// GET /api/analytics/heatmap?year=&skillId=
router.get('/heatmap', authenticate, async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const { skillId } = req.query;

    const params = [req.user.id, year];
    let skillFilter = '';
    if (skillId) {
      params.push(skillId);
      skillFilter = `AND skill_id = $${params.length}`;
    }

    const { rows } = await query(
      `SELECT DATE(client_ts) AS date, COUNT(*) AS count
       FROM sessions
       WHERE user_id = $1 AND EXTRACT(YEAR FROM client_ts) = $2 ${skillFilter}
       GROUP BY DATE(client_ts)
       ORDER BY date`,
      params
    );

    // Build 52-week grid (GitHub-style)
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const dateMap = Object.fromEntries(rows.map(r => [r.date.toISOString().slice(0, 10), parseInt(r.count)]));
    const weeks = [];
    let current = new Date(startDate);
    // align to Monday
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));

    while (current <= endDate) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = current.toISOString().slice(0, 10);
        week.push({ date: key, count: dateMap[key] || 0 });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    success(res, { heatmap: weeks, year });
  } catch (err) { next(err); }
});

// GET /api/analytics/score/:skillId
router.get('/score/:skillId', authenticate, async (req, res, next) => {
  try {
    const { rows: sessions } = await query(
      `SELECT s.*, 
         array_agg(
           json_build_object('type', p.type, 'name', p.name, 'path', p.path, 'repo_name', p.repo_name)
         ) FILTER (WHERE p.id IS NOT NULL) AS proof_of_work
       FROM sessions s
       LEFT JOIN proof_of_work p ON p.session_id = s.id
       WHERE s.skill_id = $1 AND s.user_id = $2
       GROUP BY s.id
       ORDER BY s.client_ts ASC`,
      [req.params.skillId, req.user.id]
    );
    const { rows: skillRows } = await query(
      `SELECT * FROM skills WHERE id = $1 AND user_id = $2`,
      [req.params.skillId, req.user.id]
    );
    if (!skillRows[0]) return success(res, { breakdown: null });

    const scoreData = xpService.getScoreBreakdown(sessions, skillRows[0]);
    
    // Transform to the format the frontend expects
    const breakdown = {};
    if (scoreData.components) {
      Object.entries(scoreData.components).forEach(([key, val]) => {
        breakdown[key] = {
          score: Math.round((val.score / val.max) * 100), // Convert to 0-100 scale
          weight: val.max,
          description: val.description
        };
      });
    }
    
    success(res, { breakdown, overall: scoreData.overall, history: scoreData.history });
  } catch (err) { next(err); }
});

// GET /api/analytics/overview
router.get('/overview', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
         COUNT(DISTINCT sk.id) AS total_skills,
         COUNT(DISTINCT sess.id) AS total_sessions,
         COALESCE(SUM(sess.duration_seconds), 0)::int AS total_seconds,
         COALESCE(MAX(sk.score), 0) AS best_score,
         COALESCE(MAX(sk.current_streak), 0) AS best_streak
       FROM users u
       LEFT JOIN skills sk ON sk.user_id = u.id
       LEFT JOIN sessions sess ON sess.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    success(res, { overview: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
