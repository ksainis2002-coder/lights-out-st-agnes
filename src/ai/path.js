// Where the watcher may go and the way there: a breadth-first search over the
// level's cells. She keeps to her rooms (the level's "territory": the
// corridor, library, gym, entrance hall and back stairs) and the doorways
// between two of them; wall cells and closed doors stop her, and so does a
// cell whose middle is taken by furniture. The other rooms are safe.

const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function createPathing(level, territory) {
  const inTerritory = (col, row) => territory.includes(level.roomAtCell(col, row)?.id);
  // A cell's middle half (a quarter of its area) overlapped by a furniture footprint.
  const furnished = (col, row) => {
    const s = level.cellSize;
    const [minX, maxX, minZ, maxZ] = [(col + 0.25) * s, (col + 0.75) * s, (row + 0.25) * s, (row + 0.75) * s];
    return level.obstacles.some((box) => !box.mover && box.minX < maxX && box.maxX > minX && box.minZ < maxZ && box.maxZ > minZ);
  };
  const doorway = (col, row) => {
    if (!level.doorAt(col, row)) return false;
    const sides = SIDES.filter(([dc, dr]) => inTerritory(col + dc, row + dr));
    return sides.length >= 2;
  };
  // Fixed for the level: in her rooms (or a doorway between two) and not furnished.
  const open = [];
  for (let row = 0; row < level.rows; row++) {
    for (let col = 0; col < level.cols; col++) {
      open[row * level.cols + col] = (inTerritory(col, row) || doorway(col, row)) && !furnished(col, row);
    }
  }
  const walkable = (col, row) =>
    col >= 0 && row >= 0 && col < level.cols && row < level.rows && open[row * level.cols + col] && !level.isSolid(col, row);

  // Cells from "from" to the reachable cell nearest the target point
  // (the target's own cell when she can get there). [] when she is stuck.
  function route(from, to) {
    const start = level.worldToCell(from.x, from.z);
    if (!walkable(start.col, start.row)) return [];
    const key = (col, row) => row * level.cols + col;
    const cameFrom = new Map([[key(start.col, start.row), null]]);
    const queue = [start];
    let best = start;
    let bestDistance = Infinity;
    while (queue.length) {
      const cell = queue.shift();
      const centre = level.cellCenter(cell.col, cell.row);
      const distance = Math.hypot(centre.x - to.x, centre.z - to.z);
      if (distance < bestDistance) {
        best = cell;
        bestDistance = distance;
      }
      for (const [dc, dr] of SIDES) {
        const next = { col: cell.col + dc, row: cell.row + dr };
        const k = key(next.col, next.row);
        if (cameFrom.has(k) || !walkable(next.col, next.row)) continue;
        cameFrom.set(k, cell);
        queue.push(next);
      }
    }
    const cells = [];
    for (let cell = best; cell; cell = cameFrom.get(key(cell.col, cell.row))) cells.unshift(cell);
    return cells.map((cell) => level.cellCenter(cell.col, cell.row));
  }

  return {
    route,
    walkable,
    // True when she could stand where this point is (the player in her rooms).
    reachable: (point) => {
      const cell = level.worldToCell(point.x, point.z);
      return walkable(cell.col, cell.row);
    },
  };
}
