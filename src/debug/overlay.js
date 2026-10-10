// Debug overlay (F3): fps, frame time, draw calls, triangles, location,
// sanity, player state, triggers, and per-enemy senses. Drawn on its own
// full-resolution canvas so it stays sharp over the PS1 image.
// Developer-only text: not player-facing, so not routed through i18n.
import * as THREE from 'three';
import { roomAt } from '../levels/loader.js';

const COLORS = { perf: '#7dff8a', info: '#d8e2ec', sanity: '#ffd84a', trigger: '#7fd7ff', enemy: '#ff8a7d' };
const LINE_HEIGHT = 22;

export function createDebugOverlay(game) {
  const canvas = document.createElement('canvas');
  canvas.id = 'debug-overlay';
  Object.assign(canvas.style, { position: 'absolute', pointerEvents: 'none', display: 'none' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const fps = { frames: 0, elapsed: 0, value: 0, frameMs: 0 };
  let visible = false;

  window.addEventListener('keydown', (event) => {
    if (event.code !== 'F3') return;
    event.preventDefault();
    setVisible(!visible);
  });

  function setVisible(value) {
    visible = value;
    canvas.style.display = visible ? 'block' : 'none';
  }

  function fit() {
    const { frame } = game.pipeline;
    if (canvas.width !== frame.width || canvas.height !== frame.height) {
      canvas.width = frame.width;
      canvas.height = frame.height;
    }
    Object.assign(canvas.style, { left: `${frame.x}px`, top: `${frame.y}px` });
  }

  function measure(dt) {
    fps.frames += 1;
    fps.elapsed += dt;
    if (fps.elapsed >= 0.5) {
      fps.value = Math.round(fps.frames / fps.elapsed);
      fps.frameMs = (fps.elapsed / fps.frames) * 1000;
      fps.frames = 0;
      fps.elapsed = 0;
    }
  }

  function textLines() {
    const { pipeline, player, world, triggers } = game;
    const p = player.state.position;
    const tris = pipeline.stats.triangles;
    const lines = [
      [`FPS ${fps.value}   frame ${fps.frameMs.toFixed(1)} ms   draws ${pipeline.stats.drawCalls}   tris ${(tris / 1000).toFixed(1)}k`, COLORS.perf],
      [`wing ${world.level.wing}   room ${roomAt(world.level, p) ?? '-'}   level ${world.level.id}`, COLORS.info],
      [`SANITY ${Math.round(game.sanity.value())} / 100   (${game.sanity.rate() >= 0 ? '+' : ''}${game.sanity.rate().toFixed(2)}/s)   rewinds ${game.collapse.rewinds()}`, COLORS.sanity],
      [`player (${p.x.toFixed(1)}, ${player.state.eyeHeight.toFixed(1)}, ${p.z.toFixed(1)})  stamina ${Math.round(player.state.stamina)}  noise ${player.state.noise}`, COLORS.info],
      [`TRIGGERS  ${triggers.active.size} active   [F3] toggle`, COLORS.trigger],
    ];
    if (game.ghosts) lines.push([game.ghosts.debugLine(), COLORS.enemy]);
    for (const enemy of game.enemies ?? []) lines.push([enemy.debugLine(), COLORS.enemy]);
    return lines;
  }

  function drawPanel(lines) {
    ctx.font = '14px "DejaVu Sans Mono", Consolas, "Courier New", monospace';
    ctx.textBaseline = 'top';
    const width = Math.max(...lines.map(([text]) => ctx.measureText(text).width)) + 20;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(12, 12, width, LINE_HEIGHT * lines.length + 12);
    lines.forEach(([text, color], i) => {
      ctx.fillStyle = color;
      ctx.fillText(text, 22, 20 + i * LINE_HEIGHT);
    });
  }

  function project(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(game.world.camera);
    if (v.z > 1 || v.z < -1) return null;
    return { x: ((v.x + 1) / 2) * canvas.width, y: ((1 - v.y) / 2) * canvas.height };
  }

  function drawTriggers() {
    ctx.strokeStyle = COLORS.trigger;
    ctx.fillStyle = COLORS.trigger;
    ctx.lineWidth = 2;
    for (const trigger of game.world.level.triggers) {
      const { min, max } = trigger.box;
      const floor = [[min.x, min.z], [max.x, min.z], [max.x, max.z], [min.x, max.z]];
      const points = floor.map(([x, z]) => project(x, 0.02, z));
      if (points.some((point) => !point)) continue;
      ctx.setLineDash(game.triggers.active.has(trigger.id) ? [] : [8, 6]);
      ctx.beginPath();
      points.forEach((point, i) => (i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      const label = project((min.x + max.x) / 2, 0.02, (min.z + max.z) / 2);
      if (label) ctx.fillText(`trig: ${trigger.id}`, label.x - 60, label.y + 6);
    }
  }

  function update(dt) {
    measure(dt);
    if (!visible) return;
    fit();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (game.mode === 'playing') drawTriggers();
    drawPanel(textLines());
    for (const enemy of game.enemies ?? []) enemy.drawDebug?.(ctx, project);
  }

  return { update, setVisible, isVisible: () => visible, canvas };
}
