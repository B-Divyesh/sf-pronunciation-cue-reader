# Polish 1 — review finding closure

Reviewed against `.factory/review-1.md` on 2026-08-30. All evidence below is
from the final local build. Desktop and 390 px screenshots are retained at
`test-results/polish-1-home-desktop.png` and
`test-results/polish-1-demo-390.png`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added `route-focus.ts` to focus the destination `<h1>` and update a polite route announcement after document navigation; in-page hashes retain their target. | `document routes focus and announce their destination heading, including browser back` in `npm run test:e2e` |
| F-1-2 | Added `whole-words-and-phrases` to claims and a fresh extension browser test for a phrase, abbreviation, and partial-word non-match. | `npm run test:e2e -- --grep @claim:whole-words-and-phrases` |
| F-1-3 | Made shared header/footer, legal mail, demo controls, inputs, and buttons 44 px targets; added a 390 px route matrix for every visible control. | `keeps every visible mobile route control at least 44px`; `test-results/polish-1-demo-390.png` |
| F-1-4 | Added `/demo/` exactly once to `public/sitemap.xml`. | `public routes share the required header, footer, and sitemap entries` |
| F-1-5 | Standardized every route on the Demo / How it works / Privacy header and product one-liner, legal links, factory attribution, and version footer. | `public routes share the required header, footer, and sitemap entries` |
| F-1-6 | Replaced the mood-line kicker with “Why pronunciation cues help.” | `copy-audit.md`; `test-results/polish-1-home-desktop.png` |
| F-1-7 | Replaced vague step headings with “Save a pronunciation cue” and “Listen with your cues.” | `copy-audit.md`; `test-results/polish-1-home-desktop.png` |
| F-1-8 | Replaced jargon/conflicting headings with “Your selected text stays unchanged,” “Preview an installed voice,” and “Private storage on this device.” | `copy-audit.md`; landing axe checks in `npm run test:e2e` |
| F-1-9 | Rewrote the two overlong README sentences into short, direct sentences. | `.factory/copy-audit.md` and README review |
| F-1-10 | Applied the selected text / pronunciation cue / site / saved cues terminology across landing, demo, legal pages, and README. | `.factory/copy-audit.md`; `npm run test:e2e` |

Additional polish: `/?demo=1` now redirects to the isolated demo entry;
the demo CTA uses `/demo/?demo=1`; desktop hero type no longer overlaps the
illustration at 1440 px. Evidence: `the explicit demo query enters the
isolated sample reader` and `test-results/polish-1-home-desktop.png`.

Repair commit `f8a97e7f278f6575ea9c216f75b4d9f4a0b09ba2` is pushed. At the final
cache-busted cold check (05:40 UTC), the public host still served the prior
artifact; see `.factory/handoff.md` for the exact ETag and propagation note.
