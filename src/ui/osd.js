// Drawing helpers for the 480×270 UI layer, in the VCR on-screen-display
// style of the approved stills.

export const UI_FONT = '"DejaVu Sans Mono", Consolas, "Lucida Console", "Courier New", monospace';
export const COLORS = {
  text: '#e8f0ff',
  dim: '#8892a2',
  soft: '#c9d2e0',
  red: '#d8382e',
  ink: '#05070a',
  osdBlue: '#0d1f9e',
  osdValue: '#ffe27a',
  osdSoft: '#c9d2ff',
  osdGrey: '#8fa0e8',
};

export function osdText(ctx, text, x, y, size, color = COLORS.text, align = 'left') {
  ctx.font = `bold ${size}px ${UI_FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Shrinks the font until the text fits maxWidth (long Greek labels).
export function fittedSize(ctx, text, size, maxWidth) {
  let fitted = size;
  ctx.font = `bold ${fitted}px ${UI_FONT}`;
  while (fitted > 6 && ctx.measureText(text).width > maxWidth) {
    fitted -= 0.5;
    ctx.font = `bold ${fitted}px ${UI_FONT}`;
  }
  return fitted;
}

// Splits text into lines that fit maxWidth at the given size.
// Wraps words to maxWidth; a newline in the text starts a new line.
export function wrapText(ctx, text, size, maxWidth) {
  if (text.includes('\n')) return text.split('\n').flatMap((part) => wrapText(ctx, part, size, maxWidth));
  ctx.font = `bold ${size}px ${UI_FONT}`;
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function button(ctx, label, x, y, w, active) {
  ctx.fillStyle = active ? COLORS.text : 'rgba(232,240,255,0.08)';
  ctx.fillRect(x, y, w, 15);
  const size = fittedSize(ctx, label, 10, w - 6);
  osdText(ctx, label, x + w / 2, y + 2, size, active ? COLORS.ink : COLORS.text, 'center');
}
