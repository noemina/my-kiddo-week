import { ImageResponse } from "next/og";
import { ogLogoMark } from "@/lib/og-logo";

// Dedicated route (not the special `icon` file convention) so we control
// the exact URL referenced from the PWA manifest's icons array. Static:
// this image never changes per-request, so generate it once at build time
// rather than on every request.
export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(ogLogoMark(512), { width: 512, height: 512 });
}
