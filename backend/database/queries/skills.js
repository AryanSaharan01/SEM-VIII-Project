const { query } = require('../../config/db');

const findByUser = (userId) =>
  query('SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

const findById = (id, userId) =>
  query('SELECT * FROM skills WHERE id = $1 AND user_id = $2', [id, userId]);

const updateStats = (skillId, { totalHours, phase, score, streak, lastSessionAt }) =>
  query(
    `UPDATE skills SET
       total_sessions = total_sessions + 1,
       total_hours = total_hours + $1,
       current_phase = $2,
       score = $3,
       current_streak = $4,
       longest_streak = GREATEST(longest_streak, $4),
       last_session_at = $5
     WHERE id = $6`,
    [totalHours, phase, score, streak, lastSessionAt, skillId]
  );

module.exports = { findByUser, findById, updateStats };
