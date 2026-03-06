const router = require('express').Router();
const { query } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');

// GET /api/achievements
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT ad.*, ua.earned_at,
              CASE WHEN ua.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS earned
       FROM achievement_definitions ad
       LEFT JOIN user_achievements ua ON ua.achievement_key = ad.key AND ua.user_id = $1
       ORDER BY ad.xp_reward DESC`,
      [req.user.id]
    );
    success(res, { achievements: rows });
  } catch (err) { next(err); }
});

module.exports = router;
