// The 3D world: scene, fog, ambient light, the current level and the camera.
import * as THREE from 'three';
import { createTextures } from './render/textures.js';
import { parseLevel } from './levels/loader.js';
import { buildLevelMeshes } from './levels/build.js';
import { createFlashlight } from './player/flashlight.js';
import { placeProps, placeLights } from './props/place.js';

const FOG_COLOR = 0x06090a;

export function createWorld(levelData) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG_COLOR);
  scene.fog = new THREE.FogExp2(FOG_COLOR, 0.09);

  const camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.05, 60);
  scene.add(camera);
  const flashlight = createFlashlight(camera);

  const textures = createTextures();
  const level = parseLevel(levelData);
  const ambient = levelData.ambient ?? { color: '#ffffff', intensity: 0.45 };
  scene.add(new THREE.AmbientLight(ambient.color, ambient.intensity));
  scene.add(buildLevelMeshes(level, textures), placeProps(level, textures), placeLights(level));

  return { scene, camera, flashlight, level, textures };
}
