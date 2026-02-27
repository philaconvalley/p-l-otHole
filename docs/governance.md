# Governance

P(l)otHole is a civic accountability platform, so governance is a product feature, not an afterthought. This document defines how content is moderated, how decisions are made visible, and how community oversight protects trust over time.

## Governance Principles

- **Public interest first:** policies exist to improve road safety outcomes, not to optimize engagement at all costs.
- **Transparency by default:** moderation and status decisions should be explainable and auditable.
- **Fair process:** users can contest enforcement actions through a documented appeal path.
- **Data integrity over virality:** reports should be accurate before they are amplified.
- **Non-partisan operation:** no endorsements, campaign activity, or party-aligned messaging in platform governance.

## Scope of Governed Content

Governance policies apply to:

- hazard names and descriptions
- uploaded images and media metadata
- comments and status updates
- votes, verification actions, and report edits
- moderator actions and administrative overrides

## Moderation Policy

### What Is Not Allowed

The following content is removed or restricted:

- hate speech, harassment, threats, and targeted abuse
- doxxing or personally identifying information unrelated to public infrastructure issues
- sexually explicit content, graphic violence unrelated to hazard context, or illegal content
- spam, coordinated manipulation, and bot-generated vote/report abuse
- defamatory or false statements presented as fact
- hazard names intended primarily to insult private individuals or protected groups

### Hazard Naming Standards

Hazard names are visible to the public and should remain memorable without becoming abusive.

- Names must reference location, shape, or observable hazard characteristics.
- Names cannot include slurs, profanity targeted at groups, or direct personal attacks.
- Satire is allowed when it does not cross abuse thresholds.
- If a name is removed, the hazard remains; only naming visibility is affected.

### Enforcement Ladder

Moderation follows escalating interventions:

1. **Soft intervention:** hide content temporarily pending review.
2. **Content action:** remove or edit violating text/media with reason code.
3. **Account action:** warning, temporary suspension, or permanent ban for repeated/severe abuse.
4. **Network safeguards:** rate limits, CAPTCHA gates, and anti-automation controls for coordinated abuse.

Severe safety violations (credible threats, illegal media) can skip directly to permanent enforcement and legal escalation.

### Community Flagging and Review

- Any authenticated user may flag content with a reason category.
- Flags are triaged by severity and confidence score.
- High-risk flags enter expedited moderator review queues.
- Duplicate flags are deduplicated to prevent brigading from inflating priority unfairly.
- Flag outcomes are logged with decision rationale and reviewer role.

### Appeals Process

Users may appeal moderation actions through a structured flow:

1. Submit appeal with optional context and evidence.
2. Secondary moderator review (different reviewer when possible).
3. Final disposition with written reason code.

Appeal outcomes update the public moderation log, excluding private personal data.

## Transparency Policy

### Public-by-Default Records

The platform publishes non-sensitive governance telemetry, including:

- moderation action counts by category and outcome
- median and percentile review times
- appeal volume and reversal rates
- status transition histories for hazards
- data export availability and schema changes

### Audit Logs

Every governance-relevant write action produces an append-only audit event:

- actor role (`user`, `moderator`, `system`)
- action type (create, edit, hide, remove, restore, status-change)
- target entity (`hazard`, `name`, `comment`, `vote`, `report`)
- timestamp and immutable event identifier
- policy reason code

Audit logs are retained according to the data retention policy and exposed through read-only administrative tooling and public transparency reports.

### Quarterly Transparency Reports

P(l)otHole publishes quarterly reports containing:

- moderation metrics and trend analysis
- major policy updates and rationale
- abuse patterns and mitigation improvements
- unresolved governance risks and next-quarter action items

## Data Integrity Safeguards

### Duplicate Detection

- Geospatial-nearby reports with matching hazard type and recent timestamps are scored for duplicate likelihood.
- Suspected duplicates are linked into review clusters rather than silently merged.
- Moderator or community verification confirms merge/reject outcomes.

### GPS and Location Validation

- Coordinates must pass range and plausibility checks.
- EXIF geotag consistency checks are applied when metadata is available.
- Low-confidence location reports may be down-ranked until corroborated.

### Image Verification

- Images are scanned for corruption, unsupported formats, and policy violations.
- Perceptual hashing helps detect recycled or unrelated media reuse.
- Verified media state is stored separately from user-editable text fields.

### Vote and Reputation Integrity

- Rate limits and anomaly detection reduce scripted voting behavior.
- Reputation gains may be throttled or reversed for invalidated actions.
- Coordinated manipulation events trigger temporary leaderboard freezes during investigation.

## Community Oversight Model

### Moderator Roles

- **Volunteer moderators:** elected periodically from high-reputation contributors.
- **Steward moderators:** trusted maintainers with additional incident-response authority.
- **System moderation:** automated classifiers and rules that assist, but do not replace, human review for contested cases.

### Election and Term Structure

- Moderator candidates must meet published reputation and participation thresholds.
- Elections occur on a fixed cadence with transparent eligibility rules.
- Terms are time-boxed, renewable, and revocable for policy non-compliance.

### Checks and Balances

- No single moderator should be the sole reviewer for high-impact actions when capacity allows.
- Steward overrides require documented rationale in audit logs.
- Policy changes require public changelog entries and effective-date announcements.

## Non-Partisan and Public Service Commitment

The platform remains non-partisan in operations and governance:

- no endorsements of political candidates or parties
- no paid suppression of valid hazard reports
- no preferential enforcement based on ideology, affiliation, or neighborhood demographics

Governance focuses strictly on infrastructure safety, report quality, and civil participation.

## Incident Response and Policy Evolution

- Critical abuse or integrity incidents trigger an incident protocol with defined ownership and timelines.
- Post-incident reviews document root cause, impact, and corrective actions.
- Governance policies are versioned; significant updates include migration notes and user-facing announcements.

## Contact and Escalation

For governance concerns, appeals, or transparency questions, maintainers should provide a dedicated contact channel in project configuration (for example, repository issue templates and moderator escalation email aliases).
