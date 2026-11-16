// Sister M. in the debug overlay (debug/overlay.js): her state line, and a
// label over her head that turns red while she sees your light.
export function nunDebug(game, look) {
  return {
    debugLine() {
      const { model, mode, sees, position, route, hunting } = look();
      if (!model) return 'NUN  none';
      const p = game.player.state.position;
      const distance = Math.hypot(p.x - position.x, p.z - position.z);
      const state = `${mode}${hunting ? ' (hunting: the way out)' : ''}`;
      return `NUN  ${state}  sees light ${sees ? 'yes' : 'no'}  ${distance.toFixed(1)} m  route ${route.length}  lamps lit ${game.lamps.lit().length}`;
    },
    drawDebug(ctx, project) {
      const { model, mode, sees, position } = look();
      if (!model || game.mode !== 'playing') return;
      const head = project(position.x, 2.2, position.z);
      if (!head) return;
      ctx.fillStyle = sees ? '#ff5a4a' : '#7dff8a';
      ctx.fillText(`nun: ${mode}${sees ? ' (sees your light)' : ''}`, head.x - 60, head.y - 18);
    },
  };
}
