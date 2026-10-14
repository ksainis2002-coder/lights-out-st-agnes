// Props for the school nurse's room (0.3, part A): the eye chart, the
// weighing scales with a height rod, an examination couch, a desk lamp and a
// typed notice. Same conventions as catalog.js: origin on the floor, front
// facing +z; wall things have their back on the wall at z = 0.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

// Eye chart rows, biggest first, using only capitals that look the same in
// Latin and Greek (E T O Z H A K M N P X Y B I), so it reads right in both
// languages without translation.
const CHART_ROWS = ['E', 'TZ', 'OHA', 'KMNP', 'XYBIE', 'TOZHAK', 'MNPXYB', 'IETOZHA'];
const ROW_SIZES = [22, 14, 10, 8, 6, 5, 4, 3];

function eyeChartTexture() {
  return canvasTexture(64, 112, (g, w) => {
    g.fillStyle = '#e4e0d4';
    g.fillRect(0, 0, w, 112);
    g.fillStyle = '#141414';
    g.textAlign = 'center';
    let y = 6;
    CHART_ROWS.forEach((row, r) => {
      const size = ROW_SIZES[r];
      y += size;
      g.font = `bold ${size}px sans-serif`;
      const step = size * 1.2;
      [...row].forEach((letter, i) => g.fillText(letter, w / 2 + (i - (row.length - 1) / 2) * step, y));
      if (r === 5) {
        g.fillStyle = '#b02020'; // the line a child should read down to
        g.fillRect(8, y + 2, w - 16, 1);
        g.fillStyle = '#141414';
      }
      y += Math.max(2, Math.round(size * 0.45));
    });
  });
}

// The eye chart on its card, hung on the wall.
function eyeChart(t) {
  return group(
    box(t.sheet, [0.46, 0.8, 0.012], [0, 1.12, 0.006], { color: '#d8d4c8' }),
    decal(eyeChartTexture(), [0.42, 0.74], [0, 1.52, 0.014]),
    box(t.iron, [0.06, 0.03, 0.02], [0, 1.93, 0.01], { color: '#2a2a2a' }),
  );
}

// Doctor's scales: a platform, a column with a sliding-weight beam, and a
// height rod with a head bar. White enamel and black iron.
function scales(t) {
  const enamel = { color: '#d0d2ca' };
  const iron = { color: '#2a2a2c' };
  return group(
    box(t.sheet, [0.42, 0.07, 0.52], [0, 0, 0.08], enamel),
    box(t.sheet, [0.3, 0.01, 0.34], [0, 0.07, 0.1], { color: '#5a5a54' }), // rubber mat
    box(t.sheet, [0.07, 1.25, 0.07], [0, 0.07, -0.16], enamel),
    box(t.iron, [0.48, 0.03, 0.03], [0.17, 1.28, -0.16], iron), // the beam
    box(t.sheet, [0.035, 0.06, 0.045], [0.26, 1.265, -0.16], { color: '#c8a050' }), // its weight
    box(t.iron, [0.025, 0.72, 0.025], [0, 1.32, -0.19], iron), // height rod
    box(t.iron, [0.03, 0.015, 0.24], [0, 1.95, -0.08], iron), // head bar
  );
}

// Examination couch: padded top on an enamel frame, the head end raised,
// a strip of paper sheet down it, a step at the side.
function examCouch(t) {
  const enamel = { color: '#c8ccc4' };
  const leather = { color: '#5a3a2e' };
  const legs = [[-0.8, -0.25], [0.8, -0.25], [-0.8, 0.25], [0.8, 0.25]].map(([x, z]) => box(t.iron, [0.04, 0.56, 0.04], [x, 0, z], enamel));
  const head = group(box(t.sheet, [0.55, 0.09, 0.6], [-0.275, 0, 0], leather));
  head.position.set(-0.4, 0.6, 0);
  head.rotation.z = -0.45;
  return group(
    ...legs,
    box(t.iron, [1.7, 0.04, 0.56], [0, 0.56, 0], enamel),
    box(t.sheet, [1.25, 0.1, 0.6], [0.225, 0.6, 0], leather),
    box(t.sheet, [1.1, 0.008, 0.46], [0.25, 0.7, 0], { color: '#e0dccc' }), // paper sheet
    head,
    box(t.paintedWood, [0.4, 0.22, 0.3], [0.3, 0, 0.5], { color: '#6a6a62' }), // the step
  );
}

// Desk lamp with a green glass shade over a warm bulb (sits on a table top);
// lit, it throws a small pool of light.
function deskLamp(t, { lit = true } = {}) {
  const brass = { color: '#b8944a' };
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.26, 8, 1, false, 0, Math.PI), materialFor(t.sheet, { color: '#2a6a3a', side: THREE.DoubleSide }));
  shade.rotation.z = Math.PI / 2; // lying along x, the half-shell on top
  shade.position.set(0, 0.36, 0.04);
  const parts = [
    box(t.sheet, [0.18, 0.025, 0.12], [0, 0, 0], brass),
    box(t.sheet, [0.02, 0.34, 0.02], [0, 0.02, -0.03], brass),
    shade,
    box(t.sheet, [0.12, 0.03, 0.03], [0, 0.33, 0.04], lit ? { unlit: true, color: '#f8e0a0' } : { color: '#8a8a80' }),
  ];
  if (lit) {
    const glow = new THREE.PointLight('#f0c890', 1.4, 3.2, 1.3);
    glow.position.set(0, 0.3, 0.1);
    parts.push(glow);
  }
  return group(...parts);
}

// A typed notice pinned to the wall: a heading and lines too small to read
// (its words come up as a message when you look at it).
function notice(t) {
  const paper = canvasTexture(16, 22, (g, w, h) => {
    g.fillStyle = '#ddd6c0';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2622';
    g.fillRect(3, 2, 10, 2);
    g.fillStyle = '#6a6458';
    for (let y = 6; y < h - 5; y += 2) g.fillRect(2, y, w - 4 - ((y * 5) % 4), 1);
    g.fillStyle = '#5a3a6a'; // a rubber stamp
    g.fillRect(9, h - 4, 5, 2);
  });
  return group(decal(paper, [0.22, 0.3], [0, 1.55, 0.01]), box(t.sheet, [0.015, 0.015, 0.01], [0, 1.68, 0.012], { color: '#a02020' }));
}

export const NURSE_PROPS = { eyeChart, scales, examCouch, deskLamp, notice };
