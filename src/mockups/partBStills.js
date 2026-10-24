// Proposal stills for 0.3 part B, the school's first floor (owner
// 2026-10-24: "Start part B stills"), on the mockup level written by
// tools/levels/school_part_b.py: coming up the main stairs to the corridor and
// its bell; the bell ringing with every door banged open; the roll call in
// Classroom 3; Classroom 4 with the projector, and the film; the headmaster's
// office and his flat; the first-floor plan in the journal. Since 0.2.31 they
// stage the game's own level (src/levels/school_upper.json).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { projectorBeam } from '../props/upstairs.js';
import { findProp } from '../props/place.js';
import { aim } from './helpers.js';
import { createJournalScreen } from '../ui/screens/journal.js';
import { i18n } from '../i18n/index.js';
import upper from '../levels/school_upper.json';

const CELL = upper.cellSize;
const world3 = ([col, row], y = 0) => new THREE.Vector3(col * CELL, y, row * CELL);

// Aims the camera from a cell (eye height y) towards a point (cells, height).
function look({ camera }, from, to, y = 1.6, toY = 1.4, roll = 0) {
  const eye = world3(from, y);
  const target = world3(to, toY);
  const yaw = Math.atan2(-(target.x - eye.x), -(target.z - eye.z));
  const pitch = Math.atan2(target.y - eye.y, Math.hypot(target.x - eye.x, target.z - eye.z));
  aim(camera, [eye.x, eye.y, eye.z], (yaw * 180) / Math.PI, (pitch * 180) / Math.PI, roll);
}

// A prop placed like the level's own, added for one still.
function add(world, type, at, rotation = 0, options = {}, y = 0) {
  const object = PROPS[type](world.textures, options);
  object.position.copy(world3(at, y));
  object.rotation.y = (rotation * Math.PI) / 180;
  world.scene.add(object);
  return object;
}

// Every door swung open, each a little further than the last (banged open).
function bangDoorsOpen(world) {
  world.doors.panels.forEach(({ door, hinge }, i) => {
    door.open = true;
    door.angle = -Math.PI / 2 * (0.62 + 0.12 * (i % 3));
    hinge.rotation.y = door.angle;
  });
}

// The room's lamps out, only a little night through the blinds.
function lightsOut(world, keep = () => false) {
  world.levelGroup.traverse((object) => {
    if (object.isPointLight && !keep(object)) object.intensity = 0;
    if (object.isAmbientLight) object.intensity = 0.22;
  });
}

// Classroom 4 with the film running: lamps out, the screen lit, the beam.
function filmRunning(world) {
  if (world.flashlight.isOn()) world.flashlight.toggle();
  const screen = findProp(world.levelGroup, 'film_screen');
  screen.visible = false;
  const lit = add(world, 'projectorScreen', [screen.position.x / CELL, screen.position.z / CELL], 90, { film: true });
  lightsOut(world);
  const glow = new THREE.PointLight(0xc8ccd0, 2.6, 9, 1.0); // the screen's light on the desks
  glow.position.set(screen.position.x + 1.2, 1.7, screen.position.z);
  world.scene.add(glow);
  const projector = findProp(world.levelGroup, 'projector');
  projector.updateWorldMatrix(true, true);
  lit.updateWorldMatrix(true, true);
  world.scene.add(projectorBeam(projector.localToWorld(new THREE.Vector3(-0.02, 1.02, 0.3)), lit.localToWorld(new THREE.Vector3(0, 1.75, 0.08))));
}

// The roll call: a faint pupil at every desk but one, heads turned to the
// door. The empty desk is the one nearest you.
const EMPTY_DESK = 0;
function rollCall(world, eye) {
  const desks = upper.props.filter((prop) => prop.type === 'schoolDesk' && prop.at[0] < 17);
  desks.forEach((desk, i) => {
    if (i === EMPTY_DESK) return;
    const at = world3(desk.at);
    const facing = ((desk.rotation ?? 0) * Math.PI) / 180;
    const toEye = Math.atan2(eye.x - at.x, eye.z - at.z);
    add(world, 'ghostPupil', desk.at, desk.rotation ?? 0, { opacity: 0.42, turn: toEye - facing });
  });
}

// The journal's MAPS page with the first-floor plan.
function upstairsMap(ctx) {
  const t = (key, params) => i18n.t(key, params);
  const game = {
    journal: { maps: () => ['school_upper'], clues: () => [], documents: () => [] },
    world: { level: { id: 'school_upper', wing: 'school' } },
    player: { state: { position: { x: 28.0 * CELL, z: 11.2 * CELL } } },
    progress: { hasFlag: () => false },
    i18n,
    settings: { get: () => ({ hold: 'KeyH', journal: 'KeyJ', map: 'KeyM' }) },
    sanity: { value: () => 80 },
  };
  createJournalScreen({ t, game }, { tab: 'maps' }).draw(ctx);
}

export const PART_B_STILLS = {
  // Coming up the main stairs: the first-floor corridor, the bell high on the wall ahead.
  upstairs_corridor: {
    level: upper,
    setup: ({ world }) => look(world, [27.6, 11.6], [19.0, 10.6], 1.6, 1.8),
  },
  // The head of the main stairs from the corridor: the flight falls away into
  // the dark (the black doorway seen from below in the hall).
  stairs_down: {
    level: upper,
    setup: ({ world }) => look(world, [28.0, 12.45], [28.0, 14.2], 1.6, -1.2),
  },
  // The bell rings with nobody there, and the doors bang open one after another.
  bell: {
    level: upper,
    setup({ world, fx }) {
      const bell = findProp(world.levelGroup, 'school_bell');
      bell.visible = false;
      add(world, 'schoolBell', [bell.position.x / CELL, bell.position.z / CELL], 0, { ringing: true });
      bangDoorsOpen(world);
      look(world, [23.0, 11.3], [14.0, 10.9], 1.6, 1.7, -4);
      Object.assign(fx, { aberration: 0.8, vignette: 0.35 });
    },
  },
  // Classroom 3, the roll call: the desks fill with faint pupils, blurred
  // faces and black eyes, and they all turn to look at you.
  roll_call: {
    level: upper,
    setup({ world, fx }) {
      const eye = world3([12.6, 13.2], 1.6);
      rollCall(world, eye);
      look(world, [12.6, 13.2], [13.2, 17.4], 1.6, 0.8);
      Object.assign(fx, { vignette: 0.45, aberration: 0.6 });
    },
  },
  // Classroom 4: blinds down, the screen pulled down over the board, the
  // projector on its trolley at the back.
  class4: {
    level: upper,
    setup: ({ world }) => look(world, [25.6, 16.6], [18.0, 15.8], 1.6, 1.3),
  },
  // The film: silent, scratched, children in a line; one face turns to the camera.
  projector_film: {
    level: upper,
    setup({ world, fx }) {
      filmRunning(world);
      look(world, [21.6, 17.3], [18.0, 15.95], 1.5, 1.6);
      Object.assign(fx, { vignette: 0.5 });
    },
  },
  // The headmaster's office: his desk and lamp, the inspector's report, the
  // records cabinet with its number lock, the Founder's portrait.
  head_office: {
    level: upper,
    setup: ({ world }) => look(world, [33.6, 8.7], [30.6, 4.6], 1.6, 1.1),
  },
  // His flat, behind a door in the office: the bed, the doctor's letter by the
  // lamp, the armchair and the gramophone by the window.
  head_flat: {
    level: upper,
    setup: ({ world }) => look(world, [42.5, 8.6], [38.6, 4.7], 1.6, 0.8),
  },
  // The first-floor plan in the journal (found in the staff room).
  ui_map_upstairs: {
    level: upper,
    setup: ({ world }) => look(world, [27.6, 11.6], [19.0, 10.6]),
    ui: upstairsMap,
  },
};
