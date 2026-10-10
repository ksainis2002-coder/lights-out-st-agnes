// Turns level JSON into a queryable level: grid lookups, world/cell
// conversion, rooms (with optional wall/floor/ceiling textures), doors,
// spawn points and triggers as world-space boxes.
//
// Doors: "doors": [{ "id": "office", "cell": [c, r], "locked": "office_key",
//   "hidden": true, "exit": { "level": "patient_room", "spawn": "door" } }]
// A door cell blocks movement while closed. A door with "exit" never opens;
// using it moves the player to another level.

export function parseLevel(data) {
  const { cellSize, wallHeight, map, legend } = data;
  const rows = map.length;
  const cols = Math.max(...map.map((row) => row.length));

  const cellCenter = (col, row) => ({ x: (col + 0.5) * cellSize, z: (row + 0.5) * cellSize });
  const worldToCell = (x, z) => ({ col: Math.floor(x / cellSize), row: Math.floor(z / cellSize) });
  const cellBox = ([c0, r0, c1, r1], height = wallHeight) => ({
    min: { x: c0 * cellSize, y: 0, z: r0 * cellSize },
    max: { x: (c1 + 1) * cellSize, y: height, z: (r1 + 1) * cellSize },
  });

  const doors = (data.doors ?? []).map((door) => ({ ...door, open: false, angle: 0 }));
  const doorByCell = new Map(doors.map((door) => [`${door.cell[0]},${door.cell[1]}`, door]));
  const doorAt = (col, row) => doorByCell.get(`${col},${row}`) ?? null;

  const charAt = (col, row) => map[row]?.[col] ?? '1';
  const kindAt = (col, row) => legend[charAt(col, row)] ?? 'plaster';
  const isWall = (col, row) => kindAt(col, row) !== 'floor' && !doorAt(col, row);
  const isSolid = (col, row) => {
    const door = doorAt(col, row);
    return door ? !door.open : isWall(col, row);
  };

  const rooms = (data.rooms ?? []).map((room) => ({ ...room, box: cellBox(room.cells) }));
  const roomAtCell = (col, row) =>
    rooms.find(({ cells: [c0, r0, c1, r1] }) => col >= c0 && col <= c1 && row >= r0 && row <= r1) ?? null;

  const textures = {
    floor: (col, row) => roomAtCell(col, row)?.floor ?? data.floorTexture ?? 'floor',
    ceiling: (col, row) => roomAtCell(col, row)?.ceiling ?? data.ceilingTexture ?? 'ceiling',
    // A wall face takes the texture of the room it faces, else the wall cell's own.
    wall: (openCol, openRow, wallCol, wallRow) => roomAtCell(openCol, openRow)?.wall ?? kindAt(wallCol, wallRow),
  };

  // Ghost events placed by cells get a trigger volume named ghost_<id>.
  const ghostTriggers = (data.ghosts ?? []).filter((g) => g.cells).map((g) => ({ id: `ghost_${g.id}`, cells: g.cells }));
  const triggers = [...(data.triggers ?? []), ...ghostTriggers].map((trigger) => ({ ...trigger, box: cellBox(trigger.cells, trigger.height) }));

  const toSpawn = ({ cell, yawDegrees = 0 }) => ({ ...cellCenter(...cell), yaw: (yawDegrees * Math.PI) / 180 });
  const spawns = Object.fromEntries(Object.entries(data.spawns ?? {}).map(([name, s]) => [name, toSpawn(s)]));
  const spawn = data.spawn ? toSpawn(data.spawn) : spawns.default;

  return {
    id: data.id,
    wing: data.wing,
    cellSize,
    wallHeight,
    rows,
    cols,
    kindAt,
    isWall,
    isSolid,
    doors,
    doorAt,
    textures,
    cellCenter,
    worldToCell,
    rooms,
    roomAtCell,
    triggers,
    spawn,
    spawns: { default: spawn, ...spawns },
    props: data.props ?? [],
    lights: data.lights ?? [],
    ambience: data.ambience ?? [],
    emitters: data.emitters ?? [],
    ghosts: data.ghosts ?? [],
    safe: data.safe === true, // safe rooms restore sanity (the patient room)
    ambient: data.ambient ?? { color: '#ffffff', intensity: 0.45 },
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
