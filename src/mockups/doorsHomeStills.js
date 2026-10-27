// Proposal stills (owner 2026-10-27: "show me the stills first then ill
// choose"). The patient room is the only safe place; these show ways back to
// it from the school, and the room changing as you play. Doors home: the
// patient room's own door set out of place in a school wall, in the staff
// room (part A) and the headmaster's flat (part B), and the staff room seen
// through the hub's door when you leave by it. Or instead a safe room in each
// part, its door marked with the map's green crayon house. And the hub after
// each part of the wing.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';
import { parseLevel } from '../levels/loader.js';
import { buildLevelMeshes } from '../levels/build.js';
import { createDoors } from '../levels/doors.js';
import { placeProps, placeLights } from '../props/place.js';
import { aim } from './helpers.js';
import schoolGround from '../levels/school_ground.json';
import schoolUpper from '../levels/school_upper.json';
import patientRoom from '../levels/patient_room.json';

const CELL = schoolGround.cellSize;
const inSchool = ([col, row]) => [col * CELL, row * CELL];
// The doors home, on the east walls (wall line, metres), facing west.
const STAFF_DOOR = inSchool([46, 17]);
const FLAT_DOOR = inSchool([43, 6.2]);
const FACING_WEST = -Math.PI / 2;
// The outer edge of the hub's doorway (patient room cell [2,6]).
const HUB_DOORWAY = [2.5, 7.0];

function add(world, type, [x, z], turn = 0, options = {}) {
  const object = PROPS[type](world.textures, options);
  object.position.set(x, 0, z);
  object.rotation.y = turn;
  world.scene.add(object);
  return object;
}

// The camera at a point (metres, eye height y) looking at another.
function look(world, [x, z], [tx, tz], y = 1.6, toY = 1.2) {
  const yaw = Math.atan2(-(tx - x), -(tz - z));
  const pitch = Math.atan2(toY - y, Math.hypot(tx - x, tz - z));
  aim(world.camera, [x, y, z], (yaw * 180) / Math.PI, (pitch * 180) / Math.PI);
}

function openHubDoor(world) {
  world.doors.panels.forEach(({ door, hinge }) => {
    door.open = true;
    door.angle = -Math.PI / 2;
    hinge.rotation.y = door.angle;
  });
}

// The hub's doorway ends in a tiled face where the map ends; cut it away so
// the room beyond shows through.
function cutDoorwayEnd(world) {
  const meshes = world.levelGroup.children.find((child) => child.name === world.levelGroup.name);
  const onEnd = (position, i) => Math.abs(position.getZ(i) - HUB_DOORWAY[1]) < 1e-3 && Math.abs(position.getX(i) - HUB_DOORWAY[0]) < 0.51;
  meshes.children.forEach(({ geometry }) => {
    const position = geometry.attributes.position;
    const keep = [];
    for (let i = 0; i < position.count; i += 3) {
      if (![i, i + 1, i + 2].every((vertex) => onEnd(position, vertex))) keep.push(i, i + 1, i + 2);
    }
    for (const [name, attribute] of Object.entries(geometry.attributes)) {
      const size = attribute.itemSize;
      const values = keep.flatMap((vertex) => Array.from(attribute.array.slice(vertex * size, vertex * size + size)));
      geometry.setAttribute(name, new THREE.Float32BufferAttribute(values, size));
    }
  });
}

// The school's ground floor built a second time beyond the hub's open door,
// turned so the staff room's door home lies against the hub's doorway: the
// room you would walk out into. Its east wall faces away from the hub, so
// from inside the hub you see straight through it.
function staffRoomBeyond(world) {
  const level = parseLevel(schoolGround);
  const school = new THREE.Group();
  school.add(
    buildLevelMeshes(level, world.textures),
    placeProps(level, world.textures),
    placeLights(level),
    createDoors(level, world.textures).group,
  );
  school.rotation.y = Math.PI / 2; // the staff room's west is the hub's south
  const [x, z] = STAFF_DOOR;
  school.position.set(HUB_DOORWAY[0] - z, 0, HUB_DOORWAY[1] + x);
  world.scene.add(school);
  // The school's own ambient light stands in for the hub's dimmer one only
  // beyond the door: two short-reach lights in the staff room.
  [[1.4, 10.4], [1.4, 12.8]].forEach(([lx, lz]) => {
    const fill = new THREE.PointLight('#8a98c8', 3.6, 5, 1.2);
    fill.position.set(lx, 2.6, lz);
    world.scene.add(fill);
  });
}

// The hub after each part of the wing: after A, Maggie's skipping drawing
// beside the horse; after B, damp running down the tiles; after C, tiles
// fallen and the lamp weaker (as the approved hub_return).
function hubAfter(world, part) {
  add(world, 'drawing', [2.2, 1.0], 0, { kind: 'skipping' });
  if (part === 'A') return;
  const missing = part === 'C';
  add(world, 'tileDecay', [1.7, 1.0], 0, { width: 1.8, height: 1.6, y: 1.2, seed: 3, missing });
  add(world, 'tileDecay', [1.0, 3.6], Math.PI / 2, { width: 1.2, height: 1.0, y: 0.9, seed: 8, missing });
  if (part === 'B') return;
  add(world, 'fallenTiles', [1.6, 1.2], 0, { seed: 5 });
  world.levelGroup.traverse((object) => {
    if (object.isPointLight) object.intensity *= 0.55;
  });
}

function hubStill(part) {
  return {
    level: patientRoom,
    setup({ world }) {
      hubAfter(world, part);
      world.flashlight.toggle();
      aim(world.camera, [3.0, 1.6, 5.6], 8, -6);
    },
  };
}

export const DOORS_HOME_STILLS = {
  // 1a: the patient room's door in the staff room's east wall, near the
  // tape recorder, its green tiles spreading into the school's paint.
  door_home_staff: {
    level: schoolGround,
    setup({ world }) {
      add(world, 'hubDoorway', STAFF_DOOR, FACING_WEST);
      look(world, [50.4, 21.9], [STAFF_DOOR[0], STAFF_DOOR[1] - 0.2], 1.6, 1.1);
    },
  },
  // 1a: the same door in the headmaster's flat, between bed and washstand.
  door_home_flat: {
    level: schoolUpper,
    setup({ world }) {
      add(world, 'hubDoorway', FLAT_DOOR, FACING_WEST);
      look(world, [46.0, 10.0], FLAT_DOOR, 1.6, 1.1);
    },
  },
  // 1a: leaving the hub by its own door, you walk out into the staff room.
  door_home_open: {
    level: patientRoom,
    setup({ world }) {
      openHubDoor(world);
      cutDoorwayEnd(world);
      staffRoomBeyond(world);
      aim(world.camera, [2.55, 1.6, 4.8], 180, -4);
    },
  },
  // 1c: the staff room as part A's safe room, the map's green crayon house
  // drawn on its door.
  safe_room_staff: {
    level: schoolGround,
    setup({ world }) {
      add(world, 'crayonHouse', [51.0, 14.97], Math.PI);
      look(world, [51.9, 12.45], [51.0, 14.97], 1.6, 1.35);
    },
  },
  // 2a: the hub a little worse after each part.
  hub_after_A: hubStill('A'),
  hub_after_B: hubStill('B'),
  hub_after_C: hubStill('C'),
};
