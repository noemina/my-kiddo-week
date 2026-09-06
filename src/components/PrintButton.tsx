"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { PdfWeekData } from "@/lib/pdf-export";

export function PrintButton({ data, fileName }: { data: PdfWeekData; fileName: string }) {
  const t = useTranslations("Print");
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    try {
      const { generateWeekPdf } = await import("@/lib/pdf-export");
      await generateWeekPdf(data, fileName);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900"
    >
      {busy ? t("generatingButton") : t("printButton")}
    </button>
  );
}
