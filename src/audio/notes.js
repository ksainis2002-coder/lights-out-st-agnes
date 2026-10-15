// A single music box note, made with Web Audio (no sound file): a sine with
// two quiet overtones, quick strike, ringing decay. The school piano (0.3)
// passes PIANO: more overtones, a longer, duller ring.
const MUSIC_BOX = { partials: [[1, 1], [2, 0.25], [3, 0.08]], decay: 1.6 };
export const PIANO = { partials: [[1, 1], [2, 0.45], [3, 0.2], [4, 0.1], [5, 0.04]], decay: 2.6 };

export function playNote(mixer, frequency, { position = null, volume = 0.5, bus = 'effects', timbre = MUSIC_BOX } = {}) {
  const ctx = mixer.context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + timbre.decay);
  let out = gain;
  if (position) {
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;
    out = gain.connect(panner);
  }
  out.connect(mixer.bus(bus));
  timbre.partials.forEach(([multiple, level]) => {
    const osc = ctx.createOscillator();
    const partial = ctx.createGain();
    osc.frequency.value = frequency * multiple;
    partial.gain.value = level;
    osc.connect(partial).connect(gain);
    osc.start(now);
    osc.stop(now + timbre.decay + 0.1);
  });
}
