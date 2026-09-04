import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AppNav } from "@/components/AppNav";
import { WeekGrid } from "@/components/WeekGrid";
import { getActiveMembership } from "@/lib/family";
import { getWeekSchedule } from "@/lib/planner-data";
import { addDays, formatDayHeader, isoDate, startOfWeek, weekdayName } from "@/lib/week";
import { prisma } from "@/lib/prisma";
import { createActivityAction } from "@/lib/actions/activity-actions";
import { createExceptionAction } from "@/lib/actions/exception-actions";

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const { week } = await searchParams;
  const weekStart = startOfWeek(week ? new Date(week) : new Date());
  const prevWeek = isoDate(addDays(weekStart, -7));
  const nextWeek = isoDate(addDays(weekStart, 7));

  const [schedule, kids, locale, t] = await Promise.all([
    getWeekSchedule(membership.familyId, weekStart),
    prisma.kid.findMany({
      where: { familyId: membership.familyId },
      orderBy: { createdAt: "asc" },
    }),
    getLocale(),
    getTranslations("Planner"),
  ]);

  return (
    <>
      <AppNav active="planner" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/planner?week=${prevWeek}`}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              {t("prev")}
            </Link>
            <h1 className="text-lg font-semibold">
              {t("weekOf", { date: formatDayHeader(weekStart, locale) })}
            </h1>
            <Link
              href={`/planner?week=${nextWeek}`}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              {t("next")}
            </Link>
          </div>
          <div className="flex gap-2">
            <Link
              href="/planner/print/typical"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              {t("printTypicalWeek")}
            </Link>
            <Link
              href={`/planner/print?week=${isoDate(weekStart)}`}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t("printThisWeek")}
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <WeekGrid schedule={schedule} noKidsMessage={t("noKidsMessage")} />
        </div>

        {kids.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <details className="rounded-md border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                {t("addRecurringTitle")}
              </summary>
              <form action={createActivityAction} className="mt-4 flex flex-col gap-3 text-sm">
                <KidCheckboxes kids={kids} label={t("kids")} />
                <input
                  name="title"
                  required
                  placeholder={t("titlePlaceholderActivity")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <label className="flex flex-col gap-1">
                  {t("dayOfWeek")}
                  <select
                    name="dayOfWeek"
                    required
                    className="rounded-md border border-gray-300 px-3 py-2"
                  >
                    {Array.from({ length: 7 }, (_, i) => (
                      <option key={i} value={i}>
                        {weekdayName(i, locale)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    {t("startTime")}
                    <input
                      name="startTime"
                      type="time"
                      required
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    {t("endTime")}
                    <input
                      name="endTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <input
                  name="location"
                  placeholder={t("locationPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  name="category"
                  placeholder={t("categoryPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">{t("validityHint")}</p>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    {t("validFrom")}
                    <input
                      name="validFrom"
                      type="date"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    {t("validTo")}
                    <input
                      name="validTo"
                      type="date"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="includeInTypicalWeek" defaultChecked />
                  {t("includeInTypicalWeek")}
                </label>
                <button
                  type="submit"
                  className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
                >
                  {t("submitActivity")}
                </button>
              </form>
            </details>

            <details className="rounded-md border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                {t("addOneOffTitle")}
              </summary>
              <form action={createExceptionAction} className="mt-4 flex flex-col gap-3 text-sm">
                <KidCheckboxes kids={kids} label={t("kids")} />
                <input
                  name="title"
                  required
                  placeholder={t("titlePlaceholderException")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <label className="flex flex-col gap-1">
                  {t("date")}
                  <input
                    name="date"
                    type="date"
                    required
                    defaultValue={isoDate(weekStart)}
                    className="rounded-md border border-gray-300 px-3 py-2"
                  />
                </label>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    {t("startTime")}
                    <input
                      name="startTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    {t("endTime")}
                    <input
                      name="endTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <input
                  name="location"
                  placeholder={t("locationPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <textarea
                  name="notes"
                  placeholder={t("notesPlaceholder")}
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
                >
                  {t("submitException")}
                </button>
              </form>
            </details>
          </div>
        )}
      </main>
    </>
  );
}

function KidCheckboxes({ kids, label }: { kids: { id: string; name: string }[]; label: string }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {kids.map((kid) => (
          <label key={kid.id} className="flex items-center gap-1.5">
            <input type="checkbox" name="kidIds" value={kid.id} />
            {kid.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
