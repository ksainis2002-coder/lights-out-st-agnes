# Changelog

Newest first. One line per change.

- 0.1.8 — Building hum ambience as a seamless 30 s loop; credit added (licence to confirm).
- 0.1.7 — Batch-2 sound credits filled from the owner's links (owner confirmed CC0); merged the owner's edit on main.
- 0.1.6 — Sound batch 2: rain, wind, pipes and clock ambience as seamless loops, three distant thunders; sound script gains a stereo 'bed' loop mode. Credits await links.
- 0.1.5 — Owner confirmed all 19 batch-1 sound pages are CC0; credits updated.
- 0.1.4 — Sound credits filled in from the owner's Freesound links (licences still to confirm); merged the owner's edit on main.
- 0.1.3 — Fix: assets/sounds/incoming is no longer git-ignored, so the owner can keep pushing new downloads there.
- 0.1.2 — First CC0 sound batch (player, building, doors) cut and converted to 31 mono Ogg clips by tools/process-sounds.mjs; credits await source links.
- 0.1.1 — Handoff note: 0.1.0 is live on Pages; how releases are tagged from now on.
- 0.1.0 — Foundation release: Vite + Three.js, PS1 render pipeline, first-person controller, debug overlay, Playwright tests, i18n (EN/EL), save system, settings, content warning, VHS menu. Perf: 60 fps (16.7 ms) on Intel UHD Graphics, owner's laptop.
- 0.0.19 — Darker ambient light (owner playtest: "a little darker"); flashlight unchanged.
- 0.0.18 — Handoff note lists the extra plumbing done while 0.1 waits for owner testing.
- 0.0.17 — docs/SOUNDS_0.2.md: CC0 sound list for the owner to download for 0.2.
- 0.0.16 — Bot playthrough harness: scripted routes in tests/bot-routes walk the real controller and must finish; results saved to test-results/bot.
- 0.0.15 — Audio plumbing (no sounds yet): music/effects/voices buses in dB tied to the volume settings, ducking, limiter, HRTF positional playback, listener follows the camera.
- 0.0.14 — Fix flaky controls tests: tests step game time directly (game.advance) instead of waiting on real time.
- 0.0.13 — Tests run on GitHub Actions for every push and pull request; Three.js split into its own cached chunk.
- 0.0.12 — Handoff note updated: 0.1 built, release on hold for owner testing.
- 0.0.11 — Content warning (first launch), VHS main menu with pause/resume, VCR settings menu (4 tabs, key rebinding), comfort mode also turns on reduce effects and flicker off; all text in English and Greek.
- 0.0.10 — Debug overlay on F3 (fps, draws, tris, room, player, stamina, noise, triggers drawn in the world), trigger tracking, finer level faces for a gentler affine warp.
- 0.0.9 — First-person controller: mouse look, walk/run with stamina, crouch, lean, head bob, wall collision, noise level, flashlight on F; all keys from settings.
- 0.0.8 — PS1 render pipeline (320×180 target, vertex snap, affine warp, 15-bit dither, fog, VHS grain/bleed), generated textures, data-driven test corridor, flashlight.
- 0.0.7 — Recorded owner decisions: all 0.1 stills approved, settings defaults accepted, comfort mode also reduces effects and flicker.
- 0.0.6 — Save system (3 slots + autosave, versioned JSON, migration chain, backup fallback) and settings store with proposed defaults; round-trip and migration tests.
- 0.0.5 — i18n tables (en, el) with t() lookup, fallback to English, placeholders, and missing-key and render tests.
- 0.0.4 — Playwright test runner (npm test via Vite preview), boot and no-console-errors tests; deploy runs tests first.
- 0.0.3 — Vite + Three.js scaffold (base ./), boot and main loop, assets/CREDITS.md, Pages deploy workflow on v* tags.
- 0.0.2 — Mockup stills for 0.1 screens (awaiting approval) and docs/HANDOFF.md for the next session.
- 0.0.1 — Project rules (CLAUDE.md), vetted third-party skills, project skills st-agnes-scare-rules and st-agnes-release.
