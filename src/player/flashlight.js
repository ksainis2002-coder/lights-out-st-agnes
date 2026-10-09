// Flashlight: a spot light carried by the camera. F toggles it.
// Close to a wall or the floor a fixed-power light washes everything to
// white, so the beam dims as the nearest surface in front gets close.
import * as THREE from 'three';

const POWER = 24;
const FULL_POWER_DISTANCE = 2.2; // metres; nearer than this the beam dims
const MIN_POWER = 0.03;
const STEP = 0.05;

// Distance along the view to the first wall cell, floor or ceiling (max 4 m).
function surfaceDistance(level, camera, dir) {
  const p = camera.position;
  let limit = 4;
  if (dir.y < -0.01) limit = Math.min(limit, p.y / -dir.y);
  if (dir.y > 0.01) limit = Math.min(limit, (level.wallHeight - p.y) / dir.y);
  for (let d = STEP; d < limit; d += STEP) {
    const cell = level.worldToCell(p.x + dir.x * d, p.z + dir.z * d);
    if (level.isSolid(cell.col, cell.row)) return d;
  }
  return limit;
}

export function createFlashlight(camera) {
  const light = new THREE.SpotLight(0xfff1d6, POWER, 18, 0.62, 0.65, 1.2);
  light.position.set(0.12, -0.12, 0);
  light.target.position.set(0, -0.3, -1);
  camera.add(light, light.target);
  const dir = new THREE.Vector3();
  let on = true;
  let scale = 1;

  function update(level, dt) {
    if (!on || !level) return;
    camera.getWorldDirection(dir);
    const d = surfaceDistance(level, camera, dir);
    const wanted = Math.max(MIN_POWER, Math.min(1, (d / FULL_POWER_DISTANCE) ** 2.2));
    scale += (wanted - scale) * Math.min(1, dt * 10);
    light.intensity = POWER * scale;
  }

  return {
    light,
    update,
    isOn: () => on,
    toggle() {
      on = !on;
      light.visible = on;
    },
  };
}
