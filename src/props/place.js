// Places a level's props and lights from its data:
//   "props":  [{ "type": "bed", "at": [col, row], "rotation": 90, "y": 0, "options": {...} }]
//   "lights": [{ "type": "point", "at": [col, row], "height": 2.3, "color": "#f2fff0",
//                "intensity": 3, "distance": 8 }]
// Cell coordinates may be fractional; [2.5, 3] is the middle of a cell edge.
import * as THREE from 'three';
import { PROPS } from './catalog.js';
import { mergeStaticProps } from './merge.js';
import { asMoved, movesOf } from './moves.js';

function cellToWorld(level, [col, row]) {
  return { x: col * level.cellSize, z: row * level.cellSize };
}

function placed(level, textures, prop, set) {
  const build = PROPS[prop.type];
  if (!build) throw new Error(`Level ${level.id}: unknown prop "${prop.type}"`);
  const object = build(textures, prop.options);
  const { x, z } = cellToWorld(level, prop.at);
  object.position.set(x, prop.y ?? 0, z);
  object.rotation.y = ((prop.rotation ?? 0) * Math.PI) / 180;
  object.userData.prop = prop;
  if (set) object.userData.set = set;
  return object;
}

// A prop with "moved" (props/moves.js) is built both ways when nothing else
// changes it, for two merged sets; with an id it is built once and turns.
export function placeProps(level, textures) {
  const group = new THREE.Group();
  group.name = 'props';
  for (const prop of level.props) {
    if (prop.moved && !prop.id && !prop.live) {
      group.add(placed(level, textures, prop, { flag: prop.moved.flag, moved: false }));
      group.add(placed(level, textures, asMoved(prop), { flag: prop.moved.flag, moved: true }));
      continue;
    }
    const object = placed(level, textures, prop);
    if (prop.moved) object.userData.moves = movesOf(prop);
    group.add(object);
  }
  return mergeStaticProps(group);
}

// The placed object of the prop with this id (props with an id are never
// merged), or null.
export function findProp(root, id) {
  let found = null;
  root.traverse((object) => {
    if (object.userData.prop?.id === id) found = object;
  });
  return found;
}

export function placeLights(level) {
  const group = new THREE.Group();
  group.name = 'lights';
  for (const light of level.lights) {
    const { x, z } = cellToWorld(level, light.at);
    const point = new THREE.PointLight(light.color ?? '#ffffff', light.intensity ?? 3, light.distance ?? 8, light.decay ?? 1.2);
    point.position.set(x, light.height ?? 2.3, z);
    point.userData.light = light; // so power cuts can switch it (levels/power.js)
    group.add(point);
  }
  return group;
}
