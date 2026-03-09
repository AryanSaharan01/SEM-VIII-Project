const router = require('express').Router();
const { query } = require('../config/db');
const { success } = require('../utils/response');

// GET /api/leaderboard?limit=50
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50'), 100);
    const { rows } = await query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.total_xp,
              COUNT(DISTINCT s.id) AS skill_count,
              COALESCE(SUM(sess.duration_seconds),0)::int AS total_seconds
       FROM users u
       LEFT JOIN skills s ON s.user_id = u.id
       LEFT JOIN sessions sess ON sess.user_id = u.id
       WHERE u.username IS NOT NULL
       GROUP BY u.id
       ORDER BY u.total_xp DESC
       LIMIT $1`,
      [limit]
    );
    success(res, { leaderboard: rows.map((r, i) => ({ ...r, rank: i + 1 })) });
  } catch (err) { next(err); }
});

module.exports = router;
