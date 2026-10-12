// Circle collision (top-down, x/z) against the level's solid cells and the
// footprints of solid props (beds, tables...).

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
  return (level.obstacles ?? []).some((box) => {
    const nearestX = Math.max(box.minX, Math.min(x, box.maxX));
    const nearestZ = Math.max(box.minZ, Math.min(z, box.maxZ));
    return (x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius * radius;
  });
}

// Moves one axis at a time so the player slides along walls. Someone already
// overlapping (spawned or loaded against a bed) may still move, to step out.
export function moveWithCollision(level, position, dx, dz, radius) {
  const stuck = collides(level, position.x, position.z, radius);
  if (stuck || !collides(level, position.x + dx, position.z, radius)) position.x += dx;
  if (stuck || !collides(level, position.x, position.z + dz, radius)) position.z += dz;
}
