// The crypt's plaques (0.5 part A; approved still crypt; the wing 4 content
// sheet): five memorial plaques in the crypt wall, one for each child struck
// off the roll, set out of the roll's order. Pushed home in the roll's order
// (Agnes, Thomas Hale, Margaret Rowe, Samuel Pike, Edith Carr: wing 2's
// roll), the slab beside them grinds aside on the niche where her stone heart
// is (its pickup appears with the solved flag). One out of turn goes in, then
// they all grind back out of the wall; from the second wrong try Tommy
// whispers the rule now and then. The first push of his own plaque gives
// T. Hale's line; once the slab is aside, his line on what is in the niche.
// Level data: "plaques": { "plaques": ["plaque_agnes", …] (the roll's order),
//   "slab": "niche_slab" (it grinds aside and stays there), "hintAfter": 2,
//   "hint": "<whisper key>", "tommy": "plaque_tommy" }
import * as THREE from 'three';
import { findProp } from '../props/place.js';

export const SOLVED = 'puzzle_plaques';
const PUSHED = 'plaques_pushed'; // progress value: how many are home, from the first on the roll
const WRONG = 'plaques_wrong'; // progress value: wrong tries so far
const TOMMY = 'seen_plaque_tommy';
const DEPTH = 0.03; // metres a plaque goes into the wall
const BACK_AFTER = 0.6; // seconds a wrong plaque stays in before they all come out
const SLIDE = 1.4; // seconds the slab takes to grind aside
const ASIDE = [-0.7, 0, 0]; // where the open slab stands: beside the niche, as in the approved still
const HINT_EVERY = 3; // after the first hint, again every third wrong try
const CAPTION = { speaker: null, whisper: false, seconds: 3.5 };

export function plaquesPuzzle(game, level, data) {
  const { progress, world } = game;
  const plaques = data.plaques.map((id) => findProp(world.levelGroup, id));
  plaques.forEach((plaque) => plaque.updateWorldMatrix(true, false));
  const out = plaques.map((plaque) => plaque.position.clone());
  const inward = plaques.map((plaque) => new THREE.Vector3(0, 0, -DEPTH).applyQuaternion(plaque.quaternion));
  const slab = findProp(world.levelGroup, data.slab);
  const shut = slab?.position.clone();
  const aside = slab && new THREE.Vector3(...ASIDE).applyQuaternion(slab.quaternion);
  let busy = false; // a wrong plaque in, about to come out with the others

  const pushed = () => (progress.hasFlag(SOLVED) ? plaques.length : progress.getValue(PUSHED, 0));
  const setIn = (index, home) => plaques[index].position.copy(out[index]).add(home ? inward[index] : new THREE.Vector3());
  const show = () => plaques.forEach((_, i) => setIn(i, i < pushed()));
  show();
  if (slab && progress.hasFlag(SOLVED)) slab.position.copy(shut).add(aside);

  // The slab grinds aside along the wall, then he sees what was behind it.
  function slideSlab() {
    let t = 0;
    world.animate((dt) => {
      t = Math.min(1, t + dt / SLIDE);
      slab.position.copy(shut).addScaledVector(aside, t * t * (3 - 2 * t));
      if (t < 1) return true;
      game.messages.show('msg.cryptNiche', null, 5);
      return false;
    });
  }

  function solve() {
    progress.setFlag(SOLVED);
    if (slab) slideSlab();
    else game.messages.show('msg.cryptNiche', null, 5);
    game.subtitles.show('caption.nicheOpens', CAPTION);
    game.events.emit('puzzle.solved', 'plaques');
    game.events.emit('checkpoint');
  }

  function wrong() {
    const tries = progress.getValue(WRONG, 0) + 1;
    progress.setValue(WRONG, tries);
    progress.setValue(PUSHED, 0);
    show();
    game.subtitles.show('caption.plaquesBack', CAPTION);
    game.events.emit('plaques.reset', { position: plaques[0].getWorldPosition(new THREE.Vector3()) });
    const after = data.hintAfter ?? 2;
    if (data.hint && tries >= after && (tries - after) % HINT_EVERY === 0) game.subtitles.show(data.hint, { speaker: 'tommy', seconds: 4 });
  }

  function push(index) {
    if (busy || progress.hasFlag(SOLVED) || index < pushed()) return;
    setIn(index, true);
    game.events.emit('plaque.pushed', { position: plaques[index].getWorldPosition(new THREE.Vector3()) });
    if (data.plaques[index] === data.tommy && !progress.hasFlag(TOMMY)) {
      progress.setFlag(TOMMY);
      game.messages.show('msg.plaqueTommy', null, 5);
    }
    if (index !== pushed()) {
      busy = true;
      let t = 0;
      world.animate((dt) => {
        t += dt;
        if (t < BACK_AFTER) return true;
        busy = false;
        wrong();
        return false;
      });
      return;
    }
    progress.setValue(PUSHED, pushed() + 1);
    if (pushed() === plaques.length) solve();
  }

  return plaques.map((plaque, index) => ({
    position: plaque.localToWorld(new THREE.Vector3(0, 1.24, 0.06)), // low on its face: the prompt stays under the name
    radius: 0.25,
    prompt: () => (busy || progress.hasFlag(SOLVED) || index < pushed() ? null : { key: 'prompt.pushPlaque' }),
    use: () => push(index),
  }));
}
