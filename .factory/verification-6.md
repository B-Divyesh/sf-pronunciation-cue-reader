# Independent verification 6 — FAIL

- Verified: 2026-08-30 UTC
- Candidate: `e32f3332a92b2716ecc1823363b7841d636a2bd4`
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Verdict: **FAIL — do not release unchanged.** Functional, privacy,
  accessibility, offline, build, and deployment evidence is positive, but the
  candidate fails the mandatory claims contract: it publishes visitor-facing
  promises with no `.factory/claims.json` entry or observable tagged test.

## First-read and demo result

Fresh Chromium, cold live home page clearly says it reads selected text with
pronunciation cues, names dyslexic, low-vision, and language-learning readers,
and makes **Try it with sample data** the first action. That opens `/demo/`.
The persistent Demo banner has Reset demo and Start for real. This passes the
plain-words and one-click-demo gate.

At both 1440 px and 390 px the live demo seeded three realistic cues, rejected
an empty term with an actionable error, saved `OpenTelemetry → open tell em
etry`, reset to the original sample, and used only
`demo:pronunciation-cue-reader:cues` localStorage. It had no overflow,
console/page error, third-party request, or serious/critical axe finding.

## Mandatory claim commands

After `npm ci` (187 packages, audit: 0 vulnerabilities), every exact command
listed in `.factory/claims.json` passed independently:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | 2 passed |
| `site-cue-limit` | 1 desktop pass; expected mobile skip |
| `local-reader-data` | 1 desktop pass; expected mobile skip |
| `selected-reading` | 1 desktop pass; expected mobile skip |
| `source-preserving` | 2 passed |
| `backup-export` | 1 desktop pass; expected mobile skip |
| `keyboard-reader` | 1 desktop pass; expected mobile skip |
| `reader-accessibility` | 1 mobile pass; expected desktop skip |
| `pending-selection-expiry` | 1 desktop pass; expected mobile skip |
| `site-no-trackers` | 2 passed |

## Defects

### High — published promises are not all registered and demo-tested claims

The supplied claims contract says every visitor-relevant claim must appear in
`.factory/claims.json` and have exactly one observable `@claim:<id>` test; it
explicitly says an unlisted claim fails review. The ten registered claims pass,
but these additional promises are unlisted:

- Live first screen: **“No account.”**
- Live home: **“Preview in the voices already installed.”**
- Live offline banner: **“the installed extension still works.”**
- README: **“Works from the toolbar, `Alt+Shift+S`, or the selection context
  menu.”**
- README: private per-site extension-local storage and the add/preview/edit/
  delete cue workflow.

Adjacent tests do not replace entries that state and prove those precise
promises through the prescribed sandbox. Add tagged claim tests or remove/
reword the promises.

### Medium — required route metadata is absent

Live home/demo/legal pages have titles, descriptions, language, and favicon,
but no `rel="canonical"`, `og:*`, `twitter:*`, or Apple-touch metadata. This
misses the supplied site-structure metadata requirement.

## Clean quality gates

- `npm test`: **8/8 passed**; typecheck and lint passed.
- `npm run build`: passed; produced `dist/extension`, `dist/site`, and ZIP.
- Browser suite, run in four fresh file/project partitions: site desktop
  **10 passed, 2 skipped**; site 390 px **11 passed, 1 skipped**; extension
  desktop **6 passed**; extension mobile **6 expected skips**. All 36 declared
  tests were covered.
- `unzip -t dist/site/downloads/say-it-right.zip` and `git diff --check`:
  passed.
- Transfer sizes: initial site JS 316 B (220 B gzip), main CSS 13,773 B
  (3,930 B gzip), demo JS 3,488 B (1,650 B gzip), hero WebP 92,948 B, and
  unpacked extension 33,372 B — within budget.

## Independent product and live evidence

- Fresh unpacked-extension tests exercised source-preserving spoken cues,
  read/pause/resume/stop, keyboard save, JSON backup, 20-per-site boundary,
  and expired pending-selection cleanup.
- Live desktop light/dark and 390 px reduced-motion/200%-text checks had one
  h1, first-tab visible 3 px focus, no overflow, zero console/page errors, and
  zero serious/critical axe findings. Reduced motion changed scroll behavior to
  `auto`.
- A fresh live PWA profile was controlled after reload; `registration.update()`
  left no waiting worker; an offline reload rendered the h1 without errors.
- Cold-home and interactive-demo request logs were same-origin only. No
  analytics, third-party fonts, trackers, selected text, or cues went to the
  network. Headers include CSP (`connect-src 'self'`, `frame-ancestors 'none'`),
  HSTS, strict referrer policy, `nosniff`, restrictive Permissions-Policy, and
  immutable caching for hashed assets. Unknown routes return HTTP 404.
- Live home/demo HTML exactly match candidate hashes:
  `38cb380da6984ec7b0afab8bd00dd6ef623eccb4c2d55125fde4753d02f752a0` and
  `d0c2b5a48990e847865efcf367d7a0d54eb46faeebd4ed52aeb909bea94d6541`.
  The live ZIP differs only in container timestamps; all extracted extension
  file hashes match.

No product server endpoint or sign-in flow exists, so rate-limit and Entra
tenant checks do not apply.

## Required retest

1. Register and test every remaining visitor-facing claim, especially account
   absence, installed-voice preview, offline behavior, shortcut/tool-bar/
   context-menu access, local per-site data, and cue editing; or remove them.
2. Add canonical, Open Graph, Twitter-card, and Apple-touch metadata to each
   route, with the required product-specific social image.
3. Re-run all exact claim commands and live privacy/accessibility/offline checks.
