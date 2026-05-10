Technical Design Document: CardWise MVP
Executive Summary
System: CardWiseVersion: MVP 1.0Architecture Pattern: Full-stack monolithPrimary Goal: Ship a polished web MVP in about 1 week that lets users save their cards, enter a purchase category, and get the best cashback and best points recommendation.
Architecture Overview
Recommended Architecture
Primary recommendation: Next.js monolith + Supabase + Vercel
Why this is the best fit:
* fastest to build
* one codebase for frontend and backend
* easy deployment and preview environments
* real PostgreSQL backend without self-managing infra
* good portfolio credibility
Alternatives considered
Option	Pros	Cons	Recommendation
Next.js + Supabase + Vercel	Fastest MVP, simple deploys, strong DX, full-stack in one repo	Some vendor coupling, less AWS-native	Best choice
React + Express + Postgres + Vercel/Railway	Clear separation of concerns, flexible backend	More boilerplate, slower to build	Good later, not week-1
React + Python/FastAPI + Postgres	Nice for future data/ML logic	Slower for MVP, more moving parts	Good if product becomes data-heavy
Java backend + React frontend	Strong enterprise feel	Slowest to ship, overkill for MVP	Not recommended now
Final stack
* Frontend: Next.js + TypeScript
* Styling: Tailwind CSS + shadcn/ui
* Backend: Next.js Route Handlers / Server Actions
* Database: Supabase Postgres
* Auth: Supabase Auth
* Analytics: PostHog
* Hosting: Vercel
* Dev tools: Cursor + ChatGPT
* Testing: Vitest + React Testing Library, light Playwright optional
High-Level Architecture
graph TB
    A[Web Client - Next.js] --> B[Next.js App Server]
    B --> C[Supabase Auth]
    B --> D[Supabase Postgres]
    B --> E[PostHog]

    subgraph App
      B1[UI Pages]
      B2[Recommendation Engine]
      B3[API Routes / Server Actions]
    end

    B --> B1
    B --> B2
    B --> B3
Core Technical Decisions
Frontend
Recommendation: Next.js App Router
Why:
* built-in routing
* server/client component flexibility
* good support in Cursor and AI tooling
* easy Vercel deployment
Alternative:
* plain React + Vite is simpler conceptually, but you lose the full-stack convenience.
Backend
Recommendation: Next.js backend layer only for MVP
Why:
* no separate backend service to maintain
* recommendation engine can live as internal service functions
* API routes are enough for this scope
Trade-off:
* if CardWise grows, you may later split ranking/data ingestion into separate services.
Database
Recommendation: PostgreSQL via Supabase
Why:
* relational data fits your domain well
* reward rules, cards, offers, user selections all benefit from SQL
* Supabase reduces setup time significantly
Alternatives:
* MongoDB: flexible, but weaker fit for structured reward logic
* MySQL: workable, but Supabase Postgres ecosystem is better for your stack
* Oracle: no reason for MVP
Infrastructure
Recommendation: Vercel + Supabase, not AWS-first
Why:
* lowest friction for launch
* preview environments out of the box
* cheaper and easier than setting up AWS compute + db + deploy pipeline immediately
Trade-off:
* not fully AWS-aligned early
* if later needed, you can move parts to AWS gradually
Project Structure
cardwise/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── recommend/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── cards/
│   │   ├── recommendation/
│   │   └── forms/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── analytics/
│   │   ├── validation/
│   │   └── utils/
│   ├── services/
│   │   ├── cards/
│   │   ├── recommendation/
│   │   ├── rewards/
│   │   └── offers/
│   ├── db/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── types/
│   └── constants/
├── public/
├── tests/
├── .env.local
├── package.json
└── README.md
Database Design
Design approach
For MVP, keep it mostly relational and simple. Do not overbuild the future ingestion model yet.
Tables
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  network TEXT,
  card_type TEXT NOT NULL, -- credit / debit
  annual_fee INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  reward_mode TEXT NOT NULL, -- cashback / points
  category TEXT NOT NULL,    -- dining / groceries / hotel / flight / etc
  multiplier NUMERIC(8,2),   -- e.g. 3.0x points
  cash_percent NUMERIC(8,2), -- e.g. 5.0
  points_currency TEXT,      -- MR / UR / TY / cashback / etc
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transfer_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  points_currency TEXT NOT NULL,
  partner_name TEXT NOT NULL,   -- Hyatt / United
  transfer_ratio NUMERIC(8,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  merchant TEXT,
  category TEXT,
  offer_type TEXT NOT NULL,     -- cashback / statement_credit / points_bonus
  value_text TEXT NOT NULL,     -- store human readable description
  value_numeric NUMERIC(10,2),  -- optional if parseable
  min_spend NUMERIC(10,2),
  expires_at TIMESTAMPTZ,
  source_type TEXT NOT NULL DEFAULT 'manual',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  nickname TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  prefers_cashback BOOLEAN DEFAULT FALSE,
  prefers_points BOOLEAN DEFAULT TRUE,
  travel_goal TEXT,             -- flights / hotels / cashback / flexible
  preferred_airline TEXT,
  preferred_hotel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_category TEXT NOT NULL,
  purchase_amount NUMERIC(10,2),
  recommended_cashback_card_id UUID REFERENCES cards(id),
  recommended_points_card_id UUID REFERENCES cards(id),
  selected_card_id UUID REFERENCES cards(id),
  estimated_cash_saved NUMERIC(10,2),
  estimated_points_gained NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
Indexes
CREATE INDEX idx_reward_rules_card_category ON reward_rules(card_id, category);
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_offers_card_active ON offers(card_id, is_active);
CREATE INDEX idx_recommendation_history_user_id ON recommendation_history(user_id);
Why this schema works
Best part
* easy to seed manually
* easy to query
* easy to explain in interviews / portfolio
* enough room to extend later
Trade-off
* not yet optimized for messy scraped data
* not yet modeling caps deeply
* not yet modeling confidence scores
That is fine. Those belong in phase 2.
Recommendation Engine Design
MVP recommendation strategy
Use two tracks:
* best cashback card
* best points card
This matches your product direction and avoids messy comparisons between cash and points.
Inputs
* user saved cards
* purchase category
* optional purchase amount
* optional user preference:
    * cashback
    * flights
    * hotels
    * flexible points
Core logic
Cashback
For each user card:
1. find matching reward rule by category
2. compute cashback value
3. optionally add any active manual offer
4. sort descending
Formula:
estimatedCashValue = purchaseAmount * (cashPercent / 100)
If offer exists:
estimatedCashValue += offerValueIfApplicable
Points
For each user card:
1. find category multiplier
2. find points currency
3. apply base valuation
4. boost score if user preference matches transfer partner ecosystem
5. sort descending
Formula:
estimatedPoints = purchaseAmount * multiplier
estimatedPointDollarValue = estimatedPoints * centsPerPoint
Example default valuations:
* UR: 0.018
* MR: 0.017
* TY: 0.015
* Cashback: 0.01
These are app-defined estimates, not guaranteed real value. Show that clearly in UI.
Preference boost
Simple MVP boost:
* if travel goal = hotels and card currency transfers to Hyatt, multiply score by 1.1
* if travel goal = flights and currency transfers to United, multiply by 1.1
Keep this static and transparent.
Output shape
type RecommendationResult = {
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
Recommendation engine alternatives
Option	Pros	Cons	Use now?
Hardcoded rule functions	Fastest, easy to debug	Less flexible	Good for week 1
DB-driven rules	More maintainable	Slightly more setup	Best choice
AI ranking	Flexible later	Expensive, opaque, unnecessary	No
Recommendation: DB-driven rules + plain TypeScript service functions.
API Design
Auth
Handled mostly by Supabase Auth.
App routes / handlers
POST   /api/recommend
GET    /api/cards
GET    /api/user/cards
POST   /api/user/cards
DELETE /api/user/cards/:id
GET    /api/user/preferences
PUT    /api/user/preferences
GET    /api/offers
POST   /api/recommendation-history
GET    /api/recommendation-history
Example request
POST /api/recommend
{
  "category": "dining",
  "amount": 120,
  "userId": "uuid"
}
Example response
{
  "cashback": {
    "cardId": "uuid-1",
    "cardName": "Blue Cash Preferred",
    "estimatedValue": 7.2,
    "explanation": "6% cashback on dining category assumption for this example"
  },
  "points": {
    "cardId": "uuid-2",
    "cardName": "Amex Gold",
    "estimatedPoints": 480,
    "estimatedDollarValue": 8.16,
    "explanation": "4x points on dining with default Membership Rewards valuation"
  }
}
Feature-by-Feature Implementation
1. Auth
Choice: Supabase Auth with email/password
Why:
* simplest setup
* secure enough for MVP
* avoids building auth yourself
Alternative:
* Clerk is smoother UI-wise, but adds another service and cost path.
2. Card wallet
Implementation:
* searchable card picker from seeded cards
* save selected cards to user_cards
UI:
* search input
* issuer grouping
* selected cards section
3. Purchase input
Implementation:
* simple form with:
    * category dropdown
    * optional amount
    * optional preference reminder
4. Recommendation results
Implementation:
* show top cashback and top points recommendation cards side-by-side
* explanation under each
* CTA: “I used this card”
5. Tracking
Implementation:
* when user clicks selected card, save record in recommendation_history
* use this later to calculate “cash saved / points boosted”
UI / UX Technical Direction
Design system
Recommendation: Tailwind CSS + shadcn/ui
Why:
* fast
* modern
* highly customizable
* excellent for clean/simple UI
Alternative:
* Material UI is faster for generic enterprise UI, but less aligned with your clean, premium product feel.
Key screens
* Landing page
* Login / signup
* Dashboard
* Add cards screen
* Recommendation input screen
* Results screen
* Settings / preferences
UX rules
* recommendation flow should take 3 clicks or fewer
* always explain why a card is recommended
* do not show too many advanced settings initially
* mobile responsive from day 1 even though web-first
Security Design
Data sensitivity
You store:
* email
* auth credentials via provider
* saved card list
* recommendation history
* preferences
This is private / light PII, not high-risk financial account data.
MVP security requirements
* Supabase Auth for login
* row-level access rules so users only access their own data
* server-side input validation
* basic rate limiting on auth and recommendation endpoints
* HTTPS via Vercel
* no card numbers, CVV, bank logins, or financial account linking
Compliance guidance
For MVP:
* privacy policy
* terms/disclaimer
* do not imply financial advice
* do not claim exact personalized rewards if you don’t verify targeted offers
This keeps you out of unnecessary PCI-style complexity.
Analytics
Recommendation
PostHog
Track:
* sign up
* add first card
* add second card
* run recommendation
* choose recommended card
* return visit in 7 days
These directly map to your PRD metrics.
Testing Strategy
Recommendation
Light MVP testing + some unit tests
What to test
Unit tests:
* recommendation service logic
* point valuation logic
* partner preference boost logic
Integration tests:
* add card flow
* recommendation endpoint returns valid structure
Manual/E2E:
* full happy path:signup → add cards → input category → see recommendation → choose a card
Alternatives
Testing level	Pros	Cons	Recommendation
Unit only	Fastest	Misses flow issues	Not enough alone
Light manual + unit	Good MVP balance	Less automated confidence	Best choice
Full E2E suite	Strong confidence	Too much setup for week 1	Later
Dev Workflow
Recommended workflow
* Git strategy: GitHub Flow
* Deploy: Vercel auto-deploy
* Environments: Local + Preview + Prod
* AI coding: Cursor first, ChatGPT for architecture/debugging
Why not GitHub Actions first?
Vercel already handles the deployment side with much less setup. GitHub Actions can come later if you want extra checks.
Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
Later:
RESEND_API_KEY=
S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
Deployment
Primary recommendation
Vercel
Why:
* easiest Next.js deployment
* preview deployments built in
* great for solo dev speed
Database
Supabase cloud
Alternative deployment options
Option	Pros	Cons	Use now?
Vercel	Fastest, easiest	Less AWS-native	Yes
AWS Amplify	Closer to AWS preference	More setup friction	Maybe later
Railway	Easy app hosting	Less ideal than Vercel for Next.js	Not first choice
Cost Breakdown
These are approximate and should be checked on vendor pricing pages before launch.
MVP expected monthly cost
* Vercel: free or low-cost initially
* Supabase: free tier likely enough for 10–50 users
* PostHog: generous starting tiers/self-host option later
* Domain: optional, around normal annual domain pricing
* Cursor: your existing dev tool cost
Expected MVP range
Likely within your $50–200/month budget, and probably well below it at first.
Realistic Timeline
1-week MVP plan
Day 1
* initialize Next.js app
* set up Supabase project
* set up auth
* deploy hello-world to Vercel
Day 2
* create DB schema
* seed 20–50 cards
* build card wallet UI
Day 3
* build purchase input UI
* implement recommendation service v1
Day 4
* build results page
* add explanations
* add user preference fields
Day 5
* save recommendation history
* add PostHog events
* improve styling
Day 6
* manual QA
* write privacy/disclaimer pages
* fix bugs
Day 7
* polish
* deploy
* test with 5 users
Is 1 week realistic?
Yes, if you stay disciplined.It is only realistic if you:
* do not add scraping
* do not add mobile app
* do not add bank sync
* do not over-engineer ranking
Future Architecture Path
Phase 2
* admin interface for manually managing offers
* richer points preferences
* merchant-level detection
* confidence/uncertainty display
* Resend email support
Phase 3
* ingestion pipeline for messy offers
* AI-assisted parsing
* natural language input
* S3 storage if needed
* maybe separate ranking/ingestion services
AI / LLM Roadmap
Not in MVP
* no user-facing AI
* no AI-based recommendation logic
Later use cases
* parse Reddit/forum offer posts into structured rows
* merchant classification
* natural language query input
This is the right order. AI should help your data operations later, not complicate the MVP now.
Risks and Mitigation
Risk	Probability	Impact	Mitigation
Stale reward rules	Medium	High	start with fixed seed data only
Wrong recommendation logic	Medium	High	keep formulas simple and explainable
Users don’t trust app	High	High	always show reasoning + disclaimers
Scope creep	High	High	strict MVP checklist
Data maintenance becomes heavy	Medium	Medium	manual curation only in MVP
Definition of Technical Success
The implementation is technically successful when:
* users can sign up and log in
* users can add at least 2 cards
* users can run a recommendation by category
* app returns best cashback and best points card
* recommendation history saves correctly
* app is deployed on Vercel
* it works on Chrome and Safari
* monthly cost stays comfortably under budget

I’ve created your Technical Design Document above. This document defines HOW to build what’s described in your PRD.
Self-Verification Checklist
Required Section	Present?
Platform/approach clearly chosen	Yes
Alternatives compared with pros/cons	Yes
Tech stack fully specified	Yes
Trade-offs honestly acknowledged	Yes
Cost breakdown included	Yes
Timeline realistic	Yes
AI assistance strategy defined	Yes
Critical Review Questions
1. Does this tech stack match the budget?Yes — this is one of the cheapest credible full-stack options for your MVP.
2. Does the timeline match the complexity?Yes, but only if you keep the scope exactly as defined.
3. Are there any security concerns?Yes, but manageable:
* protect user data with auth + RLS
* don’t store real financial account data
* add privacy policy + disclaimers