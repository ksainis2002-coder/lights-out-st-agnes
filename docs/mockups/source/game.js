// Mockup-only software render of a dorm corridor in the intended PS1 look.
// The real game uses Three.js; this only shows palette, fog, light and resolution.
import { makeCanvas } from './post.js';

export const W = 320, H = 180;
const T = 32;

function texture(fn) {
  const c = makeCanvas(T, T), g = c.getContext('2d');
  const img = g.createImageData(T, T);
  let s = 3;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const [r, gg, b] = fn(x, y, rnd);
    const i = (y * T + x) * 4;
    img.data.set([r, gg, b, 255], i);
  }
  return img.data;
}

const plaster = texture((x, y, r) => {
  const n = r() * 18;
  if (y > 20) return y === 21 ? [40, 30, 22] : [78 + n, 58 + n, 40 + n * 0.5]; // wood wainscot
  const stain = (x * 7 + y * 3) % 23 < 2 ? -25 : 0;
  return [150 + n + stain, 146 + n + stain, 120 + n + stain];
});
const door = texture((x, y, r) => {
  const n = r() * 14;
  if (x < 2 || x > 29 || y < 2) return [35, 28, 22];
  if (y > 9 && y < 14 && x > 10 && x < 21) return [20, 22, 18]; // wired glass
  if (x === 25 && y === 17) return [180, 170, 120]; // handle
  return [92 + n, 80 + n, 64 + n];
});
const floor = texture((x, y, r) => {
  const n = r() * 12;
  const check = ((x >> 4) + (y >> 4)) & 1;
  return check ? [120 + n, 116 + n, 100 + n] : [58 + n, 70 + n, 62 + n];
});
const ceil = texture((x, y, r) => {
  const n = r() * 10;
  return x % 16 === 0 || y % 16 === 0 ? [60, 60, 56] : [104 + n, 104 + n, 96 + n];
});

const MAP = [
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1111111111111111',
  '1112111211121111',
  '1000000000000001',
  '1000000000000001',
  '1112111121112111',
  '1111111111111111',
];
const cell = (x, y) => (MAP[y] && MAP[y][x]) || '1';

const FOG = [6, 9, 10];
function shade(rgb, dist, sx, sy) {
  const dx = (sx - W * 0.52) / W, dy = (sy - H * 0.55) / H;
  const spot = Math.max(0, 1 - (dx * dx + dy * dy * 1.8) * 7);
  const light = 0.22 + (spot * 2.1) / (1 + dist * 0.3);
  const fog = Math.min(1, Math.exp(-dist * 0.13));
  const k = light * fog;
  return [rgb[0] * k + FOG[0] * (1 - fog), rgb[1] * k + FOG[1] * (1 - fog), rgb[2] * k + FOG[2] * (1 - fog)];
}

export function renderCorridor() {
  const c = makeCanvas(W, H), g = c.getContext('2d');
  const img = g.createImageData(W, H), d = img.data;
  const px = 1.6, py = 7.95, dirX = 1, dirY = 0.06, plX = -0.04, plY = 0.66;
  const zbuf = new Float32Array(W);
  const put = (x, y, rgb) => { const i = (y * W + x) * 4; d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255; };

  for (let y = 0; y < H; y++) {
    const p = y - H / 2;
    if (p === 0) continue;
    const isFloor = p > 0;
    const rowDist = (0.5 * H) / Math.abs(p);
    const lx = dirX - plX, ly = dirY - plY, rx = dirX + plX, ry = dirY + plY;
    let fx = px + rowDist * lx, fy = py + rowDist * ly;
    const sx = (rowDist * (rx - lx)) / W, sy = (rowDist * (ry - ly)) / W;
    for (let x = 0; x < W; x++, fx += sx, fy += sy) {
      const tx = Math.floor(T * (fx % 1)) & (T - 1), ty = Math.floor(T * (fy % 1)) & (T - 1);
      const tex = isFloor ? floor : ceil, i = (ty * T + tx) * 4;
      put(x, y, shade([tex[i], tex[i + 1], tex[i + 2]], rowDist, x, y));
    }
  }

  for (let x = 0; x < W; x++) {
    const camX = (2 * x) / W - 1;
    const rdx = dirX + plX * camX, rdy = dirY + plY * camX;
    let mx = Math.floor(px), my = Math.floor(py);
    const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
    const stx = rdx < 0 ? -1 : 1, sty = rdy < 0 ? -1 : 1;
    let sdx = (rdx < 0 ? px - mx : mx + 1 - px) * ddx;
    let sdy = (rdy < 0 ? py - my : my + 1 - py) * ddy;
    let side = 0, hit = '0';
    for (let n = 0; n < 64 && hit === '0'; n++) {
      if (sdx < sdy) { sdx += ddx; mx += stx; side = 0; } else { sdy += ddy; my += sty; side = 1; }
      hit = cell(mx, my);
    }
    const dist = side === 0 ? sdx - ddx : sdy - ddy;
    zbuf[x] = dist;
    const lineH = Math.floor(H / dist);
    const y0 = Math.max(0, Math.floor(-lineH / 2 + H / 2)), y1 = Math.min(H - 1, Math.floor(lineH / 2 + H / 2));
    let wx = side === 0 ? py + dist * rdy : px + dist * rdx;
    wx -= Math.floor(wx);
    const tx = Math.floor(wx * T) & (T - 1);
    const tex = hit === '2' ? door : plaster;
    for (let y = y0; y <= y1; y++) {
      const ty = Math.floor(((y - H / 2 + lineH / 2) * T) / lineH) & (T - 1);
      const i = (ty * T + tx) * 4;
      const dim = side === 1 ? 0.78 : 1;
      put(x, y, shade([tex[i] * dim, tex[i + 1] * dim, tex[i + 2] * dim], dist, x, y));
    }
  }
  g.putImageData(img, 0, 0);
  return { canvas: c, ctx: g };
}
