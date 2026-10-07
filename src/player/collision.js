// Circle-vs-grid collision on the level's solid cells (top-down, x/z).

export function collides(level, x, z, radius) {
  const s = level.cellSize;
  const c0 = Math.floor((x - radius) / s), c1 = Math.floor((x + radius) / s);
  const r0 = Math.floor((z - radius) / s), r1 = Math.floor((z + radius) / s);
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      if (!level.isSolid(col, row)) continue;
      const nearestX = Math.max(col * s, Math.min(x, (col + 1) * s));
      const nearestZ = Math.max(row * s, Math.min(z, (row + 1) * s));
      if ((x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius * radius) return true;
    }
  }
  return false;
}

// Moves one axis at a time so the player slides along walls.
export function moveWithCollision(level, position, dx, dz, radius) {
  if (!collides(level, position.x + dx, position.z, radius)) position.x += dx;
  if (!collides(level, position.x, position.z + dz, radius)) position.z += dz;
}
