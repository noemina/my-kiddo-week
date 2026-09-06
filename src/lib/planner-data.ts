import { weekDays, isoDate } from "@/lib/week";
import type { PlanData } from "@/lib/plan-store";
import { categoryColor } from "@/lib/category-colors";

export type ScheduleEntry = {
  id: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  category: string | null;
  color: string | null;
  kind: "recurring" | "exception";
};

export type DaySchedule = {
  date: Date;
  entries: ScheduleEntry[];
};

export type KidSchedule = {
  kid: { id: string; name: string; color: string };
  days: DaySchedule[];
};

function byStartTime(a: ScheduleEntry, b: ScheduleEntry): number {
  if (!a.startTime) return 1;
  if (!b.startTime) return -1;
  return a.startTime.localeCompare(b.startTime);
}

export function isActiveOn(
  activity: { validFrom: Date | null; validTo: Date | null },
  date: Date
): boolean {
  if (activity.validFrom && date < activity.validFrom) return false;
  if (activity.validTo && date > activity.validTo) return false;
  return true;
}

function toDate(value: string | null): Date | null {
  return value ? new Date(value) : null;
}

export function getWeekSchedule(plan: PlanData, weekStart: Date): KidSchedule[] {
  const days = weekDays(weekStart);

  return plan.kids.map((kid) => ({
    kid: { id: kid.id, name: kid.name, color: kid.color },
    days: days.map((date, dayIndex) => {
      const recurring: ScheduleEntry[] = plan.activities
        .filter(
          (a) =>
            a.dayOfWeek === dayIndex &&
            a.kidIds.includes(kid.id) &&
            !a.excludeDates.includes(isoDate(date)) &&
            isActiveOn({ validFrom: toDate(a.validFrom), validTo: toDate(a.validTo) }, date)
        )
        .map((a) => ({
          id: a.id,
          title: a.title,
          startTime: a.startTime,
          endTime: a.endTime,
          location: a.location,
          category: a.category,
          color: a.color ?? categoryColor(a.category) ?? kid.color,
          kind: "recurring" as const,
        }));

      const oneOff: ScheduleEntry[] = plan.exceptions
        .filter((e) => e.kidIds.includes(kid.id) && e.date === isoDate(date))
        .map((e) => ({
          id: e.id,
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          location: e.location,
          category: e.category,
          color: e.color ?? categoryColor(e.category) ?? kid.color,
          kind: "exception" as const,
        }));

      return {
        date,
        entries: [...recurring, ...oneOff].sort(byStartTime),
      };
    }),
  }));
}

export type PrintKid = { id: string; name: string; color: string };

export type PrintInstance = {
  id: string;
  kind: "recurring" | "exception";
  /** Groups every day-of-week occurrence of the same recurring activity so a
   * picker can offer one checkbox for the whole series. An exception has no
   * series to share, so it uses its own id — always shown on its own,
   * including one split off a series via "edit this occurrence only". */
  seriesId: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  color: string;
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  kidIds: string[];
  defaultChecked: boolean;
};

function firstKidColor(plan: PlanData, kidIds: string[]): string | undefined {
  return plan.kids.find((k) => kidIds.includes(k.id))?.color;
}

/** Flat, print-oriented view of a specific calendar week (recurring occurrences + exceptions). */
export function getDatedPrintData(
  plan: PlanData,
  weekStart: Date
): { kids: PrintKid[]; instances: PrintInstance[] } {
  const days = weekDays(weekStart);
  const instances: PrintInstance[] = [];

  for (const a of plan.activities) {
    const date = days[a.dayOfWeek];
    if (a.excludeDates.includes(isoDate(date))) continue;
    if (!isActiveOn({ validFrom: toDate(a.validFrom), validTo: toDate(a.validTo) }, date)) continue;
    instances.push({
      id: a.id,
      kind: "recurring",
      seriesId: a.seriesId,
      title: a.title,
      startTime: a.startTime,
      endTime: a.endTime,
      location: a.location,
      color: a.color ?? categoryColor(a.category) ?? firstKidColor(plan, a.kidIds) ?? "#6366f1",
      dayIndex: a.dayOfWeek,
      kidIds: a.kidIds,
      defaultChecked: true,
    });
  }

  for (const e of plan.exceptions) {
    const dayIndex = days.findIndex((d) => isoDate(d) === e.date);
    if (dayIndex === -1) continue;
    instances.push({
      id: e.id,
      kind: "exception",
      seriesId: e.id,
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      color: e.color ?? categoryColor(e.category) ?? firstKidColor(plan, e.kidIds) ?? "#6366f1",
      dayIndex,
      kidIds: e.kidIds,
      defaultChecked: true,
    });
  }

  return { kids: plan.kids.map((k) => ({ id: k.id, name: k.name, color: k.color })), instances };
}

/** Dateless "typical week" template — recurring activities only, one instance per weekday slot. */
export function getTypicalWeekData(plan: PlanData): { kids: PrintKid[]; instances: PrintInstance[] } {
  const today = new Date();

  const instances: PrintInstance[] = plan.activities.map((a) => ({
    id: a.id,
    kind: "recurring",
    seriesId: a.seriesId,
    title: a.title,
    startTime: a.startTime,
    endTime: a.endTime,
    location: a.location,
    color: a.color ?? categoryColor(a.category) ?? firstKidColor(plan, a.kidIds) ?? "#6366f1",
    dayIndex: a.dayOfWeek,
    kidIds: a.kidIds,
    defaultChecked:
      a.includeInTypicalWeek &&
      isActiveOn({ validFrom: toDate(a.validFrom), validTo: toDate(a.validTo) }, today),
  }));

  return { kids: plan.kids.map((k) => ({ id: k.id, name: k.name, color: k.color })), instances };
}
