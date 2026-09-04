/** Midnight UTC for the Monday that starts the week containing `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDayHeader(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });
}

export function weekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Locale-correct weekday name for a 0=Monday..6=Sunday index, with no real
 * calendar date attached (used by the dateless "typical week" view). Formats
 * a fixed Monday-starting reference week rather than needing a translated
 * day-name dictionary — Intl already knows every locale's weekday names.
 */
export function weekdayName(dayIndex: number, locale: string, style: "long" | "short" = "long") {
  const reference = new Date(Date.UTC(2024, 0, 1 + dayIndex)); // 2024-01-01 was a Monday
  return reference.toLocaleDateString(locale, { weekday: style, timeZone: "UTC" });
}
