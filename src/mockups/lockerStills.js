// Proposal stills for part B's hiding place (0.5): staff lockers in the
// morgue, and the view from inside one through the vent slits of its door,
// Dr. Venn passing in the corridor light. Not in the game until approved.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { look, subtitle } from './helpers.js';
import { usePrompt } from './wardUi.js';
import basement from './levels/basement.json';

const CELL = 1.2;
const W = 480;
const H = 270;

function furnish(world, list) {
  list.forEach(([type, c, r, turn = 0, options, y = 0]) => {
    const prop = PROPS[type](world.textures, options);
    prop.position.set(c * CELL, y, r * CELL);
    prop.rotation.y = (turn * Math.PI) / 180;
    world.scene.add(prop);
  });
}

function light(world, color, intensity, distance, [c, r], y) {
  const l = new THREE.PointLight(color, intensity, distance, 1.3);
  l.position.set(c * CELL, y, r * CELL);
  world.scene.add(l);
}

// The morgue as approved (drawers, the dead tube light), three lockers along its east wall.
function morgue(world) {
  const cards = ['30 OCT', '12 MAY', '', '3 JAN', '2 FEB', '', '18 MAR', '14 NOV', '', '9 JUN', '', '2 APR'];
  furnish(world, [
    ['morgueDrawers', 21.6, 11, 0, { cards }], ['fluorescent', 21.6, 13.4, 0, { height: 2.9 }],
    ['puddle', 23.0, 14.2, 0, { width: 1.0, depth: 0.8 }],
    ['staffLocker', 24.8, 12.2, -90], ['staffLocker', 24.8, 12.62, -90], ['staffLocker', 24.8, 13.04, -90],
  ]);
}

// Inside the locker: everything dark but the three slits of the door, which
// you see the room through; the steel lit faintly at their edges.
function slits(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(8,9,8,0.97)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 3; i++) {
    const y = 100 + i * 26;
    const grad = ctx.createLinearGradient(0, y, 0, y + 18);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(0.3, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(70, y, W - 140, 18);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(150,160,150,0.22)'; // the steel edge under each slit, catching what light there is
  for (let i = 0; i < 3; i++) ctx.fillRect(70, 100 + i * 26 + 18, W - 140, 1);
  ctx.restore();
}

export const LOCKER_STILLS = {
  // Three staff lockers along the morgue's wall, in your light.
  locker: {
    level: basement,
    setup({ world }) {
      morgue(world);
      look(world, [22.6 * CELL, 13.9 * CELL], [24.8 * CELL, 12.6 * CELL], 1.6, 1.2);
    },
    ui(ctx) {
      usePrompt(ctx, 'Hide in the locker');
    },
  },
  // From inside one: Dr. Venn walking past between the drawers and you, his
  // tools clinking. Your light is off in there.
  locker_inside: {
    level: basement,
    setup({ world }) {
      morgue(world);
      world.flashlight.toggle();
      furnish(world, [['surgeon', 22.6, 12.7, -80, { facing: 0.2 }]]);
      furnish(world, [['hangingBulb', 22.4, 12.9, 0, { ceiling: 3.0, lit: true }]]);
      light(world, '#d8c8a0', 7, 9, [22.4, 12.9], 2.4); // a bulb left burning over the drawers
      light(world, '#8090b0', 2.5, 9, [20.4, 12.2], 2.0); // and what it throws back off the tiles
      look(world, [24.6 * CELL, 12.62 * CELL], [21.0 * CELL, 12.4 * CELL], 1.62, 1.5);
    },
    ui(ctx) {
      slits(ctx);
      subtitle(ctx, '(instruments clinking, close)', { whisper: false });
      usePrompt(ctx, 'Come out');
    },
  },
};
