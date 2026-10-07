---
name: st-agnes-scare-rules
description: Rules every scare, threat, kill, sanity effect, flash or gore beat in Lights Out at St. Agnes must pass. Use whenever you add or change a jump scare, enemy, enemy sense or kill, hallucination or fake threat, death rewind, flicker/flash effect, gore, ghost-child event, real-clock event or fourth-wall glitch, even if the request does not say "scare". Also use when reviewing a wing's pacing.
---

# St. Agnes scare rules

The game is dread first, with many jump scares that are earned. A scare that breaks a rule here
makes the game feel cheap or unfair, or crosses a content line, so check every new beat against
this list before building it and again before committing it.

## 1. Every jump scare has a setup and a cooldown
- **Setup:** at least one tell before the hit: a sound cue, a light change, or music dropping to
  silence. Random scares with no tell numb the player.
- **Cooldown:** a global scare timer. No new jump scare until it expires (proposed start: 90 s on
  Normal; owner confirms in 0.2, then tune with bot runs). Scripted story beats may override, but log it.
- Register every scare in the wing's level data (`src/levels/`) with `setup`, `cooldownGroup` and
  `comfort` fields. Never hard-code a scare in a system file.

## 2. Fair threats warn before they can kill
Each hunter has one learnable rule; the warning must match its sense. The cues and timings below
are proposals, not owner decisions: confirm each with a mockup and a quick pick when that enemy is
built, then update this table.

| Threat | Sense | Warning before a kill is possible |
| --- | --- | --- |
| Surgeon (blind hunter) | sound | tool clinking / breathing, positional, audible through one wall |
| Burned nun | light | crackle + warm flicker at the edge of view when she locks on the flashlight |
| Watcher statue | gaze | stone grind each time it moves; first kill only after it has moved in view of the camera once |
| Ghost children | scripted | never kill; they drain sanity, block, or hint |

- A kill needs: warning played → player had time to react (≥ 1.5 s on Normal) → contact.
- The debug overlay must show hearing radius, view cone and state for each enemy (CLAUDE.md).

## 3. Fake threats never kill
Sanity hallucinations (fake enemies, fake sounds, remapped rooms) can chase and scare but can
never deal damage or trigger a death. Give each fake a learnable tell (no footstep echo, no
positional audio, flicker on the camcorder screen). Write a test that a fake contact never
reduces health.

## 4. Content lines
- Gore allowed: corpses, surgery scenes, short player kill animations (1–2 s per enemy).
- **Harm to children is never shown.** Aftermath and implication only: drawings, empty beds,
  files, sounds off-screen. If a beat needs a child to be hurt on screen, redesign it.
- Ghost children may be frightening (faceless, sudden, whispering) but are victims, not monsters.

## 5. Comfort and accessibility settings must win
- **Comfort mode:** cut jump scares to scripted story beats only, slow enemies, flicker and flash
  off.
- **Reduce effects / flicker off:** every flicker, strobe, camcorder flash, lightning and glitch
  checks these settings. Replace with a steady dim or a fade, never just remove the tell (the
  warning must still exist).
- Every whisper is subtitled through i18n (English + Greek).

## 6. Real clock and fourth wall
- Real-clock events (00:00–04:00) read the player's local time only. No network calls.
- Fake crash / tape-eject screens must be dismissable, never actually hang input for more than a
  few seconds, and respect reduce-effects.

## 7. Death is short and teaches
Kill animation (1–2 s) → VHS rewind to the checkpoint → a ghost child whispers what killed you
(subtitled). The player should know which rule they broke.

## Checklist before committing a scare or threat
- [ ] Setup tell exists and fires before the hit
- [ ] Cooldown group set; does not stack with another scare
- [ ] Kill only after a warning matched to the enemy's sense
- [ ] Fake threats cannot damage (test)
- [ ] No harm to a child on screen
- [ ] Comfort, reduce-effects and flicker-off respected
- [ ] Subtitles / text in en.json and el.json
- [ ] Debug overlay shows it (senses, state, trigger)
- [ ] Mockup still approved by the owner if it is a new enemy or effect
