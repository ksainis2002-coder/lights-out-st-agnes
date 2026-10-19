// The player's gaze, for the watcher (design 0.3, owner 2026-10-14): she is
// seen only when she is on screen, not behind a wall or a closed door, and
// lit — the flashlight's beam on her, a lamp near her, or within about 2 m.
// In the dark she counts as unseen; so does she where the fog hides her, and
// so do the player's blinks (sanity/blink.js).
import * as THREE from 'three';

const NEAR = 2; // metres: close enough to see her without a light
const BEAM_ANGLE = 0.55; // radians from the beam's centre (the spot light's cone is 0.62)
const BEAM_RANGE = 14; // metres
const LAMP_LIGHT = 0.35; // lamp light at her feet that counts as lit (as sanity/meter.js lightAt)
const STEP = 0.1; // metres between line-of-sight samples
const FOG_SEEN = 1.4; // fog density × distance beyond which the fog hides her (about 85%)

const frustum = new THREE.Frustum();
const matrix = new THREE.Matrix4();
const beamFrom = new THREE.Vector3();
const beam = new THREE.Vector3();
const toPoint = new THREE.Vector3();

// True when nothing solid (a wall cell or a closed door) stands between the
// eye and the point, looking down on the cell grid.
export function clearLine(level, from, to) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  for (let d = STEP; d < length - STEP; d += STEP) {
    const cell = level.worldToCell(from.x + (dx * d) / length, from.z + (dz * d) / length);
    if (level.isSolid(cell.col, cell.row)) return false;
  }
  return true;
}

// How lit she is by the level's lamps, as the sanity meter reckons it, but
// only from lamps with nothing solid between them and her (a lamp in the next
// room does not light her through the wall).
function lampLight(level, at) {
  let light = 0;
  for (const lamp of level.lights) {
    if (lamp.off) continue;
    const from = { x: lamp.at[0] * level.cellSize, z: lamp.at[1] * level.cellSize };
    const distance = Math.hypot(from.x - at.x, from.z - at.z);
    const reach = lamp.distance ?? 8;
    if (distance >= reach || !clearLine(level, from, at)) continue;
    light += (1 - distance / reach) * ((lamp.intensity ?? 3) / 3);
  }
  return light;
}

// Could the player see any of these points now: on screen, with nothing
// solid in between (light and fog aside)? Maggie writes and moves things
// only where you are not looking (ghosts/chalk.js, ghosts/tricks.js).
export function inView(game, points) {
  const camera = game.world.camera;
  matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(matrix);
  return points.some((point) => frustum.containsPoint(point) && clearLine(game.world.level, camera.position, point));
}

// Is the flashlight's beam on this point? The beam points a little below the view.
function inBeam(game, point) {
  const { flashlight } = game.world;
  if (!flashlight.isOn()) return false;
  flashlight.light.getWorldPosition(beamFrom);
  flashlight.light.target.getWorldPosition(beam).sub(beamFrom);
  toPoint.copy(point).sub(beamFrom);
  return toPoint.length() < BEAM_RANGE && toPoint.angleTo(beam) < BEAM_ANGLE;
}

// How the player sees the points (her head, chest and base): { seen, why }.
// "why" names what lit her ('near', 'torch', 'lamp') or why not ('blink',
// 'off screen', 'wall', 'dark').
export function gazeOn(game, points, base) {
  const camera = game.world.camera;
  if (game.blink?.closed()) return { seen: false, why: 'blink' };
  matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(matrix);
  const visible = points.filter((point) => frustum.containsPoint(point));
  if (!visible.length) return { seen: false, why: 'off screen' };
  const level = game.world.level;
  const fog = game.world.scene.fog?.density;
  if (fog && camera.position.distanceTo(base) > FOG_SEEN / fog) return { seen: false, why: 'fog' };
  if (!visible.some((point) => clearLine(level, camera.position, point))) return { seen: false, why: 'wall' };
  if (Math.hypot(camera.position.x - base.x, camera.position.z - base.z) < NEAR) return { seen: true, why: 'near' };
  if (visible.some((point) => inBeam(game, point))) return { seen: true, why: 'torch' };
  if (lampLight(level, base) >= LAMP_LIGHT) return { seen: true, why: 'lamp' };
  return { seen: false, why: 'dark' };
}
