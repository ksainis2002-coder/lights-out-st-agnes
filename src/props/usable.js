// Props that do something when used, named by a "use" field in level data:
//   { "type": "tapeRecorder", "at": [...], "use": "save" }
//   { "type": "drawing", "id": "drawing_ivy", "at": [...], "use": "look" }
// Looking at a prop sets the flag seen_<id> (puzzles check it) and notes the
// clue saw_<id> in the journal, if that text exists; a prop without its own
// clue shows a line about its kind (look.<type>.<kind>). Every drawing can be
// looked at, with or without a "use" in the data.
//   { "type": "wallClock", "at": [...], "use": "clock" }
// Using a clock reads out the real local time (a quiet hint for the 3:00 room).
//   { "type": "stairs", "use": "travel", "to": { "level": "...", "spawn": "..." },
//     "prompt": "prompt.stairsUp", "requires": "<flag>", "lockedMessage": "<key>" }
// Stairs and outside doors drawn as props take you to another level ("Not
// yet" while that level is not built).
//   { "type": "facadeDoor", "use": "message", "message": "<key>", "prompt": "<key>" }
// A door that never opens, or a look through a keyhole: just its line.
// "useHeight" and "useRadius" place the spot you aim at.
import * as THREE from 'three';
import { clockFaceTime } from './clocks.js';
import { LEVELS } from '../levels/index.js';

function useClock(game) {
  game.messages.show('msg.clockTime', { time: clockFaceTime(game.world.now()) }, 3);
}

const waiting = (game, prop) => prop.requires && !game.progress.hasFlag(prop.requires);

// A door or gate that won't let you through: its line, and the locked rattle.
function refuse(game, prop, message) {
  if (message) game.messages.show(message, null, 5);
  game.events.emit('prop.refused', prop);
}

const USES = {
  save: { prompt: 'prompt.save', height: 0.1, run: (game) => game.openScreen('save') },
  travel: {
    prompt: 'prompt.leave',
    height: 1.2,
    promptFor(game, prop) {
      if (waiting(game, prop)) return 'prompt.locked';
      return LEVELS[prop.to.level] ? prop.prompt : 'prompt.notYet';
    },
    run(game, prop) {
      if (waiting(game, prop)) return refuse(game, prop, prop.lockedMessage);
      if (LEVELS[prop.to.level]) game.travel(prop.to.level, prop.to.spawn);
    },
  },
  message: { prompt: 'prompt.open', height: 1.2, run: (game, prop) => refuse(game, prop, prop.message) },
  clock: { prompt: 'prompt.clock', height: 1.45, run: useClock },
  look: {
    prompt: 'prompt.look',
    height: 1.15,
    run(game, prop) {
      const kindLine = `look.${prop.type}.${prop.options?.kind}`;
      if (!prop.id) return game.i18n.has(kindLine) && game.messages.show(kindLine, null, 5);
      const first = !game.progress.hasFlag(`seen_${prop.id}`);
      game.progress.setFlag(`seen_${prop.id}`);
      const line = game.i18n.has(`clue.saw_${prop.id}`) ? `clue.saw_${prop.id}` : kindLine;
      if (game.i18n.has(line)) game.messages.show(line, null, 5);
      if (first) game.events.emit('prop.looked', prop);
    },
  },
};

const DEFAULT_USE = { drawing: 'look', hymnBoard: 'look' };
const useOf = (prop) => prop.use ?? DEFAULT_USE[prop.type];

export function propInteractables(game, level) {
  return level.props.filter((prop) => USES[useOf(prop)]).map((prop) => {
    const action = USES[useOf(prop)];
    return {
      position: new THREE.Vector3(prop.at[0] * level.cellSize, (prop.y ?? 0) + (prop.useHeight ?? action.height), prop.at[1] * level.cellSize),
      radius: prop.useRadius ?? 0.3,
      prompt: () => ({ key: action.promptFor?.(game, prop) ?? prop.prompt ?? action.prompt }),
      use: () => action.run(game, prop),
    };
  });
}
