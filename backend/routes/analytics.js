const router = require('express').Router();
const { query } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const xpService = require('../services/xp.service');

// GET /api/analytics/heatmap?year=
router.get('/heatmap', authenticate, async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const { rows } = await query(
      `SELECT DATE(client_ts) AS date, COUNT(*) AS count
       FROM sessions
       WHERE user_id = $1 AND EXTRACT(YEAR FROM client_ts) = $2
       GROUP BY DATE(client_ts)
       ORDER BY date`,
      [req.user.id, year]
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
      `SELECT * FROM sessions WHERE skill_id = $1 AND user_id = $2 ORDER BY client_ts ASC`,
      [req.params.skillId, req.user.id]
    );
    const { rows: skillRows } = await query(
      `SELECT * FROM skills WHERE id = $1 AND user_id = $2`,
      [req.params.skillId, req.user.id]
    );
    if (!skillRows[0]) return success(res, { score: null });

    const scoreBreakdown = xpService.getScoreBreakdown(sessions, skillRows[0]);
    success(res, { score: scoreBreakdown });
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
