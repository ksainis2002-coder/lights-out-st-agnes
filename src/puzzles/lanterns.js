// Puzzle 5 (cemetery, in the storm; approved stills lanterns, lanterns_lit,
// lanterns_out, agnes_slab): a lantern at the foot of each child's grave, lit
// with the matches in the order the children were struck off the roll
// (Agnes, Thomas Hale, Margaret Rowe, Samuel Pike, Edith Carr on Normal; the
// art room's painting has them in the same order). One out of turn catches,
// then the flames shrink and go out, all of them, smoke rising. All five:
// stone grinds and Agnes's slab slides aside on the stone lamb (statue piece
// 2) and T. Hale's file page 2, which appear with the solved flag.
// Level data: "lanterns": { "lanterns": ["lantern_agnes", …] (in the order of
//   the roll), "item": "matches", "slab": "agnes_slab" }
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { findProp } from '../props/place.js';
import { setLanternLit } from '../props/outdoors.js';

export const SOLVED = 'puzzle_lanterns';
const LIT = 'lanterns_lit'; // progress value: how many burn, from the first on the roll
const CATCH = 0.7; // seconds a wrong lantern burns before they all go out
const SMOKE = 4; // seconds the smoke rises and thins
const SLIDE = 1.6; // seconds the slab takes to slide aside

// The slab's lid from where it lay to where the open slab has it.
function slideLid(world, slab) {
  const lid = slab.getObjectByName('lid');
  const end = { x: lid.position.x, ry: lid.rotation.y, rz: lid.rotation.z };
  let t = 0;
  world.animate((dt) => {
    t = Math.min(1, t + dt / SLIDE);
    const k = t * t * (3 - 2 * t);
    lid.position.x = end.x * k;
    lid.rotation.set(0, end.ry * k, end.rz * k);
    return t < 1;
  });
}

// Grey wisps over each lantern, rising and thinning, then gone.
function smoke(world, lanterns) {
  const wisps = lanterns.map((lantern) => {
    const wisp = PROPS.lanternSmoke(world.textures);
    wisp.position.copy(lantern.position);
    world.levelGroup.add(wisp);
    return wisp;
  });
  let t = 0;
  world.animate((dt) => {
    t += dt / SMOKE;
    wisps.forEach((wisp) => {
      wisp.position.y = t * 0.4;
      wisp.scale.setScalar(1 - t * 0.5);
      wisp.visible = t < 1;
    });
    if (t < 1) return true;
    wisps.forEach((wisp) => world.levelGroup.remove(wisp));
    return false;
  });
}

export function lanternsPuzzle(game, level, data) {
  const { progress, world } = game;
  const lanterns = data.lanterns.map((id) => findProp(world.levelGroup, id));
  lanterns.forEach((lantern) => lantern.updateWorldMatrix(true, false));
  let slab = findProp(world.levelGroup, data.slab);
  let catching = false; // a wrong lantern burning, about to fail

  const lit = () => (progress.hasFlag(SOLVED) ? lanterns.length : progress.getValue(LIT, 0));
  const show = (count = lit()) => lanterns.forEach((lantern, i) => setLanternLit(lantern, world.textures, i < count));

  function openSlab({ slide }) {
    const open = PROPS.graveSlab(world.textures, { open: true, empty: true });
    open.position.copy(slab.position);
    open.rotation.copy(slab.rotation);
    open.userData = slab.userData;
    slab.parent.add(open);
    slab.parent.remove(slab);
    slab = open;
    if (slide) slideLid(world, open);
  }

  show();
  if (progress.hasFlag(SOLVED)) openSlab({ slide: false });

  function solve() {
    progress.setFlag(SOLVED);
    openSlab({ slide: true });
    game.messages.show('msg.lanternsSolved', null, 5);
    game.events.emit('lanterns.solved', { position: slab.getWorldPosition(new THREE.Vector3()) });
    game.events.emit('puzzle.solved', 'lanterns');
    game.events.emit('checkpoint');
  }

  // One out of turn: it catches, then they all shrink and go out.
  function fail(index) {
    catching = true;
    lanterns.forEach((lantern, i) => setLanternLit(lantern, world.textures, i < lit() || i === index));
    let t = 0;
    world.animate((dt) => {
      t += dt;
      if (t < CATCH) return true;
      catching = false;
      progress.setValue(LIT, 0);
      show();
      smoke(world, lanterns);
      game.messages.show('msg.lanternsOut', null, 4);
      game.events.emit('lanterns.out');
      return false;
    });
  }

  function light(index) {
    if (catching || progress.hasFlag(SOLVED) || index < lit()) return;
    if (!game.hasItem(data.item)) {
      game.messages.show('msg.lanternNoMatches', null, 3);
      return;
    }
    game.events.emit('lantern.lit', { index, position: lanterns[index].getWorldPosition(new THREE.Vector3()) });
    if (index !== lit()) return fail(index);
    progress.setValue(LIT, lit() + 1);
    show();
    if (lit() === lanterns.length) solve();
  }

  return lanterns.map((lantern, index) => ({
    position: lantern.localToWorld(new THREE.Vector3(0, 0.15, 0)),
    radius: 0.3,
    prompt: () => (catching || progress.hasFlag(SOLVED) || index < lit() ? null : { key: 'prompt.lightLantern' }),
    use: () => light(index),
  }));
}
