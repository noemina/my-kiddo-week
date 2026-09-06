// Only renders when NEXT_PUBLIC_APP_ENV=development is set at build time —
// set on the my-kiddo-week-dev Vercel project only, never on production, so
// this banner (and the underlying env check) has zero effect there.
export function DevBanner() {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "development") return null;

  return (
    <div className="bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
      Development build — for testing only, data here may be reset without notice. The stable app
      is at my-kiddo-week.vercel.app.
    </div>
  );
}
