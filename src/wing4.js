// Wing 4's systems (0.5), made and run in one place so main.js stays short:
// St. Agnes's pieces in the chapel (part A), and the ways to stay unheard in
// the basement (part B): holding your breath, throwing, easing doors open,
// and Dr. Venn, who hears it all; Sam, who knocks where he is; Nora on his
// table (part C).
import { createAgnesPieces } from './ai/agnesPieces.js';
import { createBreath } from './player/breath.js';
import { createThrowing } from './player/throwing.js';
import { createDoorDrag } from './levels/doorDrag.js';
import { createSurgeon } from './ai/surgeon.js';
import { createSam } from './ghosts/sam.js';
import { createNoraTable } from './ai/noraTable.js';
import { createNoraFollow } from './ai/noraFollow.js';

export function createWingFour(game) {
  game.agnes = createAgnesPieces(game, game.watcher); // in the chapel: her pieces given back
  game.breath = createBreath(game); // Space: no breath sound for a while, then a gasp
  game.throwing = createThrowing(game); // G: a bottle or a stone, and a noise where it lands
  game.doorDrag = createDoorDrag(game); // doors that shout: drag to ease them, or they bang
  game.surgeon = createSurgeon(game); // Dr. Venn, the blind hunter (in game.enemies: the overlay, the flash)
  game.sam = createSam(game); // Sam in the boiler room: his knocks say where Dr. Venn is
  game.nora = createNoraTable(game); // Nora on his table (part C): undo her straps, or walk out without her
  game.noraFollow = createNoraFollow(game); // free, she follows you out, one pace louder than you

  // Every frame of play, after the player has moved.
  function update(dt, input) {
    game.agnes.update(dt);
    game.breath.update(dt, input);
    game.throwing.update(dt, input);
    game.doorDrag.update(dt, input);
    game.surgeon.update(dt);
    game.sam.update(dt);
    game.nora.update(dt);
    game.noraFollow.update(dt);
  }

  return { update };
}
