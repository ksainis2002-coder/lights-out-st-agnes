# Sound list for 0.3 (school wing)

0.3 covers the courtyard and cemetery, and the school: two floors of classrooms, the library, the
gym, the music room, the nurse's room, the art room, the staff room, the cloakroom and the
headmaster's office and flat. It brings the watcher statue, Maggie and her skipping-rope rhymes,
three set pieces (the bell, the roll call, the projector film) and the five children's graves. The
weather turns from rain to storm with lightning. Claude can't download from Freesound or
OpenGameArt, so this list is for the owner. The 0.2 sounds (doors, footsteps, whispers, giggles,
rain, the clock…) are reused, so only new sounds are listed.

Updated 2026-10-14 after the owner's Q&A: the watcher's breath is now priority 1 (it is her
warning), the projector is priority 1 (the film set piece), the piano needs no files (its notes
are made by the game), and the new rooms and puzzles add the rows marked **new**.

Priority 1 is in the game (2026-10-24), and priority 2 (2026-10-27: where each one plays is at the
end): the owner's files, cut by `tools/process-sounds.mjs` (`assets/sounds/manifest.json`). The
owner's sound list (2026-10-27) gave every source link (the Source URL column below), and the owner
checked that every linked page is CC0, priority 3's included (2026-10-28; `assets/CREDITS.md`).

## How to hand them over (same as 0.2)
1. On Freesound, set the licence filter to **Creative Commons 0** (OpenGameArt: **CC0**). Skip
   anything CC-BY, CC-BY-NC or "Sampling+", even if it sounds perfect.
2. Download any format (wav, mp3, flac, ogg). Claude converts to Ogg and trims.
3. Rename each file to the **ID** below and put it in `assets/sounds/incoming/`.
4. Paste the page URL into the **Source URL** column of this file (Claude fills in the
   author and licence in `assets/CREDITS.md` from it).

One good file per row is enough. Rows marked **(×3)** sound better with 3 different takes
(`_1`, `_2`, `_3`), because repeated sounds get varied. **Priority** says what to get first:
**1** = needed to build the wing, **2** = makes it much better, **3** = nice to have.
Owner pick: priority 1 first; Claude builds with it, then priority 2 and 3.

## The watcher (the chapel statue that moves when you don't look)
| ID | Priority | What | Search terms | Source URL |
| --- | --- | --- | --- | --- |
| stone_grind (×3) | 1 | Heavy stone sliding / grinding, 0.5–1.5 s (her plinth dragging over the floor) | stone grind, stone scrape heavy, concrete slab drag | [stone_grind_1](https://freesound.org/people/dslrguide/sounds/321488/), [stone_grind_2](https://freesound.org/people/PostProdDog/sounds/578491/), [stone_grind_3](https://freesound.org/people/Rooms_Boxes/sounds/424169/) |
| stone_near_breath | 1 | Low dusty exhale, not human: her warning when she is at arm's reach | low breath, dust exhale, creature breath low | [stone_near_breath](https://freesound.org/people/SamsCollegeAccount/sounds/722982/) |
| stone_step | 2 | One heavy stone thud (her plinth settling when she stops) | stone thud heavy, heavy impact stone | [stone_step](https://freesound.org/people/Profispiesser/sounds/583064/) |
| stone_crack | 2 | Stone cracking / crumbling | stone crack, rock crumble | [stone_crack](https://freesound.org/people/ALLANZ10D/sounds/155934/) |

## Maggie and the skipping rope
| ID | Priority | What | Search terms | Source URL |
| --- | --- | --- | --- | --- |
| rope_slap (×3) | 1 | Skipping rope slapping the floor, single hit | jump rope, skipping rope, rope slap floor | [rope_slap_1](https://freesound.org/people/16GStepankovaS/sounds/499391/), [rope_slap_2](https://freesound.org/people/Luisa_Sanchez/sounds/813421/), [rope_slap_3](https://freesound.org/people/vhschool2019/sounds/461119/) |
| girl_hum | 1 | A girl humming a simple tune, no words, 5–15 s | girl humming, child humming melody | [girl_hum](https://freesound.org/people/nayruslove/sounds/69979/) |
| rope_loop | 2 | Skipping rope turning, steady rhythm loop | jump rope loop, skipping rope rhythm | [rope_loop](https://freesound.org/people/16GStepankovaS/sounds/499391/) |
| child_clap (×3) | 2 | Hand-clapping game, a few claps | hand clapping child, clapping game | [child_clap_1](https://freesound.org/people/brettrader/sounds/683023/), [child_clap_2](https://freesound.org/people/boldcity/sounds/394768/), [child_clap_3](https://freesound.org/people/stevielematt/sounds/707810/) |
| chalk_tap | 3 | Chalk tapping on a board (rhythm) | chalk tap blackboard | [chalk_tap](https://freesound.org/people/16G_Panska_Neuer_Jiri/sounds/498130/) |

Maggie's rhymes are shown as subtitles over her humming (the brief: voices are whispers and
gibberish only), so no sung words are needed. Her giggle reuses the 0.2 giggle.

## Classrooms, library, gym and upstairs
| ID | Priority | What | Search terms | Source URL |
| --- | --- | --- | --- | --- |
| school_bell | 1 | Old electric school bell ringing, 2–4 s (also the bell set piece) | school bell ring, old bell electric | [school_bell](https://freesound.org/people/deleted_user_7020630/sounds/378394/) |
| door_bang (×3) | 1 | **new** A door flung open hard against a wall (the bell set piece: doors banging open one after another) | door bang open, door slam wall | [door_bang_1](https://freesound.org/people/e.noodle/sounds/712745/), [door_bang_2](https://freesound.org/people/krnash/sounds/389811/), [door_bang_3](https://freesound.org/people/Soundscape_Leuphana/sounds/209517/) |
| projector | 1 | Old film projector running, clattering (loop; the film in Classroom 4) | film projector loop, 16mm projector | [projector](https://freesound.org/people/StefanoPTesta/sounds/447884/) |
| chalk_write (×3) | 1 | Chalk writing on a blackboard | chalk blackboard writing | [chalk_write_1](https://freesound.org/people/lezaarth/sounds/232418/), [chalk_write_2](https://freesound.org/people/Soundscape_Leuphana/sounds/210319/), [chalk_write_3](https://freesound.org/people/DigPro120/sounds/432642/) |
| desk_lid (×3) | 1 | Wooden school desk lid slamming | desk lid slam, wooden lid close | [desk_lid_1](https://freesound.org/people/birdOfTheNorth/sounds/832636/), [desk_lid_2](https://freesound.org/people/EggshellProdutions/sounds/718357/), [desk_lid_3](https://freesound.org/people/Supercow8399/sounds/379924/) |
| chair_scrape (×3) | 1 | Chair scraped across a floor | chair scrape floor, chair drag | [chair_scrape_1](https://freesound.org/people/bangcorrupt/sounds/832998/), [chair_scrape_2](https://freesound.org/people/deleted_user_2104797/sounds/325278/), [chair_scrape_3](https://freesound.org/people/harrietniamh/sounds/219677/) |
| book_drop (×3) | 1 | Heavy book falling on a floor | book drop, book fall floor | [book_drop_1](https://freesound.org/people/buzbe20/sounds/389757/), [book_drop_2](https://freesound.org/people/SpaceJoe/sounds/484906/), [book_drop_3](https://freesound.org/people/Valerie-Vivegnis/sounds/836521/) |
| lock_wheel_click (×3) | 1 | **new** A small number wheel clicking round (the records lock) | combination lock click, dial click, lock wheel | [lock_wheel_click_1](https://freesound.org/people/FOSSarts/sounds/740226/), [lock_wheel_click_2](https://freesound.org/people/Zott820/sounds/174770/), [lock_wheel_click_3](https://freesound.org/people/el_boss/sounds/643563/) |
| drawer_metal | 1 | **new** Steel filing-cabinet drawer sliding open | filing cabinet drawer open, metal drawer slide | [drawer_metal](https://freesound.org/people/The_Isot_is_Back/sounds/643502/) |
| chalk_screech | 2 | Chalk or nails screeching on a board | chalk screech, blackboard scratch | [chalk_screech](https://freesound.org/people/ZusIsKing/sounds/766860/) |
| ruler_slap | 2 | Wooden ruler slapped on a desk | ruler slap desk, wood slap | [ruler_slap](https://freesound.org/people/sonicmariobrotha/sounds/337805/) |
| page_turn (×3) | 2 | Old book pages turning | page turn book, pages flip | [page_turn_1](https://freesound.org/people/esperri/sounds/119127/), [page_turn_2](https://freesound.org/people/jephwallace/sounds/318615/), [page_turn_3](https://freesound.org/people/EminYILDIRIM/sounds/535358/) |
| book_slide | 2 | **new** A book pulled out of a tight shelf | book slide shelf, book pull | [book_slide](https://freesound.org/people/MasterSuite/sounds/667384/) |
| key_drop_wood | 2 | **new** A small key dropping inside a wooden box (the key falls out of the piano) | key drop, key fall wood | [key_drop_wood](https://freesound.org/people/davidkyoku/sounds/152898/) |
| cloth_rustle (×3) | 2 | **new** Coat or clothes rustling (searching the coat pockets; the roll call turning) | cloth rustle, coat rustle, pocket search | [cloth_rustle_1](https://freesound.org/people/zazz.sound.design/sounds/435291/), [cloth_rustle_2](https://freesound.org/people/zazz.sound.design/sounds/435292/), [cloth_rustle_3](https://freesound.org/people/zazz.sound.design/sounds/435289/) |
| floorboard_creak (×3) | 2 | **new** Old floorboard creaking under a step (upstairs) | floorboard creak, wood floor creak | [floorboard_creak_1](https://freesound.org/people/SoundDesignForYou/sounds/646696/), [floorboard_creak_2](https://freesound.org/people/Nox_Sound/sounds/822745/), [floorboard_creak_3](https://freesound.org/people/Rudmer_Rotteveel/sounds/502505/) |
| step_stairs (×3) | 2 | **new** Footstep on wooden stairs | footsteps wooden stairs | [step_stairs_1](https://freesound.org/people/Garuda1982/sounds/633131/), [step_stairs_2](https://freesound.org/people/Sclolex/sounds/210573/), [step_stairs_3](https://freesound.org/people/qubodup/sounds/442771/) |
| ball_bounce_gym (×3) | 2 | Ball bouncing in a big empty hall, echo | ball bounce gym, basketball bounce echo | [ball_bounce_gym_1](https://freesound.org/people/DigPro120/sounds/859910/), [ball_bounce_gym_2](https://freesound.org/people/JaenKleynhans/sounds/267882/), [ball_bounce_gym_3](https://freesound.org/people/impulse94/sounds/264127/) |
| whistle_gym | 3 | PE teacher's whistle, distant | whistle referee, sports whistle | [whistle_gym](https://freesound.org/people/SpliceSound/sounds/218318/) |
| ~~piano_detuned~~ | – | Not needed: the piano's notes are made by the game (owner pick) | | |

## Courtyard and cemetery (outdoors)
| ID | Priority | What | Search terms | Source URL |
| --- | --- | --- | --- | --- |
| step_gravel (×3) | 1 | Footstep on gravel | footstep gravel | [step_gravel_1](https://freesound.org/people/SamuelGremaud/sounds/437028/), [step_gravel_2](https://freesound.org/people/Fission9/sounds/521588/), [step_gravel_3](https://freesound.org/people/xkeril/sounds/639085/) |
| step_grass (×3) | 1 | Footstep on wet grass or mud | footstep grass wet, footstep mud | [step_grass_1](https://freesound.org/people/Iman.Media/sounds/843134/), [step_grass_2](https://freesound.org/people/Vrymaa/sounds/770097/), [step_grass_3](https://freesound.org/people/Alex_hears_things/sounds/376809/) |
| step_stone (×3) | 1 | Footstep on stone paving | footstep stone, footstep pavement | [step_stone_1](https://freesound.org/people/SecureSubset/sounds/784301/), [step_stone_2](https://freesound.org/people/SiriusS19YT/sounds/868548/), [step_stone_3](https://freesound.org/people/Fission9/sounds/521590/) |
| gate_creak | 1 | Old iron gate creaking open | iron gate creak, metal gate squeak | [gate_creak](https://freesound.org/people/hannahbelle144/sounds/625616/) |
| amb_rain_outside | 1 | Steady rain outdoors, 30 s+ loop | rain outdoor loop, rain heavy ambience | [amb_rain_outside](https://freesound.org/people/PhilllChabbb/sounds/238431/) |
| amb_wind_outside | 1 | Wind through trees at night, 30 s+ loop | wind trees night, wind howling outside | [amb_wind_outside](https://freesound.org/people/Lewisounds/sounds/686064/) |
| thunder_close (×3) | 1 | Close thunder crack (storm) | thunder crack close, thunderclap | [thunder_close_1](https://freesound.org/people/hifijohn/sounds/242586/), [thunder_close_2](https://freesound.org/people/Thomas%20Bruderer/sounds/240664/), [thunder_close_3](https://freesound.org/people/TRP/sounds/717909/) |
| match_strike (×3) | 1 | **new** A match struck and catching (lighting the grave lanterns) | match strike, match ignite | [match_strike_1](https://freesound.org/people/juggle4ben/sounds/385185/), [match_strike_2](https://freesound.org/people/scalywhale/sounds/423811/), [match_strike_3](https://freesound.org/people/lurpsis/sounds/444130/) |
| candle_snuff | 2 | **new** Small flames going out at once (lanterns lit in the wrong order) | candle blow out, flame snuff | [candle_snuff](https://freesound.org/people/DeqstersLab/sounds/826338/) |
| chain_rattle | 2 | **new** Heavy chain rattling on a locked gate or door | chain rattle, chain gate | [chain_rattle](https://freesound.org/people/kyles/sounds/637356/) |
| crow (×3) | 2 | Crow cawing, a few calls | crow caw, raven call | [crow_1](https://freesound.org/people/Mish7913/sounds/741366/), [crow_2](https://freesound.org/people/qubodup/sounds/813115/), [crow_3](https://freesound.org/people/Jofae/sounds/361470/) |
| church_bell | 2 | A single distant church bell toll | church bell toll, bell single distant | [church_bell](https://freesound.org/people/Astounded/sounds/481969/) |
| amb_night_insects | 3 | Quiet night crickets, 30 s+ loop (for the calm before storms) | crickets night ambience | [amb_night_insects](https://freesound.org/people/KikeVilaplana/sounds/436528/) |
| shovel_dig (×3) | 3 | Shovel digging into earth (only if a digging moment is added) | shovel dig dirt, digging soil | [shovel_dig_1](https://freesound.org/people/f3bbbo/sounds/651294/), [shovel_dig_2](https://freesound.org/people/dr19/sounds/353907/), [shovel_dig_3](https://freesound.org/people/szegvari/sounds/515087/) |

## Music and ambience beds (long, loopable, 30 s or more)
| ID | Priority | What | Search terms | Source URL |
| --- | --- | --- | --- | --- |
| mus_drone_school | 1 | Dark, low drone (the brief: drones from wing 2 on); the game swells it when the watcher is near | dark drone ambient, horror drone low | [mus_drone_school](https://freesound.org/people/bassimat/sounds/845391/) |
| amb_classroom | 1 | Empty classroom room tone, a faint clock or radiator | empty classroom ambience, room tone school | [amb_classroom](https://freesound.org/people/tvilgiat/sounds/472678/) |
| amb_gym_hall | 2 | Big empty hall room tone, echoey | empty gym ambience, large hall room tone | [amb_gym_hall](https://freesound.org/people/Kinoton/sounds/353159/) |
| amb_library | 2 | Quiet library, creaking shelves | library ambience quiet, old library | [amb_library](https://freesound.org/people/Hano_van_Dalen/sounds/767305/) |
| mus_stinger_low (×2) | 2 | Short low horror hit, 1–3 s | horror stinger low, dark impact hit | [mus_stinger_low_1](https://freesound.org/people/Simonus18/sounds/809058/), [mus_stinger_low_2](https://freesound.org/people/MathewHenry/sounds/636880/) |
| mus_music_box_broken | 3 | Music box winding down, slowing | music box slowing down, wind down | [mus_music_box_broken](https://freesound.org/people/VSokorelos/sounds/346181/) |

## Stand-ins
Until a file arrived, the game played a 0.2 sound in its place. The files have replaced every
stand-in but one: where a stand-in works better, it stays (owner 2026-10-27), and the grab keeps the
big sting, which hits harder than the short low one.
| Happens | Plays | Note |
| --- | --- | --- |
| Searching the coat pockets | cloth_rustle | was cloth_crouch |
| A card-index drawer | drawer | fine as it is |
| Taking a book off the shelf | book_slide | was paper_pickup |
| The key falling out of the piano | key_drop_wood | was key_pickup |
| A hop on the hopscotch | step_wood | fine as it is |
| The grab | mus_stinger, stone_grind pitched down | kept: mus_stinger_low is weaker here |
| The library light dying | fluorescent_buzz | fine as it is |
| The records drawer: a wrong try | door_locked | fine as it is |
| The roll call's heads turning | mus_stinger_low, cloth_rustle | was a quiet mus_stinger |

## Where priority 2 plays (0.2.51)
Each about as loud as the sound it replaced, or as its neighbours (measured loudness).
- **stone_step:** her plinth settles with a thud when she stops after a slide (not after a twitch).
- **stone_crack:** the seal of Agnes's slab cracks as the lanterns open it, under the grind.
- **mus_stinger_low**, **cloth_rustle:** the roll call's heads turning; the rustle also when you
  search the coat pockets.
- **ruler_slap:** the roll call's tell: a ruler slapped on the teacher's table as the lamps die.
- **book_slide:** a book pulled off the library shelf. **key_drop_wood:** the piano drops its key.
- **rope_loop:** Maggie's rope while she skips in sight; walk up and she vanishes, the rope stops,
  her humming goes on. **child_clap:** she claps when the hopscotch is done.
- **chalk_screech:** a taunt (always a lie) starts with a screech of the chalk, so taunts can be
  told from hints by ear. Comfort mode keeps every board quiet.
- **page_turn:** reading a document you find.
- **amb_gym_hall**, **amb_library:** the gym's and the library's own room tone, in place of the
  building's hum. **ball_bounce_gym:** now and then (every 30–75 s) a ball bounces at the far end
  of the gym, heard only while you are in there.
- **floorboard_creak:** upstairs, an old board creaks now and then under a step on wood or
  parquet (one step in eight, at most every 3 s).
- **step_stairs:** taking the stairs, three steps on the treads in place of a door.
- **candle_snuff:** the lanterns going out after one is lit out of turn.
- **chain_rattle:** the locked iron gates and the west wing's chained door.
- **crow:** crows in the dead trees outside, every 25–80 s, until the storm starts.
- **church_bell:** one toll from the chapel when the watcher takes her place at its door.
- Not used: child_clap_1 (single slow claps); the claps come from the other two takes.

## Counts
- **Priority 1:** 23 sounds (49 files with the extra takes). Enough to build the wing.
- **Priority 2:** 20 sounds (35 files).
- **Priority 3:** 5 sounds (7 files).
