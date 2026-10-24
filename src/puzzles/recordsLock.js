// Puzzle 3 (the headmaster's office): the records cabinet's three number
// wheels. The code is Classroom 2's counting lesson (windows, lids left up,
// names on the board: 3 5 4 on Normal). Up close (approved still
// ui_codeLock) the wheels turn and CLICK tries the drawer: wrong, it won't
// open; right, it slides out with the "struck off the roll" list, Tommy's
// medical card and the cemetery gate key on top of the files. Until the
// board has been read the numbers mean nothing, so the drawer stays shut.
// The wheels stay where they were left.
// Level data: "recordsLock": { "prop": "records_cabinet", "clue": "seen_counting_board", "code": [3, 5, 4] }
import * as THREE from 'three';
import { findProp } from '../props/place.js';
import { openDrawer } from '../props/schoolRooms.js';

export const SOLVED = 'puzzle_records';
const WHEELS = 'records_wheels'; // progress value: the digits showing

export function recordsLockPuzzle(game, level, data) {
  const { progress } = game;
  const cabinet = findProp(game.world.levelGroup, data.prop);
  cabinet.updateWorldMatrix(true, false);
  if (progress.hasFlag(SOLVED)) openDrawer(cabinet);
  let note = null;

  const wheels = () => progress.getValue(WHEELS, data.code.map(() => 0));

  function set(index, digit) {
    const next = wheels();
    next[index] = (digit + 10) % 10;
    progress.setValue(WHEELS, next);
    note = null;
    game.events.emit('records.wheel', index);
  }

  function solve() {
    if (game.mode === 'ui') game.resume(); // step back to see the drawer slide out
    openDrawer(cabinet);
    progress.setFlag(SOLVED);
    game.messages.show('msg.recordsOpen', null, 5);
    game.events.emit('puzzle.solved', 'records');
    game.events.emit('checkpoint');
  }

  function tryDrawer() {
    if (progress.hasFlag(SOLVED)) return;
    if (wheels().join() === data.code.join() && progress.hasFlag(data.clue)) return solve();
    note = 'msg.recordsWrong';
    game.events.emit('records.wrong');
  }

  const target = {
    position: cabinet.localToWorld(new THREE.Vector3(0, 1.15, 0.34)),
    radius: 0.35,
    prompt: () => (progress.hasFlag(SOLVED) ? null : { key: 'prompt.tryLock' }),
    use() {
      note = null;
      game.openScreen('codeLock', {
        wheels,
        turn: (index, step) => set(index, wheels()[index] + step),
        set,
        tryDrawer,
        note: () => note,
      });
    },
  };
  return [target];
}
