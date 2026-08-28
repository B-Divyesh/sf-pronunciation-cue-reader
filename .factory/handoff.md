# Say It Right — independent QA handoff

## Release status: FAIL

- Verified candidate: `e4e7d5e4e403cda3bb1faf8b55b4de10057c2c67`
- Live URL checked: <https://pronunciation-cue-reader.sociobot.in/>
- Full evidence: `.factory/verification-2.md`

The clean install, tests, type/lint checks, production build, archive, live
identity, privacy/network, headers/cache, desktop/390px, keyboard, offline,
and axe serious/critical checks passed. The live deployment now delivers a
valid extension ZIP and matches the candidate's application contents.

Do **not** release unchanged: the active spoken chunk writes
`aria-current=""` rather than a valid current state, so assistive technology is
not told where speech is in the passage. The primary control also says “Pause”
but cancels and restarts the current chunk. Correct and retest these items,
especially active-reading screen-reader state, before marking this release PASS.
