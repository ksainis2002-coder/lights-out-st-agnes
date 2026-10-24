// How bright a lightning strike is, "time" seconds in (levels/storm.js): a
// blink, a second blink when "twice", then it dies away; or, with "glow"
// (reduce effects, flicker off), a slow rise and fall that never strobes.
export function strikeLight(time, { glow = false, twice = false } = {}) {
  if (glow) return time < 0.35 ? (time / 0.35) * 0.45 : Math.max(0, 0.45 * (1 - (time - 0.35) / 1.2));
  if (time < 0.05) return 1;
  if (twice && time < 0.11) return 0.15;
  if (twice && time < 0.2) return 0.9;
  const after = twice ? 0.2 : 0.05;
  return Math.max(0, 1 - (time - after) / 0.35);
}
