// Dr. Venn's sounds and their subtitles (ai/surgeon.js decides what he does;
// this says it, from the wing 4 content sheet): his instruments clinking as he
// walks, heard through a wall ("(instruments clinking, through the wall)",
// "(…, close)"); the clinking stopping when he listens (his tell); his quick
// footsteps when he comes; his wet breath close by; his two muttered lines;
// his cry at the flash; the clinking moving away when he gives up. And at low
// sanity, clinking behind you that is not him: it has no place in the room
// (the fake's tell, scare rules §3) and it never does anything.
import { clearLine } from './gaze.js';

const CAPTION = { speaker: null, whisper: false, seconds: 3 };
const MUTTER = { speaker: 'venn', manner: 'muttering', seconds: 3.5 };
const HEAR_CLINK = 12; // metres his tools carry to you in the open (half through a wall)
const CAPTION_EVERY = 8; // seconds between clinking subtitles
const BREATH_NEAR = 4; // metres
const BREATH_EVERY = 2.6; // seconds
const MUTTER_EVERY = 20; // seconds
const FAKE_BELOW = 35; // sanity under which the clinking may come from nowhere
const FAKE_GAP = [30, 50]; // seconds between false clinks
const FAKE_AWAY = 10; // metres: only while he is no nearer than this

export function createSurgeonVoice(game) {
  let clinkIn = 0;
  let captionIn = 0;
  let breathIn = 0;
  let mutterIn = 0;
  let fakeIn = FAKE_GAP[0];
  let breathSaid = false;

  const show = (key) => game.subtitles.show(key, CAPTION);
  const player = () => game.player.state.position;
  const distance = (at) => Math.hypot(at.x - player().x, at.z - player().z);

  // How his sounds reach you from where he is: 'close', 'wall', or null.
  function earshot(at) {
    const open = clearLine(game.world.level, at, player());
    if (open && distance(at) <= HEAR_CLINK) return 'close';
    if (!open && distance(at) <= HEAR_CLINK / 2) return 'wall';
    return null;
  }

  // Every frame he moves: the clink of his tools (quicker when he comes), and its line now and then
  // (quiet: no line, as he comes up the stairs below you; the way up says it: levels/wayUp.js).
  function walking(dt, at, fast = false, { quiet = false } = {}) {
    clinkIn -= dt;
    captionIn -= dt;
    if (clinkIn > 0) return;
    clinkIn = fast ? 0.32 : 0.6;
    game.events.emit('surgeon.clink', { position: at.clone(), fast });
    const where = earshot(at);
    if (quiet || !where || captionIn > 0) return;
    show(where === 'close' ? 'caption.clinkClose' : 'caption.clinkWall');
    captionIn = CAPTION_EVERY;
  }

  // He heard something: the clinking stops dead.
  function stopped(at) {
    if (earshot(at)) show('caption.clinkStops');
    captionIn = CAPTION_EVERY / 2;
    game.events.emit('surgeon.listen', { position: at.clone() });
  }

  function rushing(at) {
    if (earshot(at)) show('caption.quickSteps');
    game.events.emit('surgeon.rush', { position: at.clone() });
  }

  function gaveUp(at) {
    if (earshot(at)) show('caption.clinkAway');
    captionIn = CAPTION_EVERY;
  }

  function cried(at) {
    show('caption.vennCry');
    game.events.emit('surgeon.cry', { position: at.clone() });
  }

  function mutter(key, at) {
    if (mutterIn > 0 || !earshot(at)) return;
    mutterIn = MUTTER_EVERY;
    game.progress.setFlag('name_venn'); // you know him from his notes upstairs
    game.subtitles.show(key, MUTTER);
    game.events.emit('surgeon.mutter', { position: at.clone() });
  }

  // Close by, his breath; at low sanity, the clinking that is not him.
  function update(dt, at) {
    mutterIn -= dt;
    if (at && distance(at) <= BREATH_NEAR) {
      breathIn -= dt;
      if (breathIn <= 0) {
        breathIn = BREATH_EVERY;
        game.events.emit('surgeon.breath', { position: at.clone() });
        if (!breathSaid) show('caption.vennBreath');
        breathSaid = true;
      }
    } else if (!at || distance(at) > BREATH_NEAR * 1.5) breathSaid = false;
    if (game.sanity.value() >= FAKE_BELOW || (at && distance(at) < FAKE_AWAY)) return;
    fakeIn -= dt;
    if (fakeIn > 0) return;
    fakeIn = FAKE_GAP[0] + Math.random() * (FAKE_GAP[1] - FAKE_GAP[0]);
    game.events.emit('surgeon.fakeClink');
    show('caption.clinkBehind');
  }

  return { walking, stopped, rushing, gaveUp, cried, mutter, update, earshot };
}
