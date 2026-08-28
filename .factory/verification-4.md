# Independent product verification 4 — FAIL

- Verified: 2026-08-28 04:42 UTC
- Candidate: `53215b037c69974c9b5ab8c1a9c74c865675c2cb`
- Repository: `B-Divyesh/sf-pronunciation-cue-reader` / `main`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Acceptance source: supplied researched brief and work order; `.factory/brief.json`
  is absent, and `.factory/design.md` was reviewed.
- Result: **FAIL — do not release this candidate unchanged.** The advertised
  Plus purchase cannot be started, an opened extension panel has a serious
  dark-theme contrast failure, valid boundary data breaks the popup layout,
  and stale selected text is retained contrary to the published privacy claim.

## Clean checkout and local gates

The candidate was checked out detached into a new temporary worktree. All
commands below ran there with Node `v22.23.2` and npm `10.9.8`; product code was
not modified.

| Check | Fresh result |
| --- | --- |
| `npm ci` | Passed: 187 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | Passed: 1 file, 7/7 tests. The command generated WXT types from the clean checkout. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; this repository aliases lint to the typecheck. |
| `npm run build` | Passed. Produced `dist/extension`, `dist/site`, and `dist/site/downloads/say-it-right.zip`. |
| `npm run test:e2e` | Passed as declared: 14 passed, 4 intentional project skips. |
| Archive | Local and live ZIPs passed `unzip -t`; extracted live and local extension trees had no differences. |
| Worker URL verifier | `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title/lang/one `h1`/`main`/alt checks passed, 0 console errors. |

Build sizes are within the supplied budgets: extension total **36,164 B**;
initial site JS **2,737 B** (1,325 B gzip); CSS **13,888 B** (3,953 B
gzip); WebP hero **92,948 B**; JPEG fallback **203,964 B**; install ZIP
**21,354 B**. No font payload is shipped.

## Independent end-to-end exercise

A fresh Chromium extension profile covered the empty state and a representative
selection:

> `NASA uses Kubernetes near PostgreSQL. A second sentence verifies chunk progress.`

on `docs.example.org`. Saving `Kubernetes` as `koo-ber-net-ees` left the source
text unchanged, previewed only the replacement, and spoke
`NASA uses koo-ber-net-ees near PostgreSQL.`. The active chunk exposed
`aria-current="true"`; Pause called speech pause, Resume called resume, and Stop
cleared the current state. Normal glossary/reader use made no outbound request.

Keyboard-only Add cue and Save cue worked with visible focus. Edit, cancel,
delete-dismiss, delete-confirm, JSON export, persisted local storage, and the
free 20-cue/import restrictions worked. Invalid cases recovered: blank input
reported `Enter the word or phrase as it appears.`, a programmatically supplied
121-character term reported the documented length error, and malformed JSON
reported its parse error while leaving Add cue usable. A 120-character term is
accepted, which exposed defect 3 below.

An invalid license verification returned HTTP 200 with
`{"valid":false,"reason":"invalid","expires_at":null}`; the extension quietly
returned to the free state. The response used exact-origin CORS and
`Cache-Control: no-store`.

## Defects

### High — advertised Plus checkout returns 404

Both the live site and extension advertise a $12 one-time Plus purchase at:

`https://api.sociobot.in/api/v1/products/pronunciation-cue-reader/checkout`

A fresh GET, with and without the production `Origin`, returns HTTP **404** and:

```json
{"error":"enabled factory product","status":404}
```

It does not redirect to hosted checkout. Verification is registered enough for
invalid tokens to return the expected schema, but purchase is not enabled. A
user cannot buy the advertised unlock. Register/enable the production factory
product and verify the redirect and return-license path before release.

### High — opened extension Plus panel fails dark-theme contrast

At 390×844 with `prefers-color-scheme: dark`, opening **Backup and Plus** and
running axe produces a serious `color-contrast` violation on three elements:

- `Unlimited cues, on every site`
- `Have a license?`
- `Verify`

They render as `#20231f` on `#2d332e`, only **1.22:1**. The heading requires
3:1; the label and button require 4.5:1. This is a release blocker for a product
explicitly serving low-vision readers. Existing tests only axe the panel while
it is closed, so the hidden state masks the regression.

### Medium — valid maximum-length cue destroys the 390 px popup layout

The form permits a 120-character term and 180-character spoken form, but cue
rows do not wrap unbroken strings. Saving 120 `X` characters with 180 `Y`
characters increased `scrollWidth - clientWidth` to **1,206 px** in the
390 px popup. The row actions moved roughly 1,600 px from the left edge, forcing
horizontal scrolling and making ordinary controls difficult to find. Add
wrapping/containment and regression coverage for the documented limits.

### Medium — expired selected passage remains indefinitely in local storage

The context-menu path writes selected text (up to 12,000 characters) to
`chrome.storage.local.pendingSelection`. The popup consumes and removes it only
when it is younger than ten minutes. When a pending selection was seeded at 11
minutes old and the popup was opened, the reader correctly ignored it but the
full text, URL, timestamp, and `openCueForm` flag remained in extension storage.

This can happen when `chrome.action.openPopup()` is unsupported or the user does
not reopen the popup within ten minutes. It contradicts `/privacy/`, which says
the product “does not store selected passages.” Delete expired pending data
before falling back to the active selection and add an expiry regression test.

### Medium — extension navigation targets remain below 44 px

In the 390 px popup the Say It Right website link measured **24 px** high and
the Privacy link **18 px** high, below the 44×44 touch-target contract. Core
buttons repaired in earlier work (Add, Export, Edit, Delete) now meet 44 px, and
the live site's visible navigation/footer targets also pass. Extend the popup
target-size fix to its remaining interactive links.

## Accessibility, responsive, and performance evidence

- The live home, privacy, and terms pages were checked at 1440×900 and 390×844
  in both light and dark schemes: 12 axe runs had zero serious/critical findings,
  no console/page/request errors, no horizontal overflow, one `h1`, one `main`,
  `lang="en"`, titles, and no missing image alt text.
- After keyboard timing settled, the skip link was first focus and visibly
  outlined at 3 px cobalt in both themes. Reduced motion changed smooth scrolling
  to `auto`. A 200% root-text smoke test kept the mobile page visible without
  horizontal overflow.
- The live site's visible 390 px interactive targets met 44 px. The extension
  target exceptions and boundary overflow are reported above.
- Fresh mobile Lighthouse: performance **1.00**, accessibility **1.00**, best
  practices **1.00**, SEO **1.00**; FCP **963 ms**, LCP **1,168 ms**, TBT
  **32.5 ms**, CLS **0**, total transfer **104,089 B**.

## Privacy, permissions, requests, and policies

- The MV3 manifest requests only `activeTab`, `storage`, `contextMenus`, and
  `scripting`; it has no host permissions or content scripts.
- A normal live load contacted only
  `https://pronunciation-cue-reader.sociobot.in`. No third-party fonts, scripts,
  analytics, tracking, or reader/glossary network transmission was observed.
  Source inspection found the explicit license verify call as the only product
  API request.
- Live HTML sends CSP, Permissions-Policy, HSTS, strict referrer policy, and
  `nosniff`. The web manifest is `application/manifest+json`; the download is
  `application/zip`; hashed assets use
  `Cache-Control: public, max-age=31536000, immutable`.
- Privacy and terms pages are present and linked. README, MIT LICENSE, and the
  product-specific visual thesis are present. `.factory/brief.json` is absent.

## Live identity, download, and PWA

Production matches the candidate build for the deployable product. Exact local
and live SHA-256 values include:

- HTML: `62409ccc9947eaf57cd3c28950bd6ede39f1f77fe5ff578b2110086440a848d6`
- JS: `7c44aa4edcf5344d6cf545ec6a0906f0f1255357c7d4746e6756442361e0320f`
- CSS: `0f728327f81a66e8f1ed7d8c2336ba92a19ba8e678e1d44d293b86b00c21d70e`
- Service worker: `19627563474d1371b3c7fc8802e735ede06928ab6781ce0f0c6d3291b790fc28`

The rebuilt and deployed ZIP containers differ only in ZIP metadata; both are
21,354 B, and `diff -rq` of their extracted extension files was empty. The live
ZIP is a valid archive and no longer has the earlier HTML-rewrite deployment
failure.

In a fresh live profile, the service worker controlled after reload,
`registration.update()` produced no waiting worker, and the versioned cache
contained HTML, legal pages, hashed JS/CSS, both hero formats, icon, and manifest.
The first offline reload rendered the `h1` and offline banner with no console or
page errors.

## Required retest

1. Enable the production checkout and prove the buy link redirects to hosted
   checkout rather than returning 404.
2. Correct the opened extension panel's dark colors and axe that visible state
   in light and dark modes.
3. Contain maximum-length cue rows and make all popup navigation targets at
   least 44 px at 390 px.
4. Remove expired `pendingSelection` data and verify selected text does not
   remain after expiry.
5. Re-run all clean gates, extension boundary/privacy flows, live identity,
   offline update/reload, both themes/viewports, and the production checkout
   before changing the verdict.
