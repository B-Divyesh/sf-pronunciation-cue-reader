# Independent verification — FAIL

- Verified: 2026-08-28 UTC
- Candidate: `e4e7d5e4e403cda3bb1faf8b55b4de10057c2c67`
- Repository: `B-Divyesh/sf-pronunciation-cue-reader` / `main`, clean checkout
- Live URL: <https://pronunciation-cue-reader.sociobot.in/>
- Result: **FAIL — do not release this candidate unchanged.** One accessibility
  defect means a screen-reader user is not told which selected-text chunk is
  currently being spoken. This is material to the product's accessibility
  contract and stated interaction design.

## Fresh local gates

| Check | Result |
| --- | --- |
| `npm ci` | Passed: 187 packages installed; `npm audit` reported 0 vulnerabilities. |
| `npm test` from the clean checkout | Passed: 1 file, 7/7 tests. The command prepared WXT types itself. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed (it runs the typecheck). |
| `npm run build` | Passed. Produced `dist/extension`, `dist/site`, and `dist/site/downloads/say-it-right.zip`. Extension payload: 35.99 KB; site initial JS: 2.74 KB; CSS: 13.79 KB. |
| `npm run test:e2e` | Passed: 11 passed, 3 intentional project skips. This includes local desktop and 390px site checks, extension cue/import flow, archive, and offline-shell coverage. |
| Package consumer/archive | Fresh local and live ZIPs passed `unzip -t`. The local ZIP is 21,296 B. Its container hash differs after rebuild because `zip` records timestamps, but all 9 unpacked extension files had identical SHA-256 content hashes to the live download. |

## Product exercise

Using a fresh Chromium profile with the production unpacked extension, I
seeded the same short-lived `pendingSelection` payload created by the
context-menu path for a representative selected passage:

> `NASA uses Kubernetes near PostgreSQL.` on `docs.example.org`

The reader identified the site, displayed the source text unchanged, saved
`Kubernetes → koo-ber-net-ees` in extension-local storage, and removed the
pending selected text afterwards. A controlled SpeechSynthesis test verified
that Preview spoke the replacement and reading spoke
`koo-ber-net-ees helps PostgreSQL.` rather than rewriting the displayed source.
No extension page/console errors occurred, and its only requests were its own
popup HTML, JS, and CSS.

Boundary/error/recovery checks passed:

- Empty cue submission says “Enter the word or phrase as it appears.”
- A programmatically supplied 121-character term produces the documented
  120-character validation error.
- Invalid JSON import reports a parse error and leaves the UI usable.
- An unlicensed import of 21 site cues plus one every-site cue remains capped
  at 20, excludes the every-site cue, and reports the partial import.
- Keyboard-only testing reached the skip link first (visible
  `rgb(37, 71, 184) solid 3px` outline), opened Add cue, focused the first
  field, and saved a cue with Enter. Extension Add/Edit/Delete and live 390px
  site controls measured at least 44px high.

## Accessibility and responsive evidence

Fresh axe runs found **zero serious or critical findings** for the production
extension popup (including its cue/import flow) and for the live landing page
on desktop and at a 390px viewport. The live page has `lang="en"`, one `h1`,
`main`, title, alt text, a working skip link, and no console/page errors.
Reduced-motion emulation sets `scroll-behavior: auto` and a `0.01ms`
transition duration. Desktop and mobile had no horizontal overflow in the
tested visible navigation/footer controls.

However, while a selected passage is being read, the current chunk is rendered
as, for example:

```html
<span class="chunk current" data-index="0" aria-current="">…</span>
```

The DOM property is likewise `element.ariaCurrent === ""`, not `"true"` (or
another valid `aria-current` token). The visual red highlight appears, but the
announced-current state is absent from the accessibility representation. Axe
does not flag this empty token, so the normal axe gate passes; the direct
screen-reader-state smoke test does not.

## Privacy, deployment, offline, and response policy

- The MV3 manifest requests only `activeTab`, `storage`, `contextMenus`, and
  `scripting`; it has no host permissions. Selected text and glossary cues stay
  in `chrome.storage.local`; normal reader use made no network request.
- A live landing-page load made five same-origin requests only. There are no
  third-party fonts, scripts, analytics, or tracking requests. The explicit
  Sociobot checkout/verification endpoint is the only configured external
  connection and is license-specific.
- Live `index.html` SHA-256 exactly equals the fresh candidate build:
  `c7fe57f912ea17f33853bc0745d35635ea17fcb5467d17311f82934e7f4015b0`.
  The live `sw.js` also equals the built file. Live index asset names match the
  candidate (`site-CTMgtPLs.js`, `site-BjRZuBQ8.css`).
- Live `/downloads/say-it-right.zip` returns `200 application/zip`, 21,296 B,
  and validates as a ZIP. The byte-level ZIP hash differs only because of its
  recorded timestamps; every extracted product file matches the fresh build by
  content hash.
- Live HTML has CSP, Permissions-Policy, HSTS, strict referrer policy, and
  `nosniff`. The manifest is `application/manifest+json`; hashed JS/CSS/WebP
  use `Cache-Control: public, max-age=31536000, immutable`.
- In a fresh live profile, the service worker became controller after one
  reload. An offline reload then returned 200, rendered the `h1`, and emitted
  no console/page/module errors.

## Defects

### Medium — current spoken chunk is not exposed to assistive technology

`setCurrentChunk()` uses `toggleAttribute('aria-current', true)`, which writes
an empty attribute rather than the valid ARIA state `aria-current="true"`.
Consequently, a reader relying on a screen reader has no semantic indication of
which chunk is currently spoken, contrary to the visual thesis and accessibility
contract (“current spoken chunk … supported by `aria-current`”). Set an explicit
valid value while current and remove it when not current, then add a regression
test that inspects the active reading state.

### Low — the Pause label performs stop/restart rather than pause/resume

During speech the primary control changes to “Pause”, but its handler sets
`state.reading = false` and calls `speechSynthesis.cancel()`. Pressing Read
again restarts the current chunk instead of resuming. Relabel it as Stop or
implement `speechSynthesis.pause()`/`resume()` with corresponding state.

## Required release retest

1. Correct the `aria-current` value and verify in an active-reading
   screen-reader/accessibility-tree smoke test, not only an idle axe run.
2. Resolve or accurately label the current Pause behavior.
3. Re-run the clean commands above, active-reading popup axe/screen-reader
   state, desktop/390px flows, and the live ZIP/offline/header checks before
   changing the verdict.
