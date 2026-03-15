# P(l)otHole — CLAUDE.md

## Project Summary

Civic road-hazard reporting platform. Residents spot, photo, name, and vote on potholes/cracks/sinkholes. Public map shows live severity scores, days-open counters, and repair status. All data is open (ODbL). Build day: **March 19, 2026**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript |
| API | Express or tRPC inside Next.js API routes |
| DB | PostgreSQL 15 + PostGIS |
| Cache | Redis 7 |
| Storage | S3-compatible (images) |
| Maps | Mapbox GL JS (Leaflet fallback) |
| Auth | NextAuth.js |
| Deploy | Vercel (FE) + Docker (API+services) |

## Monorepo Structure

```
p-l-otHole/
├── apps/
│   └── web/          # Next.js app (pages, components, API routes)
├── packages/
│   ├── db/           # Drizzle/Prisma schema, migrations, seed
│   └── api/          # Shared types, Zod schemas, tRPC router
├── docker-compose.yml
├── .env.example
└── pnpm-workspace.yaml
```

## Key Commands

```bash
pnpm dev          # start Next.js dev server (localhost:3000)
pnpm db:migrate   # run pending migrations
pnpm db:seed      # seed sample hazards
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest
```

## Environment Variables

See `.env.example`. Required for local dev:
- `DATABASE_URL` — postgres://... (PostGIS)
- `REDIS_URL`
- `MAPBOX_ACCESS_TOKEN`
- `NEXTAUTH_SECRET` + `NEXTAUTH_URL`
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

## Demo Scope (Hackathon Gate)

1. Submit a hazard report (image + map pin).
2. Map view with at least one filter (type or status).
3. Detail page shows days-open + repair status.
4. Export as GeoJSON or CSV.

## Core Data Model (Condensed)

- `hazards` — central entity; PostGIS `geography(POINT,4326)` + `repair_status` enum.
- `reports` — one-to-many per hazard; can reinforce existing or create new.
- `votes` — severity `1-5` per user per hazard; unique constraint enforced.
- `users` — reputation + badge cache; `is_moderator` flag.
- `badges` / `user_badges` — earned badge join table.

Key indexes: GIST on `hazards.location`, status+created composite, city_code.

Full schema: `docs/data_model.md`

## API Conventions

- Base: `/v1` (local: `http://localhost:4000/v1` or Next.js `/api/v1`)
- Auth: `Authorization: Bearer <token>` or HTTP-only session cookie
- Pagination: cursor-based (`limit`, `cursor`, `nextCursor`, `hasMore`)
- Errors: `{ error: { code, message, details, requestId } }`

Priority endpoints: `POST /hazards`, `GET /hazards`, `GET /hazards/:id`, `POST /hazards/:id/vote`, `GET /exports/geojson`

Full reference: `docs/api.md`

## Conventions

- Branches: `feat/`, `fix/`, `docs/`, `chore/`, `test/` prefixes.
- Commits: Conventional Commits (`feat: ...`, `fix: ...`).
- PRs: small and focused; link the issue; include screenshots for UI changes.
- No unauthenticated writes; all soft-deletes (never hard-delete hazards).

## Geospatial Notes

- Store coords as `geography(POINT, 4326)` — use `ST_DWithin` for radius, `ST_Distance` for sorting.
- Bound all map queries to viewport bbox + limit to avoid full-table scans.
- Cache viewport results in Redis (short TTL); invalidate on new report or vote.

## What NOT to do

- Do not hard-delete hazards or reports (soft-delete with `deleted_at`).
- Do not include PII (email, password_hash) in any public export.
- Do not skip rate limiting on write endpoints.
- Do not put expensive aggregations on the synchronous request path — use background jobs.
