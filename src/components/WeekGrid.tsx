import { DAY_LABELS, formatDayHeader } from "@/lib/week";
import type { KidSchedule, ScheduleEntry } from "@/lib/planner-data";
import { deleteActivityAction } from "@/lib/actions/activity-actions";
import { deleteExceptionAction } from "@/lib/actions/exception-actions";

function EntryRow({ entry, interactive }: { entry: ScheduleEntry; interactive: boolean }) {
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
          <form
            action={entry.kind === "recurring" ? deleteActivityAction : deleteExceptionAction}
          >
            <input
              type="hidden"
              name={entry.kind === "recurring" ? "activityId" : "exceptionId"}
              value={entry.id}
            />
            <button
              type="submit"
              aria-label={`Delete ${entry.title}`}
              className="text-gray-400 hover:text-red-600 print:hidden"
            >
              ×
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

export function WeekGrid({
  schedule,
  interactive = true,
}: {
  schedule: KidSchedule[];
  interactive?: boolean;
}) {
  if (schedule.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No kids added yet — head to the Kids page to add your first one.
      </p>
    );
  }

  const days = schedule[0].days;

  return (
    <div className="grid grid-cols-7 gap-2 print:gap-1">
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="flex flex-col gap-2">
          <div className="border-b border-gray-200 pb-1 text-center">
            <p className="text-sm font-semibold">{DAY_LABELS[dayIndex]}</p>
            <p className="text-xs text-gray-500">{formatDayHeader(day.date)}</p>
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
                  <EntryRow key={entry.id} entry={entry} interactive={interactive} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
