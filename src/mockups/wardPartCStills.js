// Mockup stills for 0.4 part C, the end of the west wing: Sister M.'s room,
// her shrine (the one light she allows, before the stone palm), her trunk
// open (the confession, the music box's key), Edith with her box mended, the
// way out with every lamp dead, and your own room after the wing.
// Text here is mockup copy, not game text (game text goes through i18n).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { look, subtitle, message } from './helpers.js';
import { camcorder, usePrompt } from './wardUi.js';
import rooms from './levels/wardRooms.json';
import wards from './levels/wards.json';
import wardsGround from '../levels/wards_ground.json';
import patientRoom from '../levels/patient_room.json';

const CELL = 1.2;

// Props at cell positions: [type, column, row, rotation in degrees, options, height].
function furnish(world, list, size = CELL) {
  list.forEach(([type, c, r, turn = 0, options, y = 0]) => {
    const prop = PROPS[type](world.textures, options);
    prop.position.set(c * size, y, r * size);
    prop.rotation.y = (turn * Math.PI) / 180;
    world.scene.add(prop);
  });
}

const eye = (world, from, to, y = 1.6, toY = 1.1, size = CELL) => look(world, [from[0] * size, from[1] * size], [to[0] * size, to[1] * size], y, toY);

// Her room in the mock's small room (cells 1–4 × 7–10): the bed tight-made
// along the west wall, the trunk at its foot, the kneeler before the crucifix,
// the shrine on the east wall, the window boarded, her spare habit on its peg.
function sisterRoom(world, { open = false } = {}) {
  furnish(world, [
    ['wardBed', 1.45, 7.95, 0, { chart: false }], ['trunk', 1.45, 9.3, 0, { open }], ['crucifix', 3.3, 7, 0, { height: 1.9 }],
    ['prieDieu', 3.3, 7.45, 0], ['sideTable', 4.62, 9.0, -90], ['stonePalm', 4.66, 9.0, -90, {}, 0.6], ['candle', 4.48, 8.84, 0, {}, 0.6],
    ['boardedWindow', 3.2, 11, 180], ['habitPeg', 2.0, 11, 180], ['washstand', 4.98, 7.75, -90],
    ['sootStain', 4.62, 7, 0, { width: 1.0, depth: 1.4, y: 1.9, seed: 5 }],
  ]);
  const cloth = PROPS.sheetPile(world.textures);
  cloth.scale.set(0.3, 0.06, 0.3);
  cloth.position.set(4.64 * CELL, 0.6, 9.0 * CELL);
  world.scene.add(cloth);
}

// The camcorder's night view: no flashlight, its own lamp.
function nightView(world, fx) {
  world.flashlight.toggle();
  const lamp = new THREE.PointLight(0xffffff, 1.8, 14, 1.1);
  lamp.position.copy(world.camera.position);
  world.scene.add(lamp);
  Object.assign(fx, { nightVision: 1, vignette: 0.5 });
}

export const WARD_PARTC_STILLS = {
  // Her room by flashlight from the door: everything in its place, the candle lit.
  sister_room: {
    level: rooms,
    setup({ world, fx }) {
      sisterRoom(world);
      const grey = new THREE.PointLight('#5a6c9c', 3, 9, 1.2); // what comes round the boards
      grey.position.set(3.2 * CELL, 2.2, 10.4 * CELL);
      world.scene.add(grey);
      eye(world, [4.3, 10.6], [2.0, 7.9], 1.6, 0.75);
      Object.assign(fx, { vignette: 0.3 });
    },
  },
  // The shrine, your light off: one candle, and on a white cloth a stone hand.
  sister_shrine: {
    level: rooms,
    setup({ world, fx }) {
      sisterRoom(world);
      world.flashlight.toggle();
      eye(world, [4.2, 9.25], [4.62, 8.98], 0.95, 0.63);
      Object.assign(fx, { vignette: 0.4 });
    },
    ui: (ctx) => usePrompt(ctx, 'CLICK  Take: Stone palm'),
  },
  // The trunk open at the foot of her bed: habits, a folded paper, a little key.
  sister_trunk: {
    level: rooms,
    setup({ world }) {
      sisterRoom(world, { open: true });
      eye(world, [1.9, 10.45], [1.45, 9.3], 1.55, 0.35);
    },
    ui: (ctx) => message(ctx, 'A folded paper, and a little key on a black ribbon.'),
  },
  // Edith on bed 7 with her music box mended: open, playing, warm in her hands.
  box_mended: {
    level: wards,
    setup({ world }) {
      world.flashlight.toggle();
      const her = PROPS.ghostEdith(world.textures, { opacity: 0.7, box: 'open' });
      her.position.set(6.9 * CELL, 0.6, 8.2 * CELL);
      her.rotation.y = (-32 * Math.PI) / 180;
      world.scene.add(her);
      const pale = new THREE.PointLight('#9fb4dc', 1.6, 4.5, 1.3);
      pale.position.set(6.7 * CELL, 1.5, 8.9 * CELL);
      world.scene.add(pale);
      look(world, [5.85 * CELL, 8.45 * CELL], [6.9 * CELL, 8.3 * CELL], 1.3, 0.78); // from her side: sitting on the bed's edge, the box in her lap
    },
    ui: (ctx) => subtitle(ctx, '(Edith, whispering) That’s it. That’s the one my mother wound.'),
  },
  // The way out: every lamp dead, through the night view, Sister M. between you and admissions.
  way_out: {
    level: wardsGround,
    setup({ world, fx }) {
      const her = PROPS.burnedNun(world.textures, { glow: 1 });
      her.position.set(26.6 * CELL, 0, 9.0 * CELL);
      her.rotation.y = -Math.PI / 2; // coming west, towards you
      world.scene.add(her);
      eye(world, [23.5, 8.8], [31, 9], 1.6, 1.4);
      nightView(world, fx);
    },
    ui(ctx) {
      camcorder(ctx);
      subtitle(ctx, '(Edith, whispering) She’s put them all out. She’s coming for yours. Go.');
    },
  },
  // Your room after the west wing: soot spreading from the lamp over the ceiling and down
  // the door, a candle burnt down to nothing on your table, the light weaker still.
  hub_after_wards: {
    level: patientRoom,
    setup({ world }) {
      furnish(world, [
        ['sootStain', 3.0, 3.2, 0, { ceiling: true, width: 2.6, depth: 2.0, height: 2.6, seed: 7 }],
        ['sootStain', 2.5, 6, 180, { width: 1.6, depth: 1.4, y: 1.3, seed: 2 }],
        ['sootStain', 1, 2.4, 90, { width: 1.2, depth: 1.0, y: 1.7, seed: 9 }],
        ['candle', 4.55, 3.45, 0, { lit: false, height: 0.02 }, 0.76],
        ['drawing', 2.2, 1.0, 0, { kind: 'skipping' }],
        ['tileDecay', 1.7, 1.0, 0, { width: 1.8, height: 1.6, y: 1.2, seed: 3 }],
        ['fallenTiles', 1.6, 1.2, 0, { seed: 5 }],
      ], 1);
      world.scene.traverse((object) => {
        if (object.isPointLight) object.intensity *= 0.6;
      });
      world.flashlight.toggle();
      eye(world, [2.6, 5.7], [3.4, 2.6], 1.6, 1.6, 1);
    },
  },
};
