# Project Brief (Persistent)

## Product vision

**CardWise** helps people with multiple cards choose the best credit or debit card for a purchase by explaining cashback vs points outcomes in real time—without bank linking in MVP.

## Target audience

**“Optimizing Professional” (US, 22–40):** mid–high income, 3+ cards, values speed and confidence at checkout, does not want to micromanage reward spreadsheets.

## Conventions

- **Language & types:** TypeScript strict; no `any`; Zod at boundaries.
- **Structure:** Next.js App Router layout under `src/app/`; services in `src/services/`; shared UI under `src/components/`.
- **Naming:** PascalCase components; camelCase functions; kebab-case route segments; UPPER_SNAKE_CASE env keys.
- **Tests:** Colocate or place under `tests/` per scaffold; name `*.test.ts` / `*.test.tsx` for Vitest.

## Key principles

1. **Clarity first — always show why** (PRD UX pillar).
2. **Fast decisions — minimal steps** (≤3 clicks to recommendation).
3. **Trust over flashiness**; visible disclaimers on point valuations.
4. **MVP scope discipline:** ship P0 only unless stakeholder explicitly expands scope.

## Quality gates

- Lint + typecheck + unit/integration tests relevant to the change (`agent_docs/testing.md`).
- `REVIEW-CHECKLIST.md` before calling work “done.”
- Browser check on desktop and mobile viewport for UI tasks.
- Pre-commit hooks: add when the codebase exists (format, lint, test subset).

## Key commands (once package.json exists)

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Tests | `npm test` |
| Lint | `npm run lint` |
| Production build | `npm run build` |

## Workflow expectations

- GitHub Flow; Vercel previews on PRs when connected.
- Update `MEMORY.md` when making durable architectural choices or discovering quirks.
- Update `AGENTS.md` phase section when moving between MVP milestones.

## Update cadence for this brief

Refresh when stack, legal/compliance stance, or core user changes; at minimum review after MVP launch or major phase change.
