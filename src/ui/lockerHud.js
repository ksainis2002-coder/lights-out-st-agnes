// Inside a staff locker (approved still locker_inside): everything dark but
// the three vent slits of its door, which you see the room through, the
// steel lit faintly under each. Drawn first, so prompts and lines show over it.
const SLITS = { x: 70, top: 100, gap: 26, height: 18 };

export function drawLocker(ctx, game, W, H) {
  if (game.hiding.kind() !== 'locker') return false;
  const { x, top, gap, height } = SLITS;
  ctx.save();
  ctx.fillStyle = 'rgba(8,9,8,0.97)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 3; i++) {
    const y = top + i * gap;
    const grad = ctx.createLinearGradient(0, y, 0, y + height);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(0.3, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, W - 2 * x, height);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(150,160,150,0.22)';
  for (let i = 0; i < 3; i++) ctx.fillRect(x, top + i * gap + height, W - 2 * x, 1);
  ctx.restore();
  return true;
}
