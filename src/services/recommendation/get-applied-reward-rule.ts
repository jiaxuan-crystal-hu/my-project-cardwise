import type { RewardRuleRow } from "@/types/reward-rules";

/** How `getAppliedRewardRule` chose the row (for explanations / Task 9). */
export type AppliedRewardPath = "internal" | "legacy_slug" | "fallback";

function numPriority(v: string | null | undefined): number {
  if (v === null || v === undefined || v === "") return 99_999;
  const n = Number(v);
  return Number.isFinite(n) ? n : 99_999;
}

function isTruthyFallbackFlag(v: boolean | null | undefined): boolean {
  return v === true;
}

/**
 * When multiple rules share the same category, prefer lower `priority` (more specific
 * in the seeding guide, e.g. 10 before 20).
 */
function bestExactInCategory(
  cardRules: RewardRuleRow[],
  category: string,
): RewardRuleRow | null {
  const matches = cardRules.filter((r) => r.category === category);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0] ?? null;
  return (
    matches.sort((a, b) => numPriority(a.priority) - numPriority(b.priority))[0] ??
    null
  );
}

/**
 * Per seeding spec: `is_fallback` rows first, else a single `category = other` row.
 * If multiple, lowest `priority` wins.
 */
function pickFallbackRow(cardRules: RewardRuleRow[]): RewardRuleRow | null {
  const flagged = cardRules.filter((r) => isTruthyFallbackFlag(r.is_fallback));
  if (flagged.length > 0) {
    return (
      flagged.sort(
        (a, b) => numPriority(a.priority) - numPriority(b.priority),
      )[0] ?? null
    );
  }
  const other = cardRules.filter((r) => r.category === "other");
  if (other.length > 0) {
    return (
      other.sort((a, b) => numPriority(a.priority) - numPriority(b.priority))[0] ??
      null
    );
  }
  return null;
}

/**
 * 1) Exact match on internal category (see `mapPurchaseCategoryToInternal`)
 * 2) Exact match on legacy `reward_rules.category` = user purchase slug (e.g. "groceries"
 *    before seeds moved to `online_grocery`)
 * 3) Fallback row (`is_fallback` or `category = "other"`)
 */
export function getAppliedRewardRuleWithPath(
  cardRules: RewardRuleRow[],
  internalCategory: string,
  purchaseCategory: string,
): { rule: RewardRuleRow | null; path: AppliedRewardPath | null } {
  const internal = bestExactInCategory(cardRules, internalCategory);
  if (internal) {
    return { rule: internal, path: "internal" };
  }
  if (internalCategory !== purchaseCategory) {
    const legacy = bestExactInCategory(cardRules, purchaseCategory);
    if (legacy) {
      return { rule: legacy, path: "legacy_slug" };
    }
  }
  const fb = pickFallbackRow(cardRules);
  if (fb) {
    return { rule: fb, path: "fallback" };
  }
  return { rule: null, path: null };
}

export function getAppliedRewardRule(
  cardRules: RewardRuleRow[],
  internalCategory: string,
  purchaseCategory: string,
): RewardRuleRow | null {
  return getAppliedRewardRuleWithPath(
    cardRules,
    internalCategory,
    purchaseCategory,
  ).rule;
}
