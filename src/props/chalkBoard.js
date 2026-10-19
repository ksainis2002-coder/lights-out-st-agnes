// A small wall blackboard for Maggie's chalk (approved stills chalk_hint and
// chalk_taunt): wiped clean, until ghosts/chalk.js writes on it in fresh,
// scrawled capitals with chalk dust on the ledge. Back to the wall, front +z.
// Two props at the same spot: "chalkBoardFrame" (wood and a stub of chalk,
// merged with the other furniture) and "chalkBoard" (the slate, which has an
// id so its words can change).
import * as THREE from 'three';
import { box, decal, canvasTexture } from './parts.js';

const WIDTH = 256;
const HEIGHT = 160;
const MARGIN = 12; // pixels left of the first line; each line starts a little further in
const INDENT = 8;
const SIZES = [30, 28, 26, 24, 22, 20, 18, 16]; // pixels: the biggest chalk that fits

// Letters are spaced by hand, a little unevenly, as in the stills.
function lineWidth(g, line) {
  return [...line].reduce((sum, letter) => sum + g.measureText(letter).width * 0.98 + 1, 0);
}

// Words wrapped into lines at the biggest size that fits the board.
function layout(g, text) {
  const words = text.split(/\s+/).filter(Boolean);
  for (const size of SIZES) {
    g.font = `bold ${size}px sans-serif`;
    const room = (row) => WIDTH - MARGIN - row * INDENT - 8;
    const lines = [];
    for (const word of words) {
      const last = lines.length - 1;
      const joined = last >= 0 ? `${lines[last]} ${word}` : word;
      if (last >= 0 && lineWidth(g, joined) <= room(last)) lines[last] = joined;
      else lines.push(word);
    }
    const lineHeight = size * 1.5;
    const fits = lines.every((line, row) => lineWidth(g, line) <= room(row));
    if (fits && lines.length * lineHeight <= HEIGHT - 24) return { size, lines, lineHeight };
  }
  return { size: SIZES[SIZES.length - 1], lines: words, lineHeight: 24 };
}

function drawWiped(g) {
  g.fillStyle = '#1f2a24';
  g.fillRect(0, 0, WIDTH, HEIGHT);
  g.fillStyle = 'rgba(220,220,210,0.07)'; // old wiped chalk
  [[50, 36], [190, 110], [120, 90]].forEach(([x, y]) => {
    g.beginPath();
    g.ellipse(x, y, 40, 10, 0.25, 0, Math.PI * 2);
    g.fill();
  });
}

function drawWords(g, text) {
  const { size, lines, lineHeight } = layout(g, text);
  const top = (HEIGHT - 12 - lines.length * lineHeight) / 2 + size;
  g.textBaseline = 'alphabetic';
  lines.forEach((line, row) => {
    let x = MARGIN + row * INDENT;
    [...line].forEach((letter, i) => {
      g.save();
      g.translate(x, top + row * lineHeight + Math.sin(i * 2.3) * 2);
      g.rotate(Math.sin(i * 1.7 + row) * 0.12);
      g.fillStyle = 'rgba(240,240,232,0.95)';
      g.fillText(letter, 0, 0);
      g.fillStyle = 'rgba(240,240,232,0.25)'; // a second, rougher stroke
      g.fillText(letter, 0.8, 0.8);
      g.restore();
      x += g.measureText(letter).width * 0.98 + 1;
    });
  });
  g.fillStyle = 'rgba(230,230,220,0.45)'; // fresh dust on the ledge
  for (let i = 0; i < 50; i++) g.fillRect(20 + ((i * 37) % 210), HEIGHT - 7 + (i % 3), 2, 1);
}

function drawBoard(g, text) {
  drawWiped(g);
  if (text) drawWords(g, text);
}

// Writes the text (already in the player's language) on a placed board, or
// wipes it with ''.
export function writeOnBoard(board, text) {
  const face = board.getObjectByName('chalk');
  const texture = face.userData.texture;
  drawBoard(texture.image.getContext('2d'), text);
  texture.needsUpdate = true;
  face.userData.text = text;
}

// The slate, in front of its frame. Mockups pass "text" to show it written.
function chalkBoard(t, { text = '' } = {}) {
  const texture = canvasTexture(WIDTH, HEIGHT, (g) => drawBoard(g, text));
  const face = decal(texture, [1.6, 1.0], [0, 1.5, 0.045]);
  face.name = 'chalk';
  face.userData.texture = texture;
  face.userData.text = text;
  return new THREE.Group().add(face);
}

// The wooden frame and ledge with a stub of chalk (as on the classroom boards).
function chalkBoardFrame(t) {
  const wood = { color: '#5a3e28' };
  return new THREE.Group().add(
    box(t.paintedWood, [1.7, 1.12, 0.04], [0, 0.94, 0], wood),
    box(t.paintedWood, [1.7, 0.04, 0.08], [0, 0.92, 0.04], wood),
    box(t.sheet, [0.07, 0.018, 0.018], [0.5, 0.96, 0.06]),
  );
}

export const CHALK_PROPS = { chalkBoard, chalkBoardFrame };
