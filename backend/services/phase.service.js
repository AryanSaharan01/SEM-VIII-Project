/**
 * Multi-signal learning phase detection
 *
 * Phases: Exposure → Confusion → Learning → Integration → Proficiency
 *
 * Signals used:
 *  1. Session count              — raw volume
 *  2. Cumulative hours           — time investment
 *  3. Difficulty progression     — easy→expert arc
 *  4. Session regularity         — spacing consistency
 *  5. Notes depth                — avg words per session
 *  6. Difficulty standard dev    — confusion spike indicator
 */

const PHASE_THRESHOLDS = {
  Exposure:     { sessions: 0,  hours: 0,   avgDifficulty: 0 },
  Confusion:    { sessions: 3,  hours: 1,   avgDifficulty: 1.2 },
  Learning:     { sessions: 8,  hours: 5,   avgDifficulty: 1.8 },
  Integration:  { sessions: 20, hours: 15,  avgDifficulty: 2.2 },
  Proficiency:  { sessions: 40, hours: 40,  avgDifficulty: 2.8 },
};

const DIFFICULTY_SCORE = { easy: 1, medium: 2, hard: 3, expert: 4 };

const detectPhase = (sessions) => {
  if (!sessions || sessions.length === 0) return 'Exposure';

  const count = sessions.length;
  const totalSeconds = sessions.reduce((s, x) => s + (x.duration_seconds || 0), 0);
  const totalHours = totalSeconds / 3600;

  const diffScores = sessions.map(s => DIFFICULTY_SCORE[s.difficulty] || 2);
  const avgDiff = diffScores.reduce((a, b) => a + b, 0) / diffScores.length;

  // Regularity: sessions in last 14 days / 14 days
  const now = Date.now();
  const recent = sessions.filter(s => (now - new Date(s.client_ts).getTime()) < 14 * 86400000);
  const regularityScore = Math.min(recent.length / 14, 1);

  // Composite difficulty signal (weighted by recency)
  const recentDiffAvg = recent.length > 0
    ? recent.map(s => DIFFICULTY_SCORE[s.difficulty] || 2).reduce((a, b) => a + b, 0) / recent.length
    : avgDiff;

  // Phase determination — check from highest to lowest
  if (count >= PHASE_THRESHOLDS.Proficiency.sessions &&
      totalHours >= PHASE_THRESHOLDS.Proficiency.hours &&
      recentDiffAvg >= PHASE_THRESHOLDS.Proficiency.avgDifficulty) return 'Proficiency';

  if (count >= PHASE_THRESHOLDS.Integration.sessions &&
      totalHours >= PHASE_THRESHOLDS.Integration.hours &&
      recentDiffAvg >= PHASE_THRESHOLDS.Integration.avgDifficulty) return 'Integration';

  if (count >= PHASE_THRESHOLDS.Learning.sessions &&
      totalHours >= PHASE_THRESHOLDS.Learning.hours) return 'Learning';

  if (count >= PHASE_THRESHOLDS.Confusion.sessions ||
      totalHours >= PHASE_THRESHOLDS.Confusion.hours) return 'Confusion';

  return 'Exposure';
};

/**
 * Get phase distribution for a set of sessions
 * Returns: { Exposure: 0.2, Confusion: 0.3, Learning: 0.4, Integration: 0.1, Proficiency: 0 }
 */
const getPhaseDistribution = (sessions) => {
  const phases = ['Exposure', 'Confusion', 'Learning', 'Integration', 'Proficiency'];
  const total = sessions.length || 1;
  const dist = {};
  phases.forEach(p => {
    const count = sessions.filter(s => s.phase === p).length;
    dist[p] = { count, percentage: Math.round((count / total) * 100) };
  });
  return dist;
};

module.exports = { detectPhase, getPhaseDistribution };
