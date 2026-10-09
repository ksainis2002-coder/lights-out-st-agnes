// Pixel recipes for the generated 32×32 textures. Each returns [r, g, b]
// for one pixel; `random` is a seeded generator so textures never change.
// Plaster, door, floor and ceiling match the approved 0.1 stills.

export function plaster(x, y, random) {
  const n = random() * 18;
  if (y > 20) return y === 21 ? [40, 30, 22] : [78 + n, 58 + n, 40 + n * 0.5];
  const stain = (x * 7 + y * 3) % 23 < 2 ? -25 : 0;
  return [150 + n + stain, 146 + n + stain, 120 + n + stain];
}

export function door(x, y, random) {
  const n = random() * 14;
  if (x < 2 || x > 29 || y < 2) return [35, 28, 22];
  if (y > 9 && y < 14 && x > 10 && x < 21) return [20, 22, 18];
  if (x === 25 && y === 17) return [180, 170, 120];
  return [92 + n, 80 + n, 64 + n];
}

export function floor(x, y, random) {
  const n = random() * 12;
  const check = ((x >> 4) + (y >> 4)) & 1;
  return check ? [120 + n, 116 + n, 100 + n] : [58 + n, 70 + n, 62 + n];
}

export function ceiling(x, y, random) {
  const n = random() * 10;
  return x % 16 === 0 || y % 16 === 0 ? [60, 60, 56] : [104 + n, 104 + n, 96 + n];
}

// Asylum patient room: pale green glazed tiles with grey grout, dirt low down.
export function tile(x, y, random) {
  const n = random() * 10;
  if (x % 4 === 0 || y % 4 === 0) return [128 + n, 134 + n, 126 + n];
  const dirt = y > 26 ? (y - 26) * 5 : 0;
  return [168 + n - dirt, 186 + n - dirt, 170 + n - dirt];
}

// Orphanage dorm: faded striped wallpaper with small flowers above a wood wainscot.
export function wallpaper(x, y, random) {
  const n = random() * 14;
  if (y > 20) return y === 21 ? [44, 32, 24] : [84 + n, 62 + n, 44 + n * 0.5];
  const stripe = x % 8 < 2 ? -18 : 0;
  const flower = (x % 8 === 5 && y % 10 === 4) || (x % 8 === 4 && y % 10 === 5) ? 40 : 0;
  const damp = y < 4 ? -20 : 0;
  return [150 + n + stripe + flower + damp, 132 + n + stripe + damp, 118 + n + stripe - flower * 0.3 + damp];
}

// Worn floorboards.
export function wood(x, y, random) {
  const n = random() * 16;
  if (y % 8 === 0) return [36, 26, 18];
  const grain = Math.sin((x + (y >> 3) * 11) * 0.7) * 6;
  return [96 + n + grain, 68 + n + grain, 44 + n * 0.6];
}

// Grey bed sheet with a few creases.
export function sheet(x, y, random) {
  const n = random() * 10;
  const crease = (x + y * 2) % 13 === 0 ? -22 : 0;
  return [176 + n + crease, 176 + n + crease, 168 + n + crease];
}

// Old striped mattress ticking.
export function mattress(x, y, random) {
  const n = random() * 10;
  const stripe = x % 6 < 2 ? [92, 96, 120] : [168, 160, 140];
  return stripe.map((c) => c + n);
}

// Chipped black-painted iron.
export function iron(x, y, random) {
  const n = random() * 12;
  const chip = random() < 0.06 ? 50 : 0;
  return [30 + n + chip, 30 + n + chip * 0.8, 32 + n + chip * 0.6];
}

// Plain painted wood for tables, cubbies and toys.
export function paintedWood(x, y, random) {
  const n = random() * 14;
  return [118 + n, 92 + n, 62 + n];
}

// Night window: dark blue glass with frame bars.
export function windowPane(x, y, random) {
  const n = random() * 8;
  if (x < 2 || x > 29 || y < 2 || y > 29 || x === 15 || x === 16 || y === 15) return [40, 34, 28];
  return [22 + n, 30 + n, 52 + n * 2];
}

// Brown tape-recorder casing with a silver panel.
export function recorder(x, y, random) {
  const n = random() * 8;
  if (y < 12) return [150 + n, 150 + n, 146 + n];
  return [62 + n, 46 + n, 34 + n];
}
