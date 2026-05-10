# Cursor Task List for CardWise MVP on Card reward rules

Use this file as the implementation checklist for the reward-rule system.

## Rules for Cursor
- Treat `docs/card-reward-rules-seeding.md` as the source of truth
- Keep MVP scope tight
- Do not add scraping, admin tooling, AI features, bank sync, or new categories unless explicitly required
- Before writing code, inspect the current file structure and choose the best implementation location
- After each task, explain:
  1. what changed
  2. which files changed
  3. what I should test manually next

---

## Task 0 — Read and summarize the reward rules spec

**Prompt to Cursor:**

Read /docs/card-reward-rules-seeding.md carefully and treat it as the source of truth for card reward rule seeding and fallback logic.

Do not implement everything at once.
First, summarize:
1. the fallback/default rule behavior
2. the reward rule data shape we should use
3. the implementation tasks you will do in order

Keep the summary concise and specific to this codebase.
Do not write code yet.

---

## Task 1 — Implement reward rule types

**Prompt to Cursor:**

Using /docs/card-reward-rules-seeding.md as the source of truth, implement the TypeScript types and shared constants needed for reward rules.

Requirements:
- Create clean TypeScript types for cards, reward rules, recommendation input, and recommendation output
- Include support for:
  - reward_mode
  - category
  - multiplier
  - cash_percent
  - points_currency
  - notes
  - priority
  - is_fallback
- Keep the design MVP-simple, but future-friendly
- Use clear naming and avoid overengineering

Please:
1. identify the best file locations in this repo
2. create or update the files
3. explain briefly what you changed
4. do not implement business logic yet

---

## Task 2 — Add category constants

**Prompt to Cursor:**

Use /docs/card-reward-rules-seeding.md and implement the internal category constants for CardWise.

We need:
- user-facing categories
- internal mapped categories

Current internal categories:
- dining
- online_grocery
- streaming
- flight_direct
- hotel_direct
- chase_travel
- travel_other
- other

Requirements:
- create a clean constants file
- make the categories reusable across seeding, recommendation logic, and UI
- keep the current MVP category system unchanged
- do not expand categories yet unless absolutely necessary

Please update the codebase accordingly and explain the file structure you chose.

---

## Task 3 — Implement fallback logic

**Prompt to Cursor:**

Implement or revise the fallback reward rule logic based on /docs/card-reward-rules-seeding.md.

Critical requirement:
"Everything else" is NOT a literal user-only category.
It must behave as the fallback/default reward rule for any purchase category that does not have a more specific matching rule.

Desired behavior:
1. try exact category match first
2. if no exact match, use the fallback rule
3. fallback rule is a reward rule where:
   - is_fallback = true
   - usually category = "other"

Please:
- find the current recommendation or reward selection logic
- revise it to support exact-match-then-fallback behavior
- keep the implementation simple and readable
- add a small helper function if useful, such as getAppliedRewardRule(...)
- avoid duplicating fallback rules across all categories

Also add light unit tests for:
- exact match found
- no exact match, fallback used
- no match and no fallback returns null safely

At the end, explain exactly what files you changed.

---

## Task 4 — Seed the card catalog

**Prompt to Cursor:**

Using /docs/card-reward-rules-seeding.md as the source of truth, create or update the card seed data for these cards:

- Chase Sapphire Preferred
- Chase Sapphire Reserve
- World of Hyatt Credit Card
- Amex Platinum
- Amex Gold
- Amex Blue Cash Everyday
- Amex Blue Cash Preferred
- Citi Double Cash
- Citi Custom Cash
- Citi AAdvantage Platinum Select
- Marriott Bonvoy Boundless
- Marriott Bonvoy Bold

Requirements:
- create clean seed data for the cards themselves
- keep card metadata simple for MVP
- use stable ids/slugs if the current codebase benefits from that
- do not add SQL
- do not add scraping
- do not add cards outside this list

Please:
1. determine the best seed file structure in this repo
2. create/update the card seed data
3. explain how the seed data is organized

---

## Task 5 — Seed the reward rules

**Prompt to Cursor:**

Using /docs/card-reward-rules-seeding.md as the source of truth, create or update the reward rule seed data for the supported cards.

Requirements:
- one card can have multiple reward rules
- include explicit category rules
- include one fallback rule where appropriate
- preserve important nuances in notes
- do not try to fully model caps/exclusions in code yet
- do not duplicate fallback/default values into every category unless the code absolutely requires it

Important:
- keep the current MVP category model
- if an issuer category does not map cleanly to MVP categories, preserve the nuance in notes instead of inventing new categories
- Citi Custom Cash should be represented in a way that supports special-case handling later

Please:
1. create/update the reward rule seed file(s)
2. keep formatting clean and readable
3. explain any approximation decisions you made

---
Task 6 — Citi Custom Cash
Implement MVP-safe handling for Citi Custom Cash using /docs/card-reward-rules-seeding.md.

Behavior:
- **Do not** infer top spend category from the purchase input.
- Default recommendation math uses **1%** unless the user set `custom_cash_top_category` on that wallet row **and** it matches the purchase category slug → then **5%**.
- Copy: explain member-selected top category when 5%; explain default 1% when unset or no match.

Constraints:
- no cap tracking
- no billing-cycle logic
- do not generalize to other cards

Tasks:
1. optional DB column + PATCH wallet API + dashboard selector for Custom Cash only
2. recommendation engine branch (`citi-custom-cash.ts`) + emit seeds (fallback-only rule row)
3. ensure no regression for other cards
4. unit tests for match / no match / unset

Deliverables reference:
- `src/db/migrations/003_user_cards_custom_cash_top_category.sql`
- `src/services/recommendation/citi-custom-cash.ts`, `engine.ts`
Task 7 — Point valuations
Add static MVP point valuations (UR, MR, Hyatt, Marriott, AA, cashback).

Constraints:
- centralize in one file
- used only for scoring
- easy to update
- mark as estimates in explanation

Explain where values live.

**Status (repo):** Implemented in `src/services/recommendation/valuation.ts` (`CENTS_PER_POINT`: UR, MR, TY, Hyatt, Marriott, AA, CASHBACK + 1¢ default). Points track copy in `engine.ts` includes assumed ¢/pt and a scoring-only disclaimer.
Task 8 — Scoring engine
Implement recommendation scoring using reward rules + fallback logic.

Tracks:
1. best cashback
2. best points

Rules:
- exact match → fallback
- cashback: use cash_percent
- points: multiplier × valuation
- deterministic, explainable
- no AI, no confidence scoring

Tasks:
1. place service appropriately
2. implement scoring
3. return results + explanations
4. keep modular
5. add basic tests

**Status (repo):** Core scoring lives in `src/services/recommendation/scoring.ts` (`collectRecommendationCandidates`, best-pick helpers); `engine.ts` handles I/O and wraps results. Tests: `scoring.test.ts`.
Task 9 — Explanation output
Improve explanation output.

Must include:
- matched rule
- fallback usage (if applied)
- estimated value
- relevant notes
- Citi Custom Cash: when user-set top category yields 5% vs default 1%

Constraints:
- user-readable
- concise
- no overload

**Status (repo):** `getAppliedRewardRuleWithPath` exposes selection path; `explanations.ts` builds match + value lines and optional truncated issuer notes; `scoring.ts` composes cashback/points/Custom Cash strings. Tests: `explanations.test.ts`, extended `scoring.test.ts` / `get-applied-reward-rule.test.ts`.
Task 10 — API route
Implement/update recommendation API.

Input:
- category
- optional amount

Output:
- best cashback card
- best points card
- explanations

Constraints:
- use saved user cards
- handle missing/unsupported cases gracefully
- keep MVP-simple

Tasks:
1. choose correct route location
2. implement endpoint
3. validate input
4. explain response shape

**Status (repo):** `src/app/api/recommend/route.ts` — **POST** (auth) uses `parseRecommendPostBody` from `src/lib/api/recommend-post.ts` (MVP categories + amount bounds, clear `validation_error` messages). **GET** (no auth) returns `recommendApiContract()` JSON. JSDoc on `recommend-post.ts` documents success/error shapes. Tests: `recommend-post.test.ts`.
Task 11 — Verification script
Create simple dev utility to verify seed data.

Checks:
- each card has rules
- fallback exists where needed

Constraints:
- lightweight
- human-readable output
- script or test

Explain how to run.

**Status (repo):** `verifyTask4Seeds()` in `src/data/catalog/task4-seed-verify.ts` checks every Task 4 card has rules + a fallback-style row (`is_fallback` or `category: other`) and flags orphan rule `card_id`s. **Run:** `npm run db:verify-task4` (or `npx tsx scripts/verify-task4-seeds.ts`). Exit `1` on failure. Vitest: `task4-seed-verify.test.ts`.
Task 12 — Refactor (optional)
Review reward + scoring implementation.

Goals:
- improve readability
- reduce duplication
- no behavior change
- no new features

Propose plan only.
Do not refactor until approved.