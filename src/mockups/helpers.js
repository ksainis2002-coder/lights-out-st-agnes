// Shared helpers for the mockup stills (camera aim, ghosts, subtitles).
import { PROPS } from '../props/catalog.js';
import { osdText, wrapText, COLORS } from '../ui/osd.js';

export const W = 480;
export const H = 270;

export function subtitle(ctx, text, { whisper = true } = {}) {
  const lines = wrapText(ctx, text, 10, 380);
  const top = H - 30 - lines.length * 13;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(W / 2 - 200, top - 4, 400, lines.length * 13 + 8);
  lines.forEach((line, i) => osdText(ctx, line, W / 2, top + i * 13, 10, whisper ? '#c9d2e0' : COLORS.text, 'center'));
}

// A look-at message as the HUD draws it (ui/hud.js): wrapped to the middle
// of the screen over a faint panel.
export function message(ctx, text) {
  const lines = wrapText(ctx, text, 10, 300);
  const top = H - 34 - (lines.length - 1) * 13;
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 16;
  ctx.fillStyle = 'rgba(5,7,10,0.45)';
  ctx.fillRect(W / 2 - width / 2, top - 3, width, lines.length * 13 + 4);
  lines.forEach((line, i) => osdText(ctx, line, W / 2, top + i * 13, 10, COLORS.soft, 'center'));
}

export function addGhost(world, [x, z], { opacity, rotation = 0, y = 0 } = {}) {
  const ghost = PROPS.ghostChild(world.textures, { opacity });
  ghost.position.set(x, y, z);
  ghost.rotation.y = rotation;
  world.scene.add(ghost);
}

export function aim(camera, [x, y, z], yawDeg, pitchDeg = 0, rollDeg = 0) {
  const rad = Math.PI / 180;
  camera.position.set(x, y, z);
  camera.rotation.set(pitchDeg * rad, yawDeg * rad, rollDeg * rad, 'YXZ');
}

// The camera at a point (metres, eye height y) looking at another.
export function look(world, [x, z], [tx, tz], y = 1.6, toY = 1.2) {
  const yaw = Math.atan2(-(tx - x), -(tz - z));
  const pitch = Math.atan2(toY - y, Math.hypot(tx - x, tz - z));
  aim(world.camera, [x, y, z], (yaw * 180) / Math.PI, (pitch * 180) / Math.PI);
}
