import { describe, expect, it } from "vitest";
import { resolveCitiCustomCashMvpCashback } from "./citi-custom-cash";

describe("resolveCitiCustomCashMvpCashback", () => {
  it("uses 1% when no wallet top category is set", () => {
    const r = resolveCitiCustomCashMvpCashback({
      purchaseCategory: "dining",
      savedTopCategory: null,
    });
    expect(r.cashPercent).toBe(1);
    expect(r.explanation).toContain("default 1%");
  });

  it("uses 5% when wallet top category matches purchase category", () => {
    const r = resolveCitiCustomCashMvpCashback({
      purchaseCategory: "dining",
      savedTopCategory: "dining",
    });
    expect(r.cashPercent).toBe(5);
    expect(r.explanation).toContain("Assumes your selected Citi Custom Cash top category");
    expect(r.explanation).toContain("Dining");
  });

  it("uses 1% when wallet top category does not match purchase category", () => {
    const r = resolveCitiCustomCashMvpCashback({
      purchaseCategory: "dining",
      savedTopCategory: "groceries",
    });
    expect(r.cashPercent).toBe(1);
    expect(r.explanation).toContain("default 1%");
  });
});
