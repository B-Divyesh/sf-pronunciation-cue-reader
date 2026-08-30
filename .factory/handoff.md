# Polish 1 handoff — Say It Right

## Result

All ten findings in `.factory/review-1.md` are repaired. The static landing
site keeps its documented pronunciation-field visual identity; the MV3
extension artifact and static-site deployment class are unchanged.

## What changed

- Added focused, announced document-route changes and a direct `/?demo=1`
  entry that redirects into the isolated `/demo/?demo=1` reader.
- Added a registered and observable phrase/abbreviation matching claim.
- Made every visible mobile route control at least 44 px, added a route target
  matrix, and standardized the header/footer on home, demo, legal, and 404.
- Added the demo route to the sitemap; completed plain-language and terminology
  rewrites in the landing page, demo, legal pages, README, catalog description,
  and copy audit.
- Tightened the desktop hero headline scale after visual inspection so it no
  longer overlaps the hero illustration.

## Verification

Clean dependency install: `npm ci` completed with 0 vulnerabilities.

- `npm test` — 8 passing.
- `npm run typecheck` and `npm run lint` — passing.
- `npm run build` — passing; produces `dist/site` and `dist/extension`.
- `npm run test:e2e` — 62 browser tests passing (declared project skips only),
  including axe serious/critical checks, offline shell reload, route metadata,
  focus/announcement/back navigation, demo isolation, privacy request checks,
  and the 390 px target matrix.
- Every exact command listed in `.factory/claims.json` was run independently
  from the clean install; all passed. `test-results/.last-run.json` records
  `{"status":"passed","failedTests":[]}`.
- `git diff --check` passed.
- Local visual checks: `test-results/polish-1-home-desktop.png` and
  `test-results/polish-1-demo-390.png`.

`verify-url.sh` is not present in this repository. The equivalent title/lang/
main/alt/console coverage is in the Playwright route matrix, and the existing
Playwright axe integration found no serious or critical violations.

## Deploy and live recheck

Repair commit `f8a97e7f278f6575ea9c216f75b4d9f4a0b09ba2` was pushed to
`origin/main` at 2026-08-30 05:35 UTC. The static-host deployment remains
outside this repository. Cache-busted cold checks through 05:40 UTC still
returned the preceding artifact (`ETag "56195865"`, last modified 04:06 UTC),
so live verification must run after that deployment propagates. The local
release artifact was checked at `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`,
and `/404.html` before the push.

## Known gaps

The external static deployment had not propagated by the final cold check.
