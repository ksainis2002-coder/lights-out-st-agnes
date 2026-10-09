// The 3D world: scene, fog, camera, flashlight, and the current level with its
// props, lights and doors. loadLevel swaps levels while the game runs.
import * as THREE from 'three';
import { createTextures } from './render/textures.js';
import { parseLevel } from './levels/loader.js';
import { buildLevelMeshes } from './levels/build.js';
import { createDoors } from './levels/doors.js';
import { createFlashlight } from './player/flashlight.js';
import { placeProps, placeLights } from './props/place.js';
import { updateClocks } from './props/clocks.js';

const FOG_COLOR = 0x06090a;

export function createWorld(levelData) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG_COLOR);
  scene.fog = new THREE.FogExp2(FOG_COLOR, 0.09);

  const camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.05, 60);
  scene.add(camera);
  const flashlight = createFlashlight(camera);
  const textures = createTextures();

  const world = { scene, camera, flashlight, textures, level: null, doors: null, levelGroup: null };

  world.loadLevel = (data) => {
    if (world.levelGroup) scene.remove(world.levelGroup);
    const level = parseLevel(data);
    const doors = createDoors(level, textures);
    const group = new THREE.Group();
    group.name = `level:${level.id}`;
    group.add(
      new THREE.AmbientLight(level.ambient.color, level.ambient.intensity),
      buildLevelMeshes(level, textures),
      placeProps(level, textures),
      placeLights(level),
      doors.group,
    );
    scene.add(group);
    Object.assign(world, { level, doors, levelGroup: group });
    return level;
  };

  world.now = () => new Date(); // replaced in tests to fix the time

  world.update = (dt) => {
    world.doors?.update(dt);
    if (world.levelGroup) updateClocks(world.levelGroup, world.now());
    flashlight.update(world.level, dt);
  };

  world.loadLevel(levelData);
  return world;
}
