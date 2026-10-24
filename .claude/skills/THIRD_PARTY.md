# Third-party skills

Each skill below was read in full (SKILL.md) and scanned (references, scripts) before install.
No network calls, credential reads or hidden instructions were found.

| Skills | Source | Commit | Licence |
| --- | --- | --- | --- |
| threejs-game-director, threejs-gameplay-systems, threejs-aaa-graphics-builder, threejs-game-ui-designer, threejs-debug-profiler, threejs-qa-release | github.com/majidmanzarpour/threejs-game-skills | 8286774 | MIT |
| game-ai, ai-behavior-trees-utility-ai, camera-systems, audio-design, shader-programming, performance-optimization, save-systems, level-design | github.com/gamedev-skills/awesome-gamedev-agent-skills (skills/disciplines) | d4b0e35 | Apache-2.0 (NOTICE kept) |
| i18n-sync, benchmark-optimization-loop | github.com/affaan-m/ECC (skills/), copied from the owner's vetted library github.com/ksainis2002-coder/claude-skills (bebf36a) | 76aaa77 | MIT |
| psx-horror-style | github.com/arjun988/blender-skills (.claude/skills/), via the owner's library (c4c633b) | 8f778d2 | MIT (LICENSE in folder) |
| karpathy-guidelines | github.com/multica-ai/andrej-karpathy-skills (skills/), via the owner's library (c4c633b) | 2c60614 | MIT (`license:` field; no LICENSE file upstream) |

Not installed on purpose: threejs-3d-generator, threejs-image-generator, threejs-audio-generator
(paid Tripo / Gemini / ElevenLabs). Models and textures are built in code; sounds are CC0.
From the library's other ECC skills, none else fits this game yet: its deep-research and
remotion-video-creation would shadow the anthropic-skills ones CLAUDE.md means; e2e-testing
quarantines flaky tests and targets DOM pages; browser-qa, canary-watch and vite-patterns are for
web apps (mobile breakpoints, webhooks, `base: '/'`).
Also skipped from the library: the 15 Superpowers skills (they trigger before any reply, tell the
agent not to check in between tasks, start subagents and commit their own plan files; the five
this game would use are already in the account as anthropic-skills) and the 38 Matt Pocock skills
(TypeScript and issue-tracker workflows; code-review clashes with the built-in /code-review,
git-guardrails blocks every push, the setup skills rewrite CLAUDE.md). Also free-game-asset-discovery
(library 354843c; read in full): it fetches 2D sprite packs for Phaser by script and lists sources
that are not CC0 (game-icons.net, soundimage.org); here every model and texture is built in code
and the owner brings the CC0 sounds from the lists in docs/SOUNDS_0.x.md.

## Where these skills clash with CLAUDE.md (CLAUDE.md and the brief win)
- threejs-* assume TypeScript, desktop + mobile, and a "premium/AAA" visual bar. This project is
  plain JavaScript, PC only, and deliberately PS1-low-fi; read the scorecard through that style.
- threejs-game-director says to keep going instead of asking. Here: ask the owner first when
  unclear, and show mockup stills before any new screen, enemy or effect.
- threejs-game-director and threejs-aaa-graphics-builder point at the credential probe and the
  generator skills. Skip both; nothing external is generated.
- threejs-gameplay-systems' scaffold (create_threejs_game.py) is TypeScript; use it as reference only.
- awesome-gamedev examples are GDScript / C#; take the patterns, write them in JavaScript.
- i18n-sync: en.json and el.json are flat key files; every new key goes into both in the same
  commit. Its optional Locakit CLI is not installed here; don't install it. Its "Related" links
  point at skills not installed.
- benchmark-optimization-loop: for frame-rate work, the baseline is the milestone's perf scenario
  (st-agnes-release step 4) and the gate is `npm test`; the owner's laptop is the real measure.
  Its `tools:` line pre-approves nothing.
- psx-horror-style is written for Blender. Here every model and texture is built in code
  (src/props/), and the VHS and camcorder look is src/render's post effects, which obey the
  reduce-effects and flicker-off settings. Its triangle and texture budgets are guides; the
  approved stills and the 60 fps target decide. Its related skills are not installed.
- karpathy-guidelines says the same as CLAUDE.md's rules: ask when unclear, change only what was
  asked, prove it with a test. Ask the owner as a quick multiple-choice or y/n question.
