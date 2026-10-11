// The MAPS page of the journal: a found staff plan of the wing, drawn in
// pencil from the level's rooms. A room the plan leaves out ("hidden" in the
// level's map entry) is blank at first; once the named note is read a child's
// crayon scribble marks it; once visited, it is pencilled in properly.
// Level data: "maps": [{ "id": "<level id>", "at": [c, r], "hidden": { room: docId } }]
import { LEVELS } from '../../levels/index.js';
import { INK, paperText } from '../paper.js';

const AREA = { x: 82, y: 34, w: 316, h: 196 };
const PENCIL = '#4a4a50';
const CRAYON = '#a8302a';

function roomBox(room, scale) {
  const [c0, r0, c1, r1] = room.cells;
  return { x: AREA.x + c0 * scale, y: AREA.y + r0 * scale, w: (c1 - c0 + 1) * scale, h: (r1 - r0 + 1) * scale };
}

function scribble(ctx, box) {
  ctx.strokeStyle = CRAYON;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    const x = box.x + box.w / 2 + Math.cos(t) * (box.w / 2 + ((i * 7) % 3) - 1);
    const y = box.y + box.h / 2 + Math.sin(t) * (box.h / 2 + ((i * 5) % 3) - 1);
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  paperText(ctx, '?', box.x + box.w / 2 - 3, box.y + box.h / 2 - 6, 12, CRAYON);
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
    const hiddenBy = entry.hidden?.[room.id];
    if (hiddenBy && !progress.hasFlag(`visited_${room.id}`)) {
      if (progress.isRead(hiddenBy)) scribble(ctx, box);
      continue;
    }
    ctx.strokeStyle = PENCIL;
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    const label = `map.room.${room.id}`;
    if (game.i18n.has(label)) paperText(ctx, t(label), box.x + 3, box.y + 3, 8, INK);
  }

  // Doorways: a small pencilled frame in the wall cell between two rooms.
  for (const door of data.doors ?? []) {
    const hiddenRoom = door.hidden && Object.keys(entry.hidden ?? {}).find((room) => !progress.hasFlag(`visited_${room}`));
    if (door.hidden && hiddenRoom) continue;
    const [col, row] = door.cell;
    ctx.strokeStyle = PENCIL;
    ctx.strokeRect(AREA.x + col * scale + 2.5, AREA.y + row * scale + 2.5, scale - 5, scale - 5);
  }

  if (game.world.level.id === mapId) {
    const { x, z } = game.player.state.position;
    const px = AREA.x + (x / data.cellSize) * scale, py = AREA.y + (z / data.cellSize) * scale;
    ctx.strokeStyle = CRAYON;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - 3, py - 3);
    ctx.lineTo(px + 3, py + 3);
    ctx.moveTo(px + 3, py - 3);
    ctx.lineTo(px - 3, py + 3);
    ctx.stroke();
  }
  paperText(ctx, t(`map.title.${mapId}`), AREA.x, AREA.y + AREA.h + 2, 9, INK);
}
