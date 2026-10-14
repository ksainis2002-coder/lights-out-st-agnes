// Puzzle 4 (sick bay): after the lights die, the fuse box's four levers must
// be pulled in the order of tonight's hymns. The night rota (a document) says
// to use the hymn board's order; the hymn board (looked at) gives it. Without
// both, the levers won't be touched. A wrong lever snaps them all back.
// The box opens up close (ui/screens/fuseBox.js, owner request 2026-10-14),
// like the music box; the 3D levers follow what happens there.
// Level data: "puzzles": { "fuses": { "prop": "fuse_box", "order": [3, 1, 4, 2],
//   "clues": { "read": "<document id>", "seen": "<flag>" }, "cutWhen": "<flag>" } }
import * as THREE from 'three';

export const SOLVED = 'puzzle_fuses';
const DOWN = 0.9; // radians a pulled lever tips forward

export function fusesPuzzle(game, level, data) {
  const { progress } = game;
  let box = null;
  game.world.levelGroup.traverse((object) => {
    if (object.userData.prop?.id === data.prop) box = object;
  });
  box.updateWorldMatrix(true, false);
  const levers = box.userData.levers;
  let pulled = progress.hasFlag(SOLVED) ? [...data.order] : [];

  function showLevers() {
    levers.forEach((lever, i) => (lever.rotation.x = pulled.includes(i + 1) ? DOWN : 0));
  }
  showLevers();

  const knowsOrder = () => progress.isRead(data.clues.read) && progress.hasFlag(data.clues.seen);

  let note = null; // why a lever would not move, or why they all snapped back

  function solve() {
    if (game.mode === 'ui') game.resume(); // step back to see the lights come on
    progress.setFlag(SOLVED);
    game.messages.show('msg.fusesSolved', null, 6);
    game.events.emit('puzzle.solved', 'fuses');
    game.events.emit('checkpoint');
  }

  function pull(number) {
    if (progress.hasFlag(SOLVED) || pulled.includes(number)) return;
    if (!knowsOrder()) {
      note = 'msg.fusesNeedClue';
      return;
    }
    note = null;
    pulled = [...pulled, number];
    game.events.emit('fuses.lever', number);
    if (data.order[pulled.length - 1] !== number) {
      pulled = [];
      note = 'msg.fusesWrong';
      game.events.emit('fuses.reset');
    } else if (pulled.length === data.order.length) {
      solve();
    }
    showLevers();
  }

  // One target on the box: once the power is out it opens up close.
  const target = {
    position: box.localToWorld(new THREE.Vector3(0, 1.3, 0.1)),
    radius: 0.24,
    prompt: () => (progress.hasFlag(SOLVED) ? null : { key: 'prompt.openFuseBox' }),
    use() {
      if (!progress.hasFlag(data.cutWhen)) return game.messages.show('msg.fusesPowerOn', null, 4);
      note = null;
      game.openScreen('fuseBox', { pull, pulled: () => [...pulled], note: () => note });
    },
  };
  return [target];
}
