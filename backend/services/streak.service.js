const { query } = require('../config/db');

/**
 * Calculate current and longest streak for a skill.
 * A "streak day" = any day with ≥1 session.
 */
const calculate = async (client, userId, skillId, newSessionTs) => {
  const db = client || require('../config/db');
  const { rows } = await db.query(
    `SELECT DISTINCT DATE(client_ts) AS day
     FROM sessions WHERE skill_id = $1 AND user_id = $2
     ORDER BY day DESC`,
    [skillId, userId]
  );

  const today = new Date(newSessionTs);
  today.setHours(0, 0, 0, 0);

  const days = rows.map(r => {
    const d = new Date(r.day);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  // Include today if not already counted
  if (!days.includes(today.getTime())) days.unshift(today.getTime());
  days.sort((a, b) => b - a);

  let current = 1;
  for (let i = 0; i < days.length - 1; i++) {
    if (days[i] - days[i + 1] === 86400000) {
      current++;
    } else {
      break;
    }
  }

  let longest = 1, temp = 1;
  const sorted = [...days].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === 86400000) {
      temp++;
      longest = Math.max(longest, temp);
    } else {
      temp = 1;
    }
  }

  return { current, longest };
};

module.exports = { calculate };
