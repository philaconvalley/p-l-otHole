CREATE TABLE IF NOT EXISTS users (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  username          varchar(40) NOT NULL,
  email             citext      NOT NULL,
  password_hash     text,
  reputation_score  integer     NOT NULL DEFAULT 0,
  reports_submitted integer     NOT NULL DEFAULT 0,
  votes_cast        integer     NOT NULL DEFAULT 0,
  badges            jsonb       NOT NULL DEFAULT '[]'::jsonb,
  is_moderator      boolean     NOT NULL DEFAULT false,
  is_banned         boolean     NOT NULL DEFAULT false,
  last_active_at    timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key    ON users(email);
CREATE INDEX        IF NOT EXISTS users_reputation_idx ON users(reputation_score DESC);
