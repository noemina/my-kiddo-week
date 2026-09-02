import { redirect } from "next/navigation";
import { WeekGrid } from "@/components/WeekGrid";
import { getActiveMembership } from "@/lib/family";
import { getWeekSchedule } from "@/lib/planner-data";
import { isoDate, startOfWeek } from "@/lib/week";
import { PrintButton } from "@/components/PrintButton";

export default async function PlannerPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const { week } = await searchParams;
  const weekStart = startOfWeek(week ? new Date(week) : new Date());
  const schedule = await getWeekSchedule(membership.familyId, weekStart);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 print:px-0 print:py-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold">
          {membership.family.name} — Week of {isoDate(weekStart)}
        </h1>
        <PrintButton />
      </div>

      <div className="hidden print:block print:mb-4 print:text-center print:text-lg print:font-semibold">
        {membership.family.name} — Week of {isoDate(weekStart)}
      </div>

      <WeekGrid schedule={schedule} interactive={false} />
    </main>
  );
}
