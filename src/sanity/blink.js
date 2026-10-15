// Low sanity makes the eyes blink now and then (design 0.3: once the pulse
// says "shaking", below 50): the eyelids close for a moment, and the watcher
// can move in a blink (ai/gaze.js). Not a flash or a flicker: a short dark.

const SHUT = 0.22; // seconds the eyes stay shut
const GAP = [3.5, 7]; // seconds between blinks
const SHAKING = 50;

export function createBlink(game) {
  let wait = GAP[1];
  let shut = 0;

  function update(dt) {
    if (shut > 0) {
      shut = Math.max(0, shut - dt);
      return;
    }
    if (game.sanity.value() >= SHAKING) {
      wait = GAP[1];
      return;
    }
    wait -= dt;
    if (wait > 0) return;
    shut = SHUT;
    wait = GAP[0] + Math.random() * (GAP[1] - GAP[0]);
    game.events.emit('blink');
  }

  return {
    update,
    closed: () => shut > 0,
    now: () => (shut = SHUT), // tests
  };
}
