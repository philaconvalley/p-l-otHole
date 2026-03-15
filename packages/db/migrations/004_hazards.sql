CREATE TABLE IF NOT EXISTS hazards (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  name                varchar(120),
  slug                varchar(140),
  description         text,
  type                hazard_type    NOT NULL,
  location            geography(POINT, 4326) NOT NULL,
  images              jsonb          NOT NULL DEFAULT '[]'::jsonb,
  severity_score      integer        NOT NULL DEFAULT 0,
  upvotes             integer        NOT NULL DEFAULT 0,
  downvotes           integer        NOT NULL DEFAULT 0,
  reports_count       integer        NOT NULL DEFAULT 1,
  repair_status       repair_status  NOT NULL DEFAULT 'reported',
  city_ticket_id      varchar(80),
  city_code           varchar(32)    NOT NULL DEFAULT 'PHL',
  created_by_user_id  uuid           REFERENCES users(id),
  created_at          timestamptz    NOT NULL DEFAULT now(),
  updated_at          timestamptz    NOT NULL DEFAULT now(),
  resolved_at         timestamptz,
  deleted_at          timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS hazards_slug_key       ON hazards(slug) WHERE slug IS NOT NULL;
CREATE INDEX        IF NOT EXISTS hazards_location_gix   ON hazards USING GIST(location);
CREATE INDEX        IF NOT EXISTS hazards_status_created ON hazards(repair_status, created_at DESC);
CREATE INDEX        IF NOT EXISTS hazards_city_idx       ON hazards(city_code);
