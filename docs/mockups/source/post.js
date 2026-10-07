// Shared mockup helpers: low-res canvas, 15-bit colour + Bayer dither, VHS overlay.
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Quantise to 5 bits per channel with ordered dither (PS1 15-bit look).
export function quantise(ctx, w, h, strength = 1) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const t = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 8 * strength;
      for (let k = 0; k < 3; k++) {
        const v = Math.max(0, Math.min(255, d[i + k] + t));
        d[i + k] = (v >> 3) << 3;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// VHS: chroma bleed, grain, scanlines, a tracking band, vignette. Drawn at low res.
export function vhs(ctx, w, h, opts = {}) {
  const { grain = 18, band = 0.82, bleed = 1 } = opts;
  const img = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(img.data);
  const d = img.data;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < h; y++) {
    const inBand = Math.abs(y / h - band) < 0.018;
    const shift = inBand ? Math.floor(rnd() * 6) - 2 : 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const sx = Math.min(w - 1, Math.max(0, x + shift));
      const rI = (y * w + Math.max(0, sx - bleed)) * 4;
      const bI = (y * w + Math.min(w - 1, sx + bleed)) * 4;
      const n = (rnd() - 0.5) * grain + (inBand ? 30 * rnd() : 0);
      const scan = y % 2 ? 0.86 : 1;
      const vx = x / w - 0.5, vy = y / h - 0.5;
      const vig = 1 - Math.min(1, (vx * vx + vy * vy) * 1.6);
      d[i] = (src[rI] + n) * scan * vig;
      d[i + 1] = (src[(y * w + sx) * 4 + 1] + n) * scan * vig;
      d[i + 2] = (src[bI + 2] + n) * scan * vig;
    }
  }
  ctx.putImageData(img, 0, 0);
}

// Scale a low-res canvas to the page with nearest-neighbour filtering.
export function present(lowRes) {
  const out = document.getElementById('screen');
  out.width = 1280; out.height = 720;
  const o = out.getContext('2d');
  o.imageSmoothingEnabled = false;
  o.drawImage(lowRes, 0, 0, 1280, 720);
  return o;
}

// Simple OSD text with a dark drop shadow, VCR style.
export function osdText(ctx, text, x, y, size, color = '#e8f0ff', align = 'left') {
  ctx.font = `bold ${size}px "DejaVu Sans Mono", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
