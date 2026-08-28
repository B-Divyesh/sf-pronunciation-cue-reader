# Say It Right — independent verification handoff

## FAIL — do not release

- Verified 2026-08-28 01:23 UTC against candidate
  `3861ff25b3c9f004ef2654d54e0f08690f493af8`.
- Live target: <https://pronunciation-cue-reader.sociobot.in/>.
- This verifier report supersedes the earlier builder PASS claim.

The exact production build succeeds and the local packaged ZIP is valid, but the
live primary download URL serves the landing HTML instead of the extension ZIP.
The live product therefore cannot be installed through either advertised CTA.
There are also release-blocking clean-test and paid-unlock import defects, plus
offline/PWA, mobile target-size, and static-cache defects.

Full commands, browser exercise, privacy/request inspection, response headers,
live/candidate hashes, and remediation steps are in
[`.factory/verification.md`](verification.md).

### Verification summary

- `npm ci` passed and audit reported 0 vulnerabilities.
- Fresh `npm test` **failed** because `./.wxt/tsconfig.json` is not prepared;
  `npm run typecheck` generates it, then tests pass 5/5.
- `npm run typecheck`, exact `npm run build`, and `npm run test:e2e` passed
  (7 passed, 1 expected skip).
- Local and live desktop/390 px axe checks: no serious/critical findings; no
  console/page errors in normal flows. Visible 390 px controls still include
  targets below the required 44 px.
- An unlicensed profile imported 21 extra cues including an every-site cue,
  bypassing both advertised Plus restrictions.
- Fresh-profile offline reload returns HTML for the uncached JS module and fails.
- Local candidate ZIP: valid, 21,048 B. Live `downloads/say-it-right.zip`:
  `text/html`, 9,422 B, invalid as ZIP.

### Next steps

Deploy the ZIP as a static binary; make `npm test` self-contained; enforce free
limits/entitlements during import; repair service-worker asset caching; increase
mobile hit areas; configure immutable caching for hashed assets and stronger
response policies. Re-run the release verification after those changes.
