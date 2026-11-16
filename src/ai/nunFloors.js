// Sister M. between floors (owner pick: she walks her round on both floors
// and follows you up and down). Once her round has begun, changing floor
// leaves her behind for a while: FOLLOW seconds after you arrive (comfort
// mode: half as long again) she comes off the same stairs and walks that
// floor. Her beads are heard on the stairs 5 s before, and she never steps
// off them on top of you. Which floor she walks is saved (nun_floor).
// Level data, "nun": "arrivals": { "<spawn>": [c, r] }: where she comes off
// each stairs, by the spawn you arrive at.
// A pickup with "summons": true brings her when it is taken (the stone palm,
// part C): her beads at once, far off; on this floor she walks straight to the
// spot; on the other she comes up the stairs soon after, then walks there.
// Comfort mode: she starts further away (later).
import * as THREE from 'three';
import { WALKING, FLOOR } from './nun.js';

const FOLLOW = 30; // seconds
const WARN = 5; // her beads on the stairs, this long before
const CLEAR = 3; // metres: not onto you
const SUMMONED = 8; // seconds before she comes off the stairs when something has drawn her (comfort: 16)

export function createNunFloors(game, nun) {
  let spawn = null; // the spawn you last travelled to
  let follow = null; // { at: [c, r], t, warned }

  function loaded(level) {
    follow = null;
    const data = level.nun;
    if (!data?.arrivals || !game.progress.hasFlag(WALKING)) return;
    if (game.progress.getValue(FLOOR, 'wards_ground') === level.id) return; // she is here already
    const at = data.arrivals[spawn] ?? Object.values(data.arrivals)[0];
    follow = { at, t: 0, warned: false };
  }

  function update(dt) {
    if (!follow) return;
    follow.t += dt;
    const size = game.world.level.cellSize;
    const spot = new THREE.Vector3(follow.at[0] * size, 0, follow.at[1] * size);
    const due = FOLLOW * (game.settings.get('comfortMode') ? 1.5 : 1);
    if (!follow.warned && follow.t >= due - WARN) {
      follow.warned = true;
      game.events.emit('nun.beads', { position: spot.clone() });
      game.events.emit('nun.onStairs', { position: spot.clone() });
    }
    if (follow.t < due) return;
    const p = game.player.state.position;
    if (Math.hypot(spot.x - p.x, spot.z - p.z) < CLEAR) return;
    nun.arrive(follow.at);
    if (follow.then) nun.summon(follow.then);
    follow = null;
    game.events.emit('nun.followed');
  }

  function summoned(pickup) {
    const level = game.world.level;
    if (!pickup.summons || !level.nun || !game.progress.hasFlag(WALKING)) return;
    const point = new THREE.Vector3(pickup.at[0] * level.cellSize, 0, pickup.at[1] * level.cellSize);
    if (nun.state().active) {
      const her = nun.position();
      game.events.emit('nun.beads', { position: her });
      nun.summon(point);
      return;
    }
    const at = level.nun.arrivals?.[spawn] ?? Object.values(level.nun.arrivals ?? {})[0];
    if (!at) return;
    const due = FOLLOW * (game.settings.get('comfortMode') ? 1.5 : 1);
    const wait = SUMMONED * (game.settings.get('comfortMode') ? 2 : 1);
    follow = { at, t: due - wait, warned: false, then: point };
    game.events.emit('nun.beads', { position: new THREE.Vector3(at[0] * level.cellSize, 0, at[1] * level.cellSize) }); // at once, far off
  }

  game.events.on('item.taken', summoned);
  game.events.on('level.leaving', (to) => (spawn = to.spawn));
  game.events.on('level.loaded', loaded);
  game.events.on('game.stopped', () => (follow = null));

  return { update, following: () => (follow ? Math.max(0, FOLLOW - follow.t) : null) };
}
