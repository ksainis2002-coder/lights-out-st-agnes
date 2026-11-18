// The boiler room's three valves (0.5, part B; approved still sam; the wing 4
// content sheet and the stoker's log: "red shut, then blue open, then brass
// open. In that order."). Each wheel turns once. Out of that order the water
// bubbles back up through the drain and the wheels go back as they were; in
// it, the flood drains away with a long gurgle, the boiler roars back to
// life, and what lay under the water can be seen (pickups that appear with
// the solved flag: Sam's tin soldier). The first wheel you touch, the line
// about them. Level data:
//   "valves": { "wheels": ["valve_red", "valve_blue", "valve_brass"] (in the order to turn them),
//               "flood": "<prop id>", "boiler": "<prop id>" }
import * as THREE from 'three';
import { findProp } from '../props/place.js';
import { PROPS } from '../props/catalog.js';

export const SOLVED = 'puzzle_valves';
const TURNED = 'valves_turned'; // progress value: how many are turned, in order
const SEEN = 'said_msg.valves';
const PROMPTS = ['prompt.turnRed', 'prompt.turnBlue', 'prompt.turnBrass'];
const TURN = Math.PI * 1.5; // radians a wheel turns
const TURN_SECONDS = 0.9;
const DRAIN = 5; // seconds the flood takes to go
const ROAR_AFTER = 1.2; // seconds after the water is gone
const CAPTION = { speaker: null, whisper: false, seconds: 3.5 };

export function valvesPuzzle(game, level, data) {
  const { progress, world } = game;
  const wheels = data.wheels.map((id) => findProp(world.levelGroup, id));
  wheels.forEach((wheel) => wheel.updateWorldMatrix(true, true));
  const spins = wheels.map((wheel) => wheel.getObjectByName('spin'));
  let busy = false;

  const turned = () => (progress.hasFlag(SOLVED) ? wheels.length : progress.getValue(TURNED, 0));
  const show = () => spins.forEach((spin, i) => (spin.rotation.z = i < turned() ? TURN : 0));

  function spinTo(index, to, then) {
    const spin = spins[index];
    const from = spin.rotation.z;
    let t = 0;
    world.animate((dt) => {
      t = Math.min(1, t + dt / TURN_SECONDS);
      spin.rotation.z = from + (to - from) * t;
      if (t < 1) return true;
      then?.();
      return false;
    });
  }

  // The boiler lit again, where the cold one stood.
  function lightBoiler() {
    const cold = findProp(world.levelGroup, data.boiler);
    if (!cold) return;
    const lit = PROPS.boiler(world.textures, { lit: true });
    lit.position.copy(cold.position);
    lit.rotation.copy(cold.rotation);
    lit.userData = cold.userData;
    cold.parent.add(lit);
    cold.parent.remove(cold);
  }

  function drained() {
    const flood = findProp(world.levelGroup, data.flood);
    if (flood) flood.visible = false;
    lightBoiler();
  }

  function drain() {
    const flood = findProp(world.levelGroup, data.flood);
    const top = flood?.position.y ?? 0;
    game.subtitles.show('caption.floodDrains', CAPTION);
    game.events.emit('valves.draining', { position: wheels[0].getWorldPosition(new THREE.Vector3()) });
    let t = 0;
    world.animate((dt) => {
      t += dt;
      if (flood) flood.position.y = top - 0.44 * Math.min(1, t / DRAIN);
      if (t < DRAIN + ROAR_AFTER) return true;
      drained();
      game.subtitles.show('caption.boilerRoars', CAPTION);
      game.events.emit('valves.roar', { position: findProp(world.levelGroup, data.boiler)?.getWorldPosition(new THREE.Vector3()) });
      return false;
    });
  }

  function solve() {
    progress.setFlag(SOLVED);
    drain();
    game.events.emit('puzzle.solved', 'valves');
    game.events.emit('checkpoint');
  }

  // Out of order: the water comes back up, and the wheels with it.
  function wrong(index) {
    busy = true;
    spinTo(index, TURN, () => {
      game.subtitles.show('caption.valvesWrong', CAPTION);
      game.events.emit('valves.wrong', { position: wheels[index].getWorldPosition(new THREE.Vector3()) });
      progress.setValue(TURNED, 0);
      spins.forEach((_, i) => spins[i].rotation.z > 0 && spinTo(i, 0));
      busy = false;
    });
  }

  function turn(index) {
    if (busy || progress.hasFlag(SOLVED) || index < turned()) return;
    if (!progress.hasFlag(SEEN)) {
      progress.setFlag(SEEN);
      game.messages.show('msg.valves', null, 5);
    }
    game.events.emit('valves.turn', { position: wheels[index].getWorldPosition(new THREE.Vector3()) });
    if (index !== turned()) return wrong(index);
    progress.setValue(TURNED, turned() + 1);
    busy = true;
    spinTo(index, TURN, () => {
      busy = false;
      if (turned() === wheels.length) solve();
    });
  }

  show();
  if (progress.hasFlag(SOLVED)) drained();

  return wheels.map((wheel, index) => ({
    position: wheel.localToWorld(new THREE.Vector3(0, 1.3, 0.22)),
    radius: 0.3,
    prompt: () => (busy || progress.hasFlag(SOLVED) || index < turned() ? null : { key: PROMPTS[index] }),
    use: () => turn(index),
  }));
}
