// Mockup stills for 0.3, the school wing: a classroom, the watcher in the
// corridor, Maggie skipping, and the courtyard and cemetery in the rain.
// Text here is mockup copy, not game text (game text goes through i18n).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { aim, subtitle } from './helpers.js';
import school from './levels/school.json';
import courtyard from './levels/courtyard.json';

const OUTDOOR_FOG = 0x1c232e;

// Night sky and fog the same colour, plus a weak moon behind the clouds.
function outdoors(world) {
  world.scene.background = new THREE.Color(OUTDOOR_FOG);
  world.scene.fog = new THREE.FogExp2(OUTDOOR_FOG, 0.05);
  const moon = new THREE.DirectionalLight(0x8090b8, 0.9);
  moon.position.set(8, 12, -6);
  world.scene.add(moon);
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
};
