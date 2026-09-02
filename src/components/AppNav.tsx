import Link from "next/link";
import { signOut } from "@/lib/auth";
import { getMembershipsForCurrentUser } from "@/lib/family";
import { FamilySwitcher } from "@/components/FamilySwitcher";

export async function AppNav({ active }: { active: "planner" | "kids" }) {
  const memberships = await getMembershipsForCurrentUser();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold">my-kiddo-week</span>
        <nav className="flex gap-4 text-sm font-medium">
          <Link
            href="/planner"
            className={active === "planner" ? "text-indigo-600" : "text-gray-500"}
          >
            Planner
          </Link>
          <Link
            href="/kids"
            className={active === "kids" ? "text-indigo-600" : "text-gray-500"}
          >
            Kids
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {memberships.length > 1 && <FamilySwitcher memberships={memberships} />}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-800">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
