// Places a level's props and lights from its data:
//   "props":  [{ "type": "bed", "at": [col, row], "rotation": 90, "y": 0, "options": {...} }]
//   "lights": [{ "type": "point", "at": [col, row], "height": 2.3, "color": "#f2fff0",
//                "intensity": 3, "distance": 8 }]
// Cell coordinates may be fractional; [2.5, 3] is the middle of a cell edge.
import * as THREE from 'three';
import { PROPS } from './catalog.js';

function cellToWorld(level, [col, row]) {
  return { x: col * level.cellSize, z: row * level.cellSize };
}

export function placeProps(level, textures) {
  const group = new THREE.Group();
  group.name = 'props';
  for (const prop of level.props) {
    const build = PROPS[prop.type];
    if (!build) throw new Error(`Level ${level.id}: unknown prop "${prop.type}"`);
    const object = build(textures, prop.options);
    const { x, z } = cellToWorld(level, prop.at);
    object.position.set(x, prop.y ?? 0, z);
    object.rotation.y = ((prop.rotation ?? 0) * Math.PI) / 180;
    object.userData.prop = prop;
    group.add(object);
  }
  return group;
}

export function placeLights(level) {
  const group = new THREE.Group();
  group.name = 'lights';
  for (const light of level.lights) {
    const { x, z } = cellToWorld(level, light.at);
    const point = new THREE.PointLight(light.color ?? '#ffffff', light.intensity ?? 3, light.distance ?? 8, light.decay ?? 1.2);
    point.position.set(x, light.height ?? 2.3, z);
    group.add(point);
  }
  return group;
}
