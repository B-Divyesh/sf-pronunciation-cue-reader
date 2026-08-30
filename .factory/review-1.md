# Adversarial first-read review 1 — Say It Right

- Reviewed: 2026-08-30 UTC
- Live URL: <https://pronunciation-cue-reader.sociobot.in>
- Viewports: fresh Chromium at 390 × 844 and 1440 × 1000
- Verdict: **FAIL**

The first screen and sample demo are clear and functional, but this review has ten open findings. Three are blocking acceptance failures: route changes do not move focus to the new page heading, several route-level mobile controls miss the required 44 px touch target, and one visitor-facing feature claim is not registered or tested. A PASS requires zero findings.

## Cold first read

Before scrolling, both fresh contexts communicated the following:

| Question | What the page communicated | Result |
| --- | --- | --- |
| What does this do? | It reads selected text aloud using saved pronunciation cues. | Clear |
| Who is it for? | “For dyslexic, low-vision, and language-learning readers who need names and technical terms pronounced consistently.” | Clear |
| What should I click first? | “Try it with sample data.” | Clear |

The 390 px first screen kept the headline, audience, primary action, secondary download action, and three short facts visible without horizontal overflow. There were no load-time console or page errors on home, demo, privacy, or terms. The only error seen while deliberately opening an unknown URL was the browser's expected failed-resource message for the HTTP 404 response.

## Demo and privacy check

The first CTA reached `/demo/` in one click. Its initial screen already showed the realistic `docs.example.org` passage and Kubernetes, PostgreSQL, and NASA cues. The persistent banner said:

> “Demo — sample data, nothing is saved to your real reader.”

In a fresh 390 px context, I pre-seeded a non-demo `pronunciation-cue-reader:cues` sentinel, added `OpenTelemetry → open tel eh metry`, pressed **Reset demo**, then pressed **Start for real**. Only `demo:pronunciation-cue-reader:cues` changed during demo work; Reset restored the three samples; Start for real removed the demo key and left the sentinel unchanged. The cold home-plus-demo request log contained only the product origin. The demo sandbox therefore passes.

## Claim registry and local verification

`.factory/brief.json` is absent, so the repository contract, design thesis, and shipped product were the available scope sources.

After a clean `npm ci`, every exact command listed in `.factory/claims.json` was run independently. All 18 completed with no failed test; the final `test-results/.last-run.json` says `{"status":"passed","failedTests":[]}`. `npm test` passed 8/8 tests. `npm run build` produced `dist/site` and `dist/extension`; the full `npm run test:e2e` matrix passed 54 tests (with its declared expected skips), and `npm run typecheck`, `npm run lint`, and `git diff --check` passed.

The claim coverage does not cure F-1-2 below: a concrete, published feature claim has no matching registry entry.

## Copy audit

Word counts treat numbers, contractions, and hyphenated terms as one word. Navigation labels, buttons, labels, headings, prose, list items, captions, and footer text are included so the audit is inspectable. Repeated product wordmark labels are listed once. `F-*` marks a finding described below.

### Landing page

| Copy | Words | Review |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| Say It Right | 3 | — |
| Try the demo | 3 | — |
| How it works | 3 | — |
| Download | 1 | — |
| Private pronunciation cues | 3 | — |
| Read selected text with pronunciation cues. | 6 | — |
| For dyslexic, low-vision, and language-learning readers who need names and technical terms pronounced consistently. | 14 | — |
| Try it with sample data | 5 | — |
| Download for Chrome | 3 | — |
| Opens a private sample reader. | 5 | — |
| 20 cues per site. | 4 | — |
| No account. | 2 | — |
| Cues change spoken output, not the selection shown in the reader. | 11 | — |
| Local by default | 3 | — |
| Your text and cues stay in your browser. | 8 | — |
| Selection preserving | 2 | F-1-8 |
| The reader shows the selected words unchanged. | 7 | — |
| Voice independent | 2 | F-1-8 |
| Preview in the voices already installed. | 6 | — |
| A small fix for a recurring interruption | 7 | F-1-6 |
| Fix words your voice mispronounces. | 5 | — |
| Correcting the source text works once. | 6 | — |
| Searching a dictionary breaks your reading flow. | 6 | — |
| A cue remembers your preferred spoken form without touching the material you return to. | 15 | F-1-10 |
| On the page | 3 | — |
| PostgreSQL | 1 | — |
| Say it like | 3 | — |
| post-gress cue ell | 4 | — |
| Three steps | 2 | — |
| Read selected text aloud. | 4 | — |
| Select a passage, open the extension with Alt + Shift + S, and listen. | 14 | F-1-10 |
| The current chunk stays visibly marked while it is spoken. | 9 | — |
| Select | 1 | — |
| Choose the passage you want to hear. | 7 | F-1-10 |
| The extension reads that selection. | 5 | F-1-10 |
| Teach once | 2 | F-1-7 |
| Save a phonetic spelling or replacement, scoped to the current site by default. | 13 | F-1-10 |
| Read clearly | 2 | F-1-7 |
| Preview an installed voice, then follow the highlighted chunks as they are spoken. | 13 | — |
| Your saved cues | 3 | — |
| Save cues for names and terms. | 6 | — |
| Names and terms | 3 | — |
| Match whole words or phrases, including abbreviations and product names. | 10 | F-1-2 |
| Local-first memory | 2 | F-1-8 |
| Cues use extension storage. | 4 | — |
| Export a JSON backup when you need one. | 8 | — |
| Installed voices | 2 | — |
| Hear a cue before saving. | 5 | — |
| IPA can help, but exact results still depend on your voice engine. | 12 | — |
| Keyboard controls | 2 | — |
| Use the keyboard to move through controls, with visible focus and a browser shortcut. | 14 | — |
| Install the package | 3 | — |
| Install the Chrome extension. | 4 | — |
| Download and unzip the extension package. | 6 | — |
| Open chrome://extensions and turn on Developer mode. | 8 | — |
| Choose “Load unpacked” and select the unzipped folder. | 8 | — |
| Select some text, then click the Say It Right icon. | 10 | F-1-10 |
| Install this package with Chrome Developer mode. | 8 | — |
| Store distribution is planned for a later release. | 8 | — |
| Start reading selected text aloud. | 5 | — |
| Download Say It Right | 4 | — |
| A private pronunciation cue reader from the Param Factory. | 9 | — |
| Hero artwork generated for this product with the factory image model. | 11 | — |
| Version 1.0.0. | 2 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Source | 1 | — |

### README

| Copy | Words | Review |
| --- | ---: | --- |
| Say It Right is a local-first Chrome/Chromium extension for dyslexic, low-vision, and language-learning readers who need names, abbreviations, and technical terms pronounced consistently. | 24 | F-1-9 |
| Select a short passage, open the extension, and listen while spoken chunks are highlighted. | 14 | F-1-10 |
| If a voice gets a term wrong, save a site-specific phonetic spelling or replacement and preview it in any voice installed in the browser. | 24 | F-1-9, F-1-10 |
| The extension does not send selected text or cues to a server. | 12 | — |
| Try the isolated sample reader at /demo/. | 8 | — |
| Its Kubernetes, PostgreSQL, and NASA sample uses only the demo: browser-storage namespace. | 12 | — |
| Use Reset demo to restore it or Start for real to discard it before installing the extension. | 17 | — |
| Reads selected text with visible chunk progress; reading can pause, resume, or stop. | 13 | — |
| Stores a private per-site pronunciation glossary in extension-local storage. | 9 | — |
| Adds, previews, edits, and deletes cues; warns that IPA realization is voice-engine dependent. | 13 | — |
| Works from the toolbar, Alt+Shift+S, or the selection context menu. | 10 | — |
| Exports a JSON backup when you request it and imports portable backups. | 12 | — |
| Includes 20 site cues per website. | 6 | F-1-10 |
| Every cue stays scoped to the site where you saved it. | 11 | — |
| Supports keyboard use, 200% text zoom, and reduced motion. | 9 | — |
| Requirements: Node.js 20+, npm, and a Chromium browser. | 7 | — |
| npm run build is the canonical build command. | 8 | — |
| It creates an unpacked Manifest V3 extension. | 7 | — |
| It creates a deployable static site with index.html at its root. | 11 | — |
| It creates the packaged extension linked by the site. | 9 | — |
| The static deploy root is dist/site. | 7 | — |
| No environment variables are required to build. | 7 | — |
| The deployment build command is npm ci && npm test && npm run build:site. | 13 | — |
| build:site deliberately also builds and packages the extension, so the deployable directory always contains the ZIP linked by the landing page. | 22 | — |
| Run npm run build. | 4 | — |
| Open chrome://extensions and enable Developer mode. | 7 | — |
| Choose Load unpacked and select dist/extension. | 7 | — |
| Open a normal web page, select some text, and click the Say It Right icon. | 15 | F-1-10 |
| The extension deliberately asks for activeTab, storage, context-menu, and scripting permissions only. | 12 | — |
| It has no broad host permission. | 6 | — |
| Chrome keeps page access off until you open the reader or choose the selected-text context menu. | 16 | — |
| See the published /privacy/ and /terms/ pages, or their source under site/. | 12 | — |
| Code is licensed under the MIT License. | 8 | — |
| Generated hero art is original to this product; prompt and provenance are recorded in .factory/design.md and assets/src/. | 16 | — |

The command examples, file-path project map, headings, and code blocks are technical fragments rather than sentences; they were reviewed and have no plain-language finding. No landing or README sentence exceeds 22 words except the two F-1-9 sentences. No button uses a generic result-free verb.

## Findings

### F-1-1 — BLOCKING — route changes do not put focus on the new page heading

**Location/evidence:** From live `/`, activating **Try the demo** loads `/demo/`, but `document.activeElement` is `BODY#`; the demo `<h1>` has no `tabindex`. Back likewise leaves focus on `BODY#`. The same is true for direct loads of home, demo, legal pages, and the designed 404. This fails the explicit route-change focus requirement and leaves keyboard and screen-reader users without a location announcement after navigation.

**Fix:** Add a shared route script that, after a document navigation (but not when following an in-page hash), gives the new page `<h1>` `tabindex="-1"`, focuses it, and updates one shared polite live region. Preserve the target and focus when the back button restores a route. Add a Playwright test that follows home → demo → back and asserts the destination heading has focus.

### F-1-2 — BLOCKING — a published feature claim is absent from claims.json

**Location/quote:** Landing “Names and terms” section: **“Match whole words or phrases, including abbreviations and product names.”** No claim entry describes word/phrase matching, abbreviation handling, or product-name handling. The registered `selected-reading` test proves a cue is spoken, not this published matching contract.

**Why this matters:** A reader can rely on this when deciding whether the tool will handle the terms they need. The supplied claims contract explicitly makes every unlisted claim a review finding.

**Fix:** Add a `whole-words-and-phrases` claim and exactly one `@claim:whole-words-and-phrases` browser test. Seed a phrase and an abbreviation in the extension/demo, assert intended matches are spoken, and assert a partial word is not changed. Or reduce the sentence to only behavior already covered by an existing registered claim.

### F-1-3 — BLOCKING — several mobile controls are below 44 px

**Location/evidence:** Fresh live 390 px measurement found these visible interactive targets below the required 44 px minimum:

| Route | Control | Measured size |
| --- | --- | --- |
| `/demo/` | Start for real | 103 × 32 px |
| `/privacy/` | privacy@sociobot.in | 142 × 19 px |
| `/terms/` | support@sociobot.in | 142 × 19 px |
| unknown route / 404 | Say It Right home | 150 × 29 px |
| unknown route / 404 | Privacy | 62 × 23 px |
| unknown route / 404 | Terms | 50 × 23 px |

**Fix:** Apply the established 44 px touch-target treatment to text buttons, mailto links, and every shared 404 header/footer link without changing their visible wording. Add a route matrix test at 390 px that measures every visible link, button, input, and select on home, demo, privacy, terms, and 404.

### F-1-4 — sitemap omits the public demo route

**Location/evidence:** Live `/sitemap.xml` lists only `/`, `/privacy/`, and `/terms/`; it omits the public, canonical, one-click demo at `/demo/`.

**Fix:** Add `https://pronunciation-cue-reader.sociobot.in/demo/` to the sitemap and test that all canonical indexable public routes occur once.

### F-1-5 — header and footer are not the required shared skeleton

**Location/evidence:** Home's header has Demo/How it works/Download but no Privacy; demo's header has Home/Sample reader/Download; legal headers have Home plus only the other legal link. Privacy and Terms footers omit both “Built by Param Factory” and a version/build identifier. The 404 footer also omits “Built by Param Factory.” This is not a consistent header/footer across routes.

**Fix:** Render one shared header (wordmark, Demo, main section, Privacy) and one shared footer (product one-liner, Privacy, Terms, Built by Param Factory, version/build ID) in every static page. Current-page links may remain visible with `aria-current="page"`.

### F-1-6 — landing heading is a mood line, not a section name

**Location/quote:** The problem-section kicker is **“A small fix for a recurring interruption.”** It does not name the section or give a reader a usable fact when heard out of context.

**Fix:** Replace it with **“Why pronunciation cues help”** or delete it.

### F-1-7 — two step headings do not name their actions plainly

**Location/quotes:** **“Teach once”** and **“Read clearly”** are slogan-like and vague in a headings list.

**Fix:** Replace them with **“Save a pronunciation cue”** and **“Listen with your cues.”**

### F-1-8 — three headings use jargon or an unclear promise

**Location/quotes:** **“Selection preserving,” “Voice independent,”** and **“Local-first memory.”** “Selection preserving” and “local-first” are jargon; “Voice independent” conflicts with nearby caution that speech results depend on the installed voice.

**Fix:** Use **“Your selected text stays unchanged,” “Preview an installed voice,”** and **“Private storage on this device.”**

### F-1-9 — two README sentences exceed the 22-word hard limit

**Location/quotes:**

- **“Say It Right is a local-first Chrome/Chromium extension for dyslexic, low-vision, and language-learning readers who need names, abbreviations, and technical terms pronounced consistently.”** (24 words)
- **“If a voice gets a term wrong, save a site-specific phonetic spelling or replacement and preview it in any voice installed in the browser.”** (24 words)

**Fix:** Use: **“Say It Right is a Chrome/Chromium extension for dyslexic, low-vision, and language-learning readers. It helps names, abbreviations, and technical terms sound consistent.”** Then: **“Save a pronunciation cue when a voice gets a term wrong. Preview it in a browser voice.”**

### F-1-10 — copy uses several names for the same selected source and cue scope

**Location/evidence:** The landing and README alternately use *selected text*, *selection*, *passage*, *some text*, *source text*, *material*, *current site*, *site-specific*, *per-site*, and *website* for the same concepts. In a tool whose job is changing spoken output without changing visible source text, this unnecessary vocabulary switching makes the boundaries harder to learn.

**Fix:** Adopt and apply this terminology table:

| Concept | Use everywhere |
| --- | --- |
| Text read by the extension | selected text |
| Saved change to speech | pronunciation cue |
| Place a cue applies | site |
| Collection of cues | saved cues |

For example, replace “Select a passage” with “Select text,” “the current site” with “this site,” and “20 site cues per website” with “20 cues per site.”

## Structure, visual identity, and leverage checks

- Home, demo, privacy, terms, and 404 each have a title, description, canonical URL, favicon, Apple touch icon, one h1, and a main landmark. The 404 is designed and returns HTTP 404. The download link returns a valid `application/zip` archive; all observed internal and source links resolve.
- The visual system is distinct rather than a generic SaaS template: warm paper, editorial cut-paper art, vermilion/cobalt/lime geometry, and the documented system type pairing match `.factory/design.md`.
- Fresh axe checks found no serious or critical violations on home (desktop and 390 px), demo, privacy, terms, or 404. This does not supersede F-1-3's direct target-size measurements.
- The live home/demo request log was same-origin only. No analytics, tracker, CDN font, or third-party script request appeared.
- The product already supplies the obvious leverage implied by the job: it has portable JSON export/import and an isolated sample reader. An AI feature is not necessary to read selected text with user-supplied pronunciation cues; no decorative or key-embedding AI feature was found.

## Earlier finding regression check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I read `.factory/handoff.md` and all eight earlier verification records. Their findings were checked against live behavior and current code as follows.

| Earlier finding | Current check | Status |
| --- | --- | --- |
| Invalid `aria-current` for current spoken chunk | `entrypoints/popup/main.ts` now explicitly writes `aria-current="true"`; active-reading test asserts it. | Fixed |
| Pause performed stop/restart | Popup calls `speechSynthesis.pause()` and `resume()`; active-reading test exercises both. | Fixed |
| Dark-mode contrast | Current full matrix axe passes dark/light checks. | Fixed |
| Advertised Plus checkout returned 404 | Current home and extension contain no checkout/Plus offer; no dead buy CTA remains. | Fixed by removal |
| Plus-panel dark contrast | The Plus panel was removed with the unsupported paid offer. | Fixed by removal |
| Maximum-length cue overflow | Current cue-row CSS uses `min-width:0` and `overflow-wrap:anywhere`; full extension matrix passes. | Fixed |
| Expired pending selection remained stored | Popup removes stale/malformed/future pending data; expiry claim test passed. | Fixed |
| Extension links below 44 px | Current extension claim/matrix measures repaired popup controls; no regression found in tested popup. | Fixed |
| No one-click sample demo | Fresh landing CTA opens seeded `/demo/` in one click. | Fixed |
| 20-cue limit was global | Per-site limit claim passed with 20/1/20 site counts. | Fixed |
| Earlier unregistered public promises | Claims registry now has 18 entries and their exact tests pass. | Partly regressed: F-1-2 is a newly remaining unlisted phrase-matching claim. |
| No designed real 404 | Unknown live route returns styled HTTP 404. | Fixed |
| Required metadata absent | Current routes expose canonical, OG/Twitter, Apple-touch metadata. | Fixed |
| README import claim unregistered | `portable-backup-import` entry and tagged test now exist and pass. | Fixed |
| Active-tab/page-access boundary unregistered | `active-tab-boundary` entry and tagged test now exist and pass. | Fixed |
| Live ZIP rewritten to HTML | Live download is HTTP 200 `application/zip`; `unzip -t` passed. | Fixed |
| `npm test` failed from clean checkout | `npm test` runs `wxt prepare` then passed after clean `npm ci`. | Fixed |
| Offline shell and cache defect | Full Playwright matrix passed its fresh offline test; current service worker precaches built assets. | Fixed |
| Home/extension target-size defects | Home is repaired, but F-1-3 finds untested demo/legal/404 route regressions. | Regressed / open |
| Missing deployment security policy and MIME types | Live responses send CSP, Permissions-Policy, nosniff, and valid ZIP MIME. | Fixed |

## What would make this perfect

Move focus and announce every document route change, give every interactive target a reliable 44 px mobile hit area, register and prove phrase matching, finish the shared skeleton and sitemap, then apply the concrete plain-language rewrites and terminology table above. Re-run this full cold mobile/desktop, demo, claims, route, accessibility, request-log, and history checklist with no findings remaining.
