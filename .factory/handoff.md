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

Pending the release push at the time this file was written. After deployment,
open `https://pronunciation-cue-reader.sociobot.in` cold and update this
section with the commit and live result.

## Known gaps

None.
