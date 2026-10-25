// Shelf close-up (approved still ui_shelf): the 700–799 bookcase up close,
// numbered spines on three shelves (770–793). Click a book to take it out;
// the puzzle (puzzles/libraryIndex.js) decides what is inside. The mouse
// frames the book it is on; once taken, 784 leaves a gap. ESC or a click
// outside steps back. Numbers only, so it reads the same in Greek.
import { osdText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const H = 270;
const SERIF = 'Georgia, "DejaVu Serif", serif';
const SPINES = ['#5a2a22', '#2e3a4a', '#3a4a2e', '#6a5a3a', '#4a2e3a', '#2a2a28', '#7a6a50'];
const FIRST = [770, 778, 786]; // the first book on each shelf

// Where each book stands: widths and heights vary a little, fixed per number.
function layout() {
  const books = [];
  FIRST.forEach((first, row) => {
    const bottom = 100 + row * 62;
    let x = 86;
    for (let number = first; number < first + 8; number++) {
      const w = 34 + ((number * 7) % 4) * 2;
      const h = 46 + ((number * 5) % 5) * 2;
      books.push({ number, x, y: bottom - h, w: w - 2, h, bottom });
      x += w;
    }
  });
  return books;
}
const BOOKS = layout();

export function createShelfScreen(ui, { take, taken, note }) {
  const { t } = ui;
  const openedAt = performance.now();
  let hovered = null;

  function drawBook(ctx, book) {
    if (taken().includes(book.number)) return; // a gap where it stood
    const lift = book.number === hovered ? 5 : 0;
    const top = book.y - lift;
    ctx.fillStyle = SPINES[book.number % SPINES.length];
    ctx.fillRect(book.x, top, book.w, book.h);
    ctx.fillStyle = 'rgba(220,200,150,0.4)'; // gilt bands
    ctx.fillRect(book.x, top + 6, book.w, 2);
    ctx.fillRect(book.x, top + 11, book.w, 1);
    ctx.fillStyle = '#e8e0cc';
    ctx.fillRect(book.x + 4, top + book.h - 16, book.w - 8, 11);
    ctx.font = `bold 8px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#1a1410';
    ctx.fillText(String(book.number), book.x + book.w / 2, top + book.h - 7);
    if (lift) {
      ctx.strokeStyle = '#ffe27a';
      ctx.lineWidth = 2;
      ctx.strokeRect(book.x - 2, top - 2, book.w + 4, book.h + 4);
    }
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a1a10';
    ctx.fillRect(70, 18, 340, 210);
    ctx.fillStyle = '#b8944a';
    ctx.fillRect(208, 22, 64, 13);
    ctx.font = `bold 9px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#2a1e10';
    ctx.fillText('700–799', 240, 32);
    FIRST.forEach((first, row) => {
      ctx.fillStyle = '#4a3424';
      ctx.fillRect(74, 100 + row * 62, 332, 6);
    });
    BOOKS.forEach((book) => drawBook(ctx, book));
    const line = note();
    if (line) osdText(ctx, t(line), W / 2, 232, fittedSize(ctx, t(line), 9, 440), COLORS.soft, 'center');
    osdText(ctx, t('shelf.footer'), W / 2, H - 22, 8, COLORS.dim, 'center');
  }

  function hits() {
    const books = BOOKS.map((book) => ({
      x: book.x, y: book.y - 5, w: book.w, h: book.h + 5,
      hover: () => (hovered = book.number),
      click: () => take(book.number),
    }));
    const outside = { x: 0, y: 0, w: W, h: H, hover: () => (hovered = null), click: () => performance.now() - openedAt > 400 && ui.resume() };
    return [...books, outside];
  }

  function key(code) {
    if (code !== 'Escape') return false;
    ui.resume();
    return true;
  }

  return { name: 'shelf', look: 'paper', draw, hits, key, taken, note };
}
