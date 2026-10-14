// Remembers which rooms the player has stood in (flag visited_<room>), so the
// paper map can pencil in rooms it did not show, and which tape recorders
// they have come across (flag seen_<recorder id>, within a few metres), so
// the map can mark them (ui/mapMarks.js).
import { roomAt } from './loader.js';
import { LEVELS } from './index.js';

const RECORDER_RANGE = 3; // metres

// True when a map the player carries leaves this room out.
function hiddenOnMap(game, room) {
  const level = LEVELS[game.world.level.id];
  return (level.maps ?? []).some((map) => map.hidden?.includes(room) && game.journal.maps().includes(map.id));
}

function noteRecorders(game) {
  const { level } = game.world;
  const { x, z } = game.player.state.position;
  for (const prop of level.props) {
    if (prop.use !== 'save' || !prop.id || game.progress.hasFlag(`seen_${prop.id}`)) continue;
    const dx = prop.at[0] * level.cellSize - x, dz = prop.at[1] * level.cellSize - z;
    if (dx * dx + dz * dz < RECORDER_RANGE ** 2) game.progress.setFlag(`seen_${prop.id}`);
  }
}

export function setupVisits(game) {
  game.updateVisits = () => {
    noteRecorders(game);
    const room = roomAt(game.world.level, game.player.state.position);
    if (!room || game.progress.hasFlag(`visited_${room}`)) return;
    game.progress.setFlag(`visited_${room}`);
    game.events.emit('room.visited', room);
    if (hiddenOnMap(game, room)) game.messages.notice('msg.mapPencilled', null, 4);
  };
}
