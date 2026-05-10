# Tech Stack & Tools

CardWise MVP matches `docs/TechDesign-CardWise-MVP.md`.

## Core stack

| Layer | Choice | Notes |
|--------|--------|--------|
| **Frontend** | Next.js App Router + React + TypeScript | Server and Client Components as appropriate; default to Server Components until interactivity needs `"use client"`. |
| **Styling** | Tailwind CSS + shadcn/ui | Clean, fast UI; align with PRD “trust over flashiness.” |
| **Backend** | Next.js Route Handlers + Server Actions | No separate Node service for MVP; keep handlers thin. |
| **Database** | PostgreSQL via Supabase | Relational model for cards, rules, offers, user selections. |
| **Auth** | Supabase Auth (email/password) | No custom credential storage; enable RLS for user-owned rows. |
| **Analytics** | PostHog | Funnel: signup → cards → recommendation → card chosen → return. |
| **Hosting** | Vercel (app) + Supabase Cloud (DB/Auth) | Preview deploys for every branch when connected. |
| **AI-assisted dev** | Cursor (+ ChatGPT for architecture/debug per Tech Design) | This repo’s agent docs are tuned for Cursor. |

## Target repository layout (from Tech Design)

```text
cardwise/
├── src/
│   ├── app/
│   │   ├── (auth)/login|signup
│   │   ├── dashboard/
│   │   ├── recommend/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/{ui,cards,recommendation,forms}/
│   ├── lib/{supabase,analytics,validation,utils}/
│   ├── services/{cards,recommendation,rewards,offers}/
│   ├── db/{migrations,seeds}/
│   ├── types/
│   └── constants/
├── public/
├── tests/
├── .env.local
├── package.json
└── README.md
```

Adjust only if the scaffold already exists and differs—then document the delta in `MEMORY.md`.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

Later (not MVP): `RESEND_API_KEY=`, S3/AWS keys if needed.

## Setup commands (after `package.json` exists)

```bash
npm install
cp .env.example .env.local   # if you maintain an example file
npm run dev
```

Use `npm run lint`, `npm test`, `npm run build` as defined in `package.json` once scripts are added.

## Error handling pattern (Next.js route handler sketch)

```typescript
// Why: one predictable shape for the client and for logging.
import { NextResponse } from "next/server";

type ApiErrorBody = { ok: false; error: { code: string; message: string } };
type ApiOkBody<T> = { ok: true; data: T };

export function jsonError(
  status: number,
  code: string,
  message: string,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export function jsonOk<T>(data: T): NextResponse<ApiOkBody<T>> {
  return NextResponse.json({ ok: true, data });
}
```

Log stack traces server-side only; never leak internal exception text to clients.

## Styling & component example (shadcn-style usage)

```tsx
// Why: small surface area, accessible primitives, matches design system choice.
import { Button } from "@/components/ui/button";

export function RunRecommendationCta(props: { disabled?: boolean }) {
  return (
    <Button type="submit" disabled={props.disabled}>
      See best cards
    </Button>
  );
}
```

## Naming conventions

- **Routes / files:** kebab-case folders under `app/`; `PascalCase.tsx` for React components.
- **Functions / variables:** camelCase.
- **Types / interfaces:** PascalCase.
- **Constants / env:** UPPER_SNAKE_CASE.

## API surface (MVP)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/recommend` | Category (+ optional amount) → best cashback + best points. |
| GET | `/api/cards` | Catalog for wallet picker. |
| GET/POST/DELETE | `/api/user/cards` | User’s saved cards. |
| GET/PUT | `/api/user/preferences` | Cashback vs points bias, travel goals. |
| GET | `/api/offers` | Active manual offers. |
| POST/GET | `/api/recommendation-history` | Persist runs and “I used this card.” |

## Recommendation output shape (TypeScript)

```typescript
// Mirrors Tech Design — keep UI and tests aligned with this contract.
export type RecommendationResult = {
  cashback: {
    cardId: string;
    cardName: string;
    estimatedValue: number;
    explanation: string;
  };
  points: {
    cardId: string;
    cardName: string;
    estimatedPoints: number;
    estimatedDollarValue: number;
    explanation: string;
  };
};
```

## Performance targets (PRD)

- Page load & API: target &lt; 3s; max acceptable ~5s for recommend under load.

## Cost guardrails

- Prefer Vercel/Supabase/PostHog free or low tiers until usage grows; stay within ~$50–200/mo total tooling budget unless product owner approves.
