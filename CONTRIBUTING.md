# Contributing to P(l)otHole

Thanks for helping improve P(l)otHole. We welcome bug reports, feature ideas, docs edits, design feedback, and code contributions.

## Hackathon-Friendly Contribution Paths

Choose a lane that matches your experience level:

- **Beginner path:** docs edits, issue triage, repro steps, API example testing, QA checklists.
- **Intermediate path:** UI features, form validation, loading/error states, endpoint wiring.
- **Advanced path:** PostGIS queries, cache strategy, auth/permissions, CI/release automation.

For short hackathons, prefer small PRs that can be reviewed quickly.

## Event Timeline and Community Transition

- **Dev sprint:** 2 weeks of focused implementation.
- **Build day:** March 19, with live coaching and integration support.
- **After March 19:** project remains open source for ongoing PhilaConValley community contributions.

## Code of Conduct

This project follows a community-first standard of respect, inclusion, and constructive collaboration.

- Be respectful and assume good intent.
- Focus feedback on ideas, code, and outcomes, not individuals.
- Harassment, hate speech, or abusive behavior is not tolerated.

If you experience or witness harmful behavior, open a private maintainer contact issue titled `Code of Conduct` with minimal public details.

## How to Contribute

### 1) Start with an Issue

- Search existing issues before creating a new one.
- For bugs, include repro steps, expected behavior, actual behavior, and environment details.
- For features, explain the problem, proposed solution, and potential trade-offs.

### 2) Claim or Discuss Work

- Comment on the issue before starting implementation to avoid duplicate work.
- Maintainers may label issues with priority or scope before work begins.

### 3) Open a Pull Request

- Keep PRs focused and reasonably small.
- Link the related issue in the PR description (for example: `Closes #123`).
- Include screenshots or API samples when behavior changes.
- If you are new, open a "draft PR" early to get guidance sooner.

## Branch Naming Convention

Use descriptive branch names with a type prefix:

- `feat/<short-description>`
- `fix/<short-description>`
- `docs/<short-description>`
- `refactor/<short-description>`
- `chore/<short-description>`
- `test/<short-description>`

Examples:

- `feat/hazard-clustering-radius-filter`
- `fix/repair-status-transition-validation`
- `docs/update-api-pagination-examples`

## Commit Message Convention

Use Conventional Commits:

- `feat: add radius-based hazard search endpoint`
- `fix: handle missing EXIF GPS metadata`
- `docs: clarify local database setup`
- `test: add API tests for hazard vote limits`
- `chore: update lint and format scripts`

Guidelines:

- Use the imperative mood ("add", not "added").
- Keep the subject concise and specific.
- Add a short body when context is not obvious.

## Local Development Setup

1. Fork and clone your fork:

```bash
git clone https://github.com/<your-username>/p-l-otHole.git
cd p-l-otHole
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

4. Prepare local services (PostgreSQL/PostGIS and Redis), then run migrations:

```bash
pnpm db:migrate
```

5. Start development server:

```bash
pnpm dev
```

## Testing Expectations

Before opening a PR:

- Run tests locally and ensure they pass.
- Add or update tests for behavior changes.
- Verify docs are updated when APIs, data models, or workflows change.

Suggested checks:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

If a check cannot run in your environment, note that clearly in the PR with details.

## Pull Request Checklist

- [ ] Issue is linked and scope is clear.
- [ ] Branch name follows conventions.
- [ ] Commit messages follow Conventional Commits.
- [ ] Tests added/updated for changed behavior.
- [ ] Lint, test, and type checks pass locally.
- [ ] Docs updated when relevant.
- [ ] Screenshots/examples included for UX or API changes.

## Review Process

- A maintainer will review for correctness, scope, and long-term maintainability.
- Feedback should be addressed with follow-up commits.
- PRs are merged when checks pass and review is approved.
- Maintainers may squash commits at merge time for clean history.

## First-Time Contributors

If you are new to open source, look for `good first issue` labels. Small docs fixes, test additions, and bug reproductions are great first contributions.

### Suggested First PRs During Hackathon

- Clarify one confusing setup step in `README.md`.
- Add one request/response example in `docs/api.md`.
- Add one small test case for validation or status transitions.
- Improve one governance or moderation policy example with clearer wording.

Thanks again for improving civic accountability with P(l)otHole.
