const router = require('express').Router();
const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { generateCapsuleToken, verifyChain } = require('../utils/wallet');
const { NotFoundError, AppError } = require('../utils/errors');
const certificateService = require('../services/certificate.service');

const EXPIRY_DAYS = parseInt(process.env.CAPSULE_TOKEN_EXPIRY_DAYS || '30');

// POST /api/capsule/generate — generate share token for a skill
router.post('/generate', authenticate, async (req, res, next) => {
  try {
    const { skillId } = req.body;
    if (!skillId) throw new AppError('skillId required', 400);

    const { rows: skillRows } = await query(
      'SELECT * FROM skills WHERE id = $1 AND user_id = $2',
      [skillId, req.user.id]
    );
    if (!skillRows[0]) throw new NotFoundError('Skill');

    const token = generateCapsuleToken();
    const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const { rows } = await query(
      `INSERT INTO capsule_tokens (skill_id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [skillId, req.user.id, token, expiresAt]
    );

    success(res, {
      token,
      url: `${process.env.APP_URL}/capsule/${token}`,
      expiresAt: rows[0].expires_at,
    });
  } catch (err) { next(err); }
});

// GET /api/capsule/:token — public endpoint, view capsule
router.get('/:token', optionalAuth, async (req, res, next) => {
  try {
    const { rows: tokenRows } = await query(
      `SELECT ct.*, sk.name AS skill_name, sk.category, sk.score, sk.current_phase,
              sk.total_sessions, sk.total_hours, sk.created_at AS skill_created_at,
              u.username, u.display_name, u.avatar_url
       FROM capsule_tokens ct
       JOIN skills sk ON sk.id = ct.skill_id
       JOIN users u ON u.id = ct.user_id
       WHERE ct.token = $1 AND ct.is_active = TRUE AND ct.expires_at > NOW()`,
      [req.params.token]
    );

    if (!tokenRows[0]) throw new NotFoundError('Capsule (expired or invalid)');
    const cap = tokenRows[0];

    // Fetch sessions for this skill
    const { rows: sessions } = await query(
      `SELECT s.id, s.topic, s.notes, s.duration_seconds, s.difficulty, s.phase,
              s.client_ts, s.xp_earned, s.content_hash, s.entry_hash, s.prev_hash,
              s.ai_score,
              array_agg(
                json_build_object('type', p.type, 'name', p.name, 'path', p.path, 'repo_name', p.repo_name)
              ) FILTER (WHERE p.id IS NOT NULL) AS proof_of_work
       FROM sessions s
       LEFT JOIN proof_of_work p ON p.session_id = s.id
       WHERE s.skill_id = $1
       GROUP BY s.id
       ORDER BY s.client_ts ASC`,
      [cap.skill_id]
    );

    // Verify chain integrity
    const chainVerification = verifyChain(sessions);

    // Increment view count
    await query('UPDATE capsule_tokens SET view_count = view_count + 1 WHERE token = $1', [req.params.token]);

    // Phase distribution
    const phases = ['Exposure', 'Confusion', 'Learning', 'Integration', 'Proficiency'];
    const phaseDistribution = phases.map(p => ({
      phase: p,
      count: sessions.filter(s => s.phase === p).length,
      percentage: sessions.length > 0
        ? Math.round((sessions.filter(s => s.phase === p).length / sessions.length) * 100)
        : 0,
    }));

    success(res, {
      capsule: {
        skill: {
          name: cap.skill_name,
          category: cap.category,
          score: cap.score,
          currentPhase: cap.current_phase,
          totalSessions: cap.total_sessions,
          totalHours: cap.total_hours,
          createdAt: cap.skill_created_at,
        },
        owner: { username: cap.username, displayName: cap.display_name, avatarUrl: cap.avatar_url },
        sessions,
        phaseDistribution,
        chainVerification,
        metadata: {
          exportedAt: new Date().toISOString(),
          expiresAt: cap.expires_at,
          viewCount: cap.view_count + 1,
        },
      },
    });
  } catch (err) { next(err); }
});

// POST /api/capsule/certificate — generate LinkedIn-shareable certificate
router.post('/certificate', authenticate, async (req, res, next) => {
  try {
    const { skillId } = req.body;
    if (!skillId) throw new AppError('skillId required', 400);

    const cert = await certificateService.generate(req.user.id, skillId);
    success(res, cert);
  } catch (err) { next(err); }
});

// GET /api/capsule/certificate/:certToken — public cert view
router.get('/certificate/:certToken', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.*, u.display_name, u.username, sk.name AS skill_name, sk.score, sk.category
       FROM certificates c
       JOIN users u ON u.id = c.user_id
       JOIN skills sk ON sk.id = c.skill_id
       WHERE c.cert_token = $1`,
      [req.params.certToken]
    );
    if (!rows[0]) throw new NotFoundError('Certificate');
    success(res, { certificate: rows[0] });
  } catch (err) { next(err); }
});

module.exports = router;
