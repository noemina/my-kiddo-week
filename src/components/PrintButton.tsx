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

      // A real A4 page (landscape, since the weekly grid is always wide),
      // with the captured content scaled to fit and centered — rather than
      // sizing the page itself to the canvas's raw pixel dimensions, which
      // produced an arbitrary, non-A4 page size.
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const imgRatio = canvas.width / canvas.height;
      let renderWidth = maxWidth;
      let renderHeight = renderWidth / imgRatio;
      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = renderHeight * imgRatio;
      }
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;
      pdf.addImage(imgData, "JPEG", x, y, renderWidth, renderHeight);
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
