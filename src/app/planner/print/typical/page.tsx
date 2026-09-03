import { redirect } from "next/navigation";
import { PrintWeekView } from "@/components/PrintWeekView";
import { getActiveMembership } from "@/lib/family";
import { getTypicalWeekData } from "@/lib/planner-data";
import { DAY_LABELS } from "@/lib/week";

export default async function TypicalWeekPrintPage() {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const { kids, instances } = await getTypicalWeekData(membership.familyId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 print:px-2 print:py-2">
      <PrintWeekView
        familyName={membership.family.name}
        weekLabel="Typical Week"
        kids={kids}
        instances={instances}
        dayLabels={[...DAY_LABELS]}
      />
    </main>
  );
}
