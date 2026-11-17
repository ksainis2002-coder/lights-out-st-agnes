// The chapel and its crypt (0.5 proposal, docs/DESIGN_0.5.md; mockup stills
// only until the owner approves them): pews, the altar, a rack of votive
// candles, the font, the board of the five children's names, the crypt's
// memorial plaques and the niche, St. Agnes' stone heart (the fourth piece,
// owner pick 2026-11-17), and St. Agnes made whole. Origin on the floor,
// front facing +z (a wall piece: its back on the wall line).
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';
import { SCHOOL_PROPS } from './school.js';
import { CEMETERY_PROPS } from './cemetery.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

const STONE = { color: '#74716a', flatShading: true };
const DARK_WOOD = { color: '#3e2a1c' };
const CHILDREN = ['AGNES', 'T. HALE', 'M. ROWE', 'S. PIKE', 'E. CARR'];

// A wooden pew: seat, a back and two carved ends.
function pew(t, { length = 2.4 } = {}) {
  const end = (x) => box(t.wood, [0.06, 0.95, 0.5], [x, 0, 0], DARK_WOOD);
  return group(
    box(t.wood, [length, 0.05, 0.4], [0, 0.43, 0.02], DARK_WOOD),
    box(t.wood, [length, 0.42, 0.04], [0, 0.48, -0.2], DARK_WOOD),
    box(t.wood, [length, 0.05, 0.06], [0, 0.9, -0.2], { color: '#4a3222' }),
    box(t.wood, [length, 0.04, 0.18], [0, 0.72, -0.31], DARK_WOOD), // the book ledge for the row behind
    end(-length / 2 + 0.03), end(length / 2 - 0.03),
  );
}

// A small flame and its light: votives, candlesticks.
function flame(t, at, light = null) {
  const tip = box(t.sheet, [0.012, 0.03, 0.012], at, { unlit: true, color: 0xffd27a });
  if (!light) return [tip];
  const glow = new THREE.PointLight('#ffb866', light, 3.2, 1.6);
  glow.position.set(at[0], at[1] + 0.05, at[2]);
  return [tip, glow];
}

// The altar: a stone block under a white cloth, two candlesticks.
function altar(t, { lit = true } = {}) {
  const stick = (x) => [
    box(t.iron, [0.06, 0.02, 0.06], [x, 1.02, 0], { color: '#8a7448' }),
    box(t.iron, [0.025, 0.3, 0.025], [x, 1.04, 0], { color: '#8a7448' }),
    box(t.sheet, [0.035, 0.14, 0.035], [x, 1.34, 0], { color: '#e8e0c8' }),
    ...(lit ? flame(t, [x, 1.5, 0], x < 0 ? 0.9 : 0) : []),
  ];
  return group(
    box(t.stone, [1.8, 1.0, 0.8], [0, 0, 0], STONE),
    box(t.sheet, [1.86, 0.02, 0.86], [0, 1.0, 0], { color: '#d8d4c8' }),
    box(t.sheet, [1.86, 0.36, 0.01], [0, 0.66, 0.43], { color: '#cfcabc' }),
    ...stick(-0.6), ...stick(0.6),
  );
}

// An iron rack of votive candles, most burnt down, a few still lit.
function votiveRack(t, { lit = 3 } = {}) {
  const parts = [box(t.iron, [0.9, 0.04, 0.3], [0, 0.85, 0], { color: '#2a2724' }), box(t.iron, [0.04, 0.85, 0.04], [0, 0, 0], { color: '#2a2724' })];
  let n = 0;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 6; i++) {
      const x = -0.36 + i * 0.144;
      const z = row ? 0.07 : -0.07;
      const height = 0.02 + ((i * 7 + row * 3) % 5) * 0.012;
      parts.push(box(t.sheet, [0.04, height, 0.04], [x, 0.89, z], { color: '#d8d0b8' }));
      if ((i + row * 2) % 4 === 1 && n < lit) parts.push(...flame(t, [x, 0.91 + height, z], n++ === 0 ? 0.8 : 0));
    }
  }
  return group(...parts);
}

// The font: a stone basin on a stout pedestal, dry.
function font(t) {
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.24, 0.26, 8), materialFor(t.stone, STONE));
  basin.position.y = 0.9;
  const inside = new THREE.Mesh(new THREE.CircleGeometry(0.29, 8), materialFor(t.stone, { color: '#3a3834' }));
  inside.rotation.x = -Math.PI / 2;
  inside.position.y = 1.0;
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.8, 8), materialFor(t.stone, STONE));
  pedestal.position.y = 0.4;
  return group(pedestal, basin, inside);
}

// Words cut into stone or painted on a board: the names of the five.
function lettering(lines, { width = 128, height = 96, ink = '#2a2622', ground = '#8a867c', title = null } = {}) {
  return canvasTexture(width, height, (g, w, h) => {
    g.fillStyle = ground;
    g.fillRect(0, 0, w, h);
    g.fillStyle = ink;
    g.textAlign = 'center';
    let y = 18;
    if (title) {
      g.font = 'bold 9px serif';
      g.fillText(title, w / 2, 14);
      y = 32;
    }
    g.font = 'bold 12px serif';
    lines.forEach((line, i) => g.fillText(line, w / 2, y + i * ((h - y) / lines.length)));
  });
}

// The board by the font: the five children, under the words from wing 2's class painting.
function nameBoard(t) {
  const words = lettering(CHILDREN, { width: 96, height: 128, ink: '#e8dcb0', ground: '#2e2018', title: 'THOSE WHO HAVE LEFT US' });
  return group(
    box(t.wood, [0.66, 0.86, 0.04], [0, 1.1, 0.02], { color: '#2e2018' }),
    decal(words, [0.6, 0.8], [0, 1.53, 0.045]),
  );
}

// A memorial plaque in the crypt wall: one child's name, cut into stone.
// "set": pushed home (the crypt's puzzle wants them in the roll's order).
function memorialPlaque(t, { name = 'AGNES', set = false } = {}) {
  const words = lettering([name], { width: 96, height: 48, ink: '#2a2622', ground: '#9a968c' });
  return group(
    box(t.stone, [0.5, 0.34, 0.06], [0, 1.15, set ? 0.0 : 0.03], { color: '#8e8a80', flatShading: true }),
    decal(words, [0.44, 0.22], [0, 1.32, set ? 0.031 : 0.061]),
  );
}

// St. Agnes' heart: stone, the size of a child's fist, a faint warmth in it.
// Grey stone like the rest of her (owner 2026-11-17: the first, red-brown, read as a wound).
function stoneHeart(t) {
  const material = materialFor(t.stone, { color: '#86837a', flatShading: true });
  const lobe = (x) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 7, 5), material);
    m.position.set(x, 0.07, 0);
    return m;
  };
  const point = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.08, 7), material);
  point.rotation.x = Math.PI;
  point.position.y = 0.035;
  return group(lobe(-0.025), lobe(0.025), point);
}

// The niche in the crypt wall where her heart was kept; "heart": still there.
function cryptNiche(t, { heart = true } = {}) {
  const parts = [
    box(t.stone, [0.6, 0.06, 0.36], [0, 1.0, 0.18], STONE), // the ledge
    box(t.stone, [0.62, 0.56, 0.02], [0, 1.0, 0.01], { color: '#1a1816' }), // the dark of the niche
    box(t.stone, [0.08, 0.6, 0.36], [-0.34, 1.0, 0.18], STONE),
    box(t.stone, [0.08, 0.6, 0.36], [0.34, 1.0, 0.18], STONE),
    box(t.stone, [0.76, 0.1, 0.38], [0, 1.6, 0.19], STONE),
  ];
  if (heart) {
    const h = stoneHeart(t);
    h.position.set(0, 1.06, 0.2);
    parts.push(h);
  }
  return group(...parts);
}

// St. Agnes made whole: her right hand back at the wrist and open, the lamb
// in the crook of her left arm, her heart set in her breast.
function statueWhole(t) {
  const her = SCHOOL_PROPS.statue(t);
  her.children.at(-1).visible = false; // the fresh break at the right wrist
  const stone = materialFor(t.stone, STONE);
  const hand = new THREE.Group();
  const part = (size, at, tilt = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size), stone);
    m.position.set(...at);
    m.rotation.z = tilt;
    hand.add(m);
  };
  part([0.06, 0.12, 0.03], [0, 0.06, 0]); // the palm, open, towards you
  [-0.02, -0.007, 0.007, 0.02].forEach((x, i) => part([0.011, 0.06 - Math.abs(i - 1.5) * 0.008, 0.012], [x, 0.14, 0]));
  part([0.012, 0.045, 0.012], [0.04, 0.07, 0], -0.7); // the thumb
  part([0.05, 0.05, 0.05], [0, -0.02, -0.02]); // the wrist, joined where it broke
  hand.scale.setScalar(1.5); // owner 2026-11-17: the hand and the lamb should read at a glance
  hand.position.set(0.12, 1.3, 0.33);
  const lamb = CEMETERY_PROPS.stoneLamb(t); // the size it was cut to fill her arm
  lamb.scale.multiplyScalar(1.25);
  lamb.rotation.y = -0.2;
  lamb.position.set(-0.14, 1.16, 0.3);
  // Her heart set into a hollow carved in her breast, grey stone, a faint warmth in it.
  const hollow = new THREE.Mesh(new THREE.CircleGeometry(0.085, 10), materialFor(t.stone, { color: '#2e2c28' }));
  hollow.scale.y = 1.15;
  hollow.position.set(0, 1.56, 0.245);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.012, 4, 12), stone);
  rim.scale.y = 1.15;
  rim.position.set(0, 1.56, 0.247);
  const heart = stoneHeart(t);
  heart.scale.setScalar(1.25);
  heart.position.set(0, 1.505, 0.255);
  const warmth = new THREE.PointLight('#ffcc90', 0.35, 0.6, 1.5);
  warmth.position.set(0, 1.56, 0.4);
  return group(her, hand, lamb, hollow, rim, heart, warmth);
}

export const CHAPEL_PROPS = { pew, altar, votiveRack, font, nameBoard, memorialPlaque, stoneHeart, cryptNiche, statueWhole };
export { CHILDREN };
