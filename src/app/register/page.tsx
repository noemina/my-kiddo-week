"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { registerAction } from "@/lib/actions/auth-actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);
  const t = useTranslations("Register");
  const tErrors = useTranslations("AuthErrors");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("familyName")}
          <input
            name="familyName"
            required
            placeholder={t("familyNamePlaceholder")}
            className="rounded-md border border-gray-300 px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("yourName")}
          <input
            name="name"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("email")}
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("password")}
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="rounded-md border border-gray-300 px-3 py-2 text-base"
          />
        </label>

        {state?.error && (
          <p className="text-sm text-red-600" role="alert">
            {tErrors(state.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? t("submitPending") : t("submit")}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-500">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-indigo-600">
          {t("signIn")}
        </Link>
      </p>
    </main>
  );
}
