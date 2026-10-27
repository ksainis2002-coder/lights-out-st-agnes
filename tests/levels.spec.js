import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parseLevel } from '../src/levels/loader.js';
import { collides } from '../src/player/collision.js';

const dir = new URL('../src/levels/', import.meta.url);
const levels = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => [f, JSON.parse(readFileSync(new URL(f, dir), 'utf8'))]);

// Drawings and windows hang on walls: their origin must sit on a wall line
// (not behind it, or they vanish up close) and face an open cell.
for (const [file, data] of levels) {
  test(`wall decals sit on walls and face open space: ${file}`, () => {
    const level = parseLevel(data);
    for (const prop of data.props ?? []) {
      if (!['drawing', 'windowFrame'].includes(prop.type)) continue;
      const angle = ((prop.rotation ?? 0) * Math.PI) / 180;
      const facing = { x: Math.round(Math.sin(angle)), z: Math.round(Math.cos(angle)) };
      const [col, row] = prop.at;
      const onLine = facing.x !== 0 ? Number.isInteger(col) : Number.isInteger(row);
      expect(onLine, `${prop.type} at ${prop.at} is off the wall line`).toBe(true);
      const front = level.worldToCell((col + facing.x * 0.1) * level.cellSize, (row + facing.z * 0.1) * level.cellSize);
      const behind = level.worldToCell((col - facing.x * 0.1) * level.cellSize, (row - facing.z * 0.1) * level.cellSize);
      expect(level.isWall(front.col, front.row), `${prop.type} at ${prop.at} faces a wall`).toBe(false);
      expect(level.isWall(behind.col, behind.row), `${prop.type} at ${prop.at} has no wall behind it`).toBe(true);
    }
  });
}

// Outdoors, the buildings behind the facades (levels/buildings.js) stand on
// wall cells or past the map's edge, never on ground the player walks.
test('the buildings outside stand only on walls or past the edge of the map', () => {
  for (const [file, data] of levels) {
    const level = parseLevel(data);
    for (const { id, cells: [c0, r0, c1, r1] } of data.buildings ?? []) {
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const onMap = row >= 0 && row < level.rows && col >= 0 && col < level.cols;
          if (onMap) expect(level.isWall(col, row), `${file}: ${id} covers ${col},${row}`).toBe(true);
        }
      }
    }
  }
});

test('the buildings outside have walls, slate roofs up to their ridge and windows', async () => {
  const THREE = await import('three');
  const { buildBuildings } = await import('../src/levels/buildings.js');
  const data = levels.find(([file]) => file === 'grounds.json')[1];
  const textures = Object.fromEntries(['brick', 'stone', 'slate', 'sash'].map((name) => [name, new THREE.Texture()]));
  const group = buildBuildings(parseLevel(data), data.buildings, textures);
  const mesh = (name) => group.children.find((child) => child.material.map === textures[name]);
  for (const name of Object.keys(textures)) expect(mesh(name), name).toBeTruthy();
  mesh('slate').geometry.computeBoundingBox();
  const highest = Math.max(...data.buildings.map((building) => data.wallHeight + building.rise));
  expect(mesh('slate').geometry.boundingBox.max.y).toBeCloseTo(highest);
  const windows = data.buildings.flatMap((b) => (b.windows ?? []).map((w) => w.along.length * (w.storeys?.length ?? 2)));
  expect(mesh('sash').geometry.attributes.position.count).toBe(windows.reduce((a, b) => a + b, 0) * 6);
});

test('wall clock hands follow the local time', async () => {
  const { handAngles } = await import('../src/props/clocks.js');
  const at = (h, m) => handAngles(new Date(2026, 9, 10, h, m, 0));
  expect(at(3, 0).hours).toBeCloseTo(Math.PI / 2);
  expect(at(3, 0).minutes).toBeCloseTo(0);
  expect(at(15, 30).hours).toBeCloseTo((3.5 / 12) * Math.PI * 2);
  expect(at(15, 30).minutes).toBeCloseTo(Math.PI);
});

// Beds, tables, chairs and cubbies block the player. Nobody spawns inside
// one, and with every door open, each pickup and document can still be
// reached on foot (within arm's length of a walkable spot).
const RADIUS = 0.3;
const ARM = 1.4;
const playable = levels.filter(([file]) => file !== 'dorms.json'); // dorms.json only stages mockup stills
for (const [file, data] of playable) {
  test(`furniture leaves spawns free and items reachable: ${file}`, () => {
    const level = parseLevel(data);
    const open = { ...level, isSolid: level.isWall };
    for (const [name, spawn] of Object.entries(level.spawns)) {
      expect(collides(open, spawn.x, spawn.z, RADIUS), `spawn ${name} is inside something`).toBe(false);
    }
    const step = 0.1;
    const nx = Math.ceil((level.cols * level.cellSize) / step), nz = Math.ceil((level.rows * level.cellSize) / step);
    const seen = new Uint8Array(nx * nz);
    const start = Object.values(level.spawns)[0];
    const queue = [[Math.round(start.x / step), Math.round(start.z / step)]];
    seen[queue[0][1] * nx + queue[0][0]] = 1;
    const walkable = [];
    while (queue.length) {
      const [i, j] = queue.pop();
      walkable.push([i * step, j * step]);
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const a = i + di, b = j + dj;
        if (a < 0 || b < 0 || a >= nx || b >= nz || seen[b * nx + a]) continue;
        seen[b * nx + a] = 1;
        if (!collides(open, a * step, b * step, RADIUS)) queue.push([a, b]);
      }
    }
    const maps = (data.maps ?? []).filter((map) => map.at); // an entry without "at" only draws a map found elsewhere
    for (const thing of [...(data.pickups ?? []), ...(data.documents ?? []), ...maps]) {
      const x = thing.at[0] * level.cellSize, z = thing.at[1] * level.cellSize;
      const near = walkable.some(([wx, wz]) => Math.hypot(wx - x, wz - z) < ARM);
      expect(near, `${thing.id} can't be reached`).toBe(true);
    }
  });
}
