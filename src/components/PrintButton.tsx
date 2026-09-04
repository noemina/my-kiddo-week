"use client";

import { useTranslations } from "next-intl";

export function PrintButton() {
  const t = useTranslations("Print");

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
    >
      {t("printButton")}
    </button>
  );
}
