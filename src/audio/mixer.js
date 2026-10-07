// Audio mixer: master <- music, effects, voices (the three settings
// channels; ambience plays into effects). Volumes are set in decibels, with
// a duck stage per bus and a limiter on the master for headroom.
// The AudioContext starts on the first key or click (browser autoplay rules).

export const BUSES = ['music', 'effects', 'voices'];
const MASTER_HEADROOM_DB = -3;
const SLIDER_RANGE_DB = 40; // slider 0..1 maps to -40..0 dB, 0 = silent

export const dbToGain = (db) => 10 ** (db / 20);

// Settings slider (0..1) to linear gain, perceptually even.
export function sliderToGain(value) {
  if (value <= 0) return 0;
  return dbToGain((value - 1) * SLIDER_RANGE_DB);
}

export function createMixer(settings, { context = null } = {}) {
  let ctx = context;
  const buses = {};
  let master = null;

  function build() {
    master = ctx.createGain();
    master.gain.value = dbToGain(MASTER_HEADROOM_DB);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.ratio.value = 12;
    master.connect(limiter).connect(ctx.destination);
    for (const name of BUSES) {
      const volume = ctx.createGain();
      const duck = ctx.createGain();
      volume.connect(duck).connect(master);
      buses[name] = { input: volume, volume, duck };
    }
    applyVolumes();
  }

  function applyVolumes() {
    if (!ctx) return;
    const volume = settings.get('volume');
    for (const name of BUSES) buses[name].volume.gain.setTargetAtTime(sliderToGain(volume[name]), ctx.currentTime, 0.02);
  }

  // Starts audio. Call from a user gesture; safe to call many times.
  function start() {
    if (!ctx) {
      ctx = new AudioContext();
      build();
    } else if (!master) {
      build();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Dips a bus by `db` (negative), holds, then recovers. Used for voices over music.
  function duck(bus, db, { attack = 0.08, hold = 1, release = 0.6 } = {}) {
    if (!ctx) return;
    const gain = buses[bus].duck.gain;
    const now = ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(dbToGain(db), now + attack);
    gain.setValueAtTime(dbToGain(db), now + attack + hold);
    gain.linearRampToValueAtTime(1, now + attack + hold + release);
  }

  settings.onChange((name) => {
    if (name === 'volume' || name === null) applyVolumes();
  });

  return {
    start,
    duck,
    context: () => ctx,
    bus: (name) => buses[name]?.input ?? null,
    busGain: (name) => buses[name]?.volume.gain.value ?? null,
  };
}
