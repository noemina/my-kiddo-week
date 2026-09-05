import { ImageResponse } from "next/og";

// Dedicated route (not the special `icon` file convention) so we control
// the exact URL referenced from the PWA manifest's icons array. Static:
// this image never changes per-request, so generate it once at build time
// rather than on every request.
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#4f46e5",
          color: "white",
          fontSize: 290,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        K
      </div>
    ),
    { width: 512, height: 512 }
  );
}
