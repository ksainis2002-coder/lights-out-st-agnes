// Moving between levels and the per-level things that come with it
// (usable doors). game.travel('orphanage_wing', 'landing').
import { LEVELS } from './levels/index.js';
import { doorInteractables, applyDoorProgress } from './levels/doorUse.js';
import { createPickups } from './items/pickups.js';
import { propInteractables } from './props/usable.js';
import { puzzleInteractables } from './puzzles/index.js';

export function setupLevelFlow(game) {
  let usable = [];
  let pickups = null;
  game.interaction.addSource(() => usable);

  game.loadLevel = (id, spawnName = 'default') => {
    const data = LEVELS[id];
    if (!data) throw new Error(`Unknown level "${id}"`);
    const level = game.world.loadLevel(data);
    applyDoorProgress(level, game.progress);
    game.player.setLevel(level, level.spawns[spawnName] ?? level.spawn);
    game.triggers.setLevel(level);
    pickups?.dispose();
    pickups = createPickups(game, level, data);
    game.world.levelGroup.add(pickups.group);
    usable = [...doorInteractables(game), ...pickups.usable, ...propInteractables(game, level), ...puzzleInteractables(game, level, data)];
    game.interaction.clear();
    game.events.emit('level.loaded', level);
    return level;
  };

  // Travel fades to black, swaps the level, then fades back in. While it
  // runs the player cannot move (game.isTravelling()).
  const FADE_OUT = 0.35;
  const FADE_IN = 0.6;
  let trip = null;

  game.travel = (id, spawnName) => {
    if (trip) return;
    trip = { id, spawnName, t: 0, loaded: false };
    game.events.emit('level.leaving', id);
  };

  game.isTravelling = () => trip !== null;

  game.updateTravel = (dt) => {
    if (!trip) return;
    trip.t += dt;
    if (!trip.loaded && trip.t >= FADE_OUT) {
      game.loadLevel(trip.id, trip.spawnName);
      trip.loaded = true;
      game.events.emit('level.travelled', trip.id);
    }
    const fade = trip.loaded ? 1 - (trip.t - FADE_OUT) / FADE_IN : trip.t / FADE_OUT;
    game.pipeline.fx.fade = Math.max(0, Math.min(1, fade));
    if (trip.loaded && trip.t >= FADE_OUT + FADE_IN) trip = null;
  };

  game.hasItem = (id) => game.inventory.has(id);

  game.loadLevel(game.world.level.id); // set up the level the world started with
}
