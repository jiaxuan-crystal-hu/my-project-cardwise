# Product Requirements — CardWise MVP

Source: `docs/PRD-CardWise-MVP.md` (April 2026 draft). Agent should treat PRD + Tech Design as authoritative when this file diverges.

## Product identity

| Field | Value |
|--------|--------|
| **Name** | CardWise |
| **Version** | MVP 1.0 |
| **One-line description** | Explainable engine that picks the best card for a purchase using cashback, points, and benefits—real time, no bank integration in MVP. |

## Primary user story (exact)

> “As a user with multiple credit cards, I want to quickly see which card to use so that I maximize rewards without thinking.”

## Supporting user stories

1. “As a travel-focused user, I want recommendations based on my preferred airline/hotel so that I earn useful points.”
2. “As a parent, I want quick recommendations during everyday spending so that I save money via cashback.”
3. “As an online shopper, I want to see the best card and offers so that I maximize savings.”

## Jobs to be done

1. **Functional:** Choose the best card for any purchase.
2. **Emotional:** Feel confident not leaving rewards on the table.
3. **Efficiency:** Avoid research at checkout.

## P0 — Must-have features (MVP)

### Feature 1: Card Wallet (manual input)

- Select from predefined catalog (20–50 cards); search/add; persist per user.
- Depends on preloaded card database.

### Feature 2: Purchase input (category-based)

- Category required (dining, groceries, travel, etc.); optional amount.
- Depends on category taxonomy.

### Feature 3: Recommendation engine (core)

- Returns **best cashback card** and **best points card**; correct ranking for multiple saved cards.
- Depends on reward rules database.

### Feature 4: Results UI with explanation

- Show top 1–2 recommendations per track; estimated reward value; human-readable reasoning.

### Feature 5: Reward rules database

- Preloaded data for 20–50 cards: categories, multipliers; supports points + cashback.
- Manual seeding acceptable for MVP.

## P1 — Should have (post-MVP unless explicitly pulled in)

- User preference input (cashback vs points, travel goals).
- Manually curated issuer promotions.
- Lightweight usage tracking (estimated savings).

## P2 — Could have

- Merchant-level detection.
- Offer scraping pipeline.
- Cap tracking.
- Browser extension.

## Out of scope (NOT in MVP)

- Bank integrations (e.g., Plaid).
- Real-time transaction sync.
- Advanced offer ingestion.
- Native mobile app.

## Success metrics

### North star

- **# of recommendations per user per week**

### Framework targets

| Category | Metric | Target |
|----------|--------|--------|
| Activation | Add ≥2 cards + run 1 recommendation | 70% |
| Engagement | Recommendations / week | ≥3 |
| Retention | 7-day return | 30% |
| Revenue | N/A MVP | — |

### Additional success criteria (executive summary)

- 70%+ complete onboarding (≥2 cards + ≥1 recommendation).
- 30% 7-day retention.
- Users run ≥3 recommendations/week.
- Qualitative: users report saving money or deciding faster.

## UI / UX requirements

### Design principles

1. Clarity first — always show why.  
2. Fast decisions — minimal steps.  
3. Trust over flashiness.

### Information architecture

- Landing → Auth → Dashboard  
  - Card Wallet  
  - Recommendation Input  
  - Results  
- Settings

### Key flow

User opens app → select category → run recommendation → see best cards → choose card.

### Usability

- Mobile responsive (web-first).
- Minimal clicks (≤3 to recommendation).
- Clear explanations.

## Non-functional requirements (high level)

| Area | Requirement |
|------|-------------|
| **Performance** | Page load &lt; 3s; API target &lt; 3s, max ~5s. |
| **Security** | Email/password auth; **no** storage of card numbers or bank credentials; encryption at rest. |
| **Scalability** | Initial ~10 users; target ~1k without redesign. |

## Constraints & assumptions

### Constraints

- Budget ~$50–200/month (tools/services).
- Timeline: ~1 week MVP (aggressive; scope must stay P0).
- Solo developer.

### Assumptions

- Users know which cards they carry.
- Category input is sufficient for MVP accuracy expectations.
- Users value speed over perfect accuracy.

## MVP definition of done

- All P0 features implemented; recommendation works end-to-end.
- Works on mobile + desktop; no critical bugs.
- Deployed; basic analytics in place.

## Risks (agent awareness)

| Risk | Mitigation theme |
|------|-------------------|
| Stale data | Manual updates + disclaimers |
| Incorrect recs | Simple explainable logic |
| Low trust | Reasoning-first UI |
| Scope creep | Strict P0 checklist |
