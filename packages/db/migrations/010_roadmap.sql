-- Roadmap phases (Phase 1, Phase 2, Phase 3)
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  number          integer     NOT NULL UNIQUE,
  title           varchar(120) NOT NULL,
  timeline        varchar(200),
  status          varchar(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'future')),
  progress        integer     NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order      integer     NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Roadmap features within each phase
CREATE TABLE IF NOT EXISTS roadmap_features (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id        uuid        NOT NULL REFERENCES roadmap_phases(id) ON DELETE CASCADE,
  title           varchar(200) NOT NULL,
  description     text,
  status          varchar(20) NOT NULL DEFAULT 'planned' CHECK (status IN ('shipped', 'in_progress', 'planned')),
  sort_order      integer     NOT NULL DEFAULT 0,
  shipped_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Changelog entries
CREATE TABLE IF NOT EXISTS roadmap_changelog (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id        uuid        REFERENCES roadmap_phases(id) ON DELETE SET NULL,
  title           text        NOT NULL,
  published_at    date        NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS roadmap_features_phase_idx ON roadmap_features(phase_id, sort_order);
CREATE INDEX IF NOT EXISTS roadmap_changelog_date_idx ON roadmap_changelog(published_at DESC);
