# Contributing

## Branch and PR flow

`main` is the integration branch. Work happens on branches and lands via PR.

```bash
git checkout main
git pull
git checkout -b feat/job-alert-toggle

# ... make changes ...

npm run lint && npm run typecheck && npm run build
git commit -am "feat(jobs): toggle alerts on a saved search"
git push -u origin feat/job-alert-toggle
gh pr create --fill
```

### Branch naming

| Prefix | For |
| --- | --- |
| `feat/` | New capability |
| `fix/` | Bug fix |
| `refactor/` | Behaviour-preserving change |
| `style/` | Visual polish only |
| `chore/` | Tooling, deps, CI |

Commit messages follow Conventional Commits: `feat(jobs): add funding filter`.

---

## Conventions

**Server state belongs to TanStack Query.** Don't mirror API data into
`useState`. A mutation should invalidate the keys it affects rather than
hand-patching several caches:

```ts
const save = useMutation({
  mutationFn: () => api.saveJob(id),
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ['jobs'] });
    void queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
  },
});
```

**Styling is Tailwind plus a few component classes.** `card`, `btn-primary`,
`btn-secondary`, `input`, `label` and `chip` live in `globals.css`. Reach for
those before inventing another variant, and use the semantic colours (`ink`,
`brand`, `success`, `danger`) rather than raw palette values, so a future theme
change is one file.

**Accessibility is part of the change, not a follow-up.**
- Every icon-only button needs an `aria-label`.
- Tabs and nav items set `aria-current`.
- Toggles set `aria-pressed`; dropdowns set `aria-expanded`.
- Don't remove focus outlines; `:focus-visible` is styled globally.

**Types mirror the API by hand.** When an endpoint's response changes, update
`src/lib/types.ts` in the same PR and link the paired `wellfound-clone-api` PR.

---

## Adding a screen

1. Route under `src/app/(portal)/` so it inherits the auth guard and shell.
2. Add the nav entry in `src/components/shell/sidebar.tsx`.
3. Fetch through the `api` object in `src/lib/api.ts` — components never call
   `fetch` directly.
4. Handle all three states: loading (`LoadingPanel`), error (`ErrorPanel`) and
   empty (`EmptyState`). An empty state that explains the next action beats a
   blank panel.
