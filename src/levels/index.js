// Every level the game can load, by id. Levels are data (JSON); see loader.js.
import testCorridor from './test_corridor.json';
import patientRoom from './patient_room.json';
import orphanageWing from './orphanage_wing.json';

export const LEVELS = {
  test_corridor: testCorridor,
  patient_room: patientRoom,
  orphanage_wing: orphanageWing,
};

export const START_LEVEL = 'patient_room';
