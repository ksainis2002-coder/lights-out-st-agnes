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
