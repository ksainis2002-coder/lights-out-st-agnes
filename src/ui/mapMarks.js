// Marks on the paper map (owner request 2026-10-14, approved still
// ui_mapMarks): you (red crayon X), tape recorders you have come across (ink
// cassette), safe places (green crayon house: the way up to your room, and
// hiding rooms once you have been in them), and puzzles you have tried but
// not solved yet (blue crayon ring with what it is). A solved puzzle's ring
// is gone. A key explains them in an empty corner of each map.
// Level data: a door whose exit leads to a "safe" level, rooms with
// "safe": true, recorders as props with "use": "save" and an "id", puzzles
// by name, and the map entry's "key": [c, r] for the key's corner. A
// recorder or puzzle takes "mapAt": [c, r] to place its mark by hand (clear
// of a room's name).
import { LEVELS } from '../levels/index.js';
import { PUZZLE_MARKS } from '../puzzles/index.js';
import { SERIF, paperText } from './paper.js';

const INK = '#2a2418';
const RED = '#a8302a';
const GREEN = '#3a7a3a';
const BLUE = '#2f4f9a';
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const isFloor = (data, col, row) => data.legend[data.map[row]?.[col]] === 'floor';

// Just outside a door, on the side away from the level's floor.
function outside(data, [col, row]) {
  const inward = SIDES.find(([dc, dr]) => isFloor(data, col + dc, row + dr)) ?? [0, 0];
  return [col + 0.5 - inward[0] * 0.95, row + 0.5 - inward[1] * 0.95];
}

function roomCentre(room) {
  const [c0, r0, c1, r1] = room.cells;
  return [(c0 + c1 + 1) / 2, (r0 + r1 + 1) / 2];
}

// A puzzle's ring sits in the middle of the room its prop (or beds) are in.
function puzzleAt(data, config) {
  if (config.mapAt) return config.mapAt;
  const ids = config.prop ? [config.prop] : Object.keys(config.answer ?? {});
  const props = data.props.filter((prop) => ids.includes(prop.id));
  if (!props.length) return null;
  const [col, row] = props[0].at;
  const room = data.rooms.find(({ cells: [c0, r0, c1, r1] }) => col >= c0 && col <= c1 + 1 && row >= r0 && row <= r1 + 1);
  return room ? roomCentre(room) : props[0].at;
}

// The marks a map shows right now: [{ kind, at: [col, row], symbol? }].
export function mapMarks(game, mapId) {
  const data = LEVELS[mapId];
  const { progress } = game;
  const marks = [];
  for (const prop of data.props ?? []) {
    if (prop.use === 'save' && prop.id && progress.hasFlag(`seen_${prop.id}`)) marks.push({ kind: 'recorder', at: prop.mapAt ?? prop.at });
  }
  for (const door of data.doors ?? []) {
    if (LEVELS[door.exit?.level]?.safe) marks.push({ kind: 'safe', at: outside(data, door.cell) });
  }
  for (const room of data.rooms ?? []) {
    if (room.safe && progress.hasFlag(`visited_${room.id}`)) marks.push({ kind: 'safe', at: [room.cells[2] + 0.5, room.cells[1] + 0.6] });
  }
  for (const [name, config] of Object.entries(data.puzzles ?? {})) {
    const puzzle = PUZZLE_MARKS[name];
    if (!puzzle || !progress.hasFlag(`tried_${name}`) || progress.hasFlag(puzzle.solved)) continue;
    const at = puzzleAt(data, config);
    if (at) marks.push({ kind: 'puzzle', symbol: puzzle.symbol, at });
  }
  return marks;
}

const SYMBOLS = {
  plates(ctx, x, y) {
    ctx.strokeRect(x - 3, y - 1, 6, 3);
    ctx.moveTo(x - 3, y - 3);
    ctx.lineTo(x - 3, y + 2);
  },
  toys(ctx, x, y) {
    ctx.strokeRect(x - 2.5, y - 2.5, 5, 5);
  },
  music(ctx, x, y) {
    ctx.moveTo(x + 1.5, y - 3.5);
    ctx.lineTo(x + 1.5, y + 2);
    ctx.moveTo(x + 1.5, y - 3.5);
    ctx.lineTo(x + 3.5, y - 2.5);
    ctx.moveTo(x + 1.5, y + 2);
    ctx.arc(x, y + 2, 1.5, 0, Math.PI * 2);
  },
  fuses(ctx, x, y) {
    ctx.moveTo(x + 1, y - 4);
    ctx.lineTo(x - 2, y);
    ctx.lineTo(x + 2, y);
    ctx.lineTo(x - 1, y + 4);
  },
  book(ctx, x, y) {
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - 4, y - 3);
    ctx.lineTo(x - 4, y + 2.5);
    ctx.lineTo(x, y + 3.5);
    ctx.lineTo(x + 4, y + 2.5);
    ctx.lineTo(x + 4, y - 3);
    ctx.lineTo(x, y - 2);
    ctx.lineTo(x, y + 3.5);
  },
  hop(ctx, x, y) {
    [[-1.3, 1.2], [-2.6, -1.4], [0, -1.4], [-1.3, -4]].forEach(([dx, dy]) => ctx.rect(x + dx, y + dy, 2.6, 2.6));
  },
};

const DRAW = {
  you(ctx, x, y) {
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 3);
    ctx.lineTo(x + 3, y + 3);
    ctx.moveTo(x + 3, y - 3);
    ctx.lineTo(x - 3, y + 3);
    ctx.stroke();
  },
  recorder(ctx, x, y) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 4.5, y - 3, 9, 6);
    ctx.beginPath();
    ctx.arc(x - 2, y, 1.3, 0, Math.PI * 2);
    ctx.moveTo(x + 3.3, y);
    ctx.arc(x + 2, y, 1.3, 0, Math.PI * 2);
    ctx.stroke();
  },
  safe(ctx, x, y) {
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4);
    ctx.lineTo(x - 4, y - 1);
    ctx.lineTo(x, y - 5);
    ctx.lineTo(x + 4, y - 1);
    ctx.lineTo(x + 4, y + 4);
    ctx.closePath();
    ctx.stroke();
  },
  puzzle(ctx, x, y, { symbol = 'music', radius = 7 } = {}) {
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    SYMBOLS[symbol](ctx, x, y);
    ctx.stroke();
  },
};

export function drawMark(ctx, kind, x, y, options) {
  DRAW[kind](ctx, x, y, options);
}

// The key: two rows of mark + word; the words shrink to fit the corner.
export function drawKey(ctx, t, x0, y0, width = 140) {
  const rows = [[['you', 'map.key.you'], ['recorder', 'map.key.recorder']], [['safe', 'map.key.safe'], ['puzzle', 'map.key.puzzle']]];
  const rowWidth = (row, size) => {
    ctx.font = `${size}px ${SERIF}`;
    return row.reduce((sum, [, label]) => sum + 26 + ctx.measureText(t(label)).width, 0);
  };
  let size = 8;
  while (size > 6 && Math.max(...rows.map((row) => rowWidth(row, size))) > width) size -= 0.5;
  rows.forEach((row, i) => {
    let x = x0 + 6;
    const y = y0 + 4 + i * 12;
    for (const [kind, label] of row) {
      drawMark(ctx, kind, x, y, kind === 'puzzle' ? { radius: 5.5 } : undefined);
      paperText(ctx, t(label), x + 9, y - size / 2 - 1, size, INK);
      x += 26 + ctx.measureText(t(label)).width;
    }
  });
}
