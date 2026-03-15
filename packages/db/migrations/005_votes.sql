CREATE TABLE IF NOT EXISTS votes (
  id          uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid             NOT NULL REFERENCES users(id),
  hazard_id   uuid             REFERENCES hazards(id),
  target_type vote_target_type NOT NULL DEFAULT 'hazard',
  value       smallint         NOT NULL CHECK (value BETWEEN 1 AND 5),
  note        varchar(280),
  created_at  timestamptz      NOT NULL DEFAULT now(),
  updated_at  timestamptz      NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS votes_user_hazard_unique ON votes(user_id, hazard_id) WHERE hazard_id IS NOT NULL;
CREATE INDEX        IF NOT EXISTS votes_hazard_idx         ON votes(hazard_id, created_at DESC);
CREATE INDEX        IF NOT EXISTS votes_user_idx           ON votes(user_id, created_at DESC);
