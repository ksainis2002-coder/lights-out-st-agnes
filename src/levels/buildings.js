// Outdoor buildings behind the map's facades (owner 2026-10-27: from outside
// they looked like flat walls with no depth from the side). Each entry in a
// level's "buildings" list is a body behind its facade: side walls, a pitched
// slate roof with gable ends, and chimneys. They stand past the wall cells
// that already block the way, so they are seen but never reached.
//
//   "buildings": [{ "id": "school", "cells": [21, 10, 30, 23], "wall": "brick",
//     "ridge": "z", "rise": 5, "chimneys": [[25, 12]],
//     "windows": [{ "side": "north", "along": [2.5, 5.5] }] }]
//
// cells [c0, r0, c1, r1] (inclusive) may run past the map's edge; "ridge" is
// the axis the roof's ridge runs along ("x" or "z"). Where a body's wall lies
// on a facade of the map, the facade wins the depth test (its windows and
// doors stay in front); the body only fills in where the map has no face.
// Windows go on the walls the map has no facade on: "along" is metres from
// the wall's left end seen from outside; one on each storey ("storeys": the
// heights of their sills), "size" [w, h] as the facades' windows by default.
import * as THREE from 'three';
import { createPs1Material } from '../render/ps1Material.js';

const TILE = 1.5; // metres per texture repeat, as on the facades
const STEP = 1.5; // faces split into squares this size, so the affine warp stays small
const OVERHANG = 0.35; // the roof past the walls
const CHIMNEY = { width: 0.9, depth: 0.7, above: 1.4 }; // metres; tops this far over the roof
const BEHIND = { polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }; // loses to a facade on the same plane
const WINDOW = { size: [1.0, 1.5], storeys: [1.0, 4.4], out: 0.03 }; // as the facades' windows (props/outdoors.js)

function createBucket() {
  return { positions: [], normals: [], uvs: [] };
}

function cross([ax, ay, az], [bx, by, bz]) {
  const n = [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
  const length = Math.hypot(...n);
  return n.map((v) => v / length);
}

// A face from origin along edgeU (left to right seen from the front) and
// edgeV (up it), split into a grid. `shape(u, v)` may move a grid point
// (gables narrow to their apex). The texture repeats every TILE metres: on
// walls up the world's y, so walls and gables line up; on roofs and tops
// (`flat`) along the face itself.
function addFace(bucket, place, origin, edgeU, edgeV, { shape = (u, v) => [u, v], flat = false } = {}) {
  const lengthU = Math.hypot(...edgeU);
  const lengthV = Math.hypot(...edgeV);
  const nu = Math.max(1, Math.round(lengthU / STEP));
  const nv = Math.max(1, Math.round(lengthV / STEP));
  const normal = place.normal(cross(edgeU, edgeV));
  const vertex = (i, j) => {
    const [u, v] = shape(i / nu, j / nv);
    const local = origin.map((o, k) => o + edgeU[k] * u + edgeV[k] * v);
    return { position: place.point(local), uv: [(u * lengthU) / TILE, (flat ? v * lengthV : local[1]) / TILE] };
  };
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const corners = [vertex(i, j), vertex(i + 1, j), vertex(i + 1, j + 1), vertex(i, j + 1)];
      for (const c of [0, 1, 2, 0, 2, 3]) {
        bucket.positions.push(...corners[c].position);
        bucket.normals.push(...normal);
        bucket.uvs.push(...corners[c].uv);
      }
    }
  }
}

// Local frame: the ridge runs along z. A ridge along the world's x turns
// the frame a quarter (local x = -world z, local z = world x), so faces keep
// their winding; `side` names a world side in the local frame.
function frame(ridge) {
  if (ridge !== 'x') return { point: (p) => p, normal: (n) => n, side: (name) => name };
  const turn = ([x, y, z]) => [z, y, -x];
  const local = { west: 'north', east: 'south', south: 'west', north: 'east' };
  return { point: turn, normal: turn, side: (name) => local[name] };
}

function localBox(building, s) {
  const [c0, r0, c1, r1] = building.cells;
  const [x0, x1, z0, z1] = [c0 * s, (c1 + 1) * s, r0 * s, (r1 + 1) * s];
  return building.ridge === 'x' ? { x0: -z1, x1: -z0, z0: x0, z1: x1 } : { x0, x1, z0, z1 };
}

// A body's four walls: where each starts (its left end seen from outside),
// which way it runs, and which way it faces.
function wallSides({ x0, x1, z0, z1 }) {
  const width = x1 - x0, length = z1 - z0;
  return {
    north: { origin: [x1, 0, z0], edge: [-width, 0, 0], out: [0, 0, -1] },
    south: { origin: [x0, 0, z1], edge: [width, 0, 0], out: [0, 0, 1] },
    west: { origin: [x0, 0, z0], edge: [0, 0, length], out: [-1, 0, 0] },
    east: { origin: [x1, 0, z1], edge: [0, 0, -length], out: [1, 0, 0] },
  };
}

// Four walls up to the eaves, and the gables on the ends.
function addWalls(wall, place, box, eaves, rise) {
  const sides = wallSides(box);
  for (const { origin, edge } of Object.values(sides)) addFace(wall, place, origin, edge, [0, eaves, 0]);
  // The gables: a wall strip from the eaves to the ridge, narrowed to a point.
  const narrow = (u, v) => [0.5 + (u - 0.5) * (1 - v), v];
  for (const name of ['north', 'south']) {
    const { origin, edge } = sides[name];
    addFace(wall, place, [origin[0], eaves, origin[2]], edge, [0, rise, 0], { shape: narrow });
  }
}

// One quad per window, the whole sash texture on it, just proud of the wall.
function addWindows(glass, place, box, windows) {
  const sides = wallSides(box);
  for (const { side, along, storeys = WINDOW.storeys, size: [w, h] = WINDOW.size } of windows) {
    const { origin, edge, out } = sides[place.side(side)];
    const run = edge.map((v) => v / Math.hypot(...edge));
    for (const a of along) {
      for (const sill of storeys) {
        const at = (u, v) => origin.map((o, k) => o + run[k] * (a + (u - 0.5) * w) + out[k] * WINDOW.out + (k === 1 ? sill + v * h : 0));
        const corners = [[0, 0], [1, 0], [1, 1], [0, 1]];
        for (const c of [0, 1, 2, 0, 2, 3]) {
          glass.positions.push(...place.point(at(...corners[c])));
          glass.normals.push(...place.normal(out));
          glass.uvs.push(...corners[c]);
        }
      }
    }
  }
}

function addRoof(roof, place, box, eaves, rise) {
  const { x0, x1, z0, z1 } = box;
  const middle = (x0 + x1) / 2;
  const drop = (OVERHANG * rise) / (middle - x0); // the eaves dip as the slope runs on
  const along = z1 - z0 + 2 * OVERHANG;
  addFace(roof, place, [x0 - OVERHANG, eaves - drop, z0 - OVERHANG], [0, 0, along], [middle - x0 + OVERHANG, rise + drop, 0], { flat: true });
  addFace(roof, place, [x1 + OVERHANG, eaves - drop, z1 + OVERHANG], [0, 0, -along], [-(x1 - middle + OVERHANG), rise + drop, 0], { flat: true });
}

// A chimney stack from inside the roof to a little above it, where it stands.
function addChimney(wall, place, box, eaves, rise, [x, z]) {
  const middle = (box.x0 + box.x1) / 2;
  const roofAt = eaves + rise * (1 - Math.abs(x - middle) / (middle - box.x0));
  const top = roofAt + CHIMNEY.above;
  const { width: w, depth: d } = CHIMNEY;
  const stack = { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 };
  const base = eaves - 1; // starts below the roof, so it never floats
  const height = top - base;
  const sides = [
    [[stack.x1, base, stack.z0], [-w, 0, 0]],
    [[stack.x0, base, stack.z1], [w, 0, 0]],
    [[stack.x0, base, stack.z0], [0, 0, d]],
    [[stack.x1, base, stack.z1], [0, 0, -d]],
  ];
  for (const [origin, edge] of sides) addFace(wall, place, origin, edge, [0, height, 0]);
  addFace(wall, place, [stack.x0, top, stack.z1], [w, 0, 0], [0, 0, -d], { flat: true }); // its top
}

function toMesh(bucket, texture) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bucket.normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(bucket.uvs, 2));
  return new THREE.Mesh(geometry, createPs1Material(texture, BEHIND));
}

export function buildBuildings(level, buildings, textures) {
  const group = new THREE.Group();
  group.name = 'buildings';
  const buckets = new Map();
  const bucketFor = (name) => {
    if (!buckets.has(name)) buckets.set(name, createBucket());
    return buckets.get(name);
  };
  const s = level.cellSize;
  for (const building of buildings) {
    const place = frame(building.ridge);
    const box = localBox(building, s);
    const eaves = building.eaves ?? level.wallHeight;
    const rise = building.rise ?? 4;
    const wall = bucketFor(building.wall);
    addWalls(wall, place, box, eaves, rise);
    addRoof(bucketFor(building.roof ?? 'slate'), place, box, eaves, rise);
    addWindows(bucketFor('sash'), place, box, building.windows ?? []);
    for (const [col, row] of building.chimneys ?? []) {
      const [x, z] = building.ridge === 'x' ? [-row * s, col * s] : [col * s, row * s];
      addChimney(bucketFor(building.chimneyWall ?? building.wall), place, box, eaves, rise, [x, z]);
    }
  }
  for (const [name, bucket] of buckets) {
    if (!textures[name]) throw new Error(`Level ${level.id}: unknown texture "${name}"`);
    group.add(toMesh(bucket, textures[name]));
  }
  return group;
}
