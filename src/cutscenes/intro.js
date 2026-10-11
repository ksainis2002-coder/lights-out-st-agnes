// The intro (approved still intro_wake, brief: 30–60 s in-engine, waking in
// bed). A new game opens on black; the eyes flutter open on the patient-room
// bed, a child whispers, the view drifts round the room, then he sits up and
// stands where the player takes over. ENTER or SPACE skips it.

const LENGTH = 36; // seconds
const BED_EYE = { x: 1.6, y: 0.78, z: 1.45 }; // head on the pillow, metres
const DEG = Math.PI / 180;

// Keyframes [time, value]; values between keys are eased.
const EYELID = [[0, 1], [3, 1], [4.5, 0.55], [5.2, 0.95], [6.8, 0.5], [7.4, 0.85], [9, 0.45], [24, 0.3], [30, 0]];
const BLUR = [[0, 1], [18, 1], [26, 0.2], [32, 0]];
const FADE = [[0, 1], [3, 1], [4.2, 0]];
const YAW = [[0, 180], [12, 180], [16, 152], [20, 150], [24, 214], [27, 196]];
const PITCH = [[0, 22], [12, 22], [16, 10], [24, 14], [27, 18]];
const ROLL = [[0, -8], [26, -8], [33, 0]];
const SIT_UP = [27, 33]; // from lying to standing at the spawn
const CUES = [
  { at: 4.5, run: (game) => game.sfx?.play('wake_gasp', { volume: 0.6 }) },
  { at: 10.5, run: (game) => whisper(game, 'intro.whisper1') },
  { at: 19, run: (game) => whisper(game, 'intro.whisper2') },
];

function whisper(game, key) {
  game.sfx?.play('whisper', { position: { x: 3.2, y: 1.2, z: 4.6 }, volume: 0.7 });
  game.subtitles.show(key, { speaker: 'tommy', seconds: 4.5 });
}

function ease(t) {
  return t * t * (3 - 2 * t);
}

function sample(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
}

export function createIntro(game) {
  let t = 0;
  let active = false;
  let cue = 0;

  function finish() {
    active = false;
    Object.assign(game.pipeline.fx, { eyelid: 0, blur: 0, fade: 0 });
    game.events.emit('intro.finished');
  }

  function start() {
    active = true;
    t = 0;
    cue = 0;
    game.progress.setFlag('intro_seen');
    game.events.emit('intro.started');
  }

  function update(dt, input) {
    if (!active) return;
    if (input.wasCodePressed('Enter') || input.wasCodePressed('Space')) return finish();
    t += dt;
    while (cue < CUES.length && t >= CUES[cue].at) CUES[cue++].run(game);
    Object.assign(game.pipeline.fx, { eyelid: sample(EYELID, t), blur: sample(BLUR, t), fade: sample(FADE, t) });
    if (t >= LENGTH) finish();
  }

  // Overrides the player camera while the intro runs.
  function applyCamera(camera) {
    if (!active) return;
    const stand = game.player.state;
    const k = ease(Math.min(1, Math.max(0, (t - SIT_UP[0]) / (SIT_UP[1] - SIT_UP[0]))));
    camera.position.set(
      BED_EYE.x + (stand.position.x - BED_EYE.x) * k,
      BED_EYE.y + (stand.eyeHeight - BED_EYE.y) * k,
      BED_EYE.z + (stand.position.z - BED_EYE.z) * k,
    );
    const yaw = sample(YAW, t) * DEG * (1 - k) + stand.yaw * k;
    camera.rotation.set(sample(PITCH, t) * DEG * (1 - k), yaw, sample(ROLL, t) * DEG, 'YXZ');
  }

  return { start, update, applyCamera, finish, active: () => active, time: () => t };
}
