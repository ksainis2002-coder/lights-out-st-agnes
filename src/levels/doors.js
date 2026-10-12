// Door panels for a level's door cells. A panel spans the doorway and swings
// 90° on a hinge; while closed its cell blocks movement (level.isSolid).
// A lintel fills the wall above the 2.1 m opening.
import * as THREE from 'three';
import { box } from '../props/parts.js';

const DOOR_HEIGHT = 2.1;
const SWING_SPEED = 3; // radians per second

// The panel spans x when the walls are left and right of the door cell.
function spansX(level, [col, row]) {
  return level.isWall(col - 1, row) && level.isWall(col + 1, row);
}

function buildDoor(level, door, textures) {
  const s = level.cellSize;
  const center = level.cellCenter(...door.cell);
  const alongX = spansX(level, door.cell);
  const holder = new THREE.Group();
  holder.position.set(center.x, 0, center.z);
  holder.rotation.y = alongX ? 0 : Math.PI / 2;

  const lintelHeight = level.wallHeight - DOOR_HEIGHT;
  const wallTexture = textures[level.kindAt(...(alongX ? [door.cell[0] - 1, door.cell[1]] : [door.cell[0], door.cell[1] - 1]))];
  const lintel = box(wallTexture ?? textures.plaster, [s, lintelHeight, s], [0, DOOR_HEIGHT, 0]);

  // Hidden doors look like the wall around them until they open.
  const panelTexture = door.hidden ? wallTexture : textures.door;
  const hinge = new THREE.Group();
  hinge.position.set(-s / 2, 0, 0);
  hinge.add(box(panelTexture, [s, DOOR_HEIGHT, 0.06], [s / 2, 0, 0]));
  holder.add(lintel, hinge);
  return { door, holder, hinge };
}

export function createDoors(level, textures) {
  const group = new THREE.Group();
  group.name = 'doors';
  const panels = level.doors.map((door) => buildDoor(level, door, textures));
  panels.forEach((panel) => group.add(panel.holder));

  function update(dt) {
    for (const { door, hinge } of panels) {
      const target = door.open ? -Math.PI / 2 : 0;
      const step = SWING_SPEED * dt;
      door.angle += Math.max(-step, Math.min(step, target - door.angle));
      hinge.rotation.y = door.angle;
    }
  }

  return { group, panels, update };
}
