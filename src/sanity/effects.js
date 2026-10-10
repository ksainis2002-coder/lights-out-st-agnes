// What low sanity looks and sounds like (approved still: low_sanity).
// Below 60 the picture splits colour, softens, darkens at the edges and the
// view sways; below 30 a heartbeat; below 15 ringing ears. Reduce effects
// and flicker off are applied by the pipeline (weaker aberration).

export function sanityAmount(value) {
  return Math.max(0, Math.min(1, (60 - value) / 60));
}

export function applySanityEffects(game, value, time) {
  const k = sanityAmount(value);
  const fx = game.pipeline.fx;
  fx.aberration = 2.2 * k;
  fx.blur = value < 30 ? 0.6 * ((30 - value) / 30) : 0;
  fx.vignette = 0.6 * k;
  const sway = game.settings.get('reduceEffects') ? 0.4 : 1;
  game.world.camera.rotation.z += Math.sin(time * 0.7) * 0.07 * k * sway;
  game.sfx.setLayer('heartbeat', value < 30 ? 0.9 * ((30 - value) / 30) : 0);
  game.sfx.setLayer('tinnitus', value < 15 ? 0.35 * ((15 - value) / 15) : 0);
}
