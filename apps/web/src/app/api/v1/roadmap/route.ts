export const dynamic = "force-dynamic";

import { apiSuccess } from "@/lib/api";

// Static roadmap data (matches the page component)
// TODO: Replace with database queries after running migrations:
//   pnpm db:migrate && pnpm db:seed
// Then uncomment the Prisma queries below

const PHASES = [
  {
    number: 1,
    title: "Mobile-first MVP",
    timeline: "Months 1–6 · Pilot neighborhood, Philadelphia",
    status: "active" as const,
    progress: 62,
    features: [
      { title: "Interactive map with clustering", description: "Mapbox GL JS · severity-color pins · real-time updates", status: "shipped" as const },
      { title: "6-step reporting flow", description: "Photo → GPS → classify → name → severity → submit in under 2 min", status: "shipped" as const },
      { title: "EXIF GPS auto-extraction", description: "Location pulled from photo metadata · drag-to-adjust pin", status: "shipped" as const },
      { title: "Philadelphia Streets Dept fields", description: "Gas, water, interstate, trolley, bus route, lane type — all required fields captured", status: "shipped" as const },
      { title: "Community naming + voting", description: "Propose names · upvote/downvote · canonical name wins", status: "shipped" as const },
      { title: "Shame clock + pressure score", description: "Days-open counter · vote velocity (accelerating/steady/declining)", status: "shipped" as const },
      { title: "Severity distribution + repair status", description: "Visual breakdown of Low/Moderate/High/Critical votes · 5-stage repair strip", status: "shipped" as const },
      { title: "Authentication", description: "Email magic link + Google OAuth · anonymous reporting for guests", status: "shipped" as const },
      { title: "In-person verify (+15 pts)", description: "Physically confirm a hazard exists at the pinned location", status: "shipped" as const },
      { title: "City-ready 311 export", description: "GeoJSON · CSV · Philadelphia Streets Dept formatted report", status: "shipped" as const },
      { title: "Moderator dashboard", description: "Flag review · duplicate merge · manual city submission queues", status: "in_progress" as const },
      { title: "Gamification: XP + badges", description: "Streaks · neighborhood champion · level titles tied to Philly geography", status: "in_progress" as const },
      { title: "Civic Dashboard", description: "Neighborhood-level stats · repair rates · SLA breach tracking", status: "in_progress" as const },
      { title: "Leaderboard", description: "Top reporters · most-shamed hazards · Hall of Shame by days open", status: "in_progress" as const },
      { title: "Push notifications", description: "SLA breach alerts · status change · repair confirmation", status: "in_progress" as const },
      { title: "Shame sharing graphics", description: "Auto-generated shame clock image for Instagram, X, Nextdoor", status: "planned" as const },
      { title: "Ages 14–17 consent flow", description: "Parental consent gate · age-appropriate onboarding · anonymous default", status: "planned" as const },
      { title: "PWA offline mode", description: "Save drafts without connectivity · sync when back online", status: "planned" as const },
    ],
  },
  {
    number: 2,
    title: "Passive impact detection",
    timeline: "Months 7–14 · Expanding to drivers, cyclists, and scooter riders",
    status: "upcoming" as const,
    progress: 0,
    features: [
      { title: "Background accelerometer monitoring", description: "Web Sensors API / Capacitor · zero-interaction while moving", status: "planned" as const },
      { title: "Impact detection algorithm", description: "Threshold + gyroscope confirmation + noise filter + duplicate suppression", status: "planned" as const },
      { title: "Drive Mode opt-in", description: "Consent-gated · privacy-first · no continuous GPS logging", status: "planned" as const },
      { title: "Cyclist & scooter profiles", description: "Adjusted thresholds for two-wheel dynamics", status: "planned" as const },
      { title: "Post-trip notification", description: "Draft review flow completable in under 60 seconds", status: "planned" as const },
      { title: "Trip summary card", description: '"You hit X impacts today" with bulk review option', status: "planned" as const },
    ],
  },
  {
    number: 3,
    title: "AI agent: automated city submission",
    timeline: "Months 15–24 · Every validated report submitted 24/7, without a moderator",
    status: "future" as const,
    progress: 0,
    features: [
      { title: "Browser-use AI agent", description: "Claude Sonnet with session + credential management", status: "planned" as const },
      { title: "Philadelphia 311 auto-submission", description: "Form filling + photo upload + reference number capture", status: "planned" as const },
      { title: "Multi-agency routing", description: "PennDOT (interstates) · SEPTA (trolley/bus) · PGW/Water (emergencies)", status: "planned" as const },
      { title: "SLA clock automation", description: "Reference number triggers countdown · status polling for repair confirmation", status: "planned" as const },
      { title: "Admin monitoring dashboard", description: "Submission volume · success rate · failure reasons · portal change detection", status: "planned" as const },
    ],
  },
];

const CHANGELOG = [
  { title: "Severity distribution bars and repair status progress strip added to hazard detail page", publishedAt: "2026-03-15", phaseNumber: 1 },
  { title: "In-person verify feature launched — confirm a hazard at its GPS pin and boost its pressure score", publishedAt: "2026-03-12", phaseNumber: 1 },
  { title: "Vote velocity indicator now live — hazards display whether community attention is Accelerating, Steady, or Declining", publishedAt: "2026-03-08", phaseNumber: 1 },
  { title: "City-ready 311 export now generates a Philadelphia Streets Department-formatted report with all mandatory fields pre-filled", publishedAt: "2026-03-01", phaseNumber: 1 },
  { title: "EXIF GPS extraction shipped — photo location auto-populates the map pin with no manual entry required", publishedAt: "2026-02-18", phaseNumber: 1 },
  { title: "Phase 2 sensor research complete — algorithm design for accelerometer-based impact detection finalized and queued", publishedAt: "2026-02-10", phaseNumber: 2 },
];

// GET /api/v1/roadmap - Get all roadmap data
export async function GET() {
  // Calculate stats
  const totalFeatures = PHASES.reduce((sum, p) => sum + p.features.length, 0);
  const shipped = PHASES.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "shipped").length,
    0
  );
  const inProgress = PHASES.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "in_progress").length,
    0
  );
  const planned = PHASES.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "planned").length,
    0
  );

  const data = {
    phases: PHASES.map((p) => ({
      number: p.number,
      title: p.title,
      timeline: p.timeline,
      status: p.status,
      progress: p.progress,
      features: p.features.map((f) => ({
        title: f.title,
        description: f.description,
        status: f.status,
      })),
    })),
    changelog: CHANGELOG.map((c) => ({
      title: c.title,
      publishedAt: c.publishedAt,
      phaseNumber: c.phaseNumber,
    })),
    stats: {
      totalFeatures,
      shipped,
      inProgress,
      planned,
      currentPhase: PHASES.find((p) => p.status === "active")?.number ?? 1,
      horizonMonths: 24,
    },
  };

  return apiSuccess(data);
}
