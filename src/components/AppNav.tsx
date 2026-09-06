"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";

export function AppNav({
  active,
}: {
  active: "planner" | "kids" | "meals" | "school";
}) {
  const t = useTranslations("Nav");

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-semibold">{t("appName")}</span>
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/kids" className={active === "kids" ? "text-indigo-600" : "text-gray-500"}>
            {t("kids")}
          </Link>
          <Link
            href="/planner"
            className={active === "planner" ? "text-indigo-600" : "text-gray-500"}
          >
            {t("planner")}
          </Link>
          <Link href="/meals" className={active === "meals" ? "text-indigo-600" : "text-gray-500"}>
            {t("meals")}
          </Link>
          <Link href="/school" className={active === "school" ? "text-indigo-600" : "text-gray-500"}>
            {t("school")}
          </Link>
        </nav>
      </div>

      <LocaleSwitcher />
    </header>
  );
}
