// Makes a level's doors usable: open/close, unlocking with a carried key,
// and exits to other levels (stairs, the hub door). Hidden doors are not
// usable until revealed. Door changes are recorded in game.progress.
//   "requires": "<flag>"      stays locked until the flag is set; using it
//                             shows "lockedMessage" (the garden door: wing 1 done)
//   an exit to a level that is not built yet says "Not yet"
import * as THREE from 'three';
import { itemDef, itemText } from '../items/catalog.js';
import { LEVELS } from './index.js';

export function doorInteractables(game) {
  const { world, player, progress, i18n } = game;
  const level = world.level;
  const itemName = (id) => itemText(i18n, id);

  function unlock(door) {
    const key = door.locked;
    if (itemDef(key)?.consumed) game.inventory.remove(key);
    door.locked = null;
    progress.unlock(door.id);
    game.messages.show('msg.unlocked', { item: itemName(key) });
    game.events.emit('door.unlocked', door);
  }

  // A door that won't open: its line, and the rattle of a locked door.
  function refuse(door, message) {
    if (message) game.messages.show(message, null, 5);
    game.events.emit('door.locked', door);
  }

  const waiting = (door) => door.requires && !progress.hasFlag(door.requires);
  const notBuilt = (door) => door.exit && !LEVELS[door.exit.level];

  function toggle(door) {
    door.open = !door.open;
    progress.setOpen(door.id, door.open);
    game.events.emit(door.open ? 'door.opened' : 'door.closed', door);
  }

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
        if (waiting(door)) return { key: 'prompt.locked' };
        if (notBuilt(door)) return { key: 'prompt.notYet' };
        if (door.exit && door.exit.afterBasics && game.tutorial?.basicsPending()) return { key: 'prompt.notYet' };
        if (door.exit) return { key: door.exit.prompt ?? 'prompt.leave' };
        if (door.locked) {
          return game.hasItem(door.locked) ? { key: 'prompt.unlock', params: { item: itemName(door.locked) } } : { key: 'prompt.locked' };
        }
        if (door.open) return playerInDoorway() ? null : { key: 'prompt.close' };
        return { key: 'prompt.open' };
      },
      use() {
        if (waiting(door)) return refuse(door, door.lockedMessage);
        if (notBuilt(door)) return null;
        if (door.exit && door.exit.afterBasics && game.tutorial?.basicsPending()) return null;
        if (door.exit) return game.travel(door.exit.level, door.exit.spawn);
        if (door.locked && !game.hasItem(door.locked)) return game.events.emit('door.locked', door);
        if (door.locked) unlock(door);
        toggle(door);
      },
    };
  });
}

// Restores doors from progress after a level loads.
export function applyDoorProgress(level, progress) {
  for (const door of level.doors) {
    if (progress.isUnlocked(door.id)) door.locked = null;
    if (progress.hasFlag(`revealed_${door.id}`)) door.revealed = true;
    door.open = progress.isOpen(door.id);
    door.angle = door.open ? -Math.PI / 2 : 0;
  }
}
