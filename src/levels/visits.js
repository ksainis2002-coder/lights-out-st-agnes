// Remembers which rooms the player has stood in (flag visited_<room>), so the
// paper map can pencil in rooms it did not show.
import { roomAt } from './loader.js';
import { LEVELS } from './index.js';

// True when a map the player carries leaves this room out.
function hiddenOnMap(game, room) {
  const level = LEVELS[game.world.level.id];
  return (level.maps ?? []).some((map) => map.hidden?.includes(room) && game.journal.maps().includes(map.id));
}

export function setupVisits(game) {
  game.updateVisits = () => {
    const room = roomAt(game.world.level, game.player.state.position);
    if (!room || game.progress.hasFlag(`visited_${room}`)) return;
    game.progress.setFlag(`visited_${room}`);
    game.events.emit('room.visited', room);
    if (hiddenOnMap(game, room)) game.messages.notice('msg.mapPencilled', null, 4);
  };
}
