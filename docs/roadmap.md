# Roadmap

P(l)otHole is developed in five sequential phases, each building on the infrastructure, community, and data gravity established by the preceding phase. Every phase defines concrete deliverables, measurable milestones, and success criteria that gate progression to the next stage.

## Hackathon Interpretation Guide

This roadmap is long-term. For hackathon teams, treat it as:

- **Now (demo):** Phase 1 core loop + one Phase 2 engagement feature.
- **Next (post-hackathon):** complete remaining Phase 2 and harden quality checks.
- **Later (scale):** move into full Phase 3+ integrations and funding/governance depth.

### Current Delivery Timeline

- **Development window:** 2-week implementation sprint.
- **Build day:** March 19 (coached integration, QA, and demo readiness).
- **Post-event path:** transition immediately into an open-source community project for PhilaConValley contributors.

## Suggested Team Milestone Ownership

- **Beginners:** QA scripts, docs, walkthroughs, and demo narration.
- **Intermediate:** UI workflows, endpoint integration, and profile/leaderboard views.
- **Advanced:** geospatial performance, caching, schema quality, and deployment reliability.

---

## Phase 1 -- MVP Reporting Platform

**Goal:** Ship a functional hazard-reporting web application that proves the core loop -- spot, snap, name, rank, track -- works at neighborhood scale.

### Deliverables

- **Interactive map view** powered by Mapbox GL JS with basic marker clustering.
- **Hazard report flow:** photo upload with EXIF-based GPS extraction, manual pin adjustment, hazard type selection, severity self-assessment, and free-text description.
- **Community naming:** propose a name at report time; simple upvote/downvote on names.
- **Basic authentication** via NextAuth.js (email magic link + OAuth providers).
- **Hazard detail pages** displaying photo, location, severity votes, days-open counter, and current status.
- **Admin moderation panel** for reviewing flagged reports, merging duplicates, and managing abuse.
- **PostgreSQL + PostGIS schema** implementing the core `hazards`, `users`, `votes`, and `reports` tables.
- **CI/CD pipeline** on GitHub Actions with lint, type-check, unit tests, and preview deployments on Vercel.

### Milestones

| Milestone | Target | Measurement |
|---|---|---|
| Schema and migration pipeline operational | Week 2 | All tables created, seed script runs cleanly |
| Map view renders sample hazards | Week 4 | Mapbox renders clustered markers from PostGIS query |
| End-to-end report submission | Week 6 | Authenticated user submits report with photo, appears on map |
| Community naming and voting functional | Week 8 | Users can propose, vote on, and see winning names |
| Admin moderation tools deployed | Week 10 | Moderators can flag, merge, and remove reports |
| **Phase 1 gate: 500 verified reports** | Week 12 | 500 unique, non-duplicate, GPS-validated reports in the database |

### Success Criteria

- Average report submission time under 90 seconds on mobile.
- Duplicate detection catches at least 70% of geospatially overlapping submissions.
- Zero unresolved moderation flags older than 48 hours.

---

## Phase 2 -- Public Awareness Engine

**Goal:** Layer gamification, leaderboards, and social sharing on top of the reporting platform to drive organic user growth and sustained engagement.

### Deliverables

- **Reputation point system** with base events, multipliers, caps, and decay as defined in [gamification.md](gamification.md).
- **Badge framework** (Spotter, Surveyor, Inspector, Commissioner) with automatic tier progression and public profile display.
- **Weekly "Worst Street" leaderboard** computed via the street burden score algorithm and cached in Redis.
- **Shareable hazard cards** with server-rendered OG images containing hazard name, severity, days-open counter, and vote count.
- **Social pressure indicators** on every hazard detail page: days-open counter, vote velocity graph, verification confidence bar, and resolution lag percentile.
- **Notification system** for status changes, badge unlocks, and leaderboard appearances (email + in-app).
- **Public user profiles** showing reputation score, badge collection, report history, and contribution heatmap.
- **Onboarding flow** guiding new users through their first report with contextual tooltips and a sample walkthrough.

### Milestones

| Milestone | Target | Measurement |
|---|---|---|
| Reputation engine processing events in real time | Week 14 | Point balances update within 5 seconds of qualifying event |
| Badge tiers awarding automatically | Week 16 | All four badge families granting correctly on threshold |
| Worst Street leaderboard live | Week 18 | Weekly recomputation publishes top 50 streets per city |
| OG image generation pipeline deployed | Week 20 | Hazard cards render and pass Open Graph validators |
| Social sharing drives measurable referral traffic | Week 22 | At least 10% of new sign-ups originate from shared cards |
| **Phase 2 gate: 5,000 registered users** | Week 24 | 5,000 accounts with at least one validated action |

### Success Criteria

- 30-day user retention rate above 25%.
- Average session includes at least 2 interactions (report, vote, comment, or share).
- Worst Street leaderboard generates at least 1 local media mention per target city.

---

## Phase 3 -- Data Export and API Integrations

**Goal:** Open the platform's data to external consumers -- journalists, researchers, civic hackers, and map providers -- through a stable public API and standardized export formats.

### Deliverables

- **Public REST API** (versioned, rate-limited, documented) exposing hazard CRUD, search-by-radius, user profiles, badge lookups, and leaderboard snapshots.
- **GeoJSON and CSV bulk export endpoints** with filtering by city, date range, hazard type, and status.
- **Webhook system** for real-time event subscriptions (new report, status change, severity threshold crossed).
- **Google Maps integration proposal:** publish KML/GeoJSON feeds importable as My Maps layers, generate deep links for individual hazard coordinates, and submit a Google Maps Platform Partner application.
- **OpenStreetMap contribution pipeline:** automated export of verified, resolved hazard data as OSM surface-quality tags, JOSM-compatible data feed, and Overpass API cross-referencing.
- **Developer portal** with interactive API docs (Swagger/OpenAPI), authentication guide, and usage examples.
- **Rate limiting and API key management** with tiered quotas (anonymous, registered, partner).
- **Data quality dashboard** tracking export freshness, schema validation pass rates, and consumer error rates.

### Milestones

| Milestone | Target | Measurement |
|---|---|---|
| Public API v1 deployed with full documentation | Week 28 | All endpoints return valid responses and Swagger spec passes linting |
| GeoJSON/CSV exports available for all cities | Week 30 | Bulk download completes in under 30 seconds for largest city dataset |
| Webhook subscriptions processing events | Week 32 | External consumers receive events within 10 seconds of occurrence |
| Google Maps KML feed published and importable | Week 34 | Feed loads correctly in Google My Maps with no validation errors |
| OSM contribution pipeline producing valid changesets | Week 36 | First batch of resolved hazard data submitted as OSM edits |
| **Phase 3 gate: 50,000 total reports** | Week 38 | 50,000 unique, validated reports across all cities |

### Success Criteria

- API uptime above 99.5% over any rolling 30-day window.
- At least 50 registered API consumers (developers, newsrooms, civic orgs).
- At least 3 external projects or publications cite P(l)otHole data.

---

## Phase 4 -- Civic Funding and Sponsorship

**Goal:** Introduce sustainable funding mechanisms that let communities directly fund hazard repairs and let sponsors support civic infrastructure transparency.

### Deliverables

- **Per-hazard crowdfunding:** users pledge micro-donations toward specific hazard repairs, with funds held in escrow until a verified fix is confirmed.
- **Sponsor badges:** businesses and organizations can sponsor hazard remediation and receive branded recognition on the hazard card, leaderboard, and resolved-hazard page.
- **City partnership pilot program:** formal agreements with 1-3 municipal governments to integrate P(l)otHole data into their work-order systems, with bidirectional status sync.
- **Fiscal transparency dashboard:** real-time public ledger showing funds raised, disbursed, and held per hazard and per city.
- **Tax receipt generation** for qualifying donations (integration with a fiscal sponsor or 501(c)(3) partner).
- **Matching fund campaigns:** time-limited campaigns where sponsor contributions match community pledges up to a cap.
- **Impact reports:** automated quarterly summaries showing funds raised, hazards resolved, average resolution time improvement, and community growth per city.

### Milestones

| Milestone | Target | Measurement |
|---|---|---|
| Crowdfunding escrow flow operational | Week 42 | Users can pledge, funds are held, and release triggers on verified resolution |
| First sponsor badge displayed on a resolved hazard | Week 44 | Sponsor branding renders on hazard card and OG image |
| City partnership pilot signed with first municipality | Week 48 | Signed MOU and bidirectional status API connected |
| Fiscal transparency dashboard live | Week 50 | All fund flows visible in public ledger within 24 hours of transaction |
| First matching fund campaign completed | Week 52 | Campaign hits at least 50% of its match cap |
| **Phase 4 gate: 3 active city partnerships** | Week 56 | 3 municipalities with live bidirectional data integration |

### Success Criteria

- At least $10,000 in community-funded repairs disbursed and verified.
- Sponsor program sustains platform operating costs for at least one quarter.
- City partners report measurable reduction in average hazard resolution time (target: 20% improvement).

---

## Phase 5 -- National Expansion Framework

**Goal:** Generalize the platform into a repeatable, multi-city toolkit that any community or municipality can deploy, and align with federal open-data standards for maximum civic impact.

### Deliverables

- **Multi-city configuration system:** tenant-aware data isolation, per-city moderation teams, localized leaderboards, and city-specific branding overrides.
- **White-label toolkit:** a deployable package that civic organizations or municipalities can self-host with their own branding, connected to the shared national dataset or running fully independent.
- **Federal open-data alignment:** export formats compatible with the U.S. DOT National Bridge Inventory schema, FHWA Highway Performance Monitoring System, and other relevant federal datasets; metadata tags enabling cross-referencing with federal infrastructure databases.
- **Landmark recognition campaign:** formalize the process of submitting high-profile, community-named hazards to Google Maps, Apple Maps, and OpenStreetMap as labeled points of interest.
- **Accessibility and localization:** full WCAG 2.1 AA compliance, multi-language support starting with English and Spanish, and screen-reader-optimized map interactions.
- **National analytics dashboard:** aggregated view of hazard density, resolution rates, funding flows, and civic engagement across all participating cities.
- **Open-source governance charter:** formalize maintainer roles, RFC process for protocol changes, and community voting on platform-wide policy decisions.

### Milestones

| Milestone | Target | Measurement |
|---|---|---|
| Multi-city tenant system operational | Week 60 | 3+ cities running with isolated data, moderation, and leaderboards |
| White-label package published and documented | Week 64 | At least 1 external organization deploys from the package |
| Federal data export formats passing validation | Week 68 | Exports accepted by at least one federal data portal without manual correction |
| First community-named hazard appears on a mainstream map provider | Week 72 | Verified appearance as a labeled POI on Google Maps, Apple Maps, or OSM |
| Multi-language support live | Week 74 | English and Spanish fully translated with RTL-ready architecture |
| **Phase 5 gate: 20 active cities** | Week 78 | 20 cities with active reporting communities and at least 100 reports each |

### Success Criteria

- White-label deployments operate independently with less than 4 hours of setup time.
- National dataset exceeds 500,000 validated reports.
- At least one federal agency references or links to P(l)otHole data in an official capacity.
- Community governance charter ratified by elected moderators from at least 10 cities.

---

## Cross-Phase Principles

These principles apply throughout every phase and inform prioritization decisions when trade-offs arise.

- **Data quality over data volume.** A smaller dataset with high validation rates is more valuable than a large, noisy one. Every feature that increases volume must include a corresponding quality safeguard.
- **Transparency by default.** All platform metrics, moderation actions, fund flows, and scoring algorithms are public and auditable. If a decision cannot be explained publicly, it should not be made.
- **Community ownership.** The platform serves residents, not institutions. Governance, moderation, and policy decisions progressively shift toward elected community representatives.
- **Incremental delivery.** Each phase ships usable value independently. If a later phase is never reached, the platform remains useful at the level achieved.
- **Open-source sustainability.** Code, data, and documentation are open. Sustainability comes from sponsorship, partnerships, and community stewardship -- never from restricting access to civic data.
