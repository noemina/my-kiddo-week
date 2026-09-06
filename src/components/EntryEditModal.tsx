"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePlanStore } from "@/lib/plan-store";
import type { ScheduleEntry } from "@/lib/planner-data";
import { isoDate } from "@/lib/week";

type Props = {
  entry: ScheduleEntry;
  date: Date;
  onClose: () => void;
};

export function EntryEditModal({ entry, date, onClose }: Props) {
  const t = useTranslations("Edit");
  const tPlanner = useTranslations("Planner");
  const {
    plan,
    updateActivity,
    updateException,
    skipActivityOccurrence,
    removeActivity,
    addException,
    removeException,
  } = usePlanStore();

  const isRecurring = entry.kind === "recurring";
  const source = isRecurring
    ? plan.activities.find((a) => a.id === entry.id)
    : plan.exceptions.find((e) => e.id === entry.id);

  const [title, setTitle] = useState(entry.title);
  const [startTime, setStartTime] = useState(entry.startTime ?? "");
  const [endTime, setEndTime] = useState(entry.endTime ?? "");
  const [location, setLocation] = useState(entry.location ?? "");
  const [category, setCategory] = useState(entry.category ?? "");
  const [kidIds, setKidIds] = useState<string[]>(source?.kidIds ?? []);

  if (!source) return null;

  const dateIso = isoDate(date);

  function commonFields() {
    return {
      title: title.trim() || entry.title,
      endTime: endTime || null,
      location: location.trim() || null,
      category: category.trim() || null,
      kidIds,
    };
  }

  function saveWholeSeries() {
    updateActivity(entry.id, { ...commonFields(), startTime: startTime || entry.startTime || "" });
    onClose();
  }

  function saveThisOccurrenceOnly() {
    skipActivityOccurrence(entry.id, dateIso);
    addException({
      ...commonFields(),
      startTime: startTime || null,
      date: dateIso,
      notes: null,
      color: null,
    });
    onClose();
  }

  function saveException() {
    updateException(entry.id, { ...commonFields(), startTime: startTime || null });
    onClose();
  }

  function deleteWholeSeries() {
    removeActivity(entry.id);
    onClose();
  }

  function deleteThisOccurrenceOnly() {
    skipActivityOccurrence(entry.id, dateIso);
    onClose();
  }

  function deleteException() {
    removeException(entry.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">{t("editTitle")}</h2>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              {tPlanner("startTime")}
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              {tPlanner("endTime")}
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </label>
          </div>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={tPlanner("locationPlaceholder")}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={tPlanner("categoryPlaceholder")}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">{tPlanner("kids")}</legend>
            <div className="flex flex-wrap gap-3">
              {plan.kids.map((kid) => (
                <label key={kid.id} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={kidIds.includes(kid.id)}
                    onChange={(e) =>
                      setKidIds((prev) =>
                        e.target.checked ? [...prev, kid.id] : prev.filter((id) => id !== kid.id)
                      )
                    }
                  />
                  {kid.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {isRecurring ? (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("seriesHint")}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveThisOccurrenceOnly}
                  className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  {t("saveThisOnly")}
                </button>
                <button
                  type="button"
                  onClick={saveWholeSeries}
                  className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                  {t("saveWholeSeries")}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={deleteThisOccurrenceOnly}
                  className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                >
                  {t("deleteThisOnly")}
                </button>
                <button
                  type="button"
                  onClick={deleteWholeSeries}
                  className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                >
                  {t("deleteWholeSeries")}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveException}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={deleteException}
                className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
              >
                {t("delete")}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
