// The endings' scenes (0.5, part C; approved stills ending_road, ending_lamp,
// ending_morning, ending_walls, ending_coal), for cutscenes/ending.js. Each
// scene sets the world up as its still has it, once, and says where the
// camera stands and looks ([x, y, z] metres; null keeps your own view) and
// how the picture is (fx). Sets that are not a level ("lamp", "coal") are
// built out past the level's edge, as Nora's tape builds its cell.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { box, decal, canvasTexture } from '../props/parts.js';
import { pose } from '../props/noraStanding.js';

const SET = { x: -60, z: -60 }; // the theatre table and its lamp
const COAL = { x: -60, z: -90 }; // the coal store, at a child's height

function light(group, color, intensity, distance, [x, y, z]) {
  const l = new THREE.PointLight(color, intensity, distance, 1.3);
  l.position.set(x, y, z);
  group.add(l);
  return l;
}

function prop(group, type, [x, z], { y = 0, turn = 0, options } = {}, textures) {
  const model = PROPS[type](textures, options);
  model.position.set(x, y, z);
  model.rotation.y = (turn * Math.PI) / 180;
  group.add(model);
  return model;
}

// Dark veins spreading up a wall, for the walls that have a pulse.
function veinsTexture(seed) {
  let s = seed;
  const random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return canvasTexture(128, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const branch = (x, y, a, width, depth) => {
      const length = 10 + random() * 18;
      const x1 = x + Math.cos(a) * length;
      const y1 = y + Math.sin(a) * length;
      g.strokeStyle = `rgba(40,6,8,${0.35 + width * 0.12})`;
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x1, y1);
      g.stroke();
      if (depth > 0) [-0.5, 0.45].forEach((turn) => random() < 0.8 && branch(x1, y1, a + turn + (random() - 0.5) * 0.4, width * 0.7, depth - 1));
    };
    for (let i = 0; i < 5; i++) branch(random() * w, h, -Math.PI / 2 + (random() - 0.5) * 0.8, 3, 5);
  });
}

// Escape: the gate swinging open as you stand at it.
function gate(game) {
  const door = game.world.level.doors.find((candidate) => candidate.id === 'front_gate');
  if (door) door.open = true;
  return { camera: null };
}

// Escape: out on the road, looking back. Every dormitory window orange, the sky lit by the fire.
function road(game) {
  const { world } = game;
  world.levelGroup.traverse((o) => o.userData.prop?.type === 'rain' && (o.visible = false));
  world.scene.background = new THREE.Color('#2a140a');
  world.scene.fog = new THREE.FogExp2('#2a140a', 0.022);
  const fire = new THREE.Group();
  for (const z of [16.2, 18.4, 20.6, 22.8]) {
    for (const y of [1.7, 3.9]) {
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), new THREE.MeshBasicMaterial({ color: y > 3 ? '#ffb050' : '#ff7a20', fog: false }));
      glow.position.set(1.53, y, z);
      glow.rotation.y = Math.PI / 2;
      fire.add(glow);
    }
    light(fire, '#ff6a1a', 6, 12, [3.5, 2.6, z]);
  }
  world.levelGroup.add(fire);
  return { camera: { at: [25.2, 1.6, 34.0], look: [1.5, 2.6, 19.8] } };
}

// Escape: back in your bed, as you woke at the very start.
function bed() {
  return { camera: { at: [1.65, 0.78, 1.45], yaw: 180, pitch: 22, roll: -8 }, fx: { eyelid: 0.3, blur: 0.4 } };
}

// Acceptance: on his table, looking up into the lamp.
function lamp(game) {
  const t = game.world.textures;
  const set = new THREE.Group();
  set.position.set(SET.x, 0, SET.z);
  prop(set, 'operatingTable', [0, 0], { options: { straps: false } }, t);
  prop(set, 'theatreLamp', [0, 0], { options: { height: 3.8 } }, t);
  set.add(box(t.tile ?? t.floor, [5, 0.02, 5], [0, -0.02, 0]));
  game.world.scene.add(set);
  return { camera: { at: [SET.x, 1.05, SET.z + 0.55], look: [SET.x, 3.6, SET.z + 0.05] }, fx: { vignette: 0.55, blur: 0.6 }, set };
}

// Acceptance: a window your room never had, morning in it; Nora by it.
function morning(game) {
  const { world } = game;
  const t = world.textures;
  world.levelGroup.traverse((o) => o.isLight && !o.isAmbientLight && (o.intensity *= 0.7));
  const room = new THREE.Group();
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.25), new THREE.MeshBasicMaterial({ color: '#fff4dc', fog: false }));
  pane.position.set(4.97, 1.65, 2.4);
  pane.rotation.y = -Math.PI / 2;
  const wood = { color: '#4a3a2a' };
  const frame = new THREE.Group().add(
    box(t.wood, [0.08, 1.4, 0.06], [-0.54, 0.95, 0], wood), box(t.wood, [0.08, 1.4, 0.06], [0.54, 0.95, 0], wood),
    box(t.wood, [1.16, 0.08, 0.06], [0, 0.98, 0], wood), box(t.wood, [1.16, 0.08, 0.06], [0, 2.3, 0], wood),
    box(t.wood, [1.0, 0.04, 0.04], [0, 1.63, 0], wood), box(t.wood, [0.04, 1.25, 0.04], [0, 1.02, 0], wood),
  );
  frame.position.set(4.96, 0, 2.4);
  frame.rotation.y = -Math.PI / 2;
  const sun = new THREE.SpotLight('#ffe2b0', 80, 10, 0.8, 0.5, 1.0);
  sun.position.set(4.9, 2.0, 2.4);
  sun.target.position.set(2.0, 0, 3.6);
  room.add(pane, frame, sun, sun.target);
  light(room, '#ffd8a0', 2.5, 4, [4.4, 1.7, 2.6]);
  light(room, '#ffe0b8', 9, 3, [3.3, 1.7, 4.3]);
  const nora = game.noraFollow?.figure?.() ?? prop(room, 'noraStanding', [4.15, 3.55], { options: { pose: 'window' } }, t);
  nora.position.set(4.15, 0, 3.55);
  nora.rotation.y = (-48 * Math.PI) / 180;
  pose(nora, 'window');
  world.levelGroup.add(room);
  return { camera: { at: [2.75, 1.6, 4.95], look: [4.25, 1.42, 3.2] } };
}

// Becomes the building: your room's walls warm and veined; they have a pulse.
function walls(game) {
  const { world } = game;
  world.levelGroup.traverse((o) => o.isMesh && o.material?.color && !o.parent?.userData.prop && o.material.color.multiply(new THREE.Color('#a04434')));
  const veins = new THREE.Group();
  light(veins, '#b0402a', 4, 6, [3.0, 2.2, 3.2]);
  [[2.4, 1.02, 0], [3.9, 1.02, 0], [1.02, 3.0, 90], [4.98, 3.4, -90]].forEach(([x, z, turn], i) => {
    const wall = decal(veinsTexture(7 + i * 13), [1.6, 1.2], [0, 1.4, 0], { alphaTest: 0.2 });
    wall.position.set(x, 1.4, z);
    wall.rotation.y = (turn * Math.PI) / 180;
    veins.add(wall);
  });
  world.levelGroup.add(veins);
  return { camera: { at: [2.2, 0.95, 3.6], look: [3.2, 1.5, 1.0] }, fx: { vignette: 0.6 }, pulse: true };
}

// Becomes the building: in the coal store, a child's height, the door shutting on the corridor's light.
function coal(game) {
  const t = game.world.textures;
  const set = new THREE.Group();
  set.position.set(COAL.x, 0, COAL.z);
  set.add(
    box(t.stone ?? t.floor, [4, 0.02, 4], [0, -0.02, 0]),
    box(t.brick, [4, 2.6, 0.2], [0, 0, -2]), box(t.brick, [0.2, 2.6, 4], [-2, 0, 0]), box(t.brick, [0.2, 2.6, 4], [2, 0, 0]),
    box(t.brick, [1.6, 2.6, 0.2], [-1.2, 0, 2]), box(t.brick, [1.6, 2.6, 0.2], [1.2, 0, 2]), box(t.brick, [0.8, 0.5, 0.2], [0, 2.1, 2]),
  );
  const door = box(t.door, [0.8, 2.1, 0.05], [0.4, 0, 0]);
  const hinge = new THREE.Group().add(door);
  hinge.position.set(-0.4, 0, 2.0);
  hinge.rotation.y = -0.17; // a hand's breadth left
  set.add(hinge);
  prop(set, 'coalHeap', [1.0, -0.6], { turn: 25 }, t);
  light(set, '#e0c890', 14, 7, [0.3, 1.6, 3.2]); // the corridor, out there
  game.world.scene.add(set);
  return { camera: { at: [COAL.x - 0.4, 0.85, COAL.z - 1.4], look: [COAL.x + 0.1, 0.95, COAL.z + 2] }, fx: { vignette: 0.4 }, set };
}

export const SCENES = { gate, road, bed, lamp, morning, walls, coal, black: () => ({ camera: null, fx: { fade: 1 } }), room: () => ({ camera: null }) };
