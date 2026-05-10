import { describe, expect, it } from "vitest";
import { verifyTask4Seeds } from "./task4-seed-verify";

describe("verifyTask4Seeds", () => {
  it("passes for current Task 4/5 seeds", () => {
    const r = verifyTask4Seeds();
    expect(r.ok).toBe(true);
    expect(r.lines.some((l) => l.startsWith("OK"))).toBe(true);
  });
});
