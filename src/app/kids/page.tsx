import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { getActiveMembership } from "@/lib/family";
import { prisma } from "@/lib/prisma";
import { createKidAction, deleteKidAction } from "@/lib/actions/kid-actions";

const DEFAULT_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

export default async function KidsPage() {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const kids = await prisma.kid.findMany({
    where: { familyId: membership.familyId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <AppNav active="kids" />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-lg font-semibold">Kids</h1>

        <ul className="mt-6 flex flex-col gap-2">
          {kids.map((kid) => (
            <li
              key={kid.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: kid.color }}
                  aria-hidden
                />
                <span className="font-medium">{kid.name}</span>
              </div>
              <form action={deleteKidAction}>
                <input type="hidden" name="kidId" value={kid.id} />
                <button type="submit" className="text-sm text-gray-400 hover:text-red-600">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {kids.length === 0 && (
            <p className="text-sm text-gray-500">No kids yet — add your first one below.</p>
          )}
        </ul>

        <form
          action={createKidAction}
          className="mt-8 flex flex-col gap-3 rounded-md border border-gray-200 p-4 text-sm"
        >
          <h2 className="font-semibold">Add a kid</h2>
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <label className="flex flex-col gap-1">
            Color
            <select
              name="color"
              defaultValue={DEFAULT_COLORS[kids.length % DEFAULT_COLORS.length]}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              {DEFAULT_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            Add kid
          </button>
        </form>
      </main>
    </>
  );
}
