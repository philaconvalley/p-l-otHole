# Implementation Plan

P(l)otHole — Hackathon Sprint to Build Day (March 19, 2026)

This plan is organized into four composable phases. Each step is independently shippable and sized for pair work. The demo scope (report → map → detail → export) is fully covered by Phases 0–3.

---

## Demo Scope (Required by Build Day)

- [ ] Submit a hazard report with image + map pin.
- [ ] Map view with at least one filter (type or status).
- [ ] Detail page showing days-open counter + repair status.
- [ ] Export current data as GeoJSON or CSV.

---

## Phase 0 — Scaffold

**Goal:** Everyone can run the project locally before writing a single feature.

| # | Step | Owner | Notes |
|---|---|---|---|
| 0.1 | `pnpm-workspace.yaml` + monorepo layout (`apps/web`, `packages/db`, `packages/api`) | Ops | Use pnpm workspaces |
| 0.2 | `docker-compose.yml` — postgres/postgis + redis | Ops | Pin postgres:15-postgis-3 |
| 0.3 | `.env.example` with all required vars | Ops | See README env table |
| 0.4 | Root ESLint + Prettier + TypeScript configs | Ops | Shared across packages |
| 0.5 | GitHub Actions CI — lint + typecheck + test on PR | Ops | Fail fast on bad pushes |

---

## Phase 1 — Data Layer

**Goal:** Migrations run cleanly; seed script populates sample Philadelphia hazards.

| # | Step | Owner | Notes |
|---|---|---|---|
| 1.1 | Migration: enable `postgis` + `pgcrypto` extensions | Data | Must run before any geometry column |
| 1.2 | Migration: enum types (`hazard_type`, `repair_status`, `report_status`, `vote_target_type`) | Data | See `docs/data_model.md` for values |
| 1.3 | Migration: `users` table + indexes | Data | `citext` for email; reputation + badge cache |
| 1.4 | Migration: `hazards` table with `geography(POINT,4326)` + GIST index | Data | Core entity; include all indexes from data model |
| 1.5 | Migration: `votes` table + unique index per user/hazard | Data | Enforces one vote per user per hazard |
| 1.6 | Migration: `reports` table | Data | Can reinforce existing hazard or create new |
| 1.7 | Migration: `comments` table (threaded via `parent_comment_id`) | Data | Lower priority; skip if time is short |
| 1.8 | Migration: `badges` + `user_badges` tables | Data | Lower priority; skip if time is short |
| 1.9 | Seed script: 10–20 Philadelphia hazards with real coordinates | Data | Covers multiple types + statuses for demo |

**Parallel opportunity:** Phase 1 and Phase 2 step 2.1 (router skeleton) can start simultaneously.

---

## Phase 2 — API Layer

**Goal:** All five priority endpoints respond correctly with valid data.

| # | Step | Owner | Notes |
|---|---|---|---|
| 2.1 | tRPC router (or Express) skeleton with Zod input schemas | API | One schema file per resource |
| 2.2 | `POST /v1/hazards` — create hazard + enqueue image verification job | API | Return `201` with full hazard object |
| 2.3 | `GET /v1/hazards` — list with `type`/`repairStatus`/`city`/`sort` filters + cursor pagination | API | Default sort: `newest`; max `limit` 100 |
| 2.4 | `GET /v1/hazards/:id` — single hazard with computed `daysOpen` + `voteVelocity` | API | `daysOpen` = `now() - created_at` in days |
| 2.5 | `GET /v1/hazards/search` — `ST_DWithin` radius query (`radiusMeters` max 10,000) | API | Requires GIST index from step 1.4 |
| 2.6 | `POST /v1/hazards/:id/vote` — upsert vote; recalculate `severity_score` | API | Unique constraint from step 1.5 |
| 2.7 | NextAuth.js session middleware — guard all write routes | API | Email magic link + one OAuth provider |
| 2.8 | `GET /v1/exports/geojson` — FeatureCollection; filter by `city`, `updatedSince`, `type`, `repairStatus` | API | Content-type: `application/geo+json` |
| 2.9 | `GET /v1/exports/csv` — streaming CSV; same filters as GeoJSON export | API | Content-type: `text/csv`; include header row |
| 2.10 | Rate limiting middleware — 120 req/min public, 60 req/min auth, 20 req/min export | API | Use `express-rate-limit` or Upstash |

---

## Phase 3 — Frontend

**Goal:** Complete demo loop works in the browser: report → map → detail → export.

| # | Step | Owner | Notes |
|---|---|---|---|
| 3.1 | `<HazardMap>` component — Mapbox GL JS with marker clustering | UI | Use `mapbox-gl` npm package; free-tier token |
| 3.2 | Map page — fetch hazards by viewport bbox on move/zoom; render markers | UI | Debounce map move events |
| 3.3 | Filter bar on map — type + repairStatus dropdowns | UI | Wire to `GET /v1/hazards` query params |
| 3.4 | `<ReportForm>` — image upload, map pin placement, hazard type selector, description | UI | Show validation errors inline |
| 3.5 | Hazard detail page — photo, days-open badge, severity score, repair status, vote button | UI | Pull `daysOpen` + `voteVelocity` from API |
| 3.6 | Auth pages — sign in / sign up via NextAuth | UI | Redirect to map after sign in |
| 3.7 | Export buttons on map page — download GeoJSON and CSV for current filters | UI | Simple anchor tag to export endpoint |

---

## Phase 4 — Polish

**Goal:** Demo is reliable, fast, and looks finished under pressure.

| # | Step | Owner | Notes |
|---|---|---|---|
| 4.1 | Redis cache for viewport query results (5-min TTL) | API/Data | Invalidate on new report or vote |
| 4.2 | Loading skeletons + error boundaries on all async UI | UI | Especially map load and report form submit |
| 4.3 | Mobile-responsive layout check | UI | Report form must work on a phone |
| 4.4 | End-to-end smoke test: report → map → detail → export | QA | Script with cURL or Playwright |
| 4.5 | Demo seed refresh script — reset to clean state quickly | Data | Useful for live demos and judging rounds |

---

## Parallel Work Map

```
Day 1:  [0.1–0.5] Scaffold + CI ──────────────────────────────────────┐
        [1.1–1.4] Core migrations (users, hazards)                      │
        [2.1]     API skeleton                                           │
                                                                         ▼
Day 2:  [1.5–1.9] Remaining migrations + seed ──► [2.2–2.6] CRUD + vote + search
        [3.1–3.3] Map component + filter bar

Day 3:  [2.7–2.10] Auth + exports + rate limits ──► [3.4–3.7] Forms + detail + auth UI

Day 4:  [4.1–4.5] Cache + polish + smoke test + demo prep
```

---

## Reference Docs

| Document | When to consult |
|---|---|
| `docs/data_model.md` | Column types, constraints, indexes, example queries |
| `docs/api.md` | Full endpoint contracts, request/response shapes, error codes |
| `docs/architecture.md` | Service boundaries, caching strategy, geospatial pipeline |
| `docs/gamification.md` | Reputation point events, badge criteria (Phase 2+) |
| `CONTRIBUTING.md` | Branch naming, commit conventions, PR checklist |
| `CLAUDE.md` | Local commands, env vars, key constraints at a glance |
