// Puzzle 3 of the west wing (the content sheet): Dr. Venn's door, a brass
// plate of four number wheels beside it. Maggie watched him through the hatch
// and scratched the order into the padding of the two isolation cells, where
// only the camcorder's night view shows it: 4 2 6 1. Until both cells have
// been read that way the numbers mean nothing, so the door stays shut. Up
// close it is the school's lock screen with its own label; right, the door's
// flag is set (it "requires" it) and it can be opened.
// Level data: "doorLock": { "prop": "venn_lock", "code": [4, 2, 6, 1], "needs": ["seen_cell_writing_1", …],
//   "solved": "puzzle_venn_door", "label": "codeLock.venn", "wrong": "msg.vennWrong", "open": "msg.vennOpen" }
import * as THREE from 'three';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_venn_door';

export function doorLockPuzzle(game, level, data) {
  const { progress } = game;
  const plate = findProp(game.world.levelGroup, data.prop);
  plate.updateWorldMatrix(true, false);
  const solvedFlag = data.solved ?? SOLVED;
  const wheelsKey = `${data.prop}_wheels`; // progress value: the digits showing
  let note = null;

  const wheels = () => progress.getValue(wheelsKey, data.code.map(() => 0));

  function set(index, digit) {
    const next = wheels();
    next[index] = (digit + 10) % 10;
    progress.setValue(wheelsKey, next);
    note = null;
    game.events.emit('records.wheel', index);
  }

  function tryDrawer() {
    if (progress.hasFlag(solvedFlag)) return;
    const known = (data.needs ?? []).every((flag) => progress.hasFlag(flag));
    if (wheels().join() === data.code.join() && known) {
      if (game.mode === 'ui') game.resume();
      progress.setFlag(solvedFlag);
      game.messages.show(data.open, null, 5);
      game.events.emit('puzzle.solved', 'doorLock');
      game.events.emit('checkpoint');
      return;
    }
    note = data.wrong;
    game.events.emit('records.wrong');
  }

  const target = {
    position: plate.localToWorld(new THREE.Vector3(0, 1.3, 0.04)),
    radius: 0.25,
    prompt: () => (progress.hasFlag(solvedFlag) ? null : { key: 'prompt.tryLock' }),
    use() {
      note = null;
      game.openScreen('codeLock', { wheels, turn: (index, step) => set(index, wheels()[index] + step), set, tryDrawer, note: () => note, label: data.label });
    },
  };
  return [target];
}
