// Sanity collapse (approved still: rewind): the eyes close and the view
// falls, then the tape rewinds — tearing picture, "◀◀ REW", counter running
// backwards — and the player wakes at the last checkpoint while a child
// whispers what went wrong. Death is short and teaches (scare rules §7).

const FAINT = 1.6; // seconds
const REWIND = 3;
const WHISPER = { dark: 'whisper.rewind.dark', default: 'whisper.rewind.dark' };

export function createCollapse(game) {
  let phase = null; // null | 'faint' | 'rewind'
  let t = 0;
  let cause = 'dark';
  let counterFrom = 0;
  let rewinds = 0;

  function start(why) {
    if (phase) return;
    phase = 'faint';
    t = 0;
    cause = why;
    counterFrom = game.session.playTime;
    game.inventory.setOpen(false);
    game.events.emit('collapse.started', cause);
  }

  function restore() {
    const loaded = game.loadFromTape('auto');
    if (!loaded) game.loadLevel(game.world.level.id);
    game.sanity.set(Math.max(60, game.sanity.value()));
    rewinds += 1;
    const fx = game.pipeline.fx;
    Object.assign(fx, { rewind: 0, eyelid: 0, aberration: 0, blur: 0, vignette: 0 });
    game.subtitles.show(WHISPER[cause] ?? WHISPER.default, { speaker: 'tommy', seconds: 5 });
    game.events.emit('collapse.ended', cause);
    phase = null;
  }

  function update(dt) {
    if (!phase) return;
    t += dt;
    const fx = game.pipeline.fx;
    if (phase === 'faint') {
      fx.eyelid = Math.min(1, t / FAINT);
      if (t >= FAINT) {
        phase = 'rewind';
        t = 0;
        game.events.emit('collapse.rewinding');
      }
      return;
    }
    // As in the approved still: tearing tape, no dark edges over the VCR text.
    Object.assign(fx, { eyelid: 0, rewind: 1, aberration: 1.5, vignette: 0, blur: 0 });
    if (t >= REWIND) restore();
  }

  // The view falls sideways while fainting (applied after the player camera).
  function applyCamera(camera) {
    if (phase !== 'faint') return;
    const k = Math.min(1, t / FAINT);
    camera.rotation.z += k * 0.6;
    camera.position.y -= k * 0.6;
  }

  return {
    start,
    update,
    applyCamera,
    active: () => phase !== null,
    rewinding: () => phase === 'rewind',
    // The tape counter runs backwards during the rewind.
    counter: () => Math.max(0, counterFrom - t * 400),
    rewinds: () => rewinds,
  };
}
