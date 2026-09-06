"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { MealsWeekDay } from "@/lib/meals-data";
import type { Kid, MealEntry } from "@/lib/plan-store";
import { generateMealsPdf, type PdfMealDay, type PdfMealEntry } from "@/lib/meals-pdf-export";

function sanitizeFileNamePart(value: string): string {
  return value.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
}

type Props = {
  familyName: string;
  weekLabel: string;
  days: MealsWeekDay[];
  dayLabels: string[]; // exactly 7, Monday first
  kids: Kid[];
};

export function MealsPrintView({ familyName, weekLabel, days, dayLabels, kids }: Props) {
  const t = useTranslations("Meals");
  const tPrint = useTranslations("Print");
  const [checkedDays, setCheckedDays] = useState<boolean[]>(() => Array(7).fill(true));
  const [checkedKids, setCheckedKids] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(kids.map((k) => [k.id, true]))
  );
  const [busy, setBusy] = useState(false);

  const fileName =
    [sanitizeFileNamePart(familyName || "my-kiddo-week"), sanitizeFileNamePart(weekLabel)]
      .filter(Boolean)
      .join("-") || "my-kiddo-week";

  function visible(meal: MealEntry): boolean {
    if (meal.kidIds.length === 0) return true;
    return meal.kidIds.some((id) => checkedKids[id] ?? true);
  }

  const visibleDays = days
    .map((day, index) => ({ day, index, label: dayLabels[index] }))
    .filter((d) => checkedDays[d.index]);

  function kidNamesFor(meal: MealEntry): string[] {
    return meal.kidIds
      .map((id) => kids.find((k) => k.id === id)?.name)
      .filter((n): n is string => Boolean(n));
  }

  function toPdfEntries(meals: MealEntry[]): PdfMealEntry[] {
    return meals
      .filter(visible)
      .map((m) => ({ title: m.title, color: m.color ?? "#6366f1", kidNames: kidNamesFor(m) }));
  }

  async function handleDownload() {
    if (busy) return;
    setBusy(true);
    try {
      const pdfDays: PdfMealDay[] = visibleDays.map(({ day, label }) => ({
        label,
        lunch: toPdfEntries(day.lunch),
        dinner: toPdfEntries(day.dinner),
      }));
      await generateMealsPdf(
        {
          title: familyName ? `${familyName} — ${weekLabel}` : weekLabel,
          days: pdfDays,
          lunchLabel: t("lunch"),
          dinnerLabel: t("dinner"),
        },
        fileName
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/meals"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
        >
          {t("backToMeals")}
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900"
        >
          {busy ? tPrint("generatingButton") : tPrint("printButton")}
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <fieldset className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
          <legend className="px-1 font-semibold">{tPrint("daysToInclude")}</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {dayLabels.map((label, index) => (
              <label key={index} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={checkedDays[index]}
                  onChange={(e) =>
                    setCheckedDays((prev) => prev.map((v, i) => (i === index ? e.target.checked : v)))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {kids.length > 0 && (
          <fieldset className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800">
            <legend className="px-1 font-semibold">{tPrint("kidsToInclude")}</legend>
            <div className="mt-1 flex flex-wrap gap-3">
              {kids.map((kid) => (
                <label key={kid.id} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={checkedKids[kid.id] ?? true}
                    onChange={(e) =>
                      setCheckedKids((prev) => ({ ...prev, [kid.id]: e.target.checked }))
                    }
                  />
                  <span style={{ color: kid.color }} className="font-medium">
                    {kid.name}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("kidsFilterHint")}</p>
          </fieldset>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 rounded-lg bg-white p-4 text-gray-900 sm:grid-cols-7">
        {visibleDays.map(({ day, index, label }) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="border-b border-gray-200 pb-1 text-center font-semibold">{label}</div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {t("lunch")}
              </p>
              <MealList meals={day.lunch.filter(visible)} kidNamesFor={kidNamesFor} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {t("dinner")}
              </p>
              <MealList meals={day.dinner.filter(visible)} kidNamesFor={kidNamesFor} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealList({
  meals,
  kidNamesFor,
}: {
  meals: MealEntry[];
  kidNamesFor: (meal: MealEntry) => string[];
}) {
  return (
    <ul className="flex flex-col gap-1 text-xs">
      {meals.map((meal) => (
        <li
          key={meal.id}
          className="rounded border-l-2 bg-gray-50 px-1.5 py-1 leading-tight"
          style={{ borderLeftColor: meal.color ?? "#6366f1" }}
        >
          <p className="font-medium">{meal.title}</p>
          {kidNamesFor(meal).length > 0 && (
            <p className="text-gray-500">{kidNamesFor(meal).join(" & ")}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
