// Nora's poses on her feet (noraStanding.js). Owner 2026-11-19: a real
// stance, not a statue: her weight on one leg, or mid-step; her arms by where
// her hands go (hugging herself, cold and afraid; one hand on the other arm;
// or loose at her side); her head turned.
// Legs (right, left): lift (the hip, + forward), out (from the middle),
//   bend (the knee), toe (the foot's tip up, the heel off the floor < 0).
// Body: hips (her pelvis tilts: < 0 her right hip up, her weight on it),
//   sway (her shoulders tilt the other way), lean (stooped forward), twist,
//   turn (radians). Head: look (+ to her left), nod (+ down), tilt.
// Arms (rightArm, leftArm), in her torso's frame (metres from 4 cm above her
//   hip joints; x her left, z forward): wrist (where it goes), elbow (the way
//   the elbow points), palm (the way the palm faces).

// Loose at her side, the elbow a little bent, the palm to her thigh.
const loose = (side) => ({ wrist: [side * 0.198, -0.03, 0.05], elbow: [side * 0.2, 0, -1], palm: [-side, 0, -0.3] });

// Hugging herself: each forearm across her middle, the hand round the other arm.
const hugging = {
  rightArm: { wrist: [0.07, 0.19, 0.17], elbow: [-0.45, -1, 0.3], palm: [0.2, 0, -1] },
  leftArm: { wrist: [-0.07, 0.26, 0.2], elbow: [0.45, -1, 0.35], palm: [-0.2, 0, -1] },
};

export const POSES = {
  // Standing, her weight on her right leg, her left knee easy; her left hand on her right arm.
  stand: {
    right: { lift: 0, out: 0.035, bend: 0.0 },
    left: { lift: 0.1, out: 0.11, bend: 0.2, toe: 0.05 },
    hips: -0.045, sway: 0.035, lean: 0.05, twist: 0.08,
    rightArm: loose(-1),
    leftArm: { wrist: [-0.105, 0.135, 0.14], elbow: [1, -0.7, 0.2], palm: [-1, 0, -0.4] },
    look: -0.15, nod: 0.12, tilt: 0.05,
  },
  // Following you, mid-step (her left foot forward), hugging herself, stooped,
  // her head turned to look back past her shoulder for him.
  follow: {
    right: { lift: -0.2, out: 0.03, bend: 0.28, toe: 0.22 },
    left: { lift: 0.3, out: 0.03, bend: 0.08 },
    hips: 0.02, sway: -0.02, lean: 0.12, twist: 0.2,
    ...hugging,
    look: 0.45, nod: 0.05, tilt: -0.06,
  },
  // By the window in the morning, her weight on her left leg, one arm across her.
  window: {
    right: { lift: 0.08, out: 0.1, bend: 0.18, toe: 0.04 },
    left: { lift: 0, out: 0.035, bend: 0.0 },
    hips: 0.045, sway: -0.035, lean: 0.03, twist: -0.05,
    rightArm: { wrist: [0.105, 0.135, 0.14], elbow: [-1, -0.7, 0.2], palm: [1, 0, -0.4] },
    leftArm: loose(1),
    look: 0.1, nod: -0.02, tilt: -0.04,
  },
};

// Walking as she follows you, hugging herself (ai/noraFollow.js): `phase`
// (radians) runs through each pair of steps, `amount` (0 standing … 1 a full
// stride). Each leg swings forward and back; the leg swinging back bends its
// knee and comes off its heel; she leans a little more the faster she goes.
export function walking(phase, amount) {
  const swing = Math.sin(phase);
  const leg = (s) => ({
    lift: amount * 0.32 * s,
    out: 0.03,
    bend: amount * (0.06 + 0.42 * Math.max(0, -s) + 0.12 * Math.max(0, Math.cos(phase))),
    toe: amount * 0.25 * Math.max(0, -s),
  });
  return {
    ...POSES.follow,
    right: leg(-swing),
    left: leg(swing),
    hips: 0.03 * amount * swing,
    sway: -0.02 * amount * swing,
    lean: 0.08 + 0.06 * amount,
    twist: 0.08 * amount * swing,
    look: 0.15 * Math.sin(phase * 0.25), // now and then a glance back
    nod: 0.08,
  };
}
