// The end of the west wing (part C2): Edith's box mended (ghosts/edithBox.js),
// the way out (levels/wayOut.js), the box's tune (audio/edithTune.js), and the
// line in your room afterwards (levels/arrivals.js).
import { createEdithBox } from '../ghosts/edithBox.js';
import { createWayOut } from './wayOut.js';
import { createEdithTune } from '../audio/edithTune.js';
import { watchArrivals } from './arrivals.js';

export function createWardsEnd(game) {
  const box = createEdithBox(game);
  const wayOut = createWayOut(game);
  const tune = createEdithTune(game);
  watchArrivals(game);
  return {
    box,
    wayOut,
    tune,
    update(dt) {
      box.update();
      wayOut.update(dt);
      tune.update(dt);
    },
  };
}
