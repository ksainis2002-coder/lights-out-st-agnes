# 0.3 school wing: design decisions

The brief wins on anything not listed here. Owner decisions are dated; everything under
"Proposal" waits for the owner's answer.

## Owner decisions (2026-10-13)
- **Looks approved:** stills classroom, blackboard, watcher, watcher_close, maggie, courtyard and
  cemetery (`docs/mockups/stills-0.3/`).
- **Graves (pick c):** the five children's graves carry their names, but Tommy's stone is worn too
  smooth to read. Reading it says only that the name has worn away. The hint stays a hint.
- **The watcher's catch (pick a):** when she reaches you unseen she grabs you: a short kill
  (1–2 s) with her face filling the view, then the VHS rewind to the last checkpoint and a ghost
  child's whisper about what happened (brief: death).

## Proposal: the wing (plan `docs/mockups/stills-0.3/wing_map.png`)
Wing 1 done (horse, statue piece, file page) → the garden door on the orphanage landing opens →
**courtyard** (outdoors, rain) → **school**. The courtyard joins the wings, as in the brief: the
asylum door is chained (0.4), the chapel is locked (0.5), the front gate is chained (0.5); the
cemetery gate needs the gate key.

School rooms: entrance hall (school map on the noticeboard), main corridor, Class 1, Class 2,
library, gym, headmaster's office (locked), staff room (tape recorder), cloakroom.

### Route
1. Courtyard: the statue of St. Agnes stands on the path in the rain, facing the school. She
   does not move yet.
2. Class 1: lines on the blackboard; Maggie skipping (first rhyme). Her desk: her library ticket.
3. Library: the card index turns the book on her ticket into a shelf number; the book hides the
   headmaster's key. The watcher is introduced here: she stands at the end of an aisle, the light
   dies for a moment, she is closer, Maggie whispers "She only moves when nobody's looking."
   From then on she hunts the corridor, library, gym and hall.
4. Class 2: the counting lesson on the blackboard gives a three-digit code.
5. Headmaster's office (key): the records cabinet (code) holds the "struck off the roll" list
   (the five children, in the order they left), the cemetery gate key and Tommy's medical card.
   The storm starts.
6. Gym: Maggie skips by a chalked hopscotch and sings which squares to hop, in order. Hop them →
   her skipping rope (wing 2 toy).
7. Staff room: matches (also a battery, pills, the tape recorder).
8. Cemetery, in the storm (the watcher follows outside; lightning shows where she is): light the
   lanterns on the five graves in the order the children left the roll → Agnes's grave slab opens
   → the stone lamb (statue piece 2: St. Agnes is shown with a lamb) and T. Hale's file page 2.
9. Back to the hub; the patient room has new drawings on its walls.

### Puzzles (each needs its clue first, as in wing 1)
1. **Library index:** ticket → index card → shelf number → book.
2. **Counting board:** count the windows, the lids left up and the names on the board → the
   three wheels of the records lock (new close-up screen, still ui_codeLock).
3. **Hopscotch rhyme:** Maggie's rhyme names the squares; step on them in order.
4. **Grave lanterns:** the roll gives the order; Tommy's worn stone is found by elimination.
Numbers and pictures only, so every puzzle works the same in Greek.

### The watcher
- Moves only while you don't see her: off screen, behind a wall, or in the dark (flashlight off
  or pointed away, no lamp near her). Seen, she is stone.
- Grinds stone each time she moves; the sound is positional, so you hear where she is.
- At arm's reach a dusty breath: 1.5 s to turn and look before the grab (scare rules: warning,
  time to react, then contact).
- Staring at her drains sanity (brief), so you cannot simply watch her: back away, close a door.
- She cannot open closed doors and waits outside them.
- Speed while unseen: 2.6 m/s on Normal (walk 1.7, run 3.3); slower on Story and in comfort mode,
  faster on Hard.
- No kill before her introduction in the library. After a death Maggie whispers what happened.

### Tommy's three deaths (brief: clues only, never confirmed)
- Fire: the gym's fire-drill log: after the fire, "all pupils accounted for except Hale, T."
- Basement: Class 1's detention book: "Hale, T. sent to the boiler room for coal. Not back for
  the afternoon register."
- Surgeon's table: his medical card in the records: "referred to the doctor in the west wing."

### Weather
Rain on arrival; the storm (close thunder, lightning) starts when the office is opened and lasts
the rest of the wing. Lightning obeys reduce effects and flicker off (a soft glow instead).

### Stills for this proposal (`docs/mockups/stills-0.3/`)
watcher_grab (her catch), storm (a lightning flash in the cemetery), ui_codeLock (records lock),
library (aisle and card index), gym (wall bars, ropes, hopscotch, Maggie's rhyme).

### Build order
1. Courtyard level (open sky, rain, doors between levels), the wing-1-done gate, hub drawings.
2. School level (rooms, lights, doors, map, saves, checkpoints).
3. Documents and clues (EN + EL).
4. The watcher: senses, movement, sounds, catch, debug overlay, tests.
5. Maggie: appearances, rhymes as subtitles.
6. The four puzzles and rewards.
7. Storm and lightning.
8. Sounds (when the CC0 files from `docs/SOUNDS_0.3.md` arrive), bot route, balance, tests,
   release 0.3.0.
