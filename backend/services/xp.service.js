/**
 * XP & Score Calculation Service
 *
 * Score Components (total 100):
 *  1. Consistency     (25pts) — streak + regularity
 *  2. Depth           (20pts) — session duration & note quality
 *  3. Progression     (20pts) — phase advancement + difficulty ramp
 *  4. Volume          (15pts) — total sessions & hours
 *  5. External Proof  (10pts) — GitHub files + uploads attached
 *  6. Peer Review     (5pts)  — AI score on writing (proxy)
 *  7. Diversity       (5pts)  — variety of topics / difficulty spread
 */

const DIFFICULTY_MULTIPLIER = { easy: 1, medium: 1.3, hard: 1.7, expert: 2.2 };
const PHASE_XP_BONUS = { Exposure: 1, Confusion: 1.1, Learning: 1.25, Integration: 1.4, Proficiency: 1.6 };

/**
 * XP earned per session
 */
const calculateXP = ({ durationSeconds, difficulty, phase, hasProofOfWork }) => {
  const baseXP = Math.floor(durationSeconds / 60); // 1 XP per minute
  const diffMult = DIFFICULTY_MULTIPLIER[difficulty] || 1;
  const phaseMult = PHASE_XP_BONUS[phase] || 1;
  const proofBonus = hasProofOfWork ? 1.15 : 1;
  return Math.round(baseXP * diffMult * phaseMult * proofBonus);
};

/**
 * Calculate overall skill score (0-100)
 */
const calculateSkillScore = (skill) => {
  const totalHours = skill.total_hours || 0;
  const totalSessions = skill.total_sessions || 0;
  const streak = skill.current_streak || 0;
  const phase = skill.current_phase || 'Exposure';

  const phaseScoreMap = { Exposure: 5, Confusion: 20, Learning: 45, Integration: 70, Proficiency: 90 };
  const baseScore = phaseScoreMap[phase] || 5;
  const streakBonus = Math.min(streak * 0.5, 8);
  const hoursBonus = Math.min(totalHours * 0.1, 5);

  return Math.min(Math.round(baseScore + streakBonus + hoursBonus), 100);
};

/**
 * Full score breakdown for ScoreBreakdown.jsx
 */
const getScoreBreakdown = (sessions, skill) => {
  if (!sessions || sessions.length === 0) {
    return {
      overall: 0,
      components: {
        consistency: { score: 0, max: 25, description: 'No sessions yet' },
        depth: { score: 0, max: 20, description: 'No sessions yet' },
        progression: { score: 0, max: 20, description: 'No sessions yet' },
        volume: { score: 0, max: 15, description: 'No sessions yet' },
        externalProof: { score: 0, max: 10, description: 'No proof attached' },
        peerReview: { score: 0, max: 5, description: 'No AI review yet' },
        diversity: { score: 0, max: 5, description: 'No sessions yet' },
      },
    };
  }

  const n = sessions.length;
  const totalHours = sessions.reduce((s, x) => s + x.duration_seconds / 3600, 0);
  const streak = skill.current_streak || 0;

  // 1. Consistency (25) — streak + session frequency
  const avgDaysBetween = n > 1
    ? (new Date(sessions[n-1].client_ts) - new Date(sessions[0].client_ts)) / ((n - 1) * 86400000)
    : 99;
  const freqScore = Math.min(Math.max(14 - avgDaysBetween, 0) / 14 * 15, 15);
  const streakScore = Math.min(streak * 1.5, 10);
  const consistency = Math.round(freqScore + streakScore);

  // 2. Depth (20) — avg duration + avg notes length
  const avgDuration = sessions.reduce((s, x) => s + x.duration_seconds, 0) / n;
  const avgNotesLen = sessions.reduce((s, x) => s + (x.notes?.length || 0), 0) / n;
  const durationScore = Math.min((avgDuration / 3600) * 10, 12); // up to 12 for 1h+ avg
  const notesScore = Math.min((avgNotesLen / 200) * 8, 8);
  const depth = Math.round(durationScore + notesScore);

  // 3. Progression (20) — phase score + difficulty ramp
  const phaseMap = { Exposure: 2, Confusion: 6, Learning: 12, Integration: 17, Proficiency: 20 };
  const progression = phaseMap[skill.current_phase] || 2;

  // 4. Volume (15)
  const sessionScore = Math.min(n / 50 * 10, 10);
  const hoursScore = Math.min(totalHours / 50 * 5, 5);
  const volume = Math.round(sessionScore + hoursScore);

  // 5. External Proof (10) — sessions with proof / total sessions
  const sessionsWithProof = sessions.filter(s => s.proof_of_work?.length > 0).length;
  const externalProof = Math.round((sessionsWithProof / n) * 10);

  // 6. Peer Review / AI Score (5)
  const aiScored = sessions.filter(s => s.ai_score?.overall).length;
  const avgAI = aiScored > 0
    ? sessions.filter(s => s.ai_score?.overall).reduce((s, x) => s + x.ai_score.overall, 0) / aiScored
    : 0;
  const peerReview = Math.round((avgAI / 100) * 5);

  // 7. Diversity (5) — unique topics / total sessions
  const uniqueTopics = new Set(sessions.map(s => s.topic.toLowerCase())).size;
  const diffSet = new Set(sessions.map(s => s.difficulty)).size;
  const diversity = Math.round(Math.min((uniqueTopics / n) * 3 + (diffSet / 4) * 2, 5));

  const overall = Math.min(consistency + depth + progression + volume + externalProof + peerReview + diversity, 100);

  return {
    overall,
    components: {
      consistency: { score: Math.min(consistency, 25), max: 25, description: `${streak}-day streak, sessions every ~${Math.round(avgDaysBetween)} days` },
      depth: { score: Math.min(depth, 20), max: 20, description: `Avg ${Math.round(avgDuration / 60)}min/session, avg ${Math.round(avgNotesLen)} chars/note` },
      progression: { score: Math.min(progression, 20), max: 20, description: `Currently in ${skill.current_phase} phase` },
      volume: { score: Math.min(volume, 15), max: 15, description: `${n} sessions, ${totalHours.toFixed(1)} hours total` },
      externalProof: { score: Math.min(externalProof, 10), max: 10, description: `${sessionsWithProof}/${n} sessions have proof attached` },
      peerReview: { score: Math.min(peerReview, 5), max: 5, description: aiScored > 0 ? `AI avg score: ${Math.round(avgAI)}/100` : 'No AI reviews yet' },
      diversity: { score: Math.min(diversity, 5), max: 5, description: `${uniqueTopics} unique topics, ${diffSet} difficulty levels` },
    },
    history: sessions.map((s, i) => ({
      session: i + 1,
      date: s.client_ts,
      score: Math.min(
        Math.round(((i + 1) / n) * overall * (0.5 + 0.5 * (PHASE_XP_MAP[s.phase] || 0.1))),
        100
      ),
    })),
  };
};

const PHASE_XP_MAP = { Exposure: 0.1, Confusion: 0.2, Learning: 0.5, Integration: 0.75, Proficiency: 1 };

module.exports = { calculateXP, calculateSkillScore, getScoreBreakdown };
