import type { PurchaseCategoryId } from "./categories";

/**
 * Internal category keys for `reward_rules.category` and seeding (see
 * `docs/card-reward-rules-seeding.md.md`). Wider than the current single-select
 * purchase UI: reserved keys support richer seeds before the UI adds matching
 * inputs.
 */
export const INTERNAL_REWARD_CATEGORIES = [
  "dining",
  "online_grocery",
  "streaming",
  "flight_direct",
  "hotel_direct",
  "chase_travel",
  "travel_other",
  "other",
] as const;

export type InternalRewardCategoryId = (typeof INTERNAL_REWARD_CATEGORIES)[number];

/**
 * Maps a user-selected **purchase** category (MVP; see `PURCHASE_CATEGORIES`)
 * to the internal rule bucket we try first. Some buckets have no user option yet;
 * seeds and future UI can set them directly.
 *
 * Mappings are an MVP tradeoff (see seeding doc): e.g. groceries → online_grocery.
 */
const PURCHASE_TO_INTERNAL: Record<PurchaseCategoryId, InternalRewardCategoryId> =
  {
    dining: "dining",
    groceries: "online_grocery",
    travel: "travel_other",
    // No dedicated `gas` / `entertainment` internal keys in v1; use broad buckets.
    gas: "other",
    entertainment: "other",
    other: "other",
  };

export function mapPurchaseCategoryToInternal(
  user: PurchaseCategoryId,
): InternalRewardCategoryId {
  return PURCHASE_TO_INTERNAL[user];
}

export function isInternalRewardCategory(
  value: string,
): value is InternalRewardCategoryId {
  return (INTERNAL_REWARD_CATEGORIES as readonly string[]).includes(value);
}
