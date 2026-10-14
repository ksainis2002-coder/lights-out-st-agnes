// Proposals (owner request 2026-10-14: "any puzzle that could be seen better
// up close should be up close, just like the music box"): close-up screens on
// the 480×270 UI layer for the card index, the shelf of numbered books, the
// counting board, the gravestones, the class painting, the hopscotch and
// wing 1's fuse box. Copy here is mockup text, not game text.
import { osdText, COLORS } from '../ui/osd.js';
import { classPaintingTexture } from '../props/art.js';
import { message, subtitle } from './helpers.js';

const W = 480;
const H = 270;
const SERIF = 'Georgia, "DejaVu Serif", serif';
const CHALK = 'rgba(236,236,226,0.92)';

function dim(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);
}

function hint(ctx, text) {
  osdText(ctx, text, W / 2, H - 22, 8, COLORS.dim, 'center');
}

function serifText(ctx, text, x, y, size, color, { align = 'center', style = '' } = {}) {
  ctx.font = `${style} ${size}px ${SERIF}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// The yellow frame round whatever the mouse is on (as on the records lock).
function hovered(ctx, x, y, w, h) {
  ctx.strokeStyle = '#ffe27a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
}

// Library: 24 lettered drawers (in Greek the 24 letters Α–Ω). Click the
// title's first letter; that drawer comes out and its card comes up.
const DRAWERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'XYZ'];
export function cardIndexClose(ctx) {
  dim(ctx);
  ctx.fillStyle = '#3a2618';
  ctx.fillRect(88, 26, 304, 196);
  DRAWERS.forEach((letter, i) => {
    const x = 96 + (i % 6) * 48;
    const y = 34 + Math.floor(i / 6) * 46;
    ctx.fillStyle = letter === 'S' ? '#120c08' : '#6a4a2e'; // S is out: an empty slot
    ctx.fillRect(x, y, 44, 40);
    if (letter === 'S') return;
    ctx.fillStyle = '#b8944a';
    ctx.fillRect(x + 11, y + 6, 22, 12);
    serifText(ctx, letter, x + 22, y + 16, letter.length > 1 ? 8 : 10, '#2a1e10', { style: 'bold' });
    ctx.fillStyle = '#c8a050';
    ctx.fillRect(x + 17, y + 25, 10, 4);
  });
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; // the card held up in front
  ctx.fillRect(134, 104, 216, 104);
  ctx.fillStyle = '#efe6cc';
  ctx.fillRect(130, 100, 216, 104);
  ctx.fillStyle = '#c84a3a';
  ctx.fillRect(130, 126, 216, 1);
  ctx.fillStyle = '#a8bcd0';
  for (let y = 144; y < 200; y += 16) ctx.fillRect(130, y, 216, 1);
  serifText(ctx, '784', 140, 119, 14, '#1a1410', { align: 'left', style: 'bold' });
  serifText(ctx, 'Songs for Little Voices', 182, 119, 12, '#1a1410', { align: 'left', style: 'italic' });
  serifText(ctx, 'Lent to M. Rowe', 146, 157, 11, '#2a3a6a', { align: 'left', style: 'italic' });
  hint(ctx, 'CLICK a drawer  ·  ESC step back');
}

// Library: the 700–799 bookcase up close, numbered spines on three shelves.
// Click a book to take it out (784 is her song book; the mouse is on it).
const SPINES = ['#5a2a22', '#2e3a4a', '#3a4a2e', '#6a5a3a', '#4a2e3a', '#2a2a28', '#7a6a50'];
export function shelfClose(ctx) {
  dim(ctx);
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(70, 18, 340, 210);
  ctx.fillStyle = '#b8944a';
  ctx.fillRect(208, 22, 64, 13);
  serifText(ctx, '700–799', 240, 32, 9, '#2a1e10', { style: 'bold' });
  [770, 778, 786].forEach((first, row) => {
    const bottom = 100 + row * 62;
    ctx.fillStyle = '#4a3424';
    ctx.fillRect(74, bottom, 332, 6);
    let x = 86;
    for (let number = first; number < first + 8; number++) {
      const w = 34 + ((number * 7) % 4) * 2;
      const h = 46 + ((number * 5) % 5) * 2;
      const top = bottom - h - (number === 784 ? 5 : 0); // pulled out a little
      ctx.fillStyle = SPINES[number % SPINES.length];
      ctx.fillRect(x, top, w - 2, h);
      ctx.fillStyle = 'rgba(220,200,150,0.4)'; // gilt bands
      ctx.fillRect(x, top + 6, w - 2, 2);
      ctx.fillRect(x, top + 11, w - 2, 1);
      ctx.fillStyle = '#e8e0cc';
      ctx.fillRect(x + 4, top + h - 16, w - 10, 11);
      serifText(ctx, String(number), x + (w - 2) / 2, top + h - 7, 8, '#1a1410', { style: 'bold' });
      if (number === 784) hovered(ctx, x, top, w - 2, h);
      x += w;
    }
  });
  hint(ctx, 'CLICK a book  ·  ESC step back');
}

// Classroom 2: the counting lesson on the board, up close and readable.
export function countingBoardClose(ctx) {
  dim(ctx);
  ctx.fillStyle = '#5a3e28';
  ctx.fillRect(36, 20, 408, 212);
  ctx.fillStyle = '#1f2a24';
  ctx.fillRect(44, 28, 392, 196);
  ctx.fillStyle = 'rgba(220,220,210,0.05)'; // old wiped chalk
  [[120, 80], [300, 60], [380, 170], [90, 190], [250, 150]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
  serifText(ctx, 'Count, then write the three answers in order:', 60, 58, 13, CHALK, { align: 'left', style: 'italic' });
  ['1. Windows in this room.', '2. Desks with the lid left up.', '3. Names on the board.'].forEach((line, i) => {
    serifText(ctx, line, 78, 90 + i * 26, 13, CHALK, { align: 'left', style: 'italic' });
  });
  serifText(ctx, 'TALKERS:', 60, 192, 12, CHALK, { align: 'left', style: 'bold' });
  serifText(ctx, 'M. Rowe    T. Hale    E. Carr    S. Pike', 136, 192, 12, CHALK, { align: 'left', style: 'italic' });
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(36, 232, 408, 5); // the chalk ledge
  ctx.fillStyle = '#e8e8dc';
  ctx.fillRect(330, 228, 14, 4);
  hint(ctx, 'ESC step back');
}

// Letters cut into stone: dark in the cut, a pale lit lower edge.
function carve(ctx, text, x, y, size) {
  serifText(ctx, text, x, y + 1, size, 'rgba(230,230,220,0.35)', { style: 'bold' });
  serifText(ctx, text, x, y, size, '#2e2e2a', { style: 'bold' });
}

// A small cross cut in above the name.
function carvedCross(ctx, x, y) {
  [['rgba(230,230,220,0.35)', 1], ['#2e2e2a', 0]].forEach(([colour, drop]) => {
    ctx.fillStyle = colour;
    ctx.fillRect(x - 1.5, y + drop, 3, 16);
    ctx.fillRect(x - 6, y + 4 + drop, 12, 3);
  });
}

// Cemetery: a gravestone up close, the name carved in, the line it gives
// below. worn: Tommy's, worn too smooth to read (owner pick c).
export function gravestoneClose(ctx, { worn = false } = {}) {
  dim(ctx);
  ctx.fillStyle = '#142014'; // wet grass at its foot
  ctx.beginPath();
  ctx.ellipse(240, 204, 140, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = worn ? '#55554e' : '#5e5e58';
  ctx.beginPath();
  ctx.moveTo(160, 204);
  ctx.lineTo(160, 108);
  ctx.arc(240, 108, 80, Math.PI, 0);
  ctx.lineTo(320, 204);
  ctx.closePath();
  ctx.fill();
  let seed = worn ? 11 : 5;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 260; i++) { // weathering speckle
    ctx.fillStyle = random() < 0.5 ? 'rgba(40,40,36,0.35)' : 'rgba(200,200,190,0.18)';
    ctx.fillRect(166 + random() * 148, 40 + random() * 160, 2, 2);
  }
  ctx.fillStyle = 'rgba(70,96,50,0.55)'; // moss low down
  [[186, 196, 18], [292, 190, 12], [230, 200, 10]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  if (worn) {
    ctx.strokeStyle = 'rgba(46,46,42,0.45)'; // only scratches left where the name was
    ctx.lineWidth = 1;
    [[200, 112, 30], [236, 116, 22], [214, 136, 40]].forEach(([x, y, w]) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + 2);
      ctx.stroke();
    });
  } else {
    carvedCross(ctx, 240, 58);
    carve(ctx, 'MARGARET ROWE', 240, 118, 13);
    carve(ctx, 'AGED 8', 240, 142, 11);
  }
  ctx.fillStyle = '#2a2a2c'; // her lantern at the foot of the grave, unlit
  ctx.fillRect(328, 178, 18, 26);
  ctx.fillStyle = '#3a4048';
  ctx.fillRect(331, 182, 12, 18);
  message(ctx, worn ? 'The name has worn away.' : 'Margaret Rowe. Aged 8.');
  hint(ctx, 'ESC step back');
}

// Art room: the class painting brought up close, names readable, the caption
// card under the frame.
export function paintingClose(ctx) {
  dim(ctx);
  ctx.fillStyle = '#3a2414';
  ctx.fillRect(62, 18, 356, 194);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(classPaintingTexture().image, 70, 26, 340, 178);
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#e4dcc4';
  ctx.fillRect(166, 220, 148, 15);
  serifText(ctx, 'Those who have left us', 240, 231, 10, '#2a2018', { style: 'italic' });
  hint(ctx, 'ESC step back');
}

// Proposal: the hopscotch seen from above. Click a square or press 1–9 to
// hop; the squares hopped so far are shaded; Maggie sings the steps.
const HOP_COLUMNS = [[1], [2], [3], [4, 5], [6], [7, 8], [9]];
export function hopscotchClose(ctx, { hopped = [2, 7] } = {}) {
  dim(ctx);
  ctx.fillStyle = '#4a3624';
  ctx.fillRect(56, 36, 368, 150);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let y = 46; y < 186; y += 14) ctx.fillRect(56, y, 368, 1); // floorboards
  const S = 34;
  const middle = 111;
  let x = 104;
  ctx.strokeStyle = CHALK;
  ctx.lineWidth = 2.5;
  HOP_COLUMNS.forEach((column) => {
    column.forEach((n, j) => {
      const y = column.length === 1 ? middle - S / 2 : middle - S + j * S;
      if (hopped.includes(n)) {
        ctx.fillStyle = 'rgba(236,236,226,0.22)';
        ctx.fillRect(x, y, S, S);
      }
      ctx.strokeRect(x + 0.5, y + 0.5, S, S);
      serifText(ctx, String(n), x + S / 2, y + S / 2 + 6, 17, CHALK, { style: 'bold' });
    });
    x += S;
  });
  ctx.beginPath(); // 10, home
  ctx.arc(x, middle, S, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  serifText(ctx, '10', x + 15, middle + 6, 15, CHALK, { style: 'bold' });
  osdText(ctx, hopped.join('  ·  '), W / 2, 14, 12, '#e8e8dc', 'center');
  subtitle(ctx, '(Maggie, skipping) Two for the chalk and seven for the bell, five for the lady who watches as well…');
  hint(ctx, 'CLICK a square  ·  1–9  ·  ESC step back');
}

// Proposal for wing 1: the sick-bay fuse box up close, like the records
// lock. Click a lever or press 1–4; pulled levers stay down (here 3, then 1).
export function fuseBoxClose(ctx, { pulled = [3, 1] } = {}) {
  dim(ctx);
  ctx.fillStyle = '#4a4e48';
  ctx.fillRect(150, 30, 180, 196);
  ctx.fillStyle = '#8a8e88';
  ctx.fillRect(156, 36, 168, 184);
  ctx.fillStyle = '#d8b030'; // warning: a bolt in a triangle, no words
  ctx.beginPath();
  ctx.moveTo(240, 42);
  ctx.lineTo(254, 64);
  ctx.lineTo(226, 64);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(239, 48, 3, 8);
  ctx.fillRect(237, 56, 3, 5);
  [1, 2, 3, 4].forEach((n, i) => {
    const x = 174 + i * 36;
    const down = pulled.includes(n);
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(x, 74, 24, 20);
    osdText(ctx, String(n), x + 12, 78, 12, '#d8d4c8', 'center');
    ctx.fillStyle = '#26262a';
    ctx.fillRect(x + 8, 104, 8, 96);
    ctx.fillStyle = '#a03028';
    ctx.fillRect(x + 2, down ? 172 : 104, 20, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 2, down ? 172 : 104, 20, 4);
  });
  hint(ctx, 'CLICK a lever  ·  1–4  ·  ESC step back');
}
