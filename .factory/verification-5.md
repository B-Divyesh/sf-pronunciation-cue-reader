# Independent verification 5 — FAIL

- Verified: 2026-08-30 UTC
- Candidate: `d913a4c3ea759c25726512c90ad93822a81a87a5`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Verdict: **FAIL — do not release.** The deployed artifact is healthy in many
  respects, but it fails the mandatory demo/first-read contract and falsely
  promises a per-site 20-cue glossary.

## Mandatory first-read and demo check

I opened the live home page cold in a fresh Chromium profile. It says it reads
selected text aloud with saved pronunciation cues. It does **not** say that it
is for dyslexic, low-vision, or language-learning readers (or otherwise name a
specific reader). The first action is **Download for Chrome**, not a one-click
sample. There is no `Try it with sample data` action, demo banner, Reset demo,
or Start for real control.

`/demo` and `/?demo=1` both return the normal 7,562-byte landing page; neither
contains “demo” or “sample data”. `.factory/demo.md` is absent. This is an
explicit candidate-fail condition in the supplied demo-sandbox and plain-words
contract. The current extension tests seed storage directly, rather than
exercising a shipped, isolated demo entry point.

## Release-blocking defects

### Critical — no one-click isolated sample demo; first screen omits the target reader

Evidence above. A visitor must download, unzip, enable developer mode, and
load an extension before seeing the product work. That is not a safe one-click
try-out and cannot meet the required demo-sandbox acceptance test.

### High — the 20-cue limit is global, not per site

The landing page says “20 cues per site”; the README says “20 site cues per
website”; and Terms says a user can “create separate cues for another site.”
In a fresh unpacked production extension profile I seeded 20 valid cues for
`one.example`, then handed the popup a selected passage from `two.example`.
The popup correctly showed zero cues for `two.example`, but saving its first
cue failed with:

> This site glossary holds 20 cues. Export a backup, delete a cue, or save the
> cue on another site.

`chrome.storage.local` still contained 20 cues and zero for `two.example`.
`saveCue` and `mergeImportedCues` compare the total cue collection to 20,
rather than the collection for the current site. This contradicts the core
per-site glossary job and the published limit.

### High — published claims are not all registered and testable

`.factory/claims.json` contains four claims, but the landing page and README
also make unregistered claims including “The page is never rewritten,” “Say It
Right never scrapes the full document,” “Every action is reachable without a
pointer,” “Backup is an explicit JSON export you control,” and support for
200% text zoom, dark mode, and reduced motion. These must each have an
observable `@claim:` demo-entry test or be removed, per the claims contract.
The existing per-site-limit claim also does not assert the advertised
per-website boundary and therefore missed the defect above.

### Medium — no real 404 page

`https://pronunciation-cue-reader.sociobot.in/404.html` returns HTTP 200 and
the normal landing page (7,562 bytes). The site has no designed real 404 route
or response override as required by the site structure contract.

## Required claims, clean local checks, and extension exercise

The first claim command before installing dependencies could not resolve
`@playwright/test`, as expected in a bare clone. After `npm ci` (187 packages,
0 audit vulnerabilities), I ran every exact command in `.factory/claims.json`:

| Claim | Exact command | Result |
| --- | --- | --- |
| site-cue-limit | `npm run test:e2e -- --grep @claim:site-cue-limit` | passed (1 desktop pass; expected mobile project skip) |
| local-reader-data | `npm run test:e2e -- --grep @claim:local-reader-data` | passed (1 desktop pass; expected mobile project skip) |
| pending-selection-expiry | `npm run test:e2e -- --grep @claim:pending-selection-expiry` | passed (1 desktop pass; expected mobile project skip) |
| site-no-trackers | `npm run test:e2e -- --grep @claim:site-no-trackers` | passed (2 projects) |

Further clean checks passed:

- `npm test`: 7/7 passed.
- `npm run typecheck` and `npm run lint`: passed.
- `npm run build`: passed; produced `dist/extension`, `dist/site`, and
  `dist/site/downloads/say-it-right.zip`.
- `npm run test:e2e`: 20 passed, 8 intentional project skips.
- `unzip -t dist/site/downloads/say-it-right.zip` and `git diff --check`:
  passed.

Independent unpacked-extension exercise used the production `dist/extension`:

- A selected `PostgreSQL works with Kubernetes.` passage displayed unchanged;
  after saving `PostgreSQL → post-gress cue ell`, its chunk exposed `Will be
  spoken as: post-gress cue ell works with Kubernetes.`
- Empty spoken-form validation was actionable. A malformed JSON import stayed
  recoverable and reported the JSON parse error. No page errors occurred.
- Existing browser tests also passed the read/pause/resume/stop flow, import
  boundary, stale-selection expiry, keyboard smoke test, desktop and 390 px
  axe checks, and touch-target checks.

## Live deployment, privacy, accessibility, and performance evidence

The live deployment otherwise matches the candidate:

- Live HTML SHA-256 equals local `dist/site/index.html`:
  `76bbf68b82ae5df3d14323c8c8236c42377af6b0249464e188aaffd61e7437aa`.
  Live JS, CSS, and hero WebP hashes matched local assets. The live ZIP passed
  `unzip -t`; its ZIP byte hash differs from a locally rebuilt ZIP due to ZIP
  metadata, but extracting it produced no file differences from
  `dist/extension`.
- Fresh desktop and 390x844 light/dark Chromium checks found zero page/console
  errors, zero serious/critical axe findings, no horizontal overflow (including
  at 200% text size), reduced-motion transition duration `0.00001s`, and a
  visible 3px cobalt skip-link focus ring as the first tab stop.
- Outgoing-request logging during the whole live landing flow found only
  `https://pronunciation-cue-reader.sociobot.in`; no third-party fonts,
  scripts, analytics, or trackers loaded. The extension manifest is limited to
  `activeTab`, `storage`, `contextMenus`, and `scripting`.
- Live response headers include CSP (`connect-src 'self'`),
  Permissions-Policy, HSTS, strict referrer policy, and `nosniff`. Hashed JS
  has `Cache-Control: public, max-age=31536000, immutable`; the ZIP is served
  as `application/zip`.
- In a fresh live service-worker profile, a controlled offline reload returned
  200, rendered the h1, had no errors, and `registration.update()` left no
  waiting worker.
- Current initial JS is 990 B (525 B gzip), CSS is 13,888 B (3,942 B gzip),
  hero WebP is 92,948 B, and the extension payload totals 33,180 B: all within
  the stated transfer budgets.

There are no product server-side endpoints or sign-in flow, so rate-limit and
Entra tenant checks are not applicable.

## Release retest

1. Add `/demo` (or `?demo=1`) with realistic sample text/cues in a separate
   storage namespace, visible first-screen `Try it with sample data`, persistent
   demo/reset/start-real controls, `.factory/demo.md`, and claim tests that use
   that entry point.
2. Enforce the 20-cue cap per normalized site in manual saves and imports; add
   a regression with 20 cues on one site plus a successful cue on another.
3. Register every remaining user-facing claim with a tagged observable test or
   remove the claim; make the site-limit claim assert the actual per-site
   promise.
4. Ship a real styled 404 response and retest the live URL, all claim commands,
   and the multi-site boundary.
