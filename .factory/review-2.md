# Adversarial first-read review 2 — Say It Right

- Reviewed: 2026-08-30 UTC
- Live URL: <https://pronunciation-cue-reader.sociobot.in>
- Revision: `7cbbc45443bfb79337abc3986deae5c11eab628c`
- Fresh viewports: Chromium 390 × 844 and 1440 × 1000
- Verdict: **PASS**

The complete checklist was rerun from a cold context. There are zero findings,
blocking or minor, and no untested registered claim.

## Cold first read

Before scrolling, both viewports answered all three required questions.

| Question | Exact first-screen evidence | Result |
| --- | --- | --- |
| What does it do? | “Read selected text with pronunciation cues.” | Clear |
| Who is it for? | “For dyslexic, low-vision, and language-learning readers who need names and technical terms pronounced consistently.” | Clear |
| What should I click first? | “Try it with sample data”; adjacent result text: “Opens a private sample reader.” | Clear |

At 390 px the headline, audience, first action, secondary download action, and
three plain facts were visible with no horizontal overflow. Desktop kept the
same information order. The warm-paper, cut-paper pronunciation field, cue
gate, reading rail, and editorial type pairing match `.factory/design.md`;
the result is distinct rather than a generic SaaS template.

## Copy audit

Counts treat contractions, hyphenated terms, shortcuts, and numbers as one
word. The following lists every visible landing sentence/fact line and every
README prose sentence. No entry exceeds 22 words. The headings, nav, and
buttons are checked after the tables.

### Landing sentences and fact lines

| Copy | Words | Result |
| --- | ---: | --- |
| Read selected text with pronunciation cues. | 6 | Pass |
| For dyslexic, low-vision, and language-learning readers who need names and technical terms pronounced consistently. | 14 | Pass |
| Opens a private sample reader. | 5 | Pass |
| 20 pronunciation cues per site. | 5 | Pass |
| No account. | 2 | Pass |
| Pronunciation cues change spoken output, not the selected text shown in the reader. | 12 | Pass |
| Your selected text and pronunciation cues stay in your browser. | 9 | Pass |
| The reader shows the selected text unchanged. | 7 | Pass |
| Hear a pronunciation cue in a browser voice. | 9 | Pass |
| Fix words your voice mispronounces. | 5 | Pass |
| Correcting selected text works once. | 5 | Pass |
| Searching a dictionary breaks your reading flow. | 7 | Pass |
| A pronunciation cue remembers a spoken form without changing selected text. | 11 | Pass |
| Read selected text aloud. | 4 | Pass |
| Select text, open the extension with Alt + Shift + S, and listen. | 12 | Pass |
| The current chunk stays visibly marked while it is spoken. | 9 | Pass |
| Choose the selected text you want to hear. | 8 | Pass |
| The extension reads that text. | 5 | Pass |
| Save a phonetic spelling or replacement for this site. | 10 | Pass |
| Preview an installed voice, then follow the highlighted chunks as they are spoken. | 13 | Pass |
| Save pronunciation cues for names and terms. | 7 | Pass |
| Match whole words or phrases, including abbreviations and product names. | 10 | Pass |
| Pronunciation cues use extension storage. | 5 | Pass |
| Export a JSON backup when you need one. | 8 | Pass |
| Hear a pronunciation cue before saving. | 7 | Pass |
| IPA can help, but exact results still depend on your voice engine. | 12 | Pass |
| Use the keyboard to move through controls, with visible focus and a browser shortcut. | 14 | Pass |
| Install the Chrome extension. | 4 | Pass |
| Download and unzip the extension package. | 6 | Pass |
| Open chrome://extensions and turn on Developer mode. | 8 | Pass |
| Choose “Load unpacked” and select the unzipped folder. | 8 | Pass |
| Select text, then click the Say It Right icon. | 9 | Pass |
| Install this package with Chrome Developer mode. | 8 | Pass |
| Store distribution is planned for a later release. | 8 | Pass — a limitation, not a capability promise |
| Start reading selected text aloud. | 5 | Pass |
| A private pronunciation cue reader. | 5 | Pass |
| Built by Param Factory. | 4 | Pass |
| Version 1.0.0. | 2 | Pass |
| Hero artwork was generated for this product with the factory image model. | 12 | Pass — provenance |
| You’re offline. | 2 | Pass |
| Downloads need a connection; the installed extension still works. | 9 | Pass |

### README sentences

| Copy | Words | Result |
| --- | ---: | --- |
| Say It Right is a Chrome/Chromium extension for dyslexic, low-vision, and language-learning readers. | 14 | Pass |
| It helps names, abbreviations, and technical terms sound consistent. | 9 | Pass |
| Select text, open the extension, and listen while spoken chunks are highlighted. | 12 | Pass |
| Save a pronunciation cue when a voice gets a term wrong. | 11 | Pass |
| Preview it in a browser voice. | 6 | Pass |
| The extension does not send selected text or pronunciation cues to a server. | 12 | Pass |
| Try the isolated sample reader at /demo/?demo=1. | 8 | Pass |
| Its Kubernetes, PostgreSQL, and NASA sample uses only the demo: browser-storage namespace. | 12 | Pass |
| Use Reset demo to restore it or Start for real to discard it before installing the extension. | 17 | Pass |
| Reads selected text with visible chunk progress; reading can pause, resume, or stop. | 13 | Pass |
| Stores private pronunciation cues per site in extension-local storage. | 9 | Pass |
| Adds, previews, edits, and deletes pronunciation cues; warns that IPA realization is voice-engine dependent. | 13 | Pass |
| Works from the toolbar, Alt+Shift+S, or the selection context menu. | 10 | Pass |
| Exports a JSON backup when you request it and imports portable backups. | 12 | Pass |
| Includes 20 pronunciation cues per site. | 6 | Pass |
| Every pronunciation cue stays on the site where you saved it. | 11 | Pass |
| Supports keyboard use, 200% text zoom, and reduced motion. | 9 | Pass |
| Requirements: Node.js 20+, npm, and a Chromium browser. | 7 | Pass |
| npm run build is the canonical build command. | 8 | Pass |
| It creates an unpacked Manifest V3 extension. | 7 | Pass |
| It creates a deployable static site with index.html at its root. | 11 | Pass |
| It creates the packaged extension linked by the site. | 9 | Pass |
| The static deploy root is dist/site. | 7 | Pass |
| No environment variables are required to build. | 7 | Pass |
| The deployment build command is npm ci && npm test && npm run build:site. | 13 | Pass |
| build:site deliberately also builds and packages the extension, so the deployable directory always contains the ZIP linked by the landing page. | 20 | Pass |
| Run npm run build. | 4 | Pass |
| Open chrome://extensions and enable Developer mode. | 7 | Pass |
| Choose Load unpacked and select dist/extension. | 7 | Pass |
| Open a normal web page, select text, and click the Say It Right icon. | 13 | Pass |
| The extension deliberately asks for activeTab, storage, context-menu, and scripting permissions only. | 12 | Pass |
| It has no broad host permission. | 6 | Pass |
| Chrome keeps page access off until you open the reader or choose the selected-text context menu. | 16 | Pass |
| See the published /privacy/ and /terms/ pages, or their source under site/. | 12 | Pass |
| Code is licensed under the MIT License. | 8 | Pass |
| Generated hero art is original to this product; prompt and provenance are recorded in .factory/design.md and assets/src/. | 16 | Pass |

Landing headings and controls were also checked. “Private pronunciation cues,”
“Why pronunciation cues help,” “Three steps,” “Your saved cues,” “Install the
package,” “Names and terms,” “Installed voices,” and “Keyboard controls” name
their content. “Try it with sample data,” “Download for Chrome,” and “Download
Say It Right” name their results. No metaphor/mood heading, generic action
button, inconsistent term, or marketing adjective was found. The terms remain
*selected text*, *pronunciation cue*, *site*, and *saved cues*. README technical
terms occur only with implementation or installation instructions.

## Demo and sandbox behaviour

The first CTA opened `/demo/?demo=1` in one click. Its initial screen already
showed a realistic `docs.example.org` passage and Kubernetes, PostgreSQL, and
NASA cues. The persistent banner said:

> Demo — sample data, nothing is saved to your real reader.

In a fresh mobile context, adding `OpenTelemetry → open tel eh metry` created
only `demo:pronunciation-cue-reader:cues`. **Reset demo** restored the three
seed cues. **Start for real** removed the demo key and navigated to installation
steps. No real-reader storage changed. Home and demo request logs contained
only `https://pronunciation-cue-reader.sociobot.in`.

## Claims and verification

`.factory/brief.json` is absent, so the repository contract, design thesis,
and shipped product were the available scope sources.

After `npm ci`, all 19 exact commands in `.factory/claims.json` passed,
including demo isolation, phrase matching, cue limits, privacy, speech,
source preservation, import/export, keyboard, accessibility, offline,
entry-point, access boundary, glossary, and cue lifecycle. The final record
was:

```json
{"status":"passed","failedTests":[]}
```

`npm test` passed 8/8. `npm run typecheck`, `npm run build`, and
`git diff --check` passed. `npm run test:e2e` passed its full 62-test matrix
(with declared project skips). The claim registry covers every visitor-facing
operation promise in the landing and README; build instructions and artwork
provenance are repository facts rather than product-operation claims. No
unlisted claim was found.

## Structure, accessibility, and routes

Fresh live checks of home (desktop and mobile), demo, privacy, terms, and an
unknown URL confirmed the required per-route metadata, favicon/Apple icon,
single h1/main, designed HTTP 404, canonical URLs, robots file, sitemap, and
consistent header/footer. The sitemap lists home, demo, privacy, and terms.

All product/source links returned 200; mail addresses were valid `mailto:`
targets. Home → demo → Back focused the new h1 each time and route
announcements were present. No console/page error, overflow, or sub-44 px
visible control appeared. Axe found no serious or critical issue on the
route/viewport matrix. Live requests were same-origin only; there were no
trackers, external fonts, external scripts, or analytics requests. CSP,
frame-ancestors response header, nosniff, referrer policy, and permissions
policy were present.

## Earlier finding verification

Every earlier review/polish/handoff record was read and independently
rechecked in current source and live behavior.

| Earlier finding | Current confirmation | Status |
| --- | --- | --- |
| F-1-1 route focus | Home → demo → Back focuses the destination h1. | Fixed |
| F-1-2 missing matching claim | Registered `whole-words-and-phrases` test passed. | Fixed |
| F-1-3 mobile targets | No visible mobile control measured below 44 px. | Fixed |
| F-1-4 sitemap demo omission | Live sitemap lists `/demo/` once. | Fixed |
| F-1-5 shared skeleton | Header/footer are complete and consistent on every route. | Fixed |
| F-1-6 mood-line heading | Live text says “Why pronunciation cues help.” | Fixed |
| F-1-7 vague step headings | Live headings name saving and listening actions. | Fixed |
| F-1-8 jargon/conflict headings | Repaired plain headings are live. | Fixed |
| F-1-9 long README sentences | Every README prose sentence is ≤20 words. | Fixed |
| F-1-10 inconsistent terminology | Current text uses the documented vocabulary throughout. | Fixed |

Earlier verification-only defects (speech control, active state, contrast,
removed checkout, overflow, pending expiry, demo availability, cue limits,
404, metadata, backup import, page-access boundary, ZIP, offline behavior,
and headers) remain covered by the passing current tests. No regression was
observed.

## Missed leverage

The expected portable import/export and isolated demo are already present. AI
does not improve the core local browser-speech job enough to be expected here;
no decorative AI or embedded provider key was found.

## What would make this perfect

Maintain this standard on future changes: rerun cold mobile/desktop,
demo-isolation, exact-claim, route, privacy-request, and accessibility checks
whenever copy, storage, or routing changes. This round identifies no remaining
product work.

