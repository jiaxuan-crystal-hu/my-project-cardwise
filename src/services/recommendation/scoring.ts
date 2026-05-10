/**
 * Task 8 — pure recommendation **scoring** (no Supabase).
 * Rule selection: `getAppliedRewardRule` (exact → legacy slug → fallback).
 * Tracks: best cashback ($), best points (estimated $ from static ¢/pt).
 */
import type { PurchaseCategoryId } from "@/constants/categories";
import type { CardRow, WalletEntry } from "@/types/cards";
import type { TransferPartnerRow, UserPreferencesRow } from "@/types/recommendation";
import type { RewardRuleRow } from "@/types/reward-rules";
import {
  isCitiCustomCashCardId,
  resolveCitiCustomCashMvpCashback,
} from "./citi-custom-cash";
import { appendIssuerNote, matchPathCaption } from "./explanations";
import { getAppliedRewardRuleWithPath } from "./get-applied-reward-rule";
import { getPointsValueBoost } from "./preference-boost";
import {
  estimatedCashbackValue,
  estimatedPointDollarValue,
  getCentsPerPoint,
} from "./valuation";

export type CashCandidate = {
  card: CardRow;
  value: number;
  explanation: string;
};

export type PointsCandidate = {
  card: CardRow;
  estPoints: number;
  estDollars: number;
  explanation: string;
};

function num(v: string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function roundPoints(n: number): number {
  return Math.round(n * 100) / 100;
}

export function collectRecommendationCandidates(input: {
  entries: WalletEntry[];
  rulesByCardId: Map<string, RewardRuleRow[]>;
  purchaseCategory: PurchaseCategoryId;
  internalCategory: string;
  amountUsed: number;
  prefs: UserPreferencesRow | null;
  partners: TransferPartnerRow[];
}): {
  cashCandidates: CashCandidate[];
  pointsCandidates: PointsCandidate[];
  appliedCount: number;
} {
  const {
    entries,
    rulesByCardId,
    purchaseCategory,
    internalCategory,
    amountUsed,
    prefs,
    partners,
  } = input;

  const cashCandidates: CashCandidate[] = [];
  const pointsCandidates: PointsCandidate[] = [];
  let appliedCount = 0;

  for (const e of entries) {
    const card = e.card;
    const cardRules = rulesByCardId.get(card.id) ?? [];
    if (cardRules.length === 0) continue;

    if (isCitiCustomCashCardId(card.id)) {
      appliedCount += 1;
      const cc = resolveCitiCustomCashMvpCashback({
        purchaseCategory,
        savedTopCategory: e.customCashTopCategory,
      });
      const ccValue = estimatedCashbackValue(amountUsed, cc.cashPercent);
      cashCandidates.push({
        card,
        value: ccValue,
        explanation: `Custom Cash — ${cc.explanation} Est. ~$${ccValue.toFixed(2)} on $${amountUsed} (${cc.cashPercent}% rate).`,
      });
      continue;
    }

    const { rule: r, path } = getAppliedRewardRuleWithPath(
      cardRules,
      internalCategory,
      purchaseCategory,
    );
    if (r) appliedCount += 1;
    if (!r || !path) continue;

    if (r.reward_mode === "cashback") {
      const pc = num(r.cash_percent);
      if (pc == null) continue;
      const value = estimatedCashbackValue(amountUsed, pc);
      const head = matchPathCaption(path);
      const valueLine = `Est. ~$${value.toFixed(2)} cashback on $${amountUsed} (${pc}% rate).`;
      const explanation = appendIssuerNote(`${head} ${valueLine}`, r);
      cashCandidates.push({ card, value, explanation });
    }

    if (r.reward_mode === "points") {
      const mult = num(r.multiplier);
      const pcur = r.points_currency?.trim();
      if (mult == null || !pcur) continue;
      const estPoints = amountUsed * mult;
      const baseDollars = estimatedPointDollarValue(estPoints, pcur);
      const boost = getPointsValueBoost(prefs, partners, pcur);
      const estDollars = baseDollars * boost.multiplier;
      const cpp = getCentsPerPoint(pcur);
      const cppLabel = `${(cpp * 100).toFixed(1)}¢/pt`;
      const rateSentence =
        r.notes?.trim() ||
        `${mult}× ${pcur} on this purchase (≈${roundPoints(estPoints)} pts; ~$${estDollars.toFixed(2)} at assumed ${cppLabel}${boost.multiplier > 1 ? `; ${boost.reason ?? "preference boost"}` : ""}).`;
      const head = matchPathCaption(path);
      const explanation = appendIssuerNote(
        `${head} ${rateSentence} Estimates only; not a redemption guarantee.`,
        r,
      );
      pointsCandidates.push({ card, estPoints, estDollars, explanation });
    }
  }

  return { cashCandidates, pointsCandidates, appliedCount };
}

/** Higher value wins; tie-break lexicographic on card name (deterministic). */
export function pickBestCashCandidate(
  candidates: CashCandidate[],
): CashCandidate | null {
  if (candidates.length === 0) return null;
  return candidates.slice().sort((a, b) => {
    const s = b.value - a.value;
    if (s !== 0) return s;
    return a.card.name.localeCompare(b.card.name);
  })[0] ?? null;
}

/** Higher estimated $ wins; tie-break lexicographic on card name. */
export function pickBestPointsCandidate(
  candidates: PointsCandidate[],
): PointsCandidate | null {
  if (candidates.length === 0) return null;
  return candidates.slice().sort((a, b) => {
    const s = b.estDollars - a.estDollars;
    if (s !== 0) return s;
    return a.card.name.localeCompare(b.card.name);
  })[0] ?? null;
}
