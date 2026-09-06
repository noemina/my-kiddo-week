import { getTranslations } from "next-intl/server";

const REPO_URL = "https://github.com/noemina/my-kiddo-week";
const ISSUES_URL = `${REPO_URL}/issues`;

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="ml-1 inline-block"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export async function Footer() {
  const t = await getTranslations("Landing");

  return (
    <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 print:hidden">
      <p>
        {t.rich("footerOpenSource", {
          repoLink: (chunks) => (
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {chunks}
              <ExternalLinkIcon />
            </a>
          ),
        })}
      </p>
      <p className="mt-1">
        {t.rich("footerIssues", {
          issuesLink: (chunks) => (
            <a
              href={ISSUES_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {chunks}
              <ExternalLinkIcon />
            </a>
          ),
        })}
      </p>
    </footer>
  );
}
