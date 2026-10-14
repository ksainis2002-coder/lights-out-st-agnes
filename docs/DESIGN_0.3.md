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
- **Plan:** the map `wing_map.png` was approved as drawn, then extended on 2026-10-14 (below) and
  redrawn with the new rooms in 0.2.12 (waiting for the owner's OK before part A is built).

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
2. **Piano:** coloured key stickers; the song page is coloured dots → the headmaster's key.
3. **Counting board → records lock:** count the windows, the lids left up and the names on the
   board; three number wheels.
4. **Hopscotch rhyme:** Maggie's rhyme names the squares; a wrong square → the rope slaps, she
   giggles, start again from 1.
5. **Grave lanterns:** the order the children were struck off the roll (the art room painting
   backs it up); Tommy's worn stone by elimination.
On **Hard**, answers shuffle each new game (lids up, piano dots, hopscotch rhyme, roll order) with
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
- **Gravestones:** look and click: the name and age as a message, added to the journal; Tommy's
  says the name has worn away.
- **Maps:** ground floor and grounds on the hall noticeboard; upstairs in the staff room.

## How it is built
1. **Wing 1 furniture pass** (first job, below). Done in 0.2.7.
2. **Content sheet** for approval: every name, document and rhyme in English and Greek. Written
   2026-10-14 as a Claude Doc, "Wing 2 Content Sheet (0.3)":
   https://claude.ai/code/artifact/9cc99d43-ea28-458a-b2bb-2ade5c73785c (puzzle answers on Normal:
   records lock 354; piano blue, blue, yellow, purple, blue, yellow; hopscotch 2, 7, 5, 9, 1;
   lanterns Agnes, Thomas Hale, Margaret Rowe, Samuel Pike, Edith Carr). Its checklist holds the
   owner's open points. Once approved, the text goes into en.json and el.json; the doc is not read
   by the game.
3. **Part A, courtyard and ground floor:** stills first, then the garden door, courtyard, the
   ground floor rooms, the watcher, Maggie, the library, piano and hopscotch puzzles. Owner
   playtest.
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
