// Mockup stills for the puzzle close-ups (owner request 2026-10-14): each
// close-up over the place it is used, like the music box. Wing 2's in the
// school mockups, the fuse box in the real wing 1 level.
import * as THREE from 'three';
import { aim } from './helpers.js';
import { cardIndexClose, shelfClose, countingBoardClose, gravestoneClose, paintingClose, hopscotchClose, fuseBoxClose } from './closeUps.js';
import school from './levels/school.json';
import library from './levels/library.json';
import courtyard from './levels/courtyard.json';
import gym from './levels/gym.json';
import art from './levels/art.json';
import orphanageWing from '../levels/orphanage_wing.json';

function night(world) {
  world.scene.background = new THREE.Color(0x1c232e);
  world.scene.fog = new THREE.FogExp2(0x1c232e, 0.05);
}

const atTheGrave = ({ world }) => {
  night(world);
  aim(world.camera, [8.2, 1.4, 9.5], 168, -10);
};

export const CLOSE_UP_STILLS = {
  ui_cardIndex: { level: library, setup: ({ world }) => aim(world.camera, [4.7, 1.3, 7.1], 30, -20), ui: cardIndexClose },
  ui_shelf: { level: library, setup: ({ world }) => aim(world.camera, [7.0, 1.4, 4.4], -90, -5), ui: shelfClose },
  ui_countingBoard: { level: school, setup: ({ world }) => aim(world.camera, [5.6, 1.55, 3.3], 0, 0), ui: countingBoardClose },
  ui_gravestone: { level: courtyard, setup: atTheGrave, ui: (ctx) => gravestoneClose(ctx) },
  ui_gravestone_worn: { level: courtyard, setup: atTheGrave, ui: (ctx) => gravestoneClose(ctx, { worn: true }) },
  ui_painting: { level: art, setup: ({ world }) => aim(world.camera, [5.4, 1.45, 2.6], 0, -2), ui: paintingClose },
  ui_hopscotch: { level: gym, setup: ({ world }) => aim(world.camera, [6.76, 1.6, 10.4], 0, -50), ui: (ctx) => hopscotchClose(ctx) },
  ui_fuseBox: { level: orphanageWing, setup: ({ world }) => aim(world.camera, [29.5, 1.45, 18.6], 90, -5), ui: (ctx) => fuseBoxClose(ctx) },
};
