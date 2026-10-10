// What low sanity looks and sounds like (approved still: low_sanity).
// Owner decision (0.2): no meter on screen; the effects make it obvious.
// From 85 the colours split and the edges darken, growing steadily; from 70
// the view sways; from 50 a heartbeat; from 45 the picture softens; from 35
// heavy breathing; below 15 ringing ears. Reduce effects and flicker off
// soften them (the pipeline weakens the colour split; sway is reduced here).

export function sanityAmount(value) {
  return Math.max(0, Math.min(1, (85 - value) / 85));
}

const below = (value, start) => Math.max(0, Math.min(1, (start - value) / start));

export function applySanityEffects(game, value, time) {
  const k = sanityAmount(value);
  const fx = game.pipeline.fx;
  fx.aberration = 2.4 * k;
  fx.vignette = 0.7 * k;
  fx.blur = 0.6 * below(value, 45);
  const sway = game.settings.get('reduceEffects') ? 0.4 : 1;
  game.world.camera.rotation.z += Math.sin(time * 0.7) * 0.08 * below(value, 70) * sway;
  game.sfx.setLayer('heartbeat', 0.9 * below(value, 50));
  game.sfx.setLayer('breath_run', 0.5 * below(value, 35));
  game.sfx.setLayer('tinnitus', 0.35 * below(value, 15));
}
