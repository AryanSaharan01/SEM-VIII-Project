-- Migration: Add selected_repos column to github_connections
-- This column stores the user's explicitly selected repositories (as JSONB array)
-- The backend queries this column but it was missing from the original schema.

ALTER TABLE github_connections
ADD COLUMN IF NOT EXISTS selected_repos JSONB DEFAULT '[]';
