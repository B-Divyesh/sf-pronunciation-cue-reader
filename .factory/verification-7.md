# Independent product verification 7 — FAIL

- Verified: 2026-08-30 UTC
- Candidate: `c16c820d288eb0828721ae843824d1e1e7d7f965`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Verdict: **FAIL — do not release unchanged.** The deployed candidate is
  functional, accessible, private, and byte-identical to this commit, but it
  violates the mandatory claims contract by publishing a testable capability
  with no corresponding claim entry and tagged sandbox test.

## Mandatory first read and sample demo

I opened the live home page in a fresh Chromium context at 1440 px before
using it. It says: **“Read selected text with pronunciation cues.”** It names
“dyslexic, low-vision, and language-learning readers” and makes **“Try it with
sample data”** the primary action. That action opens `/demo/` in one click.
The page therefore answers what it does, who it is for, and what to click
first in plain words.

At both 1440 px and 390 px, the demo opened with realistic Kubernetes,
PostgreSQL, and NASA cues. It saved `OpenTelemetry → open tell emetry`, used
only `demo:pronunciation-cue-reader:cues` in localStorage, had no horizontal
overflow, and made only same-origin requests. Empty submission showed the
actionable error “Enter the word or phrase as it appears.” The demo preserves
visible source text while exposing distinct spoken values; for example,
`PostgreSQL` stays visible while its spoken value is `post-gress cue ell`.

## Required claims tests

After a clean `npm ci` (187 packages; 0 vulnerabilities), I ran every exact
command in `.factory/claims.json` individually. All completed successfully;
the subsequent full Playwright run recorded `{"status":"passed","failedTests":[]}`
in `test-results/.last-run.json`.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `site-cue-limit` | PASS |
| `local-reader-data` | PASS |
| `selected-reading` | PASS |
| `source-preserving` | PASS |
| `backup-export` | PASS |
| `keyboard-reader` | PASS |
| `reader-accessibility` | PASS |
| `pending-selection-expiry` | PASS |
| `site-no-trackers` | PASS |
| `no-account-demo` | PASS |
| `installed-voice-preview` | PASS |
| `installed-extension-offline` | PASS |
| `extension-entry-points` | PASS |
| `per-site-local-glossary` | PASS |
| `cue-lifecycle` | PASS |

## Clean local quality gates

- `npm test`: **8/8 passed**.
- `npm run typecheck`: passed.
- `npm run lint`: passed (delegates to typecheck).
- `npm run build`: passed; produced `dist/site`, `dist/extension`, and the
  downloadable ZIP. `unzip -t dist/site/downloads/say-it-right.zip` passed.
- `npm run test:e2e`: **50 tests**, passed (`failedTests: []`). This exercises
  the installed extension through normal reading, add/edit/delete/preview,
  pause/resume/stop, keyboard flow, per-site 20-cue boundary, invalid input,
  import-limit recovery, export, selection expiry, shortcut/context-menu
  entry, offline use, desktop and 390 px layouts.
- Build sizes: initial site JS 316 B (220 B gzip), main CSS 13,773 B (3,930 B
  gzip), demo JS 3,488 B (1,650 B gzip), hero WebP 92,948 B, and unpacked
  extension 33,600 B. These are within the stated static-product budgets.

## Live product, privacy, accessibility, and deployment evidence

- Fresh live desktop and 390 px demo checks: one h1 per page, semantic
  landmarks, keyboard skip link, visible 3 px focus ring, reduced-motion
  `scroll-behavior: auto`, no overflow, and no page/console errors on normal
  home, demo, or legal-page loads.
- Axe Playwright checks found **zero serious or critical violations** on live
  home (light and dark), demo (desktop and 390 px), privacy, terms, and 404.
- Cold-home and interactive-demo request logs contained only the product
  origin. No tracker, analytics, third-party font/script, selected text, or
  saved cue request was observed. The extension manifest has only
  `activeTab`, `storage`, `contextMenus`, and `scripting` permissions; it has
  no host permissions.
- Live headers include CSP with `connect-src 'self'` and response-header
  `frame-ancestors 'none'`, HSTS, `strict-origin-when-cross-origin`,
  `nosniff`, and restrictive Permissions-Policy. Hashed CSS has
  `Cache-Control: public, max-age=31536000, immutable`; ZIP downloads use one
  hour caching. An unknown route returns a styled HTTP 404.
- A new live PWA profile became service-worker controlled after reload,
  `registration.update()` had no waiting worker, and an offline reload still
  rendered the home h1.
- Candidate/deployment identity is confirmed: locally rebuilt and live SHA-256
  values are equal for home
  (`54189ea3c9c8d732b3483d8d36d4a4b5652f00613383dfdaf74a8c3002fad828`),
  demo (`0b6a526ae312c5aa7cba2095ac20d0f9fcfb804d9216666ad5411a15399cebfd`),
  privacy (`f5604d32fb6e942960713fd2f037901d37e68a452afdf1edf832b5abab709aa1`),
  and terms (`606d4705446f88fb77d5d63ffcdfd0b886b7aae91e62d6018ee627a84cd7aa6f`).

No server-side API is part of this product, and there is no sign-in flow;
rate-limit and Entra-tenant checks do not apply.

## Defects

### High — the README makes an unregistered, unproven import claim

`README.md` states: **“Exports a JSON backup when you request it and imports
portable backups.”** `.factory/claims.json` has `backup-export`, which proves
only a user-requested export. Although the `site-cue-limit` test happens to
upload a fixture to reach a limit boundary, there is no claim entry that says
portable backups import and no `@claim:<id>` test whose observable purpose is
to prove that visitor-facing promise. This violates the supplied claims
contract: every claim needs a claims entry and exactly one tagged sandbox test;
an unlisted claim fails review.

The same README also makes a separate security/capability promise that the
extension has no broad host permission and cannot read page content without a
direct selection or explicit action. It is not represented by a claims entry
either. The manifest is favorable in this candidate, but it does not cure the
missing contract coverage.

## Required release retest

1. Add a claim entry and one tagged sandbox test for successful portable JSON
   import (including the observable imported cue/storage result), or remove
   that promise from the README.
2. Add a claim and observable test for the stated host-permission/page-access
   boundary, or remove/reword that promise.
3. Re-run every declared claim command from a clean clone, the full quality
   gates, and this live identity/privacy check.
