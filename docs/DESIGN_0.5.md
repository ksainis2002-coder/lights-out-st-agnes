# 0.5 the chapel and the basement: design proposal

**Status: a proposal (2026-11-17). Nothing here is approved yet and nothing is built.** The brief
wins on anything not listed. The owner's picks get written into this file as they are made; until
then every line below is a proposal, with the open questions at the end.

## What the brief fixes
- Milestone 0.5: "Chapel and basement finale with the surgeon, Sam, Nora met, all four endings."
- Wing 4: basement, morgue and boiler room; the surgeon "plus all"; drones; puzzles that combine
  clues from every wing. Weather: dead calm before the finale.
- The four statue pieces rebuild St. Agnes in the chapel and open the basement. The watcher is that
  statue: her right hand broke off at the wrist (wing 1's piece), the lamb fits the crook of her arm
  (wing 2), the palm fits the hand (wing 3).
- The surgeon, the blind hunter: experimented on orphans; bandaged face, surgical tools; hears only.
  He hears running, doors and things thrown. Counters: crouch, hold your breath, throw to lure. The
  camcorder flash is the only stun. He warns by sound (his tools, his breathing) through one wall.
- Sam Pike: drowned in the boiler-room flood; his toy is a tin soldier.
- Nora Kane: heard early, met late; at the end you choose to save her or let the building take her.
- Endings: Escape (false: out through the front gate, the same night loops), Acceptance (high sanity
  and Nora saved: he remembers his death and moves on), Becomes the building (low sanity: its next
  hunter), Frees the children (secret: all five toys, all the file pages and the 3:00 room). Each
  confirms a different death for Tommy: the fire, the basement, the surgeon's table.

## What the story has already planted
- Tommy was "sent to the boiler house for coal" and missed the afternoon register (wing 2); Dr. Venn:
  "The Hale boy was brought to me for his nerves. I did not have him long", and "what he could not
  use went down to the basement" (wing 3); the fire on 12th May (wing 3's night book).
- Sam Pike: bed 4 in the boys' dorm, in the class painting, struck off 9th June, aged 10.
- Agnes: "By the Founder's order"; Sister M.'s confession: "a house needs a heart, and she was
  nobody's child". Nora is looking for Agnes, her grandmother's sister. Nora went down the west
  wing's basement stairs (the gate waits on flag `basement_open`).
- In code already: the player's noise (still 0, crouch 1.5, walk 4, run 10: "the AI will listen to
  later"), a Space key for holding your breath (no effect yet), the chapel door's keyhole line, the
  front gate shut (`front_gate_open`), the watcher standing at the chapel door after wing 2.

## The wing as proposed
- **Size:** about 60 minutes on Normal, like wings 2 and 3: the chapel and its crypt, then the
  basement under the west wing (one floor, larger than a ward floor). Parts:
  **A** the chapel and the crypt, the statue rebuilt; **B** the basement and the surgeon;
  **C** Nora, the choice, the way out, the endings.
- **A: the chapel.** Once wing 3 is done the watcher is no longer at the door: you find her inside,
  on her plinth before the altar, facing the pews. She still only moves when nobody looks, so every
  piece you put back on her is done with your eyes on her. The fourth piece is the chapel's own,
  in the crypt below: a puzzle with the five children's memorial plaques, in the order the roll
  struck them off (Agnes, Tommy, Maggie, Sam, Edith; wing 2's struck-off list). With all four in
  place she is whole and still for good; the bell tolls once; the storm stops (dead calm); and the
  west wing's basement gate, where Nora went down, unlocks (`basement_open`): the one way in.
- **B: the basement.** Under the west wing: the coal store (where Tommy was sent), the boiler room
  (flooded; Sam), the laundry chute, the cold corridor, the morgue, the surgeon's theatre, and a
  locked door at the far end (the Founder's room: 0.6, the secret). Dark, wet, his tools clinking.
- **The surgeon** (proposed: Dr. Venn himself, bandaged over the eyes). He walks a round and stops at
  any sound. What he hears, how far: running about 12 m, walking 5 m, crouching 1.5 m, standing
  still nothing; a door opened fast, things knocked over, a thrown bottle where it lands; your
  breath after running (panting) unless you hold it. Through one wall at half the distance.
  - **Warning before any catch:** his instruments clink on their tray as he walks (heard through a
    wall); when he hears you the clinking stops dead (the silence is the tell), he turns his head
    towards the sound, then comes, fast, for about 2 s of warning (comfort mode 3.5 s).
  - **Catch:** he reaches you while you make a sound, or you walk into him: his hand over your mouth,
    the scalpel, dark (1 to 1.5 s; comfort mode: no close-up). The rewind, with Sam's whisper.
  - **Counters:** crouch-walk; hold your breath (Space: about 6 s of silence, then a gasp he can hear);
    throw a bottle or a stone to send him the other way (a new key: the right mouse button is the
    flash now); open doors slowly (hold and drag) or not at all; the flash stuns him for 5 s; hide in
    the morgue's lockers.
- **Sam Pike.** Faceless and unhurt like every ghost child, his clothes dark with water, dripping.
  He cannot speak (the water): he knocks on the pipes. One knock far off, two near: where the
  surgeon is, as Edith told you where Sister M. was. Once you have found his tin soldier (under the
  water in the boiler room, after draining it), his knocking can draw the surgeon away when you need
  it, three times.
- **Nora, met.** In the surgeon's theatre, strapped to the table (the building wants her blood:
  Agnes's family), alive and frightened. The choice: free her (she follows you out and the way out
  is harder: two to keep quiet) or leave her (the building takes her; the theatre door shuts behind
  you).
- **Puzzles (clues from every wing):**
  1. The crypt's plaques: the struck-off order (wing 2) opens the niche with the fourth piece.
  2. The boiler room's three valves: drain the flood. The boiler log gives pressures as the fuse
     board did circuits (wing 3): too little water to every pipe at once.
  3. The morgue's drawers: the drawers are labelled by date, not name; the dates the children were
     struck off (wing 2) and the bed charts' dates (wing 3) say which drawer holds what. The
     children's drawers are empty, name tags only: harm to children is never shown.
  4. The theatre's cabinet: Edith's music box plays a tune with one note missing (wing 3); the
     missing note is the code.
- **Rewards:** the statue whole (part A), Sam's tin soldier, T. Hale's file page 4 (the morgue).
- **Set pieces (each with a setup and a cooldown in the level data):** the chapel bell as she is
  made whole; a morgue drawer sliding out by itself; the boiler roaring back to life as the flood
  drains; the surgeon's first appearance: he crosses a doorway ahead, clinking, and stops when you
  make a sound (the lesson).
- **The way out and the endings:** from the theatre, up the west wing's basement stairs into the
  wards (Sister M. still walks there, the lamps dead), across the courtyard. Then: the front gate
  (Escape), or back to your room, where the ending plays by your sanity and whether Nora is with
  you (Acceptance or Becomes the building). "Plus all": the surgeon follows you up; Sister M. and the
  rebuilt St. Agnes no longer hunt.
- **The hub:** your room's last change after the basement.

## New for the player
- **Hold your breath** (Space, already bound): about 6 s of silence; the camcorder's pulse line
  shows it; a gasp at the end if you held it too long.
- **Throw** (a new key; proposed G): bottles and stones found in the basement land with a noise he
  goes to. A settings migration adds the key.
- **Lockers** to hide in (the morgue, the staff room), like the ward beds.

## Stills to draw once the open questions are answered
`wing_map` (with this proposal), then `chapel` (the watcher on her plinth, missing her pieces),
`statue_whole`, `crypt`, `surgeon`, `surgeon_listens` (the tell), `sam` (the boiler room, the
water), `morgue`, `theatre_nora`, and the breath on the pulse line.

## Open questions (quick picks for the owner)
1. **The fourth piece:** her heart (a stone heart: "a house needs a heart"), her crown, or her face.
2. **The surgeon:** Dr. Venn himself, or a surgeon of his we have not met.
3. **The secret ending:** in 0.5 (with the 3:00 room left for 0.6), or all of it in 0.6.
4. **Nora:** strapped to the surgeon's table, or found hiding in the basement and caught later.
