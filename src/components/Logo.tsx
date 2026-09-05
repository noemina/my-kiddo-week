// In-app logo mark, mirroring the exact proportions of src/lib/og-logo.tsx
// (used for the generated favicon/apple-icon/PWA icons) so the brand mark
// looks the same everywhere. Plain inline styles rather than Tailwind
// arbitrary values, to keep the two implementations easy to compare.

const BAR_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
const BAR_HEIGHT_RATIOS = [0.55, 0.88, 1, 0.72, 0.45];

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  const padding = Math.round(size * 0.16);
  const barWidth = Math.max(2, Math.round(size * 0.09));
  const gap = Math.max(1, Math.round(size * 0.045));
  const barMaxHeight = size - padding * 2;
  const radius = Math.round(size * 0.26);

  return (
    <div
      role="img"
      aria-label="My kiddo week"
      className={className}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap,
        padding,
        background: "linear-gradient(135deg, #6366f1, #d946ef)",
        borderRadius: radius,
        flexShrink: 0,
      }}
    >
      {BAR_COLORS.map((color, i) => (
        <span
          key={color}
          style={{
            width: barWidth,
            height: Math.round(barMaxHeight * BAR_HEIGHT_RATIOS[i]),
            borderRadius: 9999,
            background: color,
            display: "block",
          }}
        />
      ))}
    </div>
  );
}
