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
import type { PdfWeekData } from "@/lib/pdf-export";
import { PrintButton } from "@/components/PrintButton";

const DEFAULT_DURATION_MINUTES = 45;

function timeRangeLabel(entry: { startTime: string | null; endTime: string | null }): string | null {
  if (!entry.startTime) return null;
  return entry.endTime ? `${entry.startTime}–${entry.endTime}` : entry.startTime;
}

function sanitizeFileNamePart(value: string): string {
  return value.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
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

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function PrintWeekView({ familyName, weekLabel, kids, instances, dayLabels }: Props) {
  const t = useTranslations("Print");
  const tPlanner = useTranslations("Planner");
  const [notes, setNotes] = useState("");
  const [checkedDays, setCheckedDays] = useState<boolean[]>(() => Array(7).fill(true));
  // Keyed by seriesId (not instance id) so every day-of-week occurrence of
  // the same recurring activity shares one checkbox — an exception (whether
  // standalone or split off a series via "edit this occurrence only") has no
  // series to share, so it keys on its own id and stays independent.
  const [checkedInstances, setCheckedInstances] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(instances.map((i) => [i.seriesId, i.defaultChecked]))
  );
  const [checkedKids, setCheckedKids] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(kids.map((k) => [k.id, true]))
  );
  // A sensible auto-computed starting window (tight around the initially
  // visible events), which the user can then widen or narrow by hand — the
  // window no longer readjusts itself afterward as events are checked or
  // unchecked, since the whole point is letting the user pin it down.
  const [timeWindow, setTimeWindow] = useState(() => {
    const defaultTimed = instances.filter((i) => i.defaultChecked && i.startTime);
    return computeTimeRange(
      defaultTimed.map((i) => ({
        start: timeToMinutes(i.startTime!),
        end: timeToMinutes(i.endTime ?? addMinutes(i.startTime!, DEFAULT_DURATION_MINUTES)),
      }))
    );
  });

  const fileName =
    [sanitizeFileNamePart(familyName || "my-kiddo-week"), sanitizeFileNamePart(weekLabel)]
      .filter(Boolean)
      .join("-") || "my-kiddo-week";

  const visibleDays = dayLabels
    .map((label, index) => ({ label, index }))
    .filter((d) => checkedDays[d.index]);

  const activeInstances = instances.filter((i) => checkedInstances[i.seriesId] ?? false);

  // One row per series for the picker — every day-of-week occurrence of the
  // same recurring activity collapses to a single checkbox.
  const seriesOptions = Array.from(new Map(instances.map((i) => [i.seriesId, i])).values());

  // Toggling a kid recomputes every series' checked state as "does it apply
  // to at least one still-checked kid" — a shared event (e.g. both kids)
  // stays on as long as either kid is still checked, it doesn't require both.
  function handleKidToggle(kidId: string, isChecked: boolean) {
    const nextCheckedKids = { ...checkedKids, [kidId]: isChecked };
    setCheckedKids(nextCheckedKids);
    setCheckedInstances((prev) => {
      const next = { ...prev };
      for (const instance of seriesOptions) {
        next[instance.seriesId] = instance.kidIds.some((id) => nextCheckedKids[id] ?? true);
      }
      return next;
    });
  }
  const range = timeWindow;
  const ticks = hourTicks(range);

  function handleTimeWindowChange(edge: "start" | "end", value: string) {
    if (!value) return;
    const minutes = timeToMinutes(value);
    setTimeWindow((prev) => {
      if (edge === "start") {
        return minutes < prev.endMinutes ? { ...prev, startMinutes: minutes } : prev;
      }
      return minutes > prev.startMinutes ? { ...prev, endMinutes: minutes } : prev;
    });
  }

  function entriesFor(dayIndex: number, kidId: string) {
    return activeInstances.filter((i) => i.dayIndex === dayIndex && i.kidIds.includes(kidId));
  }

  // Computed once and reused for both the on-screen grid and the PDF data
  // below — avoids recomputing (and risking drift between) the "which kids
  // get a column this day" logic in four separate places.
  const dayViews = visibleDays.map(({ label, index }) => {
    const kidsWithContent = kids.filter((kid) => entriesFor(index, kid.id).length > 0);
    // Only give a kid a column-slot on days they actually have something —
    // an empty slot next to a busy sibling just steals width the busy one
    // badly needs. Falls back to showing everyone if the whole day is
    // empty, so the day still renders visibly.
    const dayKids = kidsWithContent.length > 0 ? kidsWithContent : kids;
    return {
      label,
      index,
      dayKids: dayKids.map((kid) => {
        const entries = entriesFor(index, kid.id);
        return {
          kid,
          allDay: entries.filter((e) => !e.startTime),
          timed: entries.filter((e) => e.startTime),
        };
      }),
    };
  });

  if (kids.length === 0) {
    return <p className="text-sm text-gray-500">{t("noKidsMessage")}</p>;
  }

  const pdfData: PdfWeekData = {
    title: familyName ? `${familyName} — ${weekLabel}` : weekLabel,
    ticks: ticks.map((tick) => ({
      label: minutesToLabel(tick),
      topPct: positionInRange({ start: tick, end: tick }, range).topPct,
    })),
    days: dayViews.map(({ label, dayKids }) => ({
      label,
      kids: dayKids.map(({ kid, allDay, timed }) => ({
        name: kid.name,
        color: kid.color,
        allDay: allDay.map((e) => ({ id: e.id, title: e.title, color: e.color })),
        timed: timed.map((entry) => {
          const start = timeToMinutes(entry.startTime!);
          const end = timeToMinutes(
            entry.endTime ?? addMinutes(entry.startTime!, DEFAULT_DURATION_MINUTES)
          );
          const { topPct, heightPct } = positionInRange({ start, end }, range);
          return {
            id: entry.id,
            title: entry.title,
            timeLabel: timeRangeLabel(entry),
            location: entry.location,
            color: entry.color,
            topPct,
            heightPct,
          };
        }),
      })),
    })),
    notes,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/planner"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
        >
          {t("backToPlanner")}
        </Link>
        <PrintButton data={pdfData} fileName={fileName} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <fieldset className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
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

        <fieldset className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
          <legend className="px-1 font-semibold">{t("kidsToInclude")}</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {kids.map((kid) => (
              <label key={kid.id} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={checkedKids[kid.id] ?? true}
                  onChange={(e) => handleKidToggle(kid.id, e.target.checked)}
                />
                <span style={{ color: kid.color }} className="font-medium">
                  {kid.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
          <legend className="px-1 font-semibold">{t("timeWindow")}</legend>
          <div className="mt-1 flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              {tPlanner("startTime")}
              <input
                type="time"
                value={minutesToHHMM(timeWindow.startMinutes)}
                onChange={(e) => handleTimeWindowChange("start", e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              {tPlanner("endTime")}
              <input
                type="time"
                value={minutesToHHMM(timeWindow.endMinutes)}
                onChange={(e) => handleTimeWindowChange("end", e.target.value)}
                className="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
          <legend className="px-1 font-semibold">{t("eventsToInclude")}</legend>
          <div className="mt-1 flex max-h-40 flex-col gap-1 overflow-y-auto">
            {instances.length === 0 && (
              <p className="text-gray-500">{t("noRecurringActivities")}</p>
            )}
            {seriesOptions.map((instance) => (
              <label key={instance.seriesId} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={checkedInstances[instance.seriesId] ?? false}
                  onChange={(e) =>
                    setCheckedInstances((prev) => ({
                      ...prev,
                      [instance.seriesId]: e.target.checked,
                    }))
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

      {/* On-screen preview of the calendar — the actual downloaded PDF is
          drawn separately as vector text/shapes (src/lib/pdf-export.ts) so
          its text stays selectable, rather than being a screenshot of this
          markup. Keep the two in sync by hand if this layout changes. */}
      <div className="rounded-lg bg-white p-4 text-gray-900">
        <div className="mb-4 text-center text-lg font-semibold">{pdfData.title}</div>

        {/* Each of these rows is its own flex container with a spacer
            matching the hour-axis width, so the axis and the timed grid
            below — which live in the LAST row, as direct siblings with
            nothing stacked above either of them — start at the exact same Y
            position. Splitting the day header/kid-names/all-day rows out
            like this (rather than nesting them above each day's own timed
            grid) is what keeps the hour labels aligned with where events
            actually render, instead of drifting apart by whatever height
            these header rows happen to take up. */}
        <div className="flex text-sm">
          <div className="w-16 shrink-0" />
          <div className="flex flex-1 gap-2">
            {dayViews.map(({ label, index }) => (
              <div
                key={index}
                className="min-w-0 flex-1 border-b border-gray-200 pb-1 text-center font-semibold"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-1 flex text-sm">
          <div className="w-16 shrink-0" />
          <div className="flex flex-1 gap-2">
            {dayViews.map(({ index, dayKids }) => (
              <div key={index} className="flex min-w-0 flex-1 gap-0.5">
                {dayKids.map(({ kid }) => (
                  <div
                    key={kid.id}
                    className="min-w-0 flex-1 truncate text-center text-xs font-semibold"
                    style={{ color: kid.color }}
                  >
                    {kid.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-1 flex min-h-5 text-sm">
          <div className="w-16 shrink-0" />
          <div className="flex flex-1 gap-2">
            {dayViews.map(({ index, dayKids }) => (
              <div key={index} className="flex min-w-0 flex-1 gap-0.5">
                {dayKids.map(({ kid, allDay }) => (
                  <div key={kid.id} className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {allDay.map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded border-l-2 bg-gray-50 px-1"
                        style={{ borderLeftColor: e.color }}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-1 flex text-sm">
          <div className="week-grid-height relative w-16 shrink-0">
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

          <div className="flex flex-1 gap-2">
            {dayViews.map(({ index, dayKids }) => (
              <div key={index} className="week-grid-height flex min-w-0 flex-1 gap-0.5">
                {dayKids.map(({ kid, timed }) => (
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
                    {timed.map((entry) => {
                      const start = timeToMinutes(entry.startTime!);
                      const end = timeToMinutes(
                        entry.endTime ?? addMinutes(entry.startTime!, DEFAULT_DURATION_MINUTES)
                      );
                      const { topPct, heightPct } = positionInRange({ start, end }, range);
                      return (
                        <div
                          key={entry.id}
                          className="absolute inset-x-0.5 overflow-hidden rounded border-l-2 bg-gray-50 px-1.5 py-1 leading-tight"
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
            ))}
          </div>
        </div>

        {notes && (
          <div className="mt-4 whitespace-pre-wrap border-t border-gray-300 pt-2 text-xs">
            <p className="font-semibold">{t("notes")}</p>
            <p>{notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-semibold" htmlFor="print-notes">
          {t("notes")}
        </label>
        <textarea
          id="print-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
    </div>
  );
}
