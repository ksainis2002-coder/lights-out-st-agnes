// Fake children seen at low sanity (approved still: low_sanity). They are
// tricks of the mind: they never touch, never block, never drain sanity, and
// have learnable tells — no sound at all, and they flicker (a steady fade
// with flicker off). Looking straight at one, or walking close, makes it go.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';

const START_BELOW = 40;
const LOOK_AWAY_ANGLE = 0.14; // radians from the centre of view
const VANISH_DISTANCE = 3;

function openSpotAhead(game, camera) {
  const { level } = game.world;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  const yaw = Math.atan2(forward.x, forward.z) + (Math.random() - 0.5) * 2.2;
  const distance = 5 + Math.random() * 3;
  const steps = Math.ceil(distance / 0.25);
  let last = null;
  for (let i = 1; i <= steps; i++) {
    const x = camera.position.x + Math.sin(yaw) * i * 0.25;
    const z = camera.position.z + Math.cos(yaw) * i * 0.25;
    const cell = level.worldToCell(x, z);
    if (level.isSolid(cell.col, cell.row)) break;
    last = { x, z };
  }
  return last && Math.hypot(last.x - camera.position.x, last.z - camera.position.z) > 4 ? last : null;
}

export function createHallucinations(game) {
  let ghost = null;
  let nextIn = 15;
  let shown = 0;

  function remove() {
    ghost?.parent?.remove(ghost);
    ghost = null;
  }

  function spawn(camera) {
    let spot = null;
    for (let tries = 0; tries < 8 && !spot; tries++) spot = openSpotAhead(game, camera);
    if (!spot) return;
    ghost = PROPS.ghostChild(game.world.textures, { opacity: 0.35 });
    ghost.position.set(spot.x, 0, spot.z);
    ghost.rotation.y = Math.atan2(camera.position.x - spot.x, camera.position.z - spot.z);
    ghost.userData = { age: 0, life: 2.5 + Math.random() * 1.5, fake: true };
    game.world.levelGroup.add(ghost);
    shown += 1;
    game.events.emit('hallucination.shown');
  }

  function fadeTo(opacity) {
    ghost.traverse((o) => {
      if (o.material) o.material.opacity = opacity;
    });
  }

  function update(dt, sanity, camera) {
    if (ghost) {
      ghost.userData.age += dt;
      const toGhost = new THREE.Vector3(ghost.position.x - camera.position.x, 0, ghost.position.z - camera.position.z);
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      const looked = toGhost.angleTo(forward) < LOOK_AWAY_ANGLE;
      if (looked || toGhost.length() < VANISH_DISTANCE || ghost.userData.age > ghost.userData.life) return remove();
      const flicker = game.settings.get('flickerOff') ? 1 : 0.6 + 0.4 * Math.random();
      fadeTo(0.35 * flicker);
      return;
    }
    if (sanity >= START_BELOW) return;
    nextIn -= dt;
    if (nextIn > 0) return;
    const comfort = game.settings.get('comfortMode') ? 2 : 1;
    nextIn = (10 + Math.random() * 15) * comfort * (0.5 + sanity / START_BELOW);
    spawn(camera);
  }

  return { update, remove, active: () => ghost, shown: () => shown };
}
