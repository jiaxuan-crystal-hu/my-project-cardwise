# System Memory & Context

<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## Active Phase & Goal

**Phase:** MVP Phase 4 — Product polish + analytics (optional next)  
**Current task:** Vercel + prod env (Supabase redirects, env vars), basic mobile QA.  
**Seeded catalog:** `003_expand_catalog.sql` — see handoff.  
**Analytics:** `posthog-js` — set `NEXT_PUBLIC_POSTHOG_KEY` (and optional `NEXT_PUBLIC_POSTHOG_HOST`); events `signup_completed`, `wallet_second_card_added`, `recommend_run`, `recommend_history_logged`.  
**Legal (MVP copy):** `/terms`, `/privacy`, `/disclaimer` under `src/app/(legal)/` — linked from marketing and dashboard footers; replace with counsel-reviewed text before a public launch.

**Next steps:**

1. Deploy (Vercel + Supabase prod URLs) — see `docs/phase-001-003-handoff.md`.
2. (Ongoing) Grow catalog toward 20–50 cards in SQL as needed for demos.
3. (Optional) `GET/PUT /api/user/preferences` UI; rate-limit `POST /api/recommend` if needed.
4. E2E happy path (Playwright) when time allows.

## Architectural Decisions

*(Log choices here so future sessions stay consistent.)*

- 2026-04 — Stack locked: Next.js monolith + Supabase + Vercel + PostHog per Technical Design (full-stack in one repo for speed).
- 2026-04 — Card catalog + wallet: thin Route Handlers under `src/app/api/**` calling `src/services/cards/*`; wallet UI is client-side fetch with cookie session (same-origin).
- 2026-04 — Recommendations: `src/services/recommendation/engine.ts` loads wallet + `reward_rules` for the category; two tracks; optional `user_preferences` + `transfer_partners` 1.1x points $ boost; no offer-layer math in MVP.
- 2026-04 — PostHog: `posthog-js` in client only; `NEXT_PUBLIC_POSTHOG_KEY` / optional `NEXT_PUBLIC_POSTHOG_HOST`; no capture when env missing.
- 2026-04 — Legal: static public routes `(legal)/terms|privacy|disclaimer`; footers on `page.tsx` and `dashboard/layout.tsx`.

## Known Issues & Quirks

*(Add runtime quirks as they appear.)*

- If a user was created **before** `public.users` + trigger existed, `user_cards` inserts can fail with FK errors—fix by inserting their `public.users` row once (`id` = `auth.users.id`).

## Completed Phases

- [x] Initial Next.js scaffold + repo layout (`src/app`, Tailwind, ESLint, Vitest)
- [x] Supabase Auth (email/password) + middleware session refresh + `/dashboard` shell
- [x] Database schema + sample seed **as SQL files** (`src/db/migrations`, `src/db/seeds`) — apply in Supabase
- [x] Card wallet UI + persistence (`/dashboard/wallet`, `GET /api/cards`, `GET|POST /api/user/cards`, `DELETE /api/user/cards/[id]`)
- [x] Recommendation engine + `POST /api/recommend` + results UI (`/dashboard/recommend`), `reward_rules`–driven cashback & points tracks, `POST/GET /api/recommendation-history`
- [x] Legal trust shell: `/terms`, `/privacy`, `/disclaimer` (MVP placeholder copy)
