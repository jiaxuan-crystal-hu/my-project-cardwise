# CardWise

Explainable credit- and debit-card recommendations for cashback and points—**no bank linking** in the MVP. Users sign in, manage a **card wallet**, and get **category-based recommendations** with a simple rationale.

## Live app

**Production (example):** [https://my-project-cardwise-deploy.vercel.app/](https://my-project-cardwise-deploy.vercel.app/)

Sign up or log in, add cards under **Card wallet**, then use **Recommend** for a purchase category.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Supabase** — Auth + Postgres (Row Level Security)
- **Tailwind CSS**
- **Vercel** — typical hosting (connect GitHub, set env vars)

More product and architecture detail: `docs/`. Agent-oriented notes: [`AGENTS.md`](AGENTS.md).

---

## Requirements

| Tool | Notes |
|------|--------|
| **Node.js** | Per `package.json` engines: 18.18+, 19.8+, or 20+. **Node 16 is not supported.** Prefer **20 or 22 LTS**. |
| **npm** | Comes with Node. |
| **Supabase project** | For local dev: create a free project at [supabase.com](https://supabase.com/dashboard). |

This repo ships **`.nvmrc`** / **`.node-version`** (Node **22**) for `nvm`, `fnm`, etc. `.npmrc` sets **`engine-strict=true`**, so `npm install` fails early if Node is out of range.

### Install or upgrade Node (macOS)

**Homebrew**

```bash
brew install node
node -v   # expect v18.18+; prefer v20+ or v22 LTS
```

**Match repo exactly (Node 22)**

```bash
brew install node@22
# Follow `brew info node@22` for PATH / linking if needed
```

**fnm** (reads `.node-version`)

```bash
brew install fnm
eval "$(fnm env)"   # add to ~/.zshrc or ~/.bashrc for persistence
cd /path/to/CardWise
fnm install && fnm use
node -v
```

If you see **`npm ERR! EBADENGINE`** with “Actual: node v16.x”, your shell is still using old Node. Install 20+, open a **new terminal**, run `which node` and `node -v`, and fix **PATH** so Homebrew’s Node wins (see previous README troubleshooting or `brew info node`).

---

## Installation

From the repository root:

```bash
git clone <YOUR_REPO_URL>
cd CardWise
node -v    # confirm supported version
npm install
```

Copy environment template and fill in values from your Supabase project (**Settings → API**):

```bash
cp .env.example .env.local
```

Edit **`.env.local`** (same folder as `package.json`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (no quotes) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key (no quotes) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for local dev; your **public** site URL in production |

**Never commit `.env.local`** — it is gitignored. Optional: `NEXT_PUBLIC_POSTHOG_*` for analytics (see `.env.example`).

Restart the dev server after any change to `.env.local` (Next loads env at startup).

---

## How to run

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build (local smoke test)

```bash
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000).

### Other scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production build (run after `build`) |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit tests) |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:emit-task4` | Regenerate `src/db/seeds/004_task4_reward_rules.sql` from TS sources |
| `npm run db:verify-task4` | Verify Task 4 seed invariants |

Optional before pushing: `npx tsc --noEmit`.

---

## Supabase setup (local or new project)

### 1. Auth URLs

In Supabase: **Authentication → URL configuration**

- **Site URL:** `http://localhost:3000` (dev) or your deployed origin (e.g. `https://my-project-cardwise-deploy.vercel.app`).
- **Redirect URLs:** include  
  - `http://localhost:3000/auth/callback`  
  - plus your production callback, e.g. `https://my-project-cardwise-deploy.vercel.app/auth/callback`

### 2. Database SQL

In **SQL Editor**, run **migrations in order** (full contents of each file):

1. `src/db/migrations/001_init.sql`
2. `src/db/migrations/002_reward_rules_priority_and_fallback.sql`
3. `src/db/migrations/003_user_cards_custom_cash_top_category.sql`

Then apply **seeds** depending on what you want:

| Seed file | Purpose |
|-----------|---------|
| `src/db/seeds/002_sample_cards.sql` | Minimal sample catalog |
| `src/db/seeds/003_expand_catalog.sql` | Larger sample catalog |
| `src/db/seeds/004_task4_reward_rules.sql` | Task 4 reward rules (pairs with your Task 4 catalog strategy—see `docs/`) |

Avoid mixing duplicate card definitions across seeds unless you understand the overlap; see `docs/phase-004-handoff.md` and seeding docs for the intended combo.

---

## Deploy (summary)

1. Push code to **GitHub**.
2. **Vercel:** Import the repo, framework **Next.js**, deploy.
3. **Vercel → Settings → Environment variables** (Production): set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` to your **live** origin (e.g. `https://my-project-cardwise-deploy.vercel.app`).
4. **Supabase:** Production project (or same project with care): run the same migrations + seeds; add production **Site URL** and **redirect** for `/auth/callback`.
5. Redeploy after changing env vars.

---

## Repository layout

| Path | Contents |
|------|----------|
| `src/app/` | App Router: marketing, auth, legal pages, `dashboard/*` |
| `src/app/api/` | Route handlers: cards, wallet, recommend, recommendation-history, … |
| `src/lib/supabase/` | Browser, server, and middleware Supabase clients |
| `src/services/` | Catalog, wallet, recommendation engine |
| `src/db/migrations/` | Schema migrations (apply in order) |
| `src/db/seeds/` | Seed SQL |
| `docs/` | PRD, handoffs, technical notes |

---

## Legal

`/terms`, `/privacy`, and `/disclaimer` may contain placeholders—replace before a wide public launch. The app shows **estimates only; not financial advice**; no bank or issuer access in the MVP.
