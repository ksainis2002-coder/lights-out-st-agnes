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
6. **0.1.0 shipped** on 2026-10-08: PR #1 merged, tag `v0.1.0`, live at
   https://ksainis2002-coder.github.io/lights-out-st-agnes/ (owner confirmed it boots).

## Release notes for next time
- Cloud sessions cannot push tags (the push hangs up). The owner creates the tag by publishing a
  GitHub release (Releases → Draft a new release → tag `vX.Y.Z` on `main`).
- The `github-pages` environment now allows tags `v*` (owner added the rule on 2026-10-08).
- github.io is blocked from the session network; the owner checks the live site.

## Next: 0.2 vertical slice
**0.2 stills approved (2026-10-09):** intro_wake, hub, dorm (revised: smaller + messier), tommy,
low_sanity, rewind — see `docs/DESIGN_0.2.md` for the design picks. UI stills (prompt, inventory,
journal, document, save) approved too. Building 0.2 in the order listed in DESIGN_0.2.md. Step 1 (use, doors, levels, wing layout) done in 0.1.21; step 2 (sounds) in 0.1.23; step 3 (inventory, keys, journal, documents) in 0.1.24; step 4 (tape saves, REWIND, checkpoints) in 0.1.29; step 5 (sanity) in 0.1.31; step 6 (ghost children, Tommy) in 0.1.34. Scare cooldown is 90 s (proposal, still to confirm with the owner when balancing). Owner wants a downloadable Windows app near release (DESIGN_0.2.md).

All sounds in `docs/SOUNDS_0.2.md` are in (58 clips in `assets/sounds/`, all credited and
CC0-confirmed by the owner). Next: owner says "start 0.2", then mockup stills for the intro,
patient room hub and dorms before building them. Sound routine: owner pushes files to
`assets/sounds/incoming/` on this branch (each under 100 MB), Claude adds a manifest entry, runs
`node tools/process-sounds.mjs <ids>`, removes incoming, credits with the owner's links, and asks
the owner to confirm CC0 (freesound.org is blocked from the session). The owner's clone lives in
`C:\Windows\System32\lights-out-st-agnes`; long pasted lines get split, so keep commands short. Start with mockup stills for the
intro, patient room hub and dorms (ghost children, Tommy) before building them.

## Extra plumbing done while waiting (0.0.13–0.0.17, no approval needed)
- CI: `.github/workflows/test.yml` runs `npm test` on every push and PR.
- Three.js in its own chunk. `game.advance(seconds)` steps game time at 60 Hz for tests and bots.
- Audio mixer (`src/audio/`): music/effects/voices buses in dB, ducking, limiter, HRTF playback.
  No sound files yet.
- Bot harness: `tests/bot-routes/*.json` routes walk the real controller; results go to
  `test-results/bot/`.
- `docs/SOUNDS_0.2.md`: the CC0 sound list for the owner (0.2 hand-over item).

Follow `st-agnes-release` for every commit: one commit, a version bump, a CHANGELOG line.

**0.2 owner playtest (2026-10-11):** whole wing in 10 minutes, 0 collapses, 60 fps (Intel UHD).
**Settings defaults locked (2026-10-11):** as in `src/save/settings.js`. Changing one needs a
SETTINGS_VERSION bump and a migration.

**Owner decisions (2026-10-11, late):** the 3:00 secret room stays in 0.6 as the brief plans (the quiet
room is only the lullaby puzzle's reward room). The first-draft ink blot (spilling over "Age") is kept.

**Next session plan (after the owner approves the latest fixes):**
1. Owner replays wing 1 on a new game (incl. Tommy leading to Rose's bed for the quiet-room notes):
   time, collapses, fps; any last fixes.
2. Open the pull request `claude/hopeful-keller-xpdeeg` → `main` for 0.2.0; owner merges it.
3. Version 0.2.0 + CHANGELOG; owner publishes release `v0.2.0` in GitHub Releases (Pages deploys);
   check the Pages build boots in a fresh browser (content warning first).
4. Write `docs/SOUNDS_0.3.md`: the CC0 sound list for 0.3 (school wing: watcher statue, Maggie's
   rhymes, courtyard, cemetery) for the owner to download.
5. Start 0.3 with mockup stills: classrooms, the watcher, Maggie, courtyard/cemetery.

**0.2.0 ready (2026-10-12):** pull request from `claude/hopeful-keller-xpdeeg` to `main`. Owner merges it,
then publishes release `v0.2.0` in GitHub Releases (target `main`), which deploys Pages. Next: the 0.3
CC0 sound list (`docs/SOUNDS_0.3.md`) and the 0.3 mockup stills (school wing).

**0.3 started (2026-10-13):** mockup stills in `docs/mockups/stills-0.3/` (classroom, blackboard,
watcher, watcher_close, maggie, courtyard, cemetery), shot with `node tools/shoot-stills.mjs`. Mockup
levels live in `src/mockups/levels/` (not loaded by the game or the level tests). Next: owner approves
the looks and picks the 0.3 choices, then the school wing is built level by level.

**0.3 plan proposed (2026-10-13):** owner approved the first seven 0.3 stills and picked (c) Tommy's grave
worn unreadable and (a) the watcher's catch: a short grab, then the rewind. The wing plan, the watcher's
rules, the four puzzles and the build order are in `docs/DESIGN_0.3.md` with the plan
`docs/mockups/stills-0.3/wing_map.png` and five more stills (watcher_grab, storm, ui_codeLock, library,
gym), all waiting for the owner. Build nothing of 0.3 until they are approved.

**0.3 decided (2026-10-14):** owner answered every open question in a Q&A session; all of it is in
`docs/DESIGN_0.3.md` (bigger wing: about 60 min, an upstairs, music room with a piano puzzle, nurse's
and art rooms, three set pieces, Maggie as guide and trickster, the watcher's full rules). Order:
wing 1 furniture pass → content sheet (names, documents, rhymes in EN + EL) for approval → part A
(courtyard + ground floor) → part B (upstairs) → part C (cemetery), each with stills first and an
owner playtest after. The wing map gets redrawn with the new rooms before part A.

**Content sheet (2026-10-14):** the wing 2 content sheet is the Claude Doc "Wing 2 Content Sheet (0.3)",
https://claude.ai/code/artifact/9cc99d43-ea28-458a-b2bb-2ade5c73785c . The owner reviews it (edits inline,
comments, ticks its checklist). Next: carry the approved text into en.json / el.json, redraw the wing map
with the new rooms, then part A stills.


**Part A approved (2026-10-14):** the redrawn wing map (0.2.12), the part A room stills (0.2.13) and the
puzzle close-ups (0.2.14) are approved; piano stickers carry a shape per colour; every puzzle that reads
better up close gets a close-up (owner request), wing 1's fuse box included (0.2.16). Waiting on the
owner: the content sheet checklist, the wing 1 playtest (then the pull request that puts 0.2.x on
Pages) and the priority 1 sounds. Next: build part A (courtyard + ground floor).

**Part A1 built (2026-10-15):** the garden door, the grounds and the school's ground floor are in the game
(0.2.17), all furnished, no puzzles yet. Next: A2 (library, piano, hopscotch, the boards, painting, desk,
coat and drawer), then A3 (Maggie, the watcher, sounds as placeholders, bot route), then the owner's
part A playtest.

**Part A2 built (2026-10-15):** the library, piano and hopscotch puzzles with their close-ups, Maggie's desk,
the counting board, the class painting, the coat and the staff-room drawer, six documents and three items
(0.2.18). Next: A3 (Maggie's rhymes and lines, the watcher, the part A bot route).

**Part A3 so far (2026-10-15):** Maggie sings her rhymes (0.2.19) and the watcher hunts the ground floor
(0.2.20), with placeholder sounds until the priority 1 files arrive. Next: chalk on the boards (hints,
taunts), Maggie's Class 1 trick, the part A bot route and a performance check; then the owner's part A
playtest.

**Part A built (2026-10-19):** the owner approved the chalk and Classroom 1 stills; Maggie's chalk on
the corridor boards and her Classroom 1 trick are in (0.2.23). Part A is complete. Waiting on the owner:
the part A and wing 1 playtests (checklist in the Claude Doc "Part A Playtest Checklist"), fps on the
playtest laptop, the content sheet, and the priority 1 sounds (Claude Doc "Sound List for 0.3 (School
Wing)"). Then the pull request that puts 0.2.x on Pages, and part B stills.

**Part B stills (2026-10-24):** the owner asked to start part B. Nine stills of the first floor
(0.2.26; see "Part B stills" in `docs/DESIGN_0.3.md`) are approved, with a proper headmaster's
chair (0.2.28). The owner said build (2026-10-24). B1 is in (0.2.31): the first floor, stairs both
ways, the office locked by the headmaster's key, the plan in the staff room ("Part B1 as built" in
`docs/DESIGN_0.3.md`). Then B2 the records lock and the part B documents (0.2.32), B3 the bell, roll
call and film (0.2.33), B4 the storm (0.2.34), the watcher between floors, the part B bot route and
a performance check (0.2.35). Part B is built. Waiting on the owner: the part B playtest (checklist and
five tuning picks in the Claude Doc "Part B Playtest Checklist"; the part A and wing 1 playtests are
still open), the content sheet's checklist, the sounds. The owner confirmed the set pieces' 30 s
cooldown and the watcher staying on her floor when she is not close (2026-10-24). Next: part C
(the cemetery: graves, lanterns, the lamb and file page, the watcher at the chapel and outside in
the storm, the hub's drawings and decay), stills first.
**School wing sounds, priority 1 (2026-10-24):** the owner pushed the 49 files (ecadb37). They are cut
by `tools/process-sounds.mjs` (new `cut` mode for single hits; `start` and `maxLength` per source) and
play in place of the stand-ins, each about as loud as the stand-in it replaced (0.2.38). Waiting on the
owner: the download links and a CC0 check (the CREDITS rows say "link to come"). Next sounds: priority 2.
**Part C stills (2026-10-27):** the owner asked to start part C. Eleven stills of the cemetery
puzzle, the lamb and file page 2, the watcher outside and at the chapel, and the hub on your return
(0.2.40; see "Part C stills" in `docs/DESIGN_0.3.md`). All approved (2026-10-27), with the hub's
skipping girl as its only new drawing and its decay as drawn. Next: build part C, starting with the
owner's note that the buildings outside have no depth from the side.
**Doors home (2026-10-27):** the owner asked whether the school has a safe room and wants each part
connected to the hub so its changes stay in view. Proposal stills (0.2.41; see "Doors home" in
`docs/DESIGN_0.3.md`): the hub's door in the staff room and the head's flat, the staff room through
the hub's open door, or a crayon-marked safe room instead; the hub after parts A, B and C. The owner
picked doors home in the staff room and the flat, and the hub changing after each part (1a, 2a).
**Buildings outside (0.2.43):** the owner's note on the part C stills is fixed: bodies behind the
facades with side walls, windows, slate roofs and chimneys (see "Buildings outside" in
`docs/DESIGN_0.3.md`); before/after stills sent for a y/n.
**Doors home and the hub's changes (0.2.44):** built as picked (see "Doors home and the hub's
changes as built"). Next: the cemetery puzzle (sets `puzzle_lanterns`), the watcher outside.
**Cemetery puzzle (0.2.46):** the five lanterns, Agnes's slab, the stone lamb and file page 2 are in
the game (see "The cemetery puzzle as built"). Next: the watcher outside in the storm and at the
chapel door, the part C bot route, the doors home on the map.
**The watcher outside (0.2.47):** she comes into the cemetery by its gate in the storm, hunts the
grounds, and stands at the chapel door after the lamb (see "The watcher outside as built"). Next:
the part C bot route and checklist, the doors home on the map.
A fix on the way (0.2.30): the journal's map page in the courtyard threw errors once the hall plan
was taken.
