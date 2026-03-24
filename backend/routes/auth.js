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
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // needed for some Gmail/SMTP setups
  },
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

      // Check if user already exists
      const { rows: existingUsers } = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      const isNewUser = existingUsers.length === 0;

      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || '10') * 60 * 1000);

      // Invalidate previous OTPs for this email
      await query('UPDATE otp_store SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);

      await query(
        'INSERT INTO otp_store (email, otp_hash, expires_at) VALUES ($1, $2, $3)',
        [email, otpHash, expiresAt]
      );

      const subject = isNewUser
        ? '🎉 Verify your DTCS Skill Ledger account'
        : '🔐 Your DTCS Skill Ledger login code';

      const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
              ⚡ DTCS Skill Ledger
            </div>
            <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:6px;">
              Your Personal Learning Proof System
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1e293b;">
              ${isNewUser ? '👋 Welcome aboard!' : 'Hello again!'}
            </h2>
            <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
              ${isNewUser
                ? 'You\'re one step away from building your verified skill portfolio. Use the code below to confirm your email address and create your account.'
                : 'Use the code below to securely log in to your DTCS Skill Ledger account. This code is valid for a single use only.'}
            </p>

            <!-- OTP Box -->
            <div style="background:#f8faff;border:2px dashed #6366f1;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
              <div style="font-size:13px;font-weight:600;color:#6366f1;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                ${isNewUser ? 'Verification Code' : 'Login Code'}
              </div>
              <div style="font-size:48px;font-weight:900;letter-spacing:18px;color:#1e293b;font-variant-numeric:tabular-nums;">
                ${otp}
              </div>
              <div style="font-size:13px;color:#94a3b8;margin-top:12px;">
                ⏱ Expires in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>
              </div>
            </div>

            <!-- Warning -->
            <div style="background:#fef9ec;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 16px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                <strong>🔒 Security Notice:</strong> Never share this code with anyone. DTCS will never ask for your OTP via phone, chat, or email.
              </p>
            </div>

            <p style="margin:0;font-size:14px;color:#94a3b8;">
              If you didn't request this code, you can safely ignore this email. No account action will be taken.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8faff;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;">
              Sent by <strong style="color:#6366f1;">DTCS Skill Ledger</strong> · Building verifiable learning journeys
            </p>
            <p style="margin:0;font-size:12px;color:#cbd5e1;">
              © ${new Date().getFullYear()} DTCS. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject,
        html: emailHtml,
      });

      success(res, { email, isNewUser }, isNewUser ? 'OTP sent. Complete your signup.' : 'OTP sent successfully');
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
    body('name').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters'),
  ]),
  async (req, res, next) => {
    try {
      const { email, otp, name } = req.body;

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

      // Check if user already exists
      const { rows: existingUsers } = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      const isNewUser = existingUsers.length === 0;

      let user;
      if (isNewUser) {
        // New user: require a name; insert with display_name
        const displayName = name ? name.trim() : null;
        const { rows: userRows } = await query(
          `INSERT INTO users (email, display_name)
           VALUES ($1, $2)
           RETURNING id, email, username, display_name, avatar_url, total_xp`,
          [email, displayName]
        );
        user = userRows[0];
      } else {
        // Existing user: just update timestamp
        const { rows: userRows } = await query(
          `UPDATE users SET updated_at = NOW()
           WHERE email = $1
           RETURNING id, email, username, display_name, avatar_url, total_xp`,
          [email]
        );
        user = userRows[0];
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      success(res, { token, user, isNewUser }, isNewUser ? 'Account created successfully' : 'Login successful');
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
// Expects ?token=<jwt> so we can identify the user in the callback (browser redirect carries no auth header)
router.get('/github', (req, res) => {
  const jwtToken = req.query.token || '';
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'read:user user:email repo',
    state: jwtToken, // carry JWT through OAuth round-trip
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GET /api/auth/github/callback
// GitHub redirects here; state = our JWT token
router.get('/github/callback', async (req, res, next) => {
  try {
    const { code, state: jwtToken } = req.query;
    if (!code) throw new ValidationError('No code from GitHub');
    if (!jwtToken) throw new ValidationError('Missing state token');

    // Verify the JWT from state
    let payload;
    try {
      payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    } catch {
      throw new ValidationError('Invalid or expired session token. Please log in again.');
    }

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

    if (!tokenData.access_token) throw new ValidationError('GitHub auth failed — no access token returned');

    const { data: ghUser } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    await query(
      `INSERT INTO github_connections (user_id, github_id, github_login, access_token)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET
         github_login = $3, access_token = $4, updated_at = NOW()`,
      [payload.userId, String(ghUser.id), ghUser.login, tokenData.access_token]
    );

    await query(
      'UPDATE users SET github_id = $1, github_login = $2, avatar_url = $3 WHERE id = $4',
      [String(ghUser.id), ghUser.login, ghUser.avatar_url, payload.userId]
    );

    res.redirect(`${process.env.APP_URL}/dashboard?github=connected`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
