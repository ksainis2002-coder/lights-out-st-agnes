import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { parseLevel } from '../src/levels/loader.js';

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

test('wall clock hands follow the local time', async () => {
  const { handAngles } = await import('../src/props/clocks.js');
  const at = (h, m) => handAngles(new Date(2026, 9, 10, h, m, 0));
  expect(at(3, 0).hours).toBeCloseTo(Math.PI / 2);
  expect(at(3, 0).minutes).toBeCloseTo(0);
  expect(at(15, 30).hours).toBeCloseTo((3.5 / 12) * Math.PI * 2);
  expect(at(15, 30).minutes).toBeCloseTo(Math.PI);
});
