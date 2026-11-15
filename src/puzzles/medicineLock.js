// Puzzle 2 of the west wing (the content sheet): the dispensary cabinet's
// four number wheels. The night round card says to give the drops in the
// order the children were admitted; the admissions book gives the order, the
// bed charts the drops: 3 8 1 5. Until the card has been read the numbers
// mean nothing, so the cabinet stays shut. Open, it gives a fuse, pills and
// the cylinder of Edith's music box (pickups that appear with the flag).
// Level data: "medicineLock": { "prop": "medicine_cabinet", "card": "night_round", "code": [3, 8, 1, 5] }
import * as THREE from 'three';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_medicine';
const WHEELS = 'medicine_wheels'; // progress value: the digits showing

export function medicineLockPuzzle(game, level, data) {
  const { progress } = game;
  const cabinet = findProp(game.world.levelGroup, data.prop);
  cabinet.updateWorldMatrix(true, false);
  let note = null;

  const wheels = () => progress.getValue(WHEELS, data.code.map(() => 0));

  function set(index, digit) {
    const next = wheels();
    next[index] = (digit + 10) % 10;
    progress.setValue(WHEELS, next);
    note = null;
    game.events.emit('records.wheel', index); // the same click as the school's lock
  }

  function solve() {
    if (game.mode === 'ui') game.resume();
    progress.setFlag(SOLVED);
    game.messages.show('msg.medicineOpen', null, 6);
    game.events.emit('puzzle.solved', 'medicineLock');
    game.events.emit('reveal');
    game.events.emit('checkpoint');
  }

  function tryDrawer() {
    if (progress.hasFlag(SOLVED)) return;
    if (wheels().join() === data.code.join() && progress.isRead(data.card)) return solve();
    note = 'msg.cabinetWrong';
    game.events.emit('records.wrong');
  }

  const target = {
    position: cabinet.localToWorld(new THREE.Vector3(0.34, 1.42, 0.12)),
    radius: 0.3,
    prompt: () => (progress.hasFlag(SOLVED) ? null : { key: 'prompt.tryLock' }),
    use() {
      note = null;
      game.openScreen('codeLock', {
        wheels,
        turn: (index, step) => set(index, wheels()[index] + step),
        set,
        tryDrawer,
        note: () => note,
        label: 'codeLock.dispensary',
      });
    },
  };
  return [target];
}
