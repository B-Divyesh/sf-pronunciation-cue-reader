# Review 1 handoff — Say It Right

## Result

**FAIL.** This was a read-only adversarial review; no product code was changed.
The committed report is `.factory/review-1.md`.

## What was checked

- Fresh live desktop and 390 px cold reads, demo behavior, storage isolation,
  reset/start-real behavior, request logs, responsive overflow, metadata,
  404, links, download archive, route/back focus, target sizes, axe checks,
  sitemap, headers, and visual identity.
- All 18 exact commands from `.factory/claims.json` after `npm ci`.
- `npm test` (8/8), `npm run build`, full `npm run test:e2e` (54 tests with
  declared skips), `npm run typecheck`, `npm run lint`, and `git diff --check`.
- Every earlier verification finding and the existing handoff. No previous
  `review-*` or `polish-*` files exist.

## Open work

See F-1-1 through F-1-10 in `.factory/review-1.md`. Blocking work is route
focus/announcement, a registered phrase-matching claim test, and 44 px mobile
targets on demo, legal, and 404 routes.

## Reproduce

```bash
npm ci
npm test
npm run build
npm run test:e2e
npm run typecheck
npm run lint
```

Then run each `test` command in `.factory/claims.json` individually and repeat
the live mobile route checks documented in the review.
