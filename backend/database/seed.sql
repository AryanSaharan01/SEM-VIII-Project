INSERT INTO achievement_definitions (key, title, description, icon, xp_reward) VALUES
  ('first_session',     'First Step',          'Log your very first session',             '🎯', 50),
  ('streak_7',          'Week Warrior',        'Maintain a 7-day learning streak',        '🔥', 150),
  ('streak_30',         'Monthly Master',      '30-day learning streak',                  '💎', 500),
  ('sessions_10',       'Dedicated Learner',   'Log 10 sessions on a single skill',       '📚', 100),
  ('sessions_50',       'Skill Enthusiast',    'Log 50 total sessions',                   '⚡', 300),
  ('hours_10',          '10 Hour Club',        'Spend 10 hours on a skill',               '⏰', 200),
  ('hours_100',         'Century Club',        'Spend 100 hours on a skill',              '🏆', 1000),
  ('phase_integration', 'Deep Integrator',     'Reach the Integration phase',             '🧠', 250),
  ('phase_proficiency', 'Proficient',          'Reach the Proficiency phase',             '⭐', 500),
  ('first_proof',       'Show Your Work',      'Attach proof of work to a session',       '📎', 75),
  ('capsule_shared',    'Knowledge Sharer',    'Share your first skill capsule',          '🔗', 100),
  ('github_connected',  'Code Verified',       'Connect your GitHub account',             '🐙', 50),
  ('ai_scored',         'AI Reviewed',         'Get an AI score on a writing session',    '🤖', 100),
  ('score_80',          'High Achiever',       'Reach a skill score of 80+',              '🌟', 400),
  ('score_95',          'Elite',               'Reach a skill score of 95+',              '👑', 1000)
ON CONFLICT (key) DO NOTHING;
