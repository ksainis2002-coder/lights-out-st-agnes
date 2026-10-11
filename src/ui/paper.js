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

// Shortens text with "…" until it fits in width (one line, e.g. a list row).
export function fitPaperText(ctx, text, width, size) {
  ctx.font = `${size}px ${SERIF}`;
  if (ctx.measureText(text).width <= width) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > width) cut = cut.slice(0, -1);
  return `${cut.trimEnd()}…`;
}

// The lines a paragraph wraps to at this width (a newline starts a new line),
// without drawing: for laying text out over pages.
export function paperLines(ctx, text, width, size) {
  ctx.font = `${size}px ${SERIF}`;
  const lines = [];
  for (const part of text.split('\n')) {
    let line = '';
    for (const word of part.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > width && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

// Wraps words to width and draws; returns the y below the last line.
export function paperParagraph(ctx, text, x, y, width, size, lineHeight, color = INK) {
  if (text.includes('\n')) {
    return text.split('\n').reduce((top, part) => paperParagraph(ctx, part, x, top, width, size, lineHeight, color), y);
  }
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
