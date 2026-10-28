// Connects game events to sounds: footsteps by floor, doors, the flashlight,
// room ambience beds (crossfaded between rooms), and distant thunder.
// game.sfx.play(name, { position, volume, bus }) for one-shot sounds.
import { playSound } from './sounds.js';
import { createLibrary } from './library.js';
import { roomAt } from '../levels/loader.js';

const STRIDE = { crouch: 0.55, walk: 0.75, run: 0.95 }; // metres between steps
const STEP_VOLUME = { crouch: 0.3, walk: 0.65, run: 1 };
const FLOOR_SOUND = { wood: 'step_wood', parquet: 'step_wood', floor: 'step_tile', tile: 'step_tile', hallTile: 'step_tile', gravel: 'step_gravel', grass: 'step_grass' };
// Iron gates creak (louder than the doors, so played quieter); other doors use door_use.
const DOOR_SOUND = { gate: { name: 'gate_creak', volume: 0.6 } };
// Locked: iron gates and chained doors ("chained": true) rattle their chain,
// other doors their lock.
const CHAIN = { name: 'chain_rattle', volume: 0.6 };
const LOCK = { name: 'door_locked', volume: 1 };
// Old boards creak now and then under a step: level data "creaks" is the
// chance per step on a wooden floor (upstairs in the school).
const CREAKY = new Set(['wood', 'parquet']);
const CREAK_GAP = 3; // seconds at least between two creaks
const AMBIENCE_FADE = 1.5; // seconds
// Before a game starts (warning, main menu, setup): a hummed lullaby over tape hiss.
const MENU_AMBIENCE = [{ name: 'mus_lullaby_hum', volume: 0.55 }, { name: 'tape_hiss', volume: 0.12 }];

export function createGameAudio(game) {
  const { mixer, events } = game;
  const library = createLibrary(mixer);
  let ready = false;
  const beds = new Map(); // ambience name → { source, gain }
  let lastRoom = undefined;
  let stepDistance = 0;
  let lastPosition = null;
  let thunderIn = 30;
  let creakWait = 0;
  const played = {}; // name → count, for the debug overlay and tests

  function play(name, { position = null, volume = 1, bus = 'effects', loop = false, pitchJitter, refDistance, rate, delay } = {}) {
    if (!ready) return null;
    played[name] = (played[name] ?? 0) + 1;
    const buffer = library.pick(name);
    return buffer ? playSound(mixer, buffer, { position, volume, bus, loop, pitchJitter, refDistance, rate, delay }) : null;
  }

  async function start() {
    mixer.start();
    await library.preload();
    ready = true;
    lastRoom = undefined; // start the current room's ambience
    startEmitters();
  }

  function doorPosition(door) {
    const c = game.world.level.cellCenter(...door.cell);
    return { x: c.x, y: 1.2, z: c.z };
  }

  function playDoor(door, volume) {
    const sound = DOOR_SOUND[door.look] ?? { name: 'door_use', volume: 1 };
    play(sound.name, { position: doorPosition(door), volume: sound.volume * volume });
  }

  events.on('door.opened', (door) => playDoor(door, 1));
  events.on('door.closed', (door) => playDoor(door, 0.8));
  events.on('door.locked', (door) => {
    const sound = door.look === 'gate' ? CHAIN : LOCK;
    play(sound.name, { position: doorPosition(door), volume: sound.volume });
  });
  events.on('prop.refused', (prop) => {
    const size = game.world.level.cellSize;
    const sound = prop.chained ? CHAIN : LOCK;
    play(sound.name, { position: { x: prop.at[0] * size, y: 1.2, z: prop.at[1] * size }, volume: sound.volume });
  });
  events.on('flashlight.toggled', () => play('flashlight_click', { volume: 0.7, pitchJitter: 0.02 }));
  events.on('ui.move', () => play('ui_beep', { volume: 0.5, bus: 'effects', pitchJitter: 0 }));
  events.on('game.play', () => play('vhs_insert', { volume: 0.8, pitchJitter: 0 }));
  events.on('collapse.rewinding', () => play('vhs_rewind', { volume: 0.9, pitchJitter: 0 }));
  events.on('collapse.started', () => play('wake_gasp', { volume: 0.7 }));
  events.on('collapse.scare', () => play('mus_stinger', { volume: 1, bus: 'music', pitchJitter: 0 }));
  events.on('game.saved', () => play('vhs_eject', { volume: 0.7, pitchJitter: 0 }));
  // Leaving by the stairs: a few steps on the wooden treads while the view fades.
  events.on('level.leaving', ({ via } = {}) => {
    if (via !== 'stairs') return play('door_use', { volume: 0.9 });
    [0.45, 0.4, 0.35].forEach((volume, i) => play('step_stairs', { volume, delay: i * 0.38 }));
  });
  events.on('document.read', () => play('page_turn', { volume: 0.6 }));
  events.on('plate.taken', () => play('key_pickup', { volume: 0.6 }));
  events.on('plate.placed', () => play('key_pickup', { volume: 0.6 }));
  events.on('toy.moved', () => play('wooden_toy', { volume: 0.5 }));
  // The plates drop the crank (a rolling clatter); the toys draw back a bolt;
  // the lullaby lets a hidden door creak loose; the piano drops its key; Maggie
  // claps when the hopscotch is done.
  const SOLVED_SOUND = {
    plates: 'wooden_toy', toys: 'door_locked', lullaby: 'door_open_slow', fuses: 'fluorescent_buzz', piano: 'key_drop_wood',
    library: 'paper_pickup', records: 'drawer_metal', lanterns: 'stone_grind', hopscotch: 'child_clap',
  };
  events.on('puzzle.solved', (name) => play(SOLVED_SOUND[name] ?? 'wooden_toy', { volume: 0.9 }));
  events.on('fuses.lever', () => play('drawer', { volume: 0.5 }));
  events.on('fuses.reset', () => play('door_locked', { volume: 0.7 }));
  events.on('power.cut', () => play('thunder_far', { volume: 1 }));
  // The storm's thunder after each strike, quieter indoors.
  events.on('storm.thunder', ({ outdoors }) => play('thunder_close', { volume: outdoors ? 1 : 0.55, pitchJitter: 0.08 }));
  events.on('reveal', () => play('paper_pickup', { volume: 0.8 }));
  events.on('musicBox.wound', () => play('drawer', { volume: 0.6 }));
  // School wing: Maggie's desk lid, the staff-room drawer, the coat pockets,
  // a book pulled off the shelf.
  const propPosition = (prop, y) => {
    const size = game.world.level.cellSize;
    const [col, row] = prop.useAt ?? prop.at;
    return { x: col * size, y, z: row * size };
  };
  events.on('prop.opened', (prop) => {
    const lid = prop.use === 'lid';
    play(lid ? 'desk_lid' : 'drawer_metal', { position: propPosition(prop, 0.8), volume: lid ? 0.3 : 0.35 });
  });
  events.on('prop.searched', (prop) => play('cloth_rustle', { position: propPosition(prop, 1.1), volume: 1.3 }));
  events.on('library.drawer', () => play('drawer', { volume: 0.5 }));
  events.on('library.book', () => play('book_slide', { volume: 0.35 }));
  events.on('hopscotch.hop', () => play('step_wood', { volume: 0.6 }));
  // A wrong square: the rope slaps the floor, then she giggles.
  events.on('hopscotch.wrong', () => {
    play('rope_slap', { volume: 0.5 });
    play('giggle_close', { volume: 0.4, delay: 0.3 });
  });
  // The records lock: each wheel clicks round; a wrong try rattles the drawer.
  events.on('records.wheel', () => play('lock_wheel_click', { volume: 0.5 }));
  events.on('records.wrong', () => play('door_locked', { volume: 0.6 }));
  // The grave lanterns: a match for each; lit out of turn they all snuff out;
  // in turn, the seal of Agnes's slab cracks as it grinds open.
  events.on('lantern.lit', ({ position }) => play('match_strike', { position, volume: 0.8, refDistance: 2 }));
  events.on('lanterns.out', () => play('candle_snuff', { volume: 0.5 }));
  events.on('lanterns.solved', ({ position }) => play('stone_crack', { position, volume: 0.8, refDistance: 3 }));
  // Upstairs set pieces: the bell rings and its ring dies away, doors bang
  // open; the roll call's heads turn with a rustle on a low hit; the
  // projector clatters, then runs down as the film snaps.
  const running = {}; // sounds a later event stops: the bell, the projector
  const begin = (key, name, options) => {
    running[key]?.stop();
    running[key] = play(name, { pitchJitter: 0, ...options });
  };
  const end = (key) => {
    running[key]?.stop();
    running[key] = null;
  };
  let projectorAt = null;
  events.on('setPiece.ring', ({ position }) => begin('bell', 'school_bell', { position, volume: 1, refDistance: 4 }));
  events.on('setPiece.ringStop', () => end('bell'));
  events.on('setPiece.doorBang', (door) => play('door_bang', { position: doorPosition(door), volume: 0.8 }));
  events.on('setPiece.turn', ({ position }) => {
    play('mus_stinger_low', { volume: 0.35, bus: 'music', pitchJitter: 0 });
    play('cloth_rustle', { position, volume: 1, refDistance: 3 });
  });
  events.on('setPiece.projector', ({ position }) => {
    projectorAt = position;
    begin('projector', 'projector', { position, loop: true, volume: 1, refDistance: 3 });
  });
  events.on('setPiece.filmSnap', () => {
    end('projector');
    play('projector_stop', { position: projectorAt, volume: 0.9, refDistance: 3 });
  });
  // The watcher: her stone grinds each time she moves and thuds as her plinth
  // settles, a dusty breath at arm's reach (her warning), a heavier grind as
  // she grabs (on the big sting, which hits harder than the low one). Once at
  // the chapel door, the chapel bell tolls once.
  const at = (point, y) => ({ x: point.x, y, z: point.z });
  events.on('watcher.moved', ({ position }) => play('stone_grind', { position: at(position, 0.4), volume: 0.6, refDistance: 2 }));
  events.on('watcher.settled', ({ position }) => play('stone_step', { position: at(position, 0.3), volume: 0.7, refDistance: 2 }));
  events.on('watcher.chapel', ({ position }) => play('church_bell', { position: at(position, 9), volume: 1, refDistance: 10, pitchJitter: 0 }));
  events.on('watcher.breath', ({ position }) => play('stone_near_breath', { position: at(position, 1.9), volume: 0.9 }));
  events.on('watcher.grab', ({ position }) => play('stone_grind', { position: at(position, 0.4), rate: 0.8, volume: 0.8 }));
  events.on('collapse.grab', () => play('mus_stinger', { volume: 1, bus: 'music', pitchJitter: 0 }));
  events.on('watcher.introStarted', () => play('fluorescent_buzz', { volume: 0.5, rate: 0.8 }));
  // Maggie's chalk on a board and Classroom 1's desks dragged round. A taunt
  // (always a lie) starts with a screech of the chalk and a hint ends with the
  // chalk tapped on the board, so the two can be told apart by ear; comfort
  // mode keeps the screech out.
  events.on('chalk.scratch', ({ position }) => play('chalk_write', { position, volume: 1, refDistance: 3 }));
  events.on('chalk.tap', ({ position }) => play('chalk_tap', { position, volume: 1, refDistance: 3 }));
  events.on('chalk.written', ({ taunt, position }) => {
    if (taunt && !game.settings.get('comfortMode')) play('chalk_screech', { position, volume: 0.2, refDistance: 3 });
  });
  events.on('trick.scrape', ({ position }) => play('chair_scrape', { position, volume: 0.5, refDistance: 3 }));
  // Positional loops placed in the level (the office clock): "emitters".
  let emitterSources = [];
  // Emitters loop, or with "every": [min, max] play once at random gaps
  // (a drip, not a machine-gun loop). A timed one may keep to a "room" (heard
  // only while you are in it: the gym's ball) or fall silent for good once a
  // flag is set ("until": the crows, once the storm starts).
  let timedEmitters = [];
  const gap = ([min, max]) => min + Math.random() * (max - min);
  const silent = ({ room, until }) => (until && game.progress.hasFlag(until))
    || (room && roomAt(game.world.level, game.player.state.position) !== room);

  function updateTimedEmitters(dt) {
    const { level } = game.world;
    for (const emitter of timedEmitters) {
      emitter.wait -= dt;
      if (emitter.wait > 0) continue;
      emitter.wait = gap(emitter.every);
      if (silent(emitter)) continue;
      const { sound, at, height = 1.5, volume = 1, distance = 1 } = emitter;
      play(sound, { position: { x: at[0] * level.cellSize, y: height, z: at[1] * level.cellSize }, volume, refDistance: distance, pitchJitter: 0.06 });
    }
  }

  function startEmitters() {
    emitterSources.forEach((source) => source.stop());
    const { level } = game.world;
    timedEmitters = level.emitters.filter((e) => e.every).map((e) => ({ ...e, wait: gap(e.every) }));
    emitterSources = level.emitters
      .filter((e) => !e.every)
      .map(({ sound, at, height = 1.5, volume = 1, distance = 1 }) => play(sound, {
        position: { x: at[0] * level.cellSize, y: height, z: at[1] * level.cellSize },
        volume,
        loop: true,
        pitchJitter: 0,
        refDistance: distance,
      }))
      .filter(Boolean);
  }

  events.on('level.loaded', () => {
    lastRoom = undefined;
    lastPosition = null;
    startEmitters();
  });

  function floorUnderPlayer() {
    const { level } = game.world;
    const p = game.player.state.position;
    const cell = level.worldToCell(p.x, p.z);
    return level.textures.floor(cell.col, cell.row);
  }

  function updateFootsteps() {
    const state = game.player.state;
    const p = state.position;
    if (lastPosition) stepDistance += Math.hypot(p.x - lastPosition.x, p.z - lastPosition.z);
    lastPosition = { x: p.x, z: p.z };
    const pace = state.crouch > 0.5 ? 'crouch' : state.running ? 'run' : 'walk';
    if (stepDistance < STRIDE[pace]) return;
    stepDistance = 0;
    const floor = floorUnderPlayer();
    play(FLOOR_SOUND[floor] ?? 'step_tile', { volume: STEP_VOLUME[pace] });
    if (creakWait > 0 || !CREAKY.has(floor) || Math.random() >= game.world.level.creaks) return;
    creakWait = CREAK_GAP;
    play('floorboard_creak', { volume: STEP_VOLUME[pace] * 0.45, delay: 0.05 });
  }

  // A bed with "until" is gone for good once that flag is set (the crickets
  // outside, before the storm); it fades out at the next change of room.
  function ambienceFor(level, roomId) {
    const room = level.rooms.find((r) => r.id === roomId);
    const list = room?.ambience ?? level.ambience ?? [];
    return list.filter((entry) => !entry.until || !game.progress.hasFlag(entry.until));
  }

  // Fades beds that the new room (or the menu) does not use, starts the ones it does.
  function updateAmbience() {
    const { level } = game.world;
    const inMenu = !game.session.active;
    const room = inMenu ? 'menu' : roomAt(level, game.player.state.position);
    if (room === lastRoom) return;
    lastRoom = room;
    const list = inMenu ? MENU_AMBIENCE : ambienceFor(level, room);
    const wanted = new Map(list.map((entry) => (typeof entry === 'string' ? [entry, 0.5] : [entry.name, entry.volume])));
    const ctx = mixer.context();
    for (const [name, bed] of beds) {
      if (wanted.has(name)) continue;
      bed.gain.gain.setTargetAtTime(0, ctx.currentTime, AMBIENCE_FADE / 3);
      bed.source.stop(ctx.currentTime + AMBIENCE_FADE * 2);
      beds.delete(name);
    }
    for (const [name, volume] of wanted) {
      const existing = beds.get(name);
      if (existing) {
        existing.gain.gain.setTargetAtTime(volume, ctx.currentTime, AMBIENCE_FADE / 3);
        continue;
      }
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(mixer.bus(name.startsWith('mus_') ? 'music' : 'effects'));
      const source = ctx.createBufferSource();
      source.buffer = library.pick(name);
      source.loop = true;
      source.connect(gain);
      source.start();
      gain.gain.setTargetAtTime(volume, ctx.currentTime, AMBIENCE_FADE / 3);
      beds.set(name, { source, gain });
    }
  }

  function updateThunder(dt) {
    if (game.world.level.wing !== 'orphanage') return;
    thunderIn -= dt;
    if (thunderIn > 0) return;
    thunderIn = 40 + Math.random() * 50;
    play('thunder_far', { volume: 0.6, pitchJitter: 0.08 });
  }

  // Continuous loops whose volume other systems set (heartbeat, tinnitus).
  const layers = new Map();
  function setLayer(name, volume) {
    if (!ready) return;
    const ctx = mixer.context();
    let layer = layers.get(name);
    if (!layer && volume <= 0.001) return;
    if (!layer) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(mixer.bus('effects'));
      const source = ctx.createBufferSource();
      source.buffer = library.pick(name);
      source.loop = true;
      source.connect(gain);
      source.start();
      layer = { gain };
      layers.set(name, layer);
    }
    layer.gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.3);
  }

  function update(dt) {
    if (!ready) return;
    updateAmbience();
    if (game.mode !== 'playing') return;
    creakWait -= dt;
    updateFootsteps();
    updateThunder(dt);
    updateTimedEmitters(dt);
  }

  return { start, update, play, setLayer, layerVolume: (name) => layers.get(name)?.gain.gain.value ?? 0, isReady: () => ready, beds: () => [...beds.keys()], played: () => ({ ...played }) };
}
