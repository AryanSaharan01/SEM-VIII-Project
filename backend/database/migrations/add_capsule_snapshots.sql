-- Migration: Add snapshot columns to capsule_tokens
-- Run this against your database to add capsule history metadata

ALTER TABLE capsule_tokens
  ADD COLUMN IF NOT EXISTS total_sessions_snapshot INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_hours_snapshot    NUMERIC(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_snapshot          INTEGER DEFAULT 0;
