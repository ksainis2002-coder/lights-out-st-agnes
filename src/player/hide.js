// Hiding under a ward bed (0.4, approved still hide_bed): use a bed to slide
// under it. From there you see the floor of the room at lamp-flex height,
// your light is off, and Sister M. can neither see nor touch you. The use key
// brings you out again where you stood.
// Or in a staff locker (0.5, approved stills locker, locker_inside): you
// stand inside, looking out of its door through three slits (ui/lockerHud.js),
// your light off; the first time, "He walks past what he cannot hear."
// Level data: { "type": "wardBed", "use": "hide", ... } or a "staffLocker".
import * as THREE from 'three';

const EYE = { bed: 0.2, locker: 1.62 }; // metres above the floor
const TURN = { bed: 0.9, locker: 0.3 }; // radians you can look to either side from in there
const FIRST_LOCKER = 'said_msg.lockerFirst';
const SLIDE = 0.25; // seconds to slide under or out

export function createHiding(game) {
  let bed = null; // { x, z, yaw }
  let t = 0;
  let look = 0;

  // The placed model of a prop (a locker has an id, so it is never merged).
  function modelOf(prop) {
    let found = null;
    game.world.levelGroup.traverse((object) => {
      if (object.userData.prop === prop) found = object;
    });
    return found;
  }

  // Inside a locker, looking out of its door (its front faces the prop's +z).
  // Its model is put away while you are in it: the slits on the HUD are its door.
  function inLocker(prop, centre, turn) {
    if (!game.progress.hasFlag(FIRST_LOCKER)) {
      game.progress.setFlag(FIRST_LOCKER);
      game.messages.show('msg.lockerFirst', null, 5);
    }
    const model = modelOf(prop);
    if (model) model.visible = false;
    return { ...centre, yaw: turn + Math.PI, kind: 'locker', model };
  }

  function enter(prop) {
    if (bed) return;
    const size = game.world.level.cellSize;
    const centre = { x: prop.at[0] * size, z: prop.at[1] * size };
    const p = game.player.state.position;
    const turn = ((prop.rotation ?? 0) * Math.PI) / 180;
    if (prop.type === 'staffLocker') bed = inLocker(prop, centre, turn);
    else {
      // Looking out the side you came from: across the bed, towards where you stood.
      const side = { x: Math.cos(turn), z: -Math.sin(turn) }; // the bed's own x axis
      const sign = Math.sign((p.x - centre.x) * side.x + (p.z - centre.z) * side.z) || 1;
      bed = { ...centre, yaw: Math.atan2(-sign * side.x, -sign * side.z), kind: 'bed' };
    }
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
    const kind = bed.kind;
    if (bed.model) bed.model.visible = true;
    bed = null;
    game.events.emit('hide.left', kind);
  }

  function update(dt, input) {
    if (!bed) return;
    t += dt;
    const turn = TURN[bed.kind];
    look = Math.max(-turn, Math.min(turn, look - input.takeLook().x * 0.002)); // the mouse turns your head a little
    if (t > SLIDE && (input.wasPressed('use') || input.wasPressed('crouch'))) {
      input.consume(game.settings.get('keys').use); // or the same press would slide you straight back under
      leave();
    }
  }

  // After the player camera: down on the floor under the bed, looking out.
  function applyCamera(camera) {
    if (!bed) return;
    const k = Math.min(1, t / SLIDE);
    const tilt = bed.kind === 'bed' ? k : 0; // on your side under a bed; upright in a locker
    camera.position.lerp(new THREE.Vector3(bed.x, EYE[bed.kind], bed.z), k);
    camera.rotation.set(0.06 * tilt, bed.yaw + look, 0.07 * tilt, 'YXZ');
  }

  game.events.on('level.loaded', () => (bed = null));
  game.events.on('collapse.started', () => (bed = null));

  return {
    enter,
    update,
    applyCamera,
    active: () => bed !== null,
    kind: () => bed?.kind ?? null, // 'bed' or 'locker'
    // What the HUD shows while you are under there (ui/hud.js).
    way: { prompt: () => ({ key: 'prompt.comeOut' }) },
  };
}
