// Dev-only mockups of the 0.2 in-game screens, drawn on the 480×270 UI layer
// over a real dorm render. Copy here is mockup text, not game text.
import { osdText, wrapText, fittedSize, COLORS } from '../ui/osd.js';

const W = 480;
const H = 270;
const PAPER = '#d9cfb4';
const INK = '#2a2418';

// 16×16 pixel icons as rows of palette letters ('.' = clear).
const ICONS = {
  plate: { pal: { b: '#8a7444', d: '#3a2c14' }, rows: ['................', '................', '................', '................', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb', 'bbddbdbbddbdddbb', 'bbdbbdbbdbbbdbbb', 'bbddbdbbddbbdbbb', 'bbbbbbbbbbbbbbbb', 'bbbbbbbbbbbbbbbb'] },
  key: { pal: { k: '#b8a060' }, rows: ['................', '................', '....kkk.........', '...k...k........', '...k...kkkkkkkkk', '...k...k....k.k.', '....kkk.....k.k.'] },
  horse: { pal: { h: '#8a5a30', d: '#4a2c14' }, rows: ['................', '............hh..', '...........hhh..', '..hhhhhhhhhhh...', '..hhhhhhhhhh....', '..h.h....h.h....', '..h.h....h.h....', '.dddddddddddd...'] },
  battery: { pal: { g: '#7a8a6a', s: '#d0d0c0' }, rows: ['................', '................', '.gggggggggggggs.', '.gggggggggggggss', '.gggggggggggggss', '.gggggggggggggs.'] },
  pills: { pal: { w: '#e0e0d8', r: '#b03028' }, rows: ['................', '.....rrrrr......', '.....wwwww......', '....wwwwwww.....', '....wrrrrrw.....', '....wwwwwww.....', '....wwwwwww.....', '....wwwwwww.....'] },
};

function icon(ctx, name, x, y, scale = 1) {
  const { pal, rows } = ICONS[name];
  rows.forEach((row, ry) => [...row].forEach((c, rx) => {
    if (c === '.') return;
    ctx.fillStyle = pal[c];
    ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
  }));
}

function panel(ctx, x, y, w, h, alpha = 0.7) {
  ctx.fillStyle = `rgba(5,7,10,${alpha})`;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(232,240,255,0.35)';
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function paperText(ctx, text, x, y, size, color = INK) {
  ctx.font = `${size}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function paperLines(ctx, text, x, y, width, size, lineHeight) {
  ctx.font = `${size}px Georgia, "Times New Roman", serif`;
  const words = text.split(' ');
  let line = '';
  let row = 0;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) {
      paperText(ctx, line, x, y + row * lineHeight, size);
      line = word;
      row += 1;
    } else {
      line = next;
    }
  }
  if (line) paperText(ctx, line, x, y + row * lineHeight, size);
}

// Looking at a bed's name plate: crosshair dot + prompt, nothing else on screen.
export function prompt(ctx) {
  ctx.fillStyle = 'rgba(232,240,255,0.8)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
  const text = 'CLICK  Take name plate “WALTER”';
  ctx.font = `bold 10px monospace`;
  const w = ctx.measureText(text).width + 16;
  panel(ctx, W / 2 - w / 2, H / 2 + 22, w, 16, 0.55);
  osdText(ctx, text, W / 2, H / 2 + 25, 10, COLORS.text, 'center');
}

// Inventory (TAB): a strip of 8 slots; the game keeps running behind it.
export function inventory(ctx) {
  const items = ['plate', 'plate', 'key', 'horse', 'battery', 'pills', null, null];
  const size = 36;
  const x0 = W / 2 - (items.length * (size + 4)) / 2;
  const y0 = H - 78;
  panel(ctx, x0 - 8, y0 - 22, items.length * (size + 4) + 12, size + 64, 0.72);
  osdText(ctx, 'INVENTORY', x0, y0 - 17, 9, COLORS.dim);
  osdText(ctx, 'TAB close   CLICK use   R combine', x0 + items.length * (size + 4) - 4, y0 - 17, 8, COLORS.dim, 'right');
  items.forEach((item, i) => {
    const x = x0 + i * (size + 4);
    ctx.fillStyle = i === 2 ? 'rgba(232,240,255,0.25)' : 'rgba(232,240,255,0.07)';
    ctx.fillRect(x, y0, size, size);
    if (item) icon(ctx, item, x + 2, y0 + 2, 2);
  });
  osdText(ctx, 'SMALL BRASS KEY', x0, y0 + size + 6, 10, COLORS.text);
  osdText(ctx, 'Tag reads “linen cupboard”. Cold, as if just held.', x0, y0 + size + 19, 9, COLORS.soft);
}

// Journal (J): notebook page with tabs; entries warp at low sanity (not shown).
export function journal(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(70, 22, 340, 226);
  ctx.fillStyle = '#b8ae94';
  ctx.fillRect(238, 22, 2, 226);
  ['CLUES', 'DOCUMENTS', 'MAPS'].forEach((tab, i) => {
    ctx.fillStyle = i === 0 ? PAPER : '#a89e84';
    ctx.fillRect(80 + i * 72, 8, 68, 16);
    osdText(ctx, tab, 114 + i * 72, 11, 8, i === 0 ? INK : '#4a4434', 'center');
  });
  paperText(ctx, 'Dormitory, east', 84, 32, 12);
  const clues = ['The name plates are on the wrong beds.', 'The register lists who slept where.', 'A song is chalked on the wall by the cubbies.', 'Someone keeps laughing behind me.'];
  clues.forEach((c, i) => paperLines(ctx, `– ${c}`, 84, 54 + i * 34, 140, 10, 12));
  paperText(ctx, 'Dorm register (copy)', 252, 32, 12);
  const register = ['Bed 1 .... T. Hale', 'Bed 2 .... M. Rowe', 'Bed 3 .... E. Carr', 'Bed 4 .... S. Pike', 'Bed 5 .... (torn)'];
  register.forEach((r, i) => paperText(ctx, r, 252, 56 + i * 16, 10));
  osdText(ctx, 'J close   ◀▶ page   TAB section', W / 2, H - 16, 8, COLORS.dim, 'center');
}

// Reading a found document: the page fills the view, with a typed transcript.
export function documentView(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(150, 130);
  ctx.rotate(-0.03);
  ctx.fillStyle = PAPER;
  ctx.fillRect(-100, -112, 200, 226);
  paperText(ctx, 'St. Agnes Home for Children', -88, -100, 10);
  paperText(ctx, 'Night duty — Sister M.', -88, -86, 9, '#5a4c34');
  paperLines(ctx, 'Lights out at nine. Any child found out of bed is to stand in the corridor until I say otherwise. The Hale boy again. He says the little girl in white told him to come down. There is no little girl in white.', -88, -66, 176, 9, 12);
  ctx.restore();
  panel(ctx, 268, 30, 190, 196, 0.6);
  osdText(ctx, 'TRANSCRIPT', 278, 38, 9, COLORS.dim);
  wrapText(ctx, 'Lights out at nine. Any child found out of bed is to stand in the corridor until I say otherwise. The Hale boy again. He says the little girl in white told him to come down. There is no little girl in white.', 9, 170)
    .forEach((line, i) => osdText(ctx, line, 278, 54 + i * 12, 9, COLORS.soft));
  osdText(ctx, 'CLICK put back   T hide transcript', W / 2, H - 16, 8, COLORS.dim, 'center');
}

// Saving at the tape recorder: VCR record menu with three tapes.
export function save(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);
  osdText(ctx, '● REC', 20, 16, 13, COLORS.red);
  osdText(ctx, 'RECORD TO TAPE', W / 2, 46, 14, COLORS.text, 'center');
  const tapes = [
    ['TAPE 1', 'Orphanage — dorms', '0:41:07', '09.10'],
    ['TAPE 2', '— empty —', '', ''],
    ['TAPE 3', 'Patient room', '0:12:30', '08.10'],
  ];
  tapes.forEach(([name, place, time, date], i) => {
    const y = 84 + i * 40;
    const on = i === 0;
    ctx.fillStyle = on ? 'rgba(232,240,255,0.9)' : 'rgba(232,240,255,0.08)';
    ctx.fillRect(110, y, 260, 32);
    const color = on ? COLORS.ink : COLORS.text;
    osdText(ctx, name, 122, y + 4, 11, color);
    osdText(ctx, place, 122, y + 18, 9, on ? '#2a3040' : COLORS.soft);
    osdText(ctx, time, 358, y + 4, 11, color, 'right');
    osdText(ctx, date, 358, y + 18, 9, on ? '#2a3040' : COLORS.soft, 'right');
  });
  const note = 'Recording over a tape erases it.';
  osdText(ctx, note, W / 2, 214, fittedSize(ctx, note, 9, 300), COLORS.soft, 'center');
  osdText(ctx, '▲▼ choose   ENTER record   ESC cancel', W / 2, H - 18, 8, COLORS.dim, 'center');
}
