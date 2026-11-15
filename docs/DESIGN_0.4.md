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

## Picked by the owner (2026-11-15)
- **Way in:** Nora cut the chain; it lies on the step with her bolt cutters.
- **Caught:** one catch, then the rewind (as with the watcher).
- **In the dark:** she cannot see you, but touching her catches you.
- **Camcorder:** found upstairs, midway (the observation room).
- **Size:** two floors, about 60 minutes.
- **Way out:** a chase with every lamp dead.

- **Sister M.'s face: hollow** (from four options), "but improve on it": the first face was too
  flat, too bright and not burnt enough. Now the wimple is a deep well of scorched linen, burnt
  away down her left side with its edge still glowing; inside only the dark, the hint of a brow
  and a jaw, and an ember far back where each eye was (`nun_face`, `nun`, `nun_catch`). The other
  three options are gone from the code.
- **Tab icon:** the VHS tape (`assets/textures/favicon.png`, drawn by `tools/make-favicon.py`).

- **Second pass on her (owner, 2026-11-15):** the hole looked boxy, the headdress shape was wrong
  and the whole figure blocky; eyes: larger and glowing. Rebuilt in `src/props/burnedNun.js`: a
  body flattened to shoulders with a rippled hem, tube sleeves, a veil that falls open-fronted
  past her shoulders, an oval wimple whose inside is a well of dark, two burning almond eyes.

- **Third pass (owner, 2026-11-15):** the face was misproportioned and cluttered. Now the opening
  has a face's proportions, the eyes sit a little above its middle, and the loose embers and scorch
  holes around it are gone: a clean dark oval and two eyes.

- **Sister M. approved (2026-11-15)** after the third pass. All 0.4 stills now stand as drawn.

## Content sheet (2026-11-15)
The Claude Doc "Wing 3 Content Sheet: Asylum Wards"
(https://claude.ai/artifact/PVe4s5Cuuk9ZhvXsJwgCoE) holds every document, radio message, line,
prompt, item, room name, puzzle answer (cabinet 3815, Dr. Venn's door 4261) and set piece, EN + EL,
with seven open questions and a checklist for the owner. Nothing in it is approved until its
checklist is ticked; the game text is carried from the sheet as it stands then.

## Decided on the content sheet (owner, 2026-11-15)
The sheet's seven open questions, all kept as written: the full confession; "Believes himself a
grown man" on file page 3; Edith's last line names Tommy; Nora names Agnes on the first radio;
Maggie wrote the door code (M.R.); Peter Dunn and Ann Lacey stay as names; camcorder keys C (already
bound), N for the night view, right mouse button for the flash, all rebindable. The checklist on the
sheet is still the owner's to tick.

## Sounds
`docs/SOUNDS_0.4.md` (IDs) and the owner's Claude Doc (search terms, links): 31 new sounds.

## Part A room stills (2026-11-15, waiting for a yes)
`admissions`, `fuse_room`, `baths`, `dispensary`, `day_room`, `childrens_ward`
(`src/mockups/wardRoomStills.js`, furnished in the empty mock level `levels/wardRooms.json`). New
props in `src/props/wardRooms.js`: fuseBoard, television, pigeonholes, callBoard.

Owner's answers on them (2026-11-15): the rooms were **too empty**, so each got clutter and wear
(papers, toppled chairs, a stretcher, drip stands, fallen tiles, peeled paint, handprints, toys and
shoes in the children's ward; props dripStand and stretcher are new): build the rooms this full.
**The fuse board opens a close-up screen** (E at the board, click a socket), like the piano and the
code locks. **The television is dead until the camcorder is taken,** then on by itself.

The owner approved the filled rooms ("build them") and building on the working branch while the
school reviews are out. `ui_fuseBoard` is approved with the dark red lamp added.

## Part A1 as built (0.2.66)
The ground floor of the west wing is in the game, without Sister M. and without puzzles:
- **Level:** `src/levels/wards_ground.json`, written by `tools/levels/wards_part_a.py` (rerun it to
  change the layout). North row: baths, Ward A, children's ward, dispensary, nurses' station,
  stairs; the corridor; south row: fuse room, basement stairs, day room, admissions (the courtyard
  door in its east wall). Furnished as the approved stills.
- **The courtyard door:** chained until `wing_school_done`; from then on the cut chain lies on the
  step and the door leads to admissions (the same script edits `grounds.json`).
- **Shut for now:** the dispensary and the stairs gate (electric locks, flags `power_dispensary`,
  `power_stairs`: the fuse board, A3) and the basement gate (`basement_open`, 0.5).
- **Papers (content sheet):** Nora's note, the admissions book, the night book, the four bed charts,
  the night round card. The owner answered the sheet's open questions; its checklist is not ticked
  yet, so later edits to the sheet still have to be carried into `en.json` / `el.json`.
- **Nora's radios:** `src/levels/radios.js` ("radios" in level data): admissions (two lines) and
  the day room (one), each once, when you come within 3.6 m.
- **The LIGHTS OUT sign:** a `wallSign` prop written in the game's language by `src/levels/signs.js`
  (`"sign": "<i18n key>"` on a prop). Its look-at line `msg.lightsOutSign` is not on the sheet.
- **Nurses' station:** the tape recorder and a door home.
- **Not yet:** the wing's plan as a journal map, the fuse pickup in the baths, Edith, Sister M.
  (A2), the fuse board and the medicine round (A3). The fuse board close-up is approved with a third
  lamp state: dark red on a circuit whose lamps she has put out.
- Tests: `tests/wards.spec.js`.

## Next
The owner's checklist on the content sheet and the priority 1 sounds; stills
for part A's rooms, then build A, B, C in that order with the bot route per part.
