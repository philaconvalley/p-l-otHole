# P(l)otHole

**Map it. Name it. Shame it. Fix it.**

P(l)otHole is a community-driven civic platform that empowers residents to report, track, and pressure-fix road hazards in their neighborhoods. Think of it as a public ledger for every pothole, crack, and sinkhole -- complete with crowd-sourced names, severity scores, and a built-in shame clock counting the days your city has ignored them.

---

## Sprint and Build Day Plan (Mixed-Skill Teams)

If your team has a mix of beginners, product/design contributors, and experienced engineers, use this path first.

### Who Can Contribute on Day 1

- **Beginner-friendly:** write issue reports, test UX flows, improve docs, create seed data, and validate API examples with Postman/cURL.
- **Intermediate:** build UI routes, connect forms to API endpoints, add validation and loading/error states.
- **Advanced:** implement geospatial queries, caching, auth hardening, and deployment/CI setup.

### 2-Week Development Sprint + Build Day

1. **Week 1:** align scope, ship report -> map -> detail flow, and validate one full end-to-end report.
2. **Week 2:** add voting, exports, moderation basics, and demo polish.
3. **Build Day (March 19):** guided coaching day for integration, testing, and presentation readiness.

### After Build Day: Open Source Handoff

P(l)otHole continues as an open-source civic project stewarded with and for the **PhilaConValley community**. The March 19 build day is the launch point, not the finish line.

### Fast Demo Scope (Recommended)

- Create a hazard report with image + map pin.
- Show hazards on map with at least one filter.
- Display days-open + repair status on detail page.
- Export current data as GeoJSON or CSV.

---

## The Problem

Road hazards cost drivers billions in vehicle damage every year, cause accidents, and disproportionately affect under-served communities with the least political leverage. Existing 311 systems bury reports in opaque queues. There is no public accountability, no transparency into timelines, and no collective pressure mechanism.

P(l)otHole changes that by making every hazard **visible**, **named**, **ranked**, and **impossible to ignore**.

## How It Works

```
1. SPOT    -- Encounter a road hazard while commuting or walking.
2. SNAP    -- Take a photo and drop a pin on the map.
3. NAME    -- Give it a memorable community name ("The Abyss on 5th", "Lake Crater").
4. RANK    -- The community votes on severity; the platform calculates a pressure score.
5. TRACK   -- A public days-open counter and vote velocity indicator keep pressure visible.
6. EXPORT  -- Data flows to open formats (GeoJSON, CSV) for journalists, researchers, and city planners.
```

---

## Core Features

- **Interactive Hazard Map** -- Browse, search, and filter reported hazards on a real-time map with clustering and heatmap layers.
- **Photo-Verified Reports** -- Every report requires geotagged imagery. GPS coordinates are validated against the photo's EXIF data.
- **Community Naming** -- Residents propose and vote on names for hazards, turning anonymous potholes into local landmarks.
- **Severity Scoring** -- An aggregate score derived from community votes, report frequency, and hazard dimensions.
- **Civic Pressure Dashboard** -- Days-open counters, vote velocity graphs, and "Worst Street" leaderboards create sustained public accountability.
- **Repair Status Tracking** -- Link reports to city work-order ticket IDs and track progress from reported to verified-fixed.
- **Data Export** -- Download datasets in GeoJSON, CSV, or via the public REST API for use in research, journalism, or civic applications.

## Gamification

P(l)otHole keeps contributors engaged through a reputation and badge system:

| Action | Points |
|---|---|
| Submit a verified report | +10 |
| Cast a severity vote | +2 |
| Verify another user's report in person | +15 |
| Proposed name accepted by community | +20 |

**Badge Tiers**

| Badge | Requirement |
|---|---|
| Spotter | 5 verified reports |
| Surveyor | 25 verified reports + 100 votes cast |
| Inspector | 100 verified reports + 500 reputation |
| Commissioner | 500 verified reports + elected moderator status |

Weekly **"Worst Street"** leaderboards rank the most hazard-dense corridors, generating shareable hazard cards with auto-generated OG images for social media amplification. See [docs/gamification.md](docs/gamification.md) for the full mechanics.

## Civic Pressure Model

Every reported hazard displays:

- A **days-open counter** that starts ticking the moment a report is verified.
- A **vote velocity indicator** showing how fast community engagement is accelerating.
- A **severity badge** (Low / Moderate / High / Critical) derived from the aggregate score.
- A **city response status** (Reported / Acknowledged / Scheduled / In Progress / Resolved / Disputed).

These indicators are designed to be embedded, shared, and cited in local journalism and city council testimony.

---

## Map Provider Integration Strategy

P(l)otHole renders its primary map experience with **Mapbox GL JS** (with **Leaflet** as a lightweight fallback), but the long-term goal is to make hazard data a first-class layer on the maps people already use.

### Google Maps

- Publish a public KML/GeoJSON feed that can be imported as a Google My Maps layer.
- Apply to the [Google Maps Platform Partner Program](https://cloud.google.com/maps-platform) to explore custom overlay integration.
- Generate Google Maps deep links for individual hazard coordinates so users can navigate directly.

### OpenStreetMap

- Contribute verified, resolved hazard data back to OSM as surface-quality tags following the [OSM road surface tagging schema](https://wiki.openstreetmap.org/wiki/Key:surface).
- Provide a JOSM-compatible data feed for OSM editors.
- Integrate Overpass API queries to cross-reference existing OSM road condition data with P(l)otHole reports.

### Long-Term Vision: Landmark Recognition

The ultimate ambition is for community-named hazards to appear as **recognized landmarks** on mainstream map providers -- imagine seeing "The Abyss on 5th" as a labeled point-of-interest on Google Maps or Apple Maps. This requires sustained data quality, community scale, and eventual partnership with map providers, but it is the north star that drives every technical decision.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **API** | Node.js with Express or tRPC |
| **Database** | PostgreSQL + PostGIS (geospatial queries) |
| **Cache / Leaderboards** | Redis |
| **Object Storage** | S3-compatible (AWS S3, Cloudflare R2, MinIO) |
| **Map Rendering** | Mapbox GL JS / Leaflet |
| **Deployment** | Vercel (frontend) / Docker (API + services) |
| **CI/CD** | GitHub Actions |

---

## Open Data Philosophy

All hazard data collected by P(l)otHole is **public by default**. We believe civic infrastructure data belongs to the community, not behind a paywall or login wall.

- Every report, vote, and status change is recorded in a public audit log.
- The full dataset is downloadable at any time via the REST API or bulk export endpoints.
- Data is released under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/) so journalists, researchers, civic hackers, and city planners can use it freely.
- Personal user data (email, auth credentials) is never included in public exports.

---

## Getting Started

New team? Start with **Quick Setup** first, then use `CONTRIBUTING.md` for role-based tasks.

### Fork + Clone (First-Time Contributors)

If you plan to contribute code, fork the repo first, then clone your fork:

```bash
# 1) Fork this repository on GitHub
# 2) Clone your fork locally
git clone https://github.com/<your-username>/p-l-otHole.git
cd p-l-otHole
```

If you are a core team member with direct write access, you can clone the main repository directly instead.

### Prerequisites

- **Node.js** >= 18
- **pnpm** (recommended) or npm
- **PostgreSQL** 15+ with the **PostGIS** extension
- **Redis** 7+
- A **Mapbox** access token (free tier is sufficient for development)

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/p-l-otHole.git
cd p-l-otHole

# Install dependencies
pnpm install

# Copy the example environment file and fill in your values
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Seed the database with sample hazards (optional)
pnpm db:seed

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`. The API runs on `http://localhost:3000/api` (Next.js API routes) or `http://localhost:4000` if using a standalone Express server.

### Quick Setup Checklist (First 30 Minutes)

- [ ] Run the app locally and open the home page.
- [ ] Create one sample hazard record (real or seeded).
- [ ] Confirm it appears on map and detail page.
- [ ] Verify one API call from `docs/api.md` using cURL or Postman.
- [ ] Assign teammates to roles (UI, API, Data, QA/Docs, Demo).

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string with PostGIS |
| `REDIS_URL` | Redis connection string |
| `MAPBOX_ACCESS_TOKEN` | Mapbox public token for map rendering |
| `S3_BUCKET` | S3-compatible bucket name for image uploads |
| `S3_REGION` | Storage region |
| `S3_ACCESS_KEY_ID` | Storage access key |
| `S3_SECRET_ACCESS_KEY` | Storage secret key |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js session encryption |
| `NEXTAUTH_URL` | Canonical URL of the application |

---

## Contributing

We welcome contributions of all kinds -- bug reports, feature requests, documentation improvements, and code. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Issue and pull request workflow
- Branch naming and commit message conventions
- Local development setup
- Testing expectations
- Code review process

---

## Documentation

Detailed documentation lives in the [`docs/`](docs/) directory:

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | System design, service boundaries, and infrastructure diagrams |
| [API Reference](docs/api.md) | REST endpoints, auth, pagination, and example requests |
| [Data Model](docs/data_model.md) | Database schema, table definitions, and ER diagram |
| [Gamification](docs/gamification.md) | Reputation system, badges, leaderboards, and social features |
| [Governance](docs/governance.md) | Moderation policies, transparency commitments, and community oversight |
| [Roadmap](docs/roadmap.md) | Five-phase development plan with measurable milestones |

---

## Roadmap (Summary)

| Phase | Focus | Key Milestone |
|---|---|---|
| **1** | MVP Reporting Platform | Core report flow, map view, basic auth -- first 500 reports |
| **2** | Public Awareness Engine | Gamification, leaderboards, social sharing -- 5,000 users |
| **3** | Data Export & API Integrations | Public API, GeoJSON feeds, map provider proposals -- 50,000 reports |
| **4** | Civic Funding & Sponsorship | Crowdfunding per-hazard, sponsor badges, city partnership pilot |
| **5** | National Expansion Framework | Multi-city config, white-label toolkit, federal open-data alignment |

See [docs/roadmap.md](docs/roadmap.md) for the full breakdown.

---

## License

This project is licensed under the [MIT License](LICENSE).

Hazard data contributed to P(l)otHole is released under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

---

## Join the Movement

Every pothole has a story. Every story deserves a name. Every name creates pressure. Every bit of pressure gets closer to a fix.

**Report your first hazard. Name it something unforgettable. Watch the counter tick.**

[Get Started](#getting-started) | [View the API](docs/api.md) | [Read the Roadmap](docs/roadmap.md) | [Contribute](CONTRIBUTING.md)
