import { describe, expect, it } from "vitest";
import { getPointsValueBoost } from "./preference-boost";

describe("getPointsValueBoost", () => {
  it("is 1.0 with no travel goal", () => {
    const r = getPointsValueBoost({ travel_goal: null }, [], "UR");
    expect(r.multiplier).toBe(1);
    expect(r.reason).toBeNull();
  });

  it("applies 1.1x for hotels + Hyatt with UR", () => {
    const r = getPointsValueBoost(
      { travel_goal: "hotels" },
      [{ points_currency: "UR", partner_name: "Hyatt", transfer_ratio: 1 }],
      "UR",
    );
    expect(r.multiplier).toBe(1.1);
    expect(r.reason).toBeTruthy();
  });
});
