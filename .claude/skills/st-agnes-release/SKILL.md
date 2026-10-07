---
name: st-agnes-release
description: Commit, version, test, tag and deploy routine for Lights Out at St. Agnes. Use for every change that gets committed (version bump + CHANGELOG line), and whenever the owner says release, ship, tag, deploy, publish, milestone done, or "put it on Pages". Also use before reporting a milestone as finished.
---

# St. Agnes release

`main` must always build and run, and every version must be traceable. This skill is the routine
for both everyday commits and milestone releases. CLAUDE.md is the source of the rules; this is the
order to apply them in.

## Every change (one commit each)
1. Make only the change the owner asked for.
2. Pick the version bump:
   - Inside a milestone that has not shipped yet: `0.(M-1).PATCH+1`
     (e.g. Foundation work is 0.0.1, 0.0.2 … until it ships as 0.1.0).
   - New feature after a release: MINOR +1, PATCH → 0. Fix: PATCH +1.
3. Bump `version` in `package.json`.
4. Add one line at the top of `CHANGELOG.md`: `- X.Y.Z — what changed, in plain words`.
5. If a sound or texture file was added: a line in `assets/CREDITS.md` (source, author, licence).
6. If the save format changed: bump the save schema version and add a migration + a test that an
   old save loads.
7. `npm run build` and `npm test` pass.
8. Commit with a clear message ending in the session attribution lines.

## Milestone release (0.1, 0.2 … 1.0.0)
1. Confirm every milestone item in the brief's Milestones section is done; list anything missing to
   the owner instead of tagging.
2. `npm test` passes in full: boot to menu, controls, each puzzle solvable, enemy senses, save/load
   round trip with old-version migration, both languages render, no console errors. Tests run
   through the Vite preview server, never `file://`.
3. Bot playthrough of each finished wing completes; record time per wing and deaths/hour against
   the targets (~45 min per wing, 2–4 deaths/hour on Normal). Chart with the dataviz skill.
4. Performance: measure fps in the production preview at the same scenario as last milestone;
   note it in the CHANGELOG entry. Target 60 fps on integrated graphics.
5. `vite.config.js` still has `base: './'`; no absolute `/assets/` paths
   (`grep -rn "\"/assets" src` is empty).
6. Debug overlay works but is off by default in the build.
7. Version `0.M.0` in `package.json`, CHANGELOG entry, commit, tag `v0.M.0`, push commit and tag.
   The GitHub Actions workflow builds and deploys to Pages on the tag.
8. Open the Pages URL and check it boots to the menu (a fresh browser profile: content warning
   shows on first launch).
9. Tell the owner: what changed, what to test on real hardware, and the sound list for the next
   milestone if it needs CC0 files.

## Never
- Tag with failing tests, or skip a test to make it pass.
- Force-push `main` or rewrite a pushed tag.
- Ship a settings-default change after 0.2 without a save migration.
- Report version numbers unless the owner asks.
