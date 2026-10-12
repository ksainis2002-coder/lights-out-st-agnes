// Lays journal text out over pages: blocks of wrapped lines flow down a
// column and on into the next; columns group into pages. Each line is
// { text, x, y, size, color }, ready to draw.
import { paperLines } from '../paper.js';

// columns: [{ x, top, bottom }] for one page (or one spread).
// blocks: [{ text, size, lineHeight, gap, color }]
export function layoutPages(ctx, columns, blocks, width) {
  const pages = [[]];
  let column = 0;
  let y = columns[0].top;
  const nextColumn = () => {
    column += 1;
    if (column === columns.length) {
      pages.push([]);
      column = 0;
    }
    y = columns[column].top;
  };
  for (const block of blocks) {
    for (const text of paperLines(ctx, block.text, width, block.size)) {
      if (y + block.lineHeight > columns[column].bottom) nextColumn();
      pages[pages.length - 1].push({ text, x: columns[column].x, y, size: block.size, color: block.color });
      y += block.lineHeight;
    }
    y += block.gap ?? 0;
  }
  return pages;
}
