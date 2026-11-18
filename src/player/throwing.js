// Throwing (0.5, part B; the wing 4 content sheet): the throw key (G) throws
// what you are holding, a bottle or a stone; with something else selected,
// the first one you carry. It flies from your eyes the way you look, drops,
// and where it hits the floor or a wall it lands with a noise that carries
// (a bottle 14 m, a stone 10 m): Dr. Venn goes where it lands. The landing
// has its sound subtitle ("(glass breaks, over there)").
//   events.emit('noise', { x, z, radius, kind: 'bottle' | 'stone', thrown: true })
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { itemDef } from '../items/catalog.js';

const SPEED = 7.5; // metres a second, the way you look
const LIFT = 1.6; // metres a second upwards, so it arcs
const GRAVITY = 9.8;
const MAX_FLIGHT = 3; // seconds: it has landed by then, whatever it hit
const SPIN = 9; // radians a second, end over end
const CAPTION = { speaker: null, whisper: false, seconds: 3 };
const LANDED = { bottle: 'caption.bottleLands', stone: 'caption.stoneLands' };

export const isThrowable = (item) => Boolean(item && itemDef(item)?.throwable);

export function createThrowing(game) {
  const flying = []; // { item, mesh, velocity, t }
  const forward = new THREE.Vector3();

  // What G throws: the selected item if it can be thrown, else the first that can.
  function choice() {
    const selected = game.inventory.selectedItem();
    return isThrowable(selected) ? selected : game.inventory.items().find(isThrowable) ?? null;
  }

  function hitsWall(level, p) {
    const size = level.cellSize;
    return level.isSolid(Math.floor(p.x / size), Math.floor(p.z / size));
  }

  function land(shot, at) {
    shot.mesh.parent?.remove(shot.mesh);
    game.events.emit('noise', { x: at.x, z: at.z, radius: itemDef(shot.item).throwable.radius, kind: shot.item, thrown: true });
    game.events.emit('throw.landed', { item: shot.item, position: at.clone() });
    game.subtitles.show(LANDED[shot.item], CAPTION);
  }

  function throwOne() {
    const item = choice();
    if (!item) return false;
    game.inventory.remove(item);
    const { camera, levelGroup, textures } = game.world;
    camera.getWorldDirection(forward);
    const mesh = PROPS[itemDef(item).throwable.model](textures);
    mesh.position.copy(camera.position).addScaledVector(forward, 0.35);
    levelGroup.add(mesh);
    flying.push({ item, mesh, velocity: forward.clone().multiplyScalar(SPEED).add(new THREE.Vector3(0, LIFT, 0)), t: 0 });
    game.events.emit('throw.thrown', { item });
    return true;
  }

  function fly(shot, dt) {
    const level = game.world.level;
    const from = shot.mesh.position.clone();
    shot.t += dt;
    shot.velocity.y -= GRAVITY * dt;
    shot.mesh.position.addScaledVector(shot.velocity, dt);
    shot.mesh.rotation.x += SPIN * dt;
    const p = shot.mesh.position;
    if (hitsWall(level, p)) {
      land(shot, from.setY(0.05)); // it struck a wall: it drops where it struck
      return true;
    }
    if (p.y > 0.05 && shot.t < MAX_FLIGHT) return false;
    land(shot, p.clone().setY(0.05));
    return true;
  }

  function update(dt, input) {
    if (input.wasPressed('throw') && !game.hiding.active() && !game.inventory.isOpen()) throwOne();
    for (let i = flying.length - 1; i >= 0; i--) if (fly(flying[i], dt)) flying.splice(i, 1);
  }

  game.events.on('level.loaded', () => flying.splice(0)); // a level's meshes go with it

  return { update, throwOne, flying: () => flying.length, choice };
}
