import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppNav } from "@/components/AppNav";
import { getActiveMembership } from "@/lib/family";
import { prisma } from "@/lib/prisma";
import { createKidAction, deleteKidAction } from "@/lib/actions/kid-actions";

const DEFAULT_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

export default async function KidsPage() {
  const membership = await getActiveMembership();
  if (!membership) redirect("/login");

  const [kids, t] = await Promise.all([
    prisma.kid.findMany({
      where: { familyId: membership.familyId },
      orderBy: { createdAt: "asc" },
    }),
    getTranslations("Kids"),
  ]);

  return (
    <>
      <AppNav active="kids" />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-lg font-semibold">{t("title")}</h1>

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
                  {t("remove")}
                </button>
              </form>
            </li>
          ))}
          {kids.length === 0 && <p className="text-sm text-gray-500">{t("empty")}</p>}
        </ul>

        <form
          action={createKidAction}
          className="mt-8 flex flex-col gap-3 rounded-md border border-gray-200 p-4 text-sm"
        >
          <h2 className="font-semibold">{t("addTitle")}</h2>
          <input
            name="name"
            required
            placeholder={t("namePlaceholder")}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">{t("color")}</legend>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color, i) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    defaultChecked={i === kids.length % DEFAULT_COLORS.length}
                    className="peer sr-only"
                  />
                  <span
                    className="block h-8 w-8 rounded-full ring-1 ring-gray-200 ring-offset-2 peer-checked:ring-2 peer-checked:ring-gray-900"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            {t("addButton")}
          </button>
        </form>
      </main>
    </>
  );
}
