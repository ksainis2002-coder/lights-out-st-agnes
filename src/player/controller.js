// First-person controller: slow, heavy movement with head bob, run with
// stamina, crouch, lean, and a noise level the AI will listen to later.
import { collides, moveWithCollision } from './collision.js';

export const TUNING = {
  walkSpeed: 1.7,
  runSpeed: 3.3,
  crouchSpeed: 0.9,
  acceleration: 7,
  radius: 0.3,
  eyeStand: 1.6,
  eyeCrouch: 1.0,
  crouchRate: 6,
  leanDistance: 0.38,
  leanRoll: 0.16,
  leanRate: 7,
  lookScale: 0.0022,
  maxPitch: 1.48,
  staminaMax: 100,
  staminaDrain: 16,
  staminaRegen: 11,
  staminaRegenDelay: 1,
  staminaMinToRun: 20,
  noise: { still: 0, crouch: 1.5, walk: 4, run: 10 },
};

export function createController(level) {
  const state = {
    position: { x: level.spawn.x, z: level.spawn.z },
    velocity: { x: 0, z: 0 },
    yaw: level.spawn.yaw,
    pitch: 0,
    crouch: 0,
    lean: 0,
    stamina: TUNING.staminaMax,
    staminaRest: 0,
    exhausted: false,
    running: false,
    noise: 0,
    bobPhase: 0,
    eyeHeight: TUNING.eyeStand,
  };

  function look(input, settings) {
    const { x, y } = input.takeLook();
    const scale = TUNING.lookScale * settings.get('mouseSensitivity');
    const invert = settings.get('invertY') ? -1 : 1;
    state.yaw -= x * scale;
    state.pitch -= y * scale * invert;
    state.pitch = Math.max(-TUNING.maxPitch, Math.min(TUNING.maxPitch, state.pitch));
  }

  function wishDirection(input) {
    const forward = (input.isDown('forward') ? 1 : 0) - (input.isDown('back') ? 1 : 0);
    const strafe = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
    const length = Math.hypot(forward, strafe) || 1;
    const sin = Math.sin(state.yaw), cos = Math.cos(state.yaw);
    return {
      x: (-sin * forward + cos * strafe) / length,
      z: (-cos * forward - sin * strafe) / length,
      moving: forward !== 0 || strafe !== 0,
    };
  }

  function updateStamina(dt, wantsRun) {
    if (state.stamina <= 0) state.exhausted = true;
    if (state.exhausted && state.stamina >= TUNING.staminaMinToRun) state.exhausted = false;
    state.running = wantsRun && !state.exhausted;
    if (state.running) {
      state.stamina = Math.max(0, state.stamina - TUNING.staminaDrain * dt);
      state.staminaRest = 0;
    } else {
      state.staminaRest += dt;
      if (state.staminaRest >= TUNING.staminaRegenDelay) {
        state.stamina = Math.min(TUNING.staminaMax, state.stamina + TUNING.staminaRegen * dt);
      }
    }
  }

  function move(dt, input) {
    const wish = wishDirection(input);
    const crouching = input.isDown('crouch');
    updateStamina(dt, wish.moving && input.isDown('run') && !crouching);
    const speed = crouching ? TUNING.crouchSpeed : state.running ? TUNING.runSpeed : TUNING.walkSpeed;
    const blend = 1 - Math.exp(-TUNING.acceleration * dt);
    state.velocity.x += (wish.x * (wish.moving ? speed : 0) - state.velocity.x) * blend;
    state.velocity.z += (wish.z * (wish.moving ? speed : 0) - state.velocity.z) * blend;
    moveWithCollision(level, state.position, state.velocity.x * dt, state.velocity.z * dt, TUNING.radius);

    const actualSpeed = Math.hypot(state.velocity.x, state.velocity.z);
    const moving = actualSpeed > 0.2;
    const pace = crouching ? 'crouch' : state.running ? 'run' : 'walk';
    state.noise = moving ? TUNING.noise[pace] : TUNING.noise.still;
    state.crouch += ((crouching ? 1 : 0) - state.crouch) * (1 - Math.exp(-TUNING.crouchRate * dt));
    state.bobPhase += moving ? actualSpeed * dt * 2.4 : 0;
    state.bobAmount = moving ? Math.min(1, actualSpeed / TUNING.walkSpeed) : 0;
  }

  // Lean stops short of walls so the camera never clips through them.
  function updateLean(dt, input) {
    const wanted = (input.isDown('leanRight') ? 1 : 0) - (input.isDown('leanLeft') ? 1 : 0);
    const previous = state.lean;
    state.lean += (wanted - state.lean) * (1 - Math.exp(-TUNING.leanRate * dt));
    if (!leanBlocked()) return;
    state.lean = Math.abs(state.lean) > Math.abs(previous) ? previous : state.lean;
    while (leanBlocked() && Math.abs(state.lean) > 0.01) state.lean *= 0.5;
  }

  function leanBlocked() {
    const side = leanOffset();
    return collides(level, state.position.x + side.x, state.position.z + side.z, 0.12);
  }

  function leanOffset() {
    const d = state.lean * TUNING.leanDistance;
    return { x: Math.cos(state.yaw) * d, z: -Math.sin(state.yaw) * d };
  }

  function update(dt, input, settings) {
    look(input, settings);
    move(dt, input);
    updateLean(dt, input);
    const bob = Math.sin(state.bobPhase * Math.PI) * 0.035 * (state.bobAmount ?? 0) * (state.running ? 1.6 : 1);
    state.eyeHeight = TUNING.eyeStand + (TUNING.eyeCrouch - TUNING.eyeStand) * state.crouch + bob;
  }

  function applyToCamera(camera, settings) {
    const side = leanOffset();
    camera.position.set(state.position.x + side.x, state.eyeHeight, state.position.z + side.z);
    camera.rotation.set(state.pitch, state.yaw, -state.lean * TUNING.leanRoll, 'YXZ');
    const fov = settings.get('fov');
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }

  return { state, update, applyToCamera };
}
