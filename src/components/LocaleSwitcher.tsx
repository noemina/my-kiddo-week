"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SUPPORTED_LOCALES } from "@/i18n/locale";
import { setLocaleAction } from "@/lib/actions/locale-actions";

export function LocaleSwitcher() {
  const formRef = useRef<HTMLFormElement>(null);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Locale");

  return (
    <form ref={formRef} action={setLocaleAction}>
      <input type="hidden" name="redirectTo" value={pathname} />
      <select
        name="locale"
        defaultValue={locale}
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        aria-label={t("label")}
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </form>
  );
}
