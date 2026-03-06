const { query } = require('../../config/db');

const findById = (id) =>
  query('SELECT * FROM users WHERE id = $1', [id]);

const findByEmail = (email) =>
  query('SELECT * FROM users WHERE email = $1', [email]);

const updateXP = (userId, xp) =>
  query('UPDATE users SET total_xp = total_xp + $1 WHERE id = $2', [xp, userId]);

module.exports = { findById, findByEmail, updateXP };
