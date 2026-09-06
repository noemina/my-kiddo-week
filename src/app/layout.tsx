import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { PlanStoreProvider } from "@/lib/plan-store";
import { Footer } from "@/components/Footer";
import { DevBanner } from "@/components/DevBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My kiddo week",
  description: "A weekly activity planner for parents",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My kiddo week",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <DevBanner />
        <NextIntlClientProvider>
          <PlanStoreProvider>{children}</PlanStoreProvider>
        </NextIntlClientProvider>
        <Footer />
      </body>
    </html>
  );
}
