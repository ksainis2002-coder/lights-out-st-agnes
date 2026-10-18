# Third-party skills

Each skill below was read in full (SKILL.md, bundled scripts and reference docs) before install.
No hidden instructions, credential harvesting or data exfiltration were found. Network calls exist
only in opt-in scripts and go only to the service each skill names (listed below).

| Skills | Source | Commit | Licence |
| --- | --- | --- | --- |
| threejs-game-director, threejs-gameplay-systems, threejs-aaa-graphics-builder, threejs-game-ui-designer, threejs-debug-profiler, threejs-qa-release | github.com/majidmanzarpour/threejs-game-skills | 8286774 | MIT |
| game-ai, ai-behavior-trees-utility-ai, camera-systems, audio-design, shader-programming, performance-optimization, save-systems, level-design | github.com/gamedev-skills/awesome-gamedev-agent-skills (skills/disciplines) | d4b0e35 | Apache-2.0 (NOTICE kept) |
| All 311 folders from ECC `skills/` (accessibility … x-api) | github.com/affaan-m/ECC (skills/) | 76aaa77 | MIT (`ECC-LICENSE`), exceptions below |

ECC licence exceptions (per-skill `license:` field or file wins over the root MIT):
- Apache-2.0 (author "evos"): carrier-relationship-management, customs-trade-compliance,
  energy-procurement, inventory-demand-planning, logistics-exception-management,
  production-scheduling, quality-nonconformance, returns-reverse-logistics.
- CC-BY-SA-4.0: osint-investigation (adapted from shoyann/RZK-The-Hunter; `LICENSE.txt` kept).
- Credited upstreams under MIT: react-performance (Vercel Labs), postgres-patterns (Supabase).
  ck comes from sreedhargs89/context-keeper with no upstream licence stated; ECC ships it under MIT.

ECC was installed by hand: the skillsmp.com installer page was unreachable from this environment.
Copied unchanged; no names collide with the skills above.

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

### ECC
Name clashes:
- security-review is an ECC web/Next/Supabase checklist with the same name as the built-in
  `/security-review`; this project copy may shadow it.
- deep-research (needs Firecrawl/Exa MCP) and remotion-video-creation share names with the
  anthropic-skills versions CLAUDE.md means. Use `anthropic-skills:deep-research` and
  `anthropic-skills:remotion-video-creation`.

Paid or cloud services; do not use (CLAUDE.md: no paid generators, sounds CC0, models in code):
- fal-ai-media, exa-search, taste / taste-application / taste-distillation / tasteforge-video (fal.ai),
  video-editing's ElevenLabs/fal layer (its FFmpeg/Remotion parts are fine), videodb (uploads to
  VideoDB cloud; its capture mode records screen + mic), nutrient-document-processing, ui-to-vue
  (DashScope), codehealth-mcp (CodeScene token).

Personal data or outward posting; do not use:
- messages-ops, lead-intelligence, connections-optimizer, social-graph-ranker, osint-investigation,
  visa-doc-translate (says to run without asking), x-api, crosspost, social-publisher. email-ops and
  google-workspace-ops only on an explicit owner request (draft first).

Allowed-tools pre-approvals while the skill is active:
- inherit-legacy-style: Read, Glob, Grep, Bash, Edit, Write, AskUserQuestion.
- videodb: `Bash(python:*)`.

Hooks and background agents. None is registered; never wire these into settings.json:
- delivery-gate (Stop hook blocks finishing when disk < 15 GB; deadlocks small containers),
  plankton-code-quality (blocks npm), ck (SessionStart injection), continuous-learning and
  continuous-learning-v2 (log every tool call), gateguard, hookify-rules, plan-canvas,
  safety-guard, strategic-compact.
- continuous-learning-v2's observer spawns `claude --print` with Read/Write in the background
  without asking (off by default; keep it off). skill-comply runs `claude -p` with Bash and
  LLM-written setup commands; don't run it here.

Multi-agent skills (CLAUDE.md: no subagents unless the owner asks): orch-*, plan-orchestrate,
santa-method, council, dev-team, team-builder, team-agent-orchestration, parallel-execution-optimizer,
ralphinho-rfc-pipeline, gan-style-harness, claude-devfleet, rules-distill, skill-stocktake,
search-first, opensource-pipeline.

Global installs or downloads (owner OK first): configure-ecc, security-scan (`npx ecc-agentshield`;
`init` writes CLAUDE.md/settings.json), unified-memory, social-publisher, token-card, repo-scan,
nasiko-control-plane, flox-environments, frontend-slides' export-pdf.sh (`npx playwright install`).

May edit CLAUDE.md or settings; ask the owner first: codebase-onboarding, inherit-legacy-style,
agentic-os, living-docs-governance, security-scan. knowledge-ops writes `~/.claude` memory and can
push a knowledge-base repo; only on request.

Process and code style:
- e2e-testing and windows-desktop-e2e suggest skipping or quarantining flaky tests. Never skip a test.
- tdd-workflow commits per RED/GREEN/refactor stage; orch-*, tdd-workflow and others set 80%
  coverage. Here: one commit per change with a CHANGELOG line and version bump.
- git-workflow, conventional-commit-review and orch-* use Conventional Commits. Follow this repo's
  commit style and st-agnes-release instead.
- coding-standards says never mutate. In the game loop, reuse vectors and objects in place to avoid GC.
- vite-patterns lists `base: '/'` as the default. This repo must keep `base: './'`.
- Noisy auto-triggers (ignore unless asked): agent-self-evaluation, agent-architecture-audit,
  growth-log, flox-environments, documentation-lookup, frontend-design-direction, token-budget-advisor.
- Several skills (ck, rules-distill, skill-stocktake, ecc-guide, ecc-recipes, nanoclaw-repl,
  skill-host-compat) expect `~/.claude/skills` or the ECC repo checkout; from here they are inert.

Off-stack (reference only): TypeScript/React/Vue/Angular/Next/Nuxt, Django/Laravel/Rails/Spring/Quarkus,
Java/Kotlin/Swift/Dart/Perl/Rust/Go/C++/C#/Python, databases, Kubernetes/networking, finance,
logistics, healthcare, legal, Windows desktop and macOS Resolve tooling.
