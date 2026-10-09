// Builds Three.js meshes for a parsed level: one merged mesh per material.
// Floors and ceilings per open cell; a wall face wherever an open cell
// touches a solid one. Faces are split into a small grid so the affine
// warp stays PS1-like instead of tearing whole faces.
import * as THREE from 'three';
import { createPs1Material } from '../render/ps1Material.js';

const SIDES = [
  { dc: 0, dr: -1, normal: [0, 0, 1] },
  { dc: 0, dr: 1, normal: [0, 0, -1] },
  { dc: -1, dr: 0, normal: [1, 0, 0] },
  { dc: 1, dr: 0, normal: [-1, 0, 0] },
];
const SPLIT = 3; // segments per face edge

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

// Adds a face spanned by origin + u*edgeU + v*edgeV, split SPLIT×SPLIT.
// Texture coordinates run 0..1 across the whole face.
function addFace(bucket, origin, edgeU, edgeV, normal) {
  const point = (u, v) => origin.map((o, i) => o + edgeU[i] * u + edgeV[i] * v);
  for (let j = 0; j < SPLIT; j++) {
    for (let i = 0; i < SPLIT; i++) {
      const u0 = i / SPLIT, u1 = (i + 1) / SPLIT, v0 = j / SPLIT, v1 = (j + 1) / SPLIT;
      const corners = [point(u0, v0), point(u1, v0), point(u1, v1), point(u0, v1)];
      addQuad(bucket, corners, normal, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
    }
  }
}

function addFloorAndCeiling(bucketFor, level, col, row) {
  const s = level.cellSize;
  const h = level.wallHeight;
  const x0 = col * s, z0 = row * s;
  addFace(bucketFor(level.floorTexture), [x0, 0, z0 + s], [s, 0, 0], [0, 0, -s], [0, 1, 0]);
  addFace(bucketFor(level.ceilingTexture), [x0, h, z0], [s, 0, 0], [0, 0, s], [0, -1, 0]);
}

// Wall face on the edge between open cell (col,row) and its solid neighbour.
function addWall(bucket, level, col, row, side) {
  const s = level.cellSize;
  const [nx, , nz] = side.normal;
  const ex = (col + 0.5) * s - nx * s * 0.5; // edge centre
  const ez = (row + 0.5) * s - nz * s * 0.5;
  const tx = nz, tz = -nx; // tangent: u runs left to right when facing the wall
  const origin = [ex - tx * s * 0.5, 0, ez - tz * s * 0.5];
  addFace(bucket, origin, [tx * s, 0, tz * s], [0, level.wallHeight, 0], side.normal);
}

function toMesh(bucket, texture) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bucket.normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(bucket.uvs, 2));
  return new THREE.Mesh(geometry, createPs1Material(texture));
}

// Wall cells name their texture through the level legend ("1": "plaster").
export function buildLevelMeshes(level, textures) {
  const buckets = new Map();
  const bucketFor = (name) => {
    if (!buckets.has(name)) buckets.set(name, createBucket());
    return buckets.get(name);
  };
  for (let row = 0; row < level.rows; row++) {
    for (let col = 0; col < level.cols; col++) {
      if (level.isSolid(col, row)) continue;
      addFloorAndCeiling(bucketFor, level, col, row);
      for (const side of SIDES) {
        if (!level.isSolid(col + side.dc, row + side.dr)) continue;
        addWall(bucketFor(level.kindAt(col + side.dc, row + side.dr)), level, col, row, side);
      }
    }
  }
  const group = new THREE.Group();
  group.name = `level:${level.id}`;
  for (const [name, bucket] of buckets) {
    if (!textures[name]) throw new Error(`Level ${level.id}: unknown texture "${name}"`);
    group.add(toMesh(bucket, textures[name]));
  }
  return group;
}
