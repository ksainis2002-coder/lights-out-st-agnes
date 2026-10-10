// Connects game events to sounds: footsteps by floor, doors, the flashlight,
// room ambience beds (crossfaded between rooms), and distant thunder.
// game.sfx.play(name, { position, volume, bus }) for one-shot sounds.
import { playSound } from './sounds.js';
import { createLibrary } from './library.js';
import { roomAt } from '../levels/loader.js';

const STRIDE = { crouch: 0.55, walk: 0.75, run: 0.95 }; // metres between steps
const STEP_VOLUME = { crouch: 0.3, walk: 0.65, run: 1 };
const FLOOR_SOUND = { wood: 'step_wood', floor: 'step_tile', tile: 'step_tile' };
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

  function play(name, { position = null, volume = 1, bus = 'effects', loop = false, pitchJitter, refDistance } = {}) {
    if (!ready) return null;
    played[name] = (played[name] ?? 0) + 1;
    const buffer = library.pick(name);
    return buffer ? playSound(mixer, buffer, { position, volume, bus, loop, pitchJitter, refDistance }) : null;
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
  events.on('flashlight.toggled', () => play('flashlight_click', { volume: 0.7, pitchJitter: 0.02 }));
  events.on('ui.move', () => play('ui_beep', { volume: 0.5, bus: 'effects', pitchJitter: 0 }));
  events.on('game.play', () => play('vhs_insert', { volume: 0.8, pitchJitter: 0 }));
  events.on('collapse.rewinding', () => play('vhs_rewind', { volume: 0.9, pitchJitter: 0 }));
  events.on('collapse.started', () => play('wake_gasp', { volume: 0.7 }));
  events.on('game.saved', () => play('vhs_eject', { volume: 0.7, pitchJitter: 0 }));
  events.on('level.leaving', () => play('door_use', { volume: 0.9 }));
  events.on('plate.taken', () => play('key_pickup', { volume: 0.6 }));
  events.on('plate.placed', () => play('key_pickup', { volume: 0.6 }));
  events.on('toy.moved', () => play('wooden_toy', { volume: 0.5 }));
  // The plates drop the crank (a rolling clatter); the toys draw back a bolt.
  events.on('puzzle.solved', (name) => play(name === 'toys' ? 'door_locked' : 'wooden_toy', { volume: 0.9 }));
  // Positional loops placed in the level (the office clock): "emitters".
  let emitterSources = [];
  function startEmitters() {
    emitterSources.forEach((source) => source.stop());
    const { level } = game.world;
    emitterSources = level.emitters
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
  }

  return { start, update, play, setLayer, layerVolume: (name) => layers.get(name)?.gain.gain.value ?? 0, isReady: () => ready, beds: () => [...beds.keys()], played: () => ({ ...played }) };
}
