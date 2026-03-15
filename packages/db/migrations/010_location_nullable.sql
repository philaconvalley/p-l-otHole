-- Make location nullable so Prisma can create hazard rows without PostGIS.
-- The API route populates location via a separate $executeRaw after create.
-- lat/lng decimal columns (added in 009) are used for all ORM queries.

ALTER TABLE hazards ALTER COLUMN location DROP NOT NULL;
