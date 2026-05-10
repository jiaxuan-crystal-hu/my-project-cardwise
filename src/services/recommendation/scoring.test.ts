import { describe, expect, it } from "vitest";
import type { CardRow, WalletEntry } from "@/types/cards";
import type { RewardRuleRow } from "@/types/reward-rules";
import { CATALOG_SLUGS } from "@/data/catalog/task4-card-seeds";
import {
  collectRecommendationCandidates,
  pickBestCashCandidate,
  pickBestPointsCandidate,
} from "./scoring";

function card(partial: Partial<CardRow> & Pick<CardRow, "id" | "name">): CardRow {
  return {
    issuer: "Test",
    network: null,
    card_type: "credit",
    annual_fee: 0,
    is_active: true,
    created_at: "2020-01-01T00:00:00Z",
    ...partial,
  };
}

function rule(p: Partial<RewardRuleRow> & Pick<RewardRuleRow, "id" | "card_id">): RewardRuleRow {
  return {
    reward_mode: "points",
    category: "dining",
    multiplier: "1",
    cash_percent: null,
    points_currency: "UR",
    notes: null,
    priority: null,
    is_fallback: false,
    ...p,
  };
}

describe("collectRecommendationCandidates", () => {
  it("scores points from exact dining rule (multiplier × amount × valuation path)", () => {
    const c = card({ id: "c1", name: "CSP" });
    const e: WalletEntry = {
      userCardId: "uc1",
      nickname: null,
      card: c,
      customCashTopCategory: null,
    };
    const r = rule({
      id: "r1",
      card_id: c.id,
      reward_mode: "points",
      category: "dining",
      multiplier: "3",
      points_currency: "UR",
    });
    const map = new Map([[c.id, [r]]]);
    const out = collectRecommendationCandidates({
      entries: [e],
      rulesByCardId: map,
      purchaseCategory: "dining",
      internalCategory: "dining",
      amountUsed: 100,
      prefs: null,
      partners: [],
    });
    expect(out.appliedCount).toBe(1);
    expect(out.cashCandidates).toHaveLength(0);
    expect(out.pointsCandidates).toHaveLength(1);
    expect(out.pointsCandidates[0]?.estPoints).toBe(300);
    expect(out.pointsCandidates[0]?.estDollars).toBeCloseTo(5.4, 5);
    expect(out.pointsCandidates[0]?.explanation).toContain("Category rule matched");
  });

  it("uses fallback when no category-specific row exists", () => {
    const c = card({ id: "c2", name: "Hyatt" });
    const e: WalletEntry = {
      userCardId: "uc2",
      nickname: null,
      card: c,
      customCashTopCategory: null,
    };
    const r = rule({
      id: "r2",
      card_id: c.id,
      reward_mode: "points",
      category: "other",
      multiplier: "1",
      points_currency: "Hyatt",
      is_fallback: true,
    });
    const map = new Map([[c.id, [r]]]);
    const out = collectRecommendationCandidates({
      entries: [e],
      rulesByCardId: map,
      purchaseCategory: "dining",
      internalCategory: "dining",
      amountUsed: 50,
      prefs: null,
      partners: [],
    });
    expect(out.appliedCount).toBe(1);
    expect(out.pointsCandidates[0]?.estPoints).toBe(50);
    expect(out.pointsCandidates[0]?.explanation).toContain("Fallback rule");
  });

  it("applies Custom Cash resolver when card is catalog Custom Cash", () => {
    const id = CATALOG_SLUGS.citiCustomCash;
    const c = card({ id, name: "Citi Custom Cash Card" });
    const e: WalletEntry = {
      userCardId: "uc3",
      nickname: null,
      card: c,
      customCashTopCategory: "dining",
    };
    const fb = rule({
      id: "r3",
      card_id: id,
      reward_mode: "cashback",
      category: "other",
      multiplier: null,
      cash_percent: "1",
      points_currency: null,
      is_fallback: true,
    });
    const map = new Map([[id, [fb]]]);
    const out = collectRecommendationCandidates({
      entries: [e],
      rulesByCardId: map,
      purchaseCategory: "dining",
      internalCategory: "dining",
      amountUsed: 100,
      prefs: null,
      partners: [],
    });
    expect(out.cashCandidates[0]?.value).toBeCloseTo(5, 5);
    expect(out.cashCandidates[0]?.explanation).toContain("Custom Cash");
    expect(out.cashCandidates[0]?.explanation).toContain("Assumes your selected");
    expect(out.cashCandidates[0]?.explanation).toContain("Est. ~$");
  });
});

describe("pickBestCashCandidate / pickBestPointsCandidate", () => {
  it("picks higher cashback; tie-breaks by card name", () => {
    const a = card({ id: "a", name: "Zebra" });
    const b = card({ id: "b", name: "Alpha" });
    const best = pickBestCashCandidate([
      { card: a, value: 2, explanation: "x" },
      { card: b, value: 2, explanation: "y" },
    ]);
    expect(best?.card.id).toBe(b.id);
  });

  it("picks higher points $ estimate", () => {
    const a = card({ id: "a", name: "A" });
    const b = card({ id: "b", name: "B" });
    const best = pickBestPointsCandidate([
      { card: a, estPoints: 100, estDollars: 1, explanation: "x" },
      { card: b, estPoints: 100, estDollars: 3, explanation: "y" },
    ]);
    expect(best?.card.id).toBe(b.id);
  });
});
