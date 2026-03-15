"use client";

import { useState } from "react";
import { ChevronDown, Check, Circle, ExternalLink, Github, GitPullRequest, Bug, Lightbulb } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeatureStatus = "shipped" | "in_progress" | "planned";

interface Feature {
  title: string;
  description: string;
  status: FeatureStatus;
}

interface Phase {
  number: number;
  title: string;
  timeline: string;
  badge: "Active now" | "Upcoming" | "Future";
  progress: number;
  features: Feature[];
}

interface ChangelogEntry {
  title: string;
  date: string;
  phase: number;
}

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const STATS = {
  currentPhase: 1,
  featuresShipped: 18,
  inProgress: 9,
  horizonMonths: 24,
  overallProgress: 31,
};

const PHASES: Phase[] = [
  {
    number: 1,
    title: "Mobile-first MVP",
    timeline: "Months 1–6 · Pilot neighborhood, Philadelphia",
    badge: "Active now",
    progress: 62,
    features: [
      {
        title: "Interactive map with clustering",
        description: "Mapbox GL JS · severity-color pins · real-time updates",
        status: "shipped",
      },
      {
        title: "6-step reporting flow",
        description: "Photo → GPS → classify → name → severity → submit in under 2 min",
        status: "shipped",
      },
      {
        title: "EXIF GPS auto-extraction",
        description: "Location pulled from photo metadata · drag-to-adjust pin",
        status: "shipped",
      },
      {
        title: "Philadelphia Streets Dept fields",
        description: "Gas, water, interstate, trolley, bus route, lane type — all required fields captured",
        status: "shipped",
      },
      {
        title: "Community naming + voting",
        description: "Propose names · upvote/downvote · canonical name wins",
        status: "shipped",
      },
      {
        title: "Shame clock + pressure score",
        description: "Days-open counter · vote velocity (accelerating/steady/declining)",
        status: "shipped",
      },
      {
        title: "Severity distribution + repair status",
        description: "Visual breakdown of Low/Moderate/High/Critical votes · 5-stage repair strip",
        status: "shipped",
      },
      {
        title: "Authentication",
        description: "Email magic link + Google OAuth · anonymous reporting for guests",
        status: "shipped",
      },
      {
        title: "In-person verify (+15 pts)",
        description: "Physically confirm a hazard exists at the pinned location",
        status: "shipped",
      },
      {
        title: "City-ready 311 export",
        description: "GeoJSON · CSV · Philadelphia Streets Dept formatted report",
        status: "shipped",
      },
      {
        title: "Moderator dashboard",
        description: "Flag review · duplicate merge · manual city submission queues",
        status: "in_progress",
      },
      {
        title: "Gamification: XP + badges",
        description: "Streaks · neighborhood champion · level titles tied to Philly geography",
        status: "in_progress",
      },
      {
        title: "Civic dashboard",
        description: "Neighborhood-level stats · repair rates · SLA breach tracking",
        status: "in_progress",
      },
      {
        title: "Leaderboard",
        description: "Top reporters · most-shamed hazards · Hall of Shame by days open",
        status: "in_progress",
      },
      {
        title: "Push notifications",
        description: "SLA breach alerts · status change · repair confirmation",
        status: "in_progress",
      },
      {
        title: "Shame sharing graphics",
        description: "Auto-generated shame clock image for Instagram, X, Nextdoor",
        status: "planned",
      },
      {
        title: "Ages 14–17 consent flow",
        description: "Parental consent gate · age-appropriate onboarding · anonymous default",
        status: "planned",
      },
      {
        title: "PWA offline mode",
        description: "Save drafts without connectivity · sync when back online",
        status: "planned",
      },
    ],
  },
  {
    number: 2,
    title: "Passive impact detection",
    timeline: "Months 7–14 · Expanding to drivers, cyclists, and scooter riders",
    badge: "Upcoming",
    progress: 0,
    features: [
      {
        title: "Background accelerometer monitoring",
        description: "Web Sensors API / Capacitor · zero-interaction while moving",
        status: "planned",
      },
      {
        title: "Impact detection algorithm",
        description: "Threshold + gyroscope confirmation + noise filter + duplicate suppression",
        status: "planned",
      },
      {
        title: "Drive Mode opt-in",
        description: "Consent-gated · privacy-first · no continuous GPS logging",
        status: "planned",
      },
      {
        title: "Cyclist & scooter profiles",
        description: "Adjusted thresholds for two-wheel dynamics",
        status: "planned",
      },
      {
        title: "Post-trip notification",
        description: "Draft review flow completable in under 60 seconds",
        status: "planned",
      },
      {
        title: "Trip summary card",
        description: '"You hit X impacts today" with bulk review option',
        status: "planned",
      },
    ],
  },
  {
    number: 3,
    title: "AI agent: automated city submission",
    timeline: "Months 15–24 · Every validated report submitted 24/7, without a moderator",
    badge: "Future",
    progress: 0,
    features: [
      {
        title: "Browser-use AI agent",
        description: "Claude Sonnet with session + credential management",
        status: "planned",
      },
      {
        title: "Philadelphia 311 auto-submission",
        description: "Form filling + photo upload + reference number capture",
        status: "planned",
      },
      {
        title: "Multi-agency routing",
        description: "PennDOT (interstates) · SEPTA (trolley/bus) · PGW/Water (emergencies)",
        status: "planned",
      },
      {
        title: "SLA clock automation",
        description: "Reference number triggers countdown · status polling for repair confirmation",
        status: "planned",
      },
      {
        title: "Admin monitoring dashboard",
        description: "Submission volume · success rate · failure reasons · portal change detection",
        status: "planned",
      },
    ],
  },
];

const CHANGELOG: ChangelogEntry[] = [
  {
    title: "Severity distribution bars and repair status progress strip added to hazard detail page",
    date: "Mar 15, 2026",
    phase: 1,
  },
  {
    title: 'In-person verify feature launched — confirm a hazard at its GPS pin and boost its pressure score',
    date: "Mar 12, 2026",
    phase: 1,
  },
  {
    title: "Vote velocity indicator now live — hazards display whether community attention is Accelerating, Steady, or Declining",
    date: "Mar 8, 2026",
    phase: 1,
  },
  {
    title: "City-ready 311 export now generates a Philadelphia Streets Department-formatted report with all mandatory fields pre-filled",
    date: "Mar 1, 2026",
    phase: 1,
  },
  {
    title: "EXIF GPS extraction shipped — photo location auto-populates the map pin with no manual entry required",
    date: "Feb 18, 2026",
    phase: 1,
  },
  {
    title: "Phase 2 sensor research complete — algorithm design for accelerometer-based impact detection finalized and queued",
    date: "Feb 10, 2026",
    phase: 2,
  },
];

const FAQ: FAQItem[] = [
  {
    question: "Why are you building in phases rather than all at once?",
    answer:
      "Each phase validates a core assumption before we invest in the next. Phase 1 proves community engagement works. Phase 2 proves passive detection is accurate enough. Phase 3 proves automation at scale. Building all at once would risk wasting effort on features that don\u2019t work in practice.",
  },
  {
    question: "Who controls what gets submitted to the city?",
    answer:
      "In Phase 1, trained moderators review and submit reports manually. In Phase 3, an AI agent submits automatically — but only reports that have been validated by a human moderator first. The AI never invents or embellishes content.",
  },
  {
    question: "How does the passive impact detection work — what data does it collect?",
    answer:
      "Drive Mode uses your phone\u2019s accelerometer and gyroscope to detect sudden impacts consistent with hitting a pothole. GPS coordinates are only stored at the moment of impact — we never log your location continuously. All sensor processing happens on your device; only the derived impact event is transmitted.",
  },
  {
    question: "Can I use the platform without creating an account?",
    answer:
      "Yes. You can submit anonymous reports without signing up. Creating an account unlocks features like following hazards, earning XP, and appearing on the leaderboard — but it\u2019s never required.",
  },
  {
    question: "When will Phase 2 launch?",
    answer:
      "Phase 2 is scheduled to begin after Phase 1 success criteria are met — roughly 6 months after the pilot launch. We\u2019ll announce the exact date here and on our social channels when we\u2019re ready.",
  },
  {
    question: "How can I contribute to P(l)otHole?",
    answer: (
      <div className="space-y-4">
        <p className="text-[#888]">
          P(l)otHole is open-source under ODbL. We welcome contributions from developers, designers, and civic advocates.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/philaconvalley/p-l-otHole/issues/new?template=bug_report.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#222] rounded-lg border border-[#333] hover:border-[#F99300]/50 transition-colors text-sm"
          >
            <Bug className="w-4 h-4 text-[#888]" />
            <span className="text-white">Report a bug</span>
          </a>
          <a
            href="https://github.com/philaconvalley/p-l-otHole/issues/new?template=feature_request.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#222] rounded-lg border border-[#333] hover:border-[#F99300]/50 transition-colors text-sm"
          >
            <Lightbulb className="w-4 h-4 text-[#888]" />
            <span className="text-white">Request a feature</span>
          </a>
          <a
            href="https://github.com/philaconvalley/p-l-otHole/pulls"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#222] rounded-lg border border-[#333] hover:border-[#F99300]/50 transition-colors text-sm"
          >
            <GitPullRequest className="w-4 h-4 text-[#888]" />
            <span className="text-white">Submit a PR</span>
          </a>
          <a
            href="https://github.com/philaconvalley/p-l-otHole"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-[#171717] rounded-lg font-medium hover:bg-[#eee] transition-colors text-sm"
          >
            <Github className="w-4 h-4" />
            <span>View on GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: FeatureStatus }) {
  if (status === "shipped") {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="w-5 h-5 rounded-full bg-[#F99300] flex items-center justify-center flex-shrink-0">
        <Circle className="w-2.5 h-2.5 text-white fill-white" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border-2 border-[#555] flex items-center justify-center flex-shrink-0">
      <Circle className="w-2 h-2 text-[#555] fill-[#555]" />
    </div>
  );
}

function StatusBadge({ status }: { status: FeatureStatus }) {
  const styles = {
    shipped: "bg-emerald-500/20 text-emerald-400",
    in_progress: "bg-[#F99300]/20 text-[#F99300]",
    planned: "bg-[#333] text-[#888]",
  };
  const labels = {
    shipped: "Shipped",
    in_progress: "In progress",
    planned: "Planned",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function PhaseBadge({ badge }: { badge: Phase["badge"] }) {
  const styles = {
    "Active now": "bg-[#F99300] text-white",
    Upcoming: "bg-[#333] text-[#aaa]",
    Future: "bg-[#222] text-[#666] border border-[#333]",
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[badge]}`}>
      {badge}
    </span>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-4 flex gap-3 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
      <StatusIcon status={feature.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-white leading-tight">{feature.title}</h4>
        </div>
        <p className="text-xs text-[#888] mt-1 leading-relaxed">{feature.description}</p>
        <div className="mt-2">
          <StatusBadge status={feature.status} />
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ phase, defaultOpen = false }: { phase: Phase; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const shipped = phase.features.filter((f) => f.status === "shipped").length;
  const inProgress = phase.features.filter((f) => f.status === "in_progress").length;
  const planned = phase.features.filter((f) => f.status === "planned").length;

  return (
    <div className="bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#222] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#F99300] flex items-center justify-center text-sm font-bold text-white">
            {phase.number}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#F99300] uppercase tracking-wider">
                Phase {phase.number}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mt-0.5">{phase.title}</h3>
            <p className="text-sm text-[#888] mt-0.5">{phase.timeline}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PhaseBadge badge={phase.badge} />
          <ChevronDown
            className={`w-5 h-5 text-[#888] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-[#2a2a2a]">
          {/* Progress bar */}
          {phase.progress > 0 && (
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-between text-xs text-[#888] mb-2">
                <span>Phase progress</span>
                <span className="text-white font-medium">{phase.progress}%</span>
              </div>
              <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F99300] rounded-full transition-all duration-500"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {phase.features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} />
            ))}
          </div>

          {/* Summary footer */}
          <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center gap-6 text-xs text-[#888]">
            <span>
              <span className="text-emerald-400 font-medium">{shipped}</span> shipped
            </span>
            <span>
              <span className="text-[#F99300] font-medium">{inProgress}</span> in progress
            </span>
            <span>
              <span className="text-[#666] font-medium">{planned}</span> planned
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChangelogItem({ entry }: { entry: ChangelogEntry }) {
  return (
    <div className="flex gap-4 py-3 border-b border-[#2a2a2a] last:border-0">
      <div className="w-2 h-2 rounded-full bg-[#F99300] mt-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#ddd] leading-relaxed">{entry.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs px-2 py-0.5 rounded bg-[#F99300]/20 text-[#F99300] font-medium">
            Phase {entry.phase}
          </span>
          <span className="text-xs text-[#666]">{entry.date}</span>
        </div>
      </div>
    </div>
  );
}

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#2a2a2a] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:text-[#F99300] transition-colors"
      >
        <span className="text-sm font-medium text-[#ddd] pr-4">{item.question}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#888] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pr-8">
          {typeof item.answer === "string" ? (
            <p className="text-sm text-[#888] leading-relaxed">{item.answer}</p>
          ) : (
            item.answer
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RoadmapPage() {
  const shippedCount = PHASES.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "shipped").length,
    0
  );
  const inProgressCount = PHASES.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "in_progress").length,
    0
  );
  const plannedCount = PHASES.reduce(
    (sum, p) => sum + p.features.filter((f) => f.status === "planned").length,
    0
  );
  const totalFeatures = shippedCount + inProgressCount + plannedCount;
  const overallProgress = Math.round((shippedCount / totalFeatures) * 100);

  return (
    <main className="min-h-screen bg-[#171717]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <section className="mb-10">
          <p className="text-xs font-semibold text-[#F99300] uppercase tracking-wider mb-2">
            Public Roadmap
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            <span className="line-through text-[#666] decoration-[#666]">Building in the open.</span>
            <br />
            No closed queues here.
          </h1>
          <p className="mt-4 text-[#888] max-w-2xl leading-relaxed">
            We believe civic tech should be as transparent as the accountability it demands. Here&#39;s
            exactly what we&#39;re building, where we are, and what&#39;s coming next.
          </p>
        </section>

        {/* Stats bar */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F99300] rounded-full">
              <span className="text-sm font-semibold text-white">Phase {STATS.currentPhase}</span>
              <span className="text-xs text-white/70">Currently active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#222] rounded-full border border-[#333]">
              <span className="text-sm font-semibold text-white">{shippedCount}</span>
              <span className="text-xs text-[#888]">Features shipped</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#222] rounded-full border border-[#333]">
              <span className="text-sm font-semibold text-white">{inProgressCount}</span>
              <span className="text-xs text-[#888]">In progress</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#222] rounded-full border border-[#333]">
              <span className="text-sm font-semibold text-white">{STATS.horizonMonths} mo</span>
              <span className="text-xs text-[#888]">Full roadmap horizon</span>
            </div>
          </div>
        </section>

        {/* Overall progress */}
        <section className="mb-10">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-[#888]">Overall platform completion</span>
            <span className="text-white font-semibold">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallProgress}%`,
                background: `linear-gradient(90deg, #22c55e ${(shippedCount / totalFeatures) * 100}%, #F99300 ${(shippedCount / totalFeatures) * 100}%)`,
              }}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-[#888]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Shipped</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F99300]" />
              <span>In progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#444]" />
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-[#444]" />
              <span>Future phase</span>
            </div>
          </div>
        </section>

        {/* Phase cards */}
        <section className="space-y-4 mb-16">
          {PHASES.map((phase, idx) => (
            <PhaseCard key={phase.number} phase={phase} defaultOpen={idx === 0} />
          ))}
        </section>

        {/* Phase 1 goal callout */}
        <section className="mb-16 p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
          <h3 className="text-sm font-semibold text-[#F99300] uppercase tracking-wider mb-2">
            Phase 1 Goal
          </h3>
          <p className="text-[#ddd] leading-relaxed">
            <span className="font-semibold">500 active monthly reporters</span>,{" "}
            <span className="font-semibold">1,000 validated hazards</span>,{" "}
            <span className="font-semibold">80%</span> submitted to the city within 48 hours — in a
            single pilot neighborhood in Philadelphia.
          </p>
          <p className="text-sm text-[#888] mt-2">
            {shippedCount} shipped · {inProgressCount} in progress · {plannedCount} planned
          </p>
        </section>

        {/* Changelog */}
        <section className="mb-16">
          <h2 className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-4">
            Recent Updates
          </h2>
          <h3 className="text-lg font-semibold text-white mb-4">Changelog · Most Recent First</h3>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] px-6 py-2">
            {CHANGELOG.map((entry, idx) => (
              <ChangelogItem key={idx} entry={entry} />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-lg font-semibold text-white mb-4">Questions about the roadmap</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] px-6">
            {FAQ.map((item, idx) => (
              <FAQAccordion key={idx} item={item} />
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center py-8 border-t border-[#2a2a2a]">
          <p className="text-[#888] text-sm mb-4">
            Want to influence what we build next? Report a hazard and join the community.
          </p>
          <a
            href="/report/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F99300] text-white font-semibold rounded-full hover:bg-[#e07e00] transition-colors"
          >
            <span>+</span>
            <span>Report a hazard</span>
          </a>
        </section>
      </div>
    </main>
  );
}
