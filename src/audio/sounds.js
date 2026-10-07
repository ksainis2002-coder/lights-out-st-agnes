// Sound loading and playback. Files are Ogg from CC0 libraries, listed in
// assets/CREDITS.md. Paths stay relative (base './').
// Repeated sounds get small random pitch and volume changes so they never
// sound identical; 3D sounds go through an HRTF panner.

const cache = new Map();

export async function loadSound(ctx, path) {
  if (!cache.has(path)) {
    cache.set(path, fetch(path).then((res) => res.arrayBuffer()).then((data) => ctx.decodeAudioData(data)));
  }
  return cache.get(path);
}

function createPanner(ctx, position) {
  const panner = ctx.createPanner();
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.rolloffFactor = 1.2;
  panner.maxDistance = 30;
  panner.positionX.value = position.x;
  panner.positionY.value = position.y;
  panner.positionZ.value = position.z;
  return panner;
}

// Plays a decoded buffer into a mixer bus. Returns the source node.
export function playSound(mixer, buffer, { bus = 'effects', position = null, volume = 1, pitchJitter = 0.05, volumeJitter = 0.1, loop = false } = {}) {
  const ctx = mixer.context();
  if (!ctx || !buffer) return null;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.playbackRate.value = 1 + (Math.random() * 2 - 1) * pitchJitter;
  const gain = ctx.createGain();
  gain.gain.value = volume * (1 - Math.random() * volumeJitter);
  let node = source.connect(gain);
  if (position) node = node.connect(createPanner(ctx, position));
  node.connect(mixer.bus(bus));
  source.start();
  return source;
}

// Moves the audio listener to the camera each frame.
export function updateListener(mixer, camera) {
  const ctx = mixer.context();
  if (!ctx) return;
  const { listener } = ctx;
  const e = camera.matrixWorld.elements;
  const t = ctx.currentTime;
  listener.positionX.setValueAtTime(e[12], t);
  listener.positionY.setValueAtTime(e[13], t);
  listener.positionZ.setValueAtTime(e[14], t);
  listener.forwardX.setValueAtTime(-e[8], t);
  listener.forwardY.setValueAtTime(-e[9], t);
  listener.forwardZ.setValueAtTime(-e[10], t);
  listener.upX.setValueAtTime(e[4], t);
  listener.upY.setValueAtTime(e[5], t);
  listener.upZ.setValueAtTime(e[6], t);
}
