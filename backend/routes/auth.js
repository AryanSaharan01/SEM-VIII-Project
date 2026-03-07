const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { generateOTP } = require('../utils/wallet');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { ValidationError, NotFoundError } = require('../utils/errors');

// Strict rate limit for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Try again in 15 minutes.' },
});

// ─── SMTP Transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// POST /api/auth/send-otp
router.post('/send-otp',
  otpLimiter,
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ]),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000);

      // Invalidate previous OTPs for this email
      await query('UPDATE otp_store SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);

      await query(
        'INSERT INTO otp_store (email, otp_hash, expires_at) VALUES ($1, $2, $3)',
        [email, otpHash, expiresAt]
      );

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Your DTCS Login Code',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#1a1a1a;margin-bottom:8px;">🛡️ DTCS Skill Ledger</h2>
            <p style="color:#555;margin-bottom:24px;">Your one-time login code:</p>
            <div style="font-size:40px;font-weight:800;letter-spacing:16px;color:#6366f1;text-align:center;padding:24px 0;">${otp}</div>
            <p style="color:#888;font-size:13px;text-align:center;">Expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share this code.</p>
          </div>
        `,
      });

      success(res, { email }, 'OTP sent successfully');
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/verify-otp
router.post('/verify-otp',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  ]),
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      const { rows } = await query(
        `SELECT * FROM otp_store
         WHERE email = $1 AND used = FALSE AND expires_at > NOW()
         ORDER BY created_at DESC LIMIT 1`,
        [email]
      );

      if (!rows[0]) throw new ValidationError('OTP expired or invalid. Please request a new one.');

      const valid = await bcrypt.compare(otp, rows[0].otp_hash);
      if (!valid) throw new ValidationError('Incorrect OTP');

      // Mark OTP as used
      await query('UPDATE otp_store SET used = TRUE WHERE id = $1', [rows[0].id]);

      // Upsert user
      const { rows: userRows } = await query(
        `INSERT INTO users (email) VALUES ($1)
         ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
         RETURNING id, email, username, display_name, avatar_url, total_xp`,
        [email]
      );
      const user = userRows[0];

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      success(res, { token, user }, 'Login successful');
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me  — verify token, return current user
router.get('/me', authenticate, (req, res) => {
  success(res, { user: req.user });
});

// GET /api/auth/github — start GitHub OAuth
router.get('/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'read:user user:email public_repo',
    state: req.query.state || 'dtcs',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GET /api/auth/github/callback
router.get('/github/callback', authenticate, async (req, res, next) => {
  try {
    const { code } = req.query;
    const axios = require('axios');

    const { data: tokenData } = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      { headers: { Accept: 'application/json' } }
    );

    if (!tokenData.access_token) throw new ValidationError('GitHub auth failed');

    const { data: ghUser } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    await query(
      `INSERT INTO github_connections (user_id, github_id, github_login, access_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         github_login = $3, access_token = $4, updated_at = NOW()`,
      [req.user.id, String(ghUser.id), ghUser.login, tokenData.access_token]
    );

    await query(
      'UPDATE users SET github_id = $1, github_login = $2, avatar_url = $3 WHERE id = $4',
      [String(ghUser.id), ghUser.login, ghUser.avatar_url, req.user.id]
    );

    res.redirect(`${process.env.APP_URL}/dashboard?github=connected`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
