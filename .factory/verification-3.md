# Independent product verification — FAIL

- Verified: 2026-08-28 UTC (fresh evidence)
- Candidate: `b514487195c1bada42f67a1c28abda6f7dddf847`
- Repository: `B-Divyesh/sf-pronunciation-cue-reader` / `main`; worktree was clean before verification.
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Acceptance source: supplied researched brief. `.factory/brief.json` is absent; `.factory/design.md` was reviewed.
- Result: **FAIL — do not release unchanged.** The live landing page has a serious axe color-contrast failure in its dark treatment.

## Local gates

| Check | Fresh result |
| --- | --- |
| `npm ci` | Passed: 187 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | Passed: 7/7 unit tests. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; invokes the typecheck. |
| `npm run build` | Passed. `dist/extension`, `dist/site`, and the install ZIP were produced. |
| Browser integration | All declared tests completed by project: desktop site 5 passed/1 intentional skip; desktop extension 2 passed; 390px site 5 passed/1 intentional skip; 390px extension 2 intentional skips. Total: **12 passed, 4 intentional skips**. |
| Package delivery | Local and live `say-it-right.zip` passed `unzip -t`; `diff -r` of extracted extension files was empty. |

Extension payload: 36.16 KB. Initial site JS: 2,737 B; CSS: 13,789 B; WebP hero: 92,948 B (JPEG fallback: 203,964 B), all within the supplied transfer budgets.

## Product exercise

An independent production-extension Chromium run seeded the short-lived selection payload used by the context-menu flow: `NASA uses Kubernetes near PostgreSQL.` on `docs.example.org`.

- Saving `Kubernetes → koo-ber-net-ees` retained the source text and spoke `NASA uses koo-ber-net-ees near PostgreSQL.` using a controlled installed-voice substitute. The cue persisted only in `chrome.storage.local` as site scope `docs.example.org`; the current chunk exposed `aria-current="true"`.
- Preview spoke the replacement. Pause, Resume, Stop, current-state clearing, keyboard Add cue/Save, and focus flow passed extension browser tests.
- Blank spoken form produced an actionable error. A programmatically supplied 121-character term produced the documented validation error. Malformed JSON import reported its parse error and the Add-cue form was usable afterwards.
- The integration suite verified free-tier recovery: a 21-cue backup plus one every-site cue is capped at 20, rejects the global cue, and reports the partial import. Export remains available.

No extension page or console errors occurred.

## Accessibility, responsive, and performance evidence

- Light-theme axe had **zero serious/critical findings** for the local extension popup and live landing page at desktop and 390px, plus live `/privacy/` and `/terms/` at 390px. Extension dark-theme axe also had zero serious/critical findings.
- Desktop and 390px live checks found `lang="en"`, title, one `h1`, `main`, image alt text, no horizontal overflow, and no page/console errors. Keyboard Tab reaches a visible cobalt `rgb(37, 71, 184) solid 3px` focus outline. Mobile nav/footer targets met 44px. Reduced motion yielded `scroll-behavior: auto` and `0.00001s` transition duration.
- A fresh service-worker profile controlled after reload. `registration.update()` left no waiting worker; its cache contained shell, hashed JS/CSS, images, manifest, and legal pages. Offline reload rendered the `h1` with no errors.
- Fresh mobile Lighthouse (light/default scheme): performance **1.00**, accessibility **1.00**, best practices **1.00**, SEO **1.00**; LCP 906 ms, CLS 0, TBT 49.5 ms. The default scheme does not replace the explicit dark-mode axe check below.

## Defects

### High — dark-mode landing page fails the mandatory contrast baseline

At 390px with `prefers-color-scheme: dark`, fresh live axe reports serious `color-contrast`. It is in the candidate: live CSS exactly hashes to `dist/site/assets/site-BjRZuBQ8.css` (`455dbb1e88d9871b032faf7796ed72b0ecd9b550a74af86a44dbddeb1f8ed451`).

Affected elements include `#how-title` (“Listen without leaving the page.”) and `Select`, `Teach once`, and `Read clearly`: foreground `#151714` on `#20231f`, contrast **1.13:1** where large text needs 3:1. The decorative `Aa` line icon is white on `#8ea7ff`, **2.3:1** where 4.5:1 is required. This violates the documented dark treatment, accessibility contract, and requested zero serious/critical axe outcome. Correct the dark rules/tokens and retest both themes at 390px and desktop.

## Privacy, live identity, and response policy

- The MV3 manifest uses `activeTab`, `storage`, `contextMenus`, and `scripting`; it has no host permissions or content scripts. Normal reader/glossary operation made no network request and uses extension-local storage. The only configured external connection is the explicit Sociobot license endpoint.
- Fresh desktop and 390px captures made five requests each, all to `https://pronunciation-cue-reader.sociobot.in`; no third-party scripts, fonts, analytics, tracking, console errors, or page errors were observed.
- Live `index.html` equals the candidate: `c7fe57f912ea17f33853bc0745d35635ea17fcb5467d17311f82934e7f4015b0`. Live `sw.js` equals the build: `46f9c03a5a013d204e87c6b615c6e42a88d5a6472bc70815f5dbece81363f6ac`. Live hashed JS/CSS and extracted ZIP contents match the build. ZIP container bytes differ only in ZIP metadata.
- Live HTML sends CSP, `Permissions-Policy`, HSTS, strict referrer policy, and `nosniff`. Hashed JS/CSS are `public, max-age=31536000, immutable`; manifest is `application/manifest+json`; download is `application/zip`.

## Required release retest

1. Repair dark-theme contrast for the affected section headings and line icon without regressing the documented palette.
2. Re-run axe in **both light and dark** schemes at desktop and 390px, plus the local build/test suite and live artifact comparison.
