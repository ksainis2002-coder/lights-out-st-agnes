# 0.3 school wing: design decisions

The brief wins on anything not listed here. All of this was decided by the owner in quick picks:
the first set on 2026-10-13, the rest in a question-and-answer session on 2026-10-14.

## Looks and first picks (2026-10-13)
- **Stills approved:** classroom, blackboard, watcher, watcher_close, maggie, courtyard, cemetery,
  then watcher_grab, storm, ui_codeLock, library and gym (`docs/mockups/stills-0.3/`).
- **Graves:** the five children's graves carry their names, but Tommy's stone is worn too smooth
  to read. The hint stays a hint.
- **The watcher's catch:** a short grab (her face fills the view, a stone hand), then the VHS
  rewind to the last checkpoint, with a ghost child's whisper about what happened.
- **Plan:** the map `wing_map.png` was approved as drawn, then extended on 2026-10-14 (below),
  redrawn with the new rooms in 0.2.12 and approved again.
- **Part A stills approved (2026-10-14):** music_room, ui_piano_shapes, nurse_room, art_room,
  entrance_hall, entrance_stairs, cloakroom, and every close-up (below). Kept as drawn: a child's
  painting of the grey lady on an art room easel, a lamb at Agnes's feet in the class painting, the
  nurse's room in the same pale green tiles as the asylum room, a black doorway at the top of the
  main stairs.
- **Part A3 stills approved (2026-10-19):** chalk_hint, chalk_taunt and class1_turned, built as
  drawn (0.2.23, see "Maggie's tricks as built").
- **Part B stills approved (2026-10-24):** all nine (see "Part B stills"), with one change: the
  headmaster gets a chair fit for a headmaster (head_office reshot, 0.2.28). Kept: Tommy's empty
  desk at the roll call, and the Classroom 3 board "Form III / Monday, 2nd February".
- **Piano stickers:** every colour also has its own shape, always on (owner pick): red circle,
  orange square, yellow triangle, green diamond, blue star, purple cross. The song page shows the
  same shapes, so colour-blind players can play it.

## Structure
- A garden door on the orphanage landing opens once wing 1 is done and leads to the
  **courtyard** (outdoors), which joins the wings: the asylum door is chained (0.4), the chapel is
  locked (0.5; through the keyhole, her empty plinth), the front gate is chained (0.5), and the
  cemetery gate needs the gate key.
- **School, ground floor:** entrance hall (main stairs; ground floor and grounds map on the
  noticeboard), main corridor, Class 1, Class 2, library, gym (back stairs nearby), music room,
  nurse's room, art room, staff room (the tape recorder; the upstairs map), cloakroom.
- **Upstairs** (main stairs from the hall, back stairs by the gym): corridor, Class 3, Class 4,
  the headmaster's office and his flat.
- About **60 minutes** on Normal (owner: longer than the brief's 45). One tape recorder (staff
  room); checkpoints at the school door, after each puzzle and at the cemetery gate.
- Supplies: **4 batteries, 2 pills.**

## Route (the content sheet and the redrawn map fix the details)
1. Courtyard: St. Agnes stands on the path in the rain, facing the school; harmless. When you come
   back out, she is gone.
2. Class 1: lines on the board; Maggie skipping; her desk holds her library ticket; the detention
   book. Later Maggie rearranges Class 1 behind your back.
3. Library: ticket → card index → shelf → her song book, with a page of coloured dots. The
   watcher's introduction: the light dies for a moment (a fade with flicker off), she is closer,
   Maggie whispers "She only moves when nobody's looking." From then on she hunts.
4. Music room: the piano has coloured stickers on its keys; play the dots and the headmaster's key
   drops out of the piano.
5. Class 2: the counting lesson gives the three-digit records code.
6. Upstairs: the school bell rings the first time you go up; roll call in Class 3; the projector
   film in Class 4. Headmaster's office: the records cabinet (code) holds the "struck off the
   roll" list, the cemetery gate key and Tommy's medical card; his flat has the doctor's letter.
   The storm starts.
7. Gym: the hopscotch rhyme → Maggie's skipping rope; the fire-drill log.
8. Staff room: the matches are gone; Maggie hid them and her rhyme says where (the coat with the
   ribbon, in the cloakroom). Tape recorder, upstairs map.
9. Art room: a class painting of the five children in a line, in the order they left.
10. Nurse's room: the medical inspection room; more about the doctor.
11. Cemetery, in the storm: light the five lanterns in the order of the roll → Agnes's grave slab
    opens → the **stone lamb** (statue piece 2; St. Agnes is shown with a lamb) and T. Hale's
    file page 2. The watcher then waits at the chapel door, facing it, and stays there.
12. Back to the hub: new drawings on the walls (a horse, a skipping girl) and decay (peeling
    paint, a cracked pane, a dimmer lamp).

## Puzzles (five; each needs its clue first, numbers and pictures only so Greek works the same)
1. **Library index:** ticket → index card → shelf number → book.
2. **Piano:** key stickers, each colour with its own shape; the song page shows the same coloured
   shapes → the headmaster's key.
3. **Counting board → records lock:** count the windows, the lids left up and the names on the
   board; three number wheels.
4. **Hopscotch rhyme:** Maggie's rhyme names the squares; you play it up close, from above; a
   wrong square → the rope slaps, she giggles, start again from 1.
5. **Grave lanterns:** the order the children were struck off the roll (the art room painting
   backs it up); Tommy's worn stone by elimination.
On **Hard**, answers shuffle each new game (lids up, piano shapes, hopscotch rhyme, roll order) with
matching clues; Normal and Story stay fixed (brief).

## The watcher
- Moves only while unseen, sliding on her plinth: never seen moving, a stone grind each time she
  moves (positional).
- **Seen** means on screen, not behind a wall, and lit: your flashlight on her, a lamp near her,
  or within about 2 m. In the dark she counts as unseen, so batteries matter.
- At arm's reach a dusty breath: **1.5 s** to turn and look before the grab (comfort mode: 3 s and
  half speed). This is her warning (scare rules table updated).
- Staring at her drains sanity slowly: about one pip of the pulse per 40 s.
- Low sanity: once the pulse says "shaking", your eyes blink now and then; she can move in a blink.
- Closed doors stop her; she waits outside.
- Hunts the corridors, library, gym, entrance hall and stairs; outside once the storm starts.
- Follows you between floors about 20 s later if she was close (her grind on the stairs first).
- Speed while unseen: 2.6 m/s on Normal (walk 1.7, run 3.3); slower on Story, faster on Hard.
- First seen in the courtyard (harmless); no catch before the library introduction.
- After a catch, Maggie whispers what happened ("You looked away. She only moves when nobody's
  looking."); different lines on later deaths.

## Maggie
- Guide and trickster. She appears at a distance, skips, sings rhymes with clues and leads you on.
  Her tricks: she hides the matches and sings where they are; she rearranges Class 1 behind your
  back (chairs up on the desks, or every desk facing you); chalk words appear on boards, mostly
  hints when you are stuck, about one in four a taunt ("She's behind you." – a lie). She never
  harms you or blocks you for long.
- Her story, told only through documents and lines: she told a teacher about the quiet room, was
  punished ("I must not tell"), was sent to the west wing and struck off the roll.
- Rhymes: English, and their own Greek rhymes with the same numbers and clues.
- After the rope: "You can have it. I'm not allowed to play." She fades.

## Set pieces (each with a setup and a cooldown; comfort mode cuts them)
- **The bell:** the school bell rings with nobody there and the corridor doors bang open one after
  another (the first time upstairs).
- **Projector film (Class 4):** silent, scratchy black-and-white film of children in a line, only
  the projector's clatter; one face turns to the camera; the film snaps off.
- **Roll call (Class 3):** the desks fill with faint pupils with blurred faces and black eyes;
  they all turn to look at you, then the desks are empty.

## Tommy's three deaths (one clue each, none confirmed)
- Fire: the gym's fire-drill log ("all pupils accounted for except Hale, T.").
- Basement: Class 1's detention book (sent to the boiler room for coal; not back for the
  afternoon register).
- Surgeon's table: his medical card (referred to the doctor in the west wing), and the doctor's
  letter in the headmaster's flat asking for "more children for examination".
8–10 documents in the wing (listed in the content sheet).

## Weather and sound
- Rain on arrival; the storm starts after the headmaster's office: lightning every 20–40 s,
  thunder 1–3 s later. With reduce effects or flicker off, a soft glow instead of a flash.
- Music: a low drone that swells when the watcher is close and unseen, and drops to silence
  before set pieces.
- Piano notes are made in code, slightly out of tune. Maggie hums (the new girl_hum recording)
  under her subtitled rhymes.
- The sound list gets the new rooms; the owner downloads priority 1 first.

## Screens
- **Records lock:** the drawer comes up close; mouse wheel or ▲▼ (or a click above/below a wheel)
  turns it, ◀▶ picks a wheel, number keys 0–9 set it, CLICK the drawer to try, ESC steps back.
- **Piano:** the keys come up close like the music box; click a key or press 1–8; the notes
  played show above; ESC steps back.
- **Gravestones:** look and click: the stone up close, the name and age as a message, added to the
  journal; Tommy's is worn smooth and says the name has worn away.
- **Maps:** ground floor and grounds on the hall noticeboard; upstairs in the staff room.

## Close-ups (owner request 2026-10-14, stills approved the same day)
"Any puzzle that could be seen better up close should be up close, just like the music box."
All approved: ui_cardIndex (click the title's first letter; 24 drawers, A–W and XYZ in English,
Α–Ω in Greek; the card comes up), ui_shelf (the 700–799 bookcase, click 784), ui_countingBoard
(read the board), ui_gravestone and ui_gravestone_worn (read a stone; its line below),
ui_painting (the five names readable), ui_hopscotch (from above, click or 1–9; replaces hopping on
the floor squares) and ui_fuseBox (wing 1's sick-bay fuse box, built in 0.2.x before the owner's
wing 1 playtest). The piano and the records lock already have close-ups. The prompts and controls
lines are in the content sheet.

## How it is built
1. **Wing 1 furniture pass** (first job, below). Done in 0.2.7.
2. **Content sheet** for approval: every name, document and rhyme in English and Greek. Written
   2026-10-14 as a Claude Doc, "Wing 2 Content Sheet (0.3)":
   https://claude.ai/code/artifact/9cc99d43-ea28-458a-b2bb-2ade5c73785c (puzzle answers on Normal:
   records lock 354; piano blue star, blue star, yellow triangle, purple cross, blue star, yellow
   triangle; hopscotch 2, 7, 5, 9, 1;
   lanterns Agnes, Thomas Hale, Margaret Rowe, Samuel Pike, Edith Carr). Its checklist holds the
   owner's open points. Once approved, the text goes into en.json and el.json; the doc is not read
   by the game.
3. **Part A, courtyard and ground floor:** stills first, then the garden door, courtyard, the
   ground floor rooms, the watcher, Maggie, the library, piano and hopscotch puzzles. Owner
   playtest. Stills of the new rooms (0.2.13) and the close-ups (0.2.14) approved.
   - **A1 (0.2.17):** the garden door, the grounds and the ground floor, every room furnished;
     the stairs say "Not yet". Built from `tools/levels/school_part_a.py` (see below).
   - **A2 (0.2.18):** the library, piano and hopscotch puzzles with their close-ups, the
     Classroom 2 board, the class painting, Maggie's desk, the coat pockets and the staff-room
     drawer.
   - **A3:** Maggie's rhymes and lines (0.2.19), the watcher (0.2.20), the part A bot route
     (0.2.20), the chalk on the boards and the Classroom 1 trick (0.2.23).
4. **Part B, upstairs:** stills, stairs both ways, Classes 3–4 and the set pieces, the office and
   flat, the records lock, the storm. Owner playtest.
5. **Part C, the cemetery:** stills, graves, lanterns, the lamb and file page, the watcher at the
   chapel, the hub's drawings and decay. Owner playtest.
6. Sounds (as the CC0 files arrive), bot route, balance, tests, release 0.3.0.

## Wing 1 furniture pass (owner 2026-10-14)
- Washroom: water and drips (a puddle by the bath, grey water in the sinks, a dripping tap).
- Linen cupboard: sheets on a drying line across the room, a laundry chute in the wall.
- Corridor and landing: benches, coat pegs, a notice board, radiators, a runner rug.
- Office and sick bay: filing, a typewriter, a crucifix; beds with screens, a trolley.
- Dorms and playroom: clothes on chairs, shoes under beds, more toys, a rocking horse.
- The quiet room stays as it is (signs only, no words).

## Part A1 as built (0.2.17)
- Levels: `grounds.json` (courtyard, cemetery behind its locked gate, chained front gate, the
  chapel's keyhole, the chained west wing) and `school_ground.json` (the ground floor). Both are
  written by `tools/levels/school_part_a.py`; furniture sits in room-local cells. A rerun
  overwrites hand edits, so either edit the script or stop using it for that level.
- Wing 1's garden door on the landing stays locked until the statue and the horse are taken and
  T. Hale's file page is read (`src/levels/wings.js` sets `wing_orphanage_done`).
- Engine: rooms can be taller than the level's walls (`height`: gym 5.2 m, hall 6 m) with step
  faces where a tall room meets a low one; doors can need a flag (`requires`, with a locked line)
  or be iron gates (`look: "gate"`); props can take you to another level (`travel`) or just say a
  line (`message`); a level can set its own fog and a moon light. A way out to a level that is not
  built yet prompts "Not yet" and does nothing (the stairs, until part B).
- Draw calls: library 48, hall about 170 (desks share materials; only Maggie's desk keeps an id).
  About 19 point lights in the school: measure fps at the end of part A.
- The plan on the hall notice board adds two maps (the ground floor and the grounds), each with its
  own title. The content sheet has one combined title: owner to confirm the two names.

## Part A2 as built (0.2.18)
- Puzzles (`src/puzzles/libraryIndex.js`, `piano.js`, `hopscotch.js`) with their answers in the
  level data, so Hard can shuffle them later. Each close-up is its own screen (`src/ui/screens/`).
- The order a player meets it: Maggie's desk (Classroom 1) → library ticket → card index (drawer S /
  Τ) → shelf 784 → her song → piano → headmaster's key (for the office upstairs, part B). The
  hopscotch waits for her gym rhyme (part A3): until then the squares are only chalk. The staff-room
  drawer and the ribbon coat work in any order (the matches are for the lanterns, part C).
- New prop uses in level data: `lid` (once; sets `opened_<id>` and its flags), `note` (a line and
  flags, every time), `search` (once: an item and a note), `view` (a close-up, counts as looking).
  Documents can be pinned up (`upright`), and `game.readDocument(id)` reads a page found in a book
  or a pocket.
- Pickup models: a brass key with a paper tag drawn half as big again as a real one (it has to read at
  320×180), Maggie's skipping rope, a ledger for the detention book. The staff room's medicine
  cabinet became a steel filing cabinet, so it has a drawer.
- Strings not in the content sheet yet (added while building, owner to check): "Look along the
  shelves", "Cards for other titles.", "Not this one.", the hopscotch line before the rhyme, the two
  map titles (ground floor; grounds) and "Go back inside" / "Go into the school".

## Maggie as built (0.2.19)
- Ghost events of a new kind, `sing` (`src/ghosts/director.js`): she stands at a distance (the
  ghost-girl model from the approved stills) and sings, one subtitled line every 3.6 s, labelled
  "(a girl, singing)" until her name is read. Walk within 2.2 m and she is gone; the song goes on.
  A rhyme's flags (`sets`) count only once the last line is sung, so leaving early means she sings
  it again on the next visit.
- Where: Classroom 1 (rhyme 1, by her desk), the gym (rhyme 3: the hopscotch), the corridor
  outside the staff room once its drawer is found empty (rhyme 4; not if the ribbon coat has been
  searched). Rhyme 2 comes with the watcher in the library (next).
- Lines (`appear` events, as Tommy's): the music room on the first visit; the corridor and the
  courtyard by the cemetery gate once her name is known.
- The hopscotch close-up shows her rhyme along the bottom once she has sung it, whatever the
  subtitles setting (it is the clue); "Wrong one! Start again!" moved to the top.
- Her humming is the 0.2 hummed lullaby until `girl_hum` arrives.

## The watcher as built (0.2.20)
- `src/ai/gaze.js`: seen = on screen, a clear line on the cell grid (walls and closed doors block
  it), and lit: within 2 m, in the flashlight's beam (14 m), or by a lamp (lightAt ≥ 0.35). Beyond
  what the fog shows (1.4 / fog density: about 15 m in the school) she counts as unseen. A blink
  counts as unseen.
- `src/ai/path.js`: she keeps to her rooms (level data "territory") and the doorways between two
  of them; furniture-filled cells and closed doors block her. Everything else is a safe room.
- `src/ai/watcher.js`: 2.6 m/s unseen (Story ×0.75, Hard ×1.2, comfort ×0.5), a grind event every
  0.9 s while she moves, the breath at 1.2 m (arm's reach) and the grab after 1.5 s unseen (comfort
  3 s). Staring drains 0.625 sanity a second (a pip per 40 s). After 15 s with you out of her reach
  she drifts to her farthest spawn. On each load she starts at the spawn farthest from you.
- `src/ai/watcherIntro.js`: the library beat (two flickers, or a fade with flicker off; dark for a
  moment; she moves to about 3 m from you on her way; light back; Maggie's line; her rhyme). Once,
  leaving the library: "The dark counts as not looking."
- `src/sanity/blink.js`: below 50 sanity the eyes shut for 0.22 s every 3.5–7 s.
- The grab (`src/sanity/collapse.js`, prop `watcherGrab`): 0.9 s, her face and a stone hand as in
  the still, then the faint and the rewind; Maggie's catch lines in turn. Comfort mode goes straight
  to the faint. STOP or a new game mid-collapse now clears it (it could linger before).
- Not yet: following you upstairs (part B) and outside in the storm (part C).
- Bot route `tests/bot-routes/school_ground.json` plays part A: Classroom 1, the gym, Classroom 2,
  the art room, the staff room and the coat, then the library (the watcher wakes; the bot runs out and
  shuts the door on her, as Maggie's fourth catch line teaches), then the piano. About 205 s of game
  time at bot pace, no catches; the human-pace balance run comes with the owner's playtest.

## Maggie's tricks as built (0.2.23)
- Chalk (`src/props/chalkBoard.js`, `src/ghosts/chalk.js`): four small boards along the corridor
  (chalk_west between the library and gym doors, chalk_middle between Classes 1 and 2, chalk_hall
  across from the hall, chalk_east between the cloakroom and staff room), wiped clean at first.
- A hint is due once its puzzle has been tried (`tried_<puzzle>`; the matches: the empty drawer) and
  is still unsolved, and nothing new has been found, read or done for 180 s; the watcher's hint after
  her second catch. Part A has the library, piano, hopscotch, matches and watcher hints; the lock and
  lantern lines wait for parts B and C (already in en.json and el.json).
- Taunts once she is awake: at most one per three hints (about one board in four), 240 s after the
  last board or her waking, never while she is within 10 m (so "SHE'S BEHIND YOU" is always a lie).
  The five lines in the content sheet's order, each once.
- Maggie writes only on a board in your room, within 6 m, that you can't see (on screen with a clear
  line counts as seen); a clean board first, else the one written longest ago; at most one board a
  minute; never during a grab, a blackout or the library beat. The words are saved (progress value
  `chalk`) and drawn in the language you play in. You hear the chalk: a 0.2 sound pitched up until
  `chalk_write` arrives. Comfort mode keeps it (nothing moves at you, no sting).
- Classroom 1 (`src/ghosts/tricks.js`, `src/props/moves.js`): 90 s after the library puzzle, while you
  are out of the room, within 14 m of it and can't see any of its desks, the flag `class1_turned` is
  set and every desk turns to face the door; you hear them dragged round (a 0.2 sound pitched down
  until `chair_scrape` arrives). Level data gives each desk its "moved" rotation; the plain desks are
  merged twice and one set shows at a time; Maggie's desk turns in place, her library ticket with it;
  the floor footprints swap.
- The debug overlay (F3) shows a CHALK line (time with no progress, the next words due, boards
  written) and a TRICKS line (what the trick still waits for).

## Part B stills (0.2.26, approved 2026-10-24)
- Stills in `docs/mockups/stills-0.3/`: upstairs_corridor, stairs_down, bell, roll_call, class4,
  projector_film, head_office, head_flat, ui_map_upstairs. All approved; head_office reshot with his
  chair (0.2.28).
- Layout (`tools/levels/school_part_b.py`, for now writing the mockup level
  `src/mockups/levels/school_upper.json`): the first floor over the east half of the school. The
  corridor runs east to west; Classrooms 3 and 4 lie to the south, over Classes 1 and 2; the
  headmaster's office lies to the north, over the music room, and his flat lies beyond it, reached
  only through the office. The back stairs come up beside the corridor at x 26-27, the main stairs on
  a landing at x 27-28, both lined up with the ground floor's.
- The stair heads: the flight falls away down a well with no floor (a room's `well` in level data;
  `stairHead` prop), the red runner on the main stairs, bare wood on the back stairs.
- The bell: an electric school bell high on the corridor wall between the classroom doors; ringing,
  its dome blurs, and every door stands banged open.
- Roll call (Classroom 3): faint pupils at every desk but the one nearest the door (T. Hale's), with
  blurred faces and black eyes, all turned to look at you (owner: keep the empty desk). Board (mockup
  copy, owner: keep it): "Form III / Monday, 2nd February" (the day Tommy was struck off); when built,
  it goes into en.json and el.json and onto the content sheet.
- Classroom 4: the blinds down, a pull-down screen over the board, the projector on its trolley among
  the desks. The film: five children in a line in their smocks, in profile, but the middle one has
  turned to the camera; grain and scratches; the beam lights the dust.
- Office: his pedestal desk with a green leather top and a lamp, and his chair behind it (owner
  2026-10-24: "appropriate for a headmaster"): high-backed, buttoned oxblood leather with brass
  studs, a carved dark frame with a crest and finials, arms (`headChair`). The visitor's chair across
  the desk stays a hard school chair. The inspector's report on the desk, the
  records cabinet with its number lock (approved still ui_codeLock), the Founder's portrait, a
  bookcase, a crucifix, a hat stand with his coat. Flat: a bed under a crucifix, the doctor's letter
  on the bedside cupboard by the lamp, an armchair and a gramophone by the window, a wardrobe, a
  washstand.

## Part B1 as built (0.2.31)
- Owner 2026-10-24: build part B. The level is `src/levels/school_upper.json`, written by
  `tools/levels/school_part_b.py`; the part B stills now stage the game's own level.
- Stairs both ways: the hall's main stairs and the back stairs by the gym take you up to the head of
  the same stairs (spawns `main_stairs`, `back_stairs`), facing the corridor; look down a stair head
  (`stairHead` with use `travel`, "Go downstairs") to come back to the foot of the same stairs (new
  spawns on the ground floor: beside the hall stairs' bottom step facing into the hall, at the foot of
  the back stairs facing the corridor). You arrive facing away from the stairs, so no prompt sends you
  straight back. Each trip autosaves a checkpoint, as every level change does.
- The stair heads' footprints cover the wells: you cannot step off the landing into the dark.
- The office door takes the headmaster's key (used up, like wing 1's office key); the flat's door,
  inside the office, is open. Classrooms 3 and 4 are open.
- The first-floor plan is pinned on the staff-room notice board. The upper level's own map entry only
  draws it (the key in the empty north-west corner). A map entry can name the line under its prompt
  (`detail`): the hall plan said "Sister's plan of the wing"; both school plans now say what they are.
- New footprints: his desk and chair, the armchair, bedside cupboard, wardrobe, hat stand, side table,
  the projector's trolley and the stair heads.
- Strings added while building, now on the content sheet for the owner to check: the Classroom 3
  board ("Form III / Monday, 2nd February"; Greek «Γ΄ τάξη / Δευτέρα, 2 Φεβρουαρίου»), the Classroom 4
  board ("Form IV / Film: Our School", mostly behind the screen), the room name "Main stairs", and the
  two plans' lines.
- Not yet: the records lock and the documents (B2), the bell, roll call and film (B3), the storm and
  the watcher upstairs (B4). Until then the watcher stays downstairs and the first floor is quiet.

## Part B2 as built (0.2.32)
- The records lock (`src/puzzles/recordsLock.js`, close-up `src/ui/screens/codeLock.js`, as in the
  approved still ui_codeLock): "Try the lock" on the office's records cabinet. ▲▼ or the mouse wheel
  turn the chosen wheel (up counts up: the number below rolls into the window), ◀▶ choose a wheel,
  0–9 set it and move on; a click on a wheel's top or bottom half chooses and turns it; CLICK the
  drawer (or ENTER) tries it. The wheels stay where they were left (progress value
  `records_wheels`).
- 354 (content sheet, Normal) opens it once Classroom 2's board has been read (`seen_counting_board`;
  like the piano, a lucky guess before the clue does nothing). Wrong: the drawer shakes and "The
  drawer won't open."; right: the close-up steps back, "Click. The drawer slides out.", a
  checkpoint. The top drawer slides out with its files; on them lie the roll ("Struck off the
  roll"), Tommy's medical card and the cemetery gate key (each takes a tight aim: they lie side by
  side). The gate key opens the cemetery gate (part C fills the cemetery).
- The inspector's report lies on his desk; Dr. Venn's letter on the bedside cupboard in his flat,
  by the lamp. All four papers are the content sheet's text, English and Greek, with the journal
  lines.
- The paper map rings the lock (a padlock in the ring) once tried, until solved. Maggie's chalk hint
  for it ("COUNT WHAT THE BOARD SAYS") is now in her list: it goes up on a ground-floor corridor
  board after three minutes stuck.
- Stand-in sounds: a wheel click (key_pickup pitched up), the locked rattle for a wrong try, the
  0.2 drawer for the slide (SOUNDS_0.3.md lists what replaces them).
- Not in the content sheet yet, added for the owner to check: the drawer's label card "RECORDS
  A–Z" («ΑΡΧΕΙΟ Α–Ω»).

## Part B3 as built (0.2.33)
- The set pieces (`src/ghosts/setPieces.js` with `bell.js`, `rollCall.js`, `film.js`), registered in
  the level's data ("setPieces") with their tell, cooldown group and comfort field (scare rules §1).
  Each plays once (flag `set_<id>`), the first time you are in its room once it may; leaving the
  level mid-piece ends it and brings its lamps back.
- **The bell** (corridor, first time upstairs): the corridor goes quiet for 1.2 s, then the bell
  rings for 3 s with nobody there (a ringing bell, its dome a blur, stands in for the still one) and
  Classroom 4's door, then Classroom 3's, bang open; a locked door holds. Costs 3 sanity.
- **The roll call** (Classroom 3): the lamp dies (two flickers, or a fade with flicker off) and the
  level's ambient light drops; every desk but Tommy's, the nearest the door, fills with a faint
  pupil facing the board; 1.6 s later they all turn their heads to you (a low sting), 6 sanity; 2 s
  later the lamp is back and the desks are empty.
- **The film** (Classroom 4): the lamp dies and the projector starts by itself; on the screen five
  children walk in profile, the frame weaving a little, the screen light flickering (steady with
  flicker off); after 4.2 s the middle child has turned to the camera (4 sanity); 1.6 s later the
  film snaps: the projector stops, the screen goes white for a blink (dark at once with reduce
  effects or flicker off), the beam dies, and a second later the lamp is back.
- Cooldown: the set pieces keep a cooldown of their own, 30 s after one starts, so they never stack
  but each still plays on your first visit (the brief's 90 s would hold the roll call back until you
  had left Classroom 3); each also starts the ghost children's 90 s scare cooldown. A scripted
  override of the 90 s, logged here as the scare rules ask; the owner confirmed the 30 s
  (2026-10-24). Comfort mode cuts all three.
- Silent, as the content sheet says: no subtitles. Stand-in sounds (SOUNDS_0.3.md): the bell, the
  door bangs, the sting, the projector's clatter and the snap.
- The debug overlay (F3) has a SET PIECES line: the one running and its phase, or the ones still to
  come and the cooldown.

## The storm as built (0.2.34)
- `src/levels/storm.js`: the courtyard and both school floors have "weather": { "storm":
  "puzzle_records" }. It rains from the start; once the records drawer is open, the first strike
  comes 6–10 s later, then one every 20–40 s, with the thunder 1–3 s after each (thunder_far for
  now, louder outside).
- Outdoors (approved still "storm"): the sky and the fog go the still's pale blue-white, a bright
  light falls on the ground and the walls, and the bolt shows ahead of you over the trees; half the
  strikes blink twice. Indoors: the light through the windows washes the room.
- Reduce effects or flicker off: a soft glow rising over 0.35 s and fading over 1.2 s, half as
  bright, and no bolt (scare rules §5).
- The debug overlay (F3) has a STORM line: what it waits for, or the seconds to the next strike.
- Not yet: the watcher outside in the storm (part C).

## The watcher between floors, the part B route (0.2.35)
- `src/ai/watcherFloors.js`: she hunts one floor at a time (progress value `watcher_floor`; at
  first the floor she woke on). Take the stairs while she hunts within 12 m of you and she follows:
  16 s after you arrive her grind sounds on those stairs, and from 20 s she comes off them (at the
  head upstairs, the foot downstairs) as soon as nobody is looking there and you are not standing on
  the spot. Leave that floor before she gets there and she stays where she was. Not close: she keeps
  to her floor, and you find her there when you go back.
- Upstairs she hunts the corridor and both stair heads ("watcher" in school_upper.json); the
  classrooms, the office and the flat are safe. Her arrival spots are the stairs' spawn spots
  ("arrivals" by spawn name, both floors). The debug overlay (F3) has a FLOORS line.
- Owner 2026-10-24: keep it. If she is not close when you go up, she stays downstairs and upstairs
  is safe; she does not wander up on her own. The brief's "doors alone do not save you" is met by
  the follow.
- Bot route `tests/bot-routes/school_upper.json` (part B, starting after part A: the key, the board
  read, the watcher awake downstairs): the main stairs up (the bell), the office (unlocked with the
  key), the lock (354), the roll and the card and the key, the report, the flat and the letter,
  Classroom 4 (the film), Classroom 3, down the back stairs. About 79 s of game time at bot pace, no
  catches; the roll call waited out its cooldown while the bot hurried through Classroom 3. The
  bot test takes a route's "given" flags and items. Tests that time things (set pieces, the storm,
  the floors) set `game.realTime = false`: the frame loop then only draws and time moves only
  through `advance()`, so a busy test machine cannot shift their timings.
- Performance (as for part A: the highest of four directions per room at 320×180, software
  renderer): corridor 67 draw calls, main stairs 76, Class 4 90, back stairs 89, office 108, flat
  133, Class 3 135; at most 19k triangles; 12 point lights upstairs. The roll call adds about 66
  draw calls for its 4 s, the film a few.

## Sounds, priority 1 (0.2.38)
- The owner's 49 files replace the stand-ins (`docs/SOUNDS_0.3.md` lists what still stands in). Each
  plays about as loud as the stand-in it replaced, so the mix stays as tuned; the owner judges them
  on real speakers.
- The watcher: her stone grinds as she moves, a dusty breath at arm's reach (her warning), a heavier
  grind as she grabs, and the drone while she is close and unseen. Maggie hums under her rhymes; a
  wrong square slaps the rope, then she giggles. Chalk on the boards; Classroom 1's desks scrape.
- Maggie's desk lid, the staff-room drawer, the lock's wheels and the records drawer. The bell rings
  once and its ring dies away; the doors bang open; the projector runs, and runs down when the film
  snaps. Close thunder in the storm, quieter indoors.
- Outdoors: rain and wind beds, gravel and grass steps, the iron gates creak. The classrooms have
  their own room tone in place of the building's hum.
- For later parts: stone steps (stone paths), match strikes (the lanterns), book drops.

## Part A performance (0.2.23)
- Highest of four directions per room at 320×180 (software renderer, so no fps), with every board
  written and Class 1's desks turned: outdoors 52–74 draw calls; school hall 174, music 178,
  cloakroom 200, Class 2 209, nurse 220, corridor 223, gym 226, Class 1 252, library 285, art room
  293, staff room 322; at most 45k triangles; 19 point lights in the school. The 0.2.21 figures were
  read too soon after each turn and came out low in some rooms (the library at 99).
- The chalk boards and the turned desks add 4–9 draw calls to a view: each board's slate is its own
  mesh (its words change), its frame merges with the furniture; Class 1's desks merge in two sets.
- The owner measures fps on the playtest laptop; if it falls short, the first fixes are merging the
  boards' and paintings' canvas textures and fewer lamps per room.

