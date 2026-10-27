// Before/after stills for the owner's note on the part C stills (2026-10-27):
// from outside, the buildings looked like flat walls with no depth from the
// side. On the game's own grounds level, in a lightning flash and by
// flashlight; the approved part C stills show the rest.
import { PROPS } from '../props/catalog.js';
import { look } from './helpers.js';
import { flash } from './schoolStills.js';
import grounds from '../levels/grounds.json';

function bolt(world, [x, z]) {
  const object = PROPS.lightningBolt(world.textures, { height: 32, seed: 9 });
  object.position.set(x, 0, z);
  world.scene.add(object);
}

export const OUTSIDE_STILLS = {
  // From the cemetery in a flash: the orphanage's end over the wall.
  outside_corner: {
    level: grounds,
    setup({ world }) {
      flash(world);
      look(world, [21, 4], [4, 17], 1.6, 6);
    },
  },
  // From the courtyard in a flash: the school's end by the cemetery gate.
  outside_courtyard: {
    level: grounds,
    setup({ world }) {
      flash(world);
      bolt(world, [60, -20]);
      look(world, [8, 27], [31.5, 15], 1.6, 6);
    },
  },
  // On the road by the front gate, by flashlight: the chapel's end.
  outside_road: {
    level: grounds,
    setup({ world }) {
      look(world, [29, 33.3], [19.5, 37.5], 1.6, 4.5);
    },
  },
};
