// Drawing helpers for paper: the journal notebook and found documents.
export const PAPER = '#d9cfb4';
export const PAPER_DARK = '#a89e84';
export const INK = '#2a2418';
export const INK_SOFT = '#5a4c34';
const SERIF = 'Georgia, "Times New Roman", serif';

export function paperText(ctx, text, x, y, size, color = INK) {
  ctx.font = `${size}px ${SERIF}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Word-wrapped paragraph; returns the y below the last line.
export function paperParagraph(ctx, text, x, y, width, size, lineHeight, color = INK) {
  ctx.font = `${size}px ${SERIF}`;
  let line = '';
  let row = 0;
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) {
      paperText(ctx, line, x, y + row * lineHeight, size, color);
      line = word;
      row += 1;
    } else {
      line = next;
    }
  }
  if (line) paperText(ctx, line, x, y + row * lineHeight, size, color);
  return y + (row + 1) * lineHeight;
}
