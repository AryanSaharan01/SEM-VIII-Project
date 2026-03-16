-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE,
  display_name  TEXT,
  avatar_url    TEXT,
  github_id     TEXT UNIQUE,
  github_login  TEXT,
  github_token  TEXT,                    -- encrypted at rest ideally
  bio           TEXT,
  total_xp      INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── OTP STORE ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_store (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL,
  otp_hash    TEXT NOT NULL,            -- bcrypt hash of the OTP
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_store(email);

-- ─── SKILLS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('coding', 'writing', 'design', 'music', 'fitness', 'other')),
  linked_repo_id  TEXT,                  -- GitHub repo full_name e.g. "user/repo"
  linked_repo_name TEXT,
  score           INTEGER DEFAULT 0,
  total_sessions  INTEGER DEFAULT 0,
  total_hours     NUMERIC(8,2) DEFAULT 0,
  current_phase   TEXT DEFAULT 'Exposure',
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(user_id);

-- ─── SESSIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id         UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic            TEXT NOT NULL,
  notes            TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  difficulty       TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard','expert')),
  phase            TEXT NOT NULL DEFAULT 'Exposure',
  client_ts        TIMESTAMPTZ NOT NULL,            -- client-reported timestamp
  xp_earned        INTEGER DEFAULT 0,
  -- Hashing chain
  content_hash     TEXT NOT NULL,                   -- SHA-256 of session content
  entry_hash       TEXT NOT NULL,                   -- SHA-256 of content + prev_hash (chain link)
  prev_hash        TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
  -- AI scoring (writing)
  ai_score         JSONB,                           -- { overall, clarity, depth, structure, vocabulary, feedback }
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_skill ON sessions(skill_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user  ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ts    ON sessions(client_ts);

-- ─── PROOF OF WORK ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proof_of_work (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('github', 'upload')),
  name         TEXT NOT NULL,
  path         TEXT,                               -- for github type
  repo_name    TEXT,                               -- for github type
  file_type    TEXT,                               -- mime type for upload
  file_url     TEXT,                               -- stored URL for upload
  file_hash    TEXT,                               -- SHA-256 of file content
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pow_session ON proof_of_work(session_id);

-- ─── CAPSULE TOKENS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS capsule_tokens (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id     UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token        TEXT UNIQUE NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  view_count   INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  total_sessions_snapshot INTEGER DEFAULT 0,   -- sessions at time of generation
  total_hours_snapshot    NUMERIC(8,2) DEFAULT 0,
  score_snapshot          INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_capsule_token ON capsule_tokens(token);

-- ─── CERTIFICATES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id     UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cert_token   TEXT UNIQUE NOT NULL,
  image_url    TEXT,                               -- generated PNG/SVG URL
  issued_at    TIMESTAMPTZ DEFAULT NOW(),
  metadata     JSONB
);

-- ─── ACHIEVEMENTS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievement_definitions (
  id          SERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  xp_reward   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL REFERENCES achievement_definitions(key),
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- ─── GITHUB CONNECTIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_connections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  github_id     TEXT NOT NULL,
  github_login  TEXT NOT NULL,
  access_token  TEXT NOT NULL,
  repos         JSONB DEFAULT '[]',               -- cached repo list
  selected_repos JSONB DEFAULT '[]',              -- user-selected repos for skills
  connected_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_skills_updated_at   BEFORE UPDATE ON skills   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
