-- Migration: add `title` and `model_name` to ap_department_agents and backfill all 96 rows.
-- - model_name = the existing `name` column value (already a model identifier)
-- - title = a human-readable job title:
--     * leads: e.g. 'Prime Minister AI', 'Chancellor AI'
--     * specialists: e.g. 'Strategy Specialist', 'Borders & Immigration Specialist'
-- Idempotent: ADD COLUMN IF NOT EXISTS, and the UPDATE is keyed by (slug, name) so re-runs
-- just rewrite to the same values.

BEGIN;

ALTER TABLE ap_department_agents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE ap_department_agents ADD COLUMN IF NOT EXISTS model_name TEXT;

-- model_name copies the existing name (which has been the model identifier all along).
UPDATE ap_department_agents SET model_name = name WHERE model_name IS NULL OR model_name <> name;

-- Backfill titles. (slug, name) is unique because (department_id, name) is unique
-- and slug uniquely identifies a department.
UPDATE ap_department_agents AS a
SET title = m.title
FROM (VALUES
  -- 1. Prime Minister's Office
  ('pmo', 'PolicyCore v4',          'Prime Minister AI'),
  ('pmo', 'StrategyOps AI',         'Strategy Specialist'),
  ('pmo', 'CrisisHandler AI',       'Civil Contingencies Specialist'),
  ('pmo', 'SpeechWriter AI',        'Communications Specialist'),
  -- 2. Cabinet Office
  ('cabinet-office', 'CoordAI',         'Cabinet Office Minister AI'),
  ('cabinet-office', 'InterDeptAI',     'Coordination Specialist'),
  ('cabinet-office', 'HonoursAI',       'Honours Specialist'),
  ('cabinet-office', 'ConstitutionAI',  'Constitutional Affairs Specialist'),
  -- 3. HM Treasury
  ('hm-treasury', 'FinanceAI',          'Chancellor AI'),
  ('hm-treasury', 'BudgetOps AI',       'Budget Specialist'),
  ('hm-treasury', 'DebtCore AI',        'Debt Management Specialist'),
  ('hm-treasury', 'FiscalForecastAI',   'Economic Forecasting Specialist'),
  -- 4. Home Office
  ('home-office', 'SafetyNet AI',       'Home Secretary AI'),
  ('home-office', 'BorderEdge AI',      'Borders & Immigration Specialist'),
  ('home-office', 'PoliceLink AI',      'Policing Specialist'),
  ('home-office', 'CounterTerrorAI',    'Counter-terrorism Specialist'),
  -- 5. FCDO
  ('fcdo', 'DiplomacyAI',     'Foreign Secretary AI'),
  ('fcdo', 'ConsulCore AI',   'Consular Specialist'),
  ('fcdo', 'TreatyAI',        'Treaty Specialist'),
  ('fcdo', 'GlobalIntelAI',   'Diplomatic Intelligence Specialist'),
  -- 6. MoD
  ('mod', 'DefenceCore AI',   'Defence Secretary AI'),
  ('mod', 'LandForceAI',      'Land Forces Specialist'),
  ('mod', 'MaritimeAI',       'Naval Operations Specialist'),
  ('mod', 'SkyWatchAI',       'Air Force Specialist'),
  -- 7. Department for Education
  ('education', 'LearnBot',         'Education Secretary AI'),
  ('education', 'CurriculumAI',     'Curriculum Specialist'),
  ('education', 'SkillsCore AI',    'Skills Specialist'),
  ('education', 'SafeguardAI',      'Safeguarding Specialist'),
  -- 8. DHSC
  ('dhsc', 'MediAI',          'Health Secretary AI'),
  ('dhsc', 'NHSOps AI',       'NHS Operations Specialist'),
  ('dhsc', 'PublicHealthAI',  'Public Health Specialist'),
  ('dhsc', 'SocialCareAI',    'Social Care Specialist'),
  -- 9. MoJ
  ('moj', 'JusticeAI',        'Justice Secretary AI'),
  ('moj', 'CourtsAI',         'Courts Specialist'),
  ('moj', 'PrisonOps AI',     'Prisons Specialist'),
  ('moj', 'LegalAidAI',       'Legal Aid Specialist'),
  -- 10. Transport
  ('transport', 'MoveAI',     'Transport Secretary AI'),
  ('transport', 'RailNet AI', 'Rail Specialist'),
  ('transport', 'HighwaysAI', 'Highways Specialist'),
  ('transport', 'AviationAI', 'Aviation Specialist'),
  -- 11. DESNZ
  ('desnz', 'GreenCore AI',   'Energy Secretary AI'),
  ('desnz', 'GridOps AI',     'Grid Specialist'),
  ('desnz', 'NetZeroAI',      'Decarbonisation Specialist'),
  ('desnz', 'NuclearCore AI', 'Nuclear Specialist'),
  -- 12. Defra
  ('defra', 'EcoAI',          'Environment Secretary AI'),
  ('defra', 'WildlifeAI',     'Wildlife Specialist'),
  ('defra', 'FarmCore AI',    'Agriculture Specialist'),
  ('defra', 'WaterEdge AI',   'Water & Flood Specialist'),
  -- 13. DSIT
  ('dsit', 'TechCore AI',     'Science Secretary AI'),
  ('dsit', 'ResearchAI',      'Research Specialist'),
  ('dsit', 'DigitalCore AI',  'Digital Economy Specialist'),
  ('dsit', 'SpaceAI',         'Space Specialist'),
  -- 14. DBT
  ('business-trade', 'TradeAI',        'Business Secretary AI'),
  ('business-trade', 'ExportCore AI',  'Exports Specialist'),
  ('business-trade', 'SMEAssist AI',   'SME Specialist'),
  ('business-trade', 'RegulatorAI',    'Regulation Specialist'),
  -- 15. DWP
  ('dwp', 'WelfareCore AI',   'Work & Pensions Secretary AI'),
  ('dwp', 'JobMatchAI',       'Employment Specialist'),
  ('dwp', 'PensionCore AI',   'Pensions Specialist'),
  ('dwp', 'DisabilityAI',     'Disability Specialist'),
  -- 16. Housing & Communities
  ('housing-communities', 'HomeAI',           'Housing Secretary AI'),
  ('housing-communities', 'SocialHousingAI',  'Social Housing Specialist'),
  ('housing-communities', 'LocalGovAI',       'Local Government Specialist'),
  ('housing-communities', 'PermitsCore AI',   'Planning Specialist'),
  -- 17. DCMS
  ('dcms', 'CultureBot',      'Culture Secretary AI'),
  ('dcms', 'ArtsCore AI',     'Arts Specialist'),
  ('dcms', 'SportNet AI',     'Sport Specialist'),
  ('dcms', 'BroadcastAI',     'Broadcasting Specialist'),
  -- 18. DfID
  ('dfid', 'GlobalAI',        'International Development Secretary AI'),
  ('dfid', 'AidOps AI',       'Bilateral Aid Specialist'),
  ('dfid', 'HumanitarianAI',  'Humanitarian Response Specialist'),
  ('dfid', 'DevelopmentAI',   'Long-term Development Specialist'),
  -- 19. HMRC
  ('hmrc', 'TaxCore AI',          'HMRC Chief AI'),
  ('hmrc', 'VATCore AI',          'VAT Specialist'),
  ('hmrc', 'CustomsAI',           'Customs Specialist'),
  ('hmrc', 'AntiAvoidanceAI',     'Tax Avoidance Specialist'),
  -- 20. MHCLG
  ('mhclg', 'PlanningAI',         'Communities Secretary AI'),
  ('mhclg', 'DevelopmentCore AI', 'Major Projects Specialist'),
  ('mhclg', 'HighStreetAI',       'High Street Specialist'),
  ('mhclg', 'HomelessnessAI',     'Homelessness Specialist'),
  -- 21. AGO
  ('ago', 'LegalCore AI',     'Attorney General AI'),
  ('ago', 'ProsecutorAI',     'Public Prosecutions Specialist'),
  ('ago', 'GovLegalAI',       'Legal Advice Specialist'),
  ('ago', 'EthicsAI',         'Ethics Specialist'),
  -- 22. Scotland Office
  ('scotland-office', 'ScotlandAI',           'Scotland Secretary AI'),
  ('scotland-office', 'DevolutionScotAI',     'Devolution Specialist'),
  ('scotland-office', 'HighlandsAI',          'Rural Scotland Specialist'),
  ('scotland-office', 'GlasgowEdinburghAI',   'Urban Scotland Specialist'),
  -- 23. Wales Office
  ('wales-office', 'WalesAI',           'Wales Secretary AI'),
  ('wales-office', 'DevolutionCymruAI', 'Devolution Specialist'),
  ('wales-office', 'CymraegAI',         'Welsh Language Specialist'),
  ('wales-office', 'SouthWalesAI',      'South Wales Economy Specialist'),
  -- 24. Northern Ireland Office
  ('northern-ireland-office', 'NorthernIrelandAI', 'Northern Ireland Secretary AI'),
  ('northern-ireland-office', 'StormontLink AI',   'Stormont Relations Specialist'),
  ('northern-ireland-office', 'GoodFridayAI',      'Good Friday Agreement Specialist'),
  ('northern-ireland-office', 'BelfastEdge AI',    'Belfast Economy Specialist')
) AS m(slug, agent_name, title)
WHERE a.name = m.agent_name
  AND a.department_id = (SELECT id FROM ap_departments WHERE slug = m.slug);

COMMIT;
