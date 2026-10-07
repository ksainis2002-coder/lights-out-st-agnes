// Builds Three.js meshes for a parsed level: one merged mesh per material.
// Floors and ceilings per open cell; a wall face wherever an open cell
// touches a solid one. Walls are split in two rows so the affine warp
// stays PS1-like instead of tearing whole faces.
import * as THREE from 'three';
import { createPs1Material } from '../render/ps1Material.js';

const SIDES = [
  { dc: 0, dr: -1, normal: [0, 0, 1] },
  { dc: 0, dr: 1, normal: [0, 0, -1] },
  { dc: -1, dr: 0, normal: [1, 0, 0] },
  { dc: 1, dr: 0, normal: [-1, 0, 0] },
];
const WALL_ROWS = 2;

function createBucket() {
  return { positions: [], normals: [], uvs: [] };
}

// Adds a quad from 4 corners (counter-clockwise when seen from the front).
function addQuad(bucket, corners, normal, uvs) {
  for (const i of [0, 1, 2, 0, 2, 3]) {
    bucket.positions.push(...corners[i]);
    bucket.normals.push(...normal);
    bucket.uvs.push(...uvs[i]);
  }
}

function addFloorAndCeiling(buckets, level, col, row) {
  const s = level.cellSize;
  const h = level.wallHeight;
  const x0 = col * s, x1 = x0 + s, z0 = row * s, z1 = z0 + s;
  const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
  addQuad(buckets.floor, [[x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x0, 0, z0]], [0, 1, 0], uv);
  addQuad(buckets.ceiling, [[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], [0, -1, 0], uv);
}

// Wall face on the edge between open cell (col,row) and its solid neighbour.
function addWall(bucket, level, col, row, side) {
  const s = level.cellSize;
  const cx = (col + 0.5) * s, cz = (row + 0.5) * s;
  const [nx, , nz] = side.normal;
  const ex = cx - nx * s * 0.5, ez = cz - nz * s * 0.5; // edge centre
  const tx = nz, tz = -nx; // tangent: u runs left to right when facing the wall
  const a = [ex - tx * s * 0.5, ez - tz * s * 0.5];
  const b = [ex + tx * s * 0.5, ez + tz * s * 0.5];
  for (let i = 0; i < WALL_ROWS; i++) {
    const v0 = i / WALL_ROWS, v1 = (i + 1) / WALL_ROWS;
    const y0 = v0 * level.wallHeight, y1 = v1 * level.wallHeight;
    const corners = [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]];
    addQuad(bucket, corners, side.normal, [[0, v0], [1, v0], [1, v1], [0, v1]]);
  }
}

function toMesh(bucket, texture) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bucket.normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(bucket.uvs, 2));
  return new THREE.Mesh(geometry, createPs1Material(texture));
}

export function buildLevelMeshes(level, textures) {
  const buckets = { floor: createBucket(), ceiling: createBucket(), plaster: createBucket(), door: createBucket() };
  for (let row = 0; row < level.rows; row++) {
    for (let col = 0; col < level.cols; col++) {
      if (level.isSolid(col, row)) continue;
      addFloorAndCeiling(buckets, level, col, row);
      for (const side of SIDES) {
        if (!level.isSolid(col + side.dc, row + side.dr)) continue;
        const kind = level.kindAt(col + side.dc, row + side.dr);
        addWall(buckets[kind] ?? buckets.plaster, level, col, row, side);
      }
    }
  }
  const group = new THREE.Group();
  group.name = `level:${level.id}`;
  for (const [name, bucket] of Object.entries(buckets)) {
    if (bucket.positions.length) group.add(toMesh(bucket, textures[name]));
  }
  return group;
}
