// Dev-only: the approved still ui_mapMarks (owner request 2026-10-14), now
// drawn by the real journal screen and map marks (ui/mapMarks.js) from a
// made-up moment of play. Copy here is game text through i18n.
import { createJournalScreen } from '../ui/screens/journal.js';
import { i18n } from '../i18n/index.js';
import wing from '../levels/orphanage_wing.json';

// The toys and the music box have been tried and are not solved yet (blue
// rings); the name plates are solved (their ring is gone); the fuse box has
// not been touched (no ring). The landing recorder has been seen; you are in
// the corridor.
const FLAGS = new Set(['seen_recorder_landing', 'tried_cubbies', 'tried_musicBox', 'tried_namePlates', 'puzzle_plates']);
const YOU = [16, 10.9];

function fakeGame() {
  return {
    journal: { maps: () => ['orphanage_wing'], clues: () => [], documents: () => [] },
    world: { level: { id: 'orphanage_wing', wing: 'orphanage' } },
    player: { state: { position: { x: YOU[0] * wing.cellSize, z: YOU[1] * wing.cellSize } } },
    progress: { hasFlag: (flag) => FLAGS.has(flag) },
    i18n,
    settings: { get: () => ({ hold: 'KeyH', journal: 'KeyJ', map: 'KeyM' }) },
    sanity: { value: () => 80 },
  };
}

export function mapMarks(ctx) {
  createJournalScreen({ t: i18n.t, game: fakeGame() }, { tab: 'maps' }).draw(ctx);
}
