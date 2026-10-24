// The MAPS page of the journal: a found staff plan of the wing, drawn in
// pencil from the level's rooms. A room the plan leaves out ("hidden" in the
// level's map entry) is blank until visited, then pencilled in. Crayon and
// ink marks on top show you, recorders, safe places and puzzles in hand
// (mapMarks.js), with a key in the corner the map entry names.
// Level data: "maps": [{ "id": "<level id>", "at": [c, r], "hidden": ["<room id>"], "key": [c, r] }]
// Every map needs an entry with its own id in its own level, even one found
// elsewhere (the grounds come on the hall plan): that entry draws it.
import { LEVELS } from '../../levels/index.js';
import { INK, SERIF, paperText } from '../paper.js';
import { mapMarks, drawMark, drawKey } from '../mapMarks.js';

const AREA = { x: 82, y: 34, w: 316, h: 196 };
const PENCIL = '#4a4a50';

// Room names shrink (down to 6 px) to stay inside small rooms (long Greek names).
function labelSize(ctx, text, width) {
  let size = 8;
  ctx.font = `${size}px ${SERIF}`;
  while (size > 6 && ctx.measureText(text).width > width) {
    size -= 0.5;
    ctx.font = `${size}px ${SERIF}`;
  }
  return size;
}

function roomBox(room, scale) {
  const [c0, r0, c1, r1] = room.cells;
  return { x: AREA.x + c0 * scale, y: AREA.y + r0 * scale, w: (c1 - c0 + 1) * scale, h: (r1 - r0 + 1) * scale };
}

export function drawMapPage(ctx, ui, mapId) {
  const { t, game } = ui;
  const data = LEVELS[mapId];
  const entry = data.maps.find((map) => map.id === mapId);
  const cols = Math.max(...data.map.map((row) => row.length));
  const scale = Math.min(AREA.w / cols, AREA.h / data.map.length);
  const { progress } = game;

  ctx.strokeStyle = PENCIL;
  ctx.lineWidth = 1;
  for (const room of data.rooms) {
    const box = roomBox(room, scale);
    if (entry.hidden?.includes(room.id) && !progress.hasFlag(`visited_${room.id}`)) continue;
    ctx.strokeStyle = PENCIL;
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    const label = `map.room.${room.id}`;
    if (game.i18n.has(label)) paperText(ctx, t(label), box.x + 3, box.y + 3, labelSize(ctx, t(label), box.w - 6), INK);
  }

  // Doorways: a small pencilled frame in the wall cell between two rooms.
  for (const door of data.doors ?? []) {
    const hiddenRoom = door.hidden && (entry.hidden ?? []).find((room) => !progress.hasFlag(`visited_${room}`));
    if (door.hidden && hiddenRoom) continue;
    const [col, row] = door.cell;
    ctx.strokeStyle = PENCIL;
    ctx.strokeRect(AREA.x + col * scale + 2.5, AREA.y + row * scale + 2.5, scale - 5, scale - 5);
  }

  const toPage = ([col, row]) => [AREA.x + col * scale, AREA.y + row * scale];
  for (const mark of mapMarks(game, mapId)) drawMark(ctx, mark.kind, ...toPage(mark.at), mark.symbol && { symbol: mark.symbol });
  if (game.world.level.id === mapId) {
    const { x, z } = game.player.state.position;
    drawMark(ctx, 'you', ...toPage([x / data.cellSize, z / data.cellSize]));
  }
  if (entry.key) drawKey(ctx, t, ...toPage(entry.key));
  paperText(ctx, t(`map.title.${mapId}`), AREA.x, AREA.y + AREA.h + 2, 9, INK);
}
