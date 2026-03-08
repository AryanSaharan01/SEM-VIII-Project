/**
 * AI Service — Writing Session Scoring
 *
 * Uses OpenAI to evaluate learning notes on 5 dimensions:
 *   1. Clarity        (0-20) — Is the writing clear and well-structured?
 *   2. Depth          (0-20) — Does the learner demonstrate genuine understanding?
 *   3. Vocabulary     (0-20) — Domain-specific terminology use
 *   4. Structure      (0-20) — Logical flow, headings, examples
 *   5. Reflection     (0-20) — Self-awareness, questions, next steps
 *
 * Overall = sum of 5 dimensions (0-100)
 *
 * Optimised: gpt-4o-mini with ~200 token prompt, JSON mode response.
 * Estimated cost per session: ~$0.0002 (very cheap)
 */

const OpenAI = require('openai');
const { query } = require('../config/db');

let openai;
const getClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

const SYSTEM_PROMPT = `You are an expert learning coach evaluating a learner's session notes.
Score the notes on 5 dimensions (each 0-20):
- clarity: Writing clarity and coherence
- depth: Depth of understanding demonstrated  
- vocabulary: Appropriate domain vocabulary usage
- structure: Logical organisation and flow
- reflection: Self-reflection, questions raised, next steps

Return ONLY valid JSON: {"clarity":N,"depth":N,"vocabulary":N,"structure":N,"reflection":N,"feedback":"1-2 sentence constructive feedback"}`;

const scoreWritingNotes = async (sessionId, notes, topic) => {
  const client = getClient();
  if (!client) return null;

  // Skip very short notes (not worth scoring)
  if (!notes || notes.trim().split(/\s+/).length < 15) return null;

  try {
    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Topic: ${topic}\n\nNotes:\n${notes.slice(0, 2000)}` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 250,
      temperature: 0.2,
    });

    const raw = JSON.parse(response.choices[0].message.content);

    // Clamp all values 0-20
    const scores = ['clarity', 'depth', 'vocabulary', 'structure', 'reflection'];
    const clamped = {};
    scores.forEach(k => { clamped[k] = Math.max(0, Math.min(20, Math.round(raw[k] || 0))); });
    const overall = scores.reduce((s, k) => s + clamped[k], 0);

    const result = { ...clamped, overall, feedback: raw.feedback || '' };

    await query('UPDATE sessions SET ai_score = $1 WHERE id = $2', [JSON.stringify(result), sessionId]);
    return result;
  } catch (err) {
    console.error('AI scoring error:', err.message);
    return null;
  }
};

/**
 * Batch score unscored writing sessions (cron/manual trigger)
 * GET /api/analytics/ai-batch (admin only, not exposed publicly)
 */
const batchScoreUnscored = async () => {
  const { rows } = await query(
    `SELECT s.id, s.notes, s.topic FROM sessions s
     JOIN skills sk ON sk.id = s.skill_id
     WHERE sk.category = 'writing' AND s.ai_score IS NULL
     ORDER BY s.created_at DESC LIMIT 50`
  );
  let scored = 0;
  for (const session of rows) {
    const result = await scoreWritingNotes(session.id, session.notes, session.topic);
    if (result) scored++;
    await new Promise(r => setTimeout(r, 200)); // rate limit
  }
  return scored;
};

module.exports = { scoreWritingNotes, batchScoreUnscored };
