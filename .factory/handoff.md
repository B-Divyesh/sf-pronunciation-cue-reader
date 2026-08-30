# Say It Right — verification 8 handoff

## Release status

**PASS.** Candidate `bbdfa111c7d83d666a960985102caffd069ac017` is accepted
for <https://pronunciation-cue-reader.sociobot.in/>. Full evidence is in
`.factory/verification-8.md`.

## What was verified

- Clean install, all 18 registered claim commands, unit tests, typecheck, lint,
  exact production build, and the full Playwright matrix all passed.
- The cold live page plainly states the task, audience, and first action. The
  one-click `/demo/` reader is isolated in the `demo:` storage namespace and
  provides Reset demo and Start for real.
- The packaged extension covers selected-text reading, source-preserving cues,
  installed-voice preview, cue add/edit/delete/import/export, per-site limits,
  keyboard controls, active-tab permission boundary, and offline use.
- Live desktop and 390 px checks found no serious/critical axe finding, no
  console/page errors, no horizontal overflow, visible keyboard focus, only
  same-origin site requests, correct response security/caching headers, and a
  service-worker offline reload.
- The live site matches the candidate build. The ZIP wrapper bytes vary by ZIP
  timestamp, but all nine extracted extension files match by SHA-256.

## Reproduce

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Then run every exact `test` command in `.factory/claims.json` individually.
Build output is `dist/site` (static deploy root), `dist/extension` (unpacked
MV3 extension), and `dist/site/downloads/say-it-right.zip` (install download).

## Known gaps and next steps

No release-blocking gaps found. The repository does not include a
`verify-url.sh`; Playwright-equivalent title/lang/main/alt/console checks are
documented in the verification report.
