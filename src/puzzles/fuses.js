// Puzzle 4 (sick bay): after the lights die, the fuse box's four levers must
// be pulled in the order of tonight's hymns. The night rota (a document) says
// to use the hymn board's order; the hymn board (looked at) gives it. Without
// both, the levers won't be touched. A wrong lever snaps them all back.
// Level data: "puzzles": { "fuses": { "prop": "fuse_box", "order": [3, 1, 4, 2],
//   "clues": { "read": "<document id>", "seen": "<flag>" }, "cutWhen": "<flag>" } }
import * as THREE from 'three';
import { FUSE_LEVERS } from '../props/hall.js';

const SOLVED = 'puzzle_fuses';
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

  function pull(number) {
    if (!progress.hasFlag(data.cutWhen)) return game.messages.show('msg.fusesPowerOn', null, 4);
    if (!knowsOrder()) return game.messages.show('msg.fusesNeedClue', null, 5);
    pulled = [...pulled, number];
    game.events.emit('fuses.lever', number);
    if (data.order[pulled.length - 1] !== number) {
      pulled = [];
      game.messages.show('msg.fusesWrong', null, 4);
      game.events.emit('fuses.reset');
    } else if (pulled.length === data.order.length) {
      progress.setFlag(SOLVED);
      game.messages.show('msg.fusesSolved', null, 6);
      game.events.emit('puzzle.solved', 'fuses');
      game.events.emit('checkpoint');
    }
    showLevers();
  }

  return FUSE_LEVERS.map((x, i) => ({
    position: box.localToWorld(new THREE.Vector3(x, 1.24, 0.08)),
    radius: 0.045,
    prompt: () => (progress.hasFlag(SOLVED) || pulled.includes(i + 1) ? null : { key: 'prompt.pullLever', params: { number: i + 1 } }),
    use: () => pull(i + 1),
  }));
}
