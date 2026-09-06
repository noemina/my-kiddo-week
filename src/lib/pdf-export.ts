// Builds the printable week as a real vector PDF (actual text objects, not a
// screenshot) so it's selectable/searchable/copyable and stays small. Kept
// framework-free (no DOM/canvas involved) so it can run from plain data.

export type PdfTimedEntry = {
  id: string;
  title: string;
  timeLabel: string | null;
  location: string | null;
  color: string;
  topPct: number;
  heightPct: number;
};

export type PdfAllDayEntry = {
  id: string;
  title: string;
  color: string;
};

export type PdfKidColumn = {
  name: string;
  color: string;
  allDay: PdfAllDayEntry[];
  timed: PdfTimedEntry[];
};

export type PdfDay = {
  label: string;
  kids: PdfKidColumn[];
};

export type PdfTick = {
  label: string;
  topPct: number;
};

export type PdfWeekData = {
  title: string;
  days: PdfDay[];
  ticks: PdfTick[];
  notes: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// jsPDF has no built-in text truncation — shrink one character at a time
// until the string (plus an ellipsis) fits the given width, at whatever font
// is currently set on the document.
function truncateToWidth(pdf: import("jspdf").jsPDF, text: string, maxWidth: number): string {
  if (maxWidth <= 0) return "";
  if (pdf.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1 && pdf.getTextWidth(`${truncated}…`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

const PAGE_WIDTH = 297;
const PAGE_HEIGHT = 210;
const MARGIN = 8;
const AXIS_WIDTH = 11;
const DAY_GAP = 1.5;
const KID_GAP = 0.8;
const TITLE_HEIGHT = 9;
const DAY_HEADER_HEIGHT = 6;
const KID_NAME_HEIGHT = 5;
const ALL_DAY_ROW_HEIGHT = 7;

export async function generateWeekPdf(data: PdfWeekData, fileName: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const contentLeft = MARGIN + AXIS_WIDTH;
  const contentRight = PAGE_WIDTH - MARGIN;
  const daysAreaWidth = contentRight - contentLeft;

  const hasNotes = data.notes.trim().length > 0;
  const notesHeight = hasNotes ? 24 : 0;

  const gridTop = MARGIN + TITLE_HEIGHT + DAY_HEADER_HEIGHT + KID_NAME_HEIGHT + ALL_DAY_ROW_HEIGHT;
  const gridBottom = PAGE_HEIGHT - MARGIN - notesHeight;
  const gridHeight = Math.max(gridBottom - gridTop, 10);

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(17, 24, 39);
  pdf.text(data.title, PAGE_WIDTH / 2, MARGIN + 6, { align: "center" });

  const dayCount = data.days.length || 1;
  const dayWidth = (daysAreaWidth - DAY_GAP * (dayCount - 1)) / dayCount;

  let dayX = contentLeft;
  for (const day of data.days) {
    const kidCount = day.kids.length || 1;
    const kidWidth = (dayWidth - KID_GAP * (kidCount - 1)) / kidCount;

    // Day label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(17, 24, 39);
    pdf.text(day.label, dayX + dayWidth / 2, MARGIN + TITLE_HEIGHT + 4, { align: "center" });
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.2);
    pdf.line(
      dayX,
      MARGIN + TITLE_HEIGHT + DAY_HEADER_HEIGHT - 1,
      dayX + dayWidth,
      MARGIN + TITLE_HEIGHT + DAY_HEADER_HEIGHT - 1
    );

    let kidX = dayX;
    for (const kid of day.kids) {
      // Kid name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      const [kr, kg, kb] = hexToRgb(kid.color);
      pdf.setTextColor(kr, kg, kb);
      const kidNameY = MARGIN + TITLE_HEIGHT + DAY_HEADER_HEIGHT + 3.5;
      const kidLabel = truncateToWidth(pdf, kid.name, kidWidth - 1);
      pdf.text(kidLabel, kidX + kidWidth / 2, kidNameY, { align: "center" });

      // All-day (no start time) entries, stacked
      let allDayY = MARGIN + TITLE_HEIGHT + DAY_HEADER_HEIGHT + KID_NAME_HEIGHT + 2.6;
      const allDayBottom = MARGIN + TITLE_HEIGHT + DAY_HEADER_HEIGHT + KID_NAME_HEIGHT + ALL_DAY_ROW_HEIGHT;
      for (const entry of kid.allDay) {
        if (allDayY > allDayBottom) break;
        const [er, eg, eb] = hexToRgb(entry.color);
        pdf.setFillColor(er, eg, eb);
        pdf.rect(kidX, allDayY - 2.2, 0.7, 2.8, "F");
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.setTextColor(31, 41, 55);
        pdf.text(truncateToWidth(pdf, entry.title, kidWidth - 1.2), kidX + 1, allDayY);
        allDayY += 3.1;
      }

      // Hour gridlines within this kid's own column
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.15);
      for (const tick of data.ticks) {
        const y = gridTop + (tick.topPct / 100) * gridHeight;
        pdf.line(kidX, y, kidX + kidWidth, y);
      }
      if (kidX > dayX) {
        pdf.setDrawColor(243, 244, 246);
        pdf.line(kidX, gridTop, kidX, gridTop + gridHeight);
      }

      // Timed entries
      for (const entry of kid.timed) {
        const y = gridTop + (entry.topPct / 100) * gridHeight;
        const h = (entry.heightPct / 100) * gridHeight;
        const boxWidth = kidWidth - 1;

        pdf.setFillColor(249, 250, 251);
        pdf.rect(kidX + 0.8, y, boxWidth - 0.8, h, "F");
        const [er, eg, eb] = hexToRgb(entry.color);
        pdf.setFillColor(er, eg, eb);
        pdf.rect(kidX + 0.8, y, 0.7, h, "F");

        const textX = kidX + 2;
        const textMaxWidth = boxWidth - 2;
        let lineY = y + 3;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(17, 24, 39);
        pdf.text(truncateToWidth(pdf, entry.title, textMaxWidth), textX, Math.min(lineY, y + h - 0.5));

        if (h > 5.5 && entry.timeLabel) {
          lineY += 3.1;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6.5);
          pdf.setTextColor(107, 114, 128);
          pdf.text(truncateToWidth(pdf, entry.timeLabel, textMaxWidth), textX, lineY);
        }
        if (h > 8.5 && entry.location) {
          lineY += 3;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6.5);
          pdf.setTextColor(107, 114, 128);
          pdf.text(truncateToWidth(pdf, entry.location, textMaxWidth), textX, lineY);
        }
      }

      kidX += kidWidth + KID_GAP;
    }

    dayX += dayWidth + DAY_GAP;
  }

  // Hour-axis labels, on top of the grid drawn above
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(156, 163, 175);
  for (const tick of data.ticks) {
    const y = gridTop + (tick.topPct / 100) * gridHeight;
    pdf.text(tick.label, MARGIN + AXIS_WIDTH - 1.5, y + 1, { align: "right" });
  }

  if (hasNotes) {
    const notesTop = PAGE_HEIGHT - MARGIN - notesHeight + 8;
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, notesTop - 3, PAGE_WIDTH - MARGIN, notesTop - 3);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(17, 24, 39);
    pdf.text("Notes", MARGIN, notesTop);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(55, 65, 81);
    const lines = pdf.splitTextToSize(data.notes, PAGE_WIDTH - MARGIN * 2);
    pdf.text(lines, MARGIN, notesTop + 4);
  }

  pdf.save(`${fileName}.pdf`);
}
