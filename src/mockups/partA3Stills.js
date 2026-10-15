// Proposal stills for the rest of part A (design 0.3: Maggie the trickster),
// for owner approval before they are built:
//   chalk_hint / chalk_taunt — fresh chalk on a small board in the corridor,
//   scrawled in capitals: a hint when you are stuck, now and then a taunt.
//   class1_turned — back in Classroom 1, every desk has been turned to face you.
// Built on the real school level. Text here is mockup copy (the content
// sheet's hint and taunt lines), not game text.
import * as THREE from 'three';
import { aim } from './helpers.js';
import { canvasTexture } from '../props/parts.js';
import school from '../levels/school_ground.json';

// A small wall blackboard with fresh, scrawled capitals and chalk dust under them.
function scrawledBoard(lines) {
  const texture = canvasTexture(256, 160, (g, w, h) => {
    g.fillStyle = '#1f2a24';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(220,220,210,0.07)'; // old wiped chalk
    [[50, 36], [190, 110], [120, 90]].forEach(([x, y]) => {
      g.beginPath();
      g.ellipse(x, y, 40, 10, 0.25, 0, Math.PI * 2);
      g.fill();
    });
    g.font = 'bold 30px sans-serif';
    g.textBaseline = 'alphabetic';
    lines.forEach((line, row) => {
      let x = 12 + row * 8;
      [...line].forEach((letter, i) => {
        const wobble = Math.sin(i * 1.7 + row) * 0.12;
        g.save();
        g.translate(x, 58 + row * 46 + Math.sin(i * 2.3) * 2);
        g.rotate(wobble);
        g.fillStyle = 'rgba(240,240,232,0.95)';
        g.fillText(letter, 0, 0);
        g.fillStyle = 'rgba(240,240,232,0.25)'; // a second, rougher stroke
        g.fillText(letter, 0.8, 0.8);
        g.restore();
        x += g.measureText(letter).width * 0.98 + 1;
      });
    });
    g.fillStyle = 'rgba(230,230,220,0.45)'; // fresh dust on the ledge
    for (let i = 0; i < 50; i++) g.fillRect(20 + ((i * 37) % 210), h - 7 + (i % 3), 2, 1);
  });
  const wood = new THREE.MeshLambertMaterial({ color: '#5a3e28' });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.12, 0.04), wood);
  frame.position.y = 1.5;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ map: texture, color: '#9aa29c' }));
  face.position.set(0, 1.5, 0.025);
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 0.08), wood);
  ledge.position.set(0, 0.94, 0.04);
  const chalk = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.018, 0.018), new THREE.MeshBasicMaterial({ color: '#e8e8dc' }));
  chalk.position.set(0.5, 0.97, 0.06);
  const board = new THREE.Group();
  board.add(frame, face, ledge, chalk);
  return board;
}

// On the corridor's north wall between the library and gym doors, facing you.
function boardInCorridor(lines) {
  return ({ world }) => {
    const board = scrawledBoard(lines);
    board.position.set(12.0 * 1.2, 0, 10.0 * 1.2 + 0.02);
    world.scene.add(board);
    aim(world.camera, [11.4 * 1.2, 1.6, 11.7 * 1.2], -18, -1);
  };
}

// Classroom 1 with every desk turned to face the door, where you stand.
const DOOR = [12.5, 12.4];
const inClass1 = ([x, z]) => x >= 9 && x <= 17 && z >= 13 && z <= 19;
const turned = {
  ...school,
  id: 'class1_turned_mockup',
  ghosts: [],
  props: school.props.map((prop) => {
    if (prop.type !== 'schoolDesk' || !inClass1(prop.at)) return prop;
    const [dx, dz] = [DOOR[0] - prop.at[0], DOOR[1] - prop.at[1]];
    const facing = (Math.atan2(-dx, -dz) * 180) / Math.PI;
    return { ...prop, id: undefined, use: undefined, rotation: Math.round(facing) };
  }),
};

export const PART_A3_STILLS = {
  chalk_hint: { level: school, setup: boardInCorridor(['THE NUMBER IS', 'ON THE CARD']) },
  chalk_taunt: { level: school, setup: boardInCorridor(["SHE'S BEHIND", 'YOU']) },
  class1_turned: { level: turned, setup: ({ world }) => aim(world.camera, [12.5 * 1.2, 1.6, 13.3 * 1.2], 180, -14) },
};
