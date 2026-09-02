import { describe, expect, it } from "vitest";
import { isActiveOn } from "@/lib/planner-data";

describe("isActiveOn", () => {
  it("is active when no validity window is set", () => {
    const activity = { validFrom: null, validTo: null };
    expect(isActiveOn(activity, new Date("2026-01-01"))).toBe(true);
  });

  it("is inactive before validFrom", () => {
    const activity = { validFrom: new Date("2026-09-01"), validTo: null };
    expect(isActiveOn(activity, new Date("2026-08-31"))).toBe(false);
    expect(isActiveOn(activity, new Date("2026-09-01"))).toBe(true);
  });

  it("is inactive after validTo", () => {
    const activity = { validFrom: null, validTo: new Date("2027-06-30") };
    expect(isActiveOn(activity, new Date("2027-07-01"))).toBe(false);
    expect(isActiveOn(activity, new Date("2027-06-30"))).toBe(true);
  });

  it("supports a school-year style range spanning Sept to next Sept", () => {
    const schoolYear = {
      validFrom: new Date("2026-09-01"),
      validTo: new Date("2027-09-01"),
    };
    expect(isActiveOn(schoolYear, new Date("2026-08-15"))).toBe(false);
    expect(isActiveOn(schoolYear, new Date("2027-01-15"))).toBe(true);
    expect(isActiveOn(schoolYear, new Date("2027-10-01"))).toBe(false);
  });
});
