"use client";

import { useLocale } from "next-intl";
import { weekdayName } from "@/lib/week";
import type { SchoolKidSchedule, SchoolScheduleEntry } from "@/lib/school-data";

function EntryRow({
  entry,
  onClick,
}: {
  entry: SchoolScheduleEntry;
  onClick?: (entry: SchoolScheduleEntry) => void;
}) {
  const time = entry.endTime ? `${entry.startTime}–${entry.endTime}` : entry.startTime;

  return (
    <li
      className="cursor-pointer rounded-md border-l-4 bg-gray-50 px-2 py-1.5 text-xs leading-tight hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
      style={{ borderLeftColor: entry.color }}
      onClick={() => onClick?.(entry)}
    >
      <p className="font-medium text-gray-900 dark:text-gray-100">{entry.title}</p>
      <p className="text-gray-500 dark:text-gray-400">{time}</p>
    </li>
  );
}

// Same visual style as WeekGrid (the activities planner), but dateless — a
// school timetable is a fixed recurring template, not tied to a specific
// calendar week, so there's no date subtext under the weekday name.
export function SchoolWeekGrid({
  schedule,
  noKidsMessage,
  onEntryClick,
}: {
  schedule: SchoolKidSchedule[];
  noKidsMessage: string;
  onEntryClick?: (entry: SchoolScheduleEntry) => void;
}) {
  const locale = useLocale();

  if (schedule.length === 0) {
    return <p className="text-sm text-gray-500">{noKidsMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-7 sm:gap-2">
      {Array.from({ length: 7 }, (_, dayIndex) => (
        <div key={dayIndex} className="flex flex-col gap-2">
          <div className="border-b border-gray-200 pb-1 text-center dark:border-gray-800">
            <p className="text-sm font-semibold">{weekdayName(dayIndex, locale)}</p>
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
                {kidSchedule.days[dayIndex].map((entry) => (
                  <EntryRow key={entry.id} entry={entry} onClick={onEntryClick} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
