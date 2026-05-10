import {
  mapPurchaseCategoryToInternal,
  type PurchaseCategoryId,
  PURCHASE_CATEGORIES,
} from "@/constants/categories";
import { listUserWallet } from "@/services/cards/wallet";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  RecommendationResult,
  TransferPartnerRow,
} from "@/types/recommendation";
import type { RewardRuleRow } from "@/types/reward-rules";
import {
  collectRecommendationCandidates,
  pickBestCashCandidate,
  pickBestPointsCandidate,
} from "./scoring";

const DEFAULT_COMPARISON_AMOUNT = 100;

export type RecommendForUserResult =
  | {
      ok: true;
      result: RecommendationResult;
      amountUsed: number;
      category: string;
    }
  | { ok: false; code: "no_cards" | "invalid_category" | "data"; message: string };

export async function recommendForUser(
  supabase: SupabaseClient,
  userId: string,
  input: { category: string; amount?: number | null },
): Promise<RecommendForUserResult> {
  const raw = input.category.trim().toLowerCase();
  if (!PURCHASE_CATEGORIES.some((c) => c === raw)) {
    return {
      ok: false,
      code: "invalid_category",
      message: `Category must be one of: ${PURCHASE_CATEGORIES.join(", ")}`,
    };
  }
  const purchaseCategory = raw as PurchaseCategoryId;
  const internalCategory = mapPurchaseCategoryToInternal(purchaseCategory);

  const { entries, error: walletError } = await listUserWallet(supabase, userId);
  if (walletError) {
    return { ok: false, code: "data", message: walletError };
  }
  if (entries.length === 0) {
    return {
      ok: false,
      code: "no_cards",
      message: "Add at least one card in your wallet before getting a recommendation.",
    };
  }

  const amountUsed =
    input.amount != null && input.amount > 0
      ? input.amount
      : DEFAULT_COMPARISON_AMOUNT;

  const cardIds = [...new Set(entries.map((e) => e.card.id))];

  const { data: allRules, error: rulesError } = await supabase
    .from("reward_rules")
    .select(
      "id, card_id, reward_mode, category, multiplier, cash_percent, points_currency, notes, priority, is_fallback",
    )
    .in("card_id", cardIds);

  if (rulesError) {
    return { ok: false, code: "data", message: rulesError.message };
  }

  const { data: prefsData } = await supabase
    .from("user_preferences")
    .select("user_id, prefers_cashback, prefers_points, travel_goal, preferred_airline, preferred_hotel")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: partnersData } = await supabase
    .from("transfer_partners")
    .select("points_currency, partner_name, transfer_ratio");

  const prefs = prefsData ?? null;
  const partners = (partnersData ?? []) as TransferPartnerRow[];

  const byCardId = new Map<string, RewardRuleRow[]>();
  for (const row of (allRules ?? []) as RewardRuleRow[]) {
    const list = byCardId.get(row.card_id) ?? [];
    list.push(row);
    byCardId.set(row.card_id, list);
  }

  const warnings: string[] = [];

  if (input.amount == null || input.amount <= 0) {
    warnings.push(
      `No purchase amount provided — using $${DEFAULT_COMPARISON_AMOUNT} to compare offers.`,
    );
  }

  if (!allRules || allRules.length === 0) {
    warnings.push(
      "No reward rules are in the database for your wallet cards. Apply catalog seeds (e.g. `src/db/seeds/`) in Supabase.",
    );
  }

  const { cashCandidates, pointsCandidates, appliedCount } =
    collectRecommendationCandidates({
      entries,
      rulesByCardId: byCardId,
      purchaseCategory,
      internalCategory,
      amountUsed,
      prefs,
      partners,
    });

  if (allRules && allRules.length > 0 && appliedCount === 0) {
    warnings.push(
      `No applicable reward rules for "${purchaseCategory}" (including fallback) on your wallet cards. Check seeds or add rules with an exact or fallback row.`,
    );
  }

  const bestCash = pickBestCashCandidate(cashCandidates);
  const bestPts = pickBestPointsCandidate(pointsCandidates);

  const result: RecommendationResult = {
    cashback: bestCash
      ? {
          kind: "cashback",
          cardId: bestCash.card.id,
          cardName: bestCash.card.name,
          estimatedValue: roundMoney(bestCash.value),
          explanation: bestCash.explanation,
        }
      : null,
    points: bestPts
      ? {
          kind: "points",
          cardId: bestPts.card.id,
          cardName: bestPts.card.name,
          estimatedPoints: roundPoints(bestPts.estPoints),
          estimatedDollarValue: roundMoney(bestPts.estDollars),
          explanation: bestPts.explanation,
        }
      : null,
    warnings,
  };

  if (!result.cashback && !result.points && appliedCount > 0) {
    warnings.push(
      "Applicable rules exist, but none could be scored as cashback or points—check `reward_mode`, multipliers, and `cash_percent` on the matched rows.",
    );
  }

  return { ok: true, result, amountUsed, category: purchaseCategory };
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundPoints(n: number): number {
  return Math.round(n * 100) / 100;
}
