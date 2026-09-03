import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { WeekGrid } from "@/components/WeekGrid";
import { getActiveMembership } from "@/lib/family";
import { getWeekSchedule } from "@/lib/planner-data";
import { addDays, isoDate, startOfWeek } from "@/lib/week";
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

  const [schedule, kids] = await Promise.all([
    getWeekSchedule(membership.familyId, weekStart),
    prisma.kid.findMany({
      where: { familyId: membership.familyId },
      orderBy: { createdAt: "asc" },
    }),
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
              ← Prev
            </Link>
            <h1 className="text-lg font-semibold">Week of {isoDate(weekStart)}</h1>
            <Link
              href={`/planner?week=${nextWeek}`}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            >
              Next →
            </Link>
          </div>
          <div className="flex gap-2">
            <Link
              href="/planner/print/typical"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium"
            >
              Print typical week
            </Link>
            <Link
              href={`/planner/print?week=${isoDate(weekStart)}`}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Print this week
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <WeekGrid schedule={schedule} />
        </div>

        {kids.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <details className="rounded-md border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Add a recurring activity
              </summary>
              <form action={createActivityAction} className="mt-4 flex flex-col gap-3 text-sm">
                <KidCheckboxes kids={kids} />
                <input
                  name="title"
                  required
                  placeholder="Swimming lesson"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <label className="flex flex-col gap-1">
                  Day of week
                  <select
                    name="dayOfWeek"
                    required
                    className="rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="0">Monday</option>
                    <option value="1">Tuesday</option>
                    <option value="2">Wednesday</option>
                    <option value="3">Thursday</option>
                    <option value="4">Friday</option>
                    <option value="5">Saturday</option>
                    <option value="6">Sunday</option>
                  </select>
                </label>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    Start time
                    <input
                      name="startTime"
                      type="time"
                      required
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    End time
                    <input
                      name="endTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <input
                  name="location"
                  placeholder="Location (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <input
                  name="category"
                  placeholder="Category, e.g. gym, school (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional validity period — leave blank for an activity that repeats
                  indefinitely, or set a range for e.g. a school year (Sept–Sept).
                </p>
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1">
                    Valid from
                    <input
                      name="validFrom"
                      type="date"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    Valid to
                    <input
                      name="validTo"
                      type="date"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="includeInTypicalWeek" defaultChecked />
                  Include in the &quot;typical week&quot; print template
                </label>
                <button
                  type="submit"
                  className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
                >
                  Add recurring activity
                </button>
              </form>
            </details>

            <details className="rounded-md border border-gray-200 p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Add a one-off event
              </summary>
              <form action={createExceptionAction} className="mt-4 flex flex-col gap-3 text-sm">
                <KidCheckboxes kids={kids} />
                <input
                  name="title"
                  required
                  placeholder="Birthday party"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <label className="flex flex-col gap-1">
                  Date
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
                    Start time
                    <input
                      name="startTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1">
                    End time
                    <input
                      name="endTime"
                      type="time"
                      className="rounded-md border border-gray-300 px-3 py-2"
                    />
                  </label>
                </div>
                <input
                  name="location"
                  placeholder="Location (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <textarea
                  name="notes"
                  placeholder="Notes (optional)"
                  className="rounded-md border border-gray-300 px-3 py-2"
                />
                <button
                  type="submit"
                  className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
                >
                  Add one-off event
                </button>
              </form>
            </details>
          </div>
        )}
      </main>
    </>
  );
}

function KidCheckboxes({ kids }: { kids: { id: string; name: string }[] }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1">Kids</legend>
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
