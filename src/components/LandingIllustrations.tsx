// Small, purely decorative illustrations for the landing page — built from
// plain shapes in the app's own kid-color palette rather than stock art, so
// they stay lightweight and visually consistent with the planner itself.

const COLUMN_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
const COLUMN_CHIPS = [[46, 82], [64], [34, 70, 100], [58], [76, 108]];
const ROW_HEIGHT = 128;

export function CalendarIllustration({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex gap-2" style={{ height: ROW_HEIGHT }}>
        {COLUMN_COLORS.map((color, i) => (
          <div key={color} className="flex flex-1 flex-col justify-end gap-1.5">
            {COLUMN_CHIPS[i].map((h, j) => (
              <div
                key={j}
                className="rounded-md"
                style={{ backgroundColor: color, height: h, opacity: 0.85 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {COLUMN_COLORS.map((color) => (
          <div
            key={color}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: color, opacity: 0.35 }}
          />
        ))}
      </div>
    </div>
  );
}

function DownloadGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function PrintIllustration({ alt }: { alt: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="relative flex w-full max-w-xs items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      style={{ height: ROW_HEIGHT + 40 }}
    >
      <div className="flex w-28 flex-col gap-1.5 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="h-1.5 w-3/4 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="h-1.5 w-full rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="h-1.5 w-2/3 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div
          className="mt-1.5 h-1.5 w-full rounded-full"
          style={{ backgroundColor: "#6366f1", opacity: 0.6 }}
        />
        <div
          className="h-1.5 w-4/5 rounded-full"
          style={{ backgroundColor: "#ec4899", opacity: 0.6 }}
        />
        <div
          className="h-1.5 w-full rounded-full"
          style={{ backgroundColor: "#10b981", opacity: 0.6 }}
        />
      </div>
      <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
        <DownloadGlyph />
      </div>
    </div>
  );
}
