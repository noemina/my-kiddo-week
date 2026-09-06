"use client";

import { useLocale, useTranslations } from "next-intl";
import { PrintWeekView } from "@/components/PrintWeekView";
import { usePlanStore } from "@/lib/plan-store";
import { getTypicalWeekData } from "@/lib/planner-data";
import { weekdayName } from "@/lib/week";

export default function TypicalWeekPrintPage() {
  const locale = useLocale();
  const t = useTranslations("Print");
  const { plan, hydrated } = usePlanStore();

  const { kids, instances } = getTypicalWeekData(plan);
  const dayLabels = Array.from({ length: 7 }, (_, i) => weekdayName(i, locale));

  // PrintWeekView's checkbox state is initialized once from `instances` at
  // mount — on a direct/hard-refreshed load, localStorage hasn't finished
  // loading yet on the very first render, so mounting it before `hydrated`
  // would permanently lock every event's pre-check state to "off".
  if (!hydrated) return null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 print:max-w-none print:w-full print:px-2 print:py-2">
      <PrintWeekView
        familyName={plan.familyName}
        weekLabel={t("typicalWeek")}
        kids={kids}
        instances={instances}
        dayLabels={dayLabels}
      />
    </main>
  );
}
