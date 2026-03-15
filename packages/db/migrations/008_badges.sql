CREATE TABLE IF NOT EXISTS badges (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar(40) NOT NULL,
  name        varchar(80) NOT NULL,
  tier        smallint    NOT NULL,
  description text        NOT NULL,
  criteria    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS badges_code_key ON badges(code);
CREATE INDEX        IF NOT EXISTS badges_tier_idx  ON badges(tier);

CREATE TABLE IF NOT EXISTS user_badges (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL REFERENCES users(id),
  badge_id           uuid        NOT NULL REFERENCES badges(id),
  earned_at          timestamptz NOT NULL DEFAULT now(),
  awarded_by_user_id uuid        REFERENCES users(id),
  award_reason       text
);

CREATE UNIQUE INDEX IF NOT EXISTS user_badges_unique ON user_badges(user_id, badge_id);

-- Seed the four badge tiers defined in the gamification spec
INSERT INTO badges (code, name, tier, description, criteria) VALUES
  ('spotter',      'Spotter',      1, 'Submit 5 verified reports.',
   '{"reports_verified": 5}'::jsonb),
  ('surveyor',     'Surveyor',     2, 'Submit 25 verified reports and cast 100 votes.',
   '{"reports_verified": 25, "votes_cast": 100}'::jsonb),
  ('inspector',    'Inspector',    3, 'Submit 100 verified reports and earn 500 reputation.',
   '{"reports_verified": 100, "reputation_score": 500}'::jsonb),
  ('commissioner', 'Commissioner', 4, 'Submit 500 verified reports and hold elected moderator status.',
   '{"reports_verified": 500, "is_moderator": true}'::jsonb)
ON CONFLICT (code) DO NOTHING;
