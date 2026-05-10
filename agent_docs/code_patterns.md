# Code Patterns — CardWise

## Purpose

Implementation patterns for this MVP. Prefer these over inventing new ones. Deep stack listing lives in `tech_stack.md`.

## Architecture pattern

- **Primary pattern:** Monolithic Next.js with **service layer** (`src/services/`).
- **Rule:** Domain logic (ranking, valuation, boosts) stays in services; **routes/controllers handle request/response only** (parse, auth, call service, map to JSON).
- **Rule:** Reuse modules before adding new abstractions; MVP favors clarity over cleverness.

## Data fetching

- **Primary approach:** Next.js App Router — **Server Components + Server Actions** for mutations and trusted reads; Route Handlers (`app/api/.../route.ts`) for JSON APIs called from client or external tools.
- **Rule:** Confirm whether a component is Server or Client before adding `fetch`; avoid accidental client waterfalls.
- **Rule:** Centralize Supabase server client creation in `src/lib/supabase/` (server vs browser clients).

## State management

- **Server state:** Postgres via Supabase; derive as much as possible on the server per request.
- **Client state:** React `useState` / `useReducer` for local UI; avoid global stores until a clear need appears.
- **Forms:** Controlled inputs with Zod-validated payloads at the server boundary.

## Error handling

- Normalize errors at **API and server action** boundaries — never expose raw stack traces to users.
- Never swallow errors silently: log server-side (structured console or logging provider), return safe messages.
- Use a **consistent JSON envelope** (`ok` + `data` or `error`) for HTTP APIs (see `tech_stack.md` example).

## Validation

- Validate **all** external input: forms, JSON bodies, query params, env at startup where practical.
- Use **Zod** schemas next to the route/action that consumes them.
- Inside validated boundaries, trust TypeScript types.

## File and naming conventions

- **Files:** kebab-case for routes under `app/`; PascalCase for components in `components/`.
- **Components:** PascalCase.
- **Functions / hooks:** camelCase (`useRecommendationForm`).
- **Constants / env:** UPPER_SNAKE_CASE.

## Recommendation engine (MVP logic)

- **Two-track output:** best **cashback** card and best **points** card — do not merge into a single opaque score in MVP.
- **Cashback track:** match `reward_rules` by category → `estimatedCashValue = amount * (cashPercent/100)` → add applicable active offers → sort descending.
- **Points track:** `estimatedPoints = amount * multiplier` → `estimatedPointDollarValue = estimatedPoints * centsPerPoint` (app-defined table: UR 0.018, MR 0.017, TY 0.015, generic cashback 0.01 unless product updates constants) → apply simple preference boost (e.g., ×1.1 when travel goal aligns with transfer partner) → sort descending.
- **Transparency:** Explanations must cite category, rate/multiplier, and valuation assumptions; UI must state valuations are **estimates**, not guarantees.

## Security patterns

- Enforce **Supabase RLS** so users only read/write their `user_cards`, `user_preferences`, `recommendation_history`, etc.
- **Never** store PAN, CVV, or bank logins.
- Add **basic rate limiting** on auth and recommend endpoints when implementing (middleware or edge config).

## Testing pattern

- Unit tests: pure functions in recommendation/valuation/boost logic.
- Integration tests: `/api/recommend` contract and critical DB-backed flows once the app exists.
- E2E: optional Playwright for the single PRD happy path when time allows.
- Run tests after each feature; fix failures before moving on (`testing.md`).

## Change discipline

- Prefer focused edits; no drive-by refactors unrelated to the task.
- No new dependencies without checking `package.json` and Tech Design rationale.
- Do not edit committed migrations or production Supabase/Vercel settings without explicit approval.
- **One feature at a time** — checkpoint in git after each working slice.

## Anti-patterns for this project

- Putting SQL or ranking math directly inside React components or route handler bodies beyond a single service call.
- Calling Supabase with the service role key from the browser.
- User-facing “AI” ranking or LLM-based card choice in MVP (out of scope per Tech Design).
