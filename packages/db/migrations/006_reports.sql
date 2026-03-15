CREATE TABLE IF NOT EXISTS reports (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id             uuid          NOT NULL REFERENCES hazards(id),
  reporter_user_id      uuid          REFERENCES users(id),
  description           text          NOT NULL,
  image_urls            jsonb         NOT NULL DEFAULT '[]'::jsonb,
  source_latitude       numeric(9,6),
  source_longitude      numeric(9,6),
  status                report_status NOT NULL DEFAULT 'pending',
  verification_score    integer       NOT NULL DEFAULT 0,
  duplicate_of_report_id uuid         REFERENCES reports(id),
  created_at            timestamptz   NOT NULL DEFAULT now(),
  verified_at           timestamptz
);

CREATE INDEX IF NOT EXISTS reports_hazard_idx   ON reports(hazard_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_status_idx   ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reporter_idx ON reports(reporter_user_id, created_at DESC);
