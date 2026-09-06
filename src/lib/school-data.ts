import type { PlanData } from "@/lib/plan-store";
import type { PrintInstance, PrintKid } from "@/lib/planner-data";

export type SchoolScheduleEntry = {
  id: string;
  title: string;
  startTime: string;
  endTime: string | null;
  color: string;
};

export type SchoolKidSchedule = {
  kid: { id: string; name: string; color: string };
  /** One array per weekday, 0 = Monday .. 6 = Sunday — dateless, since the
   * timetable is a fixed recurring template, not tied to a specific week. */
  days: SchoolScheduleEntry[][];
};

function bySt(a: SchoolScheduleEntry, b: SchoolScheduleEntry): number {
  return a.startTime.localeCompare(b.startTime);
}

/** Dateless weekly view of every subject, one row per kid. */
export function getSchoolWeekSchedule(plan: PlanData): SchoolKidSchedule[] {
  return plan.kids.map((kid) => ({
    kid: { id: kid.id, name: kid.name, color: kid.color },
    days: Array.from({ length: 7 }, (_, dayIndex) =>
      plan.schoolSubjects
        .filter((s) => s.kidIds.includes(kid.id) && s.daysOfWeek.includes(dayIndex))
        .map((s) => ({
          id: s.id,
          title: s.title,
          startTime: s.startTime,
          endTime: s.endTime,
          color: s.color ?? kid.color,
        }))
        .sort(bySt)
    ),
  }));
}

function firstKidColor(plan: PlanData, kidIds: string[]): string | undefined {
  return plan.kids.find((k) => kidIds.includes(k.id))?.color;
}

/** Print-oriented flattening (matches the shape planner-data.ts's
 * getTypicalWeekData produces) so the same PrintWeekView component that
 * renders Activities' typical week can render the school timetable too —
 * one instance per subject-day, sharing the subject id as seriesId so the
 * "events to include" picker collapses a multi-day subject to one row. */
export function getSchoolPrintData(plan: PlanData): { kids: PrintKid[]; instances: PrintInstance[] } {
  const instances: PrintInstance[] = [];
  for (const s of plan.schoolSubjects) {
    for (const dayIndex of s.daysOfWeek) {
      instances.push({
        id: `${s.id}:${dayIndex}`,
        kind: "recurring",
        seriesId: s.id,
        title: s.title,
        startTime: s.startTime,
        endTime: s.endTime,
        location: null,
        color: s.color ?? firstKidColor(plan, s.kidIds) ?? "#6366f1",
        dayIndex,
        kidIds: s.kidIds,
        defaultChecked: true,
      });
    }
  }
  return { kids: plan.kids.map((k) => ({ id: k.id, name: k.name, color: k.color })), instances };
}
