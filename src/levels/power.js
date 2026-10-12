// Power cuts: level lights in "group": "mains" go dark while the level's
// power rule says so, and come back when it is fixed. Sanity counts only
// lights that are on.
// Level data: "power": { "cutWhen": "<flag>", "restoredWhen": "<flag>" }
export function setupPower(game) {
  function apply() {
    const { level, levelGroup } = game.world;
    const rule = level.power;
    const cut = Boolean(rule) && game.progress.hasFlag(rule.cutWhen) && !game.progress.hasFlag(rule.restoredWhen);
    for (const light of level.lights) light.off = cut && light.group === 'mains';
    levelGroup?.traverse((object) => {
      if (object.userData.light) object.visible = !object.userData.light.off;
    });
    return cut;
  }

  game.events.on('level.loaded', apply);
  game.events.on('puzzle.solved', () => {
    const wasCut = game.world.level.lights.some((light) => light.off);
    const cut = apply();
    if (cut && !wasCut) {
      game.messages.notice('msg.lightsOut', null, 5);
      game.events.emit('power.cut');
    }
    if (!cut && wasCut) game.events.emit('power.restored');
  });
  game.powerIsCut = () => game.world.level.lights.some((light) => light.off);
}
