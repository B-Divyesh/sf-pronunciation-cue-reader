# Say It Right — repair 5 handoff

## Release status

**Local repair verification: PASS.** This repair addresses every blocker in
`.factory/verification-5.md` for candidate
`d913a4c3ea759c25726512c90ad93822a81a87a5`. Deployment evidence follows the
static upload.

## Repairs

1. Added `/demo/` and a first-screen **Try it with sample data** action. The
   landing page now names dyslexic, low-vision, and language-learning readers.
   The demo includes a realistic `docs.example.org` passage; Kubernetes,
   PostgreSQL, and NASA cues; a read-aloud control; add-cue form; persistent
   Demo banner; Reset demo; and Start for real.
2. Demo storage is isolated to `demo:pronunciation-cue-reader:cues`. It never
   reads extension storage, Reset demo restores the sample, and Start for real
   removes the demo key.
3. Corrected the 20-cue boundary in both `saveCue` and `mergeImportedCues`.
   Both paths now count normalized-site cues. Twenty cues on `one.example` no
   longer block saving a first cue on `two.example`.
4. Registered the demo, limit, selected-reading, source-preserving, backup,
   keyboard, accessibility, privacy, expiry, and no-tracker claims. Added
   `.factory/demo.md` and exact tagged browser regressions for each.
5. Added `404.html` and the Static Web Apps 404 response override. The
   service-worker precache now includes `/demo/` and `/404.html`.
6. Switched browser tests to full Chromium and one worker after reproducing a
   worker-only headless-shell SIGSEGV. The suite is now stable in this worker.

## Regression evidence

- Unit regression covers 20 cues on one site plus a successful first cue on
  another, and import merge capacity per normalized site.
- `@claim:site-cue-limit` asserts 20/1/20 stored cues for three sites after a
  keyboard save and 21-cue import.
- `@claim:demo-sandbox` asserts the isolated `demo:` key, add/reset behavior,
  Start for real discard behavior, and light/dark axe results.
- `@claim:source-preserving` verifies unchanged displayed sample text with a
  different exposed spoken cue. `@claim:backup-export` parses the downloaded
  JSON and observes extension-local requests only.
- Every command in `.factory/claims.json` was run independently and passed.

## Clean local verification

Executed on 2026-08-30 UTC:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
unzip -t dist/site/downloads/say-it-right.zip
git diff --check
```

- `npm ci`: 187 packages, 0 audit vulnerabilities.
- Unit: 8/8 passed. Typecheck and lint passed.
- Build produced `dist/extension`, `dist/site`, and the linked extension ZIP.
- Browser: 27 passed, 9 intentional project-specific skips. Desktop: 16
  passed, 2 skips. 390px: 11 passed, 7 skips. Coverage includes popup
  keyboard/read/pause/resume/stop/import/export; light/dark axe; demo
  light/dark axe; 200% text; reduced motion; offline reload/update; privacy;
  and touch targets.
- Archive validation and `git diff --check` passed. Extension size is 33.37
  KB; landing JS is 0.32 KB (0.22 KB gzip), landing CSS 13.77 KB (3.93 KB
  gzip), demo JS 3.49 KB (1.65 KB gzip), and hero WebP 92,948 B.
- `/opt/fleet/lib/verify-url.sh` passed local `/`, `/demo/`, `/privacy/`, and
  `/terms/`: HTTP 200, title/lang/one-h1/main/alt checks, and zero console or
  page errors. The standalone Selenium axe CLI could not launch Chrome in this
  worker; the Playwright axe integration passed with zero serious/critical
  findings across the tested views and themes.
- A 390px screenshot review found no horizontal overflow and legible demo
  controls, reader, glossary, and form.

## Privacy, offline, and response policy

- The demo key is separate from real reader data. Site requests remain
  same-origin; reader/export requests remain `chrome-extension://` local.
  No analytics, third-party code, or new permissions were added.
- The manifest remains limited to `activeTab`, `storage`, `contextMenus`, and
  `scripting`. The fresh-profile service-worker regression confirms offline
  reload after first visit and no waiting worker after update.
- Static policy retains `connect-src 'self'`, response-header
  `frame-ancestors 'none'`, immutable asset caching, ZIP MIME type, and the
  new real 404 override.

## Deployment and known gap

Static deployment to the existing `sf-pronunciation-cue-reader` app is the
remaining release step. This handoff will be amended with the live deployment
and identity evidence after upload.

No product gaps are known. Lighthouse was attempted locally; worker Chrome
crashed during Lighthouse's full-page screenshot artifact after collecting a
971 ms LCP and 0 CLS. The page itself had no console or axe failure, and all
size, Playwright, and URL-verifier checks above passed.
