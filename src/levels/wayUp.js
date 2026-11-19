// The way up (0.5, part C; the wing 4 content sheet): up the theatre's back
// stairs into the west wing, the way out. The wards are dark (their lamps died
// for good on the west wing's own way out: levels/lamps.js) and empty: Sister
// M. no longer walks them (ai/nun.js); only Dr. Venn, who comes up the stairs
// after you (ai/surgeon.js "rise"). As you come up: "(instruments clinking,
// on the stairs below you)", the journal, and a checkpoint. Then the
// courtyard: "The front gate, or my room." (its arrival line, levels/arrivals.js).
export const WAY_UP = 'way_up';
const STAIRS = 'theatre_stairs'; // the west wing's spawn at the top of the back stairs
const CAPTION = { speaker: null, whisper: false, seconds: 4 };

export function createWayUp(game) {
  const { progress, events } = game;
  let coming = false;

  // Set as you leave, so the wards are ready for it when they load (his plan "requires" it).
  events.on('level.leaving', ({ spawn }) => {
    coming = spawn === STAIRS;
    if (coming) progress.setFlag(WAY_UP);
  });

  events.on('level.travelled', () => {
    if (!coming) return;
    coming = false;
    game.subtitles.show('caption.vennOnStairs', CAPTION);
    events.emit('clue', 'wards_dark');
    events.emit('checkpoint');
  });

  return { up: () => progress.hasFlag(WAY_UP) };
}
