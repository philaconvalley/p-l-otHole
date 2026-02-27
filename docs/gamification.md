# Gamification

P(l)otHole uses gamification to reward useful civic contributions while keeping incentives aligned with data quality and public accountability. This document defines the point economy, badge framework, leaderboard logic, and social-pressure indicators used across the platform.

## Design Principles

- Reward high-signal behavior (accurate reports, meaningful verification, constructive moderation).
- Prevent spam by weighting quality and introducing caps for low-value repetitive actions.
- Keep scoring transparent so users and cities can understand how reputation is earned.
- Encourage local collaboration instead of pure competition through team and street-level outcomes.

## Reputation Point System

Reputation is an aggregate score that updates in near real time and can decrease when contributions are reversed or rejected.

### Base Events and Point Values

| Event | Points | Notes |
|---|---:|---|
| Submit new hazard report | +10 | Awarded after duplicate and GPS validation pass |
| Submit hazard report accepted by moderation | +15 | Bonus for quality report accepted as canonical |
| Upvote/downvote existing hazard | +2 | Limited by daily cap |
| Verification vote aligned with final resolution | +8 | Rewards consensus accuracy over volume |
| Add useful evidence comment | +5 | Comment must pass moderation checks |
| Upload image that passes verification | +6 | Additional +4 if used in civic export bundle |
| Hazard name accepted as primary label | +12 | Naming contest contribution |
| Duplicate report merged into existing hazard | -4 | Soft penalty to reduce duplicate spam |
| Report flagged as abuse or fabricated | -30 | Severe integrity penalty |
| Moderator-confirmed false verification | -12 | Penalty for manipulative voting |

### Multipliers and Caps

- **Daily action cap:** voting and low-effort interactions stop earning points after 100 reputation/day.
- **Streak multiplier:** +5% weekly multiplier for each consecutive week with at least 3 validated contributions (max +25%).
- **First-in-area bonus:** +20% on accepted reports in underserved map tiles with low reporting density.
- **Quality decay:** repeated rejected submissions temporarily reduce earned points by 10-40% until recovery.

### Reputation Formula

At score refresh time, a user's reputation can be represented as:

```text
reputation_score =
  sum(validated_event_points * trust_multiplier * location_multiplier)
  + streak_bonus
  - penalties
```

Where:

- `trust_multiplier` starts at `1.0` and trends between `0.7` and `1.3` based on historical acceptance ratio.
- `location_multiplier` ranges from `1.0` to `1.2` for underserved areas.
- `penalties` include abuse findings, duplicate-heavy behavior, and moderation sanctions.

## Badge Tiers

Badges are designed as progressive tiers that map to both activity volume and contribution quality.

### Core Badge Families

#### Spotter (Reporting)

- **Spotter I:** 10 accepted hazard reports.
- **Spotter II:** 50 accepted hazard reports.
- **Spotter III:** 200 accepted hazard reports with less than 10% duplicate rate.

#### Surveyor (Verification)

- **Surveyor I:** 25 verification votes that align with final outcomes.
- **Surveyor II:** 150 aligned verification votes with at least 70% alignment rate.
- **Surveyor III:** 500 aligned votes with at least 80% alignment rate.

#### Inspector (Evidence Quality)

- **Inspector I:** 20 verified photo uploads.
- **Inspector II:** 100 verified photo uploads with geotag consistency.
- **Inspector III:** 300 verified uploads used in city-facing exports.

#### Commissioner (Community Impact)

- **Commissioner I:** 3 hazards tracked from report to resolved state.
- **Commissioner II:** 15 tracked-to-resolution hazards plus constructive moderation history.
- **Commissioner III:** 50 tracked-to-resolution hazards and zero abuse penalties over 6 months.

### Badge Rules

- Users can hold multiple badge families simultaneously.
- Tier upgrades are automatic and irreversible unless fraud is confirmed.
- Public profiles display highest tier per family plus date earned.
- Certain civic partnership programs can require minimum badge tiers for participation.

## Weekly "Worst Street" Leaderboard

The "Worst Street" leaderboard highlights streets with the highest unresolved hazard burden and engagement pressure.

### Inputs

- Count of unresolved hazards on the same street segment.
- Combined severity score for those hazards.
- Net community vote intensity.
- Average days-open for unresolved hazards.
- Recent vote velocity (last 7 days).

### Street Burden Score

Each week, every street segment receives a weighted score:

```text
street_burden_score =
  (unresolved_count * 0.35)
  + (severity_sum_normalized * 0.25)
  + (days_open_average_normalized * 0.20)
  + (vote_velocity_normalized * 0.15)
  + (civic_attention_normalized * 0.05)
```

- Scores are normalized per city to avoid large-city bias.
- Streets need at least 3 unresolved hazards to be eligible.
- Ties are broken by highest median severity, then highest 7-day vote growth.

### Publication Rules

- Recomputed weekly on Monday 00:00 local city time.
- Store top 50 segments per city for public pages and API access.
- Archive historical snapshots for trend lines and accountability reporting.

## Shareable Hazard Cards (OG Image Generation)

Each high-engagement hazard can generate a social-ready card for sharing on social platforms and messaging apps.

### Card Contents

- Hazard name and type.
- Approximate location label (street + district, privacy-safe).
- Severity indicator and days-open counter.
- Vote count and "watching" activity.
- P(l)otHole branding plus QR/link back to hazard page.

### Generation Pipeline

1. Trigger card generation when a hazard crosses an engagement threshold (for example, 25 votes or 7 days unresolved).
2. Render an OG image template server-side with cached map snippet and key stats.
3. Store output in object storage and expose signed/public URL based on policy.
4. Refresh card when critical metrics materially change (status, severity, vote milestones).

## Social Pressure Indicators

Social pressure metrics keep unresolved hazards visible and increase civic urgency without targeting individuals.

### Key Indicators

- **Days-open counter:** prominently shows elapsed time since report creation.
- **Vote velocity:** displays recent vote acceleration as a momentum signal.
- **Verification confidence:** confidence bar for community agreement on hazard status/severity.
- **Resolution lag rank:** percentile showing how slowly a hazard is being addressed compared with city median.

### Display Policy

- Indicators appear on hazard detail pages, map popovers, and leaderboard cards.
- Public dashboards aggregate indicators by neighborhood and street segment.
- All indicators are derived from auditable, open metrics to preserve credibility.

## Naming Visibility Ranking

Users can propose names for notable hazards, and naming visibility is ranked to surface the most community-supported label.

### Ranking Signals

- Net votes on each proposed name.
- Unique voter count (anti-sybil weighted).
- Recency decay (recent support weighted slightly higher).
- Reporter and verifier trust-weight adjustments.
- Moderation safety checks (blocklist and abuse filters).

### Name Score Formula

```text
name_visibility_score =
  (net_votes * 0.45)
  + (unique_voters_weighted * 0.30)
  + (trust_adjusted_support * 0.15)
  + (recency_factor * 0.10)
  - moderation_penalties
```

- Highest scoring eligible name is displayed as the primary hazard label.
- Alternate names remain visible in history for transparency.
- Moderators can freeze naming for disputed or sensitive hazards.

## Anti-Abuse and Fairness Controls

- Rate limits on votes, comments, and naming submissions.
- Duplicate detection with geospatial + image similarity checks.
- Reputation penalties for coordinated manipulation attempts.
- Periodic fairness review of scoring outcomes by geography and user cohort.
- Full audit logs for badge grants, leaderboard changes, and moderation overrides.

## Implementation Notes

- Keep scoring logic deterministic and versioned to preserve historical comparability.
- Recompute heavy aggregates asynchronously via scheduled/background jobs.
- Cache weekly leaderboard outputs in Redis for fast public reads.
- Expose reputation and badge events through the public data export surface where policy allows.
