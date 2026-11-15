// Hiding under a ward bed (0.4, approved still hide_bed): use a bed to slide
// under it. From there you see the floor of the room at lamp-flex height,
// your light is off, and Sister M. can neither see nor touch you. The use key
// brings you out again where you stood.
// Level data: { "type": "wardBed", "use": "hide", ... }
import * as THREE from 'three';

const EYE = 0.2; // metres above the floor
const TURN = 0.9; // radians you can look to either side from under there
const SLIDE = 0.25; // seconds to slide under or out

export function createHiding(game) {
  let bed = null; // { x, z, yaw }
  let t = 0;
  let look = 0;

  function enter(prop) {
    if (bed) return;
    const size = game.world.level.cellSize;
    const centre = { x: prop.at[0] * size, z: prop.at[1] * size };
    const p = game.player.state.position;
    // Looking out the side you came from: across the bed, towards where you stood.
    const turn = ((prop.rotation ?? 0) * Math.PI) / 180;
    const side = { x: Math.cos(turn), z: -Math.sin(turn) }; // the bed's own x axis
    const sign = Math.sign((p.x - centre.x) * side.x + (p.z - centre.z) * side.z) || 1;
    bed = { ...centre, yaw: Math.atan2(-sign * side.x, -sign * side.z) };
    t = 0;
    look = 0;
    if (game.world.flashlight.isOn()) {
      game.world.flashlight.setOn(false);
      game.events.emit('flashlight.toggled', false);
    }
    game.interaction.clear();
    game.events.emit('hide.entered', prop);
  }

  function leave() {
    bed = null;
    game.events.emit('hide.left');
  }

  function update(dt, input) {
    if (!bed) return;
    t += dt;
    look = Math.max(-TURN, Math.min(TURN, look - input.takeLook().x * 0.002)); // the mouse turns your head a little
    if (t > SLIDE && (input.wasPressed('use') || input.wasPressed('crouch'))) {
      input.consume(game.settings.get('keys').use); // or the same press would slide you straight back under
      leave();
    }
  }

  // After the player camera: down on the floor under the bed, looking out.
  function applyCamera(camera) {
    if (!bed) return;
    const k = Math.min(1, t / SLIDE);
    camera.position.lerp(new THREE.Vector3(bed.x, EYE, bed.z), k);
    camera.rotation.set(0.06 * k, bed.yaw + look, 0.07 * k, 'YXZ');
  }

  game.events.on('level.loaded', () => (bed = null));
  game.events.on('collapse.started', () => (bed = null));

  return {
    enter,
    update,
    applyCamera,
    active: () => bed !== null,
    // What the HUD shows while you are under there (ui/hud.js).
    way: { prompt: () => ({ key: 'prompt.comeOut' }) },
  };
}
