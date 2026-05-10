import { describe, expect, it } from "vitest";
import type { RewardRuleRow } from "@/types/reward-rules";
import {
  getAppliedRewardRule,
  getAppliedRewardRuleWithPath,
} from "./get-applied-reward-rule";

function R(partial: Partial<RewardRuleRow> & Pick<RewardRuleRow, "id" | "card_id">): RewardRuleRow {
  return {
    reward_mode: "points",
    category: "dining",
    multiplier: "1",
    cash_percent: null,
    points_currency: "X",
    notes: null,
    priority: null,
    is_fallback: false,
    ...partial,
  };
}

const CARD = "c0000000-0000-4000-8000-0000000000aa";

describe("getAppliedRewardRuleWithPath", () => {
  it("returns internal path on internal category match", () => {
    const rules = [
      R({ id: "1", card_id: CARD, category: "other", is_fallback: true, multiplier: "1" }),
      R({ id: "2", card_id: CARD, category: "dining", multiplier: "3" }),
    ];
    const out = getAppliedRewardRuleWithPath(rules, "dining", "dining");
    expect(out.path).toBe("internal");
    expect(out.rule?.id).toBe("2");
  });

  it("returns legacy_slug when internal misses and purchase slug matches", () => {
    const rules = [
      R({ id: "1", card_id: CARD, category: "groceries", multiplier: "5", points_currency: "UR" }),
      R({ id: "2", card_id: CARD, category: "other", is_fallback: true, multiplier: "1" }),
    ];
    const out = getAppliedRewardRuleWithPath(rules, "online_grocery", "groceries");
    expect(out.path).toBe("legacy_slug");
    expect(out.rule?.id).toBe("1");
  });

  it("returns fallback when no exact", () => {
    const rules = [
      R({
        id: "1",
        card_id: CARD,
        category: "dining",
        reward_mode: "points",
        multiplier: "3",
      }),
      R({
        id: "2",
        card_id: CARD,
        category: "other",
        reward_mode: "points",
        multiplier: "1",
        is_fallback: true,
      }),
    ];
    const out = getAppliedRewardRuleWithPath(rules, "travel_other", "travel");
    expect(out.path).toBe("fallback");
    expect(out.rule?.id).toBe("2");
  });
});

describe("getAppliedRewardRule", () => {
  it("returns exact match on internal category", () => {
    const rules = [
      R({ id: "1", card_id: CARD, category: "other", is_fallback: true, multiplier: "1" }),
      R({ id: "2", card_id: CARD, category: "dining", multiplier: "3" }),
    ];
    const r = getAppliedRewardRule(rules, "dining", "dining");
    expect(r).not.toBeNull();
    expect(r!.id).toBe("2");
  });

  it("prefers lower priority on duplicate exact category", () => {
    const rules = [
      R({ id: "a", card_id: CARD, category: "dining", multiplier: "1", priority: "20" }),
      R({ id: "b", card_id: CARD, category: "dining", multiplier: "3", priority: "10" }),
    ];
    const r = getAppliedRewardRule(rules, "dining", "dining");
    expect(r).not.toBeNull();
    expect(r!.id).toBe("b");
  });

  it("uses legacy purchase slug when internal has no row", () => {
    const rules = [
      R({ id: "1", card_id: CARD, category: "groceries", multiplier: "5", points_currency: "UR" }),
      R({ id: "2", card_id: CARD, category: "other", is_fallback: true, multiplier: "1" }),
    ];
    const out = getAppliedRewardRule(rules, "online_grocery", "groceries");
    expect(out?.id).toBe("1");
  });

  it("uses is_fallback when no exact", () => {
    const rules = [
      R({
        id: "1",
        card_id: CARD,
        category: "dining",
        reward_mode: "points",
        multiplier: "3",
        is_fallback: false,
      }),
      R({
        id: "2",
        card_id: CARD,
        category: "other",
        reward_mode: "points",
        multiplier: "1",
        is_fallback: true,
      }),
    ];
    const out = getAppliedRewardRule(rules, "travel_other", "travel");
    expect(out?.id).toBe("2");
  });

  it("uses category=other when no is_fallback set", () => {
    const rules = [
      R({
        id: "1",
        card_id: CARD,
        category: "other",
        reward_mode: "cashback",
        multiplier: null,
        cash_percent: "2",
        is_fallback: false,
      }),
    ];
    const out = getAppliedRewardRule(rules, "travel_other", "travel");
    expect(out?.id).toBe("1");
  });

  it("returns null when no match and no fallback", () => {
    const rules = [
      R({
        id: "1",
        card_id: CARD,
        category: "dining",
        reward_mode: "points",
        multiplier: "1",
        is_fallback: false,
      }),
    ];
    expect(getAppliedRewardRule(rules, "flight_direct", "travel")).toBeNull();
  });

});
