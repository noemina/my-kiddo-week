import { prisma } from "@/lib/prisma";
import { addDays, isoDate, weekDays } from "@/lib/week";

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

export async function getWeekSchedule(
  familyId: string,
  weekStart: Date
): Promise<KidSchedule[]> {
  const kids = await prisma.kid.findMany({
    where: { familyId },
    orderBy: { createdAt: "asc" },
  });

  const weekEnd = addDays(weekStart, 7);
  const [activities, exceptions] = await Promise.all([
    prisma.activity.findMany({
      where: { kids: { some: { familyId } } },
      include: { kids: true },
    }),
    prisma.activityException.findMany({
      where: {
        kids: { some: { familyId } },
        date: { gte: weekStart, lt: weekEnd },
      },
      include: { kids: true },
    }),
  ]);

  const days = weekDays(weekStart);

  return kids.map((kid) => ({
    kid: { id: kid.id, name: kid.name, color: kid.color },
    days: days.map((date, dayIndex) => {
      const recurring: ScheduleEntry[] = activities
        .filter(
          (a) =>
            a.dayOfWeek === dayIndex &&
            isActiveOn(a, date) &&
            a.kids.some((k) => k.id === kid.id)
        )
        .map((a) => ({
          id: a.id,
          title: a.title,
          startTime: a.startTime,
          endTime: a.endTime,
          location: a.location,
          category: a.category,
          color: a.color ?? kid.color,
          kind: "recurring",
        }));

      const oneOff: ScheduleEntry[] = exceptions
        .filter(
          (e) => isoDate(e.date) === isoDate(date) && e.kids.some((k) => k.id === kid.id)
        )
        .map((e) => ({
          id: e.id,
          title: e.title,
          startTime: e.startTime,
          endTime: e.endTime,
          location: e.location,
          category: e.category,
          color: e.color ?? kid.color,
          kind: "exception",
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
  title: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  color: string;
  dayIndex: number; // 0 = Monday .. 6 = Sunday
  kidIds: string[];
  defaultChecked: boolean;
};

/** Flat, print-oriented view of a specific calendar week (recurring occurrences + exceptions). */
export async function getDatedPrintData(
  familyId: string,
  weekStart: Date
): Promise<{ kids: PrintKid[]; instances: PrintInstance[] }> {
  const weekEnd = addDays(weekStart, 7);
  const days = weekDays(weekStart);

  const [kids, activities, exceptions] = await Promise.all([
    prisma.kid.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } }),
    prisma.activity.findMany({
      where: { kids: { some: { familyId } } },
      include: { kids: true },
    }),
    prisma.activityException.findMany({
      where: {
        kids: { some: { familyId } },
        date: { gte: weekStart, lt: weekEnd },
      },
      include: { kids: true },
    }),
  ]);

  const instances: PrintInstance[] = [];

  for (const a of activities) {
    const date = days[a.dayOfWeek];
    if (!isActiveOn(a, date)) continue;
    instances.push({
      id: a.id,
      kind: "recurring",
      title: a.title,
      startTime: a.startTime,
      endTime: a.endTime,
      location: a.location,
      color: a.color ?? a.kids[0]?.color ?? "#6366f1",
      dayIndex: a.dayOfWeek,
      kidIds: a.kids.map((k) => k.id),
      defaultChecked: true,
    });
  }

  for (const e of exceptions) {
    const dayIndex = days.findIndex((d) => isoDate(d) === isoDate(e.date));
    if (dayIndex === -1) continue;
    instances.push({
      id: e.id,
      kind: "exception",
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      color: e.color ?? e.kids[0]?.color ?? "#6366f1",
      dayIndex,
      kidIds: e.kids.map((k) => k.id),
      defaultChecked: true,
    });
  }

  return { kids: kids.map((k) => ({ id: k.id, name: k.name, color: k.color })), instances };
}

/** Dateless "typical week" template — recurring activities only, one instance per weekday slot. */
export async function getTypicalWeekData(
  familyId: string
): Promise<{ kids: PrintKid[]; instances: PrintInstance[] }> {
  const today = new Date();

  const [kids, activities] = await Promise.all([
    prisma.kid.findMany({ where: { familyId }, orderBy: { createdAt: "asc" } }),
    prisma.activity.findMany({
      where: { kids: { some: { familyId } } },
      include: { kids: true },
    }),
  ]);

  const instances: PrintInstance[] = activities.map((a) => ({
    id: a.id,
    kind: "recurring",
    title: a.title,
    startTime: a.startTime,
    endTime: a.endTime,
    location: a.location,
    color: a.color ?? a.kids[0]?.color ?? "#6366f1",
    dayIndex: a.dayOfWeek,
    kidIds: a.kids.map((k) => k.id),
    defaultChecked: a.includeInTypicalWeek && isActiveOn(a, today),
  }));

  return { kids: kids.map((k) => ({ id: k.id, name: k.name, color: k.color })), instances };
}
