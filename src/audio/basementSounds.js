// Wing 4's basement (0.5, part B), its sounds hung on game events: your held
// breath and gasp, Dr. Venn, Sam's knocks, the boiler's valves, the doors
// that shout, things thrown, the morgue's drawers; the theatre (part C). Stand-ins until wing 4's
// files come (docs/SOUNDS_0.5.md names each one it stands in for).
// play(name, options) and the helpers are audio/gameAudio.js's.
export function basementSounds({ events, play, at, doorPosition }) {
  // Your breath (player/breath.js): drawn in and held; a gasp when you held it too long (gasp_air's stand-in).
  events.on('breath.held', () => play('breath_hold', { volume: 0.35 }));
  events.on('breath.gasp', () => play('wake_gasp', { volume: 0.6 }));
  // Dr. Venn (ai/surgeon.js), with stand-ins until wing 4's files come (docs/SOUNDS_0.5.md): his tools
  // clinking (venn_tools), his quick steps (venn_rush), his wet breath, his mutter, his cry at the flash.
  // The clinking that is not him has no place in the room: the fake's tell.
  events.on('surgeon.clink', ({ position, fast }) => play('chain_rattle', { position: at(position, 1.0), volume: fast ? 0.45 : 0.3, refDistance: 2, rate: 1.4 }));
  events.on('surgeon.rush', ({ position }) => play('step_stone', { position: at(position, 0.1), volume: 1, rate: 1.4 }));
  events.on('surgeon.breath', ({ position }) => play('stone_near_breath', { position: at(position, 1.7), volume: 0.6, rate: 0.75 }));
  events.on('surgeon.mutter', ({ position }) => play('whisper', { position: at(position, 1.7), volume: 0.6, rate: 0.7 }));
  events.on('surgeon.cry', ({ position }) => play('wake_gasp', { position: at(position, 1.7), volume: 1, rate: 0.7 }));
  events.on('surgeon.fakeClink', () => play('chain_rattle', { volume: 0.25, rate: 1.4 }));
  events.on('surgeon.catch', () => play('mus_stinger_low', { volume: 0.9 }));
  // Sam's knocks on the pipes (ghosts/sam.js; pipe_knock's stand-in): once far off, twice close.
  events.on('sam.knock', ({ position, times }) => {
    for (let i = 0; i < times; i++) play('lock_wheel_click', { position, volume: 1, rate: 0.55, refDistance: 6, delay: i * 0.4 });
  });
  // The boiler room's valves (puzzles/valves.js): a wheel turns; the water bubbles back; the flood
  // drains; the boiler roars (valve_wheel, water_bubble, drain_gurgle, boiler_roar's stand-ins).
  events.on('valves.turn', ({ position }) => play('lock_wheel_click', { position, volume: 0.8, rate: 0.8 }));
  events.on('valves.wrong', ({ position }) => play('amb_pipes', { position, volume: 0.9, rate: 1.3 }));
  events.on('valves.draining', ({ position }) => play('amb_pipes', { position, volume: 1, rate: 0.7 }));
  events.on('valves.roar', ({ position }) => play('thunder_far', { position, volume: 1, rate: 1.3, refDistance: 4 }));
  // A door that shouts (levels/doorDrag.js): banged, or eased so softly only you hear it.
  events.on('door.banged', (door) => play('door_bang', { position: doorPosition(door), volume: 0.9, refDistance: 4 }));
  events.on('door.eased', (door) => play('door_open_slow', { position: doorPosition(door), volume: 0.2, refDistance: 1.5 }));
  // Something thrown lands (player/throwing.js): bottle_smash and stone_clatter's stand-ins, where it fell.
  const LANDING = { bottle: ['drawer_metal', 0.9], stone: ['stone_step', 0.8] };
  events.on('throw.landed', ({ item, position }) => {
    const [name, volume] = LANDING[item] ?? LANDING.stone;
    play(name, { position, volume, refDistance: 3 });
  });
  // The morgue's drawers (puzzles/morgue.js): one pulled screeches on its runners; the 12 MAY
  // drawer rolls out on its own, slow and low (morgue_drawer's stand-in, both).
  events.on('morgue.pulled', ({ position }) => play('drawer_metal', { position, volume: 1, rate: 0.7, refDistance: 3 }));
  events.on('morgue.rolls', ({ position }) => play('drawer_metal', { position, volume: 1, rate: 0.45, refDistance: 4 }));
  // The theatre (ai/noraTable.js, puzzles/cabinet.js): a buckle eased open (buckle_open's stand-in);
  // the cabinet's lock that does not give, and clicks open (key_unlock's); the back door
  // shutting by itself behind you (heavy_door_shut's).
  events.on('nora.buckle', ({ position }) => play('key_pickup', { position, volume: 0.45, rate: 0.75, refDistance: 1.5 }));
  events.on('cabinet.wrong', ({ position }) => play('door_locked', { position, volume: 0.5, rate: 1.4, refDistance: 2 }));
  events.on('cabinet.open', ({ position }) => play('lock_wheel_click', { position, volume: 0.9, refDistance: 2 }));
  events.on('nora.doorShut', (door) => play('door_bang', { position: doorPosition(door), volume: 0.85, rate: 0.8, refDistance: 4 }));
}
