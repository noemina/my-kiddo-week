# my-kiddo-week

A weekly planner for parents to track their kids' activities — recurring
weekly activities (school, gym, swimming) and one-off exceptions (birthday
parties, doctor's appointments), shareable across multiple kids — with a
printable calendar-style weekly PDF, including a dateless "typical week"
template built from your recurring activities.

**Local-first, no accounts.** Nothing is sent to or stored on a server: your
plan lives entirely in your browser (`localStorage`). There's no login, no
database, and no server-side data of any kind to worry about. Use "Save
plan" to download your plan as a JSON file — a backup, and the way to move
it to another browser or device — and "Load plan" to bring one back in.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript) — a static,
  client-rendered app; no backend
- [Tailwind CSS v4](https://tailwindcss.com/)
- [next-intl](https://next-intl.dev/) — English, French, Italian, German
- [Vitest](https://vitest.dev/) for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no database,
no environment variables, no seed data.

## Testing the app manually

- Add kids on the `/kids` page (name, color, and an optional plan name shown
  on printouts).
- On `/planner`, add recurring activities (with an optional validity window,
  e.g. a school year running September to the next September) and one-off
  events, then navigate between weeks. An activity or event can be assigned
  to more than one kid (e.g. siblings sharing a class) — it shows up under
  each assigned kid.
- Use "Print this week" for a specific dated week (recurring occurrences +
  that week's one-off events), or "Print typical week" for a dateless
  template built from your recurring activities only. Both print views lay
  the week out as a real calendar — a shared time axis down the left, each
  day split into a sub-column per kid so overlapping activities (e.g. one
  kid's gym class overlapping a sibling's swimming lesson) are visible side
  by side — and let you choose which days and which events to include
  before printing. Your browser's print dialog can save the result directly
  as a PDF (landscape works best, given the width).
- Use "Save plan" (top right) any time to download your current plan as a
  `.json` file, and "Load plan" to restore one — this is also how you'd move
  your plan to a different browser or device.

## Data model

Everything lives in one JSON object (`PlanData`, see `src/lib/plan-store.tsx`)
persisted to `localStorage` and mirrored by the Save/Load file:

- **familyName** — an optional label shown on printouts.
- **kids** — `{ id, name, color }`.
- **activities** — a recurring weekly activity (day of week + time), with an
  optional `validFrom`/`validTo` window for activities that only apply for
  part of the year, and `includeInTypicalWeek` (default checked/unchecked
  state offered on the typical-week print page). Can be shared by more than
  one kid via `kidIds`.
- **exceptions** — a one-off event tied to a specific date. Also shareable
  via `kidIds`.

## Scripts

| Script            | Purpose                          |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the dev server              |
| `npm run build`   | Production build                  |
| `npm run lint`    | ESLint                            |
| `npm run test`    | Vitest in watch mode               |
| `npm run test:run`| Vitest, single run (used in CI)   |

## CI / code quality

- `.github/workflows/ci.yml` runs lint, type-check, unit tests, and a
  production build on every push and pull request.
- `.github/workflows/claude-code-review.yml` posts automated review comments
  on pull requests via the [Claude Code GitHub
  Action](https://github.com/anthropics/claude-code-action) — review-only,
  it cannot push commits (its job has `contents: read`). Requires an
  `ANTHROPIC_API_KEY` repo secret.
- Recommended: connect this repo to
  [SonarCloud](https://sonarcloud.io/) using its "Automatic Analysis" mode
  (import the repo via the SonarCloud GitHub App — no workflow file or
  secrets needed).

## Contributing

Open a pull request against `main`. CI runs lint, type-check, tests, and a
build; the Claude Code review workflow will also leave comments on the diff.

## Roadmap

- **v2: External calendar sync** — an explicit, opt-in way to push events to
  a caregiver's (e.g. a nanny's) Google Calendar, so their calendar reflects
  the current week's plan. Local-first stays the default; sync would be an
  add-on, not a requirement to use the app.

## License

[MIT](./LICENSE)
