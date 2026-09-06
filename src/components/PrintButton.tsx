"use client";

import { useState, type RefObject } from "react";
import { useTranslations } from "next-intl";

export function PrintButton({
  targetRef,
  fileName,
}: {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
}) {
  const t = useTranslations("Print");
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    const node = targetRef.current;
    if (!node || busy) return;
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        // Tailwind v4's default palette uses oklch()/lab() colors, which the
        // upstream html2canvas can't parse — the "-pro" fork adds support.
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
      // JPEG at high quality keeps the file a few hundred KB instead of the
      // several MB a lossless PNG of a full-page raster would take.
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
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
