const { query } = require('../config/db');

const CHECKS = [
  {
    key: 'first_session',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT COUNT(*) FROM sessions WHERE user_id = $1', [userId]);
      return parseInt(rows[0].count) >= 1;
    },
  },
  {
    key: 'streak_7',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(current_streak) FROM skills WHERE user_id = $1', [userId]);
      return parseInt(rows[0].max) >= 7;
    },
  },
  {
    key: 'streak_30',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(current_streak) FROM skills WHERE user_id = $1', [userId]);
      return parseInt(rows[0].max) >= 30;
    },
  },
  {
    key: 'sessions_10',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(total_sessions) FROM skills WHERE user_id = $1', [userId]);
      return parseInt(rows[0].max) >= 10;
    },
  },
  {
    key: 'sessions_50',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT COUNT(*) FROM sessions WHERE user_id = $1', [userId]);
      return parseInt(rows[0].count) >= 50;
    },
  },
  {
    key: 'hours_10',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(total_hours) FROM skills WHERE user_id = $1', [userId]);
      return parseFloat(rows[0].max) >= 10;
    },
  },
  {
    key: 'hours_100',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(total_hours) FROM skills WHERE user_id = $1', [userId]);
      return parseFloat(rows[0].max) >= 100;
    },
  },
  {
    key: 'phase_integration',
    check: async (client, userId) => {
      const { rows } = await client.query(
        "SELECT COUNT(*) FROM skills WHERE user_id = $1 AND current_phase IN ('Integration','Proficiency')",
        [userId]
      );
      return parseInt(rows[0].count) >= 1;
    },
  },
  {
    key: 'phase_proficiency',
    check: async (client, userId) => {
      const { rows } = await client.query(
        "SELECT COUNT(*) FROM skills WHERE user_id = $1 AND current_phase = 'Proficiency'",
        [userId]
      );
      return parseInt(rows[0].count) >= 1;
    },
  },
  {
    key: 'first_proof',
    check: async (client, userId) => {
      const { rows } = await client.query(
        'SELECT COUNT(*) FROM proof_of_work p JOIN sessions s ON s.id = p.session_id WHERE s.user_id = $1',
        [userId]
      );
      return parseInt(rows[0].count) >= 1;
    },
  },
  {
    key: 'github_connected',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT 1 FROM github_connections WHERE user_id = $1', [userId]);
      return rows.length > 0;
    },
  },
  {
    key: 'score_80',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(score) FROM skills WHERE user_id = $1', [userId]);
      return parseInt(rows[0].max) >= 80;
    },
  },
  {
    key: 'score_95',
    check: async (client, userId) => {
      const { rows } = await client.query('SELECT MAX(score) FROM skills WHERE user_id = $1', [userId]);
      return parseInt(rows[0].max) >= 95;
    },
  },
];

const check = async (client, userId) => {
  try {
    const { rows: earned } = await client.query(
      'SELECT achievement_key FROM user_achievements WHERE user_id = $1',
      [userId]
    );
    const earnedSet = new Set(earned.map(r => r.achievement_key));

    for (const achievement of CHECKS) {
      if (earnedSet.has(achievement.key)) continue;
      const met = await achievement.check(client, userId);
      if (met) {
        await client.query(
          'INSERT INTO user_achievements (user_id, achievement_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, achievement.key]
        );
        // Award XP
        const { rows: def } = await client.query(
          'SELECT xp_reward FROM achievement_definitions WHERE key = $1',
          [achievement.key]
        );
        if (def[0]?.xp_reward) {
          await client.query(
            'UPDATE users SET total_xp = total_xp + $1 WHERE id = $2',
            [def[0].xp_reward, userId]
          );
        }
      }
    }
  } catch (err) {
    console.error('Achievement check error:', err.message);
  }
};

module.exports = { check };
