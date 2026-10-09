// Sets the hands of every wall clock in the level to the player's real local
// time. Local clock only, never the network (CLAUDE.md: real-clock events).

// Hand angles in radians, clockwise from twelve as seen from the front.
export function handAngles(date) {
  const minutes = date.getMinutes() + date.getSeconds() / 60;
  const hours = (date.getHours() % 12) + minutes / 60;
  return { hours: (hours / 12) * Math.PI * 2, minutes: (minutes / 60) * Math.PI * 2 };
}

export function updateClocks(root, date = new Date()) {
  const angles = handAngles(date);
  root.traverse((object) => {
    const hands = object.userData.clockHands;
    if (!hands) return;
    // rotation.z turns counter-clockwise when seen from the front, so negate.
    hands.hours.rotation.z = -angles.hours;
    hands.minutes.rotation.z = -angles.minutes;
  });
}
