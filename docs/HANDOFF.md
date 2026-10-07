# Handoff: milestone 0.1 Foundation

Written 2026-10-08 at the end of the first session (a Claude chat whose workspace could not reach
npm). Read this first, then CLAUDE.md and the brief, then continue 0.1.

## Done
- CLAUDE.md committed at the repo root.
- Brief read: "Lights Out at St. Agnes: Project Brief", linked in CLAUDE.md.
- Third-party skills read and installed in `.claude/skills/`; see `.claude/skills/THIRD_PARTY.md`
  for sources, licences and where they clash with CLAUDE.md. The paid generators were left out.
- Project skills made: `st-agnes-scare-rules`, `st-agnes-release`.
- `package.json` (no dependencies yet) and `CHANGELOG.md` started.
- Mockup stills for the 0.1 screens and effects are in `docs/mockups/stills/`, with their source
  in `docs/mockups/source/`. **They are not approved yet.**

## Owner decisions (2026-10-08)
- **Versioning:** 0.0.x for each Foundation commit, then tag `v0.1.0` when 0.1 ships to Pages.
- **Mockups:** one set of stills for all 0.1 screens and effects first. Build the plumbing
  meanwhile, but build no screen or effect until the owner approves its still.
- **Project skills:** made now, in 0.1.
- **GitHub push:** works; the Claude GitHub App is installed.
- **npm:** the owner set the Claude Code **Default** environment to Custom network access, with
  `registry.npmjs.org` allowed and the package-manager defaults ticked. If npm is still blocked,
  fall back to building and testing on GitHub Actions, and ask the owner first.

## Waiting on the owner
1. **Approve the stills** in `docs/mockups/stills/`, or name the ones to change:
   - `warning_en.png`, `warning_el.png`: content warning on first launch
   - `menu.png`: VHS-player main menu
   - `settings.png`: VCR on-screen-display settings menu
   - `game.png`: PS1 in-game look (320×180, 15-bit dither, fog, flashlight, VHS grain)
   - `debug.png`: debug overlay

   The in-game still was drawn without Three.js, so the vertex wobble and affine texture warp
   are not shown in it.
2. **Confirm the proposals** below. These were invented for the mockups and are not decisions yet:
   - F3 toggles the debug overlay.
   - Menu items: PLAY = new game, REWIND = continue/load, SETUP = settings, EJECT = extras/credits.
   - Settings tabs: Game / Controls / Audio / Video.
   - Proposed defaults: Normal difficulty, comfort off, subtitles on. Defaults lock at 0.2.
   - In `st-agnes-scare-rules`: the 90 s jump-scare cooldown, the 1.5 s reaction window and the
     warning cue for each enemy.
3. **Check that GitHub Pages is on**, with GitHub Actions as its source (a 0.1 hand-over item; not
   yet confirmed).

## Next for 0.1 (in order)
1. Scaffold: Three.js + Vite in plain JS, `vite.config.js` with `base: './'`, `index.html`,
   `src/main.js` (boot and loop), `assets/CREDITS.md`, and a Pages deploy workflow that runs on
   `v*` tags.
2. Playwright test runner: `npm test` through the Vite preview server, a boot test and a
   no-console-errors check.
3. i18n: `src/i18n/en.json`, `src/i18n/el.json`, a `t()` lookup and a test for missing keys.
   The Greek content-warning text is in `docs/mockups/source/screens.js`.
4. Save system and settings store: 3 slots + autosave, versioned JSON, a migration chain and a
   backup fallback, with round-trip and migration tests.
5. After the stills are approved: PS1 render pipeline, first-person controller, debug overlay,
   content warning, menus and settings UI.
6. Release 0.1 with the `st-agnes-release` skill.

Follow `st-agnes-release` for every commit: one commit, a version bump, a CHANGELOG line.
