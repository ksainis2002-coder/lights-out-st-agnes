// Connects game events to sounds: footsteps by floor, doors, the flashlight,
// room ambience beds (crossfaded between rooms), and distant thunder.
// game.sfx.play(name, { position, volume, bus }) for one-shot sounds.
import { playSound } from './sounds.js';
import { createLibrary } from './library.js';
import { roomAt } from '../levels/loader.js';

const STRIDE = { crouch: 0.55, walk: 0.75, run: 0.95 }; // metres between steps
const STEP_VOLUME = { crouch: 0.3, walk: 0.65, run: 1 };
// School floors use the nearest sound until the outdoor steps arrive (sound list 0.3).
const FLOOR_SOUND = { wood: 'step_wood', parquet: 'step_wood', floor: 'step_tile', tile: 'step_tile', hallTile: 'step_tile', gravel: 'step_tile', grass: 'step_wood' };
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
  const played = {}; // name → count, for the debug overlay and tests

  function play(name, { position = null, volume = 1, bus = 'effects', loop = false, pitchJitter, refDistance, rate } = {}) {
    if (!ready) return null;
    played[name] = (played[name] ?? 0) + 1;
    const buffer = library.pick(name);
    return buffer ? playSound(mixer, buffer, { position, volume, bus, loop, pitchJitter, refDistance, rate }) : null;
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

  events.on('door.opened', (door) => play('door_use', { position: doorPosition(door) }));
  events.on('door.closed', (door) => play('door_use', { position: doorPosition(door), volume: 0.8 }));
  events.on('door.locked', (door) => play('door_locked', { position: doorPosition(door) }));
  events.on('prop.refused', (prop) => {
    const size = game.world.level.cellSize;
    play('door_locked', { position: { x: prop.at[0] * size, y: 1.2, z: prop.at[1] * size } });
  });
  events.on('flashlight.toggled', () => play('flashlight_click', { volume: 0.7, pitchJitter: 0.02 }));
  events.on('ui.move', () => play('ui_beep', { volume: 0.5, bus: 'effects', pitchJitter: 0 }));
  events.on('game.play', () => play('vhs_insert', { volume: 0.8, pitchJitter: 0 }));
  events.on('collapse.rewinding', () => play('vhs_rewind', { volume: 0.9, pitchJitter: 0 }));
  events.on('collapse.started', () => play('wake_gasp', { volume: 0.7 }));
  events.on('collapse.scare', () => play('mus_stinger', { volume: 1, bus: 'music', pitchJitter: 0 }));
  events.on('game.saved', () => play('vhs_eject', { volume: 0.7, pitchJitter: 0 }));
  events.on('level.leaving', () => play('door_use', { volume: 0.9 }));
  events.on('plate.taken', () => play('key_pickup', { volume: 0.6 }));
  events.on('plate.placed', () => play('key_pickup', { volume: 0.6 }));
  events.on('toy.moved', () => play('wooden_toy', { volume: 0.5 }));
  // The plates drop the crank (a rolling clatter); the toys draw back a bolt;
  // the lullaby lets a hidden door creak loose.
  const SOLVED_SOUND = { plates: 'wooden_toy', toys: 'door_locked', lullaby: 'door_open_slow', fuses: 'fluorescent_buzz', piano: 'key_pickup', library: 'paper_pickup' };
  events.on('puzzle.solved', (name) => play(SOLVED_SOUND[name] ?? 'wooden_toy', { volume: 0.9 }));
  events.on('fuses.lever', () => play('drawer', { volume: 0.5 }));
  events.on('fuses.reset', () => play('door_locked', { volume: 0.7 }));
  events.on('power.cut', () => play('thunder_far', { volume: 1 }));
  events.on('reveal', () => play('paper_pickup', { volume: 0.8 }));
  events.on('musicBox.wound', () => play('drawer', { volume: 0.6 }));
  // School wing: 0.2 sounds stand in until the 0.3 files arrive (desk_lid,
  // cloth_rustle, book_slide, rope_slap, key_drop_wood in docs/SOUNDS_0.3.md).
  const propPosition = (prop, y) => {
    const size = game.world.level.cellSize;
    const [col, row] = prop.useAt ?? prop.at;
    return { x: col * size, y, z: row * size };
  };
  events.on('prop.opened', (prop) => play('drawer', { position: propPosition(prop, 0.8), volume: 0.7 }));
  events.on('prop.searched', (prop) => play('cloth_crouch', { position: propPosition(prop, 1.1) }));
  events.on('library.drawer', () => play('drawer', { volume: 0.5 }));
  events.on('library.book', () => play('paper_pickup', { volume: 0.7 }));
  events.on('hopscotch.hop', () => play('step_wood', { volume: 0.6 }));
  events.on('hopscotch.wrong', () => play('giggle_close', { volume: 0.4 }));
  // The watcher: her grind each time she moves and her breath at arm's reach
  // (stone_grind, stone_near_breath) are pitched-down 0.2 sounds for now.
  const at = (point, y) => ({ x: point.x, y, z: point.z });
  events.on('watcher.moved', ({ position }) => play('drawer', { position: at(position, 0.4), rate: 0.5, volume: 1, refDistance: 2 }));
  events.on('watcher.breath', ({ position }) => play('breath_hold', { position: at(position, 1.9), rate: 0.7, volume: 1 }));
  events.on('watcher.grab', ({ position }) => play('drawer', { position: at(position, 0.4), rate: 0.4, volume: 1 }));
  events.on('collapse.grab', () => play('mus_stinger', { volume: 1, bus: 'music', pitchJitter: 0 }));
  events.on('watcher.introStarted', () => play('fluorescent_buzz', { volume: 0.5, rate: 0.8 }));
  // Maggie's chalk on a board and Classroom 1's desks dragged round
  // (chalk_write, chair_scrape): 0.2 sounds pitched for now.
  events.on('chalk.scratch', ({ position }) => play('cloth_crouch', { position, rate: 1.8, volume: 0.6, refDistance: 2 }));
  events.on('trick.scrape', ({ position }) => play('bed_creak', { position, rate: 0.75, volume: 1, refDistance: 3 }));
  // Positional loops placed in the level (the office clock): "emitters".
  let emitterSources = [];
  // Emitters loop, or with "every": [min, max] play once at random gaps
  // (a drip, not a machine-gun loop).
  let timedEmitters = [];
  const gap = ([min, max]) => min + Math.random() * (max - min);

  function updateTimedEmitters(dt) {
    const { level } = game.world;
    for (const emitter of timedEmitters) {
      emitter.wait -= dt;
      if (emitter.wait > 0) continue;
      emitter.wait = gap(emitter.every);
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
    play(FLOOR_SOUND[floorUnderPlayer()] ?? 'step_tile', { volume: STEP_VOLUME[pace] });
  }

  function ambienceFor(level, roomId) {
    const room = level.rooms.find((r) => r.id === roomId);
    return room?.ambience ?? level.ambience ?? [];
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
    updateFootsteps();
    updateThunder(dt);
    updateTimedEmitters(dt);
  }

  return { start, update, play, setLayer, layerVolume: (name) => layers.get(name)?.gain.gain.value ?? 0, isReady: () => ready, beds: () => [...beds.keys()], played: () => ({ ...played }) };
}
