"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AppNav } from "@/components/AppNav";
import { MealsWeekView } from "@/components/MealsWeekView";
import { MealEditModal } from "@/components/MealEditModal";
import { ColorPicker } from "@/components/ColorPicker";
import { usePlanStore, type MealEntry } from "@/lib/plan-store";
import { getWeekMeals } from "@/lib/meals-data";
import { addDays, formatDayHeader, isoDate, startOfWeek } from "@/lib/week";

export default function MealsPage() {
  const t = useTranslations("Meals");
  const tPlanner = useTranslations("Planner");
  const locale = useLocale();
  const { plan, addMeal } = usePlanStore();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MealEntry | null>(null);

  const days = getWeekMeals(plan, weekStart);

  function handleAddMeal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const date = String(data.get("date") ?? "");
    const mealType = String(data.get("mealType") ?? "lunch") === "dinner" ? "dinner" : "lunch";
    const title = String(data.get("title") ?? "").trim();
    const color = String(data.get("color") ?? "").trim() || null;
    const kidIds = data.getAll("kidIds") as string[];

    if (!date || !title) return setError(t("invalidInput"));

    addMeal({ date, mealType, title, color, kidIds });
    setError(null);
    form.reset();
  }

  return (
    <>
      <AppNav active="meals" />
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
          <Link
            href={`/meals/print?week=${isoDate(weekStart)}`}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t("printMeals")}
          </Link>
        </div>

        <div className="mt-6">
          <MealsWeekView
            days={days}
            kids={plan.kids}
            mealLabels={{ lunch: t("lunch"), dinner: t("dinner") }}
            onEntryClick={(meal) => setEditing(meal)}
          />
        </div>

        {editing && <MealEditModal meal={editing} onClose={() => setEditing(null)} />}

        <details className="mt-10 max-w-lg rounded-md border border-gray-200 p-4">
          <summary className="cursor-pointer text-sm font-semibold">{t("addTitle")}</summary>
          <form onSubmit={handleAddMeal} className="mt-4 flex flex-col gap-3 text-sm">
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
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1">{t("mealType")}</legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5">
                  <input type="radio" name="mealType" value="lunch" defaultChecked />
                  {t("lunch")}
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" name="mealType" value="dinner" />
                  {t("dinner")}
                </label>
              </div>
            </fieldset>
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
            {plan.kids.length > 0 && (
              <fieldset className="flex flex-col gap-1">
                <legend className="mb-1">{t("kidsOptional")}</legend>
                <div className="flex flex-wrap gap-3">
                  {plan.kids.map((kid) => (
                    <label key={kid.id} className="flex items-center gap-1.5">
                      <input type="checkbox" name="kidIds" value={kid.id} />
                      {kid.name}
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">{t("kidsOptionalHint")}</p>
              </fieldset>
            )}
            {error && <p className="text-red-600">{error}</p>}
            <button
              type="submit"
              className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
            >
              {t("addButton")}
            </button>
          </form>
        </details>
      </main>
    </>
  );
}
