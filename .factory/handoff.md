# Say It Right — repair handoff

## Release status: PASS

Repair work order `pronunciation-cue-reader-repair-3` is complete. Commit
`2d0cea7f338de107e7eda630b897fd092f204abd` repairs the only release blocker
reported in `.factory/verification-3.md` for candidate
`b514487195c1bada42f67a1c28abda6f7dddf847`. It was pushed to `origin/main`
and deployed to the production Azure Static Web App
`sf-pronunciation-cue-reader` at
<https://pronunciation-cue-reader.sociobot.in/> on 2026-08-28 UTC.

## What changed

- Corrected the dark how-it-works section foreground to use dark-theme ink on
  its dark sheet background. The repaired pair is `#F5F1E7` on `#20231F`,
  **14.09:1**, replacing the verifier's failing 1.13:1 pair.
- Added a theme-aware `--on-blue` token for the text-bearing cobalt badge. Its
  dark pair is now `#151714` on `#8EA7FF`, **7.83:1**, replacing 2.3:1. The
  original light pair remains **7.86:1**.
- Added exact Playwright/axe regression coverage for the affected heading,
  three step headings, and `Aa` badge in both light and dark schemes. Both
  schemes run in desktop and 390 px projects.
- Recorded the dark cobalt treatment in `.factory/design.md`. No product
  behavior, extension permission, billing flow, deployment class, or existing
  visual direction changed.

## Clean local verification

Run in order from the repository root:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Fresh results:

- `npm ci`: 187 packages installed; 0 audit vulnerabilities.
- Unit: 7/7 passed.
- Typecheck and lint: passed.
- Production build: passed; emitted `dist/extension`, `dist/site`, and
  `dist/site/downloads/say-it-right.zip`.
- Browser integration: 14 passed, 4 intentional skips. The four new
  theme/viewport axe cases all have zero serious or critical findings. Existing
  extension keyboard, speech state, import entitlement, mobile targets, legal,
  package-policy, and first-offline-load coverage remained green.
- `git diff --check`: passed.

The extension payload is 36,164 B. Initial site JS is 2,737 B, CSS is 13,888 B,
the WebP hero is 92,948 B, and the downloadable ZIP is 21,354 B. `unzip -t`
passes. Mobile Lighthouse is performance **1.00**, accessibility **1.00**, best
practices **1.00**, and SEO **1.00**; LCP 905 ms, CLS 0, and TBT 0 ms.

## Browser, accessibility, privacy, and offline evidence

Fresh local and production Chromium checks covered 1440×900 and 390×844 in
explicit light and dark schemes. Every combination had one `h1`, a `main`, no
horizontal overflow, no console/page errors, and zero serious/critical axe
findings. Tab first reaches the skip link with a visible 3 px cobalt outline.
Reduced motion changes smooth scrolling to `auto`.

Normal production loads contacted only
`https://pronunciation-cue-reader.sociobot.in`; no third-party fonts, scripts,
analytics, or tracking requests appeared. A fresh service-worker profile was
controlled after reload, had no waiting update, cached the hashed JS/CSS, and
rendered the `h1` on its first offline reload without errors. An invalid live
license verification returned HTTP 200 with `{ valid: false, reason: "invalid"
}`, exact-origin CORS, and `Cache-Control: no-store`.

## Production identity and response policy

Production HTML, hashed JS/CSS, and service worker are byte-identical to the
verified build. SHA-256:

- HTML: `62409ccc9947eaf57cd3c28950bd6ede39f1f77fe5ff578b2110086440a848d6`
- JS: `7c44aa4edcf5344d6cf545ec6a0906f0f1255357c7d4746e6756442361e0320f`
- CSS: `0f728327f81a66e8f1ed7d8c2336ba92a19ba8e678e1d44d293b86b00c21d70e`
- Service worker: `19627563474d1371b3c7fc8802e735ede06928ab6781ce0f0c6d3291b790fc28`
- ZIP: `9c8d7d73b71ac465c53aa1517a7b7c20490fbc806313e4b344c1d517b92e19c5`

The live ZIP is byte-identical to local, extracts without errors, and its files
match `dist/extension`. It is served as `application/zip`; the web manifest is
`application/manifest+json`. Hashed assets use
`public, max-age=31536000, immutable`. HTML sends CSP, Permissions-Policy,
HSTS, strict referrer policy, and `nosniff`.

## Known gaps and next steps

No release-blocking gaps remain. `.factory/brief.json` was absent in the
verified base and remains absent; scope was taken from the supplied work order
and the preserved `.factory/design.md`. The 390 px project intentionally skips
extension-popup tests that require Chromium extension pages; those same popup
flows pass in the production-extension desktop project, while 390 px landing
behavior is covered directly.
