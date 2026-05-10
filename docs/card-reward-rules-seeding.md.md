Below is a **Markdown handoff you can save as** `docs/card-reward-rules-seeding.md` and give to Cursor.

It includes:

* fallback/default logic instructions
* updated card reward mappings
* clean category rules for your MVP
* notes where the issuer rules are more nuanced than your current category model

The reward structures below were checked against current issuer pages and official help pages. Chase Sapphire Preferred currently shows 5x Chase Travel, 2x other travel, 3x dining, 3x online grocery, 3x select streaming, and 1x all other purchases. Chase Sapphire Reserve currently shows 8x Chase Travel, 4x flights booked direct, 4x hotels booked direct, 3x dining, and 1x all other purchases. World of Hyatt currently shows up to 9x at Hyatt, 2x on dining, airfare purchased directly with airlines, local transit and commuting, and gym memberships, plus 1x on all other purchases. Amex Platinum currently shows 5x on flights booked directly with airlines or via Amex Travel and 5x on prepaid hotels via Amex Travel, then 1x otherwise. Amex Gold currently shows 4x restaurants worldwide, 4x U.S. supermarkets, 3x flights booked directly with airlines or via Amex Travel, and 1x otherwise. Blue Cash Everyday and Blue Cash Preferred, Citi Double Cash, Citi Custom Cash, Citi AAdvantage Platinum Select, and Marriott Bonvoy Bold/Boundless mappings below are likewise based on official issuer/help pages. ([Chase Credit Cards][1])

````md
# CardWise Reward Rules Seeding Guide

## Purpose

This file tells Cursor how to seed card reward rules for CardWise and how to implement fallback/default logic so that "Everything else" is handled correctly.

This is for MVP.
Do not overbuild.
Use manual rule seeding first.
Do not add scraping or AI ingestion yet.

---

## 1. Important rule design decision: "Everything else" is a fallback, not a literal category

For reward programs, "Everything else" means:

- if a purchase matches a more specific rule, use the specific rule
- otherwise use the default earn rate for that card

Examples:
- Chase Sapphire Preferred dining => use 3x dining
- Chase Sapphire Preferred streaming => use 3x streaming
- Chase Sapphire Preferred hotel booked directly => no exact hotel rule, so use travel or fallback depending on current mapped input
- random store purchase => use 1x fallback

### Implementation requirement

Cursor should revise the current reward rule selection logic to:

1. try exact match first
2. if no exact match, try fallback rule
3. fallback rule should be a reward row where:
   - `is_fallback = true`
   - and usually `category = "other"`

### Expected pseudocode

```ts
function pickApplicableRule(rules, inputCategory) {
  const exact = rules.find((r) => r.category === inputCategory);
  if (exact) return exact;

  const fallback = rules.find((r) => r.is_fallback === true || r.category === "other");
  return fallback ?? null;
}
````

### Important note

Do NOT duplicate the fallback value into every unmatched category unless absolutely necessary.

Preferred structure:

* a few explicit rows
* one fallback row

Bad structure:

* repeating 1x or 1% across every non-bonus category row

---

## 2. Category model for MVP

### User-facing categories

* Dining
* Groceries
* Streaming
* Flights
* Hotels
* Travel
* Online shopping
* Other

### Internal mapped categories

* `dining`
* `online_grocery`
* `streaming`
* `flight_direct`
* `hotel_direct`
* `chase_travel`
* `travel_other`
* `other`

### Important simplification for MVP

The current internal category names are not perfect representations of issuer rules.

Use these practical rules:

* `online_grocery` = general grocery bucket for MVP, even when issuer says "U.S. supermarkets" or "grocery stores"
* `travel_other` = generic travel bucket, and may temporarily absorb:

  * transit
  * rideshare
  * food delivery where needed
  * gym/commuting if no better category exists
* `other` = fallback/default only, plus unsupported issuer-specific categories that do not have a clean MVP bucket
* `online shopping` currently maps to `other` unless a specific card has a strong online retail rule

Do not introduce too many new internal categories in MVP unless absolutely necessary.

---

## 3. General schema expectations for reward rules

Each seeded reward rule object should support fields like:

```ts
type RewardRuleSeed = {
  card_name: string;
  issuer: string;
  reward_mode: "points" | "cashback";
  category: string;
  multiplier?: number;
  cash_percent?: number;
  points_currency?: string;
  notes?: string;
  priority?: number;
  is_fallback?: boolean;
};
```

Recommended behavior:

* specific rules get lower priority numbers, like 10 or 20
* fallback row gets `is_fallback: true`
* `notes` should preserve exclusions/caps/nuances

---

## 4. Card reward rule seeds

## 4.1 Chase Sapphire Preferred

### Human-readable summary

* Chase Travel: 5x on travel purchased through Chase Travel
* Travel: 2x on other travel purchases
* Dining: 3x
* Groceries: 3x on online grocery purchases
* Streaming: 3x on select streaming services
* Other: 1x
* Extra note: online grocery excludes Target, Walmart, and wholesale clubs
* Extra note: anniversary 10% points bonus exists, but do NOT include it in per-swipe recommendation logic

### Seed instructions

```ts
[
  {
    card_name: "Chase Sapphire Preferred",
    issuer: "Chase",
    reward_mode: "points",
    category: "chase_travel",
    multiplier: 5,
    points_currency: "UR",
    notes: "Travel purchased through Chase Travel. Excludes hotel purchases that qualify for the annual Chase Travel hotel credit.",
    priority: 10
  },
  {
    card_name: "Chase Sapphire Preferred",
    issuer: "Chase",
    reward_mode: "points",
    category: "travel_other",
    multiplier: 2,
    points_currency: "UR",
    notes: "Other travel purchases outside Chase Travel.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Preferred",
    issuer: "Chase",
    reward_mode: "points",
    category: "dining",
    multiplier: 3,
    points_currency: "UR",
    notes: "Includes delivery, takeout, and dining out.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Preferred",
    issuer: "Chase",
    reward_mode: "points",
    category: "online_grocery",
    multiplier: 3,
    points_currency: "UR",
    notes: "Online grocery purchases. Excludes Target, Walmart, and wholesale clubs.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Preferred",
    issuer: "Chase",
    reward_mode: "points",
    category: "streaming",
    multiplier: 3,
    points_currency: "UR",
    notes: "Select streaming services.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Preferred",
    issuer: "Chase",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "UR",
    notes: "Fallback default earn rate for all unmatched purchases.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.2 Chase Sapphire Reserve

### Human-readable summary

* Chase Travel: 8x
* Flights booked direct: 4x
* Hotels booked direct: 4x
* Dining: 3x
* Other: 1x
* Important: this is materially different from older Sapphire Reserve structures, so seed the current version

### Seed instructions

```ts
[
  {
    card_name: "Chase Sapphire Reserve",
    issuer: "Chase",
    reward_mode: "points",
    category: "chase_travel",
    multiplier: 8,
    points_currency: "UR",
    notes: "All purchases through Chase Travel, including The Edit.",
    priority: 10
  },
  {
    card_name: "Chase Sapphire Reserve",
    issuer: "Chase",
    reward_mode: "points",
    category: "flight_direct",
    multiplier: 4,
    points_currency: "UR",
    notes: "Flights booked direct.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Reserve",
    issuer: "Chase",
    reward_mode: "points",
    category: "hotel_direct",
    multiplier: 4,
    points_currency: "UR",
    notes: "Hotels booked direct.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Reserve",
    issuer: "Chase",
    reward_mode: "points",
    category: "dining",
    multiplier: 3,
    points_currency: "UR",
    notes: "Dining worldwide.",
    priority: 20
  },
  {
    card_name: "Chase Sapphire Reserve",
    issuer: "Chase",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "UR",
    notes: "Fallback default earn rate for all unmatched purchases.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.3 World of Hyatt Credit Card

### Human-readable summary

* Hyatt hotels: personal card earns hotel points at Hyatt, and issuer markets it as up to 9x total at Hyatt because card points stack with Marriott/Hyatt program earning; for CardWise swipe logic, only seed the card earn rate, not total ecosystem earnings
* Dining: 2x
* Flights: 2x when airfare is purchased directly from airlines
* Travel: 2x for local transit and commuting
* Other lifestyle category: 2x on fitness club and gym memberships
* Other: 1x

### MVP mapping decision

Because there is no gym category:

* map gym/fitness to `other` for now, but mention in notes
  Because there is no transit category:
* map local transit/commuting to `travel_other`

### Seed instructions

```ts
[
  {
    card_name: "World of Hyatt Credit Card",
    issuer: "Chase",
    reward_mode: "points",
    category: "hotel_direct",
    multiplier: 4,
    points_currency: "Hyatt",
    notes: "Card earn rate at Hyatt hotels and resorts only. Do not include member-status stack in card rule.",
    priority: 10
  },
  {
    card_name: "World of Hyatt Credit Card",
    issuer: "Chase",
    reward_mode: "points",
    category: "dining",
    multiplier: 2,
    points_currency: "Hyatt",
    notes: "Dining category.",
    priority: 20
  },
  {
    card_name: "World of Hyatt Credit Card",
    issuer: "Chase",
    reward_mode: "points",
    category: "flight_direct",
    multiplier: 2,
    points_currency: "Hyatt",
    notes: "Airfare purchased directly from the airline.",
    priority: 20
  },
  {
    card_name: "World of Hyatt Credit Card",
    issuer: "Chase",
    reward_mode: "points",
    category: "travel_other",
    multiplier: 2,
    points_currency: "Hyatt",
    notes: "Local transit and commuting.",
    priority: 20
  },
  {
    card_name: "World of Hyatt Credit Card",
    issuer: "Chase",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "Hyatt",
    notes: "Fallback default earn rate. Gym/fitness 2x exists on the card but is not modeled cleanly in current MVP categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.4 Amex Platinum

### Human-readable summary

* Flights: 5x on flights booked directly with airlines or through Amex Travel
* Hotels: 5x on prepaid hotels booked through Amex Travel
* Other: 1x
* Important: direct hotel bookings are not the same as Amex Travel prepaid hotel bookings

### MVP mapping decision

* map Amex Travel prepaid hotels into `hotel_direct` for now, but preserve note that it is really Amex Travel prepaid hotel logic
* for flights, direct airline and Amex Travel both count, but current category system does not distinguish booking channel

### Seed instructions

```ts
[
  {
    card_name: "Amex Platinum",
    issuer: "American Express",
    reward_mode: "points",
    category: "flight_direct",
    multiplier: 5,
    points_currency: "MR",
    notes: "Flights booked directly with airlines or through Amex Travel.",
    priority: 10
  },
  {
    card_name: "Amex Platinum",
    issuer: "American Express",
    reward_mode: "points",
    category: "hotel_direct",
    multiplier: 5,
    points_currency: "MR",
    notes: "Prepaid hotels booked through Amex Travel. Current MVP uses hotel_direct as the closest mapped category.",
    priority: 20
  },
  {
    card_name: "Amex Platinum",
    issuer: "American Express",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "MR",
    notes: "Fallback default earn rate for all unmatched purchases.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.5 Amex Gold

### Human-readable summary

* Dining: 4x at restaurants worldwide
* Groceries: 4x at U.S. supermarkets
* Flights: 3x on flights booked directly with airlines or via Amex Travel
* Other: 1x
* Caps exist on dining and supermarkets; store them in notes only for MVP

### Seed instructions

```ts
[
  {
    card_name: "Amex Gold",
    issuer: "American Express",
    reward_mode: "points",
    category: "dining",
    multiplier: 4,
    points_currency: "MR",
    notes: "Restaurants worldwide. Current issuer cap applies, but cap logic is not modeled in MVP.",
    priority: 10
  },
  {
    card_name: "Amex Gold",
    issuer: "American Express",
    reward_mode: "points",
    category: "online_grocery",
    multiplier: 4,
    points_currency: "MR",
    notes: "U.S. supermarkets. Current MVP uses online_grocery as the groceries bucket even though issuer rule is broader.",
    priority: 20
  },
  {
    card_name: "Amex Gold",
    issuer: "American Express",
    reward_mode: "points",
    category: "flight_direct",
    multiplier: 3,
    points_currency: "MR",
    notes: "Flights booked directly with airlines or through Amex Travel.",
    priority: 20
  },
  {
    card_name: "Amex Gold",
    issuer: "American Express",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "MR",
    notes: "Fallback default earn rate for all unmatched purchases.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.6 Amex Blue Cash Everyday

### Human-readable summary

* Groceries: 3% at U.S. supermarkets
* Online shopping: 3% at U.S. online retail purchases
* Gas: 3% at U.S. gas stations
* Other: 1%
* Each 3% category has a cap; cap logic can wait

### MVP mapping decision

* map supermarkets to `online_grocery` bucket
* map online retail to `other` with a strong note, because current internal model has no dedicated `online_shopping` internal key
* gas is not modeled as its own current category, so leave gas as note, not a structured category unless you expand categories later

### Seed instructions

```ts
[
  {
    card_name: "Amex Blue Cash Everyday",
    issuer: "American Express",
    reward_mode: "cashback",
    category: "online_grocery",
    cash_percent: 3,
    notes: "U.S. supermarkets. Current MVP uses online_grocery as the groceries bucket.",
    priority: 10
  },
  {
    card_name: "Amex Blue Cash Everyday",
    issuer: "American Express",
    reward_mode: "cashback",
    category: "other",
    cash_percent: 3,
    notes: "U.S. online retail purchases. Current MVP does not have a dedicated internal online_shopping category.",
    priority: 20
  },
  {
    card_name: "Amex Blue Cash Everyday",
    issuer: "American Express",
    reward_mode: "cashback",
    category: "other",
    cash_percent: 1,
    notes: "Fallback default earn rate. Gas 3% exists on the card but is not modeled cleanly in current MVP categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.7 Amex Blue Cash Preferred

### Human-readable summary

* Groceries: 6% at U.S. supermarkets, up to current annual cap
* Streaming: 6% on select U.S. streaming subscriptions
* Gas: 3%
* Transit: 3%
* Other: 1%

### MVP mapping decision

* map supermarkets to `online_grocery`
* map streaming to `streaming`
* gas and transit are not modeled cleanly in the current category list, so keep them in notes only for now

### Seed instructions

```ts
[
  {
    card_name: "Amex Blue Cash Preferred",
    issuer: "American Express",
    reward_mode: "cashback",
    category: "online_grocery",
    cash_percent: 6,
    notes: "U.S. supermarkets. Current issuer cap exists but is not modeled in MVP.",
    priority: 10
  },
  {
    card_name: "Amex Blue Cash Preferred",
    issuer: "American Express",
    reward_mode: "cashback",
    category: "streaming",
    cash_percent: 6,
    notes: "Select U.S. streaming subscriptions.",
    priority: 20
  },
  {
    card_name: "Amex Blue Cash Preferred",
    issuer: "American Express",
    reward_mode: "cashback",
    category: "other",
    cash_percent: 1,
    notes: "Fallback default earn rate. Gas 3% and transit 3% exist on the card but are not modeled cleanly in current MVP categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.8 Citi Double Cash

### Human-readable summary

* Everything: 2% cash back total
* This is effectively a flat-rate fallback card for all categories

### Seed instructions

```ts
[
  {
    card_name: "Citi Double Cash",
    issuer: "Citi",
    reward_mode: "cashback",
    category: "other",
    cash_percent: 2,
    notes: "Unlimited 2% cash back total: 1% when you buy and 1% as you pay. Acts as a flat-rate fallback across all categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.9 Citi Custom Cash

### Human-readable summary

* 5% on the highest eligible spend category each billing cycle up to the first $500
* 1% after that and on all other purchases
* Also has extra Citi Travel earning, but that is optional for MVP and can be omitted initially

### MVP mapping decision

This card is dynamic (issuer picks the highest eligible spend category each billing cycle). **Do not infer** that category from the purchase the user typed into CardWise.

**MVP:**

* Seed **only** the **1% fallback** rule (`category: "other"`, `is_fallback: true`).
* **5%** is applied in the recommendation engine **only** when the member has **manually set** their Custom Cash “top category” on that wallet row (`user_cards.custom_cash_top_category`) **and** it **equals** the current purchase category slug (`PURCHASE_CATEGORIES`).
* Otherwise comparisons use **1%** with a clear explanation (no caps or billing-cycle modeling).

### Seed instructions

```ts
[
  {
    card_name: "Citi Custom Cash",
    issuer: "Citi",
    reward_mode: "cashback",
    category: "other",
    cash_percent: 1,
    notes:
      "Default earn unless wallet stores a matching Custom Cash top category for 5% (see product/engine docs). Issuer: top eligible category each billing cycle up to first $500 — caps/cycles not modeled.",
    priority: 100,
    is_fallback: true
  }
]
```

### Recommendation engine note for Cursor

* **Never** auto-assign 5% from the purchase category alone.
* If wallet top category **matches** purchase category → **5%** + explanation referencing the **member-selected** top category for this billing cycle.
* If unset or no match → **1%** + explanation that default rate applies because no matching Custom Cash top category is set.

---

## 4.10 Citi / AAdvantage Platinum Select World Elite Mastercard

### Human-readable summary

* Flights on eligible American Airlines purchases: 2x
* Dining: 2x
* Gas: 2x
* Other: 1x

### MVP mapping decision

* map eligible American Airlines purchases to `flight_direct`
* dining maps cleanly
* gas is not modeled cleanly, so do not create a separate internal category unless category model expands

### Seed instructions

```ts
[
  {
    card_name: "Citi AAdvantage Platinum Select",
    issuer: "Citi",
    reward_mode: "points",
    category: "flight_direct",
    multiplier: 2,
    points_currency: "AA",
    notes: "Eligible American Airlines purchases.",
    priority: 10
  },
  {
    card_name: "Citi AAdvantage Platinum Select",
    issuer: "Citi",
    reward_mode: "points",
    category: "dining",
    multiplier: 2,
    points_currency: "AA",
    notes: "Restaurants, including takeout.",
    priority: 20
  },
  {
    card_name: "Citi AAdvantage Platinum Select",
    issuer: "Citi",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "AA",
    notes: "Fallback default earn rate. Gas 2x exists on the card but is not modeled cleanly in current MVP categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.11 Marriott Bonvoy Boundless (Chase)

### Human-readable summary

* Hotels: 6x at Marriott properties from the credit card itself
* Dining/Groceries/Gas: 3x on the first $6,000 in combined purchases annually
* Other: 2x
* Important: issuer marketing says up to 17x total at Marriott, but that includes Marriott program/status earnings. CardWise should store card earn rates, not total ecosystem marketing totals.

### MVP mapping decision

* map Marriott stays to `hotel_direct`
* dining maps cleanly
* groceries map to `online_grocery`
* gas is not modeled cleanly, so omit gas as a structured category for now
* fallback = 2x

### Seed instructions

```ts
[
  {
    card_name: "Marriott Bonvoy Boundless",
    issuer: "Chase",
    reward_mode: "points",
    category: "hotel_direct",
    multiplier: 6,
    points_currency: "Marriott",
    notes: "Card earn rate at participating Marriott Bonvoy hotels only. Do not include Marriott member/status stack.",
    priority: 10
  },
  {
    card_name: "Marriott Bonvoy Boundless",
    issuer: "Chase",
    reward_mode: "points",
    category: "dining",
    multiplier: 3,
    points_currency: "Marriott",
    notes: "Part of combined dining/grocery/gas 3x bucket on up to the current annual cap.",
    priority: 20
  },
  {
    card_name: "Marriott Bonvoy Boundless",
    issuer: "Chase",
    reward_mode: "points",
    category: "online_grocery",
    multiplier: 3,
    points_currency: "Marriott",
    notes: "Current MVP uses online_grocery as groceries bucket. Issuer cap exists.",
    priority: 20
  },
  {
    card_name: "Marriott Bonvoy Boundless",
    issuer: "Chase",
    reward_mode: "points",
    category: "other",
    multiplier: 2,
    points_currency: "Marriott",
    notes: "Fallback default earn rate. Gas 3x exists on the card but is not modeled cleanly in current MVP categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 4.12 Marriott Bonvoy Bold (Chase)

### Human-readable summary

* Hotels: card is marketed as up to 14x total at Marriott, but again that includes Marriott program earnings; seed only the card earn structure
* Groceries: 2x
* Rideshare and select food delivery: 2x
* Select streaming and internet/cable/phone services: 2x
* Other: 1x

### MVP mapping decision

* there is no clean food delivery or internet/cable/phone category
* map groceries to `online_grocery`
* map streaming to `streaming`
* omit rideshare and internet/cable/phone as structured categories for now, preserve them in notes
* fallback = 1x

### Seed instructions

```ts
[
  {
    card_name: "Marriott Bonvoy Bold",
    issuer: "Chase",
    reward_mode: "points",
    category: "online_grocery",
    multiplier: 2,
    points_currency: "Marriott",
    notes: "Grocery stores.",
    priority: 10
  },
  {
    card_name: "Marriott Bonvoy Bold",
    issuer: "Chase",
    reward_mode: "points",
    category: "streaming",
    multiplier: 2,
    points_currency: "Marriott",
    notes: "Select streaming services. Internet, cable, and phone services are not modeled separately in MVP.",
    priority: 20
  },
  {
    card_name: "Marriott Bonvoy Bold",
    issuer: "Chase",
    reward_mode: "points",
    category: "other",
    multiplier: 1,
    points_currency: "Marriott",
    notes: "Fallback default earn rate. Rideshare and select food delivery 2x exist on the card but are not modeled cleanly in current MVP categories.",
    priority: 100,
    is_fallback: true
  }
]
```

---

## 5. Implementation tasks for Cursor

### Task A: revise reward selection logic

* implement exact-match then fallback-match logic
* fallback row should be used for any category that lacks a more specific rule
* do not assume `"other"` is only for user-selected Other category; it must also behave as the default unmatched rule

### Task B: seed the cards above

* create card records
* create reward rule records
* preserve notes for exclusions/caps/booking-channel nuances
* do not add anniversary bonuses or elite-night logic into swipe-time recommendation

### Task C: preserve unsupported category nuance in notes

Examples:

* Amex BCE gas 3%
* BCP gas/transit 3%
* Marriott Bold rideshare/internet/cable/phone 2%
* Hyatt gym 2%
* Citi AAdvantage gas 2%

These should stay in notes unless category model expands.

### Task D: add one helper function

Create a helper such as:

```ts
function getAppliedRewardRule(cardRules, inputCategory) {
  const exact = cardRules.find((r) => r.category === inputCategory);
  if (exact) return exact;

  const fallback = cardRules.find((r) => r.is_fallback === true || r.category === "other");
  return fallback ?? null;
}
```

### Task E: special-case Citi Custom Cash

* compare purchase category only to **wallet-stored** Custom Cash top category (optional column on `user_cards`), never inferred from spend
* if match → model **5%** and explain using the member-selected category; otherwise **1%** with default-rate messaging

---

## 6. Optional future improvements, not for MVP

* distinguish grocery vs online grocery
* distinguish Amex Travel vs direct hotel
* add gas category
* add transit/rideshare category
* add merchant exclusions
* add caps and confidence scoring
* add AI ingestion for messy reward text later

---

## 7. Source-quality note

These rules were manually adapted from official issuer/help pages for MVP seeding. When the card's official page markets "up to X total points," store only the card earn rate in the reward rules, not the issuer loyalty ecosystem stack.

```

A couple of important corrections versus the earlier simplified version:

- **Chase Sapphire Reserve** should now be seeded with **8x Chase Travel, 4x direct flights, 4x direct hotels, 3x dining, 1x fallback** based on the current official Chase page, not the older 3x broad-travel structure. :contentReference[oaicite:1]{index=1}
- **World of Hyatt** and **Marriott Boundless/Bold** issuer pages advertise “up to” total hotel earning that includes hotel-program earning; for CardWise, you should store only the **card earn rate** in your reward rules, then keep a note about the marketing stack. :contentReference[oaicite:2]{index=2}
- **Amex Platinum hotel logic** is narrower than “all hotels”: the official product page states **5x on prepaid hotels booked through Amex Travel**, so the markdown above maps that into your current `hotel_direct` bucket only as an MVP approximation and labels the note accordingly. :contentReference[oaicite:3]{index=3}

```
