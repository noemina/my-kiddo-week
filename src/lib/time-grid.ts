export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const DEFAULT_RANGE_START = timeToMinutes("07:00");
const DEFAULT_RANGE_END = timeToMinutes("20:00");
const RANGE_PADDING_MINUTES = 60;

/** Shared time-axis range covering every entry, padded an hour on each side. */
export function computeTimeRange(entryMinutes: { start: number; end: number }[]): {
  startMinutes: number;
  endMinutes: number;
} {
  if (entryMinutes.length === 0) {
    return { startMinutes: DEFAULT_RANGE_START, endMinutes: DEFAULT_RANGE_END };
  }

  // Tight around the actual entries — the 7am-8pm constants only apply to
  // the fully-empty case above. Folding them into this min/max used to force
  // every non-empty range to span at least 7am-8pm, leaving hours of empty
  // space above/below a tightly-clustered day's real events.
  const earliest = Math.min(...entryMinutes.map((e) => e.start));
  const latest = Math.max(...entryMinutes.map((e) => e.end));

  const startMinutes = Math.max(0, Math.floor((earliest - RANGE_PADDING_MINUTES) / 60) * 60);
  const endMinutes = Math.min(24 * 60, Math.ceil((latest + RANGE_PADDING_MINUTES) / 60) * 60);

  return { startMinutes, endMinutes };
}

export function hourTicks(range: { startMinutes: number; endMinutes: number }): number[] {
  const ticks: number[] = [];
  for (let m = Math.ceil(range.startMinutes / 60) * 60; m <= range.endMinutes; m += 60) {
    ticks.push(m);
  }
  return ticks;
}

/** Percentage position/height for an entry within the shared time range. */
export function positionInRange(
  entry: { start: number; end: number },
  range: { startMinutes: number; endMinutes: number }
): { topPct: number; heightPct: number } {
  const total = range.endMinutes - range.startMinutes || 1;
  const clampedStart = Math.max(range.startMinutes, Math.min(entry.start, range.endMinutes));
  const clampedEnd = Math.max(range.startMinutes, Math.min(entry.end, range.endMinutes));
  const topPct = ((clampedStart - range.startMinutes) / total) * 100;
  // Floor high enough that a short entry's 3 lines of text (title, time,
  // location) don't get clipped by the box's own overflow:hidden.
  const heightPct = Math.max(((clampedEnd - clampedStart) / total) * 100, 8);
  return { topPct, heightPct };
}
