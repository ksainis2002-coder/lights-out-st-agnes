// Mockup stills for 0.3, the school wing: a classroom, the watcher in the
// corridor, Maggie skipping, and the courtyard and cemetery in the rain.
// Text here is mockup copy, not game text (game text goes through i18n).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { aim, subtitle } from './helpers.js';
import { codeLock } from './schoolUi.js';
import school from './levels/school.json';
import courtyard from './levels/courtyard.json';
import library from './levels/library.json';
import gym from './levels/gym.json';

const OUTDOOR_FOG = 0x1c232e;

// Night sky and fog the same colour, plus a weak moon behind the clouds.
function outdoors(world) {
  world.scene.background = new THREE.Color(OUTDOOR_FOG);
  world.scene.fog = new THREE.FogExp2(OUTDOOR_FOG, 0.05);
  const moon = new THREE.DirectionalLight(0x8090b8, 0.9);
  moon.position.set(8, 12, -6);
  world.scene.add(moon);
}

// A lightning flash: sky, fog and ambient light go pale blue-white for an instant.
export function flash(world) {
  const sky = 0x56627a;
  world.scene.background = new THREE.Color(sky);
  world.scene.fog = new THREE.FogExp2(sky, 0.028);
  const light = new THREE.AmbientLight(0xc8d4ff, 2.6);
  const bolt = new THREE.DirectionalLight(0xe0e8ff, 2.2);
  bolt.position.set(-6, 20, 30);
  world.scene.add(light, bolt);
}

function findProp(world, test) {
  return world.scene.getObjectByName('props').children.find((p) => test(p.userData.prop ?? {}));
}

// A stone forearm from one point to another (her hand reaching for you).
function limb(material, from, to, thickness) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(thickness, thickness, a.distanceTo(b)), material);
  arm.position.copy(a).add(b).multiplyScalar(0.5);
  arm.lookAt(b);
  return arm;
}

// An open stone hand, palm towards you, fingers spread and a little curled.
function stoneHand(material, [x, y, z]) {
  const hand = new THREE.Group();
  const part = (size, position, tilt = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    mesh.rotation.z = tilt;
    hand.add(mesh);
  };
  part([0.025, 0.09, 0.085], [0, 0, 0]);
  [-0.03, -0.01, 0.01, 0.03].forEach((fz, i) => part([0.018, 0.07 - Math.abs(i - 1.5) * 0.01, 0.016], [0.012, 0.075, fz], 0.35));
  part([0.018, 0.05, 0.016], [0.01, 0.0, -0.055], 0.9); // thumb
  hand.position.set(x, y, z);
  hand.rotation.y = 0.2;
  return hand;
}

function addProp(world, type, [x, y, z], rotationDeg = 0, options) {
  const prop = PROPS[type](world.textures, options);
  prop.position.set(x, y, z);
  prop.rotation.y = (rotationDeg * Math.PI) / 180;
  world.scene.add(prop);
  return prop;
}

export const SCHOOL_STILLS = {
  // A classroom by flashlight: desks in rows, lines on the blackboard.
  classroom: {
    level: school,
    setup({ world }) {
      aim(world.camera, [9.4, 1.6, 8.8], 30, -5);
    },
  },
  // The watcher: the chapel statue of St. Agnes, halfway down the corridor.
  // It only moves while nobody is looking at it.
  watcher: {
    level: school,
    setup({ world, fx }) {
      aim(world.camera, [10.6, 1.6, 12.0], 90, 2);
      Object.assign(fx, { vignette: 0.35 });
    },
  },
  // Close-up: the lines on the blackboard, readable at arm's length.
  blackboard: {
    level: school,
    setup({ world }) {
      aim(world.camera, [5.6, 1.55, 3.3], 0, 0);
    },
  },
  // Look away and back: it has come down the corridor, right up to you.
  watcher_close: {
    level: school,
    setup({ world, fx }) {
      world.scene.getObjectByName('props').children.find((p) => p.userData.prop?.type === 'statue').position.x = 8.9;
      aim(world.camera, [10.9, 1.6, 12.0], 90, 4);
      Object.assign(fx, { vignette: 0.45, aberration: 1 });
    },
  },
  // Maggie skipping between the desks; her rhymes hold puzzle clues.
  maggie: {
    level: school,
    setup({ world }) {
      addProp(world, 'ghostGirl', [5.0, 0, 4.4], 20, { opacity: 0.62 });
      aim(world.camera, [7.2, 1.5, 7.9], 28, -4);
    },
    ui(ctx) {
      subtitle(ctx, '(Maggie, skipping) One for the bell and two for the chalk, three for the girl who was not let talk…');
    },
  },
  // Courtyard: open sky, rain, the five children's graves past the gate.
  courtyard: {
    level: courtyard,
    setup({ world }) {
      outdoors(world);
      aim(world.camera, [10.7, 1.6, 17.0], 4, -4);
    },
  },
  // From among the graves, looking back at the school in the rain.
  cemetery: {
    level: courtyard,
    setup({ world }) {
      outdoors(world);
      aim(world.camera, [10.4, 1.55, 8.3], 174, 2);
    },
  },
  // Proposal: her catch (owner pick a). She has reached you unseen: she leans
  // in, her face fills the view, a stone hand comes up; 1.5 s, then the rewind.
  watcher_grab: {
    level: school,
    fixedBeam: true,
    setup({ world, fx }) {
      const statue = findProp(world, (p) => p.type === 'statue');
      statue.position.set(9.05, 0, 12.0);
      statue.rotation.set(0, Math.PI / 2, -0.3, 'ZYX'); // leaning in over you
      statue.children.slice(4).forEach((part) => (part.visible = false)); // her arms, posed by hand below
      const stone = statue.children[2].material;
      world.scene.add(limb(stone, [9.6, 1.74, 12.24], [10.02, 1.56, 12.2], 0.07), stoneHand(stone, [10.04, 1.55, 12.2]));
      world.flashlight.light.intensity = 6; // the beam is right on her
      aim(world.camera, [10.6, 1.45, 12.06], 90, 24, -12);
      Object.assign(fx, { vignette: 0.8, aberration: 3, blur: 0.3 });
    },
  },
  // Proposal: the storm. A lightning flash lights the cemetery for an instant:
  // she is among the graves, much closer than in the dark a moment ago.
  storm: {
    level: courtyard,
    setup({ world }) {
      outdoors(world);
      flash(world);
      addProp(world, 'lightningBolt', [-4, 0, 48], 0, { height: 32, seed: 9 });
      addProp(world, 'statue', [10.9, 0, 9.0], 180, {});
      [[7.95, 10.05, true], [9.4, 10.4, true], [10.8, 10.8, false], [12.2, 10.4, false], [13.65, 10.05, false]].forEach(([x, z, lit]) => addProp(world, 'graveLantern', [x, 0, z], 0, { lit }));
      aim(world.camera, [11.8, 1.6, 5.4], 172, 6);
    },
  },
  // Proposal: the records cabinet's number lock, close up (like the music box).
  ui_codeLock: {
    level: school,
    setup({ world }) {
      aim(world.camera, [9.4, 1.6, 8.8], 30, -5);
    },
    ui: codeLock,
  },
  // The library: bookcases with shelf numbers, the card index; she waits at the end of an aisle.
  library: {
    level: library,
    setup({ world, fx }) {
      aim(world.camera, [6.4, 1.6, 8.6], 0, -3);
      Object.assign(fx, { vignette: 0.3 });
    },
  },
  // The gym: wall bars, ropes, the vaulting horse; Maggie skips by the hopscotch and sings the steps.
  gym: {
    level: gym,
    setup({ world }) {
      addProp(world, 'ghostGirl', [5.6, 0, 8.3], 35, { opacity: 0.62 });
      aim(world.camera, [8.6, 1.6, 12.4], 22, -7);
    },
    ui(ctx) {
      subtitle(ctx, '(Maggie, skipping) Two for the chalk and seven for the bell, five for the lady who watches as well…');
    },
  },
};
