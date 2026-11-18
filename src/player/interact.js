// What the player is looking at and can use. Systems register interactables:
//   { position: Vector3, radius, prompt(): { key, params } | null, use() }
// onUse (optional) hears every use: the prompts' key shows while you learn it (ui/promptKey.js).
// Each frame the nearest one under the centre of the view, within reach,
// becomes the target; the use key (left click by default) calls use().
import * as THREE from 'three';

const REACH = 1.9;

export function createInteraction({ onUse = null } = {}) {
  const sources = new Set();
  const forward = new THREE.Vector3();
  const toTarget = new THREE.Vector3();
  let target = null;

  function find(camera) {
    camera.getWorldDirection(forward);
    let best = null;
    let bestDistance = Infinity;
    for (const source of sources) {
      for (const item of source()) {
        if (!item.prompt()) continue;
        toTarget.copy(item.position).sub(camera.position);
        const along = toTarget.dot(forward);
        if (along <= 0 || along > REACH + item.radius) continue;
        const offAxis = Math.sqrt(Math.max(0, toTarget.lengthSq() - along * along));
        if (offAxis <= item.radius && along < bestDistance) {
          best = item;
          bestDistance = along;
        }
      }
    }
    return best;
  }

  function update(camera, input) {
    target = find(camera);
    if (!target || !input.wasPressed('use')) return;
    target.use();
    onUse?.();
  }

  return {
    update,
    addSource: (source) => sources.add(source),
    target: () => target,
    clear: () => (target = null),
  };
}
