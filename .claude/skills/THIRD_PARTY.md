# Third-party skills

Each skill below was read in full (SKILL.md) and scanned (references, scripts) before install.
No network calls, credential reads or hidden instructions were found.

| Skills | Source | Commit | Licence |
| --- | --- | --- | --- |
| threejs-game-director, threejs-gameplay-systems, threejs-aaa-graphics-builder, threejs-game-ui-designer, threejs-debug-profiler, threejs-qa-release | github.com/majidmanzarpour/threejs-game-skills | 8286774 | MIT |
| game-ai, ai-behavior-trees-utility-ai, camera-systems, audio-design, shader-programming, performance-optimization, save-systems, level-design | github.com/gamedev-skills/awesome-gamedev-agent-skills (skills/disciplines) | d4b0e35 | Apache-2.0 (NOTICE kept) |

Not installed on purpose: threejs-3d-generator, threejs-image-generator, threejs-audio-generator
(paid Tripo / Gemini / ElevenLabs). Models and textures are built in code; sounds are CC0.

## Where these skills clash with CLAUDE.md (CLAUDE.md and the brief win)
- threejs-* assume TypeScript, desktop + mobile, and a "premium/AAA" visual bar. This project is
  plain JavaScript, PC only, and deliberately PS1-low-fi; read the scorecard through that style.
- threejs-game-director says to keep going instead of asking. Here: ask the owner first when
  unclear, and show mockup stills before any new screen, enemy or effect.
- threejs-game-director and threejs-aaa-graphics-builder point at the credential probe and the
  generator skills. Skip both; nothing external is generated.
- threejs-gameplay-systems' scaffold (create_threejs_game.py) is TypeScript; use it as reference only.
- awesome-gamedev examples are GDScript / C#; take the patterns, write them in JavaScript.
