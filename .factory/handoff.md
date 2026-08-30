# Say It Right — repair 4 handoff

## Release status: PASS

Repair commit \`93925651aebd754585651c4f168e6bc803ee6a74\` fixes every finding in
\`.factory/verification-4.md\` for candidate
\`53215b037c69974c9b5ab8c1a9c74c865675c2cb\`. It was pushed to \`origin/main\`
and deployed to <https://pronunciation-cue-reader.sociobot.in/> on 2026-08-30
UTC.

Deployment: \`bbb899ed-f6d3-4d17-a6be-837e5de5f146\` to existing Static Web App
\`sf-pronunciation-cue-reader\` in \`eastus2\`.

## What changed

- Reproduced the reported checkout failure first: the production checkout URL
  returned HTTP 404 with \`{"error":"enabled factory product","status":404}\`.
  The live billing catalogue did not contain this slug. Billing registration is
  external factory work and is not performed from this repo. To avoid an
  unfulfillable purchase claim, this release removes the unregistered Plus
  checkout, license UI/client/storage, all $12 claims, and the external API CSP
  allowance. The release is an honest local reader with 20 site-scoped cues.
  Legacy license values are cleared on popup startup.
- Removed the dark Backup-and-Plus panel whose inherited dark \`--sheet\` text
  rendered at 1.22:1 on \`#2d332e\`. The opened Backup panel now has zero
  serious/critical axe findings in dark mode.
- Cue-row copy now shrinks and breaks at safe boundaries while action buttons
  stay flex-fixed. A saved unbroken 120-character term and 180-character spoken
  form has zero horizontal overflow at 390 px and keeps Edit in the viewport.
- The ten-minute selected-text handoff now fails closed. Fresh data is consumed
  once; expired, malformed, and future-dated \`pendingSelection\` data is
  removed before active-tab fallback and the badge is cleared.
- The popup website and Privacy links are now 44 px targets.
- Added exact regressions for all five findings, plus 200% text size,
  reduced-motion, service-worker update, popup/site request privacy, and
  response policy. \`.factory/claims.json\` maps each published
  storage/privacy/limit claim to one tagged browser test.
  \`.factory/copy-audit.md\` records the landing-copy audit.

## Reproduction and regression evidence

Before the repair, the new boundary tests reproduced the verifier's exact local
failures: a 24 px website link (then 18 px Privacy link), 1,206 px of overflow
after the accepted 120/180 unbroken cue, an 11-minute selected passage still in
extension storage, and a visible link to the unprovisioned checkout.

After the repair, the exact tests pass:

- \`does not advertise an unprovisioned Plus checkout\`;
- opened Backup dark-mode axe plus both 44 px links;
- maximum-length unbroken cue with zero overflow;
- \`@claim:pending-selection-expiry\`, which removes the seeded 11-minute
  payload before fallback.

## Clean local verification

From a new dependency install with Node \`v22.23.2\` and npm \`10.9.8\`:

\`\`\`bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
unzip -t dist/site/downloads/say-it-right.zip
git diff --check
\`\`\`

Results:

- \`npm ci\`: 187 packages installed; audit reported 0 vulnerabilities.
- Unit: 7/7 passed. Typecheck and lint: passed.
- Production build: passed; produced \`dist/extension\`, \`dist/site\`, and
  \`dist/site/downloads/say-it-right.zip\`.
- Browser integration: 20 passed, 8 intentional project skips. It covers
  desktop and 390×844 site light/dark flows; popup keyboard reader, active
  \`aria-current\`, pause/resume/stop, import boundary, stale selection, long
  cue, dark axe, and touch targets.
- Each declared claim command passed:
  \`@claim:site-cue-limit\`, \`@claim:local-reader-data\`,
  \`@claim:pending-selection-expiry\`, and \`@claim:site-no-trackers\`.
- Local \`/\`, \`/privacy/\`, and \`/terms/\` passed
  \`/opt/fleet/lib/verify-url.sh\`: title/lang/one h1/main/alt checks and zero
  console errors.
- The extension ZIP passed \`unzip -t\`. Its manifest remains limited to
  \`activeTab\`, \`storage\`, \`contextMenus\`, and \`scripting\`.

Build sizes: extension 33,180 B; initial JS 990 B (525 B gzip); CSS 13,888 B
(3,942 B gzip); hero WebP 92,948 B; ZIP 20,365 B.

Mobile Lighthouse: performance **100**, accessibility **100**, best practices
**100**, SEO **100**; LCP **954 ms**, TBT **0 ms**, CLS **0**.

## Live verification

The worker URL verifier passed on live home, Privacy, and Terms. Fresh live
Chromium checks at 1440×900 and 390×844 in explicit light and dark schemes found
one h1, one main, zero overflow, zero serious/critical axe findings, zero
page/console errors, and same-origin-only requests. Tab reaches the visible skip
link first. The 390 px suite also checks 44 px targets, 200% text resize, and
reduced motion.

Normal reader/glossary use made only \`chrome-extension://\` requests. The
landing privacy test observed same-origin requests only. No third-party fonts,
scripts, analytics, checkout, or license verification calls remain.

In a fresh live service-worker profile, reload became controller-owned,
\`registration.update()\` left no waiting worker, and the first offline reload
rendered \`Read selected text with pronunciation cues.\` with no errors.

Live HTML sends CSP with \`connect-src 'self'\`, Permissions-Policy, HSTS,
strict referrer policy, and \`nosniff\`. Hashed assets send
\`public, max-age=31536000, immutable\`; the download is \`application/zip\`
and validates as a ZIP.

## Production identity

Local and live files are byte-identical (SHA-256):

- HTML: \`76bbf68b82ae5df3d14323c8c8236c42377af6b0249464e188aaffd61e7437aa\`
- Service worker: \`4037ad99d36bc75559597bd733c1bf861212d1876f1aa9b7383e55be824ed094\`
- Site JS: \`4afae03c63687cf2df0891523204286058905d5bd1872be3c0401f136f78f30a\`
- Site CSS: \`0f728327f81a66e8f1ed7d8c2336ba92a19ba8e678e1d44d293b86b00c21d70e\`
- Extension ZIP: \`5fecccf1cfa9928a14e5fe0bee1f907a13896705fe58660eaa610e24beb77c07\`

The live and local ZIPs are byte-identical, both pass \`unzip -t\`, and their
extracted extension trees have no differences.

## Known gap / deliberate scope decision

\`.factory/brief.json\` is absent from the base. The only behavior removed is
the unregistered paid tier: the Sociobot billing catalogue did not contain this
slug, so retaining checkout would knowingly send people to a 404. The free,
site-scoped local reader is fully verified. If the factory later registers a
real billing product, a paid tier can return only with a live checkout redirect
test before it is advertised.
