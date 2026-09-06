"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePlanStore } from "@/lib/plan-store";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";

export function AppNav({
  active,
}: {
  active: "planner" | "kids" | "meals" | "school";
}) {
  const t = useTranslations("Nav");
  const tStorage = useTranslations("Storage");
  const { exportPlan, importPlan, clearPlan } = usePlanStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await importPlan(file);
    } catch {
      alert(tStorage("importError"));
    }
  }

  function handleClearAll() {
    if (window.confirm(t("clearAllConfirm"))) {
      clearPlan();
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-semibold">{t("appName")}</span>
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <Link
            href="/planner"
            className={active === "planner" ? "text-indigo-600" : "text-gray-500"}
          >
            {t("planner")}
          </Link>
          <Link href="/kids" className={active === "kids" ? "text-indigo-600" : "text-gray-500"}>
            {t("kids")}
          </Link>
          <Link href="/meals" className={active === "meals" ? "text-indigo-600" : "text-gray-500"}>
            {t("meals")}
          </Link>
          <Link href="/school" className={active === "school" ? "text-indigo-600" : "text-gray-500"}>
            {t("school")}
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <button
          type="button"
          onClick={exportPlan}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {t("save")}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {t("load")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          {t("clearAll")}
        </button>
      </div>
    </header>
  );
}
