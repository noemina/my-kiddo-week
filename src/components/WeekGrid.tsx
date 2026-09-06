"use client";

import { useLocale } from "next-intl";
import { formatDayHeader, weekdayName } from "@/lib/week";
import type { KidSchedule, ScheduleEntry } from "@/lib/planner-data";

function EntryRow({
  entry,
  interactive,
  onClick,
}: {
  entry: ScheduleEntry;
  interactive: boolean;
  onClick?: (entry: ScheduleEntry) => void;
}) {
  const time = entry.startTime
    ? entry.endTime
      ? `${entry.startTime}–${entry.endTime}`
      : entry.startTime
    : null;

  return (
    <li
      className={`rounded-md border-l-4 bg-gray-50 px-2 py-1.5 text-xs leading-tight dark:bg-gray-800 print:bg-white ${
        interactive ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" : ""
      }`}
      style={{ borderLeftColor: entry.color ?? "#6366f1" }}
      onClick={interactive ? () => onClick?.(entry) : undefined}
    >
      <p className="font-medium text-gray-900 dark:text-gray-100">{entry.title}</p>
      {time && <p className="text-gray-500 dark:text-gray-400">{time}</p>}
      {entry.location && <p className="text-gray-500 dark:text-gray-400">{entry.location}</p>}
    </li>
  );
}

export function WeekGrid({
  schedule,
  interactive = true,
  noKidsMessage,
  onEntryClick,
}: {
  schedule: KidSchedule[];
  interactive?: boolean;
  noKidsMessage: string;
  onEntryClick?: (entry: ScheduleEntry, date: Date) => void;
}) {
  const locale = useLocale();

  if (schedule.length === 0) {
    return <p className="text-sm text-gray-500">{noKidsMessage}</p>;
  }

  const days = schedule[0].days;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-7 sm:gap-2 print:grid-cols-7 print:gap-1">
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="flex flex-col gap-2">
          <div className="border-b border-gray-200 pb-1 text-center dark:border-gray-800">
            <p className="text-sm font-semibold">{weekdayName(dayIndex, locale)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDayHeader(day.date, locale)}
            </p>
          </div>

          {schedule.map((kidSchedule) => (
            <div key={kidSchedule.kid.id} className="flex flex-col gap-1">
              <p
                className="truncate text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: kidSchedule.kid.color }}
              >
                {kidSchedule.kid.name}
              </p>
              <ul className="flex flex-col gap-1">
                {kidSchedule.days[dayIndex].entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    interactive={interactive}
                    onClick={(e) => onEntryClick?.(e, day.date)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
