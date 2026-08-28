# Say It Right — repair handoff

## Release status: PASS

- Repaired and pushed: `62f364787374c79c8e6f1e615e872344034c0b26` (`fix active reading accessibility state`).
- Deployment: `dist/site` deployed to <https://pronunciation-cue-reader.sociobot.in/> on 2026-08-28 UTC via the factory static deployment configuration (deployment `60ae418c-ed43-475a-be75-a493b90e9c86`).
- Artifact and deployment class remain a WXT + TypeScript MV3 extension with a static landing site; no researched-brief behavior was removed.

## Repair

- `setCurrentChunk()` now writes `aria-current="true"` for exactly the spoken chunk and removes the attribute from every other chunk. This repairs the empty ARIA token (`aria-current=""`) found by independent verification and keeps the semantic state synchronized with the vermilion visual lozenge.
- The primary reading control now genuinely pauses and resumes the active utterance through the SpeechSynthesis API, with an accurate `Pause` / `Resume` label. The dedicated Stop control cancels, clears the current chunk, and returns the control to `Read aloud`.
- An utterance error also clears active-reading state, so a stale current item is never left announced.

## Regression coverage

- Added an extension-browser active-reading test with a controlled SpeechSynthesis implementation. It seeds a selected passage, asserts the active chunk has `aria-current="true"`, proves Pause and Resume call their respective APIs without cancellation, checks Stop removes the current state, runs axe in that active state, and captures page errors.
- Existing keyboard cue-flow, free-tier import, archive, local offline shell, desktop, and 390px tests remain intact.

## Verification evidence

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed: 187 packages installed; `npm audit` reported 0 vulnerabilities. |
| Unit / type / lint | `npm test` passed (7/7); `npm run typecheck` and `npm run lint` passed. |
| Production build | `npm run build` passed. Extension payload is 36.16 KB; initial site JS is 2.74 KB and CSS is 13.79 KB. |
| Package consumer | Local and live `say-it-right.zip` (21,354 B) passed `unzip -t`; live ZIP SHA-256 exactly equals local: `6ace345c4a10dc01a14e6c65a0f865320e522ce1a97f9136c15c0c154a1193c5`. |
| Browser / keyboard | `npm run test:e2e` passed: 12 passed, 4 intentional project skips. This covers the extension keyboard cue flow, new active-reading pause/resume and screen-reader state, landing desktop, and 390px targets. |
| Accessibility | Local extension active-reading axe and landing-page axe have 0 serious/critical issues. Post-deploy desktop and 390px axe runs also have 0 serious/critical findings, no console/page errors, no horizontal overflow, one `h1`, `main`, `lang="en"`, title, and image alt text. |
| Privacy | The post-deploy browser capture made requests only to `https://pronunciation-cue-reader.sociobot.in`; no analytics, tracking, third-party fonts, or third-party scripts were requested. Extension tests retain local-storage-only glossary behavior. |
| Offline / update | Fresh-profile post-deploy service-worker installation gained control after reload; an offline reload rendered the `h1` with no page or console errors. |
| Response policy | Live HTML supplies CSP, Permissions-Policy, HSTS, strict referrer policy, and `nosniff`; hashed JS has `Cache-Control: public, max-age=31536000, immutable`; manifest is `application/manifest+json`. |
| Live identity | Live `index.html` equals `dist/site/index.html` (SHA-256 `c7fe57f912ea17f33853bc0745d35635ea17fcb5467d17311f82934e7f4015b0`) and live `sw.js` equals the built file (SHA-256 `46f9c03a5a013d204e87c6b615c6e42a88d5a6472bc70815f5dbece81363f6ac`). |
| Lighthouse mobile | Live: performance 1.00, accessibility 1.00, LCP 882 ms, CLS 0, TBT 0. |

Evidence from this worker is retained in `/work/evidence-pronunciation-cue-reader-repair-2/`.

## Known gaps / next steps

None. Store distribution remains outside the direct-download extension release.
