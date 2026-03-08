const router = require('express').Router();
const { body } = require('express-validator');
const { query } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { NotFoundError } = require('../utils/errors');

// GET /api/users/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.email, u.username, u.display_name, u.avatar_url, u.bio,
              u.github_login, u.total_xp, u.created_at,
              COUNT(DISTINCT s.id) AS skill_count,
              COALESCE(SUM(sess.duration_seconds),0)::int AS total_seconds
       FROM users u
       LEFT JOIN skills s ON s.user_id = u.id
       LEFT JOIN sessions sess ON sess.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    success(res, { user: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/users/me
router.patch('/me',
  authenticate,
  validate([
    body('username').optional().isAlphanumeric().isLength({ min: 3, max: 30 }),
    body('display_name').optional().isLength({ max: 60 }),
    body('bio').optional().isLength({ max: 300 }),
  ]),
  async (req, res, next) => {
    try {
      const { username, display_name, bio } = req.body;
      const { rows } = await query(
        `UPDATE users SET
           username = COALESCE($1, username),
           display_name = COALESCE($2, display_name),
           bio = COALESCE($3, bio)
         WHERE id = $4
         RETURNING id, email, username, display_name, bio, avatar_url, total_xp`,
        [username, display_name, bio, req.user.id]
      );
      success(res, { user: rows[0] });
    } catch (err) { next(err); }
  }
);

// GET /api/users/:username — public profile
router.get('/:username', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, username, display_name, avatar_url, bio, total_xp, created_at FROM users WHERE username = $1`,
      [req.params.username]
    );
    if (!rows[0]) throw new NotFoundError('User');
    success(res, { user: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
