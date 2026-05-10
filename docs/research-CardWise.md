This is a substantial deep research request. Let me build this out comprehensively with full architecture diagrams, specs, and analysis.Now I have enough to write a comprehensive technical analysis. Let me build this out with architecture diagrams.Now let me write the full technical analysis. This is a long document, so I'll be thorough and precise.

Credit Card Optimizer — Full Architecture & Technical Analysis

1. Data Modeling & Database Design
The core insight: Credit card reward data has three distinct velocity tiers, and conflating them is the #1 cause of schema pain in this domain.
Tier	Data type	Change frequency	Storage approach
Static	Card identity, network, issuer, annual fee	Months–years	Normalized rows in cards
Semi-static	Category multipliers, transfer partners, base earn rates	Weeks–months	Normalized reward_rules rows
Volatile	Rotating bonuses, issuer offers (Amex Offers), portal promotions	Days–weeks	Separate offers table, TTL-indexed
User-specific	Cap usage state, custom valuations, card ownership	Per-session	user_cards + user_prefs
Why hybrid relational + JSONB (not pure JSON, not pure relational):
Pure relational breaks down on transfer_partners because every currency (Chase UR, Amex MR, Capital One Miles, Bilt, Citi TYP) has a different partner list that changes quarterly. Normalizing this into a transfer_partner_map table creates excessive join depth with no query benefit. JSONB lets you store {"Hyatt": {"ratio": 1.0, "min_transfer": 1000}, "United": {"ratio": 1.0}} and query it with Postgres's @> operator when needed.
Pure JSON fails on reward_rules because the critical hot-path query is "given MCC codes [5812, 5411], which rules match for card_ids [uuid1, uuid2, uuid3]?" — this requires a GIN index on an integer array column, which is a native Postgres feature (mcc_codes int[] + GIN index).
Cap modeling is the hardest problem in this domain. Chase Freedom Flex has a $1,500/quarter cap on 5% categories. You don't know the user's cap usage without bank integration. The correct approach:
known_cap_usage JSONB  -- in user_cards
-- e.g. {"chase-freedom-flex:dining:Q1-2026": {"used": 800, "cap": 1500, "confidence": "user_reported"}}
Users can optionally self-report. The scorer applies a cap_consumed_ratio penalty: if usage is unknown, apply a 0.0 penalty but set confidence to LOW and surface the assumption in the output.
Merchant-name normalization should be a separate lookup table, not embedded in reward_rules. A merchant_aliases table mapping "Amazon", "amazon.com", "AMAZON MKTPL" → canonical_name: "Amazon" → mcc_override: 5999 (or issuer-specific overrides) handles the common case where Whole Foods codes as grocery (MCC 5411) under some cards and not others.

2. Recommendation Engine — Deep Spec
A. Three-track vs. unified ranking
The answer is separate tracks with a unified merge layer. Here's why: a card with 5x Amex MR points at Dining and a card with 5% flat cashback at Dining are both "best at dining" but incomparable without knowing the user's cpp valuation. Collapsing them into one score prematurely creates the illusion of precision. Show the user the best in each track with honest reasoning, then let the merge layer pick an overall winner based on their declared preference.
B. Cashback scoring formula
effective_cashback_rate = (
  base_earn_rate
  + category_bonus_rate(mcc_codes, merchant)   -- from reward_rules
  + issuer_statement_credit_rate(offer, amount) -- from offers
) × (1 - cap_consumed_penalty)
  × confidence_weight
cap_consumed_penalty = 0.0 if unknown (with LOW confidence flag), else (used / cap) × 0.3 to model the probabilistic reduction in expected bonus rate across a quarter.
confidence_weight = product of all source confidences feeding into the score. A rule from the issuer's own page gets 0.95; a community-reported rotating bonus gets 0.60.
C. Points scoring formula
Chase Ultimate Rewards are valued at around 2.05 cents per point by The Points Guy as of late 2025, but this is an optimistic top-end figure. Your point_valuations table should store both conservative and optimistic cpp per partner:
effective_cashback_equiv =
  earn_rate(mcc_codes)
  × effective_cpp

where effective_cpp =
  if user.preferred_partners includes this currency's partners:
    lerp(cpp_conservative, cpp_optimistic, 0.7)  -- closer to optimistic
  else:
    cpp_conservative  -- assume base portal value

  × redemption_flexibility_factor
redemption_flexibility_factor: transferable currencies (Chase UR, Amex MR, Capital One Miles, Bilt, Citi TYP) get 1.0–1.1 since they can reach high-value partners. Fixed-value currencies (Discover cashback, simple Venture miles at 1cpp) get 0.85 as a discount reflecting reduced optionality.
The top-end estimate of 1.8 cents per Chase point is based on the highest-value transfer option, World of Hyatt, but not all options are equal — your valuation table must be partner-specific, not currency-level.
D. Transfer partner preference boost
Build a partner_affinity_score into the ranking merge:
partner_affinity_boost =
  0  if no preferred_partners declared
  +0.15  if this currency has any of user.preferred_partners
  +0.25  if this currency's BEST partner for user's goal is available
Example: user says "I want Hyatt points." Chase UR and Capital One Miles both transfer to Hyatt 1:1. Chase wins on hotel value since Hyatt is considered unmatched, so both get the boost, but the earning-rate differential (e.g., Amex Gold 4x dining vs CSP 3x dining) determines the final rank.
E. Offer stacking logic
The safest model for MVP: treat stacking as two independent layers.
Layer 1 (always stackable):  base rewards + category bonus
Layer 2 (usually stackable): issuer-targeted offers (Amex Offers, Chase Offers)
Layer 3 (uncertain):         third-party merchant portals (Rakuten, issuer shopping portals)

total_value = L1 + L2 + L3_if_confidence > 0.6
Surface a "⚠ stacking unconfirmed" flag when L3 is included. Never claim L3 stacks if the offer source is community-reported. This is the correct conservative default — a 70% jump in credit card reward complaints has been reported since the pandemic, with some complaints about issuers hindering or devaluing redemptions — user trust is fragile.
F. MCC merchant classification
MCCs are assigned either by merchant type or by merchant name (e.g., 3000 for United Airlines), and the same business may code differently with different credit cards. This is critical — Costco is MCC 5300 (wholesale clubs) not 5411 (grocery), meaning grocery-bonus cards typically don't activate there.
For MVP: maintain a merchant_mcc_overrides table of the top 500 common merchants with known MCC exceptions, populated manually from community sources like PointsPick and Doctor of Credit. This handles 80% of merchant ambiguity at zero infrastructure cost.
For scale: implement a fuzzy merchant resolver. Input = merchant name string → 1) exact lookup in overrides, 2) fuzzy match via trigram index (pg_trgm), 3) category fallback from user's manual selection, 4) LLM classification if confidence < 0.7.
G. Uncertainty handling — the honest output model
Every recommendation must carry explicit uncertainty signals rather than hiding them. The output schema I've specified above enforces this. Key rules:
* Confidence LOW = data from community/Reddit, no issuer confirmation
* Confidence MED = scraped from issuer site, parsed by AI (possible stale)
* Confidence HIGH = verified against issuer page within 30 days OR directly from issuer API/structured source
Assumptions array should be human-readable strings surfaced in UI: "We assumed you haven't used your Q1 5% cap", "Amex Offer value from community report — verify in your app".
H. User preference modeling
Four-axis model:
1. mode: "cashback" | "points" | "auto"
   -- "auto" = show best of all tracks, user decides

2. redemption_goal: "flights" | "hotels" | "simple_cashback" | "flexible"
   -- determines cpp weighting and partner boost

3. simplicity_weight: 0.0–1.0
   -- high = penalize complex stacking, boost flat-rate cards
   -- applied as: score × (1 - simplicity_weight × complexity_penalty)

4. preferred_partners: string[]
   -- ["World of Hyatt", "United Airlines"]
   -- drives partner_affinity_boost
Don't ask users for all four upfront. Wizard flow: step 1 = cards, step 2 = cashback or points? step 3 (conditional on points) = what for? hotel/flight/simple. Infer simplicity_weight from whether they skip the points preference screen.

3. Data Acquisition Strategy
Source	Quality	Freshness	Cost	Recommended use
Issuer website (manual)	Very high	Stale if not maintained	~4 hrs/week	Top 80 cards core rules
Doctor of Credit	High (expert community)	Near-real-time for bonuses	Free + scraper	Rotating categories, signup bonuses
The Points Guy / NerdWallet	High (professional)	Weekly	Free + scraper	cpp valuations, partner info
Reddit (r/churning, r/creditcards)	Medium (community)	Real-time	Free + NLP	Issuer offer reports, edge cases
Issuer official APIs	Very high	Real-time	N/A — no public APIs exist	Not viable for MVP
Plaid/MX	High (transaction data)	Real-time	$$$, PCI complexity	Skip for MVP
Recommended hybrid ingestion pipeline (Phase 2):
Scheduler (daily) →
  Scraper workers (Playwright headless) →
    AI normalizer (Claude claude-sonnet-4-6 via API) →
      Parsed structured offer objects →
        Confidence scorer (source + freshness + schema completeness) →
          Postgres offers table (upsert with updated_at)
The AI normalizer is the key insight here — use an LLM to parse issuer offer pages (which have inconsistent HTML) into your offer schema. Prompt: "Extract from this HTML: card name, offer type, merchant, credit value, minimum spend, expiry date. Return JSON. If uncertain, return confidence: 0.5."
Data freshness TTL strategy:
* reward_rules (category multipliers): 30-day staleness flag
* offers (rotating/issuer-targeted): 7-day staleness flag → auto-hide if > 14 days old
* point_valuations: 14-day refresh from TPG/NerdWallet

4. Competitor Analysis
App	Model	Key strength	Critical weakness	User complaints
MaxRewards	Bank sync (Plaid), $60/yr Gold	Auto-activates rotating categories, tracks balances	Cards regularly unsync (especially Chase and Amex), requiring re-authentication with 2FA codes 2-4 times per month	Sync reliability, high maintenance burden
CardPointers	Manual setup, freemium	Very fast setup, no bank login required	Limited data depth, no offer intelligence	Missing transfer partner context
AwardWallet	Loyalty program tracker	Integrates with nearly 700 loyalty programs, excellent for miles/points tracking	Not a purchase-time recommender — tells you balances, not "use this card now"	Not useful at POS, no cashback focus
Kudos	Bank sync, freemium + premium	Browser extension is excellent, clean UX	Affiliate-driven card recommendations create conflict of interest	Sponsored card bias
NerdWallet	Content + card finder	Massive SEO reach, trusted brand	Not a wallet optimizer — static comparison tool, not personalized	Not actionable at purchase moment
Your differentiators to build toward:
1. No bank login required — the sync-fatigue problem is the #1 MaxRewards complaint. Manual setup + smart defaults is a feature.
2. Transparent reasoning — every recommendation shows the math. "This card earns 4x MR at dining = 4 × 2.0cpp = 8% equivalent, vs your Sapphire Preferred at 3x = 6%." No competitor does this well.
3. Honest uncertainty — surface confidence levels and assumptions explicitly. Users trust apps more when the app admits what it doesn't know.
4. Points + cashback unified — AwardWallet ignores cashback; most cashback apps ignore points. You can own the "any preference" positioning.

5. Technical Architecture Decisions
Monolith vs. microservices: Start monolith. The ranking engine, card catalog, and user service do not need independent scaling until you have 10K+ DAU. Extract the ranking engine to a Lambda function in Phase 3 when burst traffic at checkout moments creates load spikes.
Rule engine vs. scoring engine: Do not use a general-purpose rule engine (Drools, etc.) — overkill and complex to maintain. Implement the scoring formulas as plain TypeScript/Python functions. The "rules" are just database rows that parameterize those functions. This is the correct tradeoff for this problem domain.
Real-time vs. precomputed: Precompute rankings for common (category, user_card_set) combinations at off-peak hours; cache in Redis with a 1-hour TTL. For novel queries (specific merchant, uncommon card combinations), compute on-demand at ~50–200ms. The cache hit rate will be high because most users ask about the same 20 categories.
AWS stack for MVP:
* EC2 t3.small or ECS Fargate (Node/Python app) — ~$25/mo
* RDS Postgres t3.micro — ~$18/mo
* Elasticache Redis t3.micro — ~$16/mo
* CloudFront + S3 (React static build) — ~$5/mo
* SES (email, optional) — near-free
* Total MVP: ~$65–80/mo
Database choice: Postgres is the correct single choice. It handles relational queries, JSONB, full-text search (for merchant name lookup), pg_trgm (fuzzy matching), integer array GIN indexes (MCC lookup), and row-level security (for multi-tenant user data). Do not add MongoDB alongside it — you don't need two databases.

6. PCI & Compliance
This app does not trigger PCI DSS because it stores no card numbers, no bank credentials, and no transaction data. You are storing card product data (e.g., "Chase Sapphire Preferred") not card account data. Key rules:
* Never store card account numbers, CVVs, or expiry dates
* Never store bank login credentials (even if using Plaid, Plaid handles that layer)
* User PII (email, name) should be encrypted at rest (RDS encryption on by default)
* Apply standard OWASP practices — rate limiting, input validation, JWT auth with short expiry
If you add Plaid integration later (for cap tracking), that triggers a review of your Plaid agreement and requires SOC 2 Type I at minimum for enterprise customers, but not for consumer MVP.

7. Monetization & Cost Model
Model	Revenue potential	Conflict of interest risk	Recommended?
Affiliate card application links	Medium-high ($50–$200 per approved app)	High — creates ranking bias pressure	Yes, but disclosed and ring-fenced from algorithm
Premium subscription ($4.99–9.99/mo)	Predictable SaaS MRR	None	Yes — primary model
Premium features: offer tracking, custom cpp, browser ext	Freemium conversion driver	None	Yes
B2B API (financial advisors, tools)	High value, low volume	None	Phase 3
Advertising	Conflicts with trust	Very high	No
Critical: If you implement affiliate links, the ranking algorithm must be provably independent of affiliate relationships — consider an explicit disclosure banner and a "no affiliate filtering" toggle. This is what differentiates you from Kudos and NerdWallet whose card recommendations are affiliate-influenced.

8. Key Implementation Risks & Mitigations
Risk	Severity	Mitigation
Data staleness (offer expired, wrong rate)	High	Confidence decay + staleness banners; "verify before use" CTA
MCC mismatch (e.g., Costco codes wrong)	High	Merchant override table for top 500 merchants; note in UI
Cap state unknown	Medium	Always show assumption; let user self-report
Issuer terms change (Chase drops transfer partner)	Medium	14-day refresh job; admin alert on structural changes
Scraping blocked	Medium	Mix scraping + manual curation; use rotating proxies sparingly
Transfer point valuation volatility	Low-Medium	Store both conservative and optimistic; default conservative
Regulatory (CFPB attention on rewards accuracy)	Low (for now)	Complaints about credit card rewards have surged 70% since the pandemic — accurate, caveat-heavy output is your liability shield
Final Prioritized Build Order
Weeks 1–2: Postgres schema (cards + reward_rules) + admin seeder for top 50 cards. Cashback scorer function (Python/TypeScript). REST endpoint: POST /recommend → returns top 3 cashback cards.
Weeks 3–4: React UI — card setup wizard, category picker, recommendation display with reasoning. Deploy to AWS (Fargate + RDS). Auth (Cognito or Auth0).
Weeks 5–6: Points track. point_valuations table. User preference wizard (cashback vs. points, redemption goal, partner preference). Merge layer.
Weeks 7–8: Offers table. Basic issuer offer display (manually entered). Confidence flags in UI. Assumptions tooltip. Browser extension skeleton (reads URL → suggests card).
Month 3+: AI scraper pipeline. Rotating category automation. Merchant MCC lookup. PWA / mobile-ready. Affiliate integration with disclosed ranking separation.
The architecture is sound for a funded startup and differentiated enough from the existing field. The biggest execution risk is data maintenance — underestimate it and your confidence scores will crater user trust. Budget at least 20% of engineering time ongoing to data quality, not just features.
