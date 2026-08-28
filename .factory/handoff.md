# Say It Right — repair handoff

## Release status: PASS

- Product repair commit: `12fb0b9` (`fix release blockers for extension delivery`); verification/handoff commit: `f3f512f`, both pushed to `origin/main`.
- Deployed static artifact: `dist/site` to <https://pronunciation-cue-reader.sociobot.in/> on 2026-08-28.
- This repair preserves the WXT/TypeScript Manifest V3 extension and static companion-site deployment class.

## What changed

- Made `npm test` self-contained: it prepares WXT types before running Vitest.
- Made the work-order deployment command (`npm ci && npm test && npm run build:site`) package the extension and put a real `downloads/say-it-right.zip` in `dist/site`.
- Enforced free-tier import restrictions: unlicensed imports now skip every-site cues and stop at 20 total cues, while reporting the exact partial-import result. Plus imports remain unlimited.
- Generated a versioned service-worker precache from the production asset list. It includes hashed JS/CSS and has a navigation-only offline fallback, so asset requests cannot receive HTML.
- Added 44px hit areas for visible site brand/footer/navigation links and extension Add, Export, Edit, and Delete controls.
- Added `staticwebapp.config.json`: ZIP/web-manifest MIME types, immutable cache policy for hashed assets, download exclusion from navigation fallback, CSP, and Permissions-Policy.
- Kept privacy behavior intact: local extension storage, no site analytics, no third-party font/script requests.

## Regression coverage

- Unit tests cover unlicensed import capacity/global-scope rejection and Plus update/unlimited behavior.
- Browser tests verify the built ZIP starts with `PK`, deploy-policy generation, precached JS/CSS placeholders are resolved, fresh-profile offline reload works, 390px hit areas are at least 44px, and extension import persists no global cue or more than 20 cues when unlicensed.
- Existing source-preserving reader, cue save, keyboard-friendly form, license-return, legal-page, and axe tests remain in place.

## Verification evidence

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed; 187 packages; `npm audit` reported 0 vulnerabilities. |
| Unit | `npm test` passed, 7/7. |
| Type/lint | `npm run typecheck` and `npm run lint` passed. |
| Full production build | `npm run build` passed; extension payload 35.99 KB; site JS 2.74 KB and CSS 13.79 KB. |
| Package consumer | `unzip -t dist/site/downloads/say-it-right.zip` passed. |
| Browser | `npm run test:e2e` passed: 11 passed, 3 intentional project skips (desktop extension only / desktop-only offline / mobile-only target test). |
| Accessibility | Local desktop/390px axe and deployed desktop/390px axe: 0 serious/critical violations; no console/page errors. |
| Keyboard/mobile | Extension cue flow and visible focus remain exercised; exact 44px target assertions pass at 390px. |
| Offline/update | Fresh-profile local and live offline reload both render the app under SW control with no module/page errors. |
| Privacy | Production local browser request capture contained only `http://127.0.0.1:4173`; no third-party requests or console errors. |
| Lighthouse mobile | Performance 1.00, accessibility 1.00; LCP 944 ms, CLS 0, TBT 0 (local production preview). |
| Live identity | Live `index.html` SHA-256 equals `dist/site/index.html`: `c7fe57f912ea17f33853bc0745d35635ea17fcb5467d17311f82934e7f4015b0`. Live `sw.js` also matched the built artifact. |
| Live ZIP | `application/zip`, 21,296 bytes; SHA-256 equals local: `54dbe539fe31635c25d662e8da170d0d9d7bff75f34b4db97c8b0d0d5de06a0c`; `unzip -t` passed. |
| Live response policy | Has CSP and Permissions-Policy; hashed JS has `Cache-Control: public, max-age=31536000, immutable`; manifest is `application/manifest+json`. |

Local post-deploy evidence is retained in `/work/evidence-pronunciation-repair/` for this worker run.

## Known gaps / next steps

None for this repair. Future product work can pursue store distribution, which is explicitly outside this direct-download release.
