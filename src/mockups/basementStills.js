// Mockup stills for 0.5, wing 4 (docs/DESIGN_0.5.md; owner picks 2026-11-17:
// her stone heart, Dr. Venn the surgeon, Nora on his table): the chapel with
// St. Agnes on her plinth, St. Agnes whole, the crypt, the surgeon in the cold
// corridor, the surgeon listening (with your held breath on the camcorder's
// pulse line), the held breath without the camcorder, Sam in the flooded
// boiler room, the morgue, and Nora on the table. Text here is mockup copy,
// not game text (game text goes through i18n).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { CHILDREN } from '../props/chapel.js';
import { look, subtitle } from './helpers.js';
import { camcorder, usePrompt } from './wardUi.js';
import { osdText } from '../ui/osd.js';
import basement from './levels/basement.json';

const CELL = 1.2;

// Props at cell positions: [type, column, row, rotation in degrees, options, height].
function furnish(world, list) {
  list.forEach(([type, c, r, turn = 0, options, y = 0]) => {
    const prop = PROPS[type](world.textures, options);
    prop.position.set(c * CELL, y, r * CELL);
    prop.rotation.y = (turn * Math.PI) / 180;
    world.scene.add(prop);
  });
}

const eye = (world, from, to, y = 1.6, toY = 1.1) => look(world, [from[0] * CELL, from[1] * CELL], [to[0] * CELL, to[1] * CELL], y, toY);

function light(world, color, intensity, distance, [c, r], y) {
  const l = new THREE.PointLight(color, intensity, distance, 1.3);
  l.position.set(c * CELL, y, r * CELL);
  world.scene.add(l);
}

// The chapel: St. Agnes on her plinth before the altar, the pews, candles.
function chapel(world, { whole = false } = {}) {
  const pews = [5.2, 6.4, 7.6, 8.8, 10.0].flatMap((r) => [['pew', 2.75, r, 180, { length: 2.6 }], ['pew', 6.25, r, 180, { length: 2.6 }]]);
  furnish(world, [
    ['altar', 4.5, 1.9, 0], [whole ? 'statueWhole' : 'statue', 4.5, 3.4, 0], ...pews,
    ['votiveRack', 1.6, 3.6, 90, { lit: 4 }], ['font', 6.9, 11.4, 0], ['nameBoard', 8, 10.6, -90],
    ['windowFrame', 1, 6.0, 90], ['windowFrame', 1, 9.0, 90], ['windowFrame', 8, 6.0, -90], ['windowFrame', 8, 9.0, -90],
  ]);
  light(world, '#7484b4', 4, 14, [4.5, 8], 5.5); // what little comes through the windows
  light(world, '#ffb070', 3.5, 8, [4.5, 4.4], 2.0); // the candles on her and the altar
}

// The cold corridor: brick, pipes overhead, water standing on the floor.
function corridor(world) {
  furnish(world, [
    ['pipeRun', 17, 7.35, 0, { length: 16, height: 2.25 }], ['pipeRun', 17, 8.75, 0, { length: 16, height: 2.4, radius: 0.05 }],
    ['puddle', 14.5, 8.3, 0, { width: 1.6, depth: 0.9 }], ['puddle', 18.5, 7.7, 0, { width: 1.2, depth: 0.7 }],
    ['hangingBulb', 21, 8.0, 0, { ceiling: 2.6 }],
  ]);
  light(world, '#d8c8a0', 1.2, 6, [21, 8.0], 2.0);
}

// Your breath held: a short bar that runs down, then a gasp he will hear.
function breath(ctx, x, y, left = 0.45) {
  osdText(ctx, 'HOLD', x, y, 9, '#e8f0ff');
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i < Math.round(left * 6) ? '#e8f0ff' : 'rgba(232,240,255,0.18)';
    ctx.fillRect(x + 30 + i * 10, y + 2, 7, 6);
  }
}

export const BASEMENT_STILLS = {
  // The chapel by candlelight: St. Agnes on her plinth before the altar, her
  // right hand gone at the wrist, nothing in the crook of her arm.
  chapel: {
    level: basement,
    setup({ world }) {
      chapel(world);
      eye(world, [4.5, 8.3], [4.5, 3.4], 1.6, 1.7);
    },
  },
  // St. Agnes whole: her hand and palm back, the lamb in her arm, her heart in her breast.
  statue_whole: {
    level: basement,
    setup({ world }) {
      chapel(world, { whole: true });
      world.flashlight.toggle();
      light(world, '#ffd8a0', 3, 5, [4.6, 4.6], 1.7);
      eye(world, [4.7, 5.05], [4.5, 3.4], 1.6, 1.6);
    },
    ui(ctx) {
      subtitle(ctx, '(the chapel bell tolls once; outside, the rain stops)', { whisper: false });
    },
  },
  // The crypt: five plaques in the wall, two pushed home; the niche, her heart in it.
  crypt: {
    level: basement,
    setup({ world }) {
      furnish(world, [
        ...CHILDREN.map((name, i) => ['memorialPlaque', 10.7 + i * 0.9, 1, 0, { name, set: i < 2 }]),
        ['cryptNiche', 15.35, 1, 0, { heart: true }], ['votiveRack', 10.7, 3.6, 90, { lit: 2 }],
      ]);
      light(world, '#ffb070', 2.2, 4, [14.9, 2.0], 1.0); // a candle left before the niche
      eye(world, [14.0, 2.75], [14.8, 1.0], 1.55, 1.2);
    },
  },
  // Dr. Venn in the cold corridor, his tray of instruments before him, coming
  // your way; the bandage over his eyes in your light.
  surgeon: {
    level: basement,
    setup({ world }) {
      corridor(world);
      furnish(world, [['surgeon', 16.3, 8.0, -90]]);
      eye(world, [12.6, 8.1], [16.3, 8.0], 1.6, 1.55);
    },
  },
  // Dr. Venn up close in your light: the bandage wound over his eyes, two
  // dark seeps where they are; his gown, his gloves, the tray.
  surgeon_face: {
    level: basement,
    setup({ world }) {
      corridor(world);
      furnish(world, [['surgeon', 14.4, 8.0, -90]]);
      eye(world, [13.15, 8.0], [14.4, 8.0], 1.75, 1.75);
    },
  },
  // The tell: he has stopped, the clinking with him, and turned his head
  // towards you. Through the camcorder, crouched, your breath held.
  surgeon_listens: {
    level: basement,
    setup({ world, fx }) {
      corridor(world);
      furnish(world, [['surgeon', 16.4, 7.9, -90, { listening: true }]]);
      world.flashlight.toggle();
      const lamp = new THREE.PointLight(0xffffff, 1.8, 14, 1.1);
      eye(world, [13.0, 8.4], [16.4, 7.9], 1.0, 1.7);
      lamp.position.copy(world.camera.position);
      world.scene.add(lamp);
      Object.assign(fx, { nightVision: 1, vignette: 0.5 });
    },
    ui(ctx) {
      camcorder(ctx);
      breath(ctx, 28, 270 - 28 - 44, 0.5);
      subtitle(ctx, '(the clinking stops)', { whisper: false });
    },
  },
  // Holding your breath without the camcorder: the same bar, low in the middle.
  ui_breath: {
    level: basement,
    setup({ world }) {
      corridor(world);
      furnish(world, [['surgeon', 15.2, 7.8, -90, { listening: true }]]);
      eye(world, [12.7, 8.5], [15.2, 7.8], 1.0, 1.8);
    },
    ui(ctx) {
      breath(ctx, 480 / 2 - 46, 270 - 46, 0.33);
    },
  },
  // The boiler room under water to the knee: Sam stands in it, faceless and
  // dripping; the valves on the wall; his soldier somewhere under the water.
  sam: {
    level: basement,
    setup({ world }) {
      furnish(world, [
        ['boiler', 14.4, 12.4, 0], ['floodWater', 13.5, 14.0, 0, { width: 8.4, depth: 7.2, height: 0.45 }],
        ['valveWheel', 10, 13.0, 90], ['valveWheel', 10, 14.0, 90, { color: '#2a5a8a' }], ['valveWheel', 10, 15.0, 90, { color: '#8a7a2a' }],
        ['pipeRun', 13.5, 15.6, 0, { length: 8, height: 2.9 }], ['ghostSam', 12.9, 14.4, 15], ['tinSoldier', 12.2, 15.6, 30, {}, 0.02],
        ['hangingBulb', 15.5, 13.0, 0, { ceiling: 3.4 }],
      ]);
      light(world, '#c8d0b0', 1.6, 7, [15.5, 13.0], 2.6);
      eye(world, [13.9, 16.1], [12.9, 14.2], 1.6, 0.95);
    },
  },
  // The morgue: steel drawers typed with dates, one pulled out, a sheet over
  // an adult and a tag on a toe. A cold tube light, dead.
  morgue: {
    level: basement,
    setup({ world }) {
      const cards = ['', '12 MAY', '', '3 JAN', '2 FEB', '', '18 MAR', '', '', '9 JUN', '', '2 APR'];
      furnish(world, [
        ['morgueDrawers', 21.6, 11, 0, { cards }], ['morgueTray', 21.0, 11, 0], ['fluorescent', 21.6, 13.4, 0, { height: 2.9 }],
        ['puddle', 23.0, 14.2, 0, { width: 1.0, depth: 0.8 }],
      ]);
      eye(world, [21.9, 14.7], [21.4, 11.4], 1.6, 0.85);
    },
  },
  // The theatre: Nora strapped to the surgeon's table under its lamp, the
  // only light; his cabinet and his tray. From the doorway.
  theatre_nora: {
    level: basement,
    setup({ world }) {
      furnish(world, [
        ['operatingTable', 30.5, 3.0, 0], ['noraStrapped', 30.5, 3.0, 0, {}, 0.92], ['theatreLamp', 30.5, 3.0, 0, { height: 3.8 }],
        ['instrumentCabinet', 34, 2.2, -90], ['instrumentTray', 31.7, 4.0, -20],
      ]);
      world.flashlight.toggle();
      eye(world, [29.55, 1.85], [30.5, 2.75], 1.65, 0.95);
    },
    ui(ctx) {
      usePrompt(ctx, 'CLICK  Undo the straps');
      subtitle(ctx, '(Nora) Who is that? I can hear you breathing. Please.', { whisper: false });
    },
  },
};
