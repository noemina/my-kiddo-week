"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSupportedLocale } from "@/i18n/locale";
import { setUserLocaleCookie } from "@/i18n/locale-server";

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale");
  const redirectTo = formData.get("redirectTo");

  if (typeof locale !== "string" || !isSupportedLocale(locale)) {
    throw new Error("Unsupported locale");
  }

  await setUserLocaleCookie(locale);

  // The locale is read in the root layout, which every route shares. A
  // redirect back to the *same* URL the switcher was used on is otherwise
  // a no-op from the client router's point of view (same pathname in, same
  // pathname out), so without this the page never actually re-renders with
  // the new locale until an unrelated navigation happens.
  revalidatePath("/", "layout");

  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/planner");
}
