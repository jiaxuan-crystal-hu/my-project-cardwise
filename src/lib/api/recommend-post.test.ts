import { describe, expect, it } from "vitest";
import { parseRecommendPostBody } from "./recommend-post";

describe("parseRecommendPostBody", () => {
  it("accepts valid category with optional amount", () => {
    const a = parseRecommendPostBody({ category: "Dining", amount: 50 });
    expect(a.ok).toBe(true);
    if (a.ok) {
      expect(a.data.category).toBe("dining");
      expect(a.data.amount).toBe(50);
    }
  });

  it("rejects unknown category", () => {
    const a = parseRecommendPostBody({ category: "crypto" });
    expect(a.ok).toBe(false);
    if (!a.ok) expect(a.message).toContain("category must be one of");
  });

  it("rejects non-positive amount", () => {
    const a = parseRecommendPostBody({ category: "dining", amount: 0 });
    expect(a.ok).toBe(false);
  });

  it("allows null amount", () => {
    const a = parseRecommendPostBody({ category: "travel", amount: null });
    expect(a.ok).toBe(true);
    if (a.ok) expect(a.data.amount).toBeNull();
  });
});
