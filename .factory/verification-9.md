# Independent product verification 9 — PASS

- Verified: 2026-08-30 UTC
- Candidate commit: `c75eae1d60579e367be8defa9c60339bc391878a`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Scope: researched brief supplied with work order, `.factory/design.md`, and
  `.factory/claims.json`. The repository does not contain `.factory/brief.json`.
- Verdict: **PASS — candidate accepted.**

## First read and demo

A cold live Chromium visit presented the headline “Read selected text with
pronunciation cues.” It says this is for dyslexic, low-vision, and
language-learning readers, and the first action is **Try it with sample data**.
The action explains that it opens a private sample reader; the first-screen
facts also state the 20-cue limit and no-account condition. This meets the
plain-words and one-click-demo gates.

The live demo opened at `/demo/?demo=1` with the persistent “Demo — sample
data, nothing is saved to your real reader” banner, **Reset demo**, and **Start
for real**. It starts with Kubernetes, PostgreSQL, and NASA. Blank input
announced “Enter the word or phrase as it appears.” Saving
`OpenTelemetry → open tel eh metry` rendered the cue, Reset removed it, and
Start for real removed `demo:pronunciation-cue-reader:cues` before returning to
the install section. The displayed selected text stayed unchanged.

## Clean local verification

After `npm ci` (187 packages, audit: 0 vulnerabilities), each exact command
declared in `.factory/claims.json` was run against its shipped demo or packaged
extension entry point. All final standalone invocations passed:

`demo-sandbox`, `whole-words-and-phrases`, `site-cue-limit`, `local-reader-data`,
`selected-reading`, `source-preserving`, `backup-export`,
`portable-backup-import`, `keyboard-reader`, `reader-accessibility`,
`pending-selection-expiry`, `site-no-trackers`, `no-account-demo`,
`installed-voice-preview`, `installed-extension-offline`,
`extension-entry-points`, `active-tab-boundary`, `per-site-local-glossary`, and
`cue-lifecycle`.

The first scripted series produced two non-product Playwright harness failures
(a temporary preview-server `ERR_CONNECTION_REFUSED` and a trace-file
`ENOENT`). The corresponding exact commands were immediately repeated in
isolation and passed; the complete Playwright matrix also passed. They do not
reproduce as a product failure.

| Command | Result |
| --- | --- |
| `npm test` | PASS — 8/8 Vitest tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — produces `dist/site` and `dist/extension` |
| `npm run test:e2e` | PASS — 45 passed, 17 declared project skips |

The build reported a 33.60 KB unpacked extension. The landing entry JavaScript
is 466 B (300 B gzip), shared JavaScript 1.13 KB (600 B gzip), CSS is 14.67 KB
(4.11 KB gzip), and the hero WebP is 92.9 KB: all within the stated budgets.

## Independent live QA

- Desktop and 390 px mobile checks had no console or page errors. At 200% root
  text size with reduced motion, mobile overflow was `0` and `scroll-behavior`
  was `auto`.
- The live home, demo, and mobile demo had zero axe serious/critical findings.
  The page has `lang=en`, one `h1`, a `main`, image alt text, semantic controls,
  and a visible cobalt 3 px focus outline. Keyboard tests cover the extension
  skip link, Add cue, and Enter-to-save flow.
- A request log covering home, demo, save/reset, Start for real, and offline
  reload contained only `https://pronunciation-cue-reader.sociobot.in` URLs.
  It contained no tracker, analytics, third-party font, selected-text, or cue
  request. Extension claim tests likewise observed extension-local requests
  only.
- Live headers include a restrictive self-only CSP with response-header
  `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive
  Permissions-Policy. Hashed assets use one-year immutable caching.
- The live service worker controlled the page after reload. `registration.update()`
  left no waiting worker; a fresh offline reload retained the home heading with
  no errors.

The extension exercise covered the real job: it applies whole-word/phrase cues
to selected reading while keeping source text visible, previews an installed
voice, supports pause/resume/stop, and adds, edits, deletes, exports, imports,
and isolates per-site cues at the 20-cue boundary. It also covers malformed
input, oversized imports, expired selection cleanup, no broad host permissions,
and offline operation.

## Deployment identity

A fresh production build was compared with the live deployment. Every public
site file matched byte-for-byte: home, demo, legal pages, 404, all assets,
icons, manifest, robots, sitemap, and service worker. The live extension ZIP
had different ZIP metadata timestamps, but its extracted nine-file extension
tree matched the local artifact with `diff -ru`. The host correctly withholds
`staticwebapp.config.json` as a public resource (404); this is deployment
configuration rather than a site asset.

This static site and downloadable extension have no product backend API,
authentication, billing/unlock call, or sign-in flow. Rate-limit and Entra
tenant checks are therefore not applicable.

## Defects by severity

None. No release-blocking product, privacy, accessibility, performance, or
deployment defect was found.
