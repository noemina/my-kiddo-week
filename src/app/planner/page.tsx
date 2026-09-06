"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AppNav } from "@/components/AppNav";
import { WeekGrid } from "@/components/WeekGrid";
import { EntryEditModal } from "@/components/EntryEditModal";
import { ColorPicker } from "@/components/ColorPicker";
import { DataControls } from "@/components/DataControls";
import { usePlanStore, newId } from "@/lib/plan-store";
import { getWeekSchedule, type ScheduleEntry } from "@/lib/planner-data";
import { addDays, formatDayHeader, isoDate, startOfWeek, weekdayName } from "@/lib/week";

export default function PlannerPage() {
  const t = useTranslations("Planner");
  const tErr = useTranslations("PlannerErrors");
  const locale = useLocale();
  const {
    plan,
    addActivity,
    addException,
    exportPlannerData,
    importPlannerData,
    clearPlannerData,
  } = usePlanStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [activityError, setActivityError] = useState<string | null>(null);
  const [exceptionError, setExceptionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ entry: ScheduleEntry; date: Date } | null>(null);

  const schedule = getWeekSchedule(plan, weekStart);

  function handleCreateActivity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const kidIds = data.getAll("kidIds") as string[];
    const daysOfWeek = data.getAll("daysOfWeek").map(Number);
    const title = String(data.get("title") ?? "").trim();
    const startTime = String(data.get("startTime") ?? "");
    const endTime = String(data.get("endTime") ?? "").trim() || null;
    const location = String(data.get("location") ?? "").trim() || null;
    const category = String(data.get("category") ?? "").trim() || null;
    const color = String(data.get("color") ?? "").trim() || null;
    const validFrom = String(data.get("validFrom") ?? "").trim() || null;
    const validTo = String(data.get("validTo") ?? "").trim() || null;
    const includeInTypicalWeek = data.get("includeInTypicalWeek") === "on";

    if (kidIds.length === 0) return setActivityError(tErr("kidRequired"));
    if (daysOfWeek.length === 0) return setActivityError(tErr("dayRequired"));
    if (!title || !startTime) return setActivityError(tErr("invalidInput"));
    if (validFrom && validTo && validFrom > validTo) return setActivityError(tErr("validityRange"));

    // One row per selected day, but sharing a seriesId so an "edit/delete
    // whole series" later can find and update every one of them together.
    const seriesId = newId();
    for (const dayOfWeek of daysOfWeek) {
      addActivity({
        seriesId,
        title,
        dayOfWeek,
        startTime,
        endTime,
        location,
        category,
        color,
        validFrom,
        validTo,
        includeInTypicalWeek,
        kidIds,
      });
    }
    setActivityError(null);
    form.reset();
  }

  function handleCreateException(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const kidIds = data.getAll("kidIds") as string[];
    const title = String(data.get("title") ?? "").trim();
    const date = String(data.get("date") ?? "");
    const startTime = String(data.get("startTime") ?? "").trim() || null;
    const endTime = String(data.get("endTime") ?? "").trim() || null;
    const location = String(data.get("location") ?? "").trim() || null;
    const notes = String(data.get("notes") ?? "").trim() || null;
    const color = String(data.get("color") ?? "").trim() || null;

    if (kidIds.length === 0) return setExceptionError(tErr("kidRequired"));
    if (!title || !date) return setExceptionError(tErr("invalidInput"));

    addException({
      title,
      date,
      startTime,
      endTime,
      location,
      notes,
      category: null,
      color,
      kidIds,
    });
    setExceptionError(null);
    form.reset();
  }

  return (
    <>
      <AppNav active="planner" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              {t("prev")}
            </button>
            <h1 className="text-lg font-semibold">
              {t("weekOf", { date: formatDayHeader(weekStart, locale) })}
            </h1>
            <button
              type="button"
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              {t("next")}
            </button>
          </div>
          <div className="flex gap-2">
            <Link
              href="/planner/print/typical"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              {t("printTypicalWeek")}
            </Link>
            <Link
              href={`/planner/print?week=${isoDate(weekStart)}`}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t("printThisWeek")}
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <DataControls
            onSave={exportPlannerData}
            onLoad={importPlannerData}
            onClear={clearPlannerData}
            saveLabel={t("saveData")}
            loadLabel={t("loadData")}
            clearLabel={t("clearAllData")}
            clearConfirmMessage={t("clearAllConfirm")}
            importErrorMessage={t("importError")}
          />
        </div>

        <div className="mt-6">
          <WeekGrid
            schedule={schedule}
            noKidsMessage={t("noKidsMessage")}
            onEntryClick={(entry, date) => setEditing({ entry, date })}
          />
        </div>

        {editing && (
          <EntryEditModal
            entry={editing.entry}
            date={editing.date}
            onClose={() => setEditing(null)}
          />
        )}

        {plan.kids.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <details className="rounded-md border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                {t("addRecurringTitle")}
              </summary>
              <form onSubmit={handleCreateActivity} className="mt-4 flex flex-col gap-3 text-sm">
                <CheckboxGroup
                  label={t("kids")}
                  name="kidIds"
                  options={plan.kids.map((kid) => ({ value: kid.id, label: kid.name }))}
                />
                <input
                  name="title"
                  required
                  placeholder={t("titlePlaceholderActivity")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <CheckboxGroup
                  label={t("dayOfWeek")}
                  name="daysOfWeek"
                  options={Array.from({ length: 7 }, (_, i) => ({
                    value: String(i),
                    label: weekdayName(i, locale),
                  }))}
                />
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    {t("startTime")}
                    <input
                      name="startTime"
                      type="time"
                      required
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    {t("endTime")}
                    <input
                      name="endTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <input
                  name="location"
                  placeholder={t("locationPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  name="category"
                  placeholder={t("categoryPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <fieldset className="flex flex-col gap-1">
                  <legend className="mb-1">{t("color")}</legend>
                  <ColorPicker name="color" defaultValue="" autoTitle={t("colorAuto")} />
                </fieldset>
                <p className="mt-1 text-xs text-gray-500">{t("validityHint")}</p>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    {t("validFrom")}
                    <input
                      name="validFrom"
                      type="date"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    {t("validTo")}
                    <input
                      name="validTo"
                      type="date"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="includeInTypicalWeek" defaultChecked />
                  {t("includeInTypicalWeek")}
                </label>
                {activityError && <p className="text-red-600">{activityError}</p>}
                <button
                  type="submit"
                  className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
                >
                  {t("submitActivity")}
                </button>
              </form>
            </details>

            <details className="rounded-md border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                {t("addOneOffTitle")}
              </summary>
              <form onSubmit={handleCreateException} className="mt-4 flex flex-col gap-3 text-sm">
                <CheckboxGroup
                  label={t("kids")}
                  name="kidIds"
                  options={plan.kids.map((kid) => ({ value: kid.id, label: kid.name }))}
                />
                <input
                  name="title"
                  required
                  placeholder={t("titlePlaceholderException")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <label className="flex flex-col gap-1">
                  {t("date")}
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={isoDate(weekStart)}
                    className="rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    {t("startTime")}
                    <input
                      name="startTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    {t("endTime")}
                    <input
                      name="endTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <input
                  name="location"
                  placeholder={t("locationPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <fieldset className="flex flex-col gap-1">
                  <legend className="mb-1">{t("color")}</legend>
                  <ColorPicker name="color" defaultValue="" autoTitle={t("colorAuto")} />
                </fieldset>
                <textarea
                  name="notes"
                  placeholder={t("notesPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                {exceptionError && <p className="text-red-600">{exceptionError}</p>}
                <button
                  type="submit"
                  className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
                >
                  {t("submitException")}
                </button>
              </form>
            </details>
          </div>
        )}
      </main>
    </>
  );
}

function CheckboxGroup({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-1.5">
            <input type="checkbox" name={name} value={option.value} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
