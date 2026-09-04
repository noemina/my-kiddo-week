import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/i18n/locale";

const LOCALE_COOKIE = "locale";

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value && isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export async function setUserLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
