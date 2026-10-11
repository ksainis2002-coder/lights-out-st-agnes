// Props that do something when used, named by a "use" field in level data:
//   { "type": "tapeRecorder", "at": [...], "use": "save" }
//   { "type": "drawing", "id": "drawing_ivy", "at": [...], "use": "look" }
// Looking at a prop sets the flag seen_<id> (puzzles check it) and notes the
// clue saw_<id> in the journal, if that text exists.
//   { "type": "wallClock", "at": [...], "use": "clock" }
// Using a clock reads out the real local time. The third time, it drops what
// is hidden behind it (documents that "appearsWith": "clock_notes").
import * as THREE from 'three';
import { clockFaceTime } from './clocks.js';

const CLOCK_USES = 'clock_uses';
const CLOCK_DROP_AT = 3;

function useClock(game) {
  const { progress, messages } = game;
  messages.show('msg.clockTime', { time: clockFaceTime(game.world.now()) }, 3);
  const uses = progress.getValue(CLOCK_USES, 0) + 1;
  progress.setValue(CLOCK_USES, uses);
  if (uses !== CLOCK_DROP_AT) return;
  progress.setFlag('clock_notes');
  messages.notice('msg.clockDrop', null, 4);
  game.events.emit('reveal', 'clock_notes');
}

const USES = {
  save: { prompt: 'prompt.save', height: 0.1, run: (game) => game.openScreen('save') },
  clock: { prompt: 'prompt.clock', height: 1.45, run: useClock },
  look: {
    prompt: 'prompt.look',
    height: 1.15,
    run(game, prop) {
      const first = !game.progress.hasFlag(`seen_${prop.id}`);
      game.progress.setFlag(`seen_${prop.id}`);
      if (game.i18n.has(`clue.saw_${prop.id}`)) game.messages.show(`clue.saw_${prop.id}`, null, 5);
      if (first) game.events.emit('prop.looked', prop);
    },
  },
};

export function propInteractables(game, level) {
  return level.props.filter((prop) => USES[prop.use]).map((prop) => {
    const action = USES[prop.use];
    return {
      position: new THREE.Vector3(prop.at[0] * level.cellSize, (prop.y ?? 0) + action.height, prop.at[1] * level.cellSize),
      radius: 0.3,
      prompt: () => ({ key: action.prompt }),
      use: () => action.run(game, prop),
    };
  });
}
