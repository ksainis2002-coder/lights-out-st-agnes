// Every level the game can load, by id. Levels are data (JSON); see loader.js.
import testCorridor from './test_corridor.json';
import patientRoom from './patient_room.json';
import orphanageWing from './orphanage_wing.json';
import grounds from './grounds.json';
import schoolGround from './school_ground.json';

export const LEVELS = {
  test_corridor: testCorridor,
  patient_room: patientRoom,
  orphanage_wing: orphanageWing,
  grounds,
  school_ground: schoolGround,
};

export const START_LEVEL = 'patient_room';
