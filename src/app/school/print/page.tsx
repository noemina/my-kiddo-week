"use client";

import { useLocale, useTranslations } from "next-intl";
import { PrintWeekView } from "@/components/PrintWeekView";
import { usePlanStore } from "@/lib/plan-store";
import { getSchoolPrintData } from "@/lib/school-data";
import { weekdayName } from "@/lib/week";

export default function SchoolPrintPage() {
  const locale = useLocale();
  const t = useTranslations("School");
  const { plan, hydrated } = usePlanStore();

  const { kids, instances } = getSchoolPrintData(plan);
  const dayLabels = Array.from({ length: 7 }, (_, i) => weekdayName(i, locale));

  // Same hydration gate as the activities print pages — mounting before the
  // plan finishes loading from localStorage would lock every subject's
  // pre-check state to "off" (see planner/print's own comment for why).
  if (!hydrated) return null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 print:max-w-none print:w-full print:px-2 print:py-2">
      <PrintWeekView
        familyName={plan.familyName}
        weekLabel={t("timetable")}
        kids={kids}
        instances={instances}
        dayLabels={dayLabels}
        notesScope="school"
      />
    </main>
  );
}
