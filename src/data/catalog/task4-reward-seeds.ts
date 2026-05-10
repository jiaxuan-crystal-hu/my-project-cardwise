/**
 * Task 5 — reward rules for the Task 4 catalog. Source: `docs/card-reward-rules-seeding.md.md`.
 * Citi Custom Cash: seed keeps default 1% fallback only; 5% uses wallet `custom_cash_top_category` + engine (see docs).
 * Apply in DB via `src/db/seeds/004_task4_reward_rules.sql` (run after 001–003 migrations, 002 seeds).
 */

import { CATALOG_SLUGS as c } from "./task4-card-seeds";

export type Task4RewardRuleSeed = {
  id: string;
  cardId: string;
  reward_mode: "points" | "cashback";
  category: string;
  multiplier: string | null;
  cashPercent: string | null;
  pointsCurrency: string | null;
  notes: string | null;
  priority: string;
  isFallback: boolean;
};

export function task4RewardRuleId(index1Based: number): string {
  if (index1Based < 1 || index1Based > 0xfff_fff) {
    throw new RangeError("task4 reward rule id index out of range");
  }
  return `a1000000-0000-4000-8000-${index1Based.toString(16).padStart(12, "0")}`;
}

let seq = 0;
function rid() {
  seq += 1;
  return task4RewardRuleId(seq);
}

/** Keeps subsequent rule UUIDs stable after removing a middle seed row. */
function burnSeqSlot(): void {
  seq += 1;
}

function p(
  cardId: string,
  o: {
    mode: "points" | "cashback";
    category: string;
    mult: string | null;
    cash: string | null;
    pcur: string | null;
    notes: string | null;
    pri: string;
    fell?: boolean;
  },
): Task4RewardRuleSeed {
  return {
    id: rid(),
    cardId,
    reward_mode: o.mode,
    category: o.category,
    multiplier: o.mult,
    cashPercent: o.cash,
    pointsCurrency: o.pcur,
    notes: o.notes,
    priority: o.pri,
    isFallback: o.fell === true,
  };
}

// Reset seq so hot-reload does not desync; array builds once.
seq = 0;
export const TASK4_REWARD_RULE_SEEDS: readonly Task4RewardRuleSeed[] = [
  // 4.1 Chase Sapphire Preferred
  p(c.chaseSapphirePreferred, {
    mode: "points",
    category: "chase_travel",
    mult: "5",
    cash: null,
    pcur: "UR",
    pri: "10",
    notes:
      "Travel purchased through Chase Travel. Excludes hotel purchases that qualify for the annual Chase Travel hotel credit.",
  }),
  p(c.chaseSapphirePreferred, {
    mode: "points",
    category: "travel_other",
    mult: "2",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Other travel purchases outside Chase Travel.",
  }),
  p(c.chaseSapphirePreferred, {
    mode: "points",
    category: "dining",
    mult: "3",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Includes delivery, takeout, and dining out.",
  }),
  p(c.chaseSapphirePreferred, {
    mode: "points",
    category: "online_grocery",
    mult: "3",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Online grocery purchases. Excludes Target, Walmart, and wholesale clubs.",
  }),
  p(c.chaseSapphirePreferred, {
    mode: "points",
    category: "streaming",
    mult: "3",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Select streaming services.",
  }),
  p(c.chaseSapphirePreferred, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "UR",
    pri: "100",
    notes: "Fallback default earn rate for all unmatched purchases.",
    fell: true,
  }),
  // 4.2 Chase Sapphire Reserve
  p(c.chaseSapphireReserve, {
    mode: "points",
    category: "chase_travel",
    mult: "8",
    cash: null,
    pcur: "UR",
    pri: "10",
    notes: "All purchases through Chase Travel, including The Edit.",
  }),
  p(c.chaseSapphireReserve, {
    mode: "points",
    category: "flight_direct",
    mult: "4",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Flights booked direct.",
  }),
  p(c.chaseSapphireReserve, {
    mode: "points",
    category: "hotel_direct",
    mult: "4",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Hotels booked direct.",
  }),
  p(c.chaseSapphireReserve, {
    mode: "points",
    category: "dining",
    mult: "3",
    cash: null,
    pcur: "UR",
    pri: "20",
    notes: "Dining worldwide.",
  }),
  p(c.chaseSapphireReserve, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "UR",
    pri: "100",
    notes: "Fallback default earn rate for all unmatched purchases.",
    fell: true,
  }),
  // 4.3 World of Hyatt
  p(c.worldOfHyatt, {
    mode: "points",
    category: "hotel_direct",
    mult: "4",
    cash: null,
    pcur: "Hyatt",
    pri: "10",
    notes: "Card earn rate at Hyatt hotels and resorts only. Do not include member-status stack in card rule.",
  }),
  p(c.worldOfHyatt, {
    mode: "points",
    category: "dining",
    mult: "2",
    cash: null,
    pcur: "Hyatt",
    pri: "20",
    notes: "Dining category.",
  }),
  p(c.worldOfHyatt, {
    mode: "points",
    category: "flight_direct",
    mult: "2",
    cash: null,
    pcur: "Hyatt",
    pri: "20",
    notes: "Airfare purchased directly from the airline.",
  }),
  p(c.worldOfHyatt, {
    mode: "points",
    category: "travel_other",
    mult: "2",
    cash: null,
    pcur: "Hyatt",
    pri: "20",
    notes: "Local transit and commuting.",
  }),
  p(c.worldOfHyatt, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "Hyatt",
    pri: "100",
    notes:
      "Fallback default earn rate. Gym/fitness 2x exists on the card but is not modeled cleanly in current MVP categories.",
    fell: true,
  }),
  // 4.4 Amex Platinum
  p(c.amexPlatinum, {
    mode: "points",
    category: "flight_direct",
    mult: "5",
    cash: null,
    pcur: "MR",
    pri: "10",
    notes: "Flights booked directly with airlines or through Amex Travel.",
  }),
  p(c.amexPlatinum, {
    mode: "points",
    category: "hotel_direct",
    mult: "5",
    cash: null,
    pcur: "MR",
    pri: "20",
    notes:
      "Prepaid hotels booked through Amex Travel. Current MVP uses hotel_direct as the closest mapped category.",
  }),
  p(c.amexPlatinum, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "MR",
    pri: "100",
    notes: "Fallback default earn rate for all unmatched purchases.",
    fell: true,
  }),
  // 4.5 Amex Gold
  p(c.amexGold, {
    mode: "points",
    category: "dining",
    mult: "4",
    cash: null,
    pcur: "MR",
    pri: "10",
    notes: "Restaurants worldwide. Current issuer cap applies, but cap logic is not modeled in MVP.",
  }),
  p(c.amexGold, {
    mode: "points",
    category: "online_grocery",
    mult: "4",
    cash: null,
    pcur: "MR",
    pri: "20",
    notes:
      "U.S. supermarkets. Current MVP uses online_grocery as the groceries bucket even though issuer rule is broader.",
  }),
  p(c.amexGold, {
    mode: "points",
    category: "flight_direct",
    mult: "3",
    cash: null,
    pcur: "MR",
    pri: "20",
    notes: "Flights booked directly with airlines or through Amex Travel.",
  }),
  p(c.amexGold, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "MR",
    pri: "100",
    notes: "Fallback default earn rate for all unmatched purchases.",
    fell: true,
  }),
  // 4.6 BCE
  p(c.amexBlueCashEveryday, {
    mode: "cashback",
    category: "online_grocery",
    mult: null,
    cash: "3",
    pcur: null,
    pri: "10",
    notes: "U.S. supermarkets. Current MVP uses online_grocery as the groceries bucket.",
  }),
  p(c.amexBlueCashEveryday, {
    mode: "cashback",
    category: "other",
    mult: null,
    cash: "3",
    pcur: null,
    pri: "20",
    notes: "U.S. online retail purchases. Current MVP does not have a dedicated internal online_shopping category.",
  }),
  p(c.amexBlueCashEveryday, {
    mode: "cashback",
    category: "other",
    mult: null,
    cash: "1",
    pcur: null,
    pri: "100",
    notes:
      "Fallback default earn rate. Gas 3% exists on the card but is not modeled cleanly in current MVP categories.",
    fell: true,
  }),
  // 4.7 BCP
  p(c.amexBlueCashPreferred, {
    mode: "cashback",
    category: "online_grocery",
    mult: null,
    cash: "6",
    pcur: null,
    pri: "10",
    notes: "U.S. supermarkets. Current issuer cap exists but is not modeled in MVP.",
  }),
  p(c.amexBlueCashPreferred, {
    mode: "cashback",
    category: "streaming",
    mult: null,
    cash: "6",
    pcur: null,
    pri: "20",
    notes: "Select U.S. streaming subscriptions.",
  }),
  p(c.amexBlueCashPreferred, {
    mode: "cashback",
    category: "other",
    mult: null,
    cash: "1",
    pcur: null,
    pri: "100",
    notes:
      "Fallback default earn rate. Gas 3% and transit 3% exist on the card but are not modeled cleanly in current MVP categories.",
    fell: true,
  }),
  // 4.8 Citi DC
  p(c.citiDoubleCash, {
    mode: "cashback",
    category: "other",
    mult: null,
    cash: "2",
    pcur: null,
    pri: "100",
    notes:
      "Unlimited 2% cash back total: 1% when you buy and 1% as you pay. Acts as a flat-rate fallback across all categories.",
    fell: true,
  }),
  // 4.9 Citi Custom Cash — burn id …01f (removed pseudo-category seed); 5% is user-driven in-app only.
  ...((): Task4RewardRuleSeed[] => {
    burnSeqSlot();
    return [
      p(c.citiCustomCash, {
        mode: "cashback",
        category: "other",
        mult: null,
        cash: "1",
        pcur: null,
        pri: "100",
        notes:
          "Default earn rate unless the member sets their Custom Cash top category in the wallet and it matches this purchase category (in-app MVP; up to 5% on top eligible category each billing cycle up to first $500 per issuer rules — caps/cycles not modeled).",
        fell: true,
      }),
    ];
  })(),
  // 4.10 Citi AAdvantage
  p(c.citiAAdvantagePlatinumSelect, {
    mode: "points",
    category: "flight_direct",
    mult: "2",
    cash: null,
    pcur: "AA",
    pri: "10",
    notes: "Eligible American Airlines purchases.",
  }),
  p(c.citiAAdvantagePlatinumSelect, {
    mode: "points",
    category: "dining",
    mult: "2",
    cash: null,
    pcur: "AA",
    pri: "20",
    notes: "Restaurants, including takeout.",
  }),
  p(c.citiAAdvantagePlatinumSelect, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "AA",
    pri: "100",
    notes:
      "Fallback default earn rate. Gas 2x exists on the card but is not modeled cleanly in current MVP categories.",
    fell: true,
  }),
  // 4.11 Boundless
  p(c.marriottBonvoyBoundless, {
    mode: "points",
    category: "hotel_direct",
    mult: "6",
    cash: null,
    pcur: "Marriott",
    pri: "10",
    notes: "Card earn rate at participating Marriott Bonvoy hotels only. Do not include Marriott member/status stack.",
  }),
  p(c.marriottBonvoyBoundless, {
    mode: "points",
    category: "dining",
    mult: "3",
    cash: null,
    pcur: "Marriott",
    pri: "20",
    notes: "Part of combined dining/grocery/gas 3x bucket on up to the current annual cap.",
  }),
  p(c.marriottBonvoyBoundless, {
    mode: "points",
    category: "online_grocery",
    mult: "3",
    cash: null,
    pcur: "Marriott",
    pri: "20",
    notes: "Current MVP uses online_grocery as groceries bucket. Issuer cap exists.",
  }),
  p(c.marriottBonvoyBoundless, {
    mode: "points",
    category: "other",
    mult: "2",
    cash: null,
    pcur: "Marriott",
    pri: "100",
    notes:
      "Fallback default earn rate. Gas 3x exists on the card but is not modeled cleanly in current MVP categories.",
    fell: true,
  }),
  // 4.12 Bold
  p(c.marriottBonvoyBold, {
    mode: "points",
    category: "online_grocery",
    mult: "2",
    cash: null,
    pcur: "Marriott",
    pri: "10",
    notes: "Grocery stores.",
  }),
  p(c.marriottBonvoyBold, {
    mode: "points",
    category: "streaming",
    mult: "2",
    cash: null,
    pcur: "Marriott",
    pri: "20",
    notes: "Select streaming services. Internet, cable, and phone services are not modeled separately in MVP.",
  }),
  p(c.marriottBonvoyBold, {
    mode: "points",
    category: "other",
    mult: "1",
    cash: null,
    pcur: "Marriott",
    pri: "100",
    notes:
      "Fallback default earn rate. Rideshare and select food delivery 2x exist on the card but are not modeled cleanly in current MVP categories.",
    fell: true,
  }),
];

/** One logical id slot reserved after removing the Custom Cash pseudo-category row (stable UUIDs). */
const TASK4_REWARD_SEEDS_BURNED_ID_SLOTS = 1;

if (seq !== TASK4_REWARD_RULE_SEEDS.length + TASK4_REWARD_SEEDS_BURNED_ID_SLOTS) {
  throw new Error(
    `task4 reward seed id counter mismatch (seq=${seq}, rules=${TASK4_REWARD_RULE_SEEDS.length})`,
  );
}
