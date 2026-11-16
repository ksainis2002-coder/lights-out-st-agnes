// A line the first time you come into a level after something has happened
// (your room after the west wing: "Three of the five are home. The room is
// colder."). Each is said once.
// Level data: "arrivals": [{ "after": { "flag": "<flag>" }, "message": "<key>" }]
export function watchArrivals(game) {
  game.events.on('level.loaded', (level) => {
    for (const entry of level.arrivals) {
      const said = `said_${entry.message}`;
      if (!game.progress.hasFlag(entry.after.flag) || game.progress.hasFlag(said)) continue;
      game.progress.setFlag(said);
      game.messages.show(entry.message, null, 6);
    }
  });
}
