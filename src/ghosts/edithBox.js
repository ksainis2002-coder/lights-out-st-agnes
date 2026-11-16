// Edith's music box (wing 3, puzzle 4; the content sheet): the case (by
// Maggie's bed), the cylinder (the dispensary cabinet) and the key (Sister
// M.'s trunk), mended on her bed. Close to her with a part she has not named
// yet, she knows it: one line for each part, once. With all three, "Give to
// Edith": the box is whole and plays in her lap (approved still box_mended),
// she tells you to take it, and it waits there for you (a pickup that
// "appearsWith": music_box_mended). Taking it starts the way out
// (levels/wayOut.js). A checkpoint once it is mended.
// Level data: "edith": { …, "box": { "parts": [item ids],
//   "lines": { "<item>": "<line key>" }, "whole": [line keys] } }
import * as THREE from 'three';
import { roomAt } from '../levels/loader.js';

export const MENDED = 'music_box_mended';
const NEAR = 3.2; // metres: as close as meeting her
const TRIED = 'tried_musicBox'; // her hint for the box waits on this (level data "hints")

export function createEdithBox(game) {
  const { progress, inventory } = game;
  const box = () => game.world.level?.edith?.box ?? null;
  const carriesAll = () => box().parts.every((item) => inventory.has(item));

  // Close to her with a part she has not named yet.
  function notice() {
    const data = box();
    const at = data && game.edith.at();
    if (!at || !progress.hasFlag('edith_met') || progress.hasFlag(MENDED)) return;
    const level = game.world.level;
    const p = game.player.state.position;
    if (roomAt(level, p) !== level.edith.room || Math.hypot(p.x - at.x, p.z - at.z) > NEAR) return;
    const fresh = data.parts.filter((item) => inventory.has(item) && !progress.hasFlag(`edith_knew_${item}`));
    if (!fresh.length) return;
    fresh.forEach((item) => progress.setFlag(`edith_knew_${item}`));
    progress.setFlag(TRIED);
    game.edith.tell(fresh.map((item) => data.lines[item]));
  }

  function mend() {
    const data = box();
    data.parts.forEach((item) => inventory.remove(item));
    progress.setFlag(MENDED);
    game.edith.showBox('none'); // the box is a real thing now, in her hands
    game.edith.tell(data.whole);
    game.events.emit('puzzle.solved', 'music_box'); // shows it in her lap (items/pickups.js) and notes the clue
    game.events.emit('musicBox.mended', { position: game.edith.at() });
    game.events.emit('checkpoint');
  }

  const giving = {
    position: new THREE.Vector3(),
    radius: 0.55,
    prompt: () => (box() && !progress.hasFlag(MENDED) && carriesAll() ? { key: 'prompt.giveEdith' } : null),
    use: mend,
  };

  game.interaction.addSource(() => {
    const at = box() && game.edith.at();
    if (!at) return [];
    giving.position.set(at.x, at.y + 0.2, at.z);
    return [giving];
  });

  return { update: notice };
}
