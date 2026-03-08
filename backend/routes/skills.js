const router = require('express').Router();
const { body, param } = require('express-validator');
const { query, getClient } = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const achievementService = require('../services/achievement.service');

// GET /api/skills
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT s.*,
         (SELECT COUNT(*) FROM sessions WHERE skill_id = s.id) AS total_sessions,
         (SELECT COALESCE(SUM(duration_seconds),0) FROM sessions WHERE skill_id = s.id) AS total_seconds
       FROM skills s WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    const skills = rows.map(r => ({
      ...r,
      totalSessions: parseInt(r.total_sessions),
      totalHours: parseFloat((r.total_seconds / 3600).toFixed(1)),
    }));
    success(res, { skills });
  } catch (err) { next(err); }
});

// POST /api/skills
router.post('/',
  authenticate,
  validate([
    body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Skill name must be 3-100 chars'),
    body('category').isIn(['coding','writing','design','music','fitness','other']),
  ]),
  async (req, res, next) => {
    try {
      const { name, category, linkedRepo } = req.body;
      const { rows } = await query(
        `INSERT INTO skills (user_id, name, category, linked_repo_id, linked_repo_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.id, name.trim(), category, linkedRepo?.id || null, linkedRepo?.name || null]
      );
      success(res, { skill: rows[0] }, 'Skill created', 201);
    } catch (err) { next(err); }
  }
);

// GET /api/skills/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM skills WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rows[0]) throw new NotFoundError('Skill');
    success(res, { skill: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/skills/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { name, linkedRepo } = req.body;
    const { rows } = await query(
      `UPDATE skills SET
         name = COALESCE($1, name),
         linked_repo_id = COALESCE($2, linked_repo_id),
         linked_repo_name = COALESCE($3, linked_repo_name)
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name, linkedRepo?.id, linkedRepo?.name, req.params.id, req.user.id]
    );
    if (!rows[0]) throw new NotFoundError('Skill');
    success(res, { skill: rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/skills/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!rowCount) throw new NotFoundError('Skill');
    success(res, {}, 'Skill deleted');
  } catch (err) { next(err); }
});

module.exports = router;
