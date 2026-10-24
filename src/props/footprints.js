import { asMoved } from './moves.js';

// Floor footprints (width × depth in metres, prop-local) of props the player
// cannot walk through. Small clutter (papers, blocks, toys) stays walkable.
// A prop can opt out with "solid": false in level data.
// Each gives { size: [w, d], offset: [x, z] } for the prop's options.
const FOOTPRINTS = {
  bed: () => ({ size: [0.9, 1.9] }),
  table: () => ({ size: [1.1, 0.7] }),
  cubbies: () => ({ size: [1.6, 0.35] }),
  cabinet: () => ({ size: [0.7, 0.35] }),
  longTable: () => ({ size: [3.0, 0.8] }),
  bench: (options) => ({ size: [options?.length ?? 3.0, 0.3] }),
  sink: () => ({ size: [0.56, 0.4], offset: [0, 0.2] }),
  bathtub: () => ({ size: [1.72, 0.76] }),
  toiletStalls: (options) => ({ size: [(options?.count ?? 3) * 0.9, 1.3], offset: [0, 0.65] }),
  bucketMop: () => ({ size: [0.34, 0.34] }),
  linenShelves: (options) => ({ size: [options?.length ?? 1.6, 0.5], offset: [0, 0.25] }),
  laundryBasket: () => ({ size: [0.6, 0.42] }),
  mangle: () => ({ size: [0.72, 0.5] }),
  radiator: (options) => ({ size: [options?.width ?? 1.0, 0.12], offset: [0, 0.06] }),
  recordsCabinet: () => ({ size: [0.5, 0.6] }),
  bookshelf: (options) => ({ size: [options?.length ?? 2, 0.36] }),
  foldingScreen: (options) => ({ size: [(options?.panels ?? 3) * 0.6, 0.2] }),
  trolley: () => ({ size: [0.6, 0.4] }),
  rockingHorse: () => ({ size: [1.0, 0.4] }),
  toyBox: () => ({ size: [0.7, 0.42] }),
  childTable: () => ({ size: [0.8, 0.5] }),
  childChair: () => ({ size: [0.3, 0.3] }),
  washstand: () => ({ size: [0.6, 0.4], offset: [0, 0.2] }),
  // A toppled chair lies on its back, reaching behind where it stood.
  chair: (options) => (options?.toppled ? { size: [0.42, 0.94], offset: [0, -0.22] } : { size: [0.42, 0.42] }),
  // School (0.3): classrooms, library, gym, music, nurse, art, hall, cloakroom, grounds.
  schoolDesk: () => ({ size: [0.6, 0.72], offset: [0, 0.08] }),
  indexCabinet: () => ({ size: [0.7, 0.42] }),
  vaultingHorse: () => ({ size: [1.3, 0.4] }),
  piano: () => ({ size: [1.5, 0.6], offset: [0, 0.3] }),
  pianoStool: () => ({ size: [0.34, 0.34] }),
  musicStand: () => ({ size: [0.3, 0.3] }),
  percussion: () => ({ size: [1.1, 0.45] }),
  scales: () => ({ size: [0.42, 0.56], offset: [0, 0.06] }),
  examCouch: () => ({ size: [1.7, 0.6] }),
  easel: () => ({ size: [0.66, 0.7], offset: [0, -0.2] }),
  // The flight and its landing run back from the bottom step (prop origin).
  stairs: (options) => {
    const length = (options?.steps ?? 14) * (options?.run ?? 0.28) + (options?.landing ?? 1.4);
    return { size: [options?.width ?? 1.6, length], offset: [0, -length / 2] };
  },
  umbrellaStand: () => ({ size: [0.26, 0.26] }),
  cloakPegs: (options) => ({ size: [(options?.count ?? 8) * 0.34, 0.22], offset: [0, 0.11] }),
  bootRack: (options) => ({ size: [options?.length ?? 2.4, 0.3] }),
  lostProperty: () => ({ size: [0.5, 0.36] }),
  gravestone: () => ({ size: [0.6, 0.3] }),
  gatePillar: () => ({ size: [0.42, 0.42] }),
  deadTree: () => ({ size: [0.4, 0.4] }),
  // School, first floor (0.3 part B): the office, the flat, the projector, the stair heads.
  pedestalDesk: () => ({ size: [1.5, 0.8] }),
  headChair: () => ({ size: [0.62, 0.56] }),
  armchair: () => ({ size: [0.74, 0.7] }),
  bedsideCupboard: () => ({ size: [0.46, 0.4] }),
  wardrobe: () => ({ size: [1.18, 0.62] }),
  hatStand: () => ({ size: [0.4, 0.4] }),
  sideTable: () => ({ size: [0.5, 0.5] }),
  projector: () => ({ size: [0.6, 0.4] }),
  // The flight falls away from the top step (prop origin) down the well.
  stairHead: (options) => {
    const length = (options?.steps ?? 8) * (options?.run ?? 0.28);
    return { size: [options?.width ?? 1.6, length], offset: [0, -length / 2] };
  },
};

function footprint(prop, cellSize) {
  const { size: [w, d], offset: [ox, oz] = [0, 0] } = FOOTPRINTS[prop.type](prop.options);
  const angle = ((prop.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const halfX = (w * Math.abs(cos) + d * Math.abs(sin)) / 2, halfZ = (w * Math.abs(sin) + d * Math.abs(cos)) / 2;
  // Same rotation as the prop (three.js rotation.y): local x/z to world.
  const x = prop.at[0] * cellSize + ox * cos + oz * sin;
  const z = prop.at[1] * cellSize - ox * sin + oz * cos;
  return { minX: x - halfX, maxX: x + halfX, minZ: z - halfZ, maxZ: z + halfZ };
}

// Axis-aligned boxes in world x/z: { minX, maxX, minZ, maxZ }. A prop with
// "moved" has one for each pose; the one not in use is "off" (props/moves.js).
export function propObstacles(props, cellSize) {
  return props.filter((prop) => FOOTPRINTS[prop.type] && prop.solid !== false).flatMap((prop) => {
    if (!prop.moved) return [footprint(prop, cellSize)];
    const { flag } = prop.moved;
    return [
      { ...footprint(prop, cellSize), flag, moved: false },
      { ...footprint(asMoved(prop), cellSize), flag, moved: true, off: true },
    ];
  });
}
