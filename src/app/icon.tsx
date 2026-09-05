import { ImageResponse } from "next/og";
import { ogLogoMark } from "@/lib/og-logo";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(ogLogoMark(size.width), { ...size });
}
