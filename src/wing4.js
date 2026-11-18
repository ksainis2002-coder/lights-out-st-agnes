// Wing 4's systems (0.5), made and run in one place so main.js stays short:
// St. Agnes's pieces in the chapel (part A), and the ways to stay unheard in
// the basement (part B): holding your breath, throwing.
import { createAgnesPieces } from './ai/agnesPieces.js';
import { createBreath } from './player/breath.js';
import { createThrowing } from './player/throwing.js';

export function createWingFour(game) {
  game.agnes = createAgnesPieces(game, game.watcher); // in the chapel: her pieces given back
  game.breath = createBreath(game); // Space: no breath sound for a while, then a gasp
  game.throwing = createThrowing(game); // G: a bottle or a stone, and a noise where it lands

  // Every frame of play, after the player has moved.
  function update(dt, input) {
    game.agnes.update(dt);
    game.breath.update(dt, input);
    game.throwing.update(dt, input);
  }

  return { update };
}
