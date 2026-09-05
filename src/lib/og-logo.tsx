// Shared logo mark generator for the next/og-rendered icon routes
// (favicon, apple touch icon, PWA manifest icons). Kept as a plain
// pixel-size-in function so every generated size stays visually
// proportional, and so this exact look can be mirrored (see
// src/components/Logo.tsx) for the in-app logo without drifting.

const BAR_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
const BAR_HEIGHT_RATIOS = [0.55, 0.88, 1, 0.72, 0.45];

export function ogLogoMark(px: number) {
  const padding = Math.round(px * 0.16);
  const barWidth = Math.max(2, Math.round(px * 0.09));
  const gap = Math.max(1, Math.round(px * 0.045));
  const barMaxHeight = px - padding * 2;
  const radius = Math.round(px * 0.26);

  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap,
        padding,
        background: "linear-gradient(135deg, #6366f1, #d946ef)",
        borderRadius: radius,
      }}
    >
      {BAR_COLORS.map((color, i) => (
        <div
          key={color}
          style={{
            width: barWidth,
            height: Math.round(barMaxHeight * BAR_HEIGHT_RATIOS[i]),
            borderRadius: 9999,
            background: color,
          }}
        />
      ))}
    </div>
  );
}
