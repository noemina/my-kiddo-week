import { describe, expect, it } from "vitest";
import { addDays, formatDayHeader, isoDate, startOfWeek, weekDays, weekdayName } from "@/lib/week";

describe("startOfWeek", () => {
  it("returns the same Monday when given a Monday", () => {
    const monday = new Date("2026-09-07T15:00:00Z"); // a Monday
    expect(isoDate(startOfWeek(monday))).toBe("2026-09-07");
  });

  it("rolls back to the previous Monday mid-week", () => {
    const wednesday = new Date("2026-09-09T00:00:00Z");
    expect(isoDate(startOfWeek(wednesday))).toBe("2026-09-07");
  });

  it("rolls back to Monday when given a Sunday", () => {
    const sunday = new Date("2026-09-13T23:59:00Z");
    expect(isoDate(startOfWeek(sunday))).toBe("2026-09-07");
  });
});

describe("weekDays", () => {
  it("produces 7 consecutive days starting from weekStart", () => {
    const monday = startOfWeek(new Date("2026-09-07T00:00:00Z"));
    const days = weekDays(monday);
    expect(days).toHaveLength(7);
    expect(isoDate(days[0])).toBe("2026-09-07");
    expect(isoDate(days[6])).toBe("2026-09-13");
  });
});

describe("addDays", () => {
  it("handles month boundaries", () => {
    const date = new Date("2026-09-30T00:00:00Z");
    expect(isoDate(addDays(date, 2))).toBe("2026-10-02");
  });
});

describe("weekdayName", () => {
  it("gives locale-correct weekday names with no real date attached", () => {
    expect(weekdayName(0, "en")).toBe("Monday");
    expect(weekdayName(6, "en")).toBe("Sunday");
    expect(weekdayName(0, "fr")).toBe("lundi");
    expect(weekdayName(0, "it")).toBe("lunedì");
    expect(weekdayName(0, "de")).toBe("Montag");
  });

  it("supports a short style", () => {
    expect(weekdayName(0, "en", "short")).toBe("Mon");
  });
});

describe("formatDayHeader", () => {
  it("formats a date per the given locale", () => {
    const date = new Date("2026-09-07T00:00:00Z");
    expect(formatDayHeader(date, "en")).toBe("Sep 7");
  });
});
