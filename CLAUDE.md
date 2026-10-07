# Lights Out at St. Agnes

First-person PS1-style psychological horror for PC browsers. A man known only as "T. Hale" wakes as a
patient in St. Agnes (orphanage, then school, then asylum, in an unnamed English-speaking country).
He is already dead: he died there as a child and the building, which feeds on souls, kept him.
3–4 hours, 4 wings in fixed order (dorms, school, wards, basement), 3 endings + 1 secret.
The design brief (story, enemies, sanity, wings, milestones, hand-off, skills) is the doc
"Lights Out at St. Agnes: Project Brief": https://claude.ai/code/artifact/b3716875-c3cf-46df-a201-75179c3e14d1
Read it (Claude Docs connector) before starting any new system. The brief wins over this file on design;
this file wins on code rules.

## Pillars (every feature must serve one)
1. Your mind lies: sanity bends rooms, sounds and enemies.
2. Hunted, not armed: hide, sneak, distract, camcorder-flash stun. Never kill.
3. The building remembers: orphanage, school and asylum each have their own clues, ghosts, puzzles.
4. 90s tape horror: VHS grain, camcorder overlay, analog tech.

## Stack
- Three.js + Vite, plain JavaScript ES modules. PC only: keyboard + mouse. No phone, no gamepad.
- `vite.config.js` must keep `base: './'`. All asset paths relative. No absolute `/assets/...`.
- Hosting: GitHub Pages, built by GitHub Actions on each version tag.
- Repo: public `lights-out-st-agnes`. Free release on GitHub Pages.
- Cloud save: Firebase, optional login in settings. Local saves must work fully without login.
- Models and textures: built in code (low-poly + generated textures). No external 3D packs.
- Sounds: free CC0 libraries only (Freesound, OpenGameArt), Ogg. Log each in assets/CREDITS.md.

## Layout
```
src/
  main.js          boot, loop
  render/          PS1 pipeline (low-res target, vertex snap, affine warp, fog), post effects
  player/          controller, stamina, hide, lean, breath, inventory, flashlight, camcorder
  ai/              senses (hearing, sight, light), state machine, one file per enemy type
  sanity/          meter, hallucinations, room remapping
  levels/          wing data (rooms, doors, triggers, spawns) as JSON + loader
  audio/           positional audio, ambience, music stems
  ui/              menus, HUD, camcorder overlay, documents viewer, subtitles
  save/            slots, autosave, versioned schema + migrations, cloud adapter
  i18n/            en.json, el.json: ALL player-facing text lives here
  debug/           overlay (fps, enemy senses/state, triggers, sanity)
assets/            sounds (.ogg), textures, models; every file listed in assets/CREDITS.md
tests/             Playwright tests, one runner
```
- No file over ~400 lines. No long one-line functions. Readable names.
- Levels are data, not hard-coded scenes.

## Rules
- Never change anything the owner did not ask for. Ask first when a request is unclear; show a
  screenshot or mockup still for any new screen, enemy or effect before building it.
- Every string the player sees goes through i18n (English + Greek). Never hard-code text.
- Settings defaults are locked after the vertical slice; changing one needs a save migration.
- Save format is versioned JSON; each version bump adds a migration. Old saves must load.
- Every enemy warns (sound or visual) before it can kill. A fake (sanity) threat never kills.
- Jump scares need a setup and a cooldown. Comfort mode cuts them and slows enemies.
- Gore allowed: corpses, surgery, short kill animations. Harm to children is NEVER shown (aftermath only).
- Content warning on first launch. Real-clock events read local time only (no network).
- Flicker and flash effects obey the reduce-effects and flicker-off settings.
- Every sound or texture added gets a line in `assets/CREDITS.md` (source + licence).
- Keep the debug overlay working; when sprites/models/collision change, check it visually.

## Versions and git
- Semantic versioning: `0.MINOR.PATCH` until finished, `1.0.0` at release.
  New feature: MINOR +1 and PATCH to 0. Fix: PATCH +1.
- Every change: one commit with a clear message, a `CHANGELOG.md` line, version bumped in
  `package.json`. Tag releases `vX.Y.Z`. `main` must always build and run.

## Testing (before every release)
- `npm test` runs all Playwright tests through the Vite dev/preview server, never `file://`.
- Must cover: boot to menu, movement and controls, each puzzle solvable, enemy senses react
  (noise, light, gaze), save/load round trip incl. old-version migration, both languages render,
  no console errors.
- Performance: 60 fps target on a mid-range laptop with integrated graphics; measure every milestone.
- Balance targets (Normal): ~45 min per wing, 2–4 deaths per hour.
- Bot playthrough per wing: scripted route proves the wing can be finished.
- Owner plays every milestone on real hardware.

## Skills
Installed in `.claude/skills/` (read each before installing; third-party):
- threejs-game-skills (MIT): director, gameplay-systems, aaa-graphics-builder, game-ui-designer,
  debug-profiler, qa-release. Do NOT use its paid generators (Tripo, Gemini image, ElevenLabs).
- awesome-gamedev-agent-skills (Apache-2.0): game-ai, ai-behavior-trees-utility-ai, camera-systems,
  audio-design, shader-programming, performance-optimization, save-systems, level-design.
- Project skills (make with skill-creator): st-agnes-scare-rules, st-agnes-release.
Use deep-research for period detail, humanizer/stop-slop for in-game documents, dataviz for bot-run
balance charts, remotion-video-creation for the release trailer.

## Owner hands over
- 0.1: repo access, GitHub Pages on (Actions). 0.2: playtest PC, CC0 sound files (Claude cannot
  download from Freesound/OpenGameArt; give the owner a sound list per milestone). 0.6: Firebase config.

## Working with the owner
- Replies short and direct: what changed, what to test.
- Offer choices as quick multiple-choice / y-n questions.
- Report version numbers only when asked.
