# Sound list for 0.5 (the chapel and the basement)

The owner's copy, with search terms and the Source URL column to fill, is the Claude Doc
"Sound List for 0.5 (Chapel and Basement)": https://claude.ai/artifact/T81UhaxvC8c9CUrBiF8n7E
(2026-11-17). This file lists the IDs so the code and the manifest can be written against them.
34 new sounds; hand-over as before (`assets/sounds/incoming/`, CC0 only, `tools/process-sounds.mjs`).
Part A (the chapel and the crypt) needs none. Nobody speaks words in these files: Dr. Venn's,
Sam's and Nora's lines are subtitles over a breath, a mumble or the water. Until a file arrives the
game plays the nearest sound it already has (the stand-in), and every sound keeps its subtitle.

## Priority 1: needed to build part B
| ID | What | Stand-in |
| --- | --- | --- |
| venn_tools (×3) | surgical instruments clinking on a belt, one step's worth: his warning | chain_rattle |
| venn_step (×3) | a heavy, slow footstep on a wet stone floor | step_stone |
| venn_rush | quick, heavy footsteps coming closer, about 2 s | step_stone, faster |
| venn_breath | a man's slow, wet breathing, loops | stone_near_breath, lower |
| venn_mutter (×2) | a man muttering under his breath, no clear words | whisper, lower |
| venn_cry | a man's short cry of pain: the flash | wake_gasp, lower |
| catch_muffled | a muffled struggle, a hand over a mouth | mus_stinger_low |
| bottle_smash | a small glass bottle breaking on stone | drawer_metal |
| stone_clatter | a stone thrown, landing and clattering | stone_step |
| pipe_knock (×3) | a knock on an iron pipe, echoing: Sam | lock_wheel_click, lower |
| water_wade (×3) | one step wading through knee-deep water | hospital_drip |
| valve_wheel | a rusty valve wheel turning | lock_wheel_click |
| drain_gurgle | water draining down an old drain (also on the 0.4 list) | amb_pipes |
| water_bubble | water bubbling back up through a drain | amb_pipes |
| boiler_roar | an old boiler firing up and roaring | thunder_far |
| morgue_drawer | a heavy steel drawer on its runners, screeching | drawer_metal |
| gasp_air | gasping for air after holding a breath too long | wake_gasp |

## Priority 2: makes it much better
| ID | What |
| --- | --- |
| amb_basement | basement room tone: distant drips, pipes ticking, loops |
| amb_boiler_room | a boiler room's hum and hiss, loops |
| amb_morgue | a cold room's refrigeration hum, loops |
| mus_drone_basement | a low, cold drone, loops |
| locker_close | a metal locker door shut |
| throw_whoosh | something small thrown through the air |
| tin_soldier | a small tin toy picked up |
| scalpel | a short blade sound for the catch |
| nora_breath | a young woman's frightened breathing, loops |
| nora_whimper | a woman's muffled whimper |
| buckle_open | a leather strap's buckle eased open |

## Priority 3: nice to have
| ID | What |
| --- | --- |
| fire_bell | an old fire bell, far off: the Escape ending |
| hand_bell | a hand bell rung for lights out |
| wall_breath | something breathing inside the walls |
| heavy_door_shut | a heavy door swinging shut: the theatre |
| key_unlock | a key turning in an old lock until it clicks open |
| theatre_lamp | an old surgical lamp's electric hum, loops |

## Reused
church_bell, stone_step, stone_grind, step_stone, door_bang, door_open_slow, door_locked, gate_creak,
radio_static, hospital_drip, fluorescent_buzz, heartbeat, breath_hold, breath_run, whisper,
locker_open, drawer_metal, page_turn, paper_pickup, wake_gasp, mus_stinger.
