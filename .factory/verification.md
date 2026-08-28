# Independent verification — FAIL

- Verified: 2026-08-28 01:23 UTC
- Candidate: `3861ff25b3c9f004ef2654d54e0f08690f493af8`
- Repository: `B-Divyesh/sf-pronunciation-cue-reader`, clean checkout of `main`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Result: **FAIL — do not release this candidate.** The deployed product cannot
  deliver the extension, and there are additional quality, paid-feature, offline,
  mobile-accessibility, and caching defects below.

## Commands and build evidence

| Check | Fresh result |
| --- | --- |
| `npm ci` | Passed; 187 packages installed, `npm audit` reported 0 vulnerabilities. |
| `npm test` immediately after `npm ci` | **Failed.** Vitest cannot resolve `./.wxt/tsconfig.json` from `tsconfig.json`; the documented test command is not self-contained from a clean checkout. |
| `npm run typecheck` | Passed. It first runs `wxt prepare`, which generates the missing config. |
| `npm test` after the typecheck preparation | Passed: 5/5 unit tests. This does not cure the clean-command failure above. |
| `npm run build` | Passed. Produced `dist/extension`, `dist/site`, and `dist/site/downloads/say-it-right.zip`. |
| `npm run test:e2e` | Passed: 7 passed, 1 intentional mobile extension skip. Desktop and 390 px site checks ran. |
| Lint | No lint script or lint configuration is provided. |

The local packaged ZIP is valid (`unzip -t` passed) and is 21,048 bytes. The
extension production payload is 35.25 KB (popup JS 10,620 B; CSS 7,172 B); the
site initial JS is 2,737 B and CSS is 13,674 B, within the stated transfer-size
budgets.

## Product and browser exercise

Using Chromium with the production unpacked extension, I exercised the empty
state, a representative selected passage (`Kubernetes … PostgreSQL`), a
site-scoped cue, source-preserving spoken replacement, blank-form validation,
malformed-JSON import recovery, keyboard form entry/save, and a 390 px popup.
The cue was displayed as source text while its chunk exposed the intended spoken
replacement. The empty state and error messages were actionable. No page errors
or console errors occurred in these flows.

Keyboard smoke test: a visible `rgb(37, 71, 184) solid 3px` focus outline was
present; Enter opened Add cue, focus moved to the term field, Tab reached Save
cue, and Enter saved it. The 390 px popup had no horizontal overflow.

Desktop and 390 px axe runs found **zero serious or critical violations** on the
site and extension popup. The live and local landing pages have a title,
`lang`, one `h1`, and `main`; the skip link receives first focus. Reduced motion
sets site scroll behavior to `auto` and reduces transition durations.

## Privacy, permissions, and outbound requests

- The MV3 manifest requests only `activeTab`, `storage`, `contextMenus`, and
  `scripting`; it has no broad host permission.
- A normal local/live landing load requested only same-origin HTML, CSS, JS,
  icon, and hero WebP. There are no loaded third-party fonts, scripts,
  analytics, or tracking requests.
- Source inspection and exercised behavior keep cues in `chrome.storage.local`;
  selected text is used for the session flow and no selected text/cues were
  observed leaving the extension. The only product-origin API is the explicit
  Sociobot license verification/checkout URL. An invalid verification request
  returned `200 {"valid":false,"reason":"invalid"}` with the expected CORS
  origin and `Cache-Control: no-store`.

## Live deployment comparison and response policy

The live `/` body SHA-256 is exactly the candidate `dist/site/index.html`:
`98a3f7b1d80a71474f9aa5cca9606cad675cccbf0ff2d899391dac3991414a00`.
The live page references the same `site-Da3mnjmx.js` and `site-BNA78f_q.css`
assets. The page loads without console/page errors and has no serious/critical
axe findings at 390 px.

However, the deployment does **not** match the candidate's downloadable product:

- Local `dist/site/downloads/say-it-right.zip`: 21,048 bytes, SHA-256
  `5522d7b510b52b7309280644acc95e05f01e5a941e0b3ee62680718c6268d2f1`, valid ZIP.
- Live `/downloads/say-it-right.zip`: HTTP 200 `text/html`, 9,422 bytes,
  SHA-256 equal to the landing index. `unzip -t` reports no end-of-central-directory
  signature. Both primary download CTAs therefore download HTML named `.zip`,
  leaving a user unable to install the browser extension.

Positive live headers include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`,
and `X-Content-Type-Options: nosniff`. The site does not send a CSP or
Permissions-Policy. `manifest.webmanifest` is served as `application/octet-stream`.
All HTML, hashed JS/CSS, service-worker, and WebP responses use only
`Cache-Control: public, must-revalidate, max-age=30`, rather than immutable,
long-lived caching for hashed assets.

## PWA/offline check

On a clean local profile, the service worker installed and cached only `/`,
`/privacy/`, `/terms/`, icons/manifest, and the hero image. It does not precache
the hashed JS/CSS. On the first offline reload after installation, the page shell
returned 200 but the service worker returned HTML for the module request, causing:

> Failed to load module script: Expected a JavaScript-or-Wasm module script but
> the server responded with a MIME type of "text/html".

The script does not run, so the intended offline notice is also not updated.
This fails offline reload for the PWA companion site.

## Defects

### Critical

1. **Live installation package is missing / rewritten to HTML.**
   `https://pronunciation-cue-reader.sociobot.in/downloads/say-it-right.zip`
   is not a ZIP. This is the only advertised installation path for the browser
   extension, so the real job cannot be started on the live deployment.
   Deploy `dist/site/downloads/say-it-right.zip` as a static binary and verify
   its content type/archive integrity after deploy.

### High

1. **Clean documented unit-test command fails.** `npm ci && npm test` fails
   before discovering any tests because WXT's generated TS config is absent.
   Make the test command prepare WXT types (or make the test tsconfig independent)
   so `npm test` itself passes from a clean checkout.

2. **Plus restrictions are bypassable through import.** In an unlicensed
   profile I saved one normal cue, imported a valid JSON array of 21 more cues
   including one `scope: "everywhere"`, and observed 22 stored cues plus the
   global cue while `state.plus` remained false/no Plus status was shown.
   Import bypasses both the advertised 20-cue limit and the every-site paid
   scope. Enforce entitlement and the free limit during import, with a clear
   partial-import/error result.

### Medium

1. **Fresh offline reload breaks JS/CSS.** The service worker does not precache
   the generated JS/CSS and falls back to `/` for failed asset requests, returning
   HTML as a module. Precache the shell assets or return only an appropriate
   navigation fallback; test first offline reload in a clean profile.

2. **Visible 390 px controls miss the 44 px touch-target contract.** On the
   landing page, the brand/footer links measured 29/23 px high and the visible
   Download link 41 px high. In the extension, Add cue/Export and Edit/Delete
   controls measured 40 px high. Increase hit areas while retaining the visual
   design.

3. **Live hashed assets are not immutable cached.** Their 30-second cache policy
   fails the stated long-lived immutable caching expectation and gives away the
   benefit of hashed file names. Configure static asset caching at deployment.

### Low

1. **Defense-in-depth response policies are incomplete.** Live pages have no
   CSP or Permissions-Policy, and the web manifest is served as generic octet
   stream. These did not cause current browser errors, but should be corrected
   in the deployment policy.

## Required release retest

1. Repair the static deployment so the live ZIP has ZIP bytes and validates
   with `unzip -t`.
2. Make `npm test` self-contained, enforce Plus import constraints, and repair
   offline asset caching/navigation fallback.
3. Re-run from a clean checkout: `npm ci`, `npm test`, `npm run typecheck`,
   `npm run build`, and `npm run test:e2e`.
4. Re-test live desktop/390 px download, headers/cache policy, fresh-profile
   offline reload, and the unlicensed import boundary before changing the verdict.
