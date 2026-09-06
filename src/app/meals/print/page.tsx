"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MealsPrintView } from "@/components/MealsPrintView";
import { usePlanStore } from "@/lib/plan-store";
import { getWeekMeals } from "@/lib/meals-data";
import { formatDayHeader, startOfWeek, weekDays, weekdayName } from "@/lib/week";

function MealsPrintPageInner() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Meals");
  const { plan, hydrated } = usePlanStore();

  const week = searchParams.get("week") ?? undefined;
  const weekStart = startOfWeek(week ? new Date(week) : new Date());
  const days = getWeekMeals(plan, weekStart);

  const dayLabels = weekDays(weekStart).map(
    (date, i) => `${weekdayName(i, locale, "short")}, ${formatDayHeader(date, locale)}`
  );

  // Same hydration gate as the activities print pages — mounting before the
  // plan finishes loading from localStorage would lock every kid's
  // pre-check state to "off".
  if (!hydrated) return null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <MealsPrintView
        familyName={plan.familyName}
        weekLabel={t("weekOf", { date: formatDayHeader(weekStart, locale) })}
        days={days}
        dayLabels={dayLabels}
        kids={plan.kids}
      />
    </main>
  );
}

export default function MealsPrintPage() {
  return (
    <Suspense>
      <MealsPrintPageInner />
    </Suspense>
  );
}
