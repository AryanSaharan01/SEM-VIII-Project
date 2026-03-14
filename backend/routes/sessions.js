const router = require('express').Router();
const { body } = require('express-validator');
const { query, getClient } = require('../config/db');
const { success, paginated } = require('../utils/response');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { NotFoundError } = require('../utils/errors');
const { buildContentHash, buildEntryHash } = require('../utils/wallet');
const phaseService = require('../services/phase.service');
const xpService = require('../services/xp.service');
const achievementService = require('../services/achievement.service');
const streakService = require('../services/streak.service');
const aiService = require('../services/ai.service');

// GET /api/sessions?skillId=&page=&limit=
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { skillId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = skillId
      ? 'WHERE s.skill_id = $1 AND s.user_id = $2'
      : 'WHERE s.user_id = $1';
    const params = skillId ? [skillId, req.user.id, limit, offset] : [req.user.id, limit, offset];
    const countParams = skillId ? [skillId, req.user.id] : [req.user.id];

    const { rows } = await query(
      `SELECT s.*, array_agg(
         json_build_object('id', p.id, 'type', p.type, 'name', p.name, 'path', p.path, 'repo_name', p.repo_name, 'file_type', p.file_type)
       ) FILTER (WHERE p.id IS NOT NULL) AS proof_of_work
       FROM sessions s
       LEFT JOIN proof_of_work p ON p.session_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY s.client_ts DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countRows } = await query(
      `SELECT COUNT(*) FROM sessions s ${whereClause}`,
      countParams
    );

    paginated(res, rows, parseInt(countRows[0].count), page, limit);
  } catch (err) { next(err); }
});

// POST /api/sessions
router.post('/',
  authenticate,
  validate([
    body('skillId').isUUID(),
    body('topic').trim().isLength({ min: 3, max: 200 }),
    body('notes').trim().isLength({ min: 20 }),
    body('durationSeconds').isInt({ min: 60 }),
    body('difficulty').isIn(['easy','medium','hard','expert']),
    body('clientTs').isISO8601(),
  ]),
  async (req, res, next) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const { skillId, topic, notes, durationSeconds, difficulty, clientTs, proofOfWork = [] } = req.body;

      // Verify skill belongs to user
      const { rows: skillRows } = await client.query(
        'SELECT * FROM skills WHERE id = $1 AND user_id = $2',
        [skillId, req.user.id]
      );
      if (!skillRows[0]) throw new NotFoundError('Skill');
      const skill = skillRows[0];

      // Get last session for chain
      const { rows: lastSession } = await client.query(
        `SELECT entry_hash FROM sessions WHERE skill_id = $1 ORDER BY client_ts DESC LIMIT 1`,
        [skillId]
      );
      const prevHash = lastSession[0]?.entry_hash ||
        '0000000000000000000000000000000000000000000000000000000000000000';

      // Build hashes
      const contentHash = buildContentHash({ skillId, userId: req.user.id, topic, notes, durationSeconds, clientTs });
      const entryHash = buildEntryHash(contentHash, prevHash);

      // Phase detection — fetch all previous sessions for this skill
      const { rows: allSessions } = await client.query(
        `SELECT duration_seconds, difficulty, client_ts, phase FROM sessions WHERE skill_id = $1 ORDER BY client_ts ASC`,
        [skillId]
      );
      const phase = phaseService.detectPhase([
        ...allSessions,
        { duration_seconds: durationSeconds, difficulty, client_ts: clientTs, phase: null },
      ]);

      // XP calculation
      const xpEarned = xpService.calculateXP({ durationSeconds, difficulty, phase, hasProofOfWork: proofOfWork.length > 0 });

      // Insert session
      const { rows: sessionRows } = await client.query(
        `INSERT INTO sessions
           (skill_id, user_id, topic, notes, duration_seconds, difficulty, phase, client_ts, xp_earned, content_hash, entry_hash, prev_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [skillId, req.user.id, topic, notes, durationSeconds, difficulty, phase, clientTs, xpEarned, contentHash, entryHash, prevHash]
      );
      const session = sessionRows[0];

      // Insert proof of work
      if (proofOfWork.length > 0) {
        const powValues = proofOfWork.map((p, i) =>
          `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
        ).join(',');
        const powParams = proofOfWork.flatMap(p => [
          session.id, p.type, p.name, p.path || null, p.repoName || null, p.fileType || null,
        ]);
        await client.query(
          `INSERT INTO proof_of_work (session_id, type, name, path, repo_name, file_type) VALUES ${powValues}`,
          powParams
        );
      }

      // Update skill aggregates
      const streakData = await streakService.calculate(client, req.user.id, skillId, clientTs);
      const newScore = xpService.calculateSkillScore({ ...skill, newSession: { durationSeconds, difficulty, phase } });

      await client.query(
        `UPDATE skills SET
           total_sessions = total_sessions + 1,
           total_hours = total_hours + $1,
           current_phase = $2,
           score = $3,
           current_streak = $4,
           longest_streak = GREATEST(longest_streak, $4),
           last_session_at = $5
         WHERE id = $6`,
        [durationSeconds / 3600, phase, newScore, streakData.current, clientTs, skillId]
      );

      // Update user XP
      await client.query('UPDATE users SET total_xp = total_xp + $1 WHERE id = $2', [xpEarned, req.user.id]);

      // AI score for writing skills (async, non-blocking)
      if (skill.category === 'writing' && process.env.OPENAI_API_KEY) {
        aiService.scoreWritingNotes(session.id, notes, topic).catch(console.error);
      }

      // Achievement checks (async)
      achievementService.check(client, req.user.id, skillId).catch(console.error);

      await client.query('COMMIT');

      success(res, { session: { ...session, proofOfWork } }, 'Session logged', 201);
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// GET /api/sessions/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT s.*, array_agg(
         json_build_object('id', p.id, 'type', p.type, 'name', p.name, 'path', p.path, 'repo_name', p.repo_name)
       ) FILTER (WHERE p.id IS NOT NULL) AS proof_of_work
       FROM sessions s
       LEFT JOIN proof_of_work p ON p.session_id = s.id
       WHERE s.id = $1 AND s.user_id = $2
       GROUP BY s.id`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) throw new NotFoundError('Session');
    success(res, { session: rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/sessions/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) throw new NotFoundError('Session');
    success(res, {}, 'Session deleted');
  } catch (err) { next(err); }
});

module.exports = router;
