# Independent product verification 8 — PASS

- Verified: 2026-08-30 UTC
- Candidate: `bbdfa111c7d83d666a960985102caffd069ac017`
- Repository: `B-Divyesh/sf-pronunciation-cue-reader`, branch `main`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Acceptance sources: supplied researched brief and work order. `.factory/brief.json`
  is absent; `.factory/design.md` was reviewed.
- Verdict: **PASS — release candidate accepted.**

## Mandatory first read and demo

In a fresh, cold Chromium context, the live first screen says **“Read selected
text with pronunciation cues.”** It names **dyslexic, low-vision, and
language-learning readers**, tells them to click **“Try it with sample data,”**
and says that this opens a private sample reader with no account. This meets
the plain-words, first-read, and one-click-demo gate.

That action opened `/demo/`. The persistent banner reads “Demo — sample data,
nothing is saved to your real reader” and exposes **Reset demo** and **Start
for real**. The demo started with Kubernetes, PostgreSQL, and NASA cues; it
stored only `demo:pronunciation-cue-reader:cues`; it rejected an empty cue with
“Enter the word or phrase as it appears.”; it saved
`OpenTelemetry → open tel eh metry`; and Reset removed that addition and
restored the initial sample. The selected visible text remained unchanged while
cue-bearing chunks exposed their distinct spoken value.

## Clean local quality gates

The first raw claim invocation in the bare checkout could not resolve
`@playwright/test`, as `node_modules` is intentionally absent. After the
required clean `npm ci` (187 packages; audit: 0 vulnerabilities), every exact
claim command was run independently and passed. The test results are from the
shipped `/demo/` and packaged-extension entry points, as declared in the
registry.

| Check | Result |
| --- | --- |
| `.factory/claims.json` | Present with 18 entries. |
| All 18 exact `npm run test:e2e -- --grep @claim:<id>` commands | **PASS**. `test-results/.last-run.json` records `status: passed`, no failed tests. |
| `npm test` | **PASS**, 8/8 unit tests. |
| `npm run typecheck` | **PASS**. |
| `npm run lint` | **PASS** (delegates to typecheck). |
| `npm run build` | **PASS**; produced `dist/site`, `dist/extension`, and `dist/site/downloads/say-it-right.zip`. |
| `npm run test:e2e` | **PASS**, Playwright full matrix recorded no failed tests. |

The passed claims cover demo isolation, per-site 20-cue boundaries, selected
reading and source preservation, local-data privacy, export/import, keyboard
flow, text zoom/reduced motion, selection expiry, site tracking, no-account
demo, installed-voice preview, offline extension use, all entry points,
active-tab boundary, per-site storage, and cue lifecycle.

The production build reports a 33.60 KB unpacked extension. Landing JavaScript
is 316 B (220 B gzip), shared JavaScript 711 B (400 B gzip), main CSS 13.77 KB
(3.93 KB gzip), demo JavaScript 3.49 KB (1.65 KB gzip), and the hero WebP is
91 KB. All are inside the supplied static-product budgets.

## Independent product exercise

The packaged Chromium extension tests independently exercised the brief's core
job: a selected passage is read in chunks, source wording remains visible,
`Kubernetes → koo-ber-net-ees` is spoken instead, Preview uses the selected
installed voice, and Pause, Resume, and Stop change the reader state. A cue
was added, edited, deleted, exported, and imported; site-scoped storage was
verified at the 20-cue boundary and separately for another site.

Boundary and recovery coverage passed for blank cue input, a 121-character
term, malformed JSON import, a 21-cue import, unsupported every-site scope,
an expired pending selection, and an offline installed extension. Keyboard-only
coverage reached the skip link, opened Add cue, and saved with Enter.

## Live privacy, accessibility, responsive, and offline evidence

- Fresh desktop and 390 x 844 Chromium checks had zero console errors and zero
  page errors. At 390 px with 200% root text and reduced motion there was no
  horizontal overflow and `scroll-behavior` was `auto`. Visible nav/footer
  controls measured at least 44 px high.
- The first Tab focused “Skip to main content”; it had a designed
  `rgb(37, 71, 184) solid 3px` focus outline and a 205 x 46 px target.
- Playwright axe found **zero serious or critical** violations on the live home
  page. The full local suite also runs axe on light/dark site views, demo, and
  extension popup with no serious/critical findings.
- A cold live home-plus-demo request log contained only
  `https://pronunciation-cue-reader.sociobot.in` requests. It contained no
  third-party font, analytics, tracker, selected-text, or cue request. The
  extension claims test likewise observed only `chrome-extension://` requests
  during reader/glossary use.
- The live response sends CSP with `connect-src 'self'` and response-header
  `frame-ancestors 'none'`, HSTS, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Content-Type-Options: nosniff`, and a restrictive Permissions-Policy.
  Hashed assets use `public, max-age=31536000, immutable`.
- In a fresh live profile, the service worker became controlling after reload;
  `registration.update()` left no waiting worker; an offline reload still
  rendered the home `h1` without errors.

`verify-url.sh` is not present in this checkout, so it could not be run. Its
required checks were performed directly in Playwright: title, `lang=en`, one
`h1`, `main`, image alt text, console/page errors, desktop/mobile layout, and
request logging.

## Deployment identity

Every public file in the local `dist/site` tree that the host serves matched
the live version byte-for-byte, including home, demo, privacy, terms, service
worker, hashed CSS/JS, images, icons, manifest, and 404. Home SHA-256 was
`54189ea3c9c8d732b3483d8d36d4a4b5652f00613383dfdaf74a8c3002fad828` both
locally and live.

The local and live ZIP container hashes differ because ZIP metadata records
build timestamps. Both archives contain the same nine files, and `diff -ru`
and per-file SHA-256 comparison of their extracted trees were empty. The live
download is HTTP 200 `application/zip`; it is therefore the tested candidate
extension, not a stale or HTML fallback artifact.

This is a static landing site and downloadable browser extension. It has no
backend API, sign-in, payment flow, or product-unlock endpoint, so server rate
limit and Entra tenant checks do not apply.

## Defects by severity

None found. No release-blocking defects remain.
