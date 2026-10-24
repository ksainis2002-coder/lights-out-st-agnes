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

Not installed on purpose: threejs-3d-generator, threejs-image-generator, threejs-audio-generator
(paid Tripo / Gemini / ElevenLabs). Models and textures are built in code; sounds are CC0.

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
  design docs, which clashes with "ask the owner first". Debugging and verification come from the
  account's `anthropic-skills:systematic-debugging` and `anthropic-skills:verification-before-completion`.
- For the trailer and period research use `anthropic-skills:remotion-video-creation` and
  `anthropic-skills:deep-research`, as CLAUDE.md says.
