import { describe, expect, it } from "vitest";
import {
  estimatedCashbackValue,
  estimatedPointDollarValue,
  getCentsPerPoint,
} from "./valuation";

describe("getCentsPerPoint", () => {
  it("returns configured valuations", () => {
    expect(getCentsPerPoint("UR")).toBe(0.018);
    expect(getCentsPerPoint("mr")).toBe(0.017);
    expect(getCentsPerPoint("TY")).toBe(0.015);
    expect(getCentsPerPoint("Hyatt")).toBe(0.0185);
    expect(getCentsPerPoint("Marriott")).toBe(0.0075);
    expect(getCentsPerPoint("AA")).toBe(0.013);
  });

  it("defaults unknown currencies to 1 cent per point", () => {
    expect(getCentsPerPoint("UNKNOWN")).toBe(0.01);
  });
});

describe("estimatedPointDollarValue", () => {
  it("multiplies points by cents-per-point", () => {
    expect(estimatedPointDollarValue(10_000, "UR")).toBeCloseTo(180, 5);
  });

  it("returns 0 for non-finite points", () => {
    expect(estimatedPointDollarValue(Number.NaN, "UR")).toBe(0);
  });
});

describe("estimatedCashbackValue", () => {
  it("applies percent to purchase amount", () => {
    expect(estimatedCashbackValue(120, 6)).toBeCloseTo(7.2, 5);
  });
});
