# 0.5 the chapel and the basement: design proposal

**Status (2026-11-18): every wing 4 still and the content sheet (all of the wing's text, English and
Greek) are approved; part A (the chapel and the crypt) is built (0.2.97); part B is being built (the
basement level, 0.2.99); part B is built (0.2.106); part C's stills wait for a yes (0.2.107).** Sound list: the Claude Doc "Sound List for 0.5 (Chapel and
Basement)", https://claude.ai/artifact/T81UhaxvC8c9CUrBiF8n7E (`docs/SOUNDS_0.5.md`).
Content sheet: the Claude Doc "Lights Out at St. Agnes: wing 4 content sheet (0.5)",
https://claude.ai/artifact/BTuaqxchpYDVYGNJHJWg4c. The brief wins on anything not listed. The
owner's picks are written into this file as they are made.

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
  - **Warning before any catch:** his instruments clink on his belt as he walks (heard through a
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

## First stills (2026-11-17, waiting for a yes)
In `docs/mockups/stills-0.5/`, after the owner's picks: `chapel` (St. Agnes on her plinth before
the altar, her hand gone at the wrist), `statue_whole` (her hand and palm back, the lamb in her arm,
her stone heart in her breast; the bell, the rain stops), `crypt` (the plaques, two pushed home; her
heart in the niche), `surgeon` (Dr. Venn coming down the cold corridor at you, a knife raised),
`surgeon_face` (up close, looming over you: the bandage, the stitched eye, the teeth),
`surgeon_belt` (his belt of tools, close), `surgeon_listens` (the tell, through the
camcorder: he has stopped and turned his head; your held breath under the pulse line),
`ui_breath` (the held breath without the camcorder: a ring round the centre of your view), `sam` (the
boiler room under water, Sam faceless and dripping), `morgue` (drawers typed with dates, one out, a
sheet over an adult, a tag on a toe), `theatre_nora` (Nora strapped to the table under its lamp,
his cabinet and tray), `nora_close` (leaning over her, her face lifted to yours). Reshoot:
`node tools/shoot-stills.mjs <names>` with the dev server on 5199.
Mockup-only code so far: `src/props/chapel.js`, `src/props/basement.js`,
`src/props/basementFigures.js` (registered in the catalog for the stills), the figures
`src/props/surgeon.js`, `surgeonHead.js`, `surgeonTools.js`, `nora.js`, `noraHead.js`,
`noraFace.js`, `noraHair.js` and their
shape helpers `src/props/sculpt.js`, the mock level
`src/mockups/levels/basement.json` and `src/mockups/basementStills.js`. No game level, enemy,
item or text exists yet; the mockup captions are mockup copy (game text will go through i18n).

## Picked by the owner (2026-11-17)
- **The fourth piece: her stone heart,** the size of a child's fist, in the crypt's niche ("a house
  needs a heart"; it points at the building's real heart, Little Aggie, for the secret ending).
- **The surgeon is Dr. Venn,** bandaged over the eyes.
- **The secret ending comes whole in 0.6,** with Little Aggie and the 3:00 room. 0.5 builds Escape,
  Acceptance and Becomes the building.
- **Nora is found strapped to the surgeon's table** in the theatre; you free her (she follows you
  out, two to keep quiet) or leave her (the building takes her).

## Owner's notes on the first stills (2026-11-17) and the second pass
- **Dr. Venn: "not scary enough".** Now longer and thinner and stooped from the waist, his gown grey
  with old blood down the front, a narrow black rubber apron smeared dark, rubber gauntlets wet with
  it, the bandage wound twice and soaked through where his eyes were with a run down from each, a
  loose end hanging at his jaw, a thin slit of a mouth, the blades on his tray dark. His figure is in
  `src/props/surgeon.js`. Blood is drawn dried-dark: bright red read as paint under the lamp. His
  close-up is lit from above (a torch in his face blew him out).
- **St. Agnes whole:** her heart is grey stone like the rest of her (the red-brown one read as a
  wound), set in a hollow carved in her breast with a faint warmth; her hand (with its wrist) and the
  lamb are bigger and read at a glance; candles on stands either side of her and a closer view.
- **Sam:** greyer and dimmer than the other children; plainly drowned: hair flat to his head with
  strands stuck down over the blank face, clothes dark and clinging, water running off his hem and
  fingers, rings on the water round his legs; his own clothes: a collared jersey, braces, bare feet.
- **Nora:** a body with shoulders and a waist, her arms down her sides under the strap with the
  elbows pulling up and the fists clenched, her chest lifting, her head turned to you, her hair loose
  off the end of the table. Her face is built on her head (no flat card): eyes wide, brows drawn up,
  mouth open, a bruise on her cheekbone, a cut through her brow. Seen leaning over her.
- **Your held breath:** larger and clearer, two shapes to choose from: a ring round the centre of
  your view that empties (`ui_breath`, and in `surgeon_listens` through the camcorder) or a small
  pair of lungs low in the middle that empty from the top (`ui_breath_lungs`), both labelled
  HOLDING BREATH and turning red near the end.
- Approved as drawn: the chapel, the crypt, the morgue.

## Owner's notes on the second pass (2026-11-17) and the third
- **Dr. Venn: "too much gore".** The blood is back to a few old marks on his gown and one wiped
  smear on the apron; black rubber gauntlets; only a faint seep under the bandage; his instruments
  are clean steel that catches the light. The threat is his silence and his tools. His close-up shows
  him whole, the tray at his waist, a faint light on the bandage.
- **Your held breath: the ring** round the centre of your view (the lungs are dropped).
- **St. Agnes whole and Sam: approved.**
- **Nora:** her face was "stuck on", she looked "like a doll", the pose "isn't afraid", and the
  room should show. Now: a slimmer body (hips, waist, an arched chest, shoulders) under straps drawn
  over her; her back arched off the table, her head lifted and turned to you, her right hand pulled
  free and reaching, her left fist clenched under the strap; her face only shadowed eye sockets and a
  dark open mouth, her hair fallen across one eye and hanging off the end of the table. Seen from a
  few steps into the theatre: the table under its lamp, his cabinet, his tray.

## Owner's notes on the third pass (2026-11-17) and the fourth
- **Dr. Venn: "take inspiration from the doctor in Dead by Daylight".** Taken in spirit only (he stays
  ours: no copy of that character's face, head brace, coat or shock kit). The owner picked three
  qualities of it: a wrecked man who moves wrong, a tall ruined white coat, and that he drives you
  mad (not the electricity). Now: a long white coat gone to grime, open down the front over the dark
  gown, sleeves past his wrists with long gloved fingers splayed; a head mirror strapped over the
  bandage; the bandage slipped on one side and the eye under it stitched shut; the jaw hanging open
  and askew; the head cocked too far, one shoulder high, the right arm bent out; the tray of clean
  instruments tipped in his left hand. **He drives you mad (to build):** near him your sanity falls
  faster, and at low sanity his clinking comes from the wrong side.
- **Nora: body stiff, face odd, "too slender, like a doll", her hair weird, "why are her hands in
  the air?"** Now built as a woman of ordinary build standing and laid on the table: her back lifting,
  her arms pulling at her sides under the strap with the fists clenched (no hand in the air), one knee
  drawn up, her head lifted and turned to you; her face painted round the front of her head (eyes
  wide, brows drawn up, mouth open, a bruise), her hair dark and tied back. Seen from her side, the
  room behind.

## Owner's notes on the fourth pass (2026-11-17) and the fifth
- **Dr. Venn: "too blocky, crude", the face "not scary", the pose "not threatening", the coat's
  collar crooked on his right, and no tray: he carries his tools on a belt.** Now built from smooth
  shapes (`src/props/sculpt.js`: tubes that change shape along a curve, straps, heads sculpted from
  a sphere, hands with jointed fingers). He looms: hunched forward, his head low and thrust out
  between his shoulders, a long amputation knife raised in his right hand, his left reaching for
  you, long gloved fingers spread. His face is sculpted: grey skin sunk round the eyes and under
  the cheekbones, the lips drawn back off long yellowed teeth, the bandage slipped off his left eye
  to show it stitched shut in black thread, an old stitched scar up his forehead, thin hair combed
  back (the head mirror is gone: at this size it read as an eye). The coat hangs even on both sides,
  open at the throat, buttoned to the belt, parting below it, torn at the hem. His belt holds his
  instruments: scalpels, forceps, scissors, a bone saw, two rings of clamps that clink as he walks,
  a pouch on each hip.
- **Nora: still "doll-like", her face odd, "bald with a black smudge", the straps "like planks".**
  Now built smooth and in layers: a waxed jacket open over a knitted jumper, jeans, boots; her back
  arched, her right knee drawn up, her fists clenched in leather cuffs. Her head is sculpted (a
  small nose, full lips, a soft jaw), her face painted at its true scale (eyes wide and looking at
  you, brows up, mouth open, a bruise, a cut through her brow), and her hair is real: dark auburn,
  loose, over her ears, spilling off the back of her head onto the table. Leather straps with steel
  buckles go over her chest and arms, her hips and her shins and under the table's edge (the table's
  own flat straps are gone). A new close-up, `nora_close`, shows her face as you lean over her.

## Owner's notes on the fifth pass (2026-11-17) and the sixth
- **Dr. Venn: approved,** with one change: his tools should be easier to recognise on the belt.
  Now larger than life (about one and a half times), chunky enough to survive the game's
  resolution, each against a dark leather holster so the steel reads against his white coat: an
  amputation saw with a toothed blade and a pistol grip, a surgical mallet head down, a leather roll
  of scalpels with the blades up, shears, bone forceps, a ring of hooks, and the clamps behind. The
  four that say what he is (shears, scalpels, mallet, saw) face the front. New close still:
  `surgeon_belt` (his belt as he passes where you crouch).
- **Nora: "face still odd, you're almost there".** Her face is repainted in proportion: almond
  eyes opened wide and looking at you, softer lids and brows, a nose that shows (light down the
  bridge, shade under it), her mouth open in fright with the top teeth showing, light on her
  forehead and cheekbones, shade under her jaw. Her hair frames her face and falls back off her
  jaw (it read as an egg). The cut is at her right temple, by the hair. Her head is lifted higher
  off the table and turned less, so in `nora_close` her face is upright to you.

## Owner's notes on the sixth pass (2026-11-17) and the seventh
- **Dr. Venn: approved,** his belt of tools included. Every wing 4 still but Nora is now approved.
- **Nora: "still not right": cartoon or doll-like, surprised rather than terrified, the hair like a
  helmet; three versions to pick from.** All three share a new face in an adult's proportions:
  her eyes an eye's width apart (they were too close, which read as a doll's), her nose and mouth
  lower on a longer lower face, no outlines (only shade and colour), and hair built as a thin layer
  over her scalp whose edge breaks into strands, with locks that fall off her head and lie on the
  table. The versions differ in her expression and her hair:
  - `nora_a`, **terrified:** brows raised and drawn together, white showing over her irises, lines
    across her forehead, her lips stretched back off her teeth, sweat; her hair long and loose,
    parted on her right, spread round her head on the table, a lock over her temple.
  - `nora_b`, **crying, pleading:** brows up in the middle, eyes wet and red-rimmed, tears down her
    cheeks, her nose red, her mouth open in a sob with the corners pulled down; her hair tied back
    in a ponytail coming loose, wisps at her temples.
  - `nora_c`, **exhausted, hurt:** heavy lids, dark under her eyes, her lips parted and the lower
    one split, a bruise on her jaw, smears of dirt, dried blood from the cut at her temple; her hair
    damp and dark, clumped, stuck to her forehead and cheek.
  The owner picks one (or mixes, e.g. one face with another's hair); the other two are then removed.
  Until then `theatre_nora` and `nora_close` show version A.

## Owner's notes on the seventh pass (2026-11-17) and the eighth
- **Nora: none of the three; "still fake, like a mannequin"** (the skin too smooth and pink, the
  neck a long pale tube, nothing about her alive). The three versions stay to pick from; all three
  now have living skin: never one colour (warmer, cooler and yellower blotches, a fine grain),
  freckles over her nose and cheeks, the shine of sweat on her forehead, nose, lip and cheekbones,
  her ears red, the skin under her eyes cooler; wet eyes (the pink inner corners, wet rims, the
  lamp caught in them) and a shine on her lower lip. No two sides of her face are the same: one
  brow and eye a little higher, her mouth higher on one side, the bruised cheekbone swollen, her
  nose a little off true; her eyes are set deeper and her cheekbones stronger. Her neck is short
  and straining as she lifts her head (the cords down her throat stand out, the skin flushed)
  and goes into the jumper's knitted collar; her hands have the same living skin; her clothes
  have weave, wear and creases (a knitted jumper, a creased waxed jacket with a dull shine,
  denim). The light on her is less flat.

## Owner's notes on the eighth pass (2026-11-17) and the ninth
- **Nora: "take inspiration from the female protagonist of Fears to Fathom: Scratch Creek".**
  Taken in spirit only, as with Dr. Venn: Nora stays ours, with no copy of that character's face,
  hair or clothes (Nora keeps her own waxed jacket, jumper and jeans). Of that character's
  qualities the owner picked two: **a real, ordinary woman** (believable and plain, a calm natural
  face where fear shows quietly in the eyes and the breathing) and **simple natural hair**. The
  owner's screenshot was used for the feel only and is not kept in the repository.
- The three versions are dropped for one Nora: a plain young woman's face lit as a photograph is
  (soft light from above, soft shade under the brow, nose, lip and jaw, nothing drawn as a line),
  clear even skin with a light dusting of freckles, soft round cheeks; her fear quiet: her eyes a
  little wide and on you, her brows lifted at the inner ends, her lips parted as she breathes, a
  bruise coming up on one cheekbone. Her hair is light brown, lighter at the lengths, straight,
  parted in the middle, loose to her shoulders, falling either side of her face and spread on the
  table round her head. She lifts her head to look down the table at you, so in `nora_close` her
  face is upright and turned to you; the jumper's collar sits high on her throat.

## Owner's notes on the ninth pass (2026-11-17) and the tenth
- **Nora: "close, small changes": more afraid, and "the mouth is a little far down".** Her mouth
  now sits a lip's height under her nose (it was about a centimetre too low). Her fear is a step
  plainer: her eyes wider, the white showing above her irises, her brows lifted higher and drawn
  in, faint lines across her forehead, her lips further apart with her top teeth showing.

## Owner's notes on the tenth pass (2026-11-17) and the eleventh
- **Nora, one more small change: her nose smaller, shorter and softer; her face rounder with
  fuller cheeks; her hair fuller on top and her hairline a little lower.** Her nose is now short
  with a round tip and only a faint light down the bridge; her face wider and less long, the
  cheeks full, the chin and jaw soft; her hair rises over her crown and either side of the
  parting, and starts lower on her forehead. Her mouth moved up with her shorter nose, so it
  still sits a lip's height under it.

## Owner's notes on the eleventh pass (2026-11-17) and the twelfth
- **Nora: her eyes and hair are fine; her mouth less open; her chin and neck "a little off".** Her
  lips are now just parted (a glimpse of her top teeth). Her chin is a little firmer, lit, with
  shade under it and along her jawline; her neck goes into the underside of her head, so her jaw
  overhangs her throat instead of running straight into it.

## Owner's notes on the twelfth pass (2026-11-17) and the thirteenth
- **Nora: her chin "softer, smaller, rounder: she's a woman"; everything else fine.** The firmer
  chin of the last pass is gone: her chin is small and round, with only soft shade under it and
  along her jaw.

## Owner's notes on the thirteenth pass (2026-11-17)
- **Nora: approved.** With her, every wing 4 still is approved: the chapel, St. Agnes whole, the
  crypt, Dr. Venn (his face, his pose, his belt of tools), Sam, the morgue, Nora, and the breath ring.
- Next: the content sheet for the owner's yes, then part A is built.

## Open questions (asked 2026-11-17, answered above)
1. **The fourth piece:** her heart (a stone heart: "a house needs a heart"), her crown, or her face.
2. **The surgeon:** Dr. Venn himself, or a surgeon of his we have not met.
3. **The secret ending:** in 0.5 (with the 3:00 room left for 0.6), or all of it in 0.6.
4. **Nora:** strapped to the surgeon's table, or found hiding in the basement and caught later.

## Part A as built (0.2.97)
- **Levels:** `chapel` (the nave, 7 m high, on 3 m walls as the approved still's level so the stone
  tiles instead of stretching; its light as the still) and `chapel_crypt`, both written by
  `tools/levels/chapel.py`, which also opens the chapel door on the grounds once the west wing is
  done (the keyhole before), takes the watcher off the chapel step then, and stops the grounds' rain
  once she is whole. Run it after anything that writes the grounds afresh.
- **St. Agnes** (`ai/agnesPieces.js`): she hunts the nave as the watcher; looked in the face, she
  takes back the next piece you carry (hand, then the palm on it, the lamb, the heart), her stone
  rebuilt each time. All four: the bell, the rain stopping (`levels/calm.js`: no storm, no rain beds),
  the gate line, `basement_open`; she stands still for good, turned to the door.
- **The crypt plaques** (`puzzles/plaques.js`): pushed in the roll's order; out of turn they all grind
  back out; Tommy's whisper after two wrong tries (then every third); the slab grinds aside and stays
  beside the niche, as in the approved still; the stone heart (new item) on the ledge.
- **Small calls made while building** (all inside the approved sheet): the crypt steps' line shows
  the first time you go down them; the Founder's board carries the approved dedication in four short
  lines (TO THE GLORY OF GOD / AND FOR THE GOOD / OF THE CHILDREN / GIVEN BY, the name scratched out);
  the plaques are lettered first name over surname, like the gravestones, so they can be read from a
  step away; coming up from the crypt you face her.
- **Tests:** `tests/chapel.spec.js` (door, pieces, calm, steps, plaques right and wrong, reloads) and
  the bot route `tests/bot-routes/chapel_part_a.json` (the bot now sidesteps with its eyes on her).

## Part B as built so far
- **The prompt key (0.2.98, owner 2026-11-18: "no need for every text to say click"):** use prompts
  show the key only on your first three uses; a prompt with an input of its own keeps its key.
- **The basement level (0.2.99):** `tools/levels/basement.py` writes `basement.json` as the wing map
  has it (the stairs foot, the coal store, the laundry, the passage to the Founder's door along the
  top; the cold corridor; the boiler room, the morgue and the theatre along the bottom), furnished from
  the approved stills' props, and edits the west wing: steps down behind the gate, Nora's last radio
  on the landing (her line, then "(the radio hisses, then nothing)"), a spawn for coming back up, and
  the gate standing open once St. Agnes is whole (a door's `opensWith`, once; after that it stays as
  you leave it), with "The gate stands open…" the first time you come into the west wing after it.
  The Founder's door is locked with its line and a quiet hum behind it (0.6); the theatre stays shut
  until part C. Spawn cells are cell indices (you stand at their centre): the chapel, crypt and
  grounds spawns from 0.2.97 now stand where they were meant to.
- **Holding your breath (0.2.100):** `player/breath.js`, the approved ring (`ui/breathHud.js`). Space,
  6 s on Normal (Story 8, Hard 5), refilling half as fast; then a gasp, a `noise` event of 9 m and its
  caption. Panting after a run (stamina under 60) carries 3 m unless held. Wing 4's systems are made
  and run in `src/wing4.js`, so `main.js` stays under 400 lines.
- **Throwing (0.2.101):** `player/throwing.js`; G (settings version 5 adds it to older settings).
  Bottles (14 m) and stones (10 m) lie in the coal store and the laundry; G throws the selected one,
  else the first carried; it arcs from your eyes and lands on the floor or drops where it strikes a
  wall, with its caption and a `noise` event. The bottle's label catches a dim glint, as the battery's
  cap does. The first one taken teaches the key (a tutorial lesson; other systems can now ask for a
  lesson with a `teach` event).
- **Slow doors (0.2.102):** `levels/doorDrag.js`. A level with `"loudDoors": true` (the basement):
  a click swings a plain door at once and bangs (`noise` 10 m, "(the door bangs)"); holding the use
  button and dragging eases it, at most 1.1 rad/s however hard you pull, silent, the view held still;
  let go and it settles the way it was going. The prompt: "HOLD + DRAG  Open slowly" (the owner's
  pick for prompts with an input of their own); the first one teaches it.
- **Lockers (0.2.103; stills locker and locker_inside approved 2026-11-18):** `player/hide.js` hides
  you in a `staffLocker` as under a ward bed: standing inside (eye 1.62 m), facing out of its door,
  0.3 rad to either side, light off; the locker's own model is put away while you are in it and
  `ui/lockerHud.js` draws its door's three slits. Three in the morgue, two in the laundry's staff room;
  a bulb burns over the morgue's drawers. The boiler, coal heaps and lockers now have footprints.
- **Dr. Venn (0.2.104):** `ai/surgeon.js` (his round and catch), `ai/hearing.js` (what he hears),
  `ai/surgeonVoice.js` (his sounds and subtitles), `ai/surgeonDebug.js`. Hearing: your steps (the
  controller's noise: crouch 1.5 m, walk 4, run 10), your breath (panting 3 m unless held; your steps
  are silent in a locker or under a bed), and `noise` events (door 10, bottle 14, stone 10, gasp 9); a
  wall between halves a sound, but a doorway's jambs do not stop what is made or heard in it; Story
  0.8, Hard 1.2. Round at 1.1 m/s through the corridor, coal store, laundry, the Founder's passage,
  boiler room and morgue (the stairs foot and the theatre are never on it); heard something: the
  clinking stops, he listens 2 s (comfort 3.5 s), comes at 2.5 m/s (comfort ×0.6), listens 3.5 s where
  it was, then goes back to his round ("(the clinking moves away)"). A catch only once he has come and
  hears you within 1 m, or if you walk into him (0.55 m; never while you hide). His first crossing,
  past the stairs foot, cannot catch (flag `venn_met`, then a checkpoint). The flash stuns him 5 s
  (the camcorder now stuns whichever hunter is before it). The catch: his figure framed and lit as the
  approved close-up (surgeon_face), your light knocked off, then the rewind with Sam's line, spoken
  "through the water", chosen by what he heard (a door, your breath; else your feet, throwing, the
  flash in turn). Low sanity: clinking behind you with no place in the room, never a threat. The
  first time near him teaches holding your breath. Stand-in sounds until wing 4's files come.
- **Sam and the boiler room (0.2.105):** `ghosts/sam.js`: met within 4 m with him in view (flag
  `sam_met`): two knocks, the journal; then every 14–20 s he knocks where Dr. Venn is (twice if he is
  within 10 m of you, once if not), sound and caption. `puzzles/valves.js`: the wheels (they spin on
  their stub now) in the stoker's order; wrong: "(water bubbles back up…)", all back; right: the flood
  sinks over 5 s, "(the flood drains away…)", the boiler is lit, "(the boiler roars…)", checkpoint, and
  the soldier's pickup appears (flag `puzzle_valves`). Given the soldier (flag `sam_soldier`), three taps
  at the pipes ("Tap the pipe for Sam ({n} left)"): he knocks at the pipe furthest from you, a noise of
  40 m that Dr. Venn goes to. The stoker's log on a table inside the door (its journal line).
- **The morgue (0.2.106):** `puzzles/morgue.js`: twelve drawers on the north wall, eight typed with
  the roll's and the charts' dates (3 JAN, 2 FEB, 18 MAR, 2 APR, 12 MAY, 9 JUN, 30 OCT, 14 NOV), in
  level data by index (row by row from the bottom). "Pull out the drawer": its door swings open on its
  left hinge and its tray slides out 0.5 m, "(the drawer screeches on its runners)", a noise of 8 m
  Dr. Venn hears; then its line: empty, a child's name tag (CARR, E.; ROWE, M.), Sam's wet tag, or
  Tommy's (2 FEB) with page four of his file on the steel (flag `morgue_tommy`; the page shows once the
  tray is out; its journal line). 12 MAY has no prompt: once you have pulled another (flag
  `morgue_pulled`) and are in the morgue, the set piece `morgue_drawer` (`ghosts/drawerPiece.js`,
  level data: tell "the morgue goes quiet" 3 s after a 4 s wait so your screech dies away, cooldown
  group `setPiece`, comfort `keep`: a story beat, drain 4): its door swings open and the long tray
  rolls out 2 m, "(a drawer rolls out on its own)"; on it Sister M. under a sheet, a tag on her toe
  ("Look"). The long tray is longer than the wall is thick, so it stays hidden while in, and out of the
  morgue you only hear it (it is out when you come back). Dr. Venn does not hear it roll. Dr. Venn's
  theatre notes lie on a side table in the morgue's south-east corner (their journal line). Stand-in
  sound `drawer_metal` (slow and low for the roll) until `morgue_drawer` comes. The basement's sounds
  now live in `audio/basementSounds.js`.
- **Bot route `basement_part_b` (0.2.106):** from the west wing's well down the steps; waits out his
  first crossing, follows his round (boiler room while he walks east; the morgue while he is in the coal
  store, crouched past his door; a morgue locker while he comes through), eases the loud doors open
  (new bot step `easeDoor`; `waitUntil` takes `vennIn`), turns the valves, gives Sam his soldier, reads
  the log, page four and his notes, sees the 12 MAY drawer roll out. Never heard, never caught (the
  route sets `maxCollapses: 0`; the bot test now checks it and `expectRead`). About 155 s of game time.
- Next: part C (Nora, the theatre, the choice, the way out, the endings).

## Part C: the owner's picks (2026-11-18) and its stills
The content sheet leaves four calls open; the owner picked:
- **The theatre's door is locked until page four** (Tommy's drawer, flag `morgue_tommy`). New line,
  for the sheet: "Locked from the inside. Through the glass, a lamp over a table." / "Κλειδωμένη
  από μέσα. Μέσα από το τζάμι, μια λάμπα πάνω από ένα τραπέζι." The door has a pane of wired glass.
- **Your room at high sanity without Nora plays Becomes the building** (its "without Nora" line).
  Acceptance needs high sanity and Nora freed; low sanity is Becomes the building either way.
- **High sanity is 65 or more**, read as you reach your room.
- **Nora is one pace louder than you:** you crouch, her steps carry as a walk (4 m); you walk, they
  carry as a run (10 m); you stand still, she does. Dr. Venn hears her where she is.

Proposal stills (waiting for a yes), in `docs/mockups/stills-0.5/`, from
`src/mockups/finaleStills.js` on the game's own levels: `theatre_door` (the corridor door, locked;
through its glass the lamp's light on the table and Nora), `nora_follow` (Nora on her feet behind you
in the cold corridor, whispering; her standing figure is `src/props/noraStanding.js`: her table body
stood up, her arms and legs swinging from hip and shoulder, her hair hanging to her shoulders, her
colours a little darker so your flashlight does not burn her out), `cabinet_lock` (the cabinet's lock
up close: a steel plate, five brass keys with Edith's pictures), `west_stairs` (up the stairs, looking
back: he is at their foot, knife up, clinking), the endings' key moments in letterbox with their lines
(`ending_road`: out of the gate, every dormitory window orange under a sky lit by the fire;
`ending_lamp`: on his table, looking up into the lamp; `ending_morning`: a window your room never had,
morning in it, Nora by it; `ending_walls`: your room's walls warm and veined; `ending_coal`: the
coal store's door shutting on the corridor's light, at a child's height), `end_card` (black, the
ending's name, "Endings found: 1 of 4", a tape's STOP in the corner), and `room_last` (your room's
last change: the bed made, your wooden horse on the pillow).

## Owner's notes on the part C stills (2026-11-19) and the second pass of Nora on her feet
- **The cabinet: hear the gap.** Opening its lock, Edith's music box plays her tune from your pocket
  and stops at the gap; each brass key plays its note in the gap; the one that fits (the note her
  box lost) opens it; a wrong one, "(the lock does not give)". No new text.
- **Nora on her feet: redo.** Second pass (`nora_follow`, `ending_morning`): no longer a mannequin
  standing to attention: her shoulders slope and are rounded, she stoops a little from the hips,
  afraid, her elbows in and her hands held in front of her, her head a little down; her jumper goes up
  round her neck (its flat top showed as a black bar); her colours darker in your flashlight, her
  jacket olive as under his lamp and her face, hair and hands no longer burnt white.
- **Second pass, owner (2026-11-19): her body or pose still off: all four** of: too boxy, not a woman;
  her arms and hands wrong; too stiff, statue-like; her proportions (short legs, long wide body).
  Third pass: she is no longer the table figure stood up. `src/props/noraStanding.js` builds her
  standing as a jointed body (hips, knees, ankles; shoulders, elbows, wrists; neck, head) with an
  ordinary woman's proportions: 1.66 m, long in the leg (hip joints at 0.88 m), a waist, soft
  sloping shoulders, fuller straight-leg jeans over ankle boots, the waxed jacket fitted and hanging
  open over the jumper, its corduroy collar. Her arms are placed by where her hands go (a two-bone
  reach), and her poses are in `src/props/noraPoses.js`: `follow` (mid-step towards you, hugging
  herself, stooped, glancing back past her shoulder), `window` (her weight on one leg, one arm across
  her, the other loose), `stand`. Her hair hangs from her head as she holds it. The joints will
  walk her in the game.

