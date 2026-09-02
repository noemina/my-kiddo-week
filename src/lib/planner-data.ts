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
    include: { activities: true },
  });

  const weekEnd = addDays(weekStart, 7);
  const exceptions = await prisma.activityException.findMany({
    where: {
      kid: { familyId },
      date: { gte: weekStart, lt: weekEnd },
    },
  });

  const days = weekDays(weekStart);

  return kids.map((kid) => ({
    kid: { id: kid.id, name: kid.name, color: kid.color },
    days: days.map((date, dayIndex) => {
      const recurring: ScheduleEntry[] = kid.activities
        .filter((a) => a.dayOfWeek === dayIndex && isActiveOn(a, date))
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
        .filter((e) => e.kidId === kid.id && isoDate(e.date) === isoDate(date))
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
