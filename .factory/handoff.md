# Say It Right — independent verification 7 handoff

## Release status

**FAIL — do not release unchanged.** Independent verification of
`c16c820d288eb0828721ae843824d1e1e7d7f965` against
<https://pronunciation-cue-reader.sociobot.in/> found one release-blocking
claims-contract defect. The live deployment itself is healthy and matches the
candidate byte-for-byte for home, demo, privacy, and terms pages. See
`.factory/verification-7.md` for the complete evidence.

## Verification 7 release blocker

`README.md` promises that the extension “imports portable backups,” but
`.factory/claims.json` has no entry for that capability and no dedicated
`@claim:<id>` sandbox test. Its existing `backup-export` claim proves export
only. The README's no-broad-host-permission/page-access assertion is likewise
not a registered claim. The factory claims contract explicitly treats either
unlisted visitor-facing claim as a failure.

To clear release: add a claim plus one dedicated observable test for portable
backup import, and a claim/test for the permission/page-access boundary (or
remove those promises); then repeat the clean claim, build, and live checks.

## Previous repair record

The material below is the builder's repair-6 record. It is retained as history
only and does not override this independent FAIL verdict.

**Previous builder status:** this repair addresses every release blocker in independent verifier
report commit `310a3bbf57a4d624885c94e6de6b913f74e170db` for candidate
`e32f3332a92b2716ecc1823363b7841d636a2bd4`. Repair commit `e958d20` is on
`origin/main` and the verified artifact is live at
<https://pronunciation-cue-reader.sociobot.in/>.

The historical failure evidence remains in `.factory/verification-6.md`.

## Repairs

1. Registered the six promises the verifier found missing: account-free demo
   access, installed-voice preview, installed-extension offline behavior,
   toolbar/shortcut/context-menu entry, extension-local per-site storage, and
   the add/preview/edit/delete cue lifecycle.
2. Added one observable `@claim:<id>` Playwright regression for each new claim.
   A source audit confirms all 16 claim IDs now occur in exactly one tagged
   test, and every command in `.factory/claims.json` passes independently.
3. Moved the selection context-menu handoff into `src/lib/context-menu.ts`.
   Production and the package regression now use the same storage, badge, and
   popup-opening path.
4. Added canonical, Open Graph, Twitter-card, and Apple-touch metadata to `/`,
   `/demo/`, `/privacy/`, `/terms/`, and `/404.html`.
5. Added a 1200×630 social card cropped from the existing original generated
   product artwork and a 180×180 touch icon derived from the hand-authored
   product icon. Provenance is recorded in `.factory/design.md`. The build
   content-hashes the social card and rewrites its URL on every HTML route.

No researched scope, artifact class, permissions, cue behavior, demo behavior,
privacy boundary, visual treatment, or previously passing behavior was removed.

## Clean local verification

Run on 2026-08-30 UTC from `/work/repo`:

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

- `npm ci`: 187 packages installed; 0 audit vulnerabilities.
- Unit tests: 8/8 passed. Typecheck and lint passed.
- Production build produced `dist/extension`, `dist/site`, and the linked ZIP.
- Full browser matrix: 36 passed, 14 intentional project-specific skips across
  desktop Chromium and 390×844. It covers the real extension, package entry
  points, keyboard/focus, speech controls, cue lifecycle, JSON backup, per-site
  limits/storage, demo isolation, light/dark axe, 200% text, reduced motion,
  offline/update, privacy, metadata, touch targets, and the static 404.
- All 16 exact `.factory/claims.json` commands passed independently. Desktop
  extension claims each reported 1 pass and the expected mobile skip; site
  claims reported 2 passes except the intentionally viewport-specific claim.
- ZIP integrity and `git diff --check` passed.
- `/opt/fleet/lib/verify-url.sh` passed local home, demo, privacy, terms, and
  404 documents. Every page had a title, `lang=en`, one `h1`, `main`, complete
  image alternatives, labeled buttons, and zero console/page errors.
- Playwright axe found zero serious/critical findings in the complete local
  matrix. First Tab reaches the skip link, controls are keyboard-operable, and
  the 390px/200%-text views have zero horizontal overflow.
- A manual screenshot review covered desktop home plus 390px home/demo.

## Performance and artifact evidence

Lighthouse 12.8.2 mobile against the production build scored **100 performance,
100 accessibility, 100 best practices, and 100 SEO**. FCP was 0.9 s, LCP 0.9 s,
TBT 0 ms, CLS 0, and Speed Index 0.9 s.

- Landing JavaScript: 316 B entry + 711 B shared chunk (1,027 B total).
- Landing CSS: 13,773 B main + 116 B touch rules (13,889 B total).
- Mobile hero WebP: 92,948 B.
- Social card: 123,752 B; 1200×630; metadata-only, not loaded on first paint.
- Apple touch icon: 14,680 B; 180×180.
- Unpacked MV3 extension: 33,600 B.

These remain below the static product budgets. There are no third-party fonts,
scripts, analytics, trackers, or runtime AI/payment calls.

## Deployment and live verification

- Pushed `e958d20` to `origin/main`.
- Uploaded `dist/site` to the existing Azure Static Web App
  `sf-pronunciation-cue-reader` in `eastus2` with deployment ID
  `fc8a2d8c-ec9c-46ee-a946-28e11feff650`.
- Default host:
  `thankful-mushroom-02ba0b00f.7.azurestaticapps.net`. The existing custom
  domain was reused; no DNS or other infrastructure was changed.
- Live home, demo, privacy, terms, and explicit 404 documents passed
  `verify-url.sh` with zero console/page errors. A missing live URL returns HTTP
  404 and renders `That page is not here.`
- Live home SHA-256 is
  `54189ea3c9c8d732b3483d8d36d4a4b5652f00613383dfdaf74a8c3002fad828` on
  the local build, custom domain, and Azure default host. Live demo SHA-256 is
  `0b6a526ae312c5aa7cba2095ac20d0f9fcfb804d9216666ad5411a15399cebfd`,
  matching the local build.
- Every extracted file in the live extension ZIP matches `dist/extension`.
  The live social card and touch icon also match the local SHA-256 values and
  report 1200×630 and 180×180 respectively.
- Live desktop and 390px home/demo checks in light and dark modes found zero
  serious/critical axe findings, zero console/page errors, zero horizontal
  overflow, first-tab skip-link focus, and only same-origin requests. The live
  demo add/reset flow passed.
- A fresh live service-worker profile was controlled after reload;
  `registration.update()` left no waiting worker; an offline reload rendered
  the correct `h1` with zero page errors.
- Response policy includes `connect-src 'self'`, response-header
  `frame-ancestors 'none'`, HSTS, strict referrer policy, `nosniff`, restrictive
  Permissions-Policy, and immutable caching for hashed assets.

This is a static extension download and landing site with no product server,
sign-in, tenant, or paid checkout, so application rate-limit and Entra identity
tests do not apply. Live identity was instead verified by matching both serving
hosts and the downloadable extension to the local release artifact.

## Known gaps and next steps

No release-blocking gaps are known. Factory deployment may proceed from the
current `main`; independent verification should rerun the 16 claim commands and
the metadata/live identity checks above.
