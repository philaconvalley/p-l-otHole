/**
 * Seed script — inserts sample Philadelphia hazards for local dev and demo.
 * Safe to run multiple times (upserts on slug).
 */
import { sql } from "./client.js";

const hazards = [
  {
    name: "The Fairmount Fissure",
    slug: "the-fairmount-fissure",
    description: "Long crack spanning both lanes near the park entrance.",
    type: "crack",
    lat: 39.9712,
    lng: -75.1832,
    repairStatus: "reported",
    cityCode: "PHL",
    severityScore: 45,
  },
  {
    name: "Lake Broad Street",
    slug: "lake-broad-street",
    description: "Water collects here after any rain. Axle-deep on a bad day.",
    type: "pothole",
    lat: 39.952,
    lng: -75.1638,
    repairStatus: "acknowledged",
    cityCode: "PHL",
    severityScore: 78,
  },
  {
    name: "The Manayunk Maw",
    slug: "the-manayunk-maw",
    description: "Sinkhole opening up near the canal path.",
    type: "sinkhole",
    lat: 40.0279,
    lng: -75.2246,
    repairStatus: "in_progress",
    cityCode: "PHL",
    severityScore: 91,
  },
  {
    name: "South Street Swallower",
    slug: "south-street-swallower",
    description: "Debris-filled trench from last winter's water main break.",
    type: "debris",
    lat: 39.9429,
    lng: -75.1628,
    repairStatus: "reported",
    cityCode: "PHL",
    severityScore: 62,
  },
  {
    name: "Passyunk Puddle Trap",
    slug: "passyunk-puddle-trap",
    description: "Drainage failure — permanent standing water hazard.",
    type: "drainage",
    lat: 39.9291,
    lng: -75.1719,
    repairStatus: "scheduled",
    cityCode: "PHL",
    severityScore: 55,
  },
];

// Roadmap phases
const roadmapPhases = [
  {
    number: 1,
    title: "Mobile-first MVP",
    timeline: "Months 1–6 · Pilot neighborhood, Philadelphia",
    status: "active",
    progress: 62,
  },
  {
    number: 2,
    title: "Passive impact detection",
    timeline: "Months 7–14 · Expanding to drivers, cyclists, and scooter riders",
    status: "upcoming",
    progress: 0,
  },
  {
    number: 3,
    title: "AI agent: automated city submission",
    timeline: "Months 15–24 · Every validated report submitted 24/7, without a moderator",
    status: "future",
    progress: 0,
  },
];

// Roadmap features (phase_number -> features)
const roadmapFeatures: Record<number, Array<{ title: string; description: string; status: string }>> = {
  1: [
    { title: "Interactive map with clustering", description: "Mapbox GL JS · severity-color pins · real-time updates", status: "shipped" },
    { title: "6-step reporting flow", description: "Photo → GPS → classify → name → severity → submit in under 2 min", status: "shipped" },
    { title: "EXIF GPS auto-extraction", description: "Location pulled from photo metadata · drag-to-adjust pin", status: "shipped" },
    { title: "Philadelphia Streets Dept fields", description: "Gas, water, interstate, trolley, bus route, lane type — all required fields captured", status: "shipped" },
    { title: "Community naming + voting", description: "Propose names · upvote/downvote · canonical name wins", status: "shipped" },
    { title: "Shame clock + pressure score", description: "Days-open counter · vote velocity (accelerating/steady/declining)", status: "shipped" },
    { title: "Severity distribution + repair status", description: "Visual breakdown of Low/Moderate/High/Critical votes · 5-stage repair strip", status: "shipped" },
    { title: "Authentication", description: "Email magic link + Google OAuth · anonymous reporting for guests", status: "shipped" },
    { title: "In-person verify (+15 pts)", description: "Physically confirm a hazard exists at the pinned location", status: "shipped" },
    { title: "City-ready 311 export", description: "GeoJSON · CSV · Philadelphia Streets Dept formatted report", status: "shipped" },
    { title: "Moderator dashboard", description: "Flag review · duplicate merge · manual city submission queues", status: "in_progress" },
    { title: "Gamification: XP + badges", description: "Streaks · neighborhood champion · level titles tied to Philly geography", status: "in_progress" },
    { title: "Civic Dashboard", description: "Neighborhood-level stats · repair rates · SLA breach tracking", status: "in_progress" },
    { title: "Leaderboard", description: "Top reporters · most-shamed hazards · Hall of Shame by days open", status: "in_progress" },
    { title: "Push notifications", description: "SLA breach alerts · status change · repair confirmation", status: "in_progress" },
    { title: "Shame sharing graphics", description: "Auto-generated shame clock image for Instagram, X, Nextdoor", status: "planned" },
    { title: "Ages 14–17 consent flow", description: "Parental consent gate · age-appropriate onboarding · anonymous default", status: "planned" },
    { title: "PWA offline mode", description: "Save drafts without connectivity · sync when back online", status: "planned" },
  ],
  2: [
    { title: "Background accelerometer monitoring", description: "Web Sensors API / Capacitor · zero-interaction while moving", status: "planned" },
    { title: "Impact detection algorithm", description: "Threshold + gyroscope confirmation + noise filter + duplicate suppression", status: "planned" },
    { title: "Drive Mode opt-in", description: "Consent-gated · privacy-first · no continuous GPS logging", status: "planned" },
    { title: "Cyclist & scooter profiles", description: "Adjusted thresholds for two-wheel dynamics", status: "planned" },
    { title: "Post-trip notification", description: "Draft review flow completable in under 60 seconds", status: "planned" },
    { title: "Trip summary card", description: '"You hit X impacts today" with bulk review option', status: "planned" },
  ],
  3: [
    { title: "Browser-use AI agent", description: "Claude Sonnet with session + credential management", status: "planned" },
    { title: "Philadelphia 311 auto-submission", description: "Form filling + photo upload + reference number capture", status: "planned" },
    { title: "Multi-agency routing", description: "PennDOT (interstates) · SEPTA (trolley/bus) · PGW/Water (emergencies)", status: "planned" },
    { title: "SLA clock automation", description: "Reference number triggers countdown · status polling for repair confirmation", status: "planned" },
    { title: "Admin monitoring dashboard", description: "Submission volume · success rate · failure reasons · portal change detection", status: "planned" },
  ],
};

// Changelog entries
const roadmapChangelog = [
  { phaseNumber: 1, title: "Severity distribution bars and repair status progress strip added to hazard detail page", publishedAt: "2026-03-15" },
  { phaseNumber: 1, title: "In-person verify feature launched — confirm a hazard at its GPS pin and boost its pressure score", publishedAt: "2026-03-12" },
  { phaseNumber: 1, title: "Vote velocity indicator now live — hazards display whether community attention is Accelerating, Steady, or Declining", publishedAt: "2026-03-08" },
  { phaseNumber: 1, title: "City-ready 311 export now generates a Philadelphia Streets Department-formatted report with all mandatory fields pre-filled", publishedAt: "2026-03-01" },
  { phaseNumber: 1, title: "EXIF GPS extraction shipped — photo location auto-populates the map pin with no manual entry required", publishedAt: "2026-02-18" },
  { phaseNumber: 2, title: "Phase 2 sensor research complete — algorithm design for accelerometer-based impact detection finalized and queued", publishedAt: "2026-02-10" },
];

async function seed() {
  // Seed hazards
  for (const h of hazards) {
    await sql`
      INSERT INTO hazards (
        name, slug, description, type, latitude, longitude, location,
        repair_status, city_code, severity_score
      ) VALUES (
        ${h.name},
        ${h.slug},
        ${h.description},
        ${h.type}::"HazardType",
        ${h.lat},
        ${h.lng},
        ST_SetSRID(ST_MakePoint(${h.lng}, ${h.lat}), 4326)::geography,
        ${h.repairStatus}::"RepairStatus",
        ${h.cityCode},
        ${h.severityScore}
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    console.log(`  seeded hazard: ${h.name}`);
  }

  // Seed roadmap phases
  const phaseIds: Record<number, string> = {};
  for (const [idx, p] of roadmapPhases.entries()) {
    const result = await sql<{ id: string }[]>`
      INSERT INTO roadmap_phases (number, title, timeline, status, progress, sort_order)
      VALUES (${p.number}, ${p.title}, ${p.timeline}, ${p.status}, ${p.progress}, ${idx})
      ON CONFLICT (number) DO UPDATE SET
        title = EXCLUDED.title,
        timeline = EXCLUDED.timeline,
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        updated_at = now()
      RETURNING id
    `;
    const row = result[0];
    if (row) {
      phaseIds[p.number] = row.id;
    }
    console.log(`  seeded phase: ${p.title}`);
  }

  // Seed roadmap features
  for (const [phaseNum, features] of Object.entries(roadmapFeatures)) {
    const phaseId = phaseIds[Number(phaseNum)];
    if (!phaseId) {
      console.log(`  skipping features for unknown phase ${phaseNum}`);
      continue;
    }
    for (const [idx, f] of features.entries()) {
      await sql`
        INSERT INTO roadmap_features (phase_id, title, description, status, sort_order)
        VALUES (${phaseId}, ${f.title}, ${f.description}, ${f.status}, ${idx})
        ON CONFLICT DO NOTHING
      `;
    }
    console.log(`  seeded ${features.length} features for phase ${phaseNum}`);
  }

  // Seed changelog
  for (const c of roadmapChangelog) {
    const phaseId = phaseIds[c.phaseNumber];
    if (!phaseId) {
      console.log(`  skipping changelog for unknown phase ${c.phaseNumber}`);
      continue;
    }
    await sql`
      INSERT INTO roadmap_changelog (phase_id, title, published_at)
      VALUES (${phaseId}, ${c.title}, ${c.publishedAt}::date)
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`  seeded ${roadmapChangelog.length} changelog entries`);

  console.log("Seed complete.");
  await sql.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
