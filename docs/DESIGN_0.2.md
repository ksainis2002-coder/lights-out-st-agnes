# 0.2 vertical slice: design decisions

Decided by the owner on 2026-10-09 (quick picks). The brief wins on anything not listed here.

## Threat in the dorms
Ghost children never kill. What ends a run in the dorms is **sanity collapse**: the children,
the dark and the dorm's events drain sanity; at zero the player blacks out and the VHS rewind
returns them to the last checkpoint, with a ghost child whispering what went wrong.

## Puzzles (wing 1, orphanage dorms)
1. **Names to beds:** the beds' name plates are wrong. The dorm register lists who slept where;
   put the plates back on the right beds.
2. **Lullaby:** a song is written on the wall; its verses give the order of notes to play on
   the music box, which opens the next room.
3. **Toys home:** toys are scattered; the children's drawings show whose toy is whose; return
   each to its owner's cubby.
Rewards: Tommy's wooden horse (toy), the first statue piece, the first page of T. Hale's file.

## Tommy
Seen only far away (corridor ends, doorways), leads with footsteps and laughter, speaks only in
short subtitled whispers: hints, and the line after a rewind.
Subtitles label him "(a child, whispering)" until the player learns his name (his name plate or
the dorm register), then "(Tommy, whispering)". Same rule for every ghost child.

## Mockup stills (docs/mockups/stills-0.2/, made with the real renderer: mockup.html)
intro_wake, hub, dorm, tommy, low_sanity, rewind. Approval status is tracked in HANDOFF.md.
Names on the dorm beds are placeholders until the content sheet is written.

## Wing 1 plan (approved 2026-10-09)
Plan: `docs/mockups/stills-0.2/wing_map.png`. Landing → corridor; washroom (office key) →
office (register, linen key) → east dorm (names to beds → music box crank) → linen cupboard
(3 toys) → playroom (toys home → west dorm unlocks) → west dorm (lullaby → hidden door) →
quiet room (horse, statue piece, file page) → back to the landing and the hub.
**Paper map:** the found map shows a blank wall where the quiet room is. A child's scribble
appears there once the player has found a specific note; the room is pencilled in once entered.
**Office clock (owner decision 2026-10-11):** using the wall clock reads out the real local time.
The third use drops the scribble note and a riddle note (hint only, not required) from behind it.
The player is never told how many uses it takes.

## Showing sanity (owner decision 2026-10-10)
No meter on screen. The effects make it plain (from 85 down, steadily stronger) and the journal's
CLUES page opens with "How I feel: …" (calm / uneasy / shaking / falling apart). The camcorder
HUD shows it from 0.4, as in the brief.

## Downloadable app (owner decision 2026-10-10)
Besides the free browser release on GitHub Pages, make a downloadable Windows app near release
(0.9 / 1.0), so sound starts at once and the mouse needs no click to be recaptured (browser rules).
Not part of 0.2.

## Real clock
Wall clocks (first one: Sister M.'s office) show the player's real local time, read from the
computer only. It sets up the brief's real-clock events and the secret room that opens at 3:00.

## In-game screens (approved 2026-10-09)
- **Use:** left mouse click. Prompt = centre dot + one line ("CLICK Take name plate").
- **Inventory:** TAB, 8 slots in a strip at the bottom, game keeps running; CLICK uses, R combines.
- **Journal:** J, notebook with CLUES / DOCUMENTS / MAPS tabs; entries warp at low sanity.
- **Documents:** the paper fills the view with a typed transcript beside it (T hides it); CLICK puts back.
- **Saving:** at tape recorders, VCR "RECORD TO TAPE" menu with 3 tapes; REWIND in the main menu
  uses the same tape list to load. Autosave at checkpoints is silent and separate.

## Build order for 0.2
1. Interaction (use prompt, doors) and moving between levels; wing map for the dorms (owner approves)
2. Sounds in the game (footsteps by floor, ambience per room, music)
3. Inventory, pickups, journal, documents (EN + EL)
4. Tape-recorder saving, REWIND loading, checkpoint autosave
5. Sanity: drains, screen effects, fake children, collapse → rewind
6. Ghost children and Tommy, subtitles (name rule)
7. The three puzzles and their rewards
8. Intro
9. Bot route, balance (≈45 min, 2–4 rewinds/hour), tests, release 0.2.0

## Tommy and T. Hale (owner decision 2026-10-11)
Keep it a hint, never confirmed (brief). Shared surname only: the register lists Thomas Hale, the
quiet-room file page names "T. Hale" with the age blotted and no belongings listed.

## Wing 1 extension (owner decision 2026-10-11: "all")
After the owner's 10-minute playtest the wing was lengthened:
- New rooms: sick bay (off the corridor at 24,12) and dining hall (east end, 27,11).
- Lights out: solving the plates cuts the "mains" lights (corridor, playroom, office, sick bay,
  dining hall). Moonlit dorms and the landing stay lit.
- Puzzle 4 (fuses): the night rota (office desk) says to pull the sick-bay levers in the order of
  tonight's hymns; the dining-hall hymn board reads 3, 1, 4, 2. Both must be seen first.
- The medicine cabinet is on the lighting circuit: the linen key (moved from the office desk) and
  pills are behind its glass until the fuses are fixed.
- Spinning top moved to the dining hall (Peter's letter says so). Five new documents.
- Darker west dorm and quiet room (their lights removed); dining-hall scare after the toys.
- Flashlight batteries: 8 minutes each (owner: 10 never ran out); 4 in the wing (washroom, east dorm,
  playroom, dining hall).
Balance (bot at human pace): 42 min, 3 collapses (4.3/hour), 4 batteries used, 1 pill; the light runs out in the last minutes at this slow pace.

## Quiet-room notes (owner decision 2026-10-11: "a")
The office clock only tells the real time now (the owner read it as the 3:00 secret room, which
stays in 0.6). When the toys puzzle unbolts the west dorm, Tommy appears in the corridor by its
door, whispers "She puts him behind the wall when he cries. Rose knows." and leads the player in;
the scribble note (map "?") and the riddle lie on Rose's bed.

## Rose's note (owner decision 2026-10-12: "b")
The scribble note, the riddle and the map's "?" stage are gone. One note on Rose's bed (shown
once the toys are home; Tommy leads to it) links the music box to the playroom slate. The map
leaves the quiet room blank until it is entered. Peter's letter became a page from his diary (owner: it is an orphanage).

## Sanity on screen (owner decision 2026-10-13, replaces 2026-10-10)
A pulse in the lower left (approved still ui_sanityPulse), always on while playing: heart, scrolling
trace, four pips and the state in words (calm / uneasy / shaking / falling apart). The camcorder's
own display takes over when it is found (0.4). A "your mind" card (ui_sanityCard) explains sanity the
first time it drops below 85, and once more after the first blackout. The journal line stays.

## Room dressing (owner requests 2026-10-13)
The washroom and linen cupboard were empty rooms holding only their items. The washroom now has
three sinks with cracked mirrors, a duckboard, a bath, three toilet cubicles (the whisper scare
comes from them), towel rails by the door, a bucket and mop, and a drain under the office key.
The linen cupboard has slatted shelves of folded linen on both walls, a mangle, a laundry basket
and an ironing board. The quiet room gets no furniture, only what a child shut in there left:
fingernail scratches either side of the door, small grimy handprints, 38 days counted on the wall
(12 more on another), wallpaper picked off, charcoal drawings (a door with the sun outside, a
veiled figure scribbled out), a worn patch where he sat, and a tin plate and cup by the door.
Aftermath only, no blood (scare rules). Stills room_washroom, room_washroom_sinks, room_linen,
room_quiet and room_quiet_tally in `docs/mockups/stills-0.2/`.

## Furniture pass (owner Q&A 2026-10-14)
Washroom: grey water in the sinks, a puddle by the bath, a second dripping tap. Linen cupboard:
sheets on a washing line above head height, a laundry chute in the wall. Corridor: a runner rug,
radiators, benches, coat pegs, a notice board. Landing: a rug, a bench under coat pegs, a radiator,
a picture of St. Agnes with her lamb. Office: a crucifix, two filing cabinets, a typewriter on a
side table, a bookcase. Sick bay: folding screens, a trolley. Dorms: chairs with clothes between
the beds, shoes, teddies on pillows, a toy train, a drum, a washstand. Playroom: a rocking horse,
a toy box, a little table and chairs, a teddy on the chair. No new toy looks like a puzzle toy.
The quiet room stays as it is. Furniture that never changes is merged into one mesh per material
when a level loads: the furnished landing and corridor draw fewer calls (about 300–340) than the
bare 0.2.3 wing did (about 390–430). Stills furnished_* in `docs/mockups/stills-0.2/`.

## Map marks (owner decisions 2026-10-14, approved still ui_mapMarks)
The paper map now shows, over the pencilled plan: you (red crayon X); each tape recorder once you
have been within about 3 m of it (ink cassette); safe places (green crayon house): the way up to
your room, and from wing 2 the rooms the watcher cannot enter, once you have been in them; and each
puzzle from the first time you try it until it is solved (a blue crayon ring with a sign of what it
is; it is gone once solved). A key in an empty corner of each map explains the marks (English and
Greek). Room names on the map now shrink to stay inside small rooms (long Greek names).
Level data: recorders need an "id"; "safe": true on a level or a room; "key": [c, r] on the map
entry; "mapAt" places a mark by hand.

