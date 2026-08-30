# Say It Right

Say It Right is a local-first Chrome/Chromium extension for dyslexic,
low-vision, and language-learning readers who need names, abbreviations, and
technical terms pronounced consistently. Select a short passage, open the
extension, and listen while spoken chunks are highlighted. If a voice gets a
term wrong, save a site-specific phonetic spelling or replacement and preview
it in any voice installed in the browser.

The extension does not send selected text or cues to a server.

Try the isolated sample reader at [/demo/](/demo/). Its Kubernetes,
PostgreSQL, and NASA sample uses only the `demo:` browser-storage namespace.
Use **Reset demo** to restore it or **Start for real** to discard it before
installing the extension.

## Features

- Reads selected text with visible chunk progress; reading can pause, resume,
  or stop.
- Stores a private per-site pronunciation glossary in extension-local storage.
- Adds, previews, edits, and deletes cues; warns that IPA realization is
  voice-engine dependent.
- Works from the toolbar, `Alt+Shift+S`, or the selection context menu.
- Exports a JSON backup when you request it and imports portable backups.
- Includes 20 site cues per website. Every cue stays scoped to the site where
  you saved it.
- Supports keyboard use, 200% text zoom, and reduced motion.

## Develop

Requirements: Node.js 20+, npm, and a Chromium browser.

```bash
npm ci
npm run dev          # WXT extension dev mode
npm run dev:site     # landing site at http://localhost:5173
npm test             # unit tests
npm run typecheck
npm run lint
npm run test:e2e     # desktop + 390px accessibility/browser tests
npm run build
```

`npm run build` is the canonical build command. It creates:

- `dist/extension/` — unpacked Manifest V3 extension
- `dist/site/` — deployable static site, with `index.html` at its root
- `dist/site/downloads/say-it-right.zip` — packaged extension linked by the site

The static deploy root is `dist/site`. No environment variables are required to
build.

The deployment build command is `npm ci && npm test && npm run build:site`.
`build:site` deliberately also builds and packages the extension, so the
deployable directory always contains the ZIP linked by the landing page.

## Load the extension locally

1. Run `npm run build`.
2. Open `chrome://extensions` and enable Developer mode.
3. Choose **Load unpacked** and select `dist/extension`.
4. Open a normal web page, select some text, and click the Say It Right icon.

The extension deliberately asks for `activeTab`, storage, context-menu, and
scripting permissions only. It has no broad host permission. Chrome keeps
page access off until you open the reader or choose the selected-text context
menu.

## Project map

- `entrypoints/` — WXT background and popup entrypoints
- `src/lib/` — glossary and chunking logic
- `site/` — landing, privacy, and terms pages
- `assets/src/` — original generated artwork and provenance
- `.factory/design.md` — product-specific visual system
- `.factory/demo.md` — sample data and isolated demo behavior
- `.factory/handoff.md` — verification and release handoff

## Privacy

See the published `/privacy/` and `/terms/` pages, or their source under
`site/`. Code is licensed under the [MIT License](LICENSE). Generated hero art
is original to this product; prompt and provenance are recorded in
`.factory/design.md` and `assets/src/`.
