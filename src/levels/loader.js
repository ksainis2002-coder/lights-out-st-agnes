// Turns wing JSON into a queryable level: grid lookups, world/cell
// conversion, rooms and triggers as world-space boxes.

export function parseLevel(data) {
  const { cellSize, wallHeight, map, legend } = data;
  const rows = map.length;
  const cols = Math.max(...map.map((row) => row.length));

  const charAt = (col, row) => map[row]?.[col] ?? '1';
  const kindAt = (col, row) => legend[charAt(col, row)] ?? 'plaster';
  const isSolid = (col, row) => kindAt(col, row) !== 'floor';

  const cellCenter = (col, row) => ({ x: (col + 0.5) * cellSize, z: (row + 0.5) * cellSize });
  const worldToCell = (x, z) => ({ col: Math.floor(x / cellSize), row: Math.floor(z / cellSize) });

  const cellBox = ([c0, r0, c1, r1], height = wallHeight) => ({
    min: { x: c0 * cellSize, y: 0, z: r0 * cellSize },
    max: { x: (c1 + 1) * cellSize, y: height, z: (r1 + 1) * cellSize },
  });

  const rooms = (data.rooms ?? []).map((room) => ({ id: room.id, box: cellBox(room.cells) }));
  const triggers = (data.triggers ?? []).map((trigger) => ({
    id: trigger.id,
    box: cellBox(trigger.cells, trigger.height),
  }));

  const spawnCenter = cellCenter(...data.spawn.cell);
  const spawn = { x: spawnCenter.x, z: spawnCenter.z, yaw: (data.spawn.yawDegrees * Math.PI) / 180 };

  return {
    id: data.id,
    wing: data.wing,
    cellSize,
    wallHeight,
    floorTexture: data.floorTexture ?? 'floor',
    ceilingTexture: data.ceilingTexture ?? 'ceiling',
    props: data.props ?? [],
    lights: data.lights ?? [],
    rows,
    cols,
    kindAt,
    isSolid,
    cellCenter,
    worldToCell,
    rooms,
    triggers,
    spawn,
  };
}

export function insideBox(box, point) {
  return (
    point.x >= box.min.x && point.x <= box.max.x &&
    point.z >= box.min.z && point.z <= box.max.z &&
    point.y >= box.min.y && point.y <= box.max.y
  );
}

export function roomAt(level, point) {
  return level.rooms.find((room) => insideBox(room.box, { ...point, y: 0 }))?.id ?? null;
}
