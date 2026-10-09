// Dev-only: renders one mockup still with the real PS1 pipeline so the owner
// can approve looks before they are built into the game. Open
// mockup.html?s=<name>; tools/shoot-stills.mjs screenshots all of them.
// Text here is mockup copy, not game text (game text goes through i18n).
import * as THREE from 'three';
import { createPipeline } from '../render/pipeline.js';
import { createWorld } from '../world.js';
import { PROPS } from '../props/catalog.js';
import { osdText, wrapText, COLORS } from '../ui/osd.js';
import patientRoom from '../levels/patient_room.json';
import dorms from '../levels/dorms.json';

const W = 480;
const H = 270;

function subtitle(ctx, text, { whisper = true } = {}) {
  const lines = wrapText(ctx, text, 10, 380);
  const top = H - 30 - lines.length * 13;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(W / 2 - 200, top - 4, 400, lines.length * 13 + 8);
  lines.forEach((line, i) => osdText(ctx, line, W / 2, top + i * 13, 10, whisper ? '#c9d2e0' : COLORS.text, 'center'));
}

function addGhost(world, [x, z], { opacity, rotation = 0 } = {}) {
  const ghost = PROPS.ghostChild(world.textures, { opacity });
  ghost.position.set(x, 0, z);
  ghost.rotation.y = rotation;
  world.scene.add(ghost);
}

function aim(camera, [x, y, z], yawDeg, pitchDeg = 0, rollDeg = 0) {
  const rad = Math.PI / 180;
  camera.position.set(x, y, z);
  camera.rotation.set(pitchDeg * rad, yawDeg * rad, rollDeg * rad, 'YXZ');
}

const STILLS = {
  // Intro: waking in the patient-room bed, eyes half open, blurry.
  intro_wake: {
    level: patientRoom,
    setup({ world, fx }) {
      world.flashlight.toggle();
      aim(world.camera, [1.65, 0.78, 1.45], 180, 22, -8);
      Object.assign(fx, { eyelid: 0.45, blur: 1, vignette: 0.3 });
    },
    ui(ctx) {
      subtitle(ctx, '(a child, whispering) …you came back.');
    },
  },
  // Hub: the patient room seen from the door. Tape recorder = save point.
  hub: {
    level: patientRoom,
    setup({ world }) {
      world.flashlight.toggle();
      aim(world.camera, [3.0, 1.6, 5.6], 8, -6);
    },
  },
  // Wing 1: the orphanage dorm by flashlight, beds with name plates.
  dorm: {
    level: dorms,
    setup({ world }) {
      aim(world.camera, [5.6, 1.6, 17.0], -14, -2);
    },
  },
  // Tommy, far away at the end of the dorm, lit only by the moonlight.
  tommy: {
    level: dorms,
    setup({ world }) {
      addGhost(world, [7.4, 6.2], { opacity: 0.6 });
      aim(world.camera, [7.0, 1.6, 15.5], 2, -2);
    },
    ui(ctx) {
      subtitle(ctx, '(Tommy, whispering) Follow me. They put the names wrong.');
    },
  },
  // Low sanity: aberration, blur, heavy vignette, tilt, fake children.
  low_sanity: {
    level: dorms,
    setup({ world, fx }) {
      addGhost(world, [4.0, 9.5], { opacity: 0.35, rotation: 0.6 });
      addGhost(world, [10.4, 7.0], { opacity: 0.3, rotation: -0.5 });
      addGhost(world, [7.8, 4.6], { opacity: 0.4 });
      aim(world.camera, [7.0, 1.55, 14.0], -6, -3, 6);
      Object.assign(fx, { aberration: 2, blur: 0.5, vignette: 0.6 });
    },
  },
  // Sanity collapse: the tape rewinds to the last checkpoint.
  rewind: {
    level: dorms,
    setup({ world, fx }) {
      aim(world.camera, [7.0, 1.2, 12.0], 20, 10, 18);
      Object.assign(fx, { rewind: 1, aberration: 1.5 });
    },
    ui(ctx) {
      osdText(ctx, '◀◀ REW', 16, 12, 14);
      osdText(ctx, 'SP  0:41:07', W - 16, 12, 12, COLORS.text, 'right');
      subtitle(ctx, '(Tommy, whispering) Don’t stay in the dark so long. They get in.');
    },
  },
};

async function render() {
  const name = new URLSearchParams(location.search).get('s') ?? 'dorm';
  const still = STILLS[name];
  const canvas = document.getElementById('game');
  const ui = document.createElement('canvas');
  ui.width = W;
  ui.height = H;
  const pipeline = createPipeline(canvas, ui);
  const world = createWorld(still.level);
  still.setup({ world, fx: pipeline.fx });
  world.camera.updateProjectionMatrix();
  const ctx = ui.getContext('2d');
  still.ui?.(ctx);
  for (let i = 0; i < 4; i++) {
    pipeline.render(world.scene, world.camera, { look: still.look ?? 'game', time: 1.7, uiDirty: true });
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  window.__still = { name, world, THREE };
  document.body.dataset.ready = '1';
}

render();
