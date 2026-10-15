// Sanity collapse (approved still: rewind): the eyes close and the view
// falls, then the tape rewinds — tearing picture, "◀◀ REW", counter running
// backwards — and the player wakes at the last checkpoint while a child
// whispers what went wrong. Death is short and teaches (scare rules §7).
// With a presence in view or close (game.presences: a vision now, enemies
// later), it lunges into the face first (approved still collapse_scare).
// The scare only goes with a collapse that is already happening; comfort
// mode skips it. The watcher's catch starts with her grab instead (approved
// still watcher_grab: her face fills the view, a stone hand), also skipped in
// comfort mode, and Maggie says what happened over the rewind. In the
// school, a blackout gets Maggie's line instead of Tommy's.
import * as THREE from 'three';
import { PROPS } from '../props/catalog.js';

const LUNGE = 0.45; // seconds
const GRAB = 0.9; // seconds
const GRAB_FROM = 1.25; // metres in front of the eyes
const GRAB_PITCH = 0.42; // looking up into her face, as in the still
const GRAB_ROLL = -0.2;
const LUNGE_FROM = 1.3; // metres in front of the eyes
const LUNGE_TO = 0.35;
const FACE_HEIGHT = 1.1; // the lunge prop's face, above its origin
const FAINT = 1.6; // seconds
const REWIND = 3;
const WHISPER = { dark: 'whisper.rewind.dark', default: 'whisper.rewind.dark' };
const WING_WHISPER = { school: { key: 'maggie.blackout', speaker: 'maggie' } };

// True when any registered presence is on screen or within a few metres.
function presenceNear(game) {
  const camera = game.world.camera;
  camera.updateMatrixWorld();
  const frustum = new THREE.Frustum().setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
  );
  return game.presences.some((source) => {
    const position = source();
    if (!position) return false;
    const point = new THREE.Vector3(position.x, 1.1, position.z);
    return frustum.containsPoint(point) || point.distanceTo(camera.position) < 4;
  });
}

export function createCollapse(game) {
  let phase = null; // null | 'grab' | 'lunge' | 'faint' | 'rewind'
  let lunge = null;
  let grab = null;
  let whisper = null; // { key, speaker } said over the rewind
  let t = 0;
  let cause = 'dark';
  let counterFrom = 0;
  let rewinds = 0;

  // options: { grab: true } for the watcher's catch; { whisper, speaker } for
  // the line over the rewind (else the wing's blackout line).
  function start(why, options = {}) {
    if (phase) return;
    t = 0;
    cause = why;
    const wing = WING_WHISPER[game.world.level.wing];
    whisper = options.whisper ? { key: options.whisper, speaker: options.speaker ?? null } : wing ?? null;
    counterFrom = game.session.playTime;
    game.inventory.setOpen(false);
    if (options.grab && !game.settings.get('comfortMode')) {
      phase = 'grab';
      grab = PROPS.watcherGrab(game.world.textures);
      game.world.scene.add(grab);
      game.events.emit('collapse.grab', cause);
      return;
    }
    const scare = !options.grab && !game.settings.get('comfortMode') && presenceNear(game);
    if (scare) {
      phase = 'lunge';
      lunge = PROPS.ghostLunge(game.world.textures);
      game.world.scene.add(lunge);
      game.events.emit('collapse.scare', cause);
      return;
    }
    phase = 'faint';
    game.events.emit('collapse.started', cause);
  }

  // The child rushes from arm's length into the face, then the faint begins.
  function updateLunge() {
    const camera = game.world.camera;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const k = Math.min(1, t / LUNGE);
    const distance = LUNGE_FROM - (LUNGE_FROM - LUNGE_TO) * k * k;
    lunge.position.set(camera.position.x + forward.x * distance, camera.position.y - FACE_HEIGHT, camera.position.z + forward.z * distance);
    lunge.rotation.y = Math.atan2(-forward.x, -forward.z);
    game.pipeline.fx.aberration = game.settings.get('reduceEffects') ? 1 : 2.5;
    if (t < LUNGE) return;
    lunge.parent?.remove(lunge);
    lunge = null;
    phase = 'faint';
    t = 0;
    game.events.emit('collapse.started', cause);
  }

  // Her face fills the view for a moment, then the faint begins.
  function updateGrab() {
    const camera = game.world.camera;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    grab.position.set(camera.position.x + forward.x * GRAB_FROM, 0, camera.position.z + forward.z * GRAB_FROM);
    grab.rotation.y = Math.atan2(-forward.x, -forward.z);
    const strong = !game.settings.get('reduceEffects');
    Object.assign(game.pipeline.fx, { vignette: 0.8, aberration: strong ? 3 : 1, blur: 0.3 });
    if (t < GRAB) return;
    grab.parent?.remove(grab);
    grab = null;
    phase = 'faint';
    t = 0;
    game.events.emit('collapse.started', cause);
  }

  function restore() {
    const loaded = game.loadFromTape('auto');
    if (!loaded) game.loadLevel(game.world.level.id);
    game.sanity.set(Math.max(60, game.sanity.value()));
    rewinds += 1;
    const fx = game.pipeline.fx;
    Object.assign(fx, { rewind: 0, eyelid: 0, aberration: 0, blur: 0, vignette: 0 });
    const line = whisper ?? { key: WHISPER[cause] ?? WHISPER.default, speaker: 'tommy' };
    game.subtitles.show(line.key, { speaker: line.speaker, seconds: 5 });
    game.events.emit('collapse.ended', cause);
    phase = null;
  }

  function update(dt) {
    if (!phase) return;
    t += dt;
    if (phase === 'lunge') return updateLunge();
    if (phase === 'grab') return updateGrab();
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

  // STOP or a new game mid-collapse: nothing of it stays behind.
  function cancel() {
    lunge?.parent?.remove(lunge);
    grab?.parent?.remove(grab);
    lunge = null;
    grab = null;
    phase = null;
    t = 0;
    Object.assign(game.pipeline.fx, { rewind: 0, eyelid: 0 });
  }

  // Looking up into her face during the grab; the view falls sideways while
  // fainting (both applied after the player camera).
  function applyCamera(camera) {
    if (phase === 'grab') {
      const k = Math.min(1, t / 0.2);
      camera.rotation.x += GRAB_PITCH * k;
      camera.rotation.z += GRAB_ROLL * k;
      return;
    }
    if (phase !== 'faint') return;
    const k = Math.min(1, t / FAINT);
    camera.rotation.z += k * 0.6;
    camera.position.y -= k * 0.6;
  }

  return {
    start,
    cancel,
    update,
    applyCamera,
    active: () => phase !== null,
    rewinding: () => phase === 'rewind',
    scaring: () => phase === 'lunge',
    grabbing: () => phase === 'grab',
    // The tape counter runs backwards during the rewind.
    counter: () => Math.max(0, counterFrom - t * 400),
    rewinds: () => rewinds,
  };
}
