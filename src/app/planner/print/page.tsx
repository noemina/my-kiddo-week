import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PrintWeekView } from "@/components/PrintWeekView";
import { getActiveMembership } from "@/lib/family";
import { getDatedPrintData } from "@/lib/planner-data";
import { formatDayHeader, startOfWeek, weekDays, weekdayName } from "@/lib/week";

export default async function PlannerPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const { week } = await searchParams;
  const weekStart = startOfWeek(week ? new Date(week) : new Date());
  const [{ kids, instances }, locale, t] = await Promise.all([
    getDatedPrintData(membership.familyId, weekStart),
    getLocale(),
    getTranslations("Planner"),
  ]);

  const dayLabels = weekDays(weekStart).map(
    (date, i) => `${weekdayName(i, locale, "short")}, ${formatDayHeader(date, locale)}`
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 print:max-w-none print:px-2 print:py-2">
      <PrintWeekView
        familyName={membership.family.name}
        weekLabel={t("weekOf", { date: formatDayHeader(weekStart, locale) })}
        kids={kids}
        instances={instances}
        dayLabels={dayLabels}
      />
    </main>
  );
}
