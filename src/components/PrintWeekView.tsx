"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  computeTimeRange,
  hourTicks,
  minutesToLabel,
  positionInRange,
  timeToMinutes,
} from "@/lib/time-grid";
import type { PrintInstance, PrintKid } from "@/lib/planner-data";
import { PrintButton } from "@/components/PrintButton";

const DEFAULT_DURATION_MINUTES = 45;

function timeRangeLabel(entry: { startTime: string | null; endTime: string | null }): string | null {
  if (!entry.startTime) return null;
  return entry.endTime ? `${entry.startTime}–${entry.endTime}` : entry.startTime;
}

type Props = {
  familyName: string;
  weekLabel: string;
  kids: PrintKid[];
  instances: PrintInstance[];
  dayLabels: string[]; // exactly 7, Monday first
};

function addMinutes(time: string, minutes: number): string {
  const total = timeToMinutes(time) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function PrintWeekView({ familyName, weekLabel, kids, instances, dayLabels }: Props) {
  const t = useTranslations("Print");
  const [notes, setNotes] = useState("");
  const [checkedDays, setCheckedDays] = useState<boolean[]>(() => Array(7).fill(true));
  const [checkedInstances, setCheckedInstances] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(instances.map((i) => [i.id, i.defaultChecked]))
  );

  const visibleDays = dayLabels
    .map((label, index) => ({ label, index }))
    .filter((d) => checkedDays[d.index]);

  const activeInstances = instances.filter((i) => checkedInstances[i.id] ?? false);
  const timedInstances = activeInstances.filter((i) => i.startTime);

  const range = computeTimeRange(
    timedInstances.map((i) => ({
      start: timeToMinutes(i.startTime!),
      end: timeToMinutes(i.endTime ?? addMinutes(i.startTime!, DEFAULT_DURATION_MINUTES)),
    }))
  );
  const ticks = hourTicks(range);

  function entriesFor(dayIndex: number, kidId: string) {
    return activeInstances.filter((i) => i.dayIndex === dayIndex && i.kidIds.includes(kidId));
  }

  if (kids.length === 0) {
    return <p className="text-sm text-gray-500">{t("noKidsMessage")}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/planner"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium"
          >
            {t("backToPlanner")}
          </Link>
          <h1 className="text-lg font-semibold">
            {familyName} — {weekLabel}
          </h1>
        </div>
        <PrintButton />
      </div>

      <div className="mb-6 hidden print:block print:text-center print:text-lg print:font-semibold">
        {familyName} — {weekLabel}
      </div>

      <div className="mb-6 grid gap-4 print:hidden sm:grid-cols-2">
        <fieldset className="rounded-md border border-gray-200 p-3 text-sm">
          <legend className="px-1 font-semibold">{t("daysToInclude")}</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {dayLabels.map((label, index) => (
              <label key={index} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={checkedDays[index]}
                  onChange={(e) =>
                    setCheckedDays((prev) =>
                      prev.map((v, i) => (i === index ? e.target.checked : v))
                    )
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-md border border-gray-200 p-3 text-sm">
          <legend className="px-1 font-semibold">{t("eventsToInclude")}</legend>
          <div className="mt-1 flex max-h-40 flex-col gap-1 overflow-y-auto">
            {instances.length === 0 && (
              <p className="text-gray-500">{t("noRecurringActivities")}</p>
            )}
            {instances.map((instance) => (
              <label key={instance.id} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={checkedInstances[instance.id] ?? false}
                  onChange={(e) =>
                    setCheckedInstances((prev) => ({ ...prev, [instance.id]: e.target.checked }))
                  }
                />
                {instance.title}
                <span className="text-gray-400">
                  (
                  {kids
                    .filter((k) => instance.kidIds.includes(k.id))
                    .map((k) => k.name)
                    .join(" & ")}
                  )
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex text-xs print:text-[9px]">
        <div className="week-grid-height relative w-14 shrink-0">
          {ticks.map((tick) => {
            const { topPct } = positionInRange({ start: tick, end: tick }, range);
            return (
              <div
                key={tick}
                className="absolute right-1 -translate-y-1/2 text-gray-400"
                style={{ top: `${topPct}%` }}
              >
                {minutesToLabel(tick)}
              </div>
            );
          })}
        </div>

        <div className="flex flex-1 gap-2 print:gap-1">
          {visibleDays.map(({ label, index }) => {
            // Only give a kid a column-slot on days they actually have
            // something — an empty slot next to a busy sibling just steals
            // width the busy one badly needs (14 columns is already tight
            // on one landscape page). Falls back to showing everyone if the
            // whole day is empty, so the day still renders visibly.
            const kidsWithContent = kids.filter((kid) => entriesFor(index, kid.id).length > 0);
            const dayKids = kidsWithContent.length > 0 ? kidsWithContent : kids;

            return (
              <div key={index} className="min-w-0 flex-1">
                <div className="mb-1 border-b border-gray-200 pb-1 text-center font-semibold">
                  {label}
                </div>

                <div className="mb-1 flex gap-0.5">
                  {dayKids.map((kid) => (
                    <div
                      key={kid.id}
                      className="min-w-0 flex-1 truncate text-center text-[11px] font-semibold"
                      style={{ color: kid.color }}
                    >
                      {kid.name}
                    </div>
                  ))}
                </div>

                <div className="mb-1 flex min-h-4 gap-0.5">
                  {dayKids.map((kid) => (
                    <div key={kid.id} className="flex min-w-0 flex-1 flex-col gap-0.5">
                      {entriesFor(index, kid.id)
                        .filter((e) => !e.startTime)
                        .map((e) => (
                          <div
                            key={e.id}
                            className="truncate rounded border-l-2 bg-gray-50 px-1 print:bg-white print:break-inside-avoid"
                            style={{ borderLeftColor: e.color }}
                          >
                            {e.title}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>

                <div className="week-grid-height flex gap-0.5">
                  {dayKids.map((kid) => (
                    <div
                      key={kid.id}
                      className="relative min-w-0 flex-1 border-l border-gray-100 first:border-l-0"
                    >
                      {ticks.map((tick) => {
                        const { topPct } = positionInRange({ start: tick, end: tick }, range);
                        return (
                          <div
                            key={tick}
                            className="absolute inset-x-0 border-t border-gray-100"
                            style={{ top: `${topPct}%` }}
                          />
                        );
                      })}
                      {entriesFor(index, kid.id)
                        .filter((e) => e.startTime)
                        .map((entry) => {
                          const start = timeToMinutes(entry.startTime!);
                          const end = timeToMinutes(
                            entry.endTime ?? addMinutes(entry.startTime!, DEFAULT_DURATION_MINUTES)
                          );
                          const { topPct, heightPct } = positionInRange({ start, end }, range);
                          return (
                            <div
                              key={entry.id}
                              className="absolute inset-x-0.5 overflow-hidden rounded border-l-2 bg-gray-50 px-1 py-0.5 leading-tight print:bg-white print:break-inside-avoid print:px-0.5"
                              style={{
                                top: `${topPct}%`,
                                height: `${heightPct}%`,
                                borderLeftColor: entry.color,
                              }}
                            >
                              <p className="font-medium">{entry.title}</p>
                              <p className="text-gray-500">{timeRangeLabel(entry)}</p>
                              {entry.location && (
                                <p className="truncate text-gray-500">{entry.location}</p>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 print:mt-2">
        <label className="mb-1 block text-sm font-semibold print:hidden" htmlFor="print-notes">
          {t("notes")}
        </label>
        <textarea
          id="print-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          className="w-full rounded-md border border-gray-300 p-2 text-sm print:hidden"
        />
        {notes && (
          <div className="hidden whitespace-pre-wrap border-t border-gray-300 pt-1 text-[10px] print:block">
            <p className="font-semibold">{t("notes")}</p>
            <p>{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
