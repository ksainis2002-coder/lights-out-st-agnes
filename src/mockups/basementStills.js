// Mockup stills for 0.5, wing 4 (docs/DESIGN_0.5.md; owner picks 2026-11-17:
// her stone heart, Dr. Venn the surgeon, Nora on his table): the chapel with
// St. Agnes on her plinth, St. Agnes whole, the crypt, the surgeon coming at
// you down the cold corridor, looming over you, and his belt of tools close
// to, the surgeon listening (with your held breath on the camcorder's pulse
// line), the held breath without the camcorder, Sam in the flooded boiler
// room, the morgue, and Nora on the table, from the doorway and leaning over
// her. Text here is mockup copy, not game text (game text goes through i18n).
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

// The surgeon's theatre: the table under its lamp, Nora strapped to it, his
// cabinet, his tray of instruments on its stand.
function theatre(world) {
  furnish(world, [
    ['operatingTable', 30.5, 3.0, 0, { straps: false }], ['noraStrapped', 30.5, 3.0, 0, {}, 0.92], ['theatreLamp', 30.5, 3.0, 0, { height: 3.8 }],
    ['instrumentCabinet', 34, 2.2, -90], ['instrumentTray', 31.7, 4.0, -20],
  ]);
  world.flashlight.toggle();
  light(world, '#c8d0e0', 0.5, 2.0, [29.6, 2.6], 1.5); // a little light back off the tiles
}

// Your breath held (owner 2026-11-17: the first bar was hard to read and the
// wrong shape; of a ring and a pair of lungs, the ring): it empties round the
// centre of your view as you hold it, the words under it.
function breathRing(ctx, left = 0.5, cx = 480 / 2, cy = 270 / 2) {
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(232,240,255,0.18)';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = left < 0.3 ? '#ff8a7d' : '#e8f0ff';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  ctx.stroke();
  osdText(ctx, 'HOLDING BREATH', cx, cy + 22, 9, '#e8f0ff', 'center');
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
      // Owner 2026-11-17: too dark. Candles on stands either side of her, closer in.
      furnish(world, [['votiveRack', 3.3, 3.9, 0, { lit: 6 }], ['votiveRack', 5.7, 3.9, 0, { lit: 6 }]]);
      world.flashlight.toggle();
      light(world, '#ffd8a0', 4.5, 5, [4.5, 4.7], 1.5);
      light(world, '#ffc890', 2.5, 4, [3.3, 4.0], 1.2);
      light(world, '#ffc890', 2.5, 4, [5.7, 4.0], 1.2);
      eye(world, [4.6, 4.75], [4.5, 3.4], 1.55, 1.5);
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
      furnish(world, [['surgeon', 15.4, 8.35, -68, { facing: 0.55 }]]);
      eye(world, [12.8, 7.45], [15.4, 8.3], 1.6, 1.4); // from the wall: you see him side on, coming
    },
  },
  // Dr. Venn up close in your light: the bandage wound over his eyes, two
  // dark seeps where they are; his gown, his gloves, the tray.
  surgeon_face: {
    level: basement,
    setup({ world }) {
      corridor(world);
      furnish(world, [['surgeon', 14.4, 8.0, -90]]);
      world.flashlight.toggle(); // lit from above and aside, not blown out by a torch in his face
      light(world, '#d8c8a0', 2.2, 4, [14.2, 8.4], 2.5);
      light(world, '#8a9ac8', 1.2, 4, [13.6, 7.4], 1.4);
      light(world, '#9aa8c8', 0.9, 2.4, [13.5, 8.0], 2.0); // just enough on the bandage
      eye(world, [13.66, 8.06], [14.4, 7.97], 1.6, 1.86); // he looms over you
    },
  },
  // His belt as he passes where you crouch: the tools you hear clinking,
  // each its own shape, at your eye level.
  surgeon_belt: {
    level: basement,
    setup({ world }) {
      corridor(world);
      furnish(world, [['surgeon', 14.4, 8.0, -90]]);
      world.flashlight.toggle();
      light(world, '#d8c8a0', 1.3, 4, [14.0, 8.7], 2.3);
      light(world, '#9aa8c8', 0.5, 3, [13.5, 7.7], 1.1);
      eye(world, [13.66, 8.06], [14.3, 7.98], 1.04, 1.0);
    },
  },
  // The tell: he has stopped, the clinking with him, and turned his head
  // towards you. Through the camcorder, crouched, your breath held.
  surgeon_listens: {
    level: basement,
    setup({ world, fx }) {
      corridor(world);
      furnish(world, [['surgeon', 16.4, 7.75, -90, { listening: true }]]);
      world.flashlight.toggle();
      const lamp = new THREE.PointLight(0xffffff, 1.8, 14, 1.1);
      eye(world, [13.0, 8.4], [16.4, 8.25], 1.0, 1.4); // the ring left clear of him
      lamp.position.copy(world.camera.position);
      world.scene.add(lamp);
      Object.assign(fx, { nightVision: 1, vignette: 0.5 });
    },
    ui(ctx) {
      camcorder(ctx);
      breathRing(ctx, 0.55);
      subtitle(ctx, '(the clinking stops)', { whisper: false });
    },
  },
  // Holding your breath without the camcorder: the ring round the centre of your view.
  ui_breath: {
    level: basement,
    setup({ world }) {
      corridor(world);
      furnish(world, [['surgeon', 15.2, 7.8, -90, { listening: true }]]);
      eye(world, [12.7, 8.5], [15.2, 8.3], 1.0, 1.5); // the ring left clear of him
    },
    ui(ctx) {
      breathRing(ctx, 0.33);
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
        ['pipeRun', 13.5, 15.6, 0, { length: 8, height: 2.9 }], ['ghostSam', 12.9, 14.4, 15, { waterline: 0.45 }], ['tinSoldier', 12.2, 15.6, 30, {}, 0.02],
        ['hangingBulb', 15.5, 13.0, 0, { ceiling: 3.4 }],
      ]);
      light(world, '#c8d0b0', 1.6, 7, [15.5, 13.0], 2.6);
      eye(world, [13.6, 15.7], [12.9, 14.4], 1.5, 0.9);
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
  // only light; his cabinet and his tray. From a few steps in, at her side.
  theatre_nora: {
    level: basement,
    setup({ world }) {
      theatre(world);
      eye(world, [29.0, 2.55], [30.5, 2.85], 1.65, 0.9);
    },
    ui(ctx) {
      usePrompt(ctx, 'CLICK  Undo the straps');
      subtitle(ctx, '(Nora) Who is that? I can hear you breathing. Please.', { whisper: false });
    },
  },
  // Leaning over her: her face turned to you, the straps, her fist in its cuff.
  nora_close: {
    level: basement,
    setup({ world }) {
      theatre(world);
      eye(world, [30.3, 2.67], [30.47, 2.44], 1.36, 1.1); // leaning over her from her side, her face turned up to yours
    },
    ui(ctx) {
      subtitle(ctx, '(Nora) Please. Before he comes back.', { whisper: false });
    },
  },
};
