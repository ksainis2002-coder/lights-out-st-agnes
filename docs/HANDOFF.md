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

## Owner decisions (2026-10-07, second session)
- **All six stills approved** as drawn: warning (en, el), menu, settings, game, debug.
- Menu items approved: PLAY = new game, REWIND = continue/load, SETUP = settings, EJECT = extras/credits.
- Settings tabs approved: Game / Controls / Audio / Video.
- **Comfort mode** cuts jump scares and slows enemies, and turning it on also switches on
  reduce effects and flicker off (the player can turn those two back off by hand).
- **F3** toggles the debug overlay (off by default in builds).
- **Settings defaults accepted** as in `src/save/settings.js` (English, Normal, comfort off,
  subtitles on, reduce effects off, flicker off off, FOV 70, sensitivity 1.0, invert Y off,
  volumes 80%, brief's key layout). They lock at 0.2.
- Scare-rule timings (90 s cooldown, 1.5 s reaction window, enemy cues): deferred to 0.2.
- GitHub Pages is on with GitHub Actions as its source.

## Next for 0.1 (in order)
1. ~~Scaffold~~ done in 0.0.3 (Vite 8, Three.js 0.186, deploy workflow runs `npm test` then builds).
2. ~~Playwright runner~~ done in 0.0.4 (`@playwright/test` pinned to 1.56.1 to match the
   pre-installed Chromium 1194; WebGL via SwiftShader).
3. ~~i18n~~ done in 0.0.5. Only the content-warning strings exist; menu and settings strings get
   added with their screens once the owner confirms the names.
4. ~~Save system and settings store~~ done in 0.0.6 (`src/save/`). Settings defaults are the
   proposals above and are not locked yet. `window.__stAgnes` exposes saves, settings and i18n for tests.
5. ~~PS1 pipeline, controller, debug overlay, warning, menu, settings~~ done in 0.0.8–0.0.11.
   Choices made without asking (owner may change): REWIND/EJECT greyed as "not on this tape yet";
   VCR words stay English in Greek; settings footer adds "TAB PAGE".
6. **Release 0.1: on hold.** Owner is testing the branch on real hardware first (2026-10-07).
   When they say go: PR into `main`, owner merges, then version 0.1.0 + tag `v0.1.0` on `main`.
   Perf not measured on a GPU yet (container uses SwiftShader: ~13 fps, 4 draws, 2.4k tris).

Follow `st-agnes-release` for every commit: one commit, a version bump, a CHANGELOG line.
