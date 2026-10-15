// Props for the school wing (0.3): classroom furniture, the watcher statue
// and Maggie. Same conventions as catalog.js: origin on the floor, front facing +z.
import * as THREE from 'three';
import { box, decal, materialFor, canvasTexture } from './parts.js';
import { i18n } from '../i18n/index.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

function mesh(geometry, texture, options) {
  return new THREE.Mesh(geometry, materialFor(texture, options));
}

// Chalk lines on a blackboard. Lines are given by the level or i18n (in-game).
export function blackboardTexture(lines = []) {
  return canvasTexture(256, 120, (g, w, h) => {
    g.fillStyle = '#1f2a24';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(220,220,210,0.06)'; // old wiped chalk
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.ellipse((i * 53) % w, (i * 31) % h, 34, 9, 0.2, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#d8d8cc';
    // Smaller chalk when the board is full or a line is long (Greek runs longer).
    let size = Math.min(15, Math.floor((h - 8) / Math.max(1, lines.length) / 1.25));
    g.font = `bold ${size}px serif`;
    const widest = () => Math.max(0, ...lines.map((line) => g.measureText(line).width));
    while (size > 8 && widest() > w - 16) {
      size -= 0.5;
      g.font = `bold ${size}px serif`;
    }
    lines.forEach((line, i) => g.fillText(line, 10, size + 7 + i * size * 1.27));
  });
}

// Lifts a desk's lid on its hinge along the back edge. In the game, lifting
// Maggie's lid calls this on her desk's "lid" mesh.
export function liftLid(lid) {
  lid.geometry.translate(0, 0, 0.21);
  lid.position.set(0, 0.74, -0.26);
  lid.rotation.x = -1.2;
}

// Pupil's desk with a lift-up lid and a bench seat, 0.6 m wide.
function schoolDesk(t, { lidOpen = false } = {}) {
  const lid = box(t.paintedWood, [0.6, 0.03, 0.42], [0, 0, 0], { color: '#8a6a48' });
  lid.name = 'lid';
  lid.position.set(0, 0.74, -0.05);
  if (lidOpen) liftLid(lid);
  const legs = [[-0.27, -0.23], [0.27, -0.23], [-0.27, 0.4], [0.27, 0.4]].map(([x, z]) => box(t.iron, [0.03, 0.72, 0.03], [x, 0, z]));
  return group(
    ...legs,
    box(t.paintedWood, [0.58, 0.16, 0.4], [0, 0.56, -0.05], { color: '#6a4a30' }),
    lid,
    box(t.paintedWood, [0.58, 0.03, 0.22], [0, 0.42, 0.36], { color: '#7a5a3a' }),
  );
}

// Blackboard on a wall (back to the wall), with a chalk ledge. In the game
// its chalk comes from i18n ("lineKeys"); mockups pass "lines" as text.
function blackboard(t, { lines = [], lineKeys } = {}) {
  const chalk = lineKeys ? lineKeys.map((key) => i18n.t(key)) : lines;
  return group(
    box(t.paintedWood, [2.5, 1.3, 0.04], [0, 0.85, 0], { color: '#5a3e28' }),
    decal(blackboardTexture(chalk), [2.36, 1.16], [0, 1.5, 0.045]),
    box(t.paintedWood, [2.5, 0.04, 0.09], [0, 0.85, 0.05], { color: '#5a3e28' }),
    box(t.sheet, [0.08, 0.02, 0.02], [0.7, 0.89, 0.06]),
  );
}

// The watcher: St. Agnes in stone on a plinth, hooded, head bowed, arms
// bent towards her chest. Her right hand is missing at the wrist (the statue
// piece from wing 1), so only the left hand is raised, with a pale break.
function statue(t, { headTurn = 0 } = {}) {
  const stone = { color: '#74716a', flatShading: true };
  const shade = { color: '#55534d', flatShading: true };
  const lathe = (points, segments, options) => mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments), t.stone, options);
  // Robe from hem to neck: wide hem, narrow waist, sloping shoulders.
  const robe = lathe([[0, 0], [0.36, 0], [0.33, 0.25], [0.26, 0.75], [0.21, 1.0], [0.25, 1.22], [0.25, 1.3], [0.14, 1.4], [0.07, 1.44], [0, 1.44]], 9, stone);
  robe.position.y = 0.5;
  const head = mesh(new THREE.SphereGeometry(0.105, 8, 6), t.stone, stone);
  head.scale.set(0.9, 1.15, 1);
  // Hood: a shell over the head, open at the face, falling onto the shoulders.
  const hood = mesh(new THREE.SphereGeometry(0.15, 9, 6, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.62), t.stone, { ...shade, side: THREE.DoubleSide });
  hood.scale.set(1, 1.5, 1);
  hood.position.y = 0.02;
  const face = decal(statueFaceTexture(), [0.17, 0.2], [0, 0.0, 0.098], { transparent: true });
  const headGroup = group(head, hood, face);
  headGroup.position.set(0, 2.06, 0.02);
  headGroup.rotation.set(0.3, headTurn, 0); // bowed, looking down at you
  // Upper arms hang at the sides; forearms bend forward and in.
  const arm = (side) => {
    const upper = box(t.stone, [0.09, 0.36, 0.09], [0, -0.36, 0], shade);
    const upperPivot = group(upper);
    upperPivot.position.set(side * 0.24, 1.78, 0.02);
    upperPivot.rotation.z = side * 0.12;
    const fore = box(t.stone, [0.08, 0.3, 0.08], [0, -0.3, 0], stone);
    const forePivot = group(fore);
    forePivot.position.set(side * 0.27, 1.44, 0.04);
    forePivot.rotation.set(-1.35, -side * 0.55, 0, 'YXZ'); // forward, then in towards the chest
    return group(upperPivot, forePivot);
  };
  return group(
    box(t.stone, [0.9, 0.12, 0.9], [0, 0, 0], { color: '#55534e' }),
    box(t.stone, [0.74, 0.38, 0.74], [0, 0.12, 0], { color: '#68665f' }),
    robe, headGroup, arm(1), arm(-1),
    box(t.stone, [0.06, 0.13, 0.04], [-0.11, 1.33, 0.31], stone), // left hand, raised
    box(t.stone, [0.06, 0.06, 0.012], [0.11, 1.34, 0.31], { color: '#d6d2c6' }), // fresh break at the right wrist
  );
}

// Hollow eyes with rain streaks under them, a nose shadow and a closed mouth.
function statueFaceTexture() {
  return canvasTexture(16, 20, (g) => {
    g.clearRect(0, 0, 16, 20);
    g.fillStyle = 'rgba(20,20,18,0.9)';
    g.fillRect(3, 8, 3, 2);
    g.fillRect(10, 8, 3, 2);
    g.fillStyle = 'rgba(20,20,18,0.45)';
    g.fillRect(4, 10, 1, 6);
    g.fillRect(11, 10, 1, 5);
    g.fillRect(7, 11, 2, 2);
    g.fillStyle = 'rgba(20,20,18,0.7)';
    g.fillRect(6, 15, 4, 1);
  });
}

// Maggie: a ghost girl mid-skip, plaits, the rope a pale arc over her head.
function ghostGirl(t, { opacity = 0.6 } = {}) {
  const ghost = { unlit: true, color: 0xd8e4ec, transparent: true, opacity, depthWrite: false, fog: false };
  const dress = mesh(new THREE.CylinderGeometry(0.12, 0.3, 0.7, 7), t.sheet, ghost);
  dress.position.y = 0.6;
  const legs = [-0.07, 0.07].map((x) => box(t.sheet, [0.05, 0.28, 0.05], [x, 0.0, 0], ghost));
  const head = mesh(new THREE.SphereGeometry(0.11, 7, 5), t.sheet, ghost);
  head.position.y = 1.08;
  const plaits = [-0.11, 0.11].map((x) => box(t.sheet, [0.035, 0.24, 0.035], [x, 0.84, -0.03], ghost));
  const arm = (x) => {
    const a = box(t.sheet, [0.04, 0.3, 0.04], [x, 0.66, 0], ghost);
    a.rotation.z = x > 0 ? 0.7 : -0.7;
    return a;
  };
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.36, 0.72, 0.05), new THREE.Vector3(0, 2.3, -0.1), new THREE.Vector3(0.36, 0.72, 0.05));
  const rope = mesh(new THREE.TubeGeometry(curve, 14, 0.012, 4), t.sheet, { ...ghost, opacity: opacity * 0.8 });
  const girl = group(dress, ...legs, head, ...plaits, arm(-0.2), arm(0.2), rope);
  girl.position.y = 0.14; // mid-jump
  return group(girl);
}

// Maggie's skipping rope lying on the floor (the wing's toy): a loose loop
// between two red wooden handles.
function skippingRope(t) {
  const rope = mesh(new THREE.TorusGeometry(0.2, 0.013, 4, 16), t.sheet, { color: '#e0d4b0' });
  rope.rotation.x = Math.PI / 2;
  rope.scale.set(1, 0.7, 1);
  rope.position.y = 0.013;
  const handle = (x, z, turn) => {
    const h = box(t.paintedWood, [0.034, 0.034, 0.13], [0, 0, 0], { color: '#c03a2c' });
    h.position.set(x, 0, z);
    h.rotation.y = turn;
    return h;
  };
  return group(rope, handle(-0.22, 0.08, 0.5), handle(0.21, 0.1, -0.4));
}

// A brass key with a paper tag tied to its bow (the headmaster's key), lying
// flat. Drawn half as big again as a real one, so it reads at 320×180.
function brassKey(t, { color = '#e0c068' } = {}) {
  const brass = { color };
  const bow = mesh(new THREE.TorusGeometry(0.025, 0.008, 4, 10), t.sheet, brass);
  bow.rotation.x = Math.PI / 2;
  bow.position.set(-0.07, 0.008, 0);
  const key = group(
    bow,
    box(t.sheet, [0.1, 0.012, 0.012], [0, 0.002, 0], brass), // the shaft
    box(t.sheet, [0.012, 0.012, 0.03], [0.044, 0.002, 0.012], brass), // the bit
    box(t.sheet, [0.012, 0.012, 0.02], [0.026, 0.002, 0.008], brass),
    box(t.sheet, [0.05, 0.004, 0.035], [-0.12, 0.001, 0.02], { color: '#f0e8d0' }), // the tag
  );
  key.scale.setScalar(1.5);
  return group(key);
}

// A closed ledger (the detention book): cloth cover, cream page edges.
function ledger(t, { color = '#5a2a24' } = {}) {
  return group(
    box(t.paintedWood, [0.2, 0.012, 0.28], [0, 0, 0], { color }),
    box(t.sheet, [0.19, 0.022, 0.27], [0.004, 0.012, 0], { color: '#d8ccb0' }),
    box(t.paintedWood, [0.2, 0.012, 0.28], [0, 0.034, 0], { color }),
  );
}

export const SCHOOL_PROPS = { schoolDesk, blackboard, statue, ghostGirl, skippingRope, brassKey, ledger };
