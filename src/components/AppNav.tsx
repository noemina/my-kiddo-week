import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/auth";
import { getMembershipsForCurrentUser } from "@/lib/family";
import { FamilySwitcher } from "@/components/FamilySwitcher";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function AppNav({ active }: { active: "planner" | "kids" }) {
  const [memberships, t] = await Promise.all([
    getMembershipsForCurrentUser(),
    getTranslations("Nav"),
  ]);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold">{t("appName")}</span>
        <nav className="flex gap-4 text-sm font-medium">
          <Link
            href="/planner"
            className={active === "planner" ? "text-indigo-600" : "text-gray-500"}
          >
            {t("planner")}
          </Link>
          <Link
            href="/kids"
            className={active === "kids" ? "text-indigo-600" : "text-gray-500"}
          >
            {t("kids")}
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        {memberships.length > 1 && <FamilySwitcher memberships={memberships} />}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
            {t("signOut")}
          </button>
        </form>
      </div>
    </header>
  );
}
