const { query } = require('../../config/db');

const findBySkill = (skillId, userId, limit = 50, offset = 0) =>
  query(
    `SELECT * FROM sessions WHERE skill_id = $1 AND user_id = $2 ORDER BY client_ts DESC LIMIT $3 OFFSET $4`,
    [skillId, userId, limit, offset]
  );

const findLastHash = (skillId) =>
  query('SELECT entry_hash FROM sessions WHERE skill_id = $1 ORDER BY client_ts DESC LIMIT 1', [skillId]);

const findAllForChain = (skillId) =>
  query('SELECT id, content_hash, entry_hash, prev_hash, client_ts FROM sessions WHERE skill_id = $1 ORDER BY client_ts ASC', [skillId]);

module.exports = { findBySkill, findLastHash, findAllForChain };
