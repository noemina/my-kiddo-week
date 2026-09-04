import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { PrintWeekView } from "@/components/PrintWeekView";
import { getActiveMembership } from "@/lib/family";
import { getTypicalWeekData } from "@/lib/planner-data";
import { weekdayName } from "@/lib/week";

export default async function TypicalWeekPrintPage() {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const [{ kids, instances }, locale, t] = await Promise.all([
    getTypicalWeekData(membership.familyId),
    getLocale(),
    getTranslations("Print"),
  ]);

  const dayLabels = Array.from({ length: 7 }, (_, i) => weekdayName(i, locale));

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 print:max-w-none print:px-2 print:py-2">
      <PrintWeekView
        familyName={membership.family.name}
        weekLabel={t("typicalWeek")}
        kids={kids}
        instances={instances}
        dayLabels={dayLabels}
      />
    </main>
  );
}
