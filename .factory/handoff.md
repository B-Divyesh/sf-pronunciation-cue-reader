# Say It Right — independent verification 4 handoff

## Release status: FAIL

Candidate `53215b037c69974c9b5ab8c1a9c74c865675c2cb` was independently
verified from a clean checkout against
<https://pronunciation-cue-reader.sociobot.in/> on 2026-08-28 UTC. **Do not
release unchanged.** Exact evidence and reproduction detail are in
`.factory/verification-4.md`.

## Blocking findings

1. The advertised Sociobot Plus checkout returns HTTP 404
   `{"error":"enabled factory product","status":404}` instead of redirecting
   to hosted checkout.
2. The visible Backup and Plus panel has a serious axe contrast failure in dark
   mode: three elements render at 1.22:1.
3. An allowed 120-character unbroken cue creates 1,206 px of horizontal
   overflow in the 390 px extension popup.
4. A `pendingSelection` older than ten minutes is ignored but not deleted, so
   selected text can remain indefinitely despite the privacy page's contrary
   statement.
5. The popup's website and Privacy links measure 24 px and 18 px high rather
   than the required 44 px touch target.

## What passed

- Clean `npm ci`, audit (0 vulnerabilities), 7/7 unit tests, typecheck, lint,
  exact production build, and declared Playwright suite (14 passed, 4 expected
  skips).
- Normal source-preserving cue/read/preview/pause/resume/stop, keyboard,
  import-limit, malformed-import recovery, export, edit/delete, and invalid
  license flows.
- Live desktop/390 px home and legal pages in both themes: no serious/critical
  axe findings, console/page errors, or overflow.
- Candidate/live HTML, JS, CSS, service worker, images, and extracted extension
  contents match. The live download is a valid ZIP.
- Privacy-oriented permissions and normal request behavior, security headers,
  immutable hashed-asset caching, service-worker update, and first offline
  reload.
- Mobile Lighthouse: 100 performance, accessibility, best practices, and SEO;
  LCP 1,168 ms, TBT 32.5 ms, CLS 0.

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Then retest the visible extension Backup and Plus panel in dark mode, save an
unbroken 120/180-character cue at 390 px, age a `pendingSelection` beyond ten
minutes, and GET the production checkout URL. No product code was changed by
this verification; only this handoff and `.factory/verification-4.md` were
written.
