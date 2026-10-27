// A door home (proposal stills, part C): the patient room's own door, set
// into a school wall with a ragged patch of its pale green tiles round it, as
// if the room had pushed through. And the green crayon house of the map's
// safe places, drawn on a door (the other proposal: safe rooms in the school).
// Wall props: origin on the wall line at the floor, facing +z.
import * as THREE from 'three';
import { box, decal, canvasTexture } from './parts.js';

function group(...children) {
  const g = new THREE.Group();
  g.add(...children);
  return g;
}

const PATCH = { w: 1.9, h: 2.75 };
const TILE_PX = 10;

// Pale green tiles in their grout, the edge bitten away unevenly.
function tilePatchTexture() {
  return canvasTexture(96, 140, (g, w, h) => {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    g.clearRect(0, 0, w, h);
    for (let y = 0; y < h; y += TILE_PX) {
      const inset = 2 + Math.floor(random() * 3);
      for (let x = 0; x < w; x += TILE_PX) {
        const column = x / TILE_PX;
        const edge = column < inset - 2 || column > w / TILE_PX - inset + 1 || (y < TILE_PX * 2 && random() < 0.5);
        if (edge && random() < 0.7) continue;
        g.fillStyle = '#5e6e64';
        g.fillRect(x, y, TILE_PX, TILE_PX);
        g.fillStyle = random() < 0.5 ? '#9cb4a4' : '#93ac9b';
        g.fillRect(x + 1, y + 1, TILE_PX - 1, TILE_PX - 1);
      }
    }
  });
}

function hubDoorway(t) {
  const trim = { color: '#4e5c54' };
  return group(
    decal(tilePatchTexture(), [PATCH.w, PATCH.h], [0, PATCH.h / 2, 0.01], { transparent: true }),
    box(t.door, [0.92, 2.04, 0.05], [0, 0, 0.04]),
    box(t.paintedWood, [0.08, 2.12, 0.1], [-0.5, 0, 0.03], trim),
    box(t.paintedWood, [0.08, 2.12, 0.1], [0.5, 0, 0.03], trim),
    box(t.paintedWood, [1.08, 0.08, 0.1], [0, 2.08, 0.03], trim),
    box(t.sheet, [0.06, 0.06, 0.03], [0.34, 1.0, 0.09], { color: '#a89a6a' }), // the knob
  );
}

// The map's safe-place mark (ui/mapMarks.js), a little house in green
// crayon, drawn on a door at a child's height: two waxy passes, the second
// a pixel off and fainter.
function crayonHouse() {
  const texture = canvasTexture(24, 24, (g) => {
    g.clearRect(0, 0, 24, 24);
    [[0, 0, 0.9], [1, 1, 0.45]].forEach(([dx, dy, alpha]) => {
      g.strokeStyle = `rgba(58,122,58,${alpha})`;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(4 + dx, 20 + dy);
      g.lineTo(4 + dx, 10 + dy);
      g.lineTo(12 + dx, 3 + dy);
      g.lineTo(20 + dx, 10 + dy);
      g.lineTo(20 + dx, 20 + dy);
      g.closePath();
      g.stroke();
    });
  });
  return group(decal(texture, [0.3, 0.3], [0, 1.1, 0.035], { transparent: true }));
}

export const HUB_DOOR_PROPS = { hubDoorway, crayonHouse };
