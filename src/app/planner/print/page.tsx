import { redirect } from "next/navigation";
import { PrintWeekView } from "@/components/PrintWeekView";
import { getActiveMembership } from "@/lib/family";
import { getDatedPrintData } from "@/lib/planner-data";
import { formatDayHeader, startOfWeek, weekDays } from "@/lib/week";

export default async function PlannerPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const { week } = await searchParams;
  const weekStart = startOfWeek(week ? new Date(week) : new Date());
  const { kids, instances } = await getDatedPrintData(membership.familyId, weekStart);

  const dayLabels = weekDays(weekStart).map(
    (date, i) => `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}, ${formatDayHeader(date)}`
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 print:px-2 print:py-2">
      <PrintWeekView
        familyName={membership.family.name}
        weekLabel={`Week of ${formatDayHeader(weekStart)}`}
        kids={kids}
        instances={instances}
        dayLabels={dayLabels}
      />
    </main>
  );
}
