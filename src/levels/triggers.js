// Tracks which trigger volumes the player is inside. Systems that react to
// triggers (scares, music, autosave) subscribe with onEnter later.
import { insideBox } from './loader.js';

export function createTriggers(startLevel) {
  let level = startLevel;
  const active = new Set();
  const listeners = new Set();

  function update(point) {
    for (const trigger of level.triggers) {
      const inside = insideBox(trigger.box, point);
      if (inside && !active.has(trigger.id)) {
        active.add(trigger.id);
        listeners.forEach((fn) => fn(trigger.id));
      } else if (!inside) {
        active.delete(trigger.id);
      }
    }
  }

  function setLevel(next) {
    level = next;
    active.clear();
  }

  return { update, active, setLevel, onEnter: (fn) => listeners.add(fn) };
}
