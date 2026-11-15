// Mockup stills for 0.4, the asylum wards (the west wing): a ward by
// flashlight, Sister M. the burned nun (far off, in the dark, at the catch),
// Edith, the camcorder's night view, hiding under a bed, Nora's voice on a
// radio and the cut chain at the west wing door.
// Text here is mockup copy, not game text (game text goes through i18n).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { canvasTexture, decal } from '../props/parts.js';
import { aim, look, subtitle, message } from './helpers.js';
import { camcorder, usePrompt } from './wardUi.js';
import wards from './levels/wards.json';
import grounds from '../levels/grounds.json';

const CELL = 1.2;

// A prop at a cell position (cells for x and z, metres for y).
function add(world, type, [c, r], rotationDeg = 0, options, y = 0) {
  const prop = PROPS[type](world.textures, options);
  prop.position.set(c * CELL, y, r * CELL);
  prop.rotation.y = (rotationDeg * Math.PI) / 180;
  world.scene.add(prop);
  return prop;
}

// The ward's rule, painted in capitals on its end wall.
function lightsOutSign(world) {
  const sign = canvasTexture(128, 24, (g, w, h) => {
    g.fillStyle = '#cfc8ac';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#3a342a';
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.fillStyle = '#2a2620';
    g.font = 'bold 15px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('LIGHTS OUT 8 P.M.', w / 2, h / 2 + 1);
  });
  world.scene.add(decal(sign, [3.2, 0.6], [4.5 * CELL, 2.55, CELL + 0.012]));
}

// The camcorder's night view: no flashlight; the lens's own lamp, which
// only the camcorder sees, lights what is near.
function nightView(world, fx) {
  world.flashlight.toggle();
  const lamp = new THREE.PointLight(0xffffff, 7, 17, 1.1);
  lamp.position.copy(world.camera.position);
  world.scene.add(lamp);
  Object.assign(fx, { nightVision: 1, vignette: 0.5 });
}

// A ward lamp switched on: the bulb glowing on its flex, a warm pool under it.
function lampOn(world, [c, r]) {
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }));
  bulb.position.set(c * CELL, 2.85, r * CELL);
  const light = new THREE.PointLight('#ffd49a', 7, 9, 1.3);
  light.position.set(c * CELL, 2.7, r * CELL);
  world.scene.add(bulb, light);
}

// The snuffer at the catch: its pole from her right hand, the bell over your lens.
function snufferOver(world, hand, top) {
  const snuffer = PROPS.candleSnuffer(world.textures);
  const axis = new THREE.Vector3().subVectors(top, hand).normalize();
  snuffer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
  snuffer.rotateY(Math.PI); // the bell's arm towards the middle of the view
  snuffer.position.copy(top).addScaledVector(axis, -2.08);
  world.scene.add(snuffer);
}

// Her own glow on her face, from below (the catch: your light is going out).
function faceGlow(world, [x, y, z]) {
  const glow = new THREE.PointLight('#ff8a40', 2.6, 2.2, 1.2);
  glow.position.set(x, y, z);
  world.scene.add(glow);
}

export const WARD_STILLS = {
  // A ward with its lamps still on: two rows of iron beds, charts at their
  // feet, blinds half down on the barred windows, the rule on the end wall.
  ward: {
    level: wards,
    setup({ world }) {
      lightsOutSign(world);
      lampOn(world, [4.5, 3.0]);
      lampOn(world, [4.5, 6.6]);
      aim(world.camera, [4.9 * CELL, 1.6, 9.4 * CELL], 5, -4);
    },
  },
  // Sister M., the burned nun: she has seen your light from the end wall,
  // under the ward's rule.
  nun: {
    level: wards,
    setup({ world, fx }) {
      lightsOutSign(world);
      add(world, 'burnedNun', [4.5, 2.3], 0, { glow: 1 });
      aim(world.camera, [4.6 * CELL, 1.6, 5.7 * CELL], 0, 3);
      Object.assign(fx, { vignette: 0.3 });
    },
    ui(ctx) {
      subtitle(ctx, '(a woman, hissing) Lights out.');
    },
  },
  // Your light off: only her embers show, and what the blinds let in.
  nun_dark: {
    level: wards,
    setup({ world, fx }) {
      lightsOutSign(world);
      world.flashlight.toggle();
      add(world, 'burnedNun', [4.5, 2.3], 0, { glow: 0.5 });
      aim(world.camera, [4.6 * CELL, 1.6, 5.7 * CELL], 0, 3);
      Object.assign(fx, { vignette: 0.3 });
    },
  },
  // Proposal: her catch. She leans in, a burnt hand comes up to your light,
  // the snuffer tips over it and it goes out; about 1.5 s, then the rewind.
  nun_catch: {
    level: wards,
    setup({ world, fx }) {
      world.flashlight.toggle();
      const nun = add(world, 'burnedNun', [4.5, 7.3], 0, { glow: 1, reach: true });
      nun.rotation.x = 0.24; // leaning in over you
      faceGlow(world, [4.5 * CELL, 1.35, 7.3 * CELL + 0.75]);
      aim(world.camera, [4.5 * CELL, 1.6, 8.26 * CELL], 0, 5, -3);
      snufferOver(world, new THREE.Vector3(4.5 * CELL + 0.36, 1.2, 7.3 * CELL + 0.45), new THREE.Vector3(4.5 * CELL + 0.25, 1.86, 8.26 * CELL - 0.42));
      Object.assign(fx, { vignette: 0.5, aberration: 1.5 });
    },
    ui(ctx) {
      subtitle(ctx, '(a woman, hissing) Lights out.');
    },
  },
  // Edith on her bed, one ear turned to the room, her music box in her lap.
  edith: {
    level: wards,
    setup({ world }) {
      world.flashlight.toggle(); // your light is out: she shows by her own
      add(world, 'ghostEdith', [6.9, 8.2], -32, { opacity: 0.7 }, 0.6);
      const pale = new THREE.PointLight('#9fb4dc', 2.2, 4.5, 1.3);
      pale.position.set(6.7 * CELL, 1.5, 8.9 * CELL);
      world.scene.add(pale);
      look(world, [6.2 * CELL, 9.5 * CELL], [6.9 * CELL, 8.25 * CELL], 1.3, 0.98);
    },
    ui(ctx) {
      subtitle(ctx, '(a child, whispering) I can hear her beads. Two rooms away. Put your light out.');
    },
  },
  // The camcorder held up, night view: the ward in green, her embers bright
  // at the far end. Its display carries the pulse, the battery and the flash.
  camcorder_night: {
    level: wards,
    setup({ world, fx }) {
      lightsOutSign(world);
      add(world, 'burnedNun', [4.4, 3.4], 0, { glow: 0.5 });
      aim(world.camera, [4.6 * CELL, 1.6, 9.2 * CELL], 0, -1);
      nightView(world, fx);
    },
    ui: (ctx) => camcorder(ctx),
  },
  // Hiding under a bed while she passes: her hem, her beads, the snuffer's pole.
  hide_bed: {
    level: wards,
    setup({ world, fx }) {
      world.flashlight.toggle();
      add(world, 'burnedNun', [3.75, 4.55], 180, { glow: 0.5 });
      aim(world.camera, [2.3 * CELL, 0.2, 4.9 * CELL], -90, 6, 5);
      Object.assign(fx, { vignette: 0.4 });
    },
    ui(ctx) {
      usePrompt(ctx, 'CLICK  Come out');
    },
  },
  // Nora's voice on a ward radio (subtitled, like every voice).
  radio: {
    level: wards,
    setup({ world }) {
      look(world, [11.75 * CELL, 7.15 * CELL], [11.3 * CELL, 5.7 * CELL], 1.4, 0.95);
    },
    ui(ctx) {
      subtitle(ctx, '(a woman, on the radio) …this is Nora Kane. I am inside the west wing. If you can hear this, don’t put a light on.', { whisper: false });
    },
  },
  // The corridor outside the ward: barred windows, a wheelchair left behind.
  ward_corridor: {
    level: wards,
    setup({ world }) {
      aim(world.camera, [4.6 * CELL, 1.6, 11.6 * CELL], -90, -4);
    },
  },
  // The west wing's door in the courtyard: the chain cut, the cutters left.
  west_wing_door: {
    level: grounds,
    setup({ world }) {
      const chain = PROPS.cutChain(world.textures);
      chain.position.set(2.35, 0, 27.95);
      chain.rotation.y = 0.4;
      world.scene.add(chain);
      look(world, [5.4, 26.6], [1.6, 27.9], 1.6, 0.9);
    },
    ui(ctx) {
      message(ctx, 'The chain is cut. The cutters are still wet with rain.');
    },
  },
};
