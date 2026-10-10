// Floor footprints (width × depth in metres, prop-local) of props the player
// cannot walk through. Small clutter (papers, blocks, toys) stays walkable.
// A prop can opt out with "solid": false in level data.
// Each gives { size: [w, d], offset: [x, z] } for the prop's options.
const FOOTPRINTS = {
  bed: () => ({ size: [0.9, 1.9] }),
  table: () => ({ size: [1.1, 0.7] }),
  cubbies: () => ({ size: [1.6, 0.35] }),
  // A toppled chair lies on its back, reaching behind where it stood.
  chair: (options) => (options?.toppled ? { size: [0.42, 0.94], offset: [0, -0.22] } : { size: [0.42, 0.42] }),
};

// Axis-aligned boxes in world x/z: { minX, maxX, minZ, maxZ }.
export function propObstacles(props, cellSize) {
  return props.filter((prop) => FOOTPRINTS[prop.type] && prop.solid !== false).map((prop) => {
    const { size: [w, d], offset: [ox, oz] = [0, 0] } = FOOTPRINTS[prop.type](prop.options);
    const angle = ((prop.rotation ?? 0) * Math.PI) / 180;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const halfX = (w * Math.abs(cos) + d * Math.abs(sin)) / 2, halfZ = (w * Math.abs(sin) + d * Math.abs(cos)) / 2;
    // Same rotation as the prop (three.js rotation.y): local x/z to world.
    const x = prop.at[0] * cellSize + ox * cos + oz * sin;
    const z = prop.at[1] * cellSize - ox * sin + oz * cos;
    return { minX: x - halfX, maxX: x + halfX, minZ: z - halfZ, maxZ: z + halfZ };
  });
}
