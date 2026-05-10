Product Requirements Document: CardWise MVP
Executive Summary
Product: CardWiseVersion: MVP (1.0)Document Status: DraftLast Updated: April 2026

Product Vision
CardWise is an explainable decision engine that helps users choose the best credit or debit card for any purchase, optimizing for cashback, points, and benefits in real time without requiring bank integration.

Success Criteria
* 70%+ of users complete onboarding (add ≥2 cards + run recommendation)
* 30% 7-day retention
* Users run ≥3 recommendations/week
* Positive qualitative feedback: “this saved me money / helped me decide faster”

Problem Statement
Problem Definition
Users with multiple credit cards cannot easily determine which card maximizes rewards for a given purchase due to:
* complex reward structures (categories, rotating bonuses)
* scattered or forgotten benefits
* time-sensitive offers
* lack of real-time decision tools

Impact Analysis
* User Impact: lost cashback/points, decision fatigue at checkout
* Market Impact: growing multi-card user base (especially travel-focused users)
* Business Impact: opportunity to build trust-based fintech recommendation layer

Target Audience
Primary Persona: “Optimizing Professional”
Demographics:
* Age: 22–40
* Location: US
* Income: mid–high
* Owns: 3+ credit cards
Psychographics:
* Values efficiency and optimization
* Interested in rewards but not tracking details daily
* Wants fast, low-friction decisions

Jobs to Be Done
1. Functional:Choose the best card for any purchase
2. Emotional:Feel confident they are not missing out on rewards
3. Efficiency:Avoid thinking/research at checkout

Current Solutions & Pain Points
Solution	Pain Points	CardWise Advantage
Memory/manual tracking	inaccurate, effort-heavy	automatic recommendation
Blogs (e.g. The Points Guy)	not contextual	real-time decision
Apps like MaxRewards	require sync, unreliable	no login, lightweight
User Stories
Primary User Story
“As a user with multiple credit cards, I want to quickly see which card to use so that I maximize rewards without thinking.”

Supporting Stories
1. “As a travel-focused user, I want recommendations based on my preferred airline/hotel so that I earn useful points.”
2. “As a parent, I want quick recommendations during everyday spending so that I save money via cashback.”
3. “As an online shopper, I want to see the best card and offers so that I maximize savings.”

Functional Requirements
Core Features (MVP — P0)

Feature 1: Card Wallet (Manual Input)
* Description: User selects cards from predefined list (20–50 cards)
* User Value: Enables personalization
* Acceptance Criteria:
    * User can search and add cards
    * Cards persist per user
* Dependencies: preloaded card database

Feature 2: Purchase Input (Category-Based)
* Description: User inputs purchase category (dining, groceries, travel, etc.)
* User Value: Provides context for recommendation
* Acceptance Criteria:
    * Category selection required
    * Optional amount input
* Dependencies: category taxonomy

Feature 3: Recommendation Engine (Core)
* Description: Returns:
    * Best cashback card
    * Best points card
* User Value: Core product functionality
* Acceptance Criteria:
    * Ranking logic executes correctly
    * Supports multiple cards per user
* Dependencies: reward rules database

Feature 4: Results UI with Explanation
* Description: Displays recommendation + reasoning
* User Value: Builds trust
* Acceptance Criteria:
    * Shows top 1–2 cards
    * Shows estimated reward value
    * Displays explanation
* Dependencies: ranking engine output

Feature 5: Reward Rules Database
* Description: Preloaded data for 20–50 cards
* User Value: Enables recommendations
* Acceptance Criteria:
    * Includes categories + multipliers
    * Supports points + cashback
* Dependencies: manual data seeding

Should Have (P1)
* User preference input (cashback vs points, travel goals)
* Manually curated offers (e.g., issuer promotions)
* Lightweight usage tracking (estimated savings)

Could Have (P2)
* Merchant-level detection
* Offer scraping pipeline
* Cap tracking
* Browser extension

Out of Scope (MVP)
* Bank integrations (Plaid)
* Real-time transaction sync
* Advanced offer ingestion
* Native mobile app

Non-Functional Requirements
Performance
* Page Load: < 3s
* API Response:
    * Target: < 3s
    * Max acceptable: < 5s

Security
* Authentication: email/password
* No storage of:
    * card numbers
    * bank credentials
* Data encryption at rest

Usability
* Mobile responsive (web-first)
* Minimal clicks (≤3 to recommendation)
* Clear explanations

Scalability
* Initial: 10 users
* Target: 1,000 users without redesign

UI/UX Requirements
Design Principles
1. Clarity first — always show why
2. Fast decisions — minimal steps
3. Trust over flashiness

Information Architecture
Landing
Auth
Dashboard
  ├── Card Wallet
  ├── Recommendation Input
  ├── Results
Settings

Key Flow
graph LR
A[User opens app] --> B[Select category]
B --> C[Run recommendation]
C --> D[See best cards]
D --> E[Choose card]

Success Metrics
North Star Metric
# of recommendations per user per week

Metrics Framework
Category	Metric	Target
Activation	Add ≥2 cards + run 1 rec	70%
Engagement	Rec/week	≥3
Retention	7-day return	30%
Revenue	N/A (MVP)	—
Constraints & Assumptions
Constraints
* Budget: $50–200/month
* Timeline: 1 week MVP
* Solo developer

Assumptions
* Users know their cards
* Category input is sufficient for MVP
* Users value speed over perfect accuracy

Risk Assessment
Risk	Impact	Mitigation
Data stale	High	manual updates + disclaimers
Incorrect recs	High	simple explainable logic
Low trust	High	clear reasoning UI
Scope creep	High	strict MVP features
MVP Definition of Done
Feature Complete
* All P0 features implemented
* Recommendation works end-to-end
Quality
* Works on mobile + desktop
* No critical bugs
Release Ready
* Deployed
* Basic analytics added

Next Steps
1. Create Technical Design Document
2. Define schema + API
3. Build MVP (vibe coding sprint)
4. Test with 5 users
5. Launch