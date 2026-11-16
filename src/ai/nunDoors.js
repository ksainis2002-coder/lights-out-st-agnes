// Doors Sister M. opens as she walks (ai/nun.js): any but the way out, a keyed
// lock still shut, or an electric lock with no power.
export function nunOpens(game) {
  return (door) => !door.exit
    && (!door.locked || game.progress.isUnlocked(door.id))
    && (!door.requires || game.progress.hasFlag(door.requires));
}

function swing(game, door) {
  if (!door || door.open) return;
  door.open = true;
  game.progress.setOpen(door.id, true);
  game.events.emit('door.opened', door);
}

// The door in the cell just ahead of her, if it is shut.
export function openDoorAhead(game, point) {
  const level = game.world.level;
  const cell = level.worldToCell(point.x, point.z);
  swing(game, level.doorAt(cell.col, cell.row));
}

// The set piece seen from the corridor: one of the room's doors swings open by itself.
export function openNearest(game, ids, p) {
  const level = game.world.level;
  const far = (door) => Math.hypot(level.cellCenter(...door.cell).x - p.x, level.cellCenter(...door.cell).z - p.z);
  swing(game, level.doors.filter((door) => ids.includes(door.id)).sort((a, b) => far(a) - far(b))[0]);
}
