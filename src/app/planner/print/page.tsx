"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { PrintWeekView } from "@/components/PrintWeekView";
import { usePlanStore } from "@/lib/plan-store";
import { getDatedPrintData } from "@/lib/planner-data";
import { formatDayHeader, startOfWeek, weekDays, weekdayName } from "@/lib/week";

function PlannerPrintPageInner() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Planner");
  const { plan } = usePlanStore();

  const week = searchParams.get("week") ?? undefined;
  const weekStart = startOfWeek(week ? new Date(week) : new Date());
  const { kids, instances } = getDatedPrintData(plan, weekStart);

  const dayLabels = weekDays(weekStart).map(
    (date, i) => `${weekdayName(i, locale, "short")}, ${formatDayHeader(date, locale)}`
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 print:max-w-none print:w-full print:px-2 print:py-2">
      <PrintWeekView
        familyName={plan.familyName}
        weekLabel={t("weekOf", { date: formatDayHeader(weekStart, locale) })}
        kids={kids}
        instances={instances}
        dayLabels={dayLabels}
      />
    </main>
  );
}

export default function PlannerPrintPage() {
  return (
    <Suspense>
      <PlannerPrintPageInner />
    </Suspense>
  );
}
