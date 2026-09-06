import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/Logo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { CalendarIllustration, PrintIllustration } from "@/components/LandingIllustrations";

const STEP_ACCENTS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b"];

function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default async function Home() {
  const t = await getTranslations("Landing");
  const tNav = await getTranslations("Nav");

  const steps = [
    { title: t("step1Title"), body: t("step1Body") },
    { title: t("step2Title"), body: t("step2Body") },
    { title: t("step3Title"), body: t("step3Body") },
    { title: t("step4Title"), body: t("step4Body") },
  ];

  const previews = [
    { src: "/preview-activities.png", title: tNav("planner"), body: t("previewActivitiesBody"), alt: t("previewActivitiesAlt") },
    { src: "/preview-meals.png", title: tNav("meals"), body: t("previewMealsBody"), alt: t("previewMealsAlt") },
    { src: "/preview-school.png", title: tNav("school"), body: t("previewSchoolBody"), alt: t("previewSchoolAlt") },
  ];

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-lg font-semibold">{tNav("appName")}</span>
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-16 sm:py-24">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 -z-10 h-96 w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-amber-300 opacity-20 blur-3xl dark:opacity-25"
          />
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Logo size={64} className="mb-6" />
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("heroTitle")}</h1>
            <p className="mt-4 max-w-xl text-base text-gray-600 dark:text-gray-300">
              {t("heroSubtitle")}
            </p>
            <Link
              href="/kids"
              className="mt-8 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {t("ctaPlanner")}
            </Link>
          </div>

          <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center justify-center gap-6 sm:flex-row">
            <CalendarIllustration alt={t("illustrationCalendarAlt")} />
            <PrintIllustration alt={t("illustrationPrintAlt")} />
          </div>
        </section>

        {/* Privacy disclaimer */}
        <section className="px-6 pb-16">
          <div className="mx-auto flex max-w-3xl items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <LockIcon />
            </span>
            <div>
              <h2 className="font-semibold text-emerald-900 dark:text-emerald-100">
                {t("privacyTitle")}
              </h2>
              <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
                {t("privacyBody")}
              </p>
            </div>
          </div>
        </section>

        {/* Real PDF previews, one per planner */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              {t("previewSectionTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 dark:text-gray-300">
              {t("previewSectionBody")}
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {previews.map((preview) => (
                <div
                  key={preview.src}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                >
                  <Image
                    src={preview.src}
                    alt={preview.alt}
                    width={900}
                    height={487}
                    className="w-full border-b border-gray-200 dark:border-gray-800"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{preview.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{preview.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              {t("howItWorksTitle")}
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border border-gray-200 p-5 dark:border-gray-800"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: STEP_ACCENTS[i] }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
