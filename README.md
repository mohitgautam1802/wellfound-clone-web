# wellfound-clone-web

Frontend for a **Wellfound candidate-portal clone** — the **Profile**, **Jobs**
and **Applied** sections.

Next.js 15 (App Router) + TypeScript + Tailwind + TanStack Query.

> Learning/portfolio project, not affiliated with Wellfound. All companies, jobs
> and people in the app are fictional seed data.

Backend lives in a separate repo: **wellfound-clone-api**.

---

## Quick start

The API must be running first.

```bash
# 1. in wellfound-clone-api
npm install && npm run setup && npm run dev     # http://localhost:4000

# 2. here
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
npm run dev                    # http://localhost:3000
```

Sign in with the seeded demo account (the login form pre-fills it):

```
demo@wellfound.dev / password123
```

---

## Screens

| Route | What it does |
| --- | --- |
| `/home` | Dashboard: completion prompt, recommended roles, recent applications |
| `/jobs` | Search with filters, plus **Browse all / Saved / Hidden** tabs |
| `/jobs/[id]` | Full job detail and the apply flow |
| `/profile` | Four tabs — **Profile / Résumé / Preferences / Culture** |
| `/applied` | Application tracker with pipeline, timeline and withdraw |
| `/login` | Sign in / sign up |

### Jobs

Filters mirror the real portal: free text (double-quoted phrases are matched as
a unit), multi-city selection, role type, work arrangement, company size,
minimum salary and years of experience. Sorting offers **Recommended** (scored
against your stated preferences), **Most recent** and **Highest salary**.
Searches can be saved and replayed; hidden jobs are excluded from Browse all.

### Profile

Follows the real four-tab structure. Completion is weighted toward the fields
recruiters actually filter on — primary role, skills, experience — so a profile
cannot show 100% while being unsearchable.

### Applied

Applications move through `APPLIED → IN_REVIEW → INTERVIEWING → OFFER`, with
`HIRED / REJECTED / WITHDRAWN` as terminal states that drop out of the pipeline
rail rather than pretending to be a later stage. Applications expire after two
weeks of inactivity, and the card warns before that happens.

---

## Architecture notes

**Client-side auth.** The JWT lives in `localStorage`, and `AuthProvider`
exchanges it for the current user on mount; a token for a deleted account is
discarded rather than trusted. `(portal)/layout.tsx` redirects unauthenticated
visitors and renders nothing until the check resolves, so there's no flash of
the shell.

**Server state via TanStack Query.** No global store. Mutations invalidate the
query keys they affect (`jobs`, `saved-jobs`, `applications`, …), so saved
counts and result lists stay consistent without manual cache surgery. 4xx
responses are not retried — repeating a rejected request just repeats it.

**Types are hand-written.** `src/lib/types.ts` mirrors the API by hand rather
than being generated, so the two repos can move independently and a breaking API
change surfaces here as a type error.

**Formatting is localised.** Salaries render in lakhs (`₹24L`), because this is
the Indian startup market and `₹2,400,000` is unreadable at a glance.

---

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Branch off `main`, open a PR, let CI
(lint + typecheck + build) go green.
