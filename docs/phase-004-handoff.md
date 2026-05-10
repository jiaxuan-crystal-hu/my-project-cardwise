# CardWise — Phase 004 handoff

**Status:** Relevant as of 2026-04. **Do not replace** `docs/phase-001-003-handoff.md` for Phases 1–3 product facts; this file **adds** the reward-rule + catalog workstream and resumption points. **Habits / secondary:** `AGENTS.md`, `MEMORY.md`.

**See also (detail by topic):**

| Topic | Where |
|--------|--------|
| PRD & scope (product, not only repo) | `docs/PRD-CardWise-MVP.md`, `docs/phase-001-003-handoff.md` |
| Reward rule domain spec (fallback, card seeds) | `docs/card-reward-rules-seeding.md.md` (on-disk name; also referenced as `card-reward-rules-seeding.md`) |
| Checklist: Tasks 0–12 | `docs/task-list-card-reward-rules.md` |
| Agent runbook | `AGENTS.md` |

---

## 1. What was accomplished (this “phase 004” slice)

### 1a) Prior roadmap / already-shipped (reference)

Covered in **`docs/phase-001-003-handoff.md`**: Phases 1–3 (Next.js + Supabase auth, wallet, recommend API, history), optional **`003_expand_catalog.sql`**, **PostHog** client (`src/lib/analytics/posthog-client.ts`, env-gated), **legal** routes `/terms`, `/privacy`, `/disclaimer` + footers, `MEMORY.md` / agent conventions.

### 1b) Reward rules + recommendation plumbing (new in this workstream)

| Area | What shipped |
|------|----------------|
| **Types** | `src/types/reward-rules.ts`, `RecommendationInput` / `RecommendationOutput` in `src/types/recommendation.ts` |
| **Categories** | `src/constants/reward-categories.ts` — `INTERNAL_REWARD_CATEGORIES`, `mapPurchaseCategoryToInternal`, `PURCHASE_CATEGORY_LABELS` (MVP `PURCHASE_CATEGORIES` unchanged) |
| **Selection** | `getAppliedRewardRule` / `getAppliedRewardRuleWithPath` in `get-applied-reward-rule.ts` (exact → legacy slug → fallback); tests in `get-applied-reward-rule.test.ts` |
| **Engine** | `recommendForUser` loads all rules per wallet `card_id`, applies selection per card, scores cashback / points in `src/services/recommendation/engine.ts` |
| **DB** | **`src/db/migrations/002_reward_rules_priority_and_fallback.sql`** — `priority`, `is_fallback` on `public.reward_rules` (apply in Supabase after `001`) |
| **Task 4 cards** | `src/data/catalog/task4-card-seeds.ts` — 12 products, fixed UUIDs `c4a...c0001`–`c000c` |
| **Task 5 rules** | `src/data/catalog/task4-reward-seeds.ts` — 43 emitted rows + one burned id slot for stable UUIDs; Citi Custom Cash is **fallback 1% only** in seeds (5% via wallet `custom_cash_top_category`) |
| **SQL applying Task 4+5** | `src/db/seeds/004_task4_reward_rules.sql` (cards + rules, `on conflict (id) do nothing`) — **regen:** `npm run db:emit-task4` via `scripts/emit-task4-reward-sql.ts` (needs `tsx`) |
| **Checklist** | `docs/task-list-card-reward-rules.md`: **Tasks 0–11** done; **12** optional |
| **Task 6 (Citi Custom Cash)** | `003_user_cards_custom_cash_top_category.sql`; wallet PATCH + dashboard selector; `citi-custom-cash.ts` + dedicated branch in `engine.ts` (no auto 5%) |
| **Task 7 (Point valuations)** | `valuation.ts` — UR, MR, TY, **Hyatt**, **Marriott**, **AA** + default; points explanations show assumed ¢/pt + scoring disclaimer (`engine.ts`) |
| **Task 8 (Scoring engine)** | `scoring.ts` — `collectRecommendationCandidates` + `pickBestCashCandidate` / `pickBestPointsCandidate`; `engine.ts` loads data and delegates; `scoring.test.ts` |
| **Task 9 (Explanations)** | `getAppliedRewardRuleWithPath` + `explanations.ts` (`matchPathCaption`, `appendIssuerNote`); cashback/points copy includes match path, est. value, issuer notes; Custom Cash line prefixed + est. |
| **Task 10 (Recommend API)** | `src/lib/api/recommend-post.ts` — `parseRecommendPostBody` + `recommendApiContract`; `POST/GET /api/recommend`; tests `recommend-post.test.ts` |
| **Task 11 (Seed verify)** | `src/data/catalog/task4-seed-verify.ts` + `npm run db:verify-task4` (`scripts/verify-task4-seeds.ts`); test `task4-seed-verify.test.ts` |

---

## 2. Current system state (facts)

- **App:** Unchanged at a high level: auth, dashboard, wallet (Custom Cash top-category selector), `/api/recommend`, recommendation history, legal pages, PostHog (if keys set).
- **Data:** You may still have **older** `002`/`003` sample rows **plus** Task 4 UUIDs if `004` was applied; catalog search returns whatever is in `public.cards`. Uniqueness is by `id` — no merge of duplicate product *names* across old vs Task 4 ids.
- **DB requirement for engine:** Migrations through **`003`** (`custom_cash_top_category` on `user_cards`); **`002`** on `reward_rules`; optional seeds **`002` / `003_expand_catalog` / `004`** as needed; recommend query expects **`priority`** and **`is_fallback`** on rules (**002**).
- **Valuation:** `src/services/recommendation/valuation.ts` — static ¢/pt for UR, MR, TY, Hyatt, Marriott, AA; unknown `points_currency` still **1¢/pt** default (see `docs/task-list-card-reward-rules.md` Task 7).

---

## 3. Key design decisions (important)

- **Internal vs purchase slug:** User still sends **MVP purchase slugs** (`PURCHASE_CATEGORIES`); engine maps to **internal** keys for rule matching, with **one legacy exact** pass on the raw purchase slug (back-compat with pre–Task 4 seeds).
- **Fallback:** “Everything else” is a **row** (`is_fallback` and/or `category = 'other'`), not a duplicate rate per non-bonus column in SQL.
- **Citi Custom Cash:** Seeds **1% fallback only**; **5%** only if wallet **`custom_cash_top_category`** matches purchase slug (see `docs/task-list-card-reward-rules.md` Task 6).
- **SQL vs TS:** Task 4 used **TypeScript** only for cards; Task 5 **TS = source** for rules + **generated** `004_*.sql` to apply in Supabase.
- **Two-track recs (cashback vs points):** Unchanged; still no merged single score (PRD).

---

## 4. Architecture snapshot (only what exists)

| Layer | Paths / notes |
|--------|----------------|
| **HTTP** | `api/recommend` (POST + **GET** contract), `recommendation-history`, `user/cards`, `cards` — thin handlers; `src/lib/api/recommend-post.ts` |
| **Engine** | `engine.ts`, `scoring.ts`, `explanations.ts`, `citi-custom-cash.ts`, `get-applied-reward-rule.ts`, `valuation.ts`, `preference-boost.ts` |
| **Constants** | `src/constants/categories.ts`, `src/constants/reward-categories.ts` |
| **Types** | `src/types/reward-rules.ts`, `src/types/recommendation.ts`, `src/types/cards.ts` |
| **Task 4 catalog (TS + emitted SQL)** | `task4-card-seeds.ts`, `task4-reward-seeds.ts`, `task4-seed-verify.ts`, `004_task4_reward_rules.sql`, `scripts/emit-task4-reward-sql.ts`, `scripts/verify-task4-seeds.ts` |
| **Migrations** | `001_init.sql`, `002_reward_rules_priority_and_fallback.sql`, `003_user_cards_custom_cash_top_category.sql` |
| **Analytics** | `src/lib/analytics/posthog-client.ts`, `PostHogInitializer`, `PostHogIdentify` |
| **Legal** | `src/app/(legal)/` |

---

## 5. Known issues / limitations / risks

- **Drift / duplicates:** Old sample UUIDs in `002`/`003` vs Task 4 `c4a...` — possible duplicate *products* in DB if both are loaded; use wallet picks intentionally.
- **Custom Cash cleanup:** Older DBs may still hold an obsolete bonus rule row for Custom Cash from prior seeds; engine ignores it for scoring but deleting that row keeps catalog tidy.
- **Point valuations:** New programs still need explicit rows in `CENTS_PER_POINT` or they score at **1¢/pt** default.
- **`.next` dev cache:** Stale `ENOENT` on route chunks — fix: `rm -rf .next` and restart `npm run dev` (transient, not a route bug if source exists).
- **Phase 1–3 risks** (users trigger, RLS, etc.): still in **`docs/phase-001-003-handoff.md` § Known issues.

---

## 6. Next steps (ordered, no roadmap reset)

**Continue prior product roadmap** (from `docs/phase-001-003-handoff.md` / `MEMORY.md`): production deploy (Vercel, Supabase Site URL + redirects, env), optional rate limits, optional preferences UI, E2E when worth it, keep `MEMORY.md` in sync when shipping.

**Resume reward-rule task list** — **`docs/task-list-card-reward-rules.md`** (next incomplete items):

1. **Task 12** (optional) — Refactor plan only until approved (`docs/task-list-card-reward-rules.md`).
2. **Re-emit SQL** after TS seed edits: `npm run db:emit-task4`; apply updated **`004`** in Supabase when rule rows change.
3. **Prod** — continue `docs/phase-001-003-handoff.md` / `MEMORY.md` deploy checklist.

*End of `docs/phase-004-handoff.md` — update when Task 12 ships or milestones change.*
