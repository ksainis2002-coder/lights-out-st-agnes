// Every level the game can load, by id. Levels are data (JSON); see loader.js.
import testCorridor from './test_corridor.json';
import patientRoom from './patient_room.json';
import orphanageWing from './orphanage_wing.json';
import grounds from './grounds.json';
import schoolGround from './school_ground.json';
import schoolUpper from './school_upper.json';
import wardsGround from './wards_ground.json';
import wardsUpper from './wards_upper.json';
import chapel from './chapel.json';
import chapelCrypt from './chapel_crypt.json';

export const LEVELS = {
  test_corridor: testCorridor,
  patient_room: patientRoom,
  orphanage_wing: orphanageWing,
  grounds,
  school_ground: schoolGround,
  school_upper: schoolUpper,
  wards_ground: wardsGround,
  wards_upper: wardsUpper,
  chapel,
  chapel_crypt: chapelCrypt,
};

export const START_LEVEL = 'patient_room';
