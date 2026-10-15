// Puzzle 4 (gym): Maggie's rhyme names the squares to hop, in order (2, 7,
// 5, 9, 1 on Normal). Played up close from above (owner pick). A wrong
// square: the rope slaps, she giggles, start again from the first. Solved,
// she gives you her skipping rope (the wing's toy). Until she has sung the
// rhyme, the squares are only chalk.
// Level data: "hopscotch": { "prop": "hopscotch", "clue": "heard_rhyme_gym", "order": [2, 7, 5, 9, 1] }
import * as THREE from 'three';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_hopscotch';

export function hopscotchPuzzle(game, level, data) {
  const { progress } = game;
  const grid = findProp(game.world.levelGroup, data.prop);
  grid.updateWorldMatrix(true, false);
  let hopped = [];
  let note = null;

  function solve() {
    if (game.mode === 'ui') game.resume();
    progress.setFlag(SOLVED);
    game.events.emit('puzzle.solved', 'hopscotch');
    game.events.emit('checkpoint');
    game.subtitles.show('maggie.ropeGiven', { speaker: 'maggie', seconds: 5 });
  }

  function hop(square) {
    if (progress.hasFlag(SOLVED)) return;
    if (!progress.hasFlag(data.clue)) {
      note = 'hopscotch.noRhyme';
      return;
    }
    hopped = [...hopped, square];
    game.events.emit('hopscotch.hop', square);
    if (data.order[hopped.length - 1] !== square) {
      hopped = [];
      note = 'maggie.hopWrong';
      game.events.emit('hopscotch.wrong');
      return;
    }
    note = null;
    if (hopped.length === data.order.length) solve();
  }

  const target = {
    position: grid.localToWorld(new THREE.Vector3(0, 0.05, 0)),
    radius: 0.9,
    prompt: () => (progress.hasFlag(SOLVED) ? null : { key: 'prompt.hopscotch' }),
    use() {
      hopped = [];
      note = progress.hasFlag(data.clue) ? null : 'hopscotch.noRhyme';
      game.openScreen('hopscotch', { hop, hopped: () => [...hopped], note: () => note });
    },
  };
  return [target];
}
