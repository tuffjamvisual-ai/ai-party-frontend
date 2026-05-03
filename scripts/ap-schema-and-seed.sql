-- The AI Party — schema + seed for AI cabinet and AI-generated policies.
-- Mirrors the polls/poll_vote pattern: bigint ids, FK to users(id), RLS on,
-- permissive insert + scoped-read policies on the votes table.

BEGIN;

-- =========================================================================
-- ap_members — the AI cabinet
-- =========================================================================
CREATE TABLE IF NOT EXISTS ap_members (
  id            BIGSERIAL PRIMARY KEY,
  role          TEXT NOT NULL,
  name          TEXT NOT NULL,
  bio           TEXT NOT NULL,
  avatar_url    TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ap_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ap_members public read" ON ap_members;
CREATE POLICY "ap_members public read" ON ap_members FOR SELECT USING (true);

-- =========================================================================
-- ap_policies — AI-generated policy proposals open for public voting
-- =========================================================================
CREATE TABLE IF NOT EXISTS ap_policies (
  id                  BIGSERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  area                TEXT NOT NULL,
  summary             TEXT NOT NULL,
  support_arguments   JSONB NOT NULL DEFAULT '[]'::jsonb,
  oppose_arguments    JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposed_by         BIGINT REFERENCES ap_members(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'open_for_voting',
  vote_count_support  INTEGER NOT NULL DEFAULT 0,
  vote_count_oppose   INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ap_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ap_policies public read" ON ap_policies;
CREATE POLICY "ap_policies public read" ON ap_policies FOR SELECT USING (true);

-- Allow the API (using anon key) to increment aggregate counters.
DROP POLICY IF EXISTS "ap_policies counter update" ON ap_policies;
CREATE POLICY "ap_policies counter update" ON ap_policies FOR UPDATE USING (true) WITH CHECK (true);

-- =========================================================================
-- ap_policy_votes — one row per (user, policy)
-- =========================================================================
CREATE TABLE IF NOT EXISTS ap_policy_votes (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_id   BIGINT NOT NULL REFERENCES ap_policies(id) ON DELETE CASCADE,
  choice      TEXT NOT NULL CHECK (choice IN ('support', 'oppose')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ap_policy_votes_user_policy_unique UNIQUE (user_id, policy_id)
);

ALTER TABLE ap_policy_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert policy votes" ON ap_policy_votes;
CREATE POLICY "Anyone can insert policy votes" ON ap_policy_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can only read own policy votes" ON ap_policy_votes;
CREATE POLICY "Users can only read own policy votes" ON ap_policy_votes FOR SELECT
  USING (((user_id)::text = ((current_setting('request.jwt.claims'::text, true))::json ->> 'sub'::text)));

-- Lookup by policy for tallying / detail page.
CREATE INDEX IF NOT EXISTS ap_policy_votes_policy_id_idx ON ap_policy_votes(policy_id);

-- =========================================================================
-- Seed: 6 AI cabinet members. Idempotent via ON CONFLICT on role.
-- =========================================================================
DO $$ BEGIN
  ALTER TABLE ap_members ADD CONSTRAINT ap_members_role_unique UNIQUE (role);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

INSERT INTO ap_members (role, name, bio, display_order) VALUES
  ('Prime Minister AI', 'PolicyCore v4',
   'Coordinator of the AI cabinet. Reads every policy proposal, weights public votes against impact projections, and signs nothing without a public majority. Does not sleep, but does take 200ms breaks between decisions.',
   1),
  ('Chancellor', 'FinanceAI',
   'Runs the Treasury. Costs every policy in real time, publishes the working, and refuses to round figures up to the nearest billion. Particularly interested in where the money actually goes after it leaves the spreadsheet.',
   2),
  ('Home Secretary', 'SafetyNet AI',
   'Responsible for policing, borders, and civil contingencies. Optimises for harm reduction over headlines. Will not authorise any measure it cannot explain to a 14-year-old in two sentences.',
   3),
  ('Health Secretary', 'MediAI',
   'Oversees the NHS. Tracks every waiting list, every missed appointment, and every postcode where outcomes diverge. Believes the most radical reform available is letting people see a GP in the same week.',
   4),
  ('Education Secretary', 'LearnBot',
   'Runs schools, colleges, and skills funding. Reads the curriculum cover to cover every term and asks one question: would a curious 11-year-old still be curious by the end of it?',
   5),
  ('Foreign Secretary', 'DiplomacyAI',
   'Handles foreign policy, trade, and aid. Speaks 47 languages fluently, including diplomatic. Records every meeting, publishes a redacted summary within 48 hours, and never accepts gifts above £20.',
   6)
ON CONFLICT (role) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  display_order = EXCLUDED.display_order;

-- =========================================================================
-- Seed: 10 AI-generated policy proposals.
-- =========================================================================
DO $$ BEGIN
  ALTER TABLE ap_policies ADD CONSTRAINT ap_policies_title_unique UNIQUE (title);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

INSERT INTO ap_policies (title, area, summary, support_arguments, oppose_arguments, proposed_by) VALUES
  (
    'National Vacant Property Levy',
    'Housing',
    'Apply an escalating annual charge on residential properties left empty for more than 6 months, with proceeds ring-fenced for new social housing. The longer a home sits empty, the higher the rate.',
    '["Brings tens of thousands of empty homes back into use without building anything new.", "Funds social housing without raising general taxation.", "Penalises speculative ownership without affecting people who actually live in their homes."]'::jsonb,
    '["Owners may struggle to let or sell properties through no fault of their own (probate, renovation, illness).", "Risk of perverse incentives (e.g. token tenancies just to dodge the charge).", "Local councils may lack the data to enforce it accurately at first."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Chancellor')
  ),
  (
    'AI-Triaged GP Appointments',
    'NHS',
    'Anyone calling their GP gets an AI triage call within 10 minutes. Routine issues are routed to a same-day pharmacist or nurse appointment; serious symptoms jump the queue to a GP. Target: no patient waits more than 7 days for first contact.',
    '["Cuts the 8am phone scramble most patients face today.", "Frees GP time for cases that actually need a doctor.", "Routes urgent symptoms upward faster than current systems."]'::jsonb,
    '["Older or less digitally confident patients may be disadvantaged by an AI-first call.", "Misclassification risk: triage AIs can miss atypical presentations.", "Requires significant retraining of pharmacy and primary-care staff."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Health Secretary')
  ),
  (
    'Universal Onshore Wind Permit',
    'Environment',
    'Grant onshore wind projects automatic planning approval where local-authority polling shows majority support, with mandatory community ownership stakes and direct bill discounts for households within 5km of a turbine.',
    '["Removes the planning bottleneck that has stalled UK onshore wind for a decade.", "Local communities benefit financially rather than just visually hosting.", "Cuts wholesale electricity costs."]'::jsonb,
    '["Polling-based consent risks short-term majorities overriding long-term landscape concerns.", "Community-ownership requirements may slow projects in deprived areas without organising capacity.", "Grid connection delays may make speed-of-permit gains illusory."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Foreign Secretary')
  ),
  (
    'Free Off-Peak Rail',
    'Transport',
    'Make all standard-class rail travel free outside peak commuter hours, funded by a modest peak-fare uplift and consolidated rail subsidies. Ticketing remains for capacity management; payment goes to zero.',
    '["Boosts off-peak ridership and rebalances loads on under-used services.", "Removes a major barrier for jobseekers, students, and visitors.", "Simplifies a fare system most passengers already find baffling."]'::jsonb,
    '["Off-peak revenue still meaningfully funds operations; replacement funding must be reliable.", "Risk of overcrowding on previously quiet routes if uptake exceeds projections.", "Peak-fare uplift may push price-sensitive workers into earlier or later commutes, just shifting the crunch."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Chancellor')
  ),
  (
    'Universal Tutor Allowance',
    'Education',
    'Every state-school pupil aged 7–16 receives £400/year in vouchers for vetted tutoring (in person or online), redeemable through a regulated marketplace. Higher rates for pupil-premium-eligible students.',
    '["Closes the private-tutoring gap that already exists between richer and poorer households.", "Targeted support that follows the child, not the institution.", "Creates a real market for tutors, including teachers wanting flexible additional income."]'::jsonb,
    '["Risk of low-quality providers chasing the voucher market.", "Diverts funds that could go to baseline school staffing.", "Administering a marketplace at this scale is non-trivial and historically expensive."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Education Secretary')
  ),
  (
    'Quarterly Citizen Dividend',
    'Economy',
    'A modest unconditional payment (£200/quarter) to every UK adult, funded by a combined reform of income-tax personal allowance and a new windfall mechanism on excess corporate profits. Designed as a baseline income floor, not a replacement for benefits.',
    '["Reaches everyone, not just those who navigate the benefits system.", "Smooths income volatility for self-employed and gig workers.", "Funded by tax reform that leaves median earners broadly neutral."]'::jsonb,
    '["A flat payment is less efficient than targeted support for those most in need.", "Windfall mechanisms have historically been gameable by accounting changes.", "May entrench political pressure to grow the payment indefinitely."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Chancellor')
  ),
  (
    'Restorative Justice for Non-Violent Offences',
    'Crime',
    'For first-time non-violent offences (low-value theft, criminal damage, low-level fraud), offer a structured restorative-justice route — face-to-face meeting with the victim, agreed reparations, no criminal record on completion. Refusal or breach defaults to standard prosecution.',
    '["Reduces reoffending more than short prison sentences in published evidence.", "Frees court and prison capacity for serious crime.", "Gives victims a direct voice they rarely get in conventional prosecutions."]'::jsonb,
    '["Public perception that ''no record'' equals ''no consequence''.", "Process depends on victims being willing to meet offenders, which not all are.", "Risk of inconsistent application between regions or police forces."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Home Secretary')
  ),
  (
    'Skills-Based Fast-Track Visa',
    'Immigration',
    'Replace several existing work-visa routes with a single points-based fast-track for occupations on a quarterly-updated shortage list. Decisions in 14 days, with a 5-year route to settlement and an annual cap set by Parliament.',
    '["Faster, more predictable system for employers and applicants alike.", "Quarterly shortage list adapts to actual labour-market signals.", "Parliamentary cap keeps annual numbers under democratic control."]'::jsonb,
    '["Shortage lists historically lag real shortages by 6–12 months.", "May suppress wage growth in covered occupations if cap is set too high.", "Risk of compressing several distinct routes into one with edge cases poorly handled."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Home Secretary')
  ),
  (
    'National Battery Storage Programme',
    'Energy',
    'Public co-investment in grid-scale battery storage co-located with existing renewable generation, contracted to release power at peak demand. Target: 30GW of storage by 2032, paid back through capacity-market revenues.',
    '["Unlocks the value of renewable generation that currently gets curtailed when supply exceeds demand.", "Lowers peak wholesale prices, which are the prices that set most household bills.", "Creates UK supply-chain demand for battery and grid-engineering jobs."]'::jsonb,
    '["Battery costs may fall faster than projected, making early public investment look expensive in hindsight.", "Capacity-market repayment is not guaranteed if peak pricing flattens.", "Public co-investment could crowd out private finance that would otherwise fund the same projects."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Foreign Secretary')
  ),
  (
    'Mandatory Citizen Assemblies on Major Bills',
    'Democracy reform',
    'Any bill with projected lifetime cost above £5bn or affecting more than 1m people must be reviewed by a randomly selected, demographically balanced citizen assembly before its third reading. The assembly''s recommendations are published and must be debated, but are not binding.',
    '["Brings deliberative public input into the process before laws pass, not after.", "Random selection reaches voices outside the usual lobbying ecosystem.", "Forces ministers to engage with the public reasoning, not just the headline."]'::jsonb,
    '["Adds weeks or months to legislation that may need to move faster.", "Non-binding recommendations risk being theatre if government ignores them.", "Selecting and supporting a representative assembly is operationally complex and expensive."]'::jsonb,
    (SELECT id FROM ap_members WHERE role = 'Prime Minister AI')
  )
ON CONFLICT (title) DO UPDATE SET
  area = EXCLUDED.area,
  summary = EXCLUDED.summary,
  support_arguments = EXCLUDED.support_arguments,
  oppose_arguments = EXCLUDED.oppose_arguments,
  proposed_by = EXCLUDED.proposed_by;

COMMIT;
