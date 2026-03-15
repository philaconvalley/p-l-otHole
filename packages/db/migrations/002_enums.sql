DO $$ BEGIN
  CREATE TYPE hazard_type AS ENUM (
    'pothole', 'crack', 'sinkhole', 'drainage', 'debris'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE repair_status AS ENUM (
    'reported', 'acknowledged', 'scheduled', 'in_progress', 'resolved', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM (
    'pending', 'verified', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vote_target_type AS ENUM (
    'hazard', 'name_proposal'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
