// The way out of the west wing (content sheet "The way out"; approved still
// way_out). Taking Edith's mended music box from her lap starts it: the lamps
// hum, then every lamp in the wing dies (levels/lamps.js) and Edith says go.
// Sister M. stands between you and the courtyard door and hunts your light
// only, faster (ai/nun.js "hunt"). The night view shows the way, the flash
// stops her, and the box plays the whole time (audio/edithTune.js). A
// checkpoint as the lamps die, so a catch costs under two minutes. Out
// through the courtyard door, Edith's last line: the first time anyone in
// this wing calls you Tommy. A scripted story beat (scare rules): the hum is
// its tell, it starts the set-piece cooldown, and comfort mode keeps it (she
// walks slower there, as always).
// Level data: "wayOut": { "toy": "<pickup id>", "flag": "wards_way_out",
//   "tell": seconds, "line": key, "last": key, "to": "<level id>",
//   "setup", "cooldownGroup", "cooldown", "comfort" }
export const ESCAPED = 'wards_escaped';

export function createWayOut(game) {
  const { progress, events } = game;
  let dying = null; // seconds into the hum before the lamps die
  let leaving = null; // the last line, said once you are through the door

  const data = () => game.world.level?.wayOut ?? null;

  function start() {
    const way = data();
    dying = null;
    progress.setFlag(way.flag);
    game.lamps.dieAll();
    game.nun.startHunt();
    game.edith.tell([way.line]);
    game.ghosts?.startCooldown(way.cooldownGroup, way.cooldown);
    events.emit('wayOut.started');
    events.emit('checkpoint');
  }

  function update(dt) {
    if (dying === null) return;
    dying += dt;
    if (dying >= data().tell) start();
  }

  events.on('item.taken', (pickup) => {
    const way = data();
    if (!way || pickup.id !== way.toy || progress.hasFlag(way.flag)) return;
    dying = 0;
    events.emit('lamps.dying'); // the tell: every bulb in the wing hums
  });

  // Through the courtyard door while she hunts: out, and Edith's last line.
  events.on('level.leaving', ({ id }) => {
    const way = data();
    leaving = way && id === way.to && progress.hasFlag(way.flag) && !progress.hasFlag(ESCAPED) ? way.last : null;
  });

  events.on('level.travelled', () => {
    if (!leaving) return;
    progress.setFlag(ESCAPED);
    game.subtitles.show(leaving, { speaker: 'edith', seconds: 6 });
    leaving = null;
    events.emit('wayOut.escaped');
    events.emit('clue', 'edith_tommy'); // the first time anyone here calls you Tommy
    events.emit('wings.check'); // the wing may be done now (levels/wings.js)
    events.emit('checkpoint'); // saved with it (the arrival's own autosave came first)
  });

  events.on('level.loaded', () => {
    dying = null;
  });

  return { update, state: () => ({ dying, out: progress.hasFlag(ESCAPED) }) };
}
