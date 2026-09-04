"use server";

import { redirect } from "next/navigation";
import { isSupportedLocale } from "@/i18n/locale";
import { setUserLocaleCookie } from "@/i18n/locale-server";

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale");
  const redirectTo = formData.get("redirectTo");

  if (typeof locale !== "string" || !isSupportedLocale(locale)) {
    throw new Error("Unsupported locale");
  }

  await setUserLocaleCookie(locale);
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/planner");
}
