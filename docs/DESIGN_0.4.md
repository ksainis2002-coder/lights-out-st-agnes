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

## Part A2 as built (0.2.67)
Sister M., the ward lamps, hiding and Edith are in the game (ground floor only):
- **Ward lamps** (`src/levels/lamps.js`, level data "lamps"): Ward A's three are lit when you
  arrive. A lamp she has put out stays out (flag `lamp_out_<id>`); `relight` is there for the fuse
  board (A3).
- **Sister M.** (`src/ai/nun.js`, level data "nun"). The first time you stand in Ward A she is at
  its far end and puts the three lamps out one by one (the set piece: she cannot catch you during
  it); then flag `nun_walking`, a checkpoint, and her round through the corridor, Ward A, the
  children's ward, admissions, the day room, the baths and the fuse room. She opens doors herself.
  The nurses' station is not on her round: a safe room.
  - She sees your flashlight when it is on and you are in her room or in a clear line within
    15 m. Then: "Lights out." (a second sighting within a minute: "After eight. After eight."),
    her embers flare, 2 s (comfort mode 3.5 s) before her first step. She walks at 1.5 m/s on
    Normal (your walk is 1.7, your run 3.3), 0.6 of that in comfort mode.
  - Light off: after 1.2 s "Who has a light?", she walks to where it was, then back to her round.
  - Catch: she reaches your lit light (1 m), or you touch her in the dark (0.8 m). The catch pose
    `nunCatch` (as the approved still), then the rewind with Edith's line for how it happened
    (`edith.catch.light` / `.touch` / `.lamp`).
  - Sounds are stand-ins until the 0.4 files arrive (chain rattle for the beads, a whisper and a
    match for the hiss and flare, the candle snuff).
- **Hiding** (`src/player/hide.js`): Ward A's ten beds have "use": "hide". Under one your light
  goes off, the view is at floor height looking out (the mouse turns your head a little), and
  she can neither see nor touch you. The use key brings you out.
- **Edith** (`src/ghosts/edith.js`, level data "edith"): on bed 7. Two lines when you first come
  near; then her warnings, anywhere in the wing, by how near Sister M. is (far / next room / seen /
  dark / step aside / gone), at most every 20 s (the urgent two: 8 s). She is "a child" until her
  chart is read. One change from the sheet: "She's gone on. You can breathe." in place of "gone
  up", until there is an upstairs.
- **Not yet:** lightning making her flinch, the lap and Maggie's-bed lines, the hints, the call
  board set piece (A3 / B).
- Tests: `tests/nun.spec.js`.

## Part A3 as built (0.2.68)
The two ground floor puzzles; with them part A can be played from the courtyard door to the stairs.
- **The fuse board** (`src/puzzles/wardFuses.js`, screen `src/ui/screens/wardFuses.js`, as the
  approved still with the dark red lamp). Six sockets: Ward A, children's ward, dispensary,
  corridor, stairs, upstairs. A fuse makes a circuit live (flag `power_<circuit>`): its lamps burn
  and its electric lock lets go (the dispensary door, the stairs gate). Fuses are items.
  - **Changed from the sheet:** the board's first fuse sits in **Ward A**, not Corridor: that is
    why Ward A's lamps are on when you arrive. The second lies on the rim of a tub in the baths,
    the third in the dispensary cabinet.
  - Lamps: Ward A 3, children's ward 2, dispensary 1, corridor 3. Sister M. walks to the nearest
    lit lamp and puts it out; a circuit whose lamps are all out shows dark red on the board, and
    its fuse pulled and pushed in again lights them afresh. A lock stays open while its fuse is in,
    whatever she does to the lamps.
  - The way through: move Ward A's fuse to Dispensary (she comes to its lamp), put the baths' fuse
    in a far circuit to draw her off, open the cabinet, then the third fuse in Stairs
    (`puzzle_ward_fuses`, a checkpoint). The stairs prop says "Not yet" until part B.
- **The medicine round** (`src/puzzles/medicineLock.js`, the school's lock screen with four wheels
  and the label DISPENSARY): **3 8 1 5**, only once the night round card has been read. Open, the
  cabinet leaves a fuse, pills and the music box's cylinder on the table under it
  (`puzzle_medicine`, a checkpoint). The pills are the game's existing pills, with their text.
- **Edith's hints** (level data "edith.hints"): after 150 s stuck on a puzzle you have tried, her
  line for it, once: the fuse board, then the two medicine round lines.
- Tests: `tests/wardPuzzles.spec.js`.

## Part A closed (0.2.69)
The loose ends, and two holes the bot route turned up:
- **She cannot be missed.** Her first round also starts when you pass Ward A's doors in the
  corridor (level data `nun.intro.cells`, `doors`): the nearer door swings open by itself and the
  lamps start going out. Before, never entering Ward A meant never meeting her.
- **The stairs take a heavy fuse** (item `fuse_large`, `wardFuses.large`), found only in the
  dispensary cabinet; the two ordinary fuses do not fit that socket, and the heavy one fits no
  other. Before, Ward A's fuse could go straight into Stairs and skip the cabinet. **Changed from
  the sheet:** the cabinet holds the heavy fuse, not a third ordinary one.
- She only walks to lamps she can reach (a lamp behind a dead electric lock is left alone), and
  opens an electric door only while its circuit is live. The dispensary is on her territory.
- Lamps count as light for sanity: standing under a lit lamp steadies you, and draws her.
- Lightning stops her for 1.5 s. The call board rings for bed 7 the first time you stand in the
  nurses' station. The music box's case lies by Maggie's bed. The wing's plan hangs on the
  admissions notice board and goes into the journal.
- Level fixes found by the bot: a radiator stood in front of the children's ward door; a trolley
  under a Ward A lamp; clutter moved so two lanes of the corridor can be walked.
- **Bot route** `tests/bot-routes/wards_ground.json` (the script that wrote it is not kept): light
  off, the plan, the book, the four charts and the case, past Ward A, Ward A's fuse to Dispensary,
  the baths' fuse to Ward A as a lure, the card, 3 8 1 5, a pill, then the heavy fuse to Stairs
  between two of her rounds, and through the gate. 253 s of game time at bot pace, no catch,
  lowest sanity 54. Her round takes about 95 s.
- **To watch in playtests:** the dark is the hiding place here but also drains sanity (about
  3 minutes from full to a blackout in full dark, less under the rooms' moonlight): pills, lit
  lamps and the nurses' station are the relief. Whether that is fair is the owner's call.

## Part B stills (2026-11-16, waiting for a yes)
`observation` (the tripod, the monitor, Nora's camcorder on the floor, the glass), `treatment_room`
(the chair, seen through the glass), `isolation` (a padded cell by flashlight), `isolation_night`
(the same wall in the night view: Maggie's writing) and `venn_office`. New, mockup-only: the
`padded` wall texture and `src/props/wardUpper.js` (treatmentChair, tripod, camcorder, videoTape,
observationGlass, nightWriting).

## The camcorder as built (0.2.71)
`src/player/camcorder.js`, display `src/ui/camcorderHud.js` (as the approved still, with the flash
state at the top and the date, time and pulse lifted clear of the subtitles). It is not found in the
game yet: its pickup comes with part B (flag `tool_camcorder`, item `camcorder`, with a "new item"
card).
- **C** raises or lowers it. **N** (while raised) is the night view: the picture goes green, a lens
  lamp shows the dark, your flashlight goes off, and Sister M. sees none of it. **Right mouse
  button** (while raised) is the flash: a burst of light (a soft fade with reduce-effects or
  flicker-off) that stuns her for 5 s if she is in front of you within 9 m; then 20 s to charge.
  All three keys can be rebound, and are listed in Controls once it is found (settings version 4, with a migration).
- Its battery (progress value `camcorder_battery`): half gone when found, 15 minutes raised from
  full, 1.6 times faster in the night view, 3 per flash. Flat, it will not come up. A spare
  flashlight battery fills it (the battery key, while it is raised).
- The date and time on its display are your own clock's (local time, no network); the year never
  shows. The pulse is shown only on the camcorder once it is found, as the brief says.
- For sanity the night view counts as light in hand, like the flashlight.
- Writing that only the night view shows: props with `userData.setShown` (`nightWriting`).
- Tests: `tests/camcorder.spec.js`.

## Owner's picks on part B (2026-11-16)
- **Stills approved,** with the treatment room and the night writing redone: the chair now stands
  in a hard pool of light with an instrument tray, a stain round the drain, a box under it for feet
  that did not reach the floor and a small shoe (aftermath only); the writing is a child's
  uneven scratching. Second look (2026-11-16): the treatment room approved; the writing made
  easier to read (steadier letters, the code's numbers large on a line of their own).
- **Camcorder battery:** the flashlight's spare batteries fit it. With it raised, the battery key
  puts one in (full again); lowered, the key feeds the flashlight as before (built, 0.2.72).
- **Flash:** 5 s stun, 20 s charge, to be tuned after part B is played.
- **Part B in two steps:** B1 the first floor to walk, the stairs between floors, the camcorder and
  tape, Sister M. following you up and down; B2 the television, the writing, Dr. Venn's door and
  office, T. Hale's file page 3.

## Part B1 as built (0.2.74)
The first floor can be walked, and the camcorder can be found:
- **Level:** `src/levels/wards_upper.json`, written by `tools/levels/wards_part_b.py`. North row:
  Sister M.'s room (shut, part C), two isolation cells off a lobby, the treatment room, the
  observation room, the stair head; the treatment corridor; Dr. Venn's office (shut, B2).
- **The stairs:** the ground floor's flight (behind its gate) leads up; the stair head leads down
  to its foot (spawns `stairs` on both levels).
- **Observation:** Nora's camcorder (pickup `nora_camcorder`, a tool with its "new item" card) and
  her tape (item `nora_tape`, for the day room television in B2). Its west side is the glass
  itself (`observationGlass` with `wall: true`, a footprint that cannot be walked through): the
  treatment room is seen and never entered.
- **Sister M. between floors** (`src/ai/nunFloors.js`): once her round has begun, she comes off
  the stairs 30 s after you change floor (45 s in comfort mode), her beads heard on the stairs 5 s
  before, never onto you. The floor she walks is saved (`nun_floor`). Upstairs she walks the
  corridor, the observation room and the isolation lobby and cells; no first-round set piece.
- **Edith** upstairs is only her voice (level data `"edith": { "room": null }`).
- Tests: `tests/wardsUpper.spec.js`.
- **For B2:** the writing in the cells (`nightWriting` with the game's language), Dr. Venn's door
  (4 2 6 1) and office (his notes, T. Hale's file page 3, the radio, the night sister's key, a door
  home), the tape on the day room television, the first floor's plan for the journal.

## Part B2 as built (0.2.75)
- **Maggie's writing** (`nightWriting` props `cell_writing_1/2` with `"sign": "cell.writing.N"`,
  written in the game's language by `levels/signs.js`): hidden by flashlight, shown in the night
  view. Standing within 3.2 m facing it in the night view notes it (flag `seen_<id>`, its clue).
- **Dr. Venn's door** (`src/puzzles/doorLock.js`, prop `wheelLock` beside the door, the school's
  lock screen with four wheels and the label DR. A. VENN): 4 2 6 1, only once both cells are
  read; sets `puzzle_venn_door`, which the door requires. A checkpoint.
- **His office:** desk and lamp, the records, a couch, his notes (`venn_notes`), T. Hale's file page
  3 (`hale_file_3`), Nora's two lines on his radio, a door home (spawn `home_venn`). Not on her
  round: a safe room, like the nurses' station.
- **The day room television:** dead until `tool_camcorder`, then a second prop with static and its
  glow, a look line ("waiting for a tape"), and the static heard in the room (radio_static as a
  stand-in; level emitters now take "after").
- **The first floor's plan** on the corridor board by the stair head, for the journal.
- **Not yet:** the night sister's key (comes with part C, with her room), the bot route upstairs.
- Tests: `tests/wardsB2.spec.js`.

## Nora's tape as built (0.2.76)
`src/cutscenes/tape.js`, display `src/ui/tapeHud.js` (approved still `ui_tape`). With the tape in
hand, the day room television's use is "Play the tape": the tape goes into the recorder for good
(flag `tape_in`, it can be played again) and about 25 s of her footage plays in the night view,
inside the set's bezel, with her four lines (speaker "Nora, on tape"):
1. Ward A as she filmed it, every lamp lit (the real room; `lamps.film` shows them lit without
   touching the story, `refresh` puts them back), Sister M. hidden from the shot;
2. the far lamps going out towards her;
3. a cut to a padded cell built for the shot past the level's edge, the writing on its wall;
4. the turn to the doorway, Sister M. in it, the fall, static.
The game stands still while it plays (nothing can catch you); a click, ENTER or SPACE stops it.
Comfort mode: a slow turn and no fall. Reduce-effects / flicker-off soften the static (the pipeline's
rewind setting). Its clue: `watched_nora_tape`. Sounds: tape hiss, the VCR's insert and eject, the
lamps going out (candle snuff as a stand-in). Tests: `tests/tape.spec.js`.

## Part C stills (2026-11-17, waiting for a yes)
`sister_room` (her room by flashlight: the bed tight-made, the trunk at its foot, the kneeler before
the crucifix, the window boarded, her spare habit on its peg), `sister_shrine` (the one light she
allows: a candle before the stone palm on a white cloth), `sister_trunk` (open: her habits, the
folded confession, the music box's key on a black ribbon), `box_mended` (Edith with her box open
and playing in her lap), `way_out` (every lamp dead, the night view, Sister M. between you and
admissions) and `hub_after_wards` (your room after the wing: soot spreading from the lamp over the
ceiling and down the walls, a candle burnt down to nothing on your table, the light weaker).
New, mockup-only: `src/props/sisterRoom.js` (prieDieu, candle, stonePalm, trunk, boardedWindow,
habitPeg, sootStain) and Edith's `box: 'open'`. The mock camcorder display now matches the game's.

## Next
The owner's checklist on the content sheet and the priority 1 sounds; stills
for part A's rooms, then build A, B, C in that order with the bot route per part.
