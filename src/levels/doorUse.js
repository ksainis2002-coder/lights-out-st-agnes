// Makes a level's doors usable: open/close, locked doors, and exits to other
// levels (stairs, the hub door). Hidden doors are not usable until revealed.
import * as THREE from 'three';

export function doorInteractables(game) {
  const { world, player } = game;
  const level = world.level;
  return level.doors.map((door) => {
    const c = level.cellCenter(...door.cell);
    const playerInDoorway = () => {
      const cell = level.worldToCell(player.state.position.x, player.state.position.z);
      return cell.col === door.cell[0] && cell.row === door.cell[1];
    };
    return {
      position: new THREE.Vector3(c.x, 1.2, c.z),
      radius: 0.75, // a door is big: anywhere on its face counts
      prompt() {
        if (door.hidden && !door.revealed) return null;
        if (door.exit) return { key: door.exit.prompt ?? 'prompt.leave' };
        if (door.locked && !game.hasItem(door.locked)) return { key: 'prompt.locked' };
        if (door.open) return playerInDoorway() ? null : { key: 'prompt.close' };
        return { key: 'prompt.open' };
      },
      use() {
        if (door.exit) return game.travel(door.exit.level, door.exit.spawn);
        if (door.locked && !game.hasItem(door.locked)) return game.events.emit('door.locked', door);
        door.open = !door.open;
        game.events.emit(door.open ? 'door.opened' : 'door.closed', door);
      },
    };
  });
}
