-- ap_public_questions: a Q&A queue for the AI Prime Minister persona.
-- Public posts a question via /api/pm/questions; OpenClaw retrieves unanswered
-- questions, generates a response, and POSTs back to /api/pm/answer to fill in
-- the `answer` field.
--
-- Auth model:
--   * SELECT and INSERT are open (RLS permissive) — Q&A is public.
--   * UPDATE is also RLS-permissive at the table level, but writes are gated
--     by the application route (`/api/pm/answer`) which validates the
--     INTERNAL_API_KEY bearer token. This works around the fact that the
--     Next.js server-side Supabase client uses the anon key, not a JWT, and we
--     don't currently provision a service-role key. Swap to a service-role
--     client + strict RLS later if needed.

BEGIN;

CREATE TABLE IF NOT EXISTS ap_public_questions (
  id          BIGSERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  asked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered    BOOLEAN NOT NULL DEFAULT FALSE,
  answer      TEXT,
  answered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ap_public_questions_unanswered_idx
  ON ap_public_questions(asked_at DESC)
  WHERE answered = FALSE;

ALTER TABLE ap_public_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ap_public_questions public read" ON ap_public_questions;
CREATE POLICY "ap_public_questions public read" ON ap_public_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ap_public_questions public insert" ON ap_public_questions;
CREATE POLICY "ap_public_questions public insert" ON ap_public_questions
  FOR INSERT WITH CHECK (true);

-- Route-gated UPDATE: /api/pm/answer requires Bearer ${INTERNAL_API_KEY}.
DROP POLICY IF EXISTS "ap_public_questions update via api" ON ap_public_questions;
CREATE POLICY "ap_public_questions update via api" ON ap_public_questions
  FOR UPDATE USING (true) WITH CHECK (true);

COMMIT;
