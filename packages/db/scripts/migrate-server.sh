#!/usr/bin/env bash
# Run pending SQL migrations against the plothole postgres container.
# Safe to run multiple times — tracks applied files in _migrations table.
set -euo pipefail

MIGRATIONS_DIR="/opt/plothole/migrations"
CONTAINER="plothole-postgres-1"
DB_USER="plothole"
DB_NAME="plothole"

# Ensure tracking table exists
sudo docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  CREATE TABLE IF NOT EXISTS _migrations (
    id          serial PRIMARY KEY,
    filename    text NOT NULL UNIQUE,
    applied_at  timestamptz NOT NULL DEFAULT now()
  );"

# Apply each migration file in sorted order
for filepath in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$filepath" ] || { echo "No migration files found in $MIGRATIONS_DIR"; exit 0; }
  filename=$(basename "$filepath")

  applied=$(sudo docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc \
    "SELECT 1 FROM _migrations WHERE filename = '$filename' LIMIT 1")

  if [ "$applied" = "1" ]; then
    echo "  skip  $filename"
  else
    echo "  apply $filename"
    sudo docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$filepath"
    sudo docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
      "INSERT INTO _migrations (filename) VALUES ('$filename')"
  fi
done

echo "Migrations complete."
