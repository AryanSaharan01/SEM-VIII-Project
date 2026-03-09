/**
 * Certificate Service
 *
 * Generates a shareable, verifiable digital certificate as:
 *  - A public URL (for LinkedIn "Add Credential" or sharing)
 *  - A PNG image card (for download / posting)
 *
 * The certificate embeds:
 *  - Learner name, skill name, score
 *  - Phase achieved, total hours, total sessions
 *  - Issue date, certificate ID
 *  - Verification URL
 *
 * LinkedIn OpenGraph meta tags are served at /capsule/certificate/:token
 * so when a user shares the URL, LinkedIn shows a rich card.
 */

const { query } = require('../config/db');
const { generateCapsuleToken } = require('../utils/wallet');
const { NotFoundError } = require('../utils/errors');

const generate = async (userId, skillId) => {
  // Check if cert already exists
  const existing = await query(
    'SELECT * FROM certificates WHERE user_id = $1 AND skill_id = $2',
    [userId, skillId]
  );
  if (existing.rows[0]) {
    return {
      certToken: existing.rows[0].cert_token,
      url: `${process.env.APP_URL}/certificate/${existing.rows[0].cert_token}`,
      imageUrl: existing.rows[0].image_url,
      issuedAt: existing.rows[0].issued_at,
    };
  }

  const { rows: skillRows } = await query(
    `SELECT sk.*, u.display_name, u.username, u.email
     FROM skills sk JOIN users u ON u.id = sk.user_id
     WHERE sk.id = $1 AND sk.user_id = $2`,
    [skillId, userId]
  );
  if (!skillRows[0]) throw new NotFoundError('Skill');
  const skill = skillRows[0];

  const certToken = generateCapsuleToken();
  const metadata = {
    issuer: process.env.CERT_ISSUER || 'DTCS Skill Ledger',
    skillName: skill.name,
    category: skill.category,
    score: skill.score,
    phase: skill.current_phase,
    totalHours: skill.total_hours,
    totalSessions: skill.total_sessions,
    learnerName: skill.display_name || skill.username || skill.email,
    issuedAt: new Date().toISOString(),
    verifyUrl: `${process.env.APP_URL}/certificate/${certToken}`,
  };

  // Generate certificate image URL
  // The actual PNG generation can use a headless browser (Puppeteer) or a
  // canvas-based approach. Here we return an OG-image URL that renders
  // the certificate via a server-side route.
  const imageUrl = `${process.env.API_URL}/api/capsule/certificate/${certToken}/image`;

  const { rows } = await query(
    `INSERT INTO certificates (skill_id, user_id, cert_token, image_url, metadata)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [skillId, userId, certToken, imageUrl, JSON.stringify(metadata)]
  );

  return {
    certToken,
    url: `${process.env.APP_URL}/certificate/${certToken}`,
    imageUrl,
    issuedAt: rows[0].issued_at,
    metadata,
    linkedInShareUrl: buildLinkedInShareUrl(metadata, `${process.env.APP_URL}/certificate/${certToken}`),
  };
};

/**
 * Build LinkedIn "Add to Profile" URL
 * Uses LinkedIn's certification schema
 */
const buildLinkedInShareUrl = (meta, certUrl) => {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: `${meta.skillName} — Verified Learning Journey`,
    organizationName: meta.issuer,
    issueYear: new Date(meta.issuedAt).getFullYear(),
    issueMonth: new Date(meta.issuedAt).getMonth() + 1,
    certUrl,
    certId: meta.verifyUrl,
  });
  return `https://www.linkedin.com/profile/add?${params}`;
};

module.exports = { generate };
