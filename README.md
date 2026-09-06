# my-kiddo-week

[![Latest release](https://img.shields.io/github/v/release/noemina/my-kiddo-week?label=version)](https://github.com/noemina/my-kiddo-week/releases)

Three independent weekly planners for parents — **Activities**, **Meals**,
and **School** — each with its own printable, real-PDF calendar. They share
only your kid list; nothing else overlaps between them.

- **Activities** — recurring weekly activities (school, gym, swimming) and
  one-off exceptions (birthday parties, doctor's appointments), navigable
  week by week, plus a dateless "typical week" template.
- **Meals** — a lunch/dinner plan for a specific week. Family-wide by
  default; split a meal to specific kids only when you need to.
- **School** — a recurring weekly timetable (subjects + day/time slots per
  kid) — the same every week, no dates involved.

Every planner can print (really: download) a real vector PDF — the text is
selectable, searchable, and copyable, not a screenshot — with per-print
controls for which days/kids/events to include, a font-size adjustment, and
its own notes field.

**Local-first, no accounts.** Nothing is sent to or stored on a server: your
data lives entirely in your browser (`localStorage`). There's no login, no
database, and no server-side data of any kind to worry about. Each of the
three planner pages has its own **Save / Load / Clear** — Save downloads a
self-contained JSON file (your kids + that planner's own data + its own
notes), so it works as a backup or to move that planner to another
browser/device even if the destination has no kids set up yet; Load merges
kids in by id and replaces that planner's own data; Clear wipes only that
planner's own data, leaving your kids and the other two planners untouched.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript) — a static,
  client-rendered app; no backend
- [Tailwind CSS v4](https://tailwindcss.com/)
- [next-intl](https://next-intl.dev/) — English, French, Italian, German
- [jsPDF](https://github.com/parallax/jsPDF) — PDFs are drawn directly with
  vector text/shapes (see `src/lib/pdf-export.ts` and
  `src/lib/meals-pdf-export.ts`), not a screenshot of the page
- [Vitest](https://vitest.dev/) for unit tests

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no database,
no environment variables, no seed data.

## Using the app

1. **Add your kids first** (`/kids`) — name, color, and an optional family
   name shown on printouts. Everything else assigns activities/meals/
   subjects to one or more kids, so this is the one page all three planners
   depend on.
2. **Activities** (`/planner`) — add recurring activities (with an optional
   validity window, e.g. a school year running September to the next
   September) and one-off events, then navigate between weeks. An activity
   can be assigned to more than one kid (e.g. siblings sharing a class) — it
   shows up under each assigned kid. Click any entry on the calendar to edit
   or delete it; for a recurring activity spanning multiple days, you'll be
   asked whether the change applies to just that occurrence or the whole
   series.
3. **Meals** (`/meals`) — add a lunch or dinner for a specific date. Leave
   the kids unchecked for a meal the whole family shares, or check specific
   kids to scope it just to them.
4. **School** (`/school`) — add a subject with the day(s) of the week and
   time slot it occurs, per kid. This is a fixed weekly template, not tied
   to any specific date — no "this week vs. next week" to think about.
5. **Print any of them** — each planner's print page lets you pick which
   days/kids/events to include, adjust the printed font size, and add notes
   specific to that printout, before downloading a real PDF.

## Data model

Everything lives in one JSON object (`PlanData`, see
`src/lib/plan-store.tsx`) persisted to `localStorage`:

- **familyName** — an optional label shown on printouts.
- **kids** — `{ id, name, color }`. Shared by all three planners.
- **activities** — a recurring weekly activity (day of week + time), with an
  optional `validFrom`/`validTo` window, `includeInTypicalWeek`, and a
  `seriesId` shared across every day-of-week row from the same "add
  recurring activity" submission (so editing/deleting the whole series
  updates all of them at once). Can be shared by more than one kid via
  `kidIds`.
- **exceptions** — a one-off event tied to a specific date. Also shareable
  via `kidIds`. Also how "edit just this occurrence" of a recurring activity
  is represented (the original day gets skipped via `excludeDates`, and a
  one-off exception is created for that date).
- **meals** — `{ date, mealType: "lunch" | "dinner", title, color, kidIds }`.
  Dated, not recurring. Empty `kidIds` means the whole family.
- **schoolSubjects** — `{ title, color, kidIds, daysOfWeek, startTime,
  endTime }`. One record holds every day it occurs on directly (not a
  separate row per day) — there's no per-occurrence exception concept here,
  since the timetable is always just the recurring template.
- **notes** — `{ planner, meals, school }`, one independent free-text field
  per planner's print view.

Each planner's own Save/Load file is a smaller, self-contained shape (see
`PlannerExport`/`MealsExport`/`SchoolExport` in `src/lib/plan-store.tsx`) —
family name + kids + that planner's own data + its own notes — rather than
the full `PlanData` above.

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

## License

[MIT](./LICENSE)
