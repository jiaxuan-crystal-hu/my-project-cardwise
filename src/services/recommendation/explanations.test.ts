import { describe, expect, it } from "vitest";
import type { RewardRuleRow } from "@/types/reward-rules";
import { appendIssuerNote, matchPathCaption, truncateNote } from "./explanations";

describe("truncateNote", () => {
  it("truncates long strings", () => {
    const s = "x".repeat(200);
    expect(truncateNote(s, 20).length).toBeLessThanOrEqual(20);
  });
});

describe("matchPathCaption", () => {
  it("returns labels for each path", () => {
    expect(matchPathCaption("internal")).toContain("Category");
    expect(matchPathCaption("fallback")).toContain("Fallback");
  });
});

describe("appendIssuerNote", () => {
  it("skips when note already in sentence", () => {
    const rule = { notes: "Same text" } as RewardRuleRow;
    expect(appendIssuerNote("Same text", rule)).toBe("Same text");
  });
});
