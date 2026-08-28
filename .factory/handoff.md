# Say It Right — build handoff

- Date: 2026-08-28
- Work order: `pronunciation-cue-reader-build-1`
- Deploy root: `dist/site`
- Canonical build: `npm run build`

## Shipped

- WXT/TypeScript Manifest V3 extension with no broad host permission. It reads
  only a user-invoked selection via `activeTab`, or a selection supplied through
  its context-menu action.
- Selected-text speech using installed browser voices, visible sequential chunk
  highlighting, pause/stop, voice selection, and actionable empty/error states.
- Local per-site pronunciation glossary with add, edit, delete, phonetic preview,
  longest-phrase-first replacement, JSON import/export, and a clear warning that
  IPA realization depends on the installed voice.
- $12 one-time Plus license flow through the Sociobot API. The free tier keeps
  selected reading, 20 site cues, and import/export; Plus adds unlimited and
  every-site cues. Checkout return tokens are stored locally and stripped from
  the URL; verification is cached for one day and reconciled in the background.
- Responsive product site, privacy page, terms page, offline notice, service
  worker shell cache, install guide, and downloadable extension zip at
  `dist/site/downloads/say-it-right.zip`.
- Original generative-geometry hero, source and prompt provenance under
  `assets/src/`, plus a 91 KB WebP and 200 KB JPEG fallback. The art was visually
  reviewed and is disclosed in the footer.
- Product-specific light/dark design system and reduced-motion treatment recorded
  in `.factory/design.md`.

## Verification

- `npm test` — 5 unit tests passed.
- `npm run typecheck` — passed with TypeScript strict mode.
- `npm run build` — passed; creates `dist/extension`, `dist/site`, and the zip.
- `npm run test:e2e` — 7 passed, 1 intentional duplicate skip. Covers desktop,
  390 px mobile, legal routes, checkout-return handling, axe serious/critical
  violations, console errors, and an installed-extension add/save cue flow.
- `npm audit` — 0 vulnerabilities.
- Extension production payload: 35.25 KB total; popup JavaScript 10.62 KB and CSS
  7.17 KB, under the 200 KB/50 KB budgets.
- Landing initial JavaScript: 2.74 KB; CSS: 13.67 KB; hero WebP: 92.95 KB.
- Lighthouse 12.5.1 mobile simulation against the production build:
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s,
  LCP 0.9 s, TBT 0 ms, CLS 0.
- Manual visual review completed at 1440 px and 390 px in Chromium. One `<h1>`,
  `<main>`, language, title, alt text, focus treatment, contrast, and reduced
  motion are present on each applicable page.

## Known gaps / release steps

- Chrome Web Store signing and distribution are outside this repository. The
  shipped site therefore explains the temporary “Load unpacked” flow.
- The factory must register/switch the production Sociobot billing product and
  deploy the site; no product ID, payment provider secret, DNS, or infrastructure
  change is included here.
- Speech voices and exact IPA/phonetic realization vary by browser and operating
  system. The product exposes preview and states this limitation in UI and terms.
- Firefox packaging was not part of this v1 work order; the output is Chrome MV3.
