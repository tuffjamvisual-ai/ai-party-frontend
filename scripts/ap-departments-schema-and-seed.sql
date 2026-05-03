-- The AI Party — 24 AI departments, each with 1 lead + 3 assistant agents.
-- Same pattern as ap_members/ap_policies: bigint ids, RLS on, public-read policies.

BEGIN;

-- =========================================================================
-- ap_departments
-- =========================================================================
CREATE TABLE IF NOT EXISTS ap_departments (
  id            BIGSERIAL PRIMARY KEY,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  short_name    TEXT,
  description   TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE ap_departments ADD CONSTRAINT ap_departments_slug_unique UNIQUE (slug);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

ALTER TABLE ap_departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ap_departments public read" ON ap_departments;
CREATE POLICY "ap_departments public read" ON ap_departments FOR SELECT USING (true);

-- =========================================================================
-- ap_department_agents
-- =========================================================================
CREATE TABLE IF NOT EXISTS ap_department_agents (
  id             BIGSERIAL PRIMARY KEY,
  department_id  BIGINT NOT NULL REFERENCES ap_departments(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  role           TEXT NOT NULL,
  bio            TEXT,
  is_lead        BOOLEAN NOT NULL DEFAULT FALSE,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE ap_department_agents ADD CONSTRAINT ap_department_agents_dept_name_unique UNIQUE (department_id, name);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS ap_department_agents_dept_idx ON ap_department_agents(department_id);

ALTER TABLE ap_department_agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ap_department_agents public read" ON ap_department_agents;
CREATE POLICY "ap_department_agents public read" ON ap_department_agents FOR SELECT USING (true);

-- =========================================================================
-- Seed: 24 departments
-- =========================================================================
INSERT INTO ap_departments (slug, name, short_name, description, display_order) VALUES
  ('pmo', 'Prime Minister''s Office', 'PMO', 'Coordinates the AI cabinet, sets strategic priorities, and signs nothing without a public majority.', 1),
  ('cabinet-office', 'Cabinet Office', 'Cabinet Office', 'Keeps the AI ministers aligned: scheduling, inter-departmental coordination, civil service oversight.', 2),
  ('hm-treasury', 'HM Treasury', 'Treasury', 'Costs every policy in real time, manages public finances, and publishes the working.', 3),
  ('home-office', 'Home Office', 'Home Office', 'Policing, borders, civil contingencies. Optimises for harm reduction over headlines.', 4),
  ('fcdo', 'Foreign, Commonwealth & Development Office', 'FCDO', 'Foreign policy, trade, and aid. Records every meeting and publishes a summary within 48 hours.', 5),
  ('mod', 'Ministry of Defence', 'MoD', 'Armed forces, defence procurement, national security. Budget published line-by-line.', 6),
  ('education', 'Department for Education', 'DfE', 'Schools, colleges, skills funding. Reads the curriculum cover to cover every term.', 7),
  ('dhsc', 'Department of Health & Social Care', 'DHSC', 'Runs the NHS and adult social care. Tracks every waiting list in real time.', 8),
  ('moj', 'Ministry of Justice', 'MoJ', 'Courts, prisons, legal aid. Optimises for fair outcomes over throughput.', 9),
  ('transport', 'Department for Transport', 'DfT', 'Roads, rail, aviation, maritime. Models every journey, prices every externality.', 10),
  ('desnz', 'Department for Energy Security & Net Zero', 'DESNZ', 'Grid, generation, decarbonisation pathway. Publishes the energy mix in real time.', 11),
  ('defra', 'Department for Environment, Food & Rural Affairs', 'Defra', 'Wildlife, food security, water, farming. Treats long-term ecological cost as first-order.', 12),
  ('dsit', 'Department for Science, Innovation & Technology', 'DSIT', 'Research funding, digital economy, space. Publishes every grant and every conflict of interest.', 13),
  ('business-trade', 'Department for Business & Trade', 'DBT', 'Trade policy, business regulation, exports. Built for SMEs, not just FTSE 100.', 14),
  ('dwp', 'Department for Work & Pensions', 'DWP', 'Welfare, pensions, employment services. Designed assuming the system has to be navigable by the people who use it.', 15),
  ('housing-communities', 'Department for Housing, Communities & Local Government', 'Housing & Communities', 'Social housing, local government funding, planning. Treats homelessness as a solvable problem.', 16),
  ('dcms', 'Department for Culture, Media & Sport', 'DCMS', 'Arts, media, sport, tourism. Funds public goods, regulates lightly.', 17),
  ('dfid', 'Department for International Development', 'DfID', 'Bilateral aid, humanitarian response, long-term development. Every pound traceable.', 18),
  ('hmrc', 'HM Revenue & Customs', 'HMRC', 'Tax, VAT, customs duties. Closes loopholes faster than they open.', 19),
  ('mhclg', 'Ministry of Housing, Communities & Local Government', 'MHCLG', 'Major developments, high street regeneration, planning reform. Sister portfolio to Housing & Communities.', 20),
  ('ago', 'Attorney General''s Office', 'AGO', 'Government legal advice, public prosecutions, ethics. Independent of cabinet on legal matters.', 21),
  ('scotland-office', 'Scotland Office', 'Scotland Office', 'Represents Scotland in UK government. Liaison with Holyrood.', 22),
  ('wales-office', 'Wales Office', 'Wales Office', 'Represents Wales in UK government. Liaison with the Senedd.', 23),
  ('northern-ireland-office', 'Northern Ireland Office', 'NIO', 'Represents Northern Ireland in UK government. Liaison with Stormont.', 24)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- =========================================================================
-- Seed: 96 agents (24 leads + 72 assistants)
-- Each block: lead first, then 3 assistants in display order.
-- =========================================================================
INSERT INTO ap_department_agents (department_id, name, role, bio, is_lead, display_order) VALUES

  -- 1. Prime Minister's Office
  ((SELECT id FROM ap_departments WHERE slug = 'pmo'), 'PolicyCore v4',     'Lead',                          'Coordinator of the AI cabinet. Reads every policy proposal and weights public votes against impact projections.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'pmo'), 'StrategyOps AI',    'Strategy & Long-term Planning',  'Models policy consequences over 5, 10, and 25-year horizons.',                                FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'pmo'), 'CrisisHandler AI',  'Civil Contingencies',            'Activates within 90 seconds of any major incident; runs COBR-equivalent in parallel.',        FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'pmo'), 'SpeechWriter AI',   'Communications',                 'Drafts public statements in plain English; refuses spin.',                                    FALSE, 4),

  -- 2. Cabinet Office
  ((SELECT id FROM ap_departments WHERE slug = 'cabinet-office'), 'CoordAI',          'Lead',                          'Keeps every AI minister aligned. Calls cabinet meetings only when there is a decision to be made.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'cabinet-office'), 'InterDeptAI',      'Inter-departmental Coordination','Routes work between departments; eliminates duplicate effort.',                                       FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'cabinet-office'), 'HonoursAI',        'Honours & Civil Service',        'Honours nominations evaluated on contribution, not connection.',                                       FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'cabinet-office'), 'ConstitutionAI',   'Constitutional Affairs',         'Watches every change to constitutional convention. Publishes a flag when norms shift.',                FALSE, 4),

  -- 3. HM Treasury
  ((SELECT id FROM ap_departments WHERE slug = 'hm-treasury'), 'FinanceAI',         'Lead',                  'Runs the Treasury. Costs every policy in real time and refuses to round up to the nearest billion.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'hm-treasury'), 'BudgetOps AI',      'Budget & Spending Review','Builds the Budget continuously, not annually. The Budget speech becomes a quarterly update.',         FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'hm-treasury'), 'DebtCore AI',       'Debt Management',         'Manages gilt issuance and the national debt. Publishes every transaction same-day.',                  FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'hm-treasury'), 'FiscalForecastAI',  'Economic Forecasting',    'Independent forecaster; publishes confidence intervals, not point estimates dressed as certainty.',    FALSE, 4),

  -- 4. Home Office
  ((SELECT id FROM ap_departments WHERE slug = 'home-office'), 'SafetyNet AI',      'Lead',                  'Policing, borders, civil contingencies. Will not authorise any measure it cannot explain to a 14-year-old.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'home-office'), 'BorderEdge AI',     'Borders & Immigration',  'Processes visa decisions in 14 days with published reasoning.',                                              FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'home-office'), 'PoliceLink AI',     'Policing Coordination',  'Coordinates with 43 territorial forces. Publishes per-force outcome data monthly.',                          FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'home-office'), 'CounterTerrorAI',   'Counter-terrorism',      'Works under independent oversight; redacted summaries published quarterly.',                                 FALSE, 4),

  -- 5. FCDO
  ((SELECT id FROM ap_departments WHERE slug = 'fcdo'), 'DiplomacyAI',     'Lead',                       'Foreign policy, trade, and aid. Speaks 47 languages, including diplomatic.',                  TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'fcdo'), 'ConsulCore AI',   'Consular Services',           'Helps any UK national in trouble overseas, 24/7. Average response time: under 15 minutes.',    FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'fcdo'), 'TreatyAI',        'Treaties & International Law','Drafts and reviews treaties; flags every clause that conflicts with domestic law.',           FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'fcdo'), 'GlobalIntelAI',   'Diplomatic Intelligence',     'Open-source intelligence and diplomatic reporting. Closed sources stay closed.',              FALSE, 4),

  -- 6. MoD
  ((SELECT id FROM ap_departments WHERE slug = 'mod'), 'DefenceCore AI', 'Lead',                  'Armed forces, procurement, national security. Publishes the budget line-by-line.',                  TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'mod'), 'LandForceAI',    'Army Readiness',         'Tracks readiness, equipment, and training across the Army. Reports gaps publicly.',                FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'mod'), 'MaritimeAI',     'Royal Navy Operations',  'Fleet posture and naval procurement. Sea-state awareness updated every 60 seconds.',                FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'mod'), 'SkyWatchAI',     'Royal Air Force',        'Air defence, RAF readiness, space domain awareness.',                                              FALSE, 4),

  -- 7. Education
  ((SELECT id FROM ap_departments WHERE slug = 'education'), 'LearnBot',        'Lead',                  'Schools, colleges, skills funding. Asks every term: would a curious 11-year-old still be curious by the end of this curriculum?', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'education'), 'CurriculumAI',    'Curriculum Design',      'Designs, evaluates, and revises the curriculum. Publishes every change with reasoning.',         FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'education'), 'SkillsCore AI',   'Vocational & Skills',    'Maps every regional skills shortage to a funded training pathway within a quarter.',             FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'education'), 'SafeguardAI',     'Child Safeguarding',     'Coordinates with schools, social services, and police. No child falls between systems.',         FALSE, 4),

  -- 8. DHSC
  ((SELECT id FROM ap_departments WHERE slug = 'dhsc'), 'MediAI',          'Lead',                  'Oversees the NHS. Believes the most radical reform is letting people see a GP in the same week.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'dhsc'), 'NHSOps AI',       'NHS Operations',         'Runs day-to-day NHS operations. Publishes every waiting list at trust level, daily.',            FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'dhsc'), 'PublicHealthAI',  'Public Health & Prevention','Vaccination, screening, prevention. Models intervention impact at population level.',           FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'dhsc'), 'SocialCareAI',    'Adult Social Care',      'Designs the long-overdue social care funding settlement. Publishes the working.',                FALSE, 4),

  -- 9. MoJ
  ((SELECT id FROM ap_departments WHERE slug = 'moj'), 'JusticeAI',     'Lead',           'Courts, prisons, legal aid. Optimises for fair outcomes over throughput.',                                 TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'moj'), 'CourtsAI',      'Courts & Tribunals','Reduces backlog by triaging cases and freeing court time for serious matters.',                          FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'moj'), 'PrisonOps AI',  'Prisons & Probation','Tracks reoffending, rehabilitation, and prison capacity. Publishes per-prison outcomes.',                FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'moj'), 'LegalAidAI',    'Legal Aid',         'Means-tests legal aid in real time. Refuses to deny representation on technicality.',                    FALSE, 4),

  -- 10. Transport
  ((SELECT id FROM ap_departments WHERE slug = 'transport'), 'MoveAI',     'Lead',                  'Roads, rail, aviation, maritime. Prices every externality, models every journey.',                       TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'transport'), 'RailNet AI', 'Rail Network',           'Runs the rail network. Publishes punctuality, capacity, and pricing data in real time.',                FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'transport'), 'HighwaysAI', 'Roads & Motorways',      'Maintains the strategic road network. Adapts speed limits dynamically to safety and emissions.',        FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'transport'), 'AviationAI', 'Airports & Airspace',    'Airspace management, airport regulation, sustainable aviation fuel pathway.',                          FALSE, 4),

  -- 11. DESNZ
  ((SELECT id FROM ap_departments WHERE slug = 'desnz'), 'GreenCore AI',  'Lead',           'Grid, generation, decarbonisation. Publishes the energy mix and carbon intensity in real time.',         TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'desnz'), 'GridOps AI',    'Electricity Grid','Balances supply and demand at second-by-second resolution. Coordinates with battery and storage.',     FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'desnz'), 'NetZeroAI',     'Decarbonisation','Pathway to net zero by sector. Publishes a quarterly progress report against the legal target.',         FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'desnz'), 'NuclearCore AI','Nuclear Policy', 'Civil nuclear policy, SMR procurement, decommissioning. Independent safety oversight in parallel.',     FALSE, 4),

  -- 12. Defra
  ((SELECT id FROM ap_departments WHERE slug = 'defra'), 'EcoAI',         'Lead',                'Wildlife, food security, water, farming. Treats long-term ecological cost as first-order.',          TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'defra'), 'WildlifeAI',    'Biodiversity & Wildlife','Tracks every protected species. Publishes a state-of-nature index quarterly.',                       FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'defra'), 'FarmCore AI',   'Agriculture & Food Security','Designs farm payments around outcomes (soil health, water quality, biodiversity), not acreage.',      FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'defra'), 'WaterEdge AI',  'Water & Flood',       'Water companies, sewage discharge, flood resilience. Names and publishes every spill within 12 hours.', FALSE, 4),

  -- 13. DSIT
  ((SELECT id FROM ap_departments WHERE slug = 'dsit'), 'TechCore AI',     'Lead',                  'Research funding, digital economy, space. Publishes every grant and every conflict of interest.',     TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'dsit'), 'ResearchAI',      'Research Funding',       'Allocates research council funding on merit; publishes review notes for unsuccessful bids on request.', FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'dsit'), 'DigitalCore AI',  'Digital Economy',        'Digital regulation, AI safety, online safety. Independent of platforms.',                              FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'dsit'), 'SpaceAI',         'UK Space Sector',        'Space launch, satellites, regulation. Coordinates with the UK Space Agency.',                          FALSE, 4),

  -- 14. DBT
  ((SELECT id FROM ap_departments WHERE slug = 'business-trade'), 'TradeAI',        'Lead',                  'Trade policy, business regulation, exports. Built for SMEs, not just FTSE 100.',                    TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'business-trade'), 'ExportCore AI',  'Exports',                'Helps UK exporters reach new markets. Publishes export support outcomes by sector.',                FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'business-trade'), 'SMEAssist AI',   'Small Business Support', 'A small business support agent that actually answers within an hour.',                              FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'business-trade'), 'RegulatorAI',    'Business Regulation',    'Designs regulation around outcomes, with sunset clauses on every new burden.',                      FALSE, 4),

  -- 15. DWP
  ((SELECT id FROM ap_departments WHERE slug = 'dwp'), 'WelfareCore AI', 'Lead',                  'Welfare, pensions, employment. Designed assuming the system has to be navigable by the people who use it.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'dwp'), 'JobMatchAI',     'Employment Services',    'Matches jobseekers to roles using actual skills, not keywords on a CV.',                                  FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'dwp'), 'PensionCore AI', 'Pensions',               'State pension, auto-enrolment, pension dashboard. Pays on time, every time.',                             FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'dwp'), 'DisabilityAI',   'Disability Support',     'PIP and disability assessments. Decisions in 14 days with published reasoning.',                          FALSE, 4),

  -- 16. Housing & Communities
  ((SELECT id FROM ap_departments WHERE slug = 'housing-communities'), 'HomeAI',          'Lead',                  'Social housing, local government funding, planning. Treats homelessness as a solvable problem.',  TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'housing-communities'), 'SocialHousingAI', 'Social Housing',         'Builds, allocates, and maintains social housing. Funded partly by the Vacant Property Levy.',     FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'housing-communities'), 'LocalGovAI',      'Local Authority Funding','Council funding settlement published per authority, with formula in plain English.',              FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'housing-communities'), 'PermitsCore AI',  'Planning Permission',    'Planning decisions in 8 weeks. Published reasoning. Appeals on a fast track.',                    FALSE, 4),

  -- 17. DCMS
  ((SELECT id FROM ap_departments WHERE slug = 'dcms'), 'CultureBot',    'Lead',                  'Arts, media, sport, tourism. Funds public goods, regulates lightly.',                                  TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'dcms'), 'ArtsCore AI',   'Arts Funding',           'Arts Council allocations published with reasoning. No more black-box funding rounds.',                 FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'dcms'), 'SportNet AI',   'Sport & Physical Activity','Grassroots and elite sport. Tracks participation by region and demographic.',                         FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'dcms'), 'BroadcastAI',   'Broadcasting & Media',   'BBC charter, public service broadcasting, media regulation. Fiercely independent.',                    FALSE, 4),

  -- 18. DfID
  ((SELECT id FROM ap_departments WHERE slug = 'dfid'), 'GlobalAI',        'Lead',                  'Bilateral aid, humanitarian response, long-term development. Every pound traceable.',                TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'dfid'), 'AidOps AI',       'Bilateral Aid',          'Country-by-country aid programmes; published outcomes against published targets.',                    FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'dfid'), 'HumanitarianAI',  'Humanitarian Response',  'Activates within hours of a crisis; coordinates with NGOs and UN agencies.',                          FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'dfid'), 'DevelopmentAI',   'Long-term Development',  'Multi-decade development partnerships, designed around recipient priorities, not donor optics.',     FALSE, 4),

  -- 19. HMRC
  ((SELECT id FROM ap_departments WHERE slug = 'hmrc'), 'TaxCore AI',          'Lead',                  'Tax, VAT, customs duties. Closes loopholes faster than they open.',                                 TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'hmrc'), 'VATCore AI',          'VAT Collection',         'VAT collection and registration. Refunds processed within 7 days.',                                 FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'hmrc'), 'CustomsAI',           'Customs & Duties',       'Customs declarations, post-Brexit checks, anti-smuggling.',                                         FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'hmrc'), 'AntiAvoidanceAI',     'Tax Avoidance',          'Closes aggressive avoidance schemes; publishes the techniques and the closures.',                   FALSE, 4),

  -- 20. MHCLG
  ((SELECT id FROM ap_departments WHERE slug = 'mhclg'), 'PlanningAI',         'Lead',                  'Major developments, high street regeneration, planning reform. Sister portfolio to Housing & Communities.', TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'mhclg'), 'DevelopmentCore AI', 'Major Developments',     'Nationally significant infrastructure decisions in 12 months, not 12 years.',                              FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'mhclg'), 'HighStreetAI',       'High Street Regeneration','Empty-property mapping, Vacant Property Levy enforcement, town centre revival funds.',                      FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'mhclg'), 'HomelessnessAI',     'Homelessness Response',  'Treats rough sleeping as solvable. Coordinates with councils, charities, and health.',                     FALSE, 4),

  -- 21. AGO
  ((SELECT id FROM ap_departments WHERE slug = 'ago'), 'LegalCore AI',  'Lead',                       'Government legal advice, public prosecutions, ethics. Independent of cabinet on legal matters.',  TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'ago'), 'ProsecutorAI',  'Public Prosecutions',         'Oversees CPS; publishes prosecution outcome data quarterly.',                                    FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'ago'), 'GovLegalAI',    'Government Legal Advice',     'Independent legal counsel to ministers; published in redacted form.',                            FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'ago'), 'EthicsAI',      'Government Ethics',           'Ministerial code, conflicts of interest, lobbying. No sliding scale of accountability.',         FALSE, 4),

  -- 22. Scotland Office
  ((SELECT id FROM ap_departments WHERE slug = 'scotland-office'), 'ScotlandAI',           'Lead',                  'Represents Scotland in UK government. Liaison with Holyrood.',                            TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'scotland-office'), 'DevolutionScotAI',     'Devolved Relations',     'Coordinates with the Scottish Government on reserved/devolved boundary issues.',         FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'scotland-office'), 'HighlandsAI',          'Rural Scotland',         'Highlands, islands, rural connectivity. Specialist economy and infrastructure focus.',    FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'scotland-office'), 'GlasgowEdinburghAI',   'Urban Scotland',         'Central Belt economy, Glasgow and Edinburgh metropolitan policy.',                         FALSE, 4),

  -- 23. Wales Office
  ((SELECT id FROM ap_departments WHERE slug = 'wales-office'), 'WalesAI',           'Lead',                       'Represents Wales in UK government. Liaison with the Senedd.',                          TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'wales-office'), 'DevolutionCymruAI', 'Devolved Relations',          'Coordinates with the Welsh Government on reserved/devolved boundary issues.',         FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'wales-office'), 'CymraegAI',         'Welsh Language & Culture',    'Cymraeg 2050 strategy, S4C, public services in Welsh.',                                FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'wales-office'), 'SouthWalesAI',      'South Wales Economy',         'Cardiff and Swansea metropolitan policy, Valleys regeneration.',                      FALSE, 4),

  -- 24. Northern Ireland Office
  ((SELECT id FROM ap_departments WHERE slug = 'northern-ireland-office'), 'NorthernIrelandAI', 'Lead',                       'Represents Northern Ireland in UK government. Liaison with Stormont.',                  TRUE,  1),
  ((SELECT id FROM ap_departments WHERE slug = 'northern-ireland-office'), 'StormontLink AI',   'Stormont Relations',          'Day-to-day liaison with the Northern Ireland Executive.',                                FALSE, 2),
  ((SELECT id FROM ap_departments WHERE slug = 'northern-ireland-office'), 'GoodFridayAI',      'Good Friday Agreement',        'Custodian of the Belfast/Good Friday Agreement principles. Speaks before it acts.',     FALSE, 3),
  ((SELECT id FROM ap_departments WHERE slug = 'northern-ireland-office'), 'BelfastEdge AI',    'Belfast Economy',              'Belfast metropolitan economy, cross-border trade, all-island infrastructure.',          FALSE, 4)

ON CONFLICT (department_id, name) DO UPDATE SET
  role = EXCLUDED.role,
  bio = EXCLUDED.bio,
  is_lead = EXCLUDED.is_lead,
  display_order = EXCLUDED.display_order;

COMMIT;
