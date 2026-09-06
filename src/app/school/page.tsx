"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AppNav } from "@/components/AppNav";
import { SchoolWeekGrid } from "@/components/SchoolWeekGrid";
import { SubjectEditModal } from "@/components/SubjectEditModal";
import { ColorPicker } from "@/components/ColorPicker";
import { usePlanStore, type PlanData } from "@/lib/plan-store";
import { getSchoolWeekSchedule } from "@/lib/school-data";
import type { SchoolScheduleEntry } from "@/lib/school-data";
import { weekdayName } from "@/lib/week";

export default function SchoolPage() {
  const t = useTranslations("School");
  const tPlanner = useTranslations("Planner");
  const locale = useLocale();
  const { plan, addSchoolSubject } = usePlanStore();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SchoolScheduleEntry | null>(null);

  const schedule = getSchoolWeekSchedule(plan);

  function handleAddSubject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const kidIds = data.getAll("kidIds") as string[];
    const daysOfWeek = data.getAll("daysOfWeek").map(Number);
    const title = String(data.get("title") ?? "").trim();
    const startTime = String(data.get("startTime") ?? "");
    const endTime = String(data.get("endTime") ?? "").trim() || null;
    const color = String(data.get("color") ?? "").trim() || null;

    if (kidIds.length === 0) return setError(t("kidRequired"));
    if (daysOfWeek.length === 0) return setError(t("dayRequired"));
    if (!title || !startTime) return setError(t("invalidInput"));

    addSchoolSubject({ title, color, kidIds, daysOfWeek, startTime, endTime });
    setError(null);
    form.reset();
  }

  return (
    <>
      <AppNav active="school" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">{t("title")}</h1>
          <Link
            href="/school/print"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("printTimetable")}
          </Link>
        </div>
        <p className="mt-1 text-xs text-gray-500">{t("hint")}</p>

        <div className="mt-6">
          <SchoolWeekGrid
            schedule={schedule}
            noKidsMessage={t("noKidsMessage")}
            onEntryClick={(entry) => setEditing(entry)}
          />
        </div>

        {editing && <SubjectEditModal subject={findSubject(plan, editing.id)} onClose={() => setEditing(null)} />}

        {plan.kids.length > 0 && (
          <details className="mt-10 max-w-lg rounded-md border border-gray-200 p-4">
            <summary className="cursor-pointer text-sm font-semibold">{t("addTitle")}</summary>
            <form onSubmit={handleAddSubject} className="mt-4 flex flex-col gap-3 text-sm">
              <input
                name="title"
                required
                placeholder={t("titlePlaceholder")}
                className="rounded-md border border-gray-300 px-3 py-2"
              />
              <fieldset className="flex flex-col gap-1">
                <legend className="mb-1">{tPlanner("color")}</legend>
                <ColorPicker name="color" defaultValue="" autoTitle={tPlanner("colorAuto")} />
              </fieldset>
              <CheckboxGroup
                label={tPlanner("kids")}
                name="kidIds"
                options={plan.kids.map((kid) => ({ value: kid.id, label: kid.name }))}
              />
              <CheckboxGroup
                label={tPlanner("dayOfWeek")}
                name="daysOfWeek"
                options={Array.from({ length: 7 }, (_, i) => ({
                  value: String(i),
                  label: weekdayName(i, locale),
                }))}
              />
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1">
                  {tPlanner("startTime")}
                  <input
                    name="startTime"
                    type="time"
                    required
                    className="rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  {tPlanner("endTime")}
                  <input
                    name="endTime"
                    type="time"
                    className="rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
              </div>
              {error && <p className="text-red-600">{error}</p>}
              <button
                type="submit"
                className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
              >
                {t("addButton")}
              </button>
            </form>
          </details>
        )}
      </main>
    </>
  );
}

function findSubject(plan: PlanData, id: string) {
  const subject = plan.schoolSubjects.find((s) => s.id === id);
  if (!subject) throw new Error("subject not found");
  return subject;
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
