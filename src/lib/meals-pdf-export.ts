// Vector PDF for the meals planner — a plain table (day columns x
// lunch/dinner rows), not the time-positioned grid Activities/School use,
// since meals have no start/end time, just a slot. Reuses the small text
// helpers already built for pdf-export.ts rather than duplicating them.

import {
  hexToRgb,
  wrapToBox,
  lineHeightMm,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN,
} from "@/lib/pdf-export";

export type PdfMealEntry = {
  title: string;
  color: string;
  kidNames: string[]; // empty = family-wide
};

export type PdfMealDay = {
  label: string;
  lunch: PdfMealEntry[];
  dinner: PdfMealEntry[];
};

export type PdfMealsData = {
  title: string;
  days: PdfMealDay[];
  lunchLabel: string;
  dinnerLabel: string;
  notes: string;
  notesLabel: string;
};

const LABEL_WIDTH = 18;
const DAY_GAP = 1.5;
const TITLE_HEIGHT = 9;
const DAY_HEADER_HEIGHT = 8;
const ROW_LABEL_FONT = 9;
const ENTRY_TITLE_FONT = 8;
const ENTRY_KIDS_FONT = 6.5;

function drawMealCell(
  pdf: import("jspdf").jsPDF,
  entries: PdfMealEntry[],
  x: number,
  y: number,
  width: number,
  height: number
) {
  let cursorY = y + 1;
  const bottom = y + height;
  const textX = x + 2;
  const textMaxWidth = width - 2.5;

  for (const entry of entries) {
    if (cursorY >= bottom - 2) break;
    const blockTop = cursorY - 2.6;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(ENTRY_TITLE_FONT);
    const titleLines = wrapToBox(pdf, entry.title, textMaxWidth, bottom - cursorY, ENTRY_TITLE_FONT);
    const titleLineHeight = lineHeightMm(ENTRY_TITLE_FONT);
    const showKids =
      entry.kidNames.length > 0 && cursorY + titleLines.length * titleLineHeight < bottom - 1;
    const blockBottom =
      cursorY +
      titleLines.length * titleLineHeight +
      (showKids ? lineHeightMm(ENTRY_KIDS_FONT) : 0);

    // A left-border accent bar spanning this entry's own block height —
    // matches the "border-l-4" style used everywhere else in the app,
    // rather than a bar overlapping the text.
    const [r, g, b] = hexToRgb(entry.color);
    pdf.setFillColor(r, g, b);
    pdf.rect(x, blockTop, 0.7, Math.max(blockBottom - blockTop - 0.6, 2), "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(ENTRY_TITLE_FONT);
    pdf.setTextColor(17, 24, 39);
    for (const line of titleLines) {
      pdf.text(line, textX, cursorY);
      cursorY += titleLineHeight;
    }

    if (showKids) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(ENTRY_KIDS_FONT);
      pdf.setTextColor(107, 114, 128);
      pdf.text(entry.kidNames.join(" & "), textX, cursorY);
      cursorY += lineHeightMm(ENTRY_KIDS_FONT);
    }
    cursorY += 1.8;
  }
}

export async function generateMealsPdf(data: PdfMealsData, fileName: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const contentLeft = MARGIN + LABEL_WIDTH;
  const contentRight = PAGE_WIDTH - MARGIN;
  const daysAreaWidth = contentRight - contentLeft;
  const dayCount = data.days.length || 1;
  const dayWidth = (daysAreaWidth - DAY_GAP * (dayCount - 1)) / dayCount;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(17, 24, 39);
  pdf.text(data.title, PAGE_WIDTH / 2, MARGIN + 6, { align: "center" });

  const headerY = MARGIN + TITLE_HEIGHT;
  let dayX = contentLeft;
  for (const day of data.days) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(17, 24, 39);
    pdf.text(day.label, dayX + dayWidth / 2, headerY + 4, { align: "center" });
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.2);
    pdf.line(dayX, headerY + DAY_HEADER_HEIGHT - 1, dayX + dayWidth, headerY + DAY_HEADER_HEIGHT - 1);
    dayX += dayWidth + DAY_GAP;
  }

  const hasNotes = data.notes.trim().length > 0;
  const notesHeight = hasNotes ? 24 : 0;

  const rowsTop = headerY + DAY_HEADER_HEIGHT;
  const rowsBottom = PAGE_HEIGHT - MARGIN - notesHeight;
  const rowHeight = (rowsBottom - rowsTop) / 2;

  function drawRow(rowY: number, label: string, pick: (d: PdfMealDay) => PdfMealEntry[]) {
    pdf.setFillColor(250, 250, 251);
    pdf.rect(MARGIN, rowY, PAGE_WIDTH - MARGIN * 2, rowHeight - 1, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(ROW_LABEL_FONT);
    pdf.setTextColor(107, 114, 128);
    pdf.text(label, MARGIN + 1, rowY + 5);

    let x = contentLeft;
    for (const day of data.days) {
      drawMealCell(pdf, pick(day), x + 1, rowY + 2, dayWidth - 1, rowHeight - 3);
      if (x > contentLeft) {
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.15);
        pdf.line(x - DAY_GAP / 2, rowY, x - DAY_GAP / 2, rowY + rowHeight - 1);
      }
      x += dayWidth + DAY_GAP;
    }
  }

  drawRow(rowsTop, data.lunchLabel, (d) => d.lunch);
  drawRow(rowsTop + rowHeight, data.dinnerLabel, (d) => d.dinner);

  if (hasNotes) {
    const notesTop = PAGE_HEIGHT - MARGIN - notesHeight + 8;
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, notesTop - 3, PAGE_WIDTH - MARGIN, notesTop - 3);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(17, 24, 39);
    pdf.text(data.notesLabel, MARGIN, notesTop);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(55, 65, 81);
    const lines = pdf.splitTextToSize(data.notes, PAGE_WIDTH - MARGIN * 2);
    pdf.text(lines, MARGIN, notesTop + 4);
  }

  pdf.save(`${fileName}.pdf`);
}
