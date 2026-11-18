// Holding your breath (0.5; approved still ui_breath; the wing 4 content
// sheet). Hold the hold-breath key (Space) and your breathing makes no sound:
// about 6 s of it on Normal, then you gasp for air ("(you gasp for air)"),
// loud enough for Dr. Venn to hear. Let go sooner and it fills again, half
// as fast as it ran out. After a run you pant, heard close by, unless you
// hold it. The ring round the centre of your view empties as you hold it
// (ui/breathHud.js). Others hear you through a "noise" event:
//   events.emit('noise', { x, z, radius, kind })   x/z in metres

const HOLD = { story: 8, normal: 6, hard: 5 }; // seconds you can hold it
const REFILL = 0.5; // seconds of held breath back per second, once you let go
const GASP_RADIUS = 9; // metres the gasp carries
const PANT_RADIUS = 3; // metres your panting carries after a run
const PANT_BELOW = 60; // stamina under this: you are still out of breath
const CAPTION = { speaker: null, whisper: false, seconds: 3 };

export function createBreath(game) {
  let left = 1; // the share of held breath left, 0..1
  let holding = false;
  let spent = false; // after a gasp, the key must be let go before you can hold again

  const seconds = () => HOLD[game.settings.get('difficulty')] ?? HOLD.normal;
  const at = () => game.player.state.position;

  function gasp() {
    holding = false;
    spent = true;
    game.events.emit('noise', { x: at().x, z: at().z, radius: GASP_RADIUS, kind: 'gasp' });
    game.events.emit('breath.gasp');
    game.subtitles.show('caption.gasp', CAPTION);
  }

  function update(dt, input) {
    const down = input.isDown('holdBreath') && !game.collapse.active(); // not while you are caught
    if (!down) spent = false;
    const was = holding;
    holding = down && !spent && left > 0;
    if (holding && !was) game.events.emit('breath.held');
    if (!holding) {
      left = Math.min(1, left + (dt * REFILL) / seconds());
      return;
    }
    left = Math.max(0, left - dt / seconds());
    if (left === 0) gasp();
  }

  // How far your breathing carries now, in metres: nothing while you hold it.
  const noise = () => (holding || game.player.state.stamina >= PANT_BELOW ? 0 : PANT_RADIUS);

  game.events.on('level.loaded', () => {
    holding = false;
    left = 1;
  });

  return {
    update,
    noise,
    holding: () => holding,
    left: () => left,
    debugLine: () => `BREATH  ${holding ? `held, ${Math.round(left * seconds() * 10) / 10}s left` : left < 1 ? 'filling' : '-'}  pant ${noise() ? 'yes' : 'no'}`,
  };
}
