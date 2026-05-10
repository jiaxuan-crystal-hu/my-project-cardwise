# CardWise

Explainable credit- and debit-card recommendations (MVP). Product and architecture docs live in `docs/`; AI agent instructions in `AGENTS.md` and `agent_docs/`.

## Requirements

- **Node.js** matching [Next.js 15](https://nextjs.org/docs/app/getting-started/installation): **`^18.18.0 || ^19.8.0 || >=20.0.0`**. **Node 16 (e.g. 16.13.2) is not supported** and will fail when running `next dev` / `next build`.
- **Recommended:** **Node 20+** (current `@supabase/supabase-js` releases target Node 20+; use 20 or 22 LTS to avoid engine warnings).
- **npm**
- A **Supabase** project for Auth + Postgres

### Install or upgrade Node (no nvm required)

If `nvm` is not installed (`bash: nvm: command not found`), pick **one** of these on macOS:

**Option A — Homebrew (simplest if you use brew)**

```bash
brew install node
node -v   # expect v18.18+ (prefer 20+ or 22 LTS)
```

If you need exactly **22** to match `.nvmrc`, use `brew install node@22` and follow `brew info node@22` for PATH / linking.

**Option B — Official installer**

Download the **LTS** macOS installer from [nodejs.org](https://nodejs.org/), run it, then open a **new** terminal and run `node -v`.

**Option C — fnm** (lightweight version manager; reads `.node-version`)

```bash
brew install fnm
eval "$(fnm env)"   # add same line to ~/.bashrc or ~/.zshrc
cd /path/to/CardWise
fnm install
fnm use
node -v
```

**Option D — nvm** (only if you want it)

Install from [nvm-sh/nvm](https://github.com/nvm-sh/nvm#installing-and-updating), restart your shell, then from this repo: `nvm install` (uses `.nvmrc`).

This repo includes **`.nvmrc`** and **`.node-version`** set to **22** for tools that read them (`nvm`, `fnm`, `asdf`).

`package.json` sets **`engine-strict=true`** in `.npmrc`, so `npm install` will **error** if your Node version is outside the supported range instead of failing later at `next build`.

### `npm ERR! EBADENGINE` — “Actual: node v16.x”

That message means **this shell is still using Node 16**. Installing Node 20+ is not enough until your **PATH** picks it up.

1. Install a supported Node (see **Install or upgrade Node** above), e.g. `brew install node`.
2. **Open a new terminal tab/window** (or run `hash -r` in bash).
3. Check what runs:

   ```bash
   which node
   node -v
   ```

   You want `node -v` to show **v18.18+** or **v20+**. If it still shows **v16**, your PATH prefers an old Node (often `/usr/local/bin/node`). Put Homebrew first, e.g. in `~/.zshrc`:

   ```bash
   export PATH="/opt/homebrew/bin:$PATH"   # Apple Silicon; Intel Mac may use /usr/local/bin
   ```

   Then `source ~/.zshrc` and verify again.

4. **Do not** remove `engine-strict` to “fix” the error—Next.js still will not run on Node 16.

## Quick start

```bash
node -v   # must be 18.18+, 19.8+, or 20+ (see Requirements)
npm install
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (no quotes; same folder as package.json)
# Restart the dev server whenever you change .env.local — Next.js only loads env at startup.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, then add cards under **Card wallet** (`/dashboard/wallet`) and run **Recommend** (`/dashboard/recommend`) for a purchase category. Sample data only has rules for a few category/card pairs—add `reward_rules` in Supabase to cover more.

### Supabase configuration

1. **Auth → URL configuration:** set Site URL to `http://localhost:3000` (and your production URL later).  
2. **Redirect URLs:** add `http://localhost:3000/auth/callback` (and production equivalent).  
3. **Database:** run `src/db/migrations/001_init.sql` in the SQL editor, then `src/db/seeds/002_sample_cards.sql` for sample catalog rows.

### Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Next.js dev server       |
| `npm run build`| Production build         |
| `npm run lint` | ESLint                   |
| `npm test`     | Vitest (unit tests)      |

## Repository layout

- `src/app/` — App Router pages (auth, dashboard, wallet, auth callback)
- `src/app/api/` — Route handlers (`/api/cards`, `/api/user/cards`, `/api/recommend`, `/api/recommendation-history`, …)
- `src/lib/supabase/` — Browser + server Supabase clients
- `src/services/` — Domain logic (cards catalog/wallet, recommendation helpers)
- `src/db/migrations` & `src/db/seeds` — SQL artifacts to apply in Supabase
- `docs/` — PRD, technical design, research

## Deploy

Connect the GitHub repo to **Vercel**, set the same `NEXT_PUBLIC_*` env vars, add production **Auth redirect URLs** in Supabase, and deploy from the default Next.js preset.
