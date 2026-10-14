// Mockup stills for 0.3 part A, the ground floor's new rooms (owner
// 2026-10-14: stills before building): the music room and the piano close-up
// (colours only, or colours with shapes), the nurse's room, the art room, the
// entrance hall and its stairs, and the cloakroom.
// Text here is mockup copy, not game text (game text goes through i18n).
import { aim, subtitle } from './helpers.js';
import { pianoClose } from './schoolUi.js';
import music from './levels/music.json';
import nurse from './levels/nurse.json';
import art from './levels/art.json';
import hall from './levels/hall.json';
import cloakroom from './levels/cloakroom.json';

const atThePiano = ({ world }) => aim(world.camera, [3.12, 1.3, 2.75], 0, -22);

export const PART_A_STILLS = {
  // The music room: Maggie's coloured stickers on the piano keys.
  music_room: {
    level: music,
    setup: ({ world }) => aim(world.camera, [5.6, 1.6, 5.3], 36, -11),
    ui: (ctx) => subtitle(ctx, '(Maggie, whispering) I put the colours on the piano, so the little ones could play.'),
  },
  // Proposal: the piano close-up, colours only, or colours with shapes.
  ui_piano: { level: music, setup: atThePiano, ui: (ctx) => pianoClose(ctx, { shapes: false }) },
  ui_piano_shapes: { level: music, setup: atThePiano, ui: (ctx) => pianoClose(ctx, { shapes: true }) },
  // The nurse's room: eye chart, scales, the couch, the notice about the doctor.
  nurse_room: { level: nurse, setup: ({ world }) => aim(world.camera, [4.9, 1.6, 5.7], 4, -7) },
  // The art room: easels, paintings drying on a line, the class painting.
  art_room: { level: art, setup: ({ world }) => aim(world.camera, [7.9, 1.6, 6.9], 26, -4) },
  // The entrance hall: the front doors, the map on the notice board, the stairs up into the dark.
  entrance_hall: { level: hall, setup: ({ world }) => aim(world.camera, [8.9, 1.6, 2.0], 131, 8) },
  // From the front doors: the stairs climb into the dark, where the bell rings.
  entrance_stairs: { level: hall, setup: ({ world }) => aim(world.camera, [2.1, 1.6, 8.2], 0, 18) },
  // The cloakroom: rows of grey coats; one has a red ribbon bow.
  cloakroom: { level: cloakroom, setup: ({ world }) => aim(world.camera, [5.4, 1.6, 4.45], 6, -10) },
};
