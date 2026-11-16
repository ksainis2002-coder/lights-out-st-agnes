// Nora's camcorder (0.4, approved still camcorder_night; owner picks
// 2026-11-15). Found upstairs in the west wing (flag tool_camcorder).
//   C  raises or lowers it: its display frames the view (ui/camcorderHud.js).
//   N  the night view, while it is raised: the picture turns green and the
//      dark can be seen, by a lens lamp that gives no light Sister M. sees.
//      Your flashlight goes off with it. Writing that only the night view
//      shows appears (props with userData.setShown).
//   Right mouse button  the flash, while it is raised: a burst of white that
//      stuns Sister M. for 5 s if she is in front of you within 9 m. It then
//      charges for 20 s.
// Its own battery (progress value camcorder_battery, 0–100; half gone when
// found) runs down while it is raised, faster in the night view; flat, it
// will not come up; a spare flashlight battery, used while it is raised (B),
// fills it. All three keys can be rebound.
import * as THREE from 'three';
import { clearLine } from '../ai/gaze.js';

const BATTERY = 'camcorder_battery';
const FOUND_WITH = 50;
const DRAIN = 100 / 900; // per second raised: a full battery lasts 15 minutes
const NIGHT_DRAIN = 1.6; // times that, in the night view
const FLASH_COST = 3;
const CHARGE = 20; // seconds between flashes
const STUN = 5;
const RANGE = 9;
const READ_WITHIN = 3.2; // metres: close enough to read writing on a wall
const BURST = 0.18; // seconds the flash lights the room (reduce effects / flicker off: a soft 0.6 s)

export function createCamcorder(game) {
  const lens = new THREE.PointLight(0xffffff, 0, 12, 1.1); // the night view's own lamp
  const burst = new THREE.PointLight(0xffffff, 0, 14, 0.8);
  game.world.camera.add(lens, burst);
  let raised = false;
  let night = false;
  let charge = 0; // seconds until the flash is ready
  let flashT = Infinity; // seconds since the last flash
  let shownWriting = null;

  const has = () => game.progress.hasFlag('tool_camcorder');
  const battery = () => game.progress.getValue(BATTERY, FOUND_WITH);
  const setBattery = (value) => game.progress.setValue(BATTERY, Math.max(0, Math.min(100, value)));
  const nightOn = () => raised && night;

  function lower() {
    raised = false;
    game.events.emit('camcorder.lowered');
  }

  function raise() {
    if (battery() <= 0) return game.messages.show('msg.camcorderDead', null, 3);
    raised = true;
    game.events.emit('camcorder.raised');
  }

  function toggleNight() {
    night = !night;
    if (night && game.world.flashlight.isOn()) {
      game.world.flashlight.setOn(false);
      game.events.emit('flashlight.toggled', false);
    }
    game.events.emit('camcorder.night', night);
  }

  function flash() {
    if (charge > 0) return;
    charge = CHARGE;
    flashT = 0;
    setBattery(battery() - FLASH_COST);
    game.events.emit('camcorder.flash');
    const her = game.nun.position();
    if (!her) return;
    const p = game.player.state.position;
    const forward = new THREE.Vector3();
    game.world.camera.getWorldDirection(forward);
    const to = new THREE.Vector3(her.x - p.x, 0, her.z - p.z);
    const distance = to.length();
    const facing = distance < 0.01 || to.normalize().dot(forward.setY(0).normalize()) > 0.35;
    if (distance <= RANGE && facing && clearLine(game.world.level, p, her)) game.nun.stun(STUN);
  }

  // Writing only the night view shows (props/wardUpper.js: nightWriting).
  function showWriting() {
    if (shownWriting === nightOn()) return;
    shownWriting = nightOn();
    game.world.levelGroup?.traverse((object) => object.userData.setShown?.(shownWriting));
  }

  // Close to writing only the night view shows, and facing it: noted (flag
  // seen_<id>, its clue in the journal), as if you had looked at it.
  function readWriting() {
    if (!nightOn()) return;
    const level = game.world.level;
    const p = game.player.state.position;
    const forward = new THREE.Vector3();
    game.world.camera.getWorldDirection(forward);
    for (const prop of level.props) {
      if (prop.type !== 'nightWriting' || !prop.id || game.progress.hasFlag(`seen_${prop.id}`)) continue;
      const to = new THREE.Vector3(prop.at[0] * level.cellSize - p.x, 0, prop.at[1] * level.cellSize - p.z);
      if (to.length() > READ_WITHIN || to.normalize().dot(forward.setY(0).normalize()) < 0.6) continue;
      game.progress.setFlag(`seen_${prop.id}`);
      game.events.emit('prop.looked', prop);
    }
  }

  function update(dt, input) {
    charge = Math.max(0, charge - dt);
    flashT += dt;
    if (has()) {
      if (input.wasPressed('camcorder')) (raised ? lower : raise)();
      if (raised && input.wasPressed('nightView')) toggleNight();
      if (raised && input.wasPressed('flash')) flash();
      if (raised) {
        setBattery(battery() - DRAIN * (night ? NIGHT_DRAIN : 1) * dt);
        if (battery() <= 0) lower();
      }
    }
    const calm = game.settings.get('reduceEffects') || game.settings.get('flickerOff');
    const length = calm ? 0.6 : BURST;
    burst.intensity = flashT < length ? (calm ? 14 : 60) * (1 - flashT / length) : 0;
    lens.intensity = nightOn() ? 1.6 : 0;
    game.pipeline.fx.nightVision = nightOn() ? 1 : 0;
    showWriting();
    readWriting();
  }

  game.events.on('level.loaded', () => (shownWriting = null));
  game.events.on('collapse.started', () => (raised = false));
  game.events.on('game.stopped', () => {
    raised = false;
    night = false;
    charge = 0;
  });

  return {
    update,
    raised: () => raised,
    nightOn,
    night: () => night,
    battery,
    // A spare battery (owner pick 2026-11-16: the flashlight's batteries fit it): full again.
    recharge() {
      if (battery() > 95) return false;
      setBattery(100);
      game.events.emit('battery.replaced');
      game.messages.show('msg.camcorderBattery', null, 3);
      return true;
    },
    flashReady: () => charge <= 0,
    charging: () => charge,
  };
}
