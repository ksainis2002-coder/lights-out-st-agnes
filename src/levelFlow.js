// Moving between levels and the per-level things that come with it
// (usable doors). game.travel('orphanage_wing', 'landing').
import { LEVELS } from './levels/index.js';
import { doorInteractables } from './levels/doorUse.js';

export function setupLevelFlow(game) {
  let usable = [];
  game.interaction.addSource(() => usable);

  game.loadLevel = (id, spawnName = 'default') => {
    const data = LEVELS[id];
    if (!data) throw new Error(`Unknown level "${id}"`);
    const level = game.world.loadLevel(data);
    game.player.setLevel(level, level.spawns[spawnName] ?? level.spawn);
    game.triggers.setLevel(level);
    usable = doorInteractables(game);
    game.interaction.clear();
    game.events.emit('level.loaded', level);
    return level;
  };

  game.travel = (id, spawnName) => {
    game.loadLevel(id, spawnName);
    game.events.emit('level.travelled', id);
  };

  usable = doorInteractables(game); // the level the world started with

  // Inventory arrives in a later step; until then nothing is carried.
  game.hasItem = (id) => game.inventory?.has(id) ?? false;
}
