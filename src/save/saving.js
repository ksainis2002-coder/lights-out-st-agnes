// Saving and loading during play: manual saves on the three tapes (at tape
// recorders) and a silent autosave at checkpoints (entering a level, and any
// "checkpoint" event, e.g. after a puzzle).
import { captureState, describeState, applyState } from './gameState.js';

export function setupSaving(game) {
  const { saves, events } = game;
  let restoring = false;

  game.saveToTape = (slot) => {
    saves.save(slot, captureState(game), describeState(game));
    events.emit('game.saved', slot);
  };

  game.autosave = () => {
    if (restoring || !game.session.active) return;
    saves.autosave(captureState(game), describeState(game));
    events.emit('game.autosaved');
  };

  game.loadFromTape = (slot) => {
    const save = saves.load(slot);
    if (!save) return false;
    restoring = true;
    applyState(game, save.state);
    restoring = false;
    game.session.active = true;
    events.emit('game.loaded', slot);
    return true;
  };

  game.hasAnySave = () => saves.list().some((entry) => !entry.empty);

  events.on('level.travelled', () => game.autosave());
  events.on('checkpoint', () => game.autosave());
}
