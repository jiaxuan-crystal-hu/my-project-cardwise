/**
 * User-facing purchase slugs (MVP). Values stay URL/API stable; do not rename
 * lightly. **Internal** rule keys are in `src/constants/reward-categories.ts`
 * (`INTERNAL_REWARD_CATEGORIES`, `mapPurchaseCategoryToInternal`).
 * Keep in sync with `reward_rules` seeds per environment.
 */
export const PURCHASE_CATEGORIES = [
  "dining",
  "groceries",
  "travel",
  "gas",
  "entertainment",
  "other",
] as const;

export type PurchaseCategoryId = (typeof PURCHASE_CATEGORIES)[number];

/** Normalize DB/API strings to a purchase slug or null if unknown. */
export function coerceStoredPurchaseCategory(
  raw: string | null | undefined,
): PurchaseCategoryId | null {
  if (raw == null || raw.trim() === "") return null;
  const v = raw.trim().toLowerCase();
  return PURCHASE_CATEGORIES.some((c) => c === v)
    ? (v as PurchaseCategoryId)
    : null;
}

/** Display strings for the purchase selector (and future marketing). */
export const PURCHASE_CATEGORY_LABELS: Record<PurchaseCategoryId, string> = {
  dining: "Dining",
  groceries: "Groceries",
  travel: "Travel",
  gas: "Gas",
  entertainment: "Entertainment",
  other: "Other",
};

export {
  mapPurchaseCategoryToInternal,
  INTERNAL_REWARD_CATEGORIES,
  isInternalRewardCategory,
} from "./reward-categories";
export type { InternalRewardCategoryId } from "./reward-categories";
