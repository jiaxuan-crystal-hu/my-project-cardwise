# Testing Strategy — CardWise MVP

Aligned with `docs/TechDesign-CardWise-MVP.md` (Vitest + React Testing Library; Playwright optional/light).

## Frameworks

| Layer | Tool | Scope |
|--------|------|--------|
| **Unit** | Vitest | Recommendation math, cents-per-point valuation table, transfer-partner preference boosts, pure utilities. |
| **Component** | Vitest + React Testing Library | Forms and presentational components with user-visible behavior. |
| **Integration** | Vitest (Node env) + supertest or Next request API | `/api/recommend` response shape; auth-gated user card routes once implemented. |
| **E2E** | Playwright (optional for week 1) | Single happy path: signup → add ≥2 cards → category → results → “I used this card.” Add when scaffold stable. |

## Manual checks (required for MVP quality)

- **Responsive:** iPhone-sized + desktop breakpoints for wallet, recommend, results.
- **Happy path:** full flow with real Supabase project (staging) when available.
- **Edge cases:** no cards saved, one card saved, tied scores (deterministic ordering documented in code).
- **Copy:** disclaimers visible where $ value of points shown.

## Pre-commit hooks (recommended once repo has scripts)

- Format: Prettier (if configured).
- Lint: ESLint (`npm run lint`).
- Typecheck: `tsc --noEmit` when added to scripts.
- Tests: fast subset (`npm test` or `vitest related`) — expand as suite grows.

## Verification loop

1. After each feature: run targeted tests + lint + typecheck.
2. Before marking a task complete: follow `REVIEW-CHECKLIST.md`.
3. Never skip failing tests or weaken assertions without explicit human approval.

## Commands (set in `package.json` when scaffold exists)

| Goal | Command |
|------|---------|
| All unit/component tests | `npm test` |
| Watch mode during dev | `npm test -- --watch` |
| Single file | `npx vitest run path/to/file.test.ts` |
| E2E (when added) | `npx playwright test` |

## Coverage expectations

- Aim for **high confidence on recommendation + valuation** logic (critical path), not arbitrary global % coverage.
- Add regression tests when fixing ranking bugs.

## Analytics validation (manual / staging)

- PostHog events: signup, first card, second card, recommendation run, card chosen, return within 7 days — smoke-test in dev/staging with debug toolbar.
