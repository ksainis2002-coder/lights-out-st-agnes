// Dev-only mockups of the 0.2 in-game screens, drawn on the 480×270 UI layer
// over a real dorm render. Copy here is mockup text, not game text.
import { osdText, wrapText, fittedSize, COLORS } from '../ui/osd.js';
import { drawIcon } from '../ui/icons.js';
import { drawSymbol, TUNE_SYMBOLS } from '../props/parts.js';

const W = 480;
const H = 270;
const PAPER = '#d9cfb4';
const INK = '#2a2418';

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
    if (item) drawIcon(ctx, item, x + 2, y0 + 2, 2);
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

// Held note (proposal): a document pulled out to the player's side, readable
// while walking and using things. Lower left, slightly tilted, game runs on.
export function heldNote(ctx) {
  prompt(ctx);
  ctx.save();
  ctx.translate(10, 116);
  ctx.rotate(-0.03);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(3, 3, 120, 146);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, 120, 146);
  paperText(ctx, 'Dormitory register', 8, 7, 9);
  const lines = ['1. Walter Price', '2. Thomas Hale (“Tommy”)', '3. Peter Doyle', '4. Sam Pike', '5. Alfred Burns (“Alfie”)', '6. Arthur Lowe', '7. George Finch', '8. Frank Ellery', '9. Harry Moss', '10. Ernest Dunn'];
  lines.forEach((line, i) => paperText(ctx, line, 7, 22 + i * 12, 8));
  ctx.restore();
  osdText(ctx, 'H  put away', 12, 102, 8, COLORS.soft);
}

// Flashlight battery (proposal): VHS-style cell in the lower right, shown for
// a few seconds when the flashlight is switched, and always when low.
export function battery(ctx) {
  const x = W - 52;
  const y = H - 30;
  ctx.strokeStyle = 'rgba(232,240,255,0.85)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 30, 12);
  ctx.fillStyle = 'rgba(232,240,255,0.85)';
  ctx.fillRect(x + 31, y + 4, 2, 5);
  ctx.fillRect(x + 3, y + 3, 6, 7); // one bar of four left
  osdText(ctx, 'LOW', x - 6, y + 2, 9, '#ff6a5a', 'right');
}

// Music box close-up (proposal): using the box brings it up in front of you;
// click a picture key (or 1–5) to play its note. The last notes played show
// as small pictures. ESC or a click outside steps back.
export function musicBoxClose(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#3a1c10';
  ctx.fillRect(110, 70, 260, 140);
  ctx.fillStyle = '#5a2c1a';
  ctx.fillRect(116, 76, 248, 128);
  ctx.fillStyle = '#4a2214';
  ctx.fillRect(116, 76, 248, 46); // the lid, propped open
  ctx.fillStyle = '#b8a060';
  ctx.fillRect(232, 92, 16, 16); // the crank, fitted
  TUNE_SYMBOLS.forEach((name, i) => {
    const x = 130 + i * 46;
    ctx.fillStyle = i === 2 ? '#f4ecd8' : '#d8d0b8';
    ctx.fillRect(x, 140, 38, 46);
    ctx.strokeStyle = '#3a2214';
    ctx.lineWidth = 2;
    drawSymbol(ctx, name, x + 5, 147, 28);
    osdText(ctx, String(i + 1), x + 19, 190, 8, COLORS.dim, 'center');
  });
  ['star', 'star', 'moon'].forEach((name, i) => {
    ctx.strokeStyle = '#c9d2e0';
    ctx.lineWidth = 1.5;
    drawSymbol(ctx, name, 205 + i * 24, 40, 18);
  });
  osdText(ctx, 'CLICK a key  ·  1–5  ·  ESC step back', W / 2, H - 22, 8, COLORS.dim, 'center');
}

// Proposal: looking at an item shows a short line under the use prompt.
export function itemHover(ctx) {
  ctx.fillStyle = 'rgba(232,240,255,0.8)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
  const text = 'CLICK  Take Battery';
  ctx.font = 'bold 10px monospace';
  const w = ctx.measureText(text).width + 16;
  panel(ctx, W / 2 - w / 2, H / 2 + 22, w, 16, 0.55);
  osdText(ctx, text, W / 2, H / 2 + 25, 10, COLORS.text, 'center');
  osdText(ctx, 'Spare power for the flashlight.', W / 2, H / 2 + 42, 9, COLORS.soft, 'center');
}

// Proposal: the first time an item is picked up, a card shows what it is
// and how to use it. The world waits; ENTER or a click puts it away.
export function itemCard(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  panel(ctx, 120, 56, 240, 168, 0.9);
  osdText(ctx, 'NEW ITEM', W / 2, 64, 8, COLORS.dim, 'center');
  ctx.fillStyle = 'rgba(232,240,255,0.07)';
  ctx.fillRect(W / 2 - 26, 84, 52, 52);
  drawIcon(ctx, 'battery', W / 2 - 24, 110 - 4 * 3, 3);
  osdText(ctx, 'BATTERY', W / 2, 144, 12, COLORS.text, 'center');
  osdText(ctx, 'For the flashlight. Each one lasts', W / 2, 162, 9, COLORS.soft, 'center');
  osdText(ctx, 'about eight minutes of light.', W / 2, 174, 9, COLORS.soft, 'center');
  osdText(ctx, 'B  swap it in when the light runs low', W / 2, 190, 9, '#ffe27a', 'center');
  osdText(ctx, 'ENTER / CLICK  continue', W / 2, 208, 8, COLORS.dim, 'center');
}

// Proposal: a pulse in the lower left, until the camcorder takes over. A
// heart and a trace: steady and pale when calm, faster and redder as the
// mind goes; four pips for calm / uneasy / shaking / falling apart.
function pulse(ctx, x, y, level) {
  const colors = ['#c9d2e0', '#e8d9a0', '#ffb860', '#ff6a5a'];
  const color = colors[3 - level + 1] ?? colors[0];
  ctx.fillStyle = color;
  [[1, 0], [2, 0], [4, 0], [5, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [4, 4], [3, 5]]
    .forEach(([px, py]) => ctx.fillRect(x + px * 2, y + py * 2, 2, 2));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const base = y + 6;
  ctx.moveTo(x + 18, base);
  [[24, 0], [27, -6], [30, 6], [33, -2], [36, 0], [44, 0], [47, -6], [50, 6], [53, -2], [56, 0], [64, 0]].forEach(([dx, dy]) => ctx.lineTo(x + dx, base + dy));
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i < level ? color : 'rgba(232,240,255,0.18)';
    ctx.fillRect(x + 18 + i * 12, y + 14, 9, 3);
  }
}

export function sanityPulse(ctx) {
  pulse(ctx, 14, H - 32, 2);
  osdText(ctx, 'shaking', 84, H - 30, 8, COLORS.soft);
}

// Proposal: the first time the mind starts to slip, a card explains sanity
// (same look as the new-item card). Shown again after the first blackout.
export function sanityCard(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
  panel(ctx, 110, 50, 260, 178, 0.9);
  osdText(ctx, 'YOUR MIND', W / 2, 58, 8, COLORS.dim, 'center');
  pulse(ctx, W / 2 - 34, 76, 3);
  const lines = [
    'The dark, the children and what you', 'see here wear on your mind.',
    'Light, your room and pills steady it.', '',
    'Your pulse (lower left) shows how', 'much is left. If your mind gives way,',
    'you black out and the tape rewinds', 'to your last checkpoint.',
  ];
  lines.forEach((line, i) => osdText(ctx, line, W / 2, 104 + i * 12, 9, COLORS.soft, 'center'));
  osdText(ctx, 'ENTER / CLICK  continue', W / 2, 212, 8, COLORS.dim, 'center');
}
