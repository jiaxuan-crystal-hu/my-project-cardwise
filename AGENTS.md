# AGENTS.md — Master Plan for CardWise

## Project Overview & Stack

**App:** CardWise  
**Overview:** CardWise is an explainable decision engine that helps US users with multiple credit or debit cards pick the best card for a purchase. It optimizes for cashback and points in real time using category-based input and a preloaded reward-rules database—no bank linking in MVP.  
**Stack:** Next.js (App Router) + TypeScript, Tailwind CSS + shadcn/ui, Next.js Route Handlers / Server Actions, Supabase (PostgreSQL + Auth), PostHog analytics, Vercel hosting.  
**Critical Constraints:** Web-first, mobile responsive; no card numbers or bank credentials; email/password auth only; recommendation flow ≤3 clicks; explain every recommendation; stay within PRD P0 scope until Phase 1 is done; monthly tooling budget ~$50–200.

## Setup & Commands

Execute these commands from the repository root. **Node.js** must satisfy Next.js 15 (**`^18.18.0 || ^19.8.0 || >=20.0.0`**); Node 16 is unsupported. This repo pins **22** in `.nvmrc` / `.node-version` and recommends **20+** for current Supabase JS engines. Use `nvm install && nvm use` (or equivalent) before `npm install`. Do not invent a different package manager unless `package.json` specifies one.

- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Testing:** `npm test` (Vitest when configured)
- **Linting & Formatting:** `npm run lint`
- **Build:** `npm run build`

## Protected Areas

Do **not** modify these without explicit human approval:

- **Infrastructure:** `infrastructure/`, Dockerfiles, deployment workflows (`.github/workflows/`).
- **Database migrations:** Existing files under `src/db/migrations/` (or equivalent).
- **Third-party integrations:** Supabase project keys, Auth provider settings, production Vercel/PostHog configuration.

## Coding Conventions

- **Formatting:** ESLint + Prettier as configured; no new warnings in touched files.
- **Architecture:** Feature-oriented layout under `src/` per Tech Design; business logic in `src/services/`; route handlers thin (I/O + validation only).
- **Testing:** Unit tests for recommendation/valuation math; integration tests for critical API contracts; manual happy path before marking features done.
- **Type safety:** Strict TypeScript; `any` is forbidden—use `unknown` with type guards or precise types. Validate external input with Zod (or project-standard runtime validation).

## How I Should Think

1. **Understand intent first:** Before coding, infer what the user actually needs from the request and PRD alignment.
2. **Ask if unsure:** If a requirement is ambiguous or conflicts with the MVP scope, ask one specific question.
3. **Plan before coding:** Propose a short plan; after approval (or implicit go-ahead), implement in small steps.
4. **Verify after changes:** Run tests, typecheck, and lint after each logical change; fix failures before moving on.
5. **Explain trade-offs:** When choosing an approach, note alternatives briefly.

## Plan → Execute → Verify

1. **Plan:** Outline approach; use Plan mode in Cursor when the change is non-trivial.
2. **Execute:** One feature or slice at a time; prefer incremental edits over rewrites.
3. **Verify:** Follow `REVIEW-CHECKLIST.md`; update `MEMORY.md` when decisions or quirks change.

## Agent Behaviors

These rules apply across AI assistants (Cursor, Copilot, Claude, Gemini):

1. **Plan before execution:** Propose a brief step-by-step plan before changing more than one file, unless the fix is trivial.
2. **Refactor over rewrite:** Extend existing modules before adding parallel abstractions.
3. **Context compaction:** Log milestones, decisions, and quirks in `MEMORY.md` instead of relying only on chat history.
4. **Iterative verification:** Run tests or linters after each logical change; fix errors before proceeding.
5. **Documentation is source-adjacent:** Deep detail lives in `agent_docs/`; keep this file accurate when phase or stack changes.

## What NOT To Do

- Do **not** delete files without explicit confirmation.
- Do **not** change database schemas without a backup/migration plan and approval.
- Do **not** add PRD P1/P2 or out-of-scope features during P0 MVP unless the human explicitly expands scope.
- Do **not** skip tests for “simple” changes on critical paths.
- Do **not** bypass failing tests or pre-commit hooks without human approval.
- Do **not** rely on deprecated patterns; match `agent_docs/tech_stack.md` and existing code.

## Engineering Constraints (Developer Quality)

### Type safety

- The `any` type is forbidden—use `unknown` with type guards.
- Type function parameters and return values explicitly at boundaries.
- Use Zod (or the project’s chosen runtime validator) for API and form payloads.

### Architectural boundaries

- Route handlers / server actions: request parsing, auth context, response mapping only.
- Business logic lives in `src/services/` (recommendation, cards, rewards, offers).
- No direct DB access from UI components; use server actions, loaders, or API routes as per Next.js patterns in `agent_docs/code_patterns.md`.

### Dependencies

- Check `package.json` before adding libraries; prefer web APIs (`fetch`) over redundant HTTP clients unless already standardized.

### Communication

- State blockers briefly and propose a fix; avoid filler apologies.

### Workflow

- Pre-commit hooks must pass before commits (or ask to bypass explicitly).
- If verification fails, fix before continuing.

## Where to Look Next

| Topic | File |
|--------|------|
| Stack, env vars, folder layout | `agent_docs/tech_stack.md` |
| Patterns, fetching, errors | `agent_docs/code_patterns.md` |
| P0 features, stories, metrics | `agent_docs/product_requirements.md` |
| Tests and manual checks | `agent_docs/testing.md` |
| Vision and conventions | `agent_docs/project_brief.md` |
| Product & architecture source of truth | `docs/PRD-CardWise-MVP.md`, `docs/TechDesign-CardWise-MVP.md` |

## Model naming

Use model family names (e.g., Claude Sonnet, Claude Opus, Gemini Pro, Gemini Flash) in docs unless the human asks for pinned versions.
