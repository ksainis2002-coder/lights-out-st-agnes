// A single music box note, made with Web Audio (no sound file): a sine with
// two quiet overtones, quick strike, ringing decay.
export function playNote(mixer, frequency, { position = null, volume = 0.5, bus = 'effects' } = {}) {
  const ctx = mixer.context();
  if (!ctx) return;
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
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
  [[1, 1], [2, 0.25], [3, 0.08]].forEach(([multiple, level]) => {
    const osc = ctx.createOscillator();
    const partial = ctx.createGain();
    osc.frequency.value = frequency * multiple;
    partial.gain.value = level;
    osc.connect(partial).connect(gain);
    osc.start(now);
    osc.stop(now + 1.7);
  });
}
