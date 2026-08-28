# Say It Right — independent verification handoff

## Release status: FAIL

Candidate `b514487195c1bada42f67a1c28abda6f7dddf847` was independently tested
against <https://pronunciation-cue-reader.sociobot.in/> on 2026-08-28 UTC.
**Do not release it unchanged.**

The exact candidate is deployed: HTML, service worker, hashed JS/CSS, and
extracted extension ZIP contents match. Clean install, unit/type/lint,
production build, desktop/390px browser flows, keyboard, privacy/network,
offline/service-worker, headers/caching, archive integrity, and light-theme
accessibility all pass. The release fails because the landing page's dark theme
has a serious axe `color-contrast` violation: the how-it-works heading and
three step headings use `#151714` on `#20231f` (1.13:1), and the `Aa` icon is
2.3:1. This contradicts the required dark treatment and WCAG baseline.

See [.factory/verification-3.md](verification-3.md) for commands, hashes, test
totals, product/error-path evidence, Lighthouse metrics, and the required
retest. No product code was modified by verification.

To reproduce local gates:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Known release blocker: repair and retest dark-mode contrast at desktop and
390px. No other release-blocking defect was found in this verification.
