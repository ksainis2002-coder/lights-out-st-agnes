// The chapel and its crypt (0.5 part A; approved stills chapel, statue_whole,
// crypt; the wing 4 content sheet): pews, the altar, a rack of votive
// candles, the font, the board of the five children's names (the mockups) and
// the Founder's board (the game), the crypt's memorial plaques, the carving
// over them, the niche and the slab that closes it, St. Agnes' stone heart
// (the fourth piece), and St. Agnes as you give her back her pieces. Origin on
// the floor, front facing +z (a wall piece: its back on the wall line).
// Words in the game's language come from i18n, as on the gravestones.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';
import { i18n } from '../i18n/index.js';
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

// A memorial plaque in the crypt wall: one child's name cut into stone, and
// "age" carves the age line ("AGED 9" / "9 ΕΤΩΝ"); "set": pushed home into
// the wall (puzzles/plaques.js pushes the placed plaque itself). The name is
// cut first name over surname in big letters on a coarse texture, as on the
// gravestones, so it can be read from a step away at the game's resolution.
function memorialPlaque(t, { name = 'AGNES', age, set = false } = {}) {
  const words = canvasTexture(64, 42, (g, w, h) => {
    g.fillStyle = '#9a968c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2622';
    g.textAlign = 'center';
    g.font = 'bold 11px serif';
    const parts = name.split(' ').slice(0, 2);
    parts.forEach((part, i) => g.fillText(part, w / 2, (parts.length > 1 || age ? 12 : 25) + i * 12, w - 4));
    if (!age) return;
    g.font = 'bold 9px serif';
    g.fillText(i18n.t('grave.aged', { n: age }), w / 2, parts.length > 1 ? 37 : 26, w - 4);
  });
  return group(
    box(t.stone, [0.5, 0.34, 0.06], [0, 1.15, set ? 0.0 : 0.03], { color: '#8e8a80', flatShading: true }),
    decal(words, [0.46, 0.3], [0, 1.32, set ? 0.031 : 0.061]),
  );
}

// Carved in a band of stone over the plaques: THOSE WHO HAVE LEFT US.
function cryptCarving(t, { width = 4.2 } = {}) {
  const words = canvasTexture(256, 16, (g, w, h) => {
    g.fillStyle = '#8a867c';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2622';
    g.font = 'bold 11px serif';
    g.textAlign = 'center';
    g.fillText(i18n.t('crypt.carving'), w / 2, 12);
  });
  return group(
    box(t.stone, [width, 0.2, 0.05], [0, 1.62, 0.025], STONE),
    decal(words, [width - 0.1, 0.16], [0, 1.72, 0.052]),
  );
}

// A slab of stone across the niche, until the plaques open it.
function nicheSlab(t) {
  // In a group: placing a prop sets its own position, which would put a bare slab on the floor.
  return group(box(t.stone, [0.6, 0.56, 0.05], [0, 1.03, 0.34], { color: '#7c786e', flatShading: true }));
}

// The Founder's board in the chapel: what it was given for and by whom, the
// name scratched out (chapel.board.1–4; each line squeezed to fit).
function benefactorsBoard(t) {
  const lines = [1, 2, 3, 4].map((n) => i18n.t(`chapel.board.${n}`));
  const words = canvasTexture(96, 128, (g, w, h) => {
    g.fillStyle = '#2e2018';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8dcb0';
    g.textAlign = 'center';
    g.font = 'bold 8px serif';
    lines.forEach((line, i) => g.fillText(line, w / 2, 20 + i * 15 + (i === 3 ? 6 : 0), w - 10));
    g.strokeStyle = '#7a6a4a'; // the name, scratched out
    g.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      g.beginPath();
      g.moveTo(14 + i * 5, 84 + (i % 3) * 3);
      g.lineTo(26 + i * 4, 96 - (i % 2) * 4);
      g.stroke();
    }
  });
  return group(
    box(t.wood, [0.66, 0.86, 0.04], [0, 1.1, 0.02], { color: '#2e2018' }),
    decal(words, [0.6, 0.8], [0, 1.53, 0.045]),
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

// St. Agnes as you give her back her pieces (0.5 part A): "hand" (her wrist
// and the back of her hand, wing 1's piece), "palm" (her open palm, fingers
// and thumb on it, wing 3's), "lamb" (wing 2's, in the crook of her left
// arm), "heart" (the crypt's, in the hollow carved in her breast, a faint
// warmth in it). The hollow is there from the start. All four: whole.
function statueRebuilt(t, { hand = false, palm = false, lamb = false, heart = false } = {}) {
  const her = SCHOOL_PROPS.statue(t);
  her.children.at(-1).visible = !hand; // the fresh break at the right wrist
  const stone = materialFor(t.stone, STONE);
  const handGroup = new THREE.Group();
  const part = (size, at, tilt = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size), stone);
    m.position.set(...at);
    m.rotation.z = tilt;
    handGroup.add(m);
  };
  if (hand) {
    part([0.05, 0.05, 0.05], [0, -0.02, -0.02]); // the wrist, joined where it broke
    part([0.06, 0.05, 0.03], [0, 0.03, -0.004]); // the back of her hand
  }
  if (palm) {
    part([0.06, 0.07, 0.03], [0, 0.085, 0]); // the palm, open, towards you
    [-0.02, -0.007, 0.007, 0.02].forEach((x, i) => part([0.011, 0.06 - Math.abs(i - 1.5) * 0.008, 0.012], [x, 0.14, 0]));
    part([0.012, 0.045, 0.012], [0.04, 0.07, 0], -0.7); // the thumb
  }
  handGroup.scale.setScalar(1.5); // owner 2026-11-17: the hand and the lamb should read at a glance
  handGroup.position.set(0.12, 1.3, 0.33);
  const parts = [her, handGroup];
  if (lamb) {
    const stoneLamb = CEMETERY_PROPS.stoneLamb(t); // the size it was cut to fill her arm
    stoneLamb.scale.multiplyScalar(1.25);
    stoneLamb.rotation.y = -0.2;
    stoneLamb.position.set(-0.14, 1.16, 0.3);
    parts.push(stoneLamb);
  }
  const hollow = new THREE.Mesh(new THREE.CircleGeometry(0.085, 10), materialFor(t.stone, { color: '#2e2c28' }));
  hollow.scale.y = 1.15;
  hollow.position.set(0, 1.56, 0.245);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.012, 4, 12), stone);
  rim.scale.y = 1.15;
  rim.position.set(0, 1.56, 0.247);
  parts.push(hollow, rim);
  if (heart) {
    const stoneHeartPiece = stoneHeart(t);
    stoneHeartPiece.scale.setScalar(1.25);
    stoneHeartPiece.position.set(0, 1.505, 0.255);
    const warmth = new THREE.PointLight('#ffcc90', 0.35, 0.6, 1.5);
    warmth.position.set(0, 1.56, 0.4);
    parts.push(stoneHeartPiece, warmth);
  }
  return group(...parts);
}

// St. Agnes made whole (approved still statue_whole).
function statueWhole(t) {
  return statueRebuilt(t, { hand: true, palm: true, lamb: true, heart: true });
}

export const CHAPEL_PROPS = {
  pew, altar, votiveRack, font, nameBoard, benefactorsBoard, memorialPlaque, cryptCarving, nicheSlab, stoneHeart, cryptNiche, statueRebuilt, statueWhole,
};
export { CHILDREN };
