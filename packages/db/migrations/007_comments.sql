CREATE TABLE IF NOT EXISTS comments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id         uuid        NOT NULL REFERENCES hazards(id),
  user_id           uuid        NOT NULL REFERENCES users(id),
  parent_comment_id uuid        REFERENCES comments(id),
  body              text        NOT NULL,
  is_flagged        boolean     NOT NULL DEFAULT false,
  is_deleted        boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_hazard_idx ON comments(hazard_id, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_user_idx   ON comments(user_id, created_at DESC);
