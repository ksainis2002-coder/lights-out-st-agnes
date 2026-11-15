# 0.4 asylum wards: design proposal

**Status: a proposal (2026-11-14). Nothing here is approved yet and nothing is built.** The brief
wins on anything not listed. The owner's picks get written into this file as they are made; until
then every line below is what the first stills and the plan (`docs/mockups/stills-0.4/`) show.

## Stills waiting for a yes
`ward` (lamps on), `nun` (under the "LIGHTS OUT 8 P.M." sign), `nun_dark` (how she reads with your
light off), `nun_catch`, `edith`, `camcorder_night`, `hide_bed`, `radio`, `ward_corridor`,
`west_wing_door`, and the plan `wing_map`. Reshoot: `node tools/shoot-stills.mjs` with the dev
server on port 5199; the plan's source is `docs/mockups/source-0.4/wing_map.html`.

Mockup-only code so far: the ward props (`src/props/wards.js`), the figures
(`src/props/wardFigures.js`), the `wardWall` texture, the night-view uniform in the post shader
(`fx.nightVision`, 0 in the game), and the mock level and UI in `src/mockups/`. No game level,
enemy, item or text exists yet.

Owner's notes on the first set (2026-11-15), fixed in 0.2.56: the sign was hard to read (now two
lines, larger), and the nun's face looked like a drawing stuck on (now built from pieces, darker,
only the embers bright).

## The wing as proposed
- **Way in:** the chained west wing door in the courtyard. When wing 2 is done its chain lies cut
  on the step with a pair of bolt cutters: Nora went in ahead of you.
- **Size:** two floors, about 60 minutes on Normal, like the school. Parts: **A** ground floor
  (admissions, Ward A, fuse room, children's ward, dispensary, baths, day room, nurses' station),
  **B** first floor and the camcorder (observation, isolation, treatment room, Dr. Venn's office),
  **C** Sister M.'s room, the way out, the hub's new decay.
- **Sister M. (the burned nun):** she sees only light. Your flashlight and every lit lamp draw
  her; she puts lamps out with her snuffer as she walks her round on both floors. The dark hides
  you, even close, unless you touch her. Lightning makes her flinch.
  - **Warning before any catch:** her beads rattle, she hisses "Lights out.", the embers in her
    habit flare. Edith also whispers where she is.
  - **Catch:** the snuffer comes down over your light, then the VHS rewind to the last checkpoint
    with Edith's whisper. Short, no gore.
  - **Counters:** light off; hide under a bed; light a far room at the fuse board to pull her
    away; the camcorder flash stuns her (longer than the flashlight would, with a cooldown).
  - **Comfort mode:** slower, longer warning, no face close-up at the catch.
- **Edith Carr:** the blind girl on bed 7 of the children's ward. Faceless and unhurt like every
  ghost child. She hears Sister M.'s beads and tells you where she is. Her broken music box
  (case, cylinder, key) is the wing's toy.
- **Nora Kane:** heard on the valve radios (admissions, day room, Venn's office); her tape plays
  on the day room television. She went down the basement stairs (locked until 0.5).
- **The camcorder:** Nora's, found upstairs in the observation room. Night view (green, grainy),
  a flash that stuns, its own battery, REC display, and a pulse line that shows your sanity.
- **Puzzles:**
  1. Fuse board: too few fuses for six circuits. You choose which rooms have light; she goes to it.
  2. The medicine round: the charts on the beds and the admissions book give the dispensary
     cabinet's code.
  3. Marks in the isolation cells that only the night view shows give Dr. Venn's door code.
  4. The music box mended from its three parts.
- **Rewards:** the stone palm (statue piece 3, in Sister M.'s trunk), Edith's music box, T. Hale's
  file page 3 (Dr. Venn's office).
- **Set pieces (each with a setup and a cooldown in the level data):** Ward A's lamps going out one
  by one towards you; the day room television switching itself on; the call board ringing for an
  empty bed.
- **Way out:** every lamp dead, Sister M. between you and the door, Edith's box playing you out.

## Open picks (asked 2026-11-14)
1. Looks: are the stills right?
2. Way in: chain cut by Nora / bolt cutters you must find / another door.
3. Caught: one catch rewinds / two hits.
4. In the dark: touching her catches you / she never catches you in the dark.
5. Camcorder: found upstairs / given at the start.
6. Size: two floors, ~60 min / one floor, ~45 min.
7. Way out: a chase with every lamp dead / a quiet walk out.

## After the picks
Content sheet (every document, line and code, EN + EL), the 0.4 sound list for the owner, stills
for part A's rooms, then build A, B, C in that order with the bot route per part.
