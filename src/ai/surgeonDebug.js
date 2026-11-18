// Dr. Venn in the debug overlay (debug/overlay.js): his state line (what he
// does, how far, what he hears and how loud you are), and a label over his
// head that turns red while he hears you.
export function surgeonDebug(game, look) {
  return {
    debugLine() {
      const { model, mode, position, route, heard, you } = look();
      if (!model) return 'SURGEON  none';
      const p = game.player.state.position;
      const distance = Math.hypot(p.x - position.x, p.z - position.z);
      const hears = heard ? `${heard.you ? 'you' : 'a thing'} (${heard.kind})` : 'nothing';
      const loud = you ? `${you.kind} ${you.radius} m` : 'silent';
      return `SURGEON  ${mode}  ${distance.toFixed(1)} m  hears ${hears}  you: ${loud}  route ${route.length}`;
    },
    drawDebug(ctx, project) {
      const { model, mode, position, heard } = look();
      if (!model || game.mode !== 'playing') return;
      const head = project(position.x, 2.2, position.z);
      if (!head) return;
      ctx.fillStyle = heard?.you ? '#ff5a4a' : '#7dff8a';
      ctx.fillText(`surgeon: ${mode}${heard ? ` (hears ${heard.kind})` : ''}`, head.x - 60, head.y - 18);
    },
  };
}
