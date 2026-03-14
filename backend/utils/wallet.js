const crypto = require('crypto');

/**
 * Compute SHA-256 of a string
 */
const sha256 = (data) =>
  crypto.createHash('sha256').update(data).digest('hex');

/**
 * Build content hash for a session (deterministic)
 * Inputs: skillId, userId, topic, notes, durationSeconds, clientTs
 */
const buildContentHash = ({ skillId, userId, topic, notes, durationSeconds, clientTs }) =>
  sha256(JSON.stringify({ skillId, userId, topic, notes, durationSeconds, clientTs }));

/**
 * Build chain entry hash: SHA-256(contentHash + prevHash)
 * This links each session to the previous one — the hashing chain.
 */
const buildEntryHash = (contentHash, prevHash) =>
  sha256(contentHash + prevHash);

/**
 * Verify a chain: walk sessions in order and validate each entryHash
 */
const verifyChain = (sessions) => {
  const sorted = [...sessions].sort((a, b) => new Date(a.client_ts) - new Date(b.client_ts));
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    const prev = i === 0
      ? '0000000000000000000000000000000000000000000000000000000000000000'
      : sorted[i - 1].entry_hash;
    const expected = buildEntryHash(s.content_hash, prev);
    if (expected !== s.entry_hash) return { valid: false, brokenAt: s.id };
  }
  return { valid: true };
};

/**
 * Generate a secure random capsule token
 */
const generateCapsuleToken = () =>
  crypto.randomBytes(32).toString('hex');

/**
 * Generate a secure OTP (6 digits)
 */
const generateOTP = () =>
  String(crypto.randomInt(100000, 999999));

module.exports = {
  sha256,
  buildContentHash,
  buildEntryHash,
  verifyChain,
  generateCapsuleToken,
  generateOTP,
};
