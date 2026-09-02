# my-kiddo-week

A weekly planner for parents to track their kids' activities — recurring
weekly activities (school, gym, swimming) and one-off exceptions (birthday
parties, doctor's appointments) — with a printable per-kid weekly PDF.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- [Prisma 7](https://www.prisma.io/) + PostgreSQL
- [Auth.js (next-auth v5)](https://authjs.dev/) — email/password accounts, one account per family
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/) for unit tests

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env file and adjust if needed:

   ```bash
   cp .env.example .env
   ```

3. Start a local Postgres database:

   ```bash
   docker compose up -d
   ```

4. Apply the database schema:

   ```bash
   npm run db:migrate
   ```

5. (Optional) Seed a demo family so you have something to click around:

   ```bash
   npm run db:seed
   ```

   This creates a demo account — sign in at `/login` with:

   - email: `demo@my-kiddo-week.test`
   - password: `demo-password-123`

6. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Testing the app manually

- Register a new family at `/register`, or sign in with the seeded demo
  account above.
- Add kids on the `/kids` page.
- On `/planner`, add recurring activities (with an optional validity window,
  e.g. a school year running September to the next September) and one-off
  events, then navigate between weeks.
- Use "Print this week" to get a per-kid, per-day printable view — your
  browser's print dialog can save it directly as a PDF.

## Data model

- **Family** — a household; users belong to a family via a `Membership`
  (a user can belong to more than one family, e.g. a nanny working for two
  households).
- **Kid** — belongs to a family.
- **Activity** — a recurring weekly activity (day of week + time), with an
  optional `validFrom`/`validTo` window for activities that only apply for
  part of the year.
- **ActivityException** — a one-off event tied to a specific date.

## Scripts

| Script              | Purpose                                   |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start the dev server                       |
| `npm run build`      | Production build                           |
| `npm run lint`       | ESLint                                     |
| `npm run test`       | Vitest in watch mode                       |
| `npm run test:run`   | Vitest, single run (used in CI)            |
| `npm run db:migrate` | Apply Prisma migrations                    |
| `npm run db:seed`    | Seed a demo family                         |

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

## Roadmap

- **v2: External calendar sync** — push events to a caregiver's (e.g. a
  nanny's) Google Calendar automatically via the Google Calendar API, so
  their calendar always reflects the current week's plan.

## License

[MIT](./LICENSE)
