import type { PurchaseCategoryId } from "@/constants/categories";
import { PURCHASE_CATEGORY_LABELS } from "@/constants/categories";
import { CATALOG_SLUGS } from "@/data/catalog/task4-card-seeds";

/** Task 4 catalog id for "Citi Custom Cash Card". */
export const CITI_CUSTOM_CASH_CARD_ID = CATALOG_SLUGS.citiCustomCash;

export function isCitiCustomCashCardId(cardId: string): boolean {
  return cardId === CITI_CUSTOM_CASH_CARD_ID;
}

export type CitiCustomCashMvpCashbackResolution = {
  cashPercent: 5 | 1;
  explanation: string;
};

/**
 * MVP: never infers top spend category — uses wallet-only `savedTopCategory`.
 * No cap or billing-cycle tracking.
 */
export function resolveCitiCustomCashMvpCashback(opts: {
  purchaseCategory: PurchaseCategoryId;
  savedTopCategory: PurchaseCategoryId | null | undefined;
}): CitiCustomCashMvpCashbackResolution {
  const label = PURCHASE_CATEGORY_LABELS[opts.purchaseCategory];
  if (
    opts.savedTopCategory != null &&
    opts.savedTopCategory === opts.purchaseCategory
  ) {
    return {
      cashPercent: 5,
      explanation: `Assumes your selected Citi Custom Cash top category is ${label} for this billing cycle.`,
    };
  }
  return {
    cashPercent: 1,
    explanation:
      "Using the default 1% rate because no matching Citi Custom Cash top category is set.",
  };
}
