# Third-party skills

Each skill below was read in full (SKILL.md, bundled scripts and reference docs) before install.
No hidden instructions, credential harvesting or data exfiltration were found.

| Skills | Source | Commit | Licence |
| --- | --- | --- | --- |
| threejs-game-director, threejs-gameplay-systems, threejs-aaa-graphics-builder, threejs-game-ui-designer, threejs-debug-profiler, threejs-qa-release | github.com/majidmanzarpour/threejs-game-skills | 8286774 | MIT |
| game-ai, ai-behavior-trees-utility-ai, camera-systems, audio-design, shader-programming, performance-optimization, save-systems, level-design | github.com/gamedev-skills/awesome-gamedev-agent-skills (skills/disciplines) | d4b0e35 | Apache-2.0 (NOTICE kept) |
| test-driven-development, receiving-code-review | github.com/obra/superpowers (skills/) | 2ce8aa1 | MIT (LICENSE in each folder) |
| karpathy-guidelines | github.com/multica-ai/andrej-karpathy-skills (skills/) | 2c60614 | MIT (`license:` field; README) |
| accessibility, benchmark-optimization-loop, browser-qa, canary-watch, click-path-audit, e2e-testing, i18n-sync, ui-demo, verification-loop, video-editing, vite-patterns | github.com/affaan-m/ECC (skills/) | 76aaa77 | MIT (`ECC-LICENSE`) |
| grill-me, grilling, diagnosing-bugs, prototype, wait-what | github.com/mattpocock/skills (skills/<bucket>/) | 5beb35b | MIT (LICENSE in each folder) |
| psx-horror-style | github.com/arjun988/blender-skills (.claude/skills/) | 8f778d2 | MIT (LICENSE in folder) |
| free-game-asset-discovery | github.com/kyssta-exe/skills (creative/) | 34dd0fb | MIT (stated in repo README; no LICENSE file) |

Not installed on purpose: threejs-3d-generator, threejs-image-generator, threejs-audio-generator
(paid Tripo / Gemini / ElevenLabs). Models and textures are built in code; sounds are CC0.

Matt Pocock's repo has 38 skills; only the 5 above fit here (code-review clashes with the built-in
/code-review and tdd repeats test-driven-development). All 38 are in the skills library.

ECC has 311 skills. All were vetted; only the 11 above fit this game. The full set is kept in a
separate skills library repo for other projects.

## Where these skills clash with CLAUDE.md (CLAUDE.md and the brief win)
- threejs-* assume TypeScript, desktop + mobile, and a "premium/AAA" visual bar. This project is
  plain JavaScript, PC only, and deliberately PS1-low-fi; read the scorecard through that style.
- threejs-game-director says to keep going instead of asking. Here: ask the owner first when
  unclear, and show mockup stills before any new screen, enemy or effect.
- threejs-game-director and threejs-aaa-graphics-builder point at the credential probe and the
  generator skills. Skip both; nothing external is generated.
- threejs-gameplay-systems' scaffold (create_threejs_game.py) is TypeScript; use it as reference only.
- awesome-gamedev examples are GDScript / C#; take the patterns, write them in JavaScript.
- e2e-testing suggests quarantining or skipping flaky tests. Never skip a test; fix it.
  Its TypeScript and multi-browser/mobile examples: this project is plain JS, Chromium, PC only.
- vite-patterns lists `base: '/'` as the default. This repo must keep `base: './'`.
- video-editing: use its FFmpeg/Remotion parts for the trailer only; never its ElevenLabs/fal.ai
  layer (paid). It mentions other ECC skills (fal-ai-media, videodb) that are not installed here.
- accessibility covers iOS/Android too; only the web parts apply (PC browser).
- test-driven-development says code written before its test gets deleted. That means new code in
  the current change only; never delete existing game code. Tests here are Playwright, not unit.
- The other Superpowers skills (brainstorming, plans, subagent execution, worktrees) are kept in the
  separate skills library, not here: they start subagents, skip check-ins or gate work behind
  design docs, which clashes with "ask the owner first". Verification comes from the account's
  `anthropic-skills:verification-before-completion`; for hard bugs use diagnosing-bugs (or the
  account's `anthropic-skills:systematic-debugging`).
- For the trailer and period research use `anthropic-skills:remotion-video-creation` and
  `anthropic-skills:deep-research`, as CLAUDE.md says.
- psx-horror-style is written for Blender assets. Apply its budgets, palette, fog and staging rules
  to the code-built models and the render/ pipeline; there is no Blender here. Its flicker and
  strobe ideas obey the reduce-effects and flicker-off settings, and its scares go through
  st-agnes-scare-rules.
- prototype commits to throwaway branches. Here prototypes stay on the working branch or in the
  scratchpad, never main, and a UI prototype counts as the mockup the owner sees before building.
- grilling asks rounds of numbered questions. Keep them short, with y/n or multiple-choice answers.
- wait-what expects a GLOSSARY.md; this repo has none, so it re-pitches in plain English only.
- diagnosing-bugs' HITL script is a bash template the owner runs; read it before running it.
- free-game-asset-discovery: use it only for sounds and music. Models and textures stay built in code.
  Take CC0 only (Kenney audio packs, OpenGameArt CC0, itch.io's CC0 music tag); skip its game-icons.net
  (CC BY) and soundimage.org (attribution, MP3) sources. Ogg only, and every file gets a line in
  assets/CREDITS.md. Claude cannot download from Freesound/OpenGameArt here, so it builds the list and
  the owner downloads. It was written for Hermes Agent: ignore `delegate_task` and `skill_manage`, and
  its Dungeon Market Tycoon manifest is just an example.
