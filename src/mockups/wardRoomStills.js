// Mockup stills for 0.4 part A: the rooms of the west wing's ground floor
// (admissions, fuse room, baths, dispensary, day room, children's ward),
// furnished here in an empty mock level. Nothing in them is game data yet.
// Text here is mockup copy, not game text (game text goes through i18n).
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { look, subtitle, message } from './helpers.js';
import { fuseBoardClose } from './wardUi.js';
import rooms from './levels/wardRooms.json';

const CELL = 1.2;

// Props at cell positions: [type, column, row, rotation in degrees, options, height, scale].
function furnish(world, list) {
  list.forEach(([type, c, r, turn = 0, options, y = 0, scale = 1]) => {
    const prop = PROPS[type](world.textures, options);
    prop.position.set(c * CELL, y, r * CELL);
    prop.rotation.y = (turn * Math.PI) / 180;
    prop.scale.setScalar(scale);
    world.scene.add(prop);
  });
}

const eye = (world, from, to, y = 1.6, toY = 1.1) => look(world, [from[0] * CELL, from[1] * CELL], [to[0] * CELL, to[1] * CELL], y, toY);

export const WARD_ROOM_STILLS = {
  // Admissions: the desk and its book, pigeonholes, the wing's plan, a radio.
  admissions: {
    level: rooms,
    setup({ world }) {
      furnish(world, [
        ['pedestalDesk', 12, 2.5, 0], ['ledger', 11.8, 2.5, 20, {}, 0.79], ['radioSet', 12.45, 2.42, 170, {}, 0.79], ['deskLamp', 11.55, 2.4, 200, { lit: false }, 0.79],
        ['chair', 12, 1.8, 0], ['pigeonholes', 11.3, 1, 0], ['mapBoard', 13.6, 1, 0], ['wallClock', 9.4, 1, 0],
        ['recordsCabinet', 8.25, 2.2, 90], ['recordsCabinet', 8.25, 2.9, 90], ['bench', 8.3, 4.6, 90, { length: 2.2 }],
        ['barredWindow', 16, 2.4, -90], ['barredWindow', 16, 4.4, -90], ['papers', 12.6, 3.4, 0],
        // left behind
        ['typewriter', 12.3, 2.55, 185, {}, 0.79], ['papers', 11.2, 3.5, 40, { count: 7 }], ['papers', 13.3, 2.9, 110, { count: 5 }], ['papers', 10.2, 2.4, 0, { count: 6 }],
        ['chair', 11.3, 3.7, 70, { toppled: true }], ['ledger', 12.9, 3.6, 60], ['ledger', 10.9, 2.9, 200, { color: '#2a3a4a' }],
        ['crucifix', 12.5, 1, 0, { height: 2.3 }], ['noticeBoard', 10, 1, 0], ['peeledPaper', 14.9, 1, 0, { seed: 2 }], ['peeledPaper', 8.9, 1, 0, { seed: 7 }],
        ['hatStand', 15.5, 1.5, 0], ['umbrellaStand', 15.6, 5.5, 0], ['stretcher', 14.6, 4.2, 20], ['sheetPile', 13.6, 4.9, 0], ['rug', 12, 2.6, 0, { width: 2.6, depth: 1.8 }],
      ]);
      eye(world, [11.1, 4.5], [12.2, 1.4], 1.6, 1.2);
    },
    ui: (ctx) => subtitle(ctx, '(a woman, on the radio) Nora Kane, the west wing, a little after eight. The power is still on in here.', { whisper: false }),
  },
  // The fuse room: the board with one fuse in six sockets.
  fuse_room: {
    level: rooms,
    setup({ world }) {
      furnish(world, [
        ['fuseBoard', 3, 7, 0, { fuses: [3] }], ['hangingBulb', 3, 8.6, 0, { ceiling: 3.4 }],
        ['bucketMop', 1.5, 7.5, 30], ['linenShelves', 4.98, 8.4, -90, { length: 1.4, seed: 4 }], ['radiator', 1.02, 9, 90], ['puddle', 2.4, 9.3, 0],
        ['handprints', 1.9, 7, 0], ['wallScratches', 4.2, 7, 0, { seed: 6 }], ['peeledPaper', 1.02, 8.2, 90, { seed: 3 }],
        ['papers', 3.4, 8.2, 30, { count: 5 }], ['chair', 4.2, 8.9, 250, { toppled: true }], ['laundryBasket', 1.6, 8.6, 0], ['fallenTiles', 3.9, 7.4, 0, { seed: 2 }],
        ['tileDecay', 4.1, 7, 0, { width: 1.0, height: 0.8, y: 0.7, seed: 8 }], ['trolley', 2.1, 7.6, 100],
      ]);
      eye(world, [3.3, 9.6], [3, 7], 1.6, 1.45);
    },
    ui: (ctx) => message(ctx, 'Six circuits. One fuse.'),
  },
  // The baths: two tubs, a floor drain, tiles to the ceiling.
  baths: {
    level: rooms,
    setup({ world }) {
      furnish(world, [
        ['bathtub', 2.3, 13.5, 0], ['bathtub', 4.9, 13.5, 0], ['floorDrain', 3.7, 15, 0], ['duckboard', 3.6, 14.3, 0],
        ['towelRail', 1.02, 15, 90], ['sink', 6.98, 14.2, -90], ['mirror', 6.98, 14.2, -90], ['puddle', 3.2, 15.3, 0, { width: 1.3, depth: 0.8 }],
        ['hangingBulb', 3.7, 14.8, 0, { ceiling: 3.4 }], ['bucketMop', 6.5, 16.5, 200],
        ['wheelchair', 3.6, 14.0, 170], ['dripStand', 5.9, 13.6, 0], ['laundryBasket', 1.5, 14.2, 0], ['sheetPile', 2.6, 15.0, 0],
        ['tileDecay', 3.6, 13, 0, { width: 1.8, height: 1.3, y: 1.7, seed: 4 }], ['tileDecay', 5.6, 13, 0, { width: 1.2, height: 0.9, y: 0.9, seed: 9 }],
        ['fallenTiles', 3.7, 13.5, 0, { seed: 3 }], ['fallenTiles', 5.5, 14.4, 0, { seed: 6 }], ['handprints', 1.9, 13, 0], ['towelRail', 3.6, 13, 0, { count: 2 }],
        ['chair', 4.6, 15.4, 30, { toppled: true }], ['puddle', 4.7, 14.6, 0],
      ]);
      eye(world, [3.9, 16.7], [3.5, 13.4], 1.6, 0.95);
    },
  },
  // The dispensary: the locked cabinet and its card, a trolley, a sink.
  dispensary: {
    level: rooms,
    setup({ world }) {
      furnish(world, [
        ['medicineCabinet', 3.6, 1, 0], ['notice', 4.7, 1, 0], ['table', 3.6, 1.45, 0], ['papers', 3.9, 1.5, 0, {}, 0.76],
        ['cabinet', 1.2, 2.4, 90], ['cabinet', 1.2, 3.2, 90], ['trolley', 5.4, 2.6, 30], ['sink', 6.98, 3.6, -90],
        ['wallClock', 2.2, 1, 0], ['chair', 5.2, 4.3, 200, { toppled: true }],
        ['cabinet', 5.2, 1.2, 0], ['recordsCabinet', 6.2, 1.25, 0, { lock: false }], ['dripStand', 2.6, 1.6, 0], ['scales', 1.6, 1.5, 30],
        ['papers', 3.1, 2.6, 60, { count: 6 }], ['papers', 4.6, 2.2, 10, { count: 4 }], ['fallenTiles', 4.2, 1.7, 0, { seed: 4 }],
        ['peeledPaper', 5.9, 1, 0, { seed: 4 }], ['foldingScreen', 1.7, 3.0, 70], ['trolley', 2.5, 2.3, 300], ['puddle', 4.4, 2.9, 0, { width: 0.7, depth: 0.5 }],
      ]);
      eye(world, [4.2, 3.7], [3.7, 1], 1.6, 1.3);
    },
    ui: (ctx) => message(ctx, 'A brass lock with four wheels. A card: NIGHT ROUND.'),
  },
  // The day room: armchairs turned to the television, on by itself.
  day_room: {
    level: rooms,
    setup({ world }) {
      world.flashlight.toggle();
      furnish(world, [
        ['television', 13.2, 1.8, -15, { on: true }], ['rug', 12.4, 3.3, 0, { width: 3, depth: 2.2 }],
        ['armchair', 11.5, 3.1, 125], ['armchair', 12.5, 3.7, 165], ['armchair', 13.7, 3.5, 200], ['armchair', 14.9, 2.4, 250],
        ['sideTable', 10.6, 2.2, 0], ['radioSet', 10.6, 2.2, 150, { lit: false }, 0.6], ['wheelchair', 14.6, 4.6, 200],
        ['barredWindow', 10.5, 1, 0], ['barredWindow', 12.6, 1, 0], ['wallClock', 8.02, 3.2, 90],
        ['bookshelf', 15.98, 3.4, -90, { length: 2, seed: 5 }], ['radiator', 11.6, 1.06, 0, { width: 1.4 }], ['table', 9.4, 3.2, 20], ['chair', 9.2, 2.5, 10], ['chair', 9.9, 3.9, 200, { toppled: true }],
        ['papers', 9.4, 3.2, 0, { count: 5 }, 0.76], ['papers', 12.9, 4.4, 80, { count: 6 }], ['tinPlate', 10.6, 2.2, 0, {}, 0.6], ['blocks', 12, 2.6, 0],
        ['saintPicture', 14.4, 1, 0], ['peeledPaper', 9, 1, 0, { seed: 9 }], ['sheetPile', 14.2, 3.0, 0], ['hatStand', 15.4, 5.4, 0],
      ]);
      eye(world, [11.3, 5.5], [13, 1.9], 1.6, 0.95);
    },
  },
  // The children's ward: seven small beds, bed 4 stripped, Edith on bed 7.
  childrens_ward: {
    level: rooms,
    setup({ world }) {
      const bed = (number, c, r, turn, more) => ['wardBed', c, r, turn, { number, ...more }, 0, 0.8];
      furnish(world, [
        bed(1, 1.85, 1.7, 90), bed(2, 1.85, 2.8, 90), bed(3, 1.85, 3.9, 90), bed(4, 1.85, 5, 90, { unmade: true, chart: true }),
        bed(5, 6.15, 1.7, -90), bed(6, 6.15, 2.8, -90), bed(7, 6.15, 3.9, -90),
        ['barredWindow', 3, 1, 0, { width: 0.9, height: 1.5 }], ['barredWindow', 5, 1, 0, { width: 0.9, height: 1.5 }],
        ['toyBox', 4, 1.4, 0], ['childChair', 3.3, 2.2, 40], ['hangingBulb', 4, 3.2, 0, { ceiling: 3.4 }],
        ['bedsideCupboard', 1.3, 2.25, 90], ['bedsideCupboard', 1.3, 3.35, 90], ['bedsideCupboard', 6.7, 2.25, -90], ['bedsideCupboard', 6.7, 3.35, -90],
        ['shoes', 2.5, 1.9, 80], ['shoes', 5.5, 2.9, -100, { colour: '#4a2a20' }], ['teddy', 6.45, 1.7, -90, {}, 0.5, 0.8], ['toyTrain', 3.6, 3.3, 30], ['blocks', 4.6, 2.5, 0],
        ['drawing', 2.1, 1, 0, { kind: 'house' }], ['drawing', 4, 1, 0, { kind: 'sun' }], ['drawing', 5.9, 1, 0, { kind: 'house' }], ['crucifix', 4, 1, 0, { height: 2.9 }],
        ['clothes', 3.3, 2.2, 40, { hung: true }], ['sheetPile', 2.9, 5.1, 0], ['washstand', 6.9, 5.1, -90], ['foldingScreen', 5.2, 5.2, 20], ['papers', 4.2, 4.4, 50, { count: 4 }],
        ['ghostEdith', 5.75, 3.9, -90, { opacity: 0.55 }, 0.48],
      ]);
      const pale = new THREE.PointLight('#9fb4dc', 1.6, 3.5, 1.3);
      pale.position.set(5.2 * CELL, 1.3, 3.9 * CELL);
      world.scene.add(pale);
      eye(world, [3.6, 5.7], [4.4, 2.6], 1.6, 0.75);
    },
    ui: (ctx) => subtitle(ctx, '(a child, whispering) You walk heavier than she does. You’re not her.'),
  },
  // Proposal: the fuse board's close-up screen (owner pick: a close-up, not a bigger board).
  ui_fuseBoard: {
    level: rooms,
    setup({ world }) {
      furnish(world, [['fuseBoard', 3, 7, 0, { fuses: [0, 2] }]]);
      eye(world, [3.1, 8.6], [3, 7], 1.6, 1.45);
    },
    ui: fuseBoardClose,
  },
};
