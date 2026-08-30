# Say It Right — repair 7 handoff

## Release status

**PASS locally; ready for deployment.** This repair clears every release
blocker in independent verification report
`.factory/verification-7.md` for candidate
`c16c820d288eb0828721ae843824d1e1e7d7f965`.

## What was repaired

The verifier found no broken reader behavior. The release blocker was a claims
contract gap: the README promised portable backup import and an active-tab
privacy boundary, but neither promise had its own registered claim and
observable test.

1. Added the `portable-backup-import` claim and a dedicated packaged-extension
   regression. It uploads a portable JSON backup, verifies its normalized cue
   appears in the matching site glossary, persists in `chrome.storage.local`,
   and makes no non-extension request.
2. Added the `active-tab-boundary` claim and a dedicated packaged-extension
   regression. It verifies the built manifest has no host or optional-host
   permissions and no content scripts, that normal browsing captures no page
   data, and that Chrome rejects an attempted script injection before an
   `activeTab` grant.
3. Made the README wording match the actual Chrome boundary: page access stays
   off until the reader is opened or the user chooses the selected-text context
   menu.
4. Audited the registry: all 18 claim IDs occur in exactly one tagged test.

No product behavior, permissions, visual treatment, demo storage boundary,
site artifact class, or deployment class changed.

## Reproduce and verify

Run from the repository root with Node 20+ and Chromium available:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
unzip -t dist/site/downloads/say-it-right.zip
npm run test:e2e
```

Run every exact command listed in `.factory/claims.json` individually. The
registry has 18 entries, including:

```bash
npm run test:e2e -- --grep @claim:portable-backup-import
npm run test:e2e -- --grep @claim:active-tab-boundary
```

## Local evidence

Performed on 2026-08-30 UTC after a fresh `npm ci` (187 packages, zero audit
vulnerabilities):

- `npm test`: 8/8 passed.
- `npm run typecheck` and `npm run lint`: passed.
- `npm run build`: passed and produced `dist/site`, `dist/extension`, and
  `dist/site/downloads/say-it-right.zip`; `unzip -t` passed.
- Every one of the 18 exact claim commands passed independently. The registry
  audit found exactly one `@claim:<id>` tag per claim.
- Full Playwright matrix: 38 passed and 16 intentional project/viewport skips
  across desktop Chromium and the 390×844 mobile project. It covers the
  installed extension, keyboard flow, visible focus, cue lifecycle, backup
  export/import, active-tab boundary, privacy, per-site limit, demo isolation,
  offline/update behavior, response policy, static 404, and package consumer
  entry points.
- Existing Playwright axe checks found zero serious or critical violations on
  home (light and dark), demo, legal pages, and extension popup. The keyboard
  tests exercise the skip link and Enter-based cue save.
- `/opt/fleet/lib/verify-url.sh` passed local `/`, `/demo/`, `/privacy/`,
  `/terms/`, and `/404.html`: each had one `h1`, `lang=en`, a `main` landmark,
  complete image alternatives, and zero console/page errors. Screenshots were
  reviewed at desktop and 390 px with no horizontal overflow.
- Local mobile Lighthouse: 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO. FCP and LCP were 1.5 s, TBT was 0 ms, and CLS was 0.
- Build sizes remain inside the static budget: landing JavaScript is 316 B
  (220 B gzip), shared JavaScript 711 B (399 B gzip), main CSS 13,773 B
  (3,930 B gzip), demo JavaScript 3,488 B (1,650 B gzip), hero WebP 92,948 B,
  and unpacked MV3 extension 33,600 B.

## Deployment and live verification

Deploy `dist/site` as the existing static application
`sf-pronunciation-cue-reader` in `eastus2`. After deployment, verify the
custom domain, packaged ZIP identity, headers, offline reload, and both
desktop and 390 px browser views. The static site has no application backend,
accounts, payments, tenant identity flow, or rate-limit endpoint; those checks
do not apply.

## Known gaps

None. The repair is locally verified and ready for the configured static
deployment.
