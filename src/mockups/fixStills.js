// Before/after stills for small fixes the owner asked for. Door lintels
// (owner 2026-10-27, "2y"): the wall's lower paint band showed above school
// doors; the lintel now carries the wall's upper part, as the wall beside it.
import { look } from './helpers.js';
import schoolGround from '../levels/school_ground.json';
import schoolUpper from '../levels/school_upper.json';

export const FIX_STILLS = {
  // The staff room door from the corridor, by flashlight.
  lintel_staff_room: { level: schoolGround, setup: ({ world }) => look(world, [52.2, 12.6], [51.0, 14.4], 1.6, 2.2) },
  // Upstairs: Classroom 3's door down the corridor.
  lintel_upstairs: { level: schoolUpper, setup: ({ world }) => look(world, [16.6, 12.6], [15.0, 14.4], 1.6, 2.2) },
};
