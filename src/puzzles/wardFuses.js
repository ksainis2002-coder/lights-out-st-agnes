// Puzzle 1 of the west wing (design 0.4, approved still ui_fuseBoard): the
// fuse board. Six circuits, fewer fuses. A circuit with a fuse is live (flag
// power_<circuit>): its lamps burn (levels/lamps.js) and its electric lock
// lets go (the dispensary door, the stairs gate: doors that "require" the
// flag). But Sister M. walks to lit lamps and puts them out, so light is also
// a lure: light a room you do not need and she goes there. Lamps she has put
// out stay out until that fuse is pulled and pushed in again.
// Up close (E at the board): choose a socket, CLICK puts a fuse in or pulls
// one out. Fuses are items; the board starts with one (Ward A's: that is why
// its lamps are on when you arrive).
// Level data: "wardFuses": { "prop": "fuse_board", "circuits": ["ward_a", …], "start": [0], "opens": "stairs" }
import * as THREE from 'three';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_ward_fuses'; // the way upstairs has power
const SOCKETS = 'ward_fuses'; // progress value: which sockets hold a fuse
const FUSE = 'fuse';

export function wardFusesPuzzle(game, level, data) {
  const { progress, inventory } = game;
  const board = findProp(game.world.levelGroup, data.prop);
  board.updateWorldMatrix(true, false);
  let note = null;

  const sockets = () => progress.getValue(SOCKETS, data.circuits.map((_, i) => data.start.includes(i)));
  const inHand = () => inventory.items().filter((item) => item === FUSE).length;

  // The flags and the board on the wall follow the sockets (also on every load).
  function sync() {
    const held = sockets();
    data.circuits.forEach((circuit, i) => (held[i] ? progress.setFlag(`power_${circuit}`) : progress.clearFlag(`power_${circuit}`)));
    board.userData.setFuses?.(held);
  }
  sync();

  function toggle(index) {
    const held = sockets();
    const circuit = data.circuits[index];
    note = null;
    if (held[index]) {
      if (!inventory.add(FUSE)) return (note = 'msg.inventoryFull');
    } else {
      if (!inventory.remove(FUSE)) return (note = 'msg.noSpareFuse');
    }
    held[index] = !held[index];
    progress.setValue(SOCKETS, held);
    sync();
    game.lamps.power(circuit, held[index]);
    game.events.emit(held[index] ? 'fuse.set' : 'fuse.pulled', { circuit });
    if (held[index] && circuit === data.opens && !progress.hasFlag(SOLVED)) {
      progress.setFlag(SOLVED);
      game.events.emit('puzzle.solved', 'wardFuses');
      game.events.emit('checkpoint');
    }
    return null;
  }

  // What the lamp beside a socket shows: 'empty', 'live', or 'out' (a fuse is
  // in, but she has put that room's lamps out).
  function state(index) {
    if (!sockets()[index]) return 'empty';
    return game.lamps.circuitState(data.circuits[index]) === 'out' ? 'out' : 'live';
  }

  const target = {
    position: board.localToWorld(new THREE.Vector3(0, 1.4, 0.1)),
    radius: 0.5,
    prompt: () => ({ key: 'prompt.openFuseBox' }),
    use() {
      note = null;
      game.openScreen('wardFuses', { circuits: data.circuits, state, inHand, toggle, note: () => note });
    },
  };
  return [target];
}
