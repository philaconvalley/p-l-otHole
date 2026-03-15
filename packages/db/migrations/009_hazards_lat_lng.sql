-- Add latitude/longitude decimal columns to hazards for Prisma ORM access.
-- The geography(POINT) column is kept for PostGIS spatial queries (ST_DWithin etc).
-- lat/lng decimals are used by the API layer for map rendering without PostGIS functions.

ALTER TABLE hazards
  ADD COLUMN IF NOT EXISTS latitude  numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6);

-- Backfill from existing PostGIS geography column
UPDATE hazards
   SET latitude  = ST_Y(location::geometry),
       longitude = ST_X(location::geometry)
 WHERE location IS NOT NULL;

CREATE INDEX IF NOT EXISTS hazards_lat_lng_idx ON hazards(latitude, longitude);
