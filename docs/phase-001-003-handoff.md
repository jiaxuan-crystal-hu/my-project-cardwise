# CardWise — Phase 1–3 handoff (**single source of truth**)

**Status:** Phases **1–3** shipped in repo. **Do not rely on prior chat**—treat this file, AGENTS.md, docs/PRD-CardWise-MVP.md, as authoritative for “what exists, how it runs, what’s next.”

**Product (one line):** Explainable “which card for this purchase?” MVP—category-based, **no bank linking**; best **cashback** vs best **points** tracks.

**Canonical product/engineering specs (read for scope, not for repo state):** `docs/PRD-CardWise-MVP.md`, `docs/TechDesign-CardWise-MVP.md`.

**Repo agent conventions (secondary):** `AGENTS.md`, `MEMORY.md`, `agent_docs/`—update them when you change process or milestones; **this handoff overrides them if they conflict on facts.**

---

## How to run (copy-paste)

- **Node:** `^18.18.0 || ^19.8.0 || >=20.0.0` per `package.json` (Supabase client effectively **20+**); `.nvmrc` / `.node-version` = **22**; `.npmrc` has `engine-strict=true`.
- **Install / dev:** `npm install` → `cp .env.example .env.local` → set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (repo root, no quotes) → **`npm run dev`** (restart after any `.env.local` edit).
- **Supabase Auth:** Site URL + redirect **`http://localhost:3000/auth/callback`** (and prod equivalents later).
- **DB:** Apply `src/db/migrations/001_init.sql` then `src/db/seeds/002_sample_cards.sql`, then `src/db/seeds/003_expand_catalog.sql` in Supabase SQL editor (or your migration pipeline).
- **Verify:** `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` (on supported Node).

---

## Repository map (high-signal)

| Area | Path |
|------|------|
| App routes | `src/app/` — `(auth)/login|signup`, `auth/callback`, `(legal)/terms|privacy|disclaimer`, `dashboard/*`, `page.tsx` (marketing) |
| APIs | `src/app/api/cards`, `user/cards`, `user/cards/[id]`, `recommend`, `recommendation-history` |
| Supabase helpers | `src/lib/supabase/{client,server,middleware}.ts`, root `src/middleware.ts` |
| API helpers | `src/lib/api/{response,require-user}.ts`, `src/lib/env/public.ts` |
| Wallet service | `src/services/cards/{catalog,wallet}.ts` |
| Recommend engine | `src/services/recommendation/{engine,valuation,preference-boost}.ts` |
| Categories enum | `src/constants/categories.ts` (must stay aligned with `reward_rules.category`) |
| SQL | `src/db/migrations/001_init.sql`, `src/db/seeds/002_sample_cards.sql`, `src/db/seeds/003_expand_catalog.sql` |
| Agent / IDE | `AGENTS.md`, `.cursor/rules/cardwise.mdc` |

---

## What was built (compressed)

| Phase | Summary |
|-------|---------|
| **1** | Next 15 App Router + TS + Tailwind; Supabase Auth + cookie middleware; dashboard shell; versioned SQL (schema, RLS, `public.users` sync from `auth.users`); sample seeds; Vitest valuation tests; env UX (amber banner + actions guard if env missing); **`useActionState`** on auth forms. |
| **2** | Wallet APIs + `/dashboard/wallet` (catalog search, add/remove); dashboard layout nav. |
| **3** | `POST /api/recommend` (user id **from session only**); engine over wallet + `reward_rules`; optional 1.1× points-$ boost via `user_preferences` + `transfer_partners`; `/dashboard/recommend` UI; `POST`/`GET` recommendation history; “I used cashback / points pick” → history. |

**HTTP surface (auth required unless noted):**

- `GET /api/cards?q=` — catalog  
- `GET|POST /api/user/cards`, `DELETE /api/user/cards/:userCardRowId` — wallet  
- `POST /api/recommend` — `{ category, amount? }`; default **$100** comparison if amount omitted (warnings returned)  
- `POST|GET /api/recommendation-history` — log + list recent  

**Dashboard UX:** `/dashboard` (home copy), `/dashboard/wallet`, `/dashboard/recommend` — nav in `src/app/dashboard/layout.tsx`.

---

## Current system state

### Works (given env + DB applied)

Auth end-to-end; wallet CRUD; recommend + explanations + warnings; history POST; GET history list; RLS for user-owned tables; catalog/reward_rules readable when authenticated.

### Does not / not yet

~~PostHog~~ **Minimal client `posthog-js` is in repo** (gated on `NEXT_PUBLIC_POSTHOG_KEY`); see `src/lib/analytics/posthog-client.ts`. **Still missing** when keys absent: no server-side PostHog. ~~Legal~~ **Static** `/terms`, `/privacy`, `/disclaimer` (MVP copy; replace before wide launch). Rate limits; preferences UI; offers in ranking; E2E automation; production deploy wiring in repo. **Seeds** — after `003_expand_catalog.sql`, every `PURCHASE_CATEGORIES` value has at least one `reward_rules` row in the **expanded** catalog; users with only the original three cards in `002` can still see empty tracks for travel/gas/etc. until their wallet includes cards that have those rules.

---

## Key decisions (why)

- **Two-track output** — PRD/Tech Design: don’t merge cash vs points into one score.  
- **Thin routes, fat `src/services`** — testability + clear boundaries.  
- **SQL in repo, apply in Supabase** — no magic drift between environments.  
- **Strict engines + documented PATH** — avoid “installed Node 22 but shell still on 16” failures.  
- **No `userId` in recommend body** — avoids spoofing; always `auth.getUser()`.

---

## Known issues / risks

1. **Missing `public.users` row** for an `auth.users` account (e.g. created before trigger): wallet/history FK errors—manual one-time insert (`id` = auth user id).  
2. **Thin seeds** — sample only covers a few card/category pairs; expand before demoing broadly.  
3. **Numeric fields** from PostgREST may be strings—engine coerces with `Number()`; bad seed data → NaN paths.  
4. **Boost** only applies if **`user_preferences`** exists (no UI yet—SQL only).  
5. **History payload** — estimated cash/points fields set for the **chosen** track only; both recommended card ids stored when present.

---

## Out of scope (MVP reminder)

Bank sync / Plaid, native app, scrapers, PCI-style data, user-facing LLM ranking—see PRD “Out of scope.”

---

## Backlog (after the next session’s top 3)

- Deploy: Vercel + env + Supabase prod redirects.  
- Optional: `GET/PUT /api/user/preferences` + settings UI.  
- Optional: fold `offers` into engine.  
- Playwright happy path when worth the setup.  
- Keep `MEMORY.md` / `AGENTS.md` in sync when you ship milestones.

---

## Next session — **first 3 concrete tasks**

1. ~~**Expand catalog + rules in SQL**~~ **(done — `src/db/seeds/003_expand_catalog.sql`)**  
   - Adds **5** new `cards` + **6** `reward_rules` (fixed UUIDs, `ON CONFLICT DO NOTHING`) so dining, groceries, travel, gas, entertainment, and other each have ≥1 row in the seed catalog. Apply after `002` in Supabase.  
   - **Verify:** Add a wallet with e.g. CSR + Custom Cash + Savor (or the full new set) and confirm `/dashboard/recommend` returns at least one track for dining, groceries, and a third category.

2. ~~**PostHog instrumentation (minimal funnel)**~~ **(done)**  
   - `posthog-js` + `src/lib/analytics/posthog-client.ts` + `PostHogInitializer` in root layout. Events: `signup_completed` (successful signup form submit — email may still need confirmation), `wallet_second_card_added` (first add that brings wallet to exactly 2 cards), `recommend_run` (client after successful recommend response), `recommend_history_logged` (client after history save). `PostHogIdentify` on dashboard.  
   - **Done when:** Set keys in `.env.local` and confirm events in PostHog; with keys unset, the app is unchanged in behavior.

3. ~~**Legal / trust shell (static routes)**~~ **(done)**  
   - `src/app/(legal)/{terms,privacy,disclaimer}/page.tsx` + shared layout; links in `src/app/page.tsx` footer and `src/app/dashboard/layout.tsx` footer. **MVP placeholder copy** — not a substitute for counsel; replace before production.  
   - **Done when:** All three URLs work **without auth** (middleware allows public routes).

---

## Next session — **suggested next 3**

1. **Deploy:** Vercel + env + Supabase prod Site URL / redirect URLs.  
2. **Optional:** `GET/PUT /api/user/preferences` + settings UI (travel boost).  
3. **Hardening:** Rate-limit `POST /api/recommend` (and related) if abuse is a concern.

---

*When you complete work, update **this file** first (state, risks, next 3), then mirror a short summary into `MEMORY.md` if you still use it for agent habits.*
