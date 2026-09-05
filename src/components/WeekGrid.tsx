"use client";

import { useLocale } from "next-intl";
import { formatDayHeader, weekdayName } from "@/lib/week";
import type { KidSchedule, ScheduleEntry } from "@/lib/planner-data";

function EntryRow({
  entry,
  interactive,
  onDelete,
}: {
  entry: ScheduleEntry;
  interactive: boolean;
  onDelete?: (entry: ScheduleEntry) => void;
}) {
  const time = entry.startTime
    ? entry.endTime
      ? `${entry.startTime}–${entry.endTime}`
      : entry.startTime
    : null;

  return (
    <li
      className="rounded-md border-l-4 bg-gray-50 px-2 py-1.5 text-xs leading-tight print:bg-white"
      style={{ borderLeftColor: entry.color ?? "#6366f1" }}
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <p className="font-medium text-gray-900">{entry.title}</p>
          {time && <p className="text-gray-500">{time}</p>}
          {entry.location && <p className="text-gray-500">{entry.location}</p>}
        </div>
        {interactive && (
          <button
            type="button"
            onClick={() => onDelete?.(entry)}
            aria-label={`Delete ${entry.title}`}
            className="text-gray-400 hover:text-red-600 print:hidden"
          >
            ×
          </button>
        )}
      </div>
    </li>
  );
}

export function WeekGrid({
  schedule,
  interactive = true,
  noKidsMessage,
  onDeleteEntry,
}: {
  schedule: KidSchedule[];
  interactive?: boolean;
  noKidsMessage: string;
  onDeleteEntry?: (entry: ScheduleEntry) => void;
}) {
  const locale = useLocale();

  if (schedule.length === 0) {
    return <p className="text-sm text-gray-500">{noKidsMessage}</p>;
  }

  const days = schedule[0].days;

  return (
    <div className="grid grid-cols-7 gap-2 print:gap-1">
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="flex flex-col gap-2">
          <div className="border-b border-gray-200 pb-1 text-center">
            <p className="text-sm font-semibold">{weekdayName(dayIndex, locale)}</p>
            <p className="text-xs text-gray-500">{formatDayHeader(day.date, locale)}</p>
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
                    onDelete={onDeleteEntry}
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
