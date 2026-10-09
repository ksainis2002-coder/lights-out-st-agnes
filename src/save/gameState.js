// What a save holds for a run in progress, and how it is put back.
// Shape (inside the save envelope's "state", SAVE_VERSION 1):
//   { level, position: { x, z, yaw }, inventory, journal, progress, playTime }
import { LEVELS, START_LEVEL } from '../levels/index.js';
import { roomAt } from '../levels/loader.js';

export function captureState(game) {
  const { player, world } = game;
  return {
    level: world.level.id,
    position: { x: player.state.position.x, z: player.state.position.z, yaw: player.state.yaw },
    inventory: game.inventory.toJSON(),
    journal: game.journal.toJSON(),
    progress: game.progress.toJSON(),
    playTime: game.session.playTime,
  };
}

// Short description for the tape list: which room, how long played.
export function describeState(game) {
  return {
    wing: game.world.level.wing,
    room: roomAt(game.world.level, game.player.state.position) ?? game.world.level.id,
    playTime: game.session.playTime,
  };
}

export function applyState(game, state) {
  game.inventory.load(state.inventory);
  game.journal.load(state.journal);
  game.progress.load(state.progress);
  game.session.playTime = state.playTime ?? 0;
  const levelId = LEVELS[state.level] ? state.level : START_LEVEL;
  game.loadLevel(levelId);
  if (levelId === state.level && state.position) {
    Object.assign(game.player.state.position, { x: state.position.x, z: state.position.z });
    game.player.state.yaw = state.position.yaw ?? 0;
  }
}

// A brand-new run: empty pockets, nothing done, start level.
export function resetState(game) {
  game.inventory.load(null);
  game.journal.load(null);
  game.progress.load(null);
  game.session.playTime = 0;
  game.loadLevel(START_LEVEL);
}
