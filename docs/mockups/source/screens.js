import { makeCanvas, quantise, vhs, present, osdText } from './post.js';
import { renderCorridor, W, H } from './game.js';

const UI_W = 480, UI_H = 270;

const TEXT = {
  en: {
    warnTitle: 'CONTENT WARNING',
    warnIntro: 'This game contains:',
    warnItems: ['graphic gore and surgery scenes', 'flashing lights and flicker', 'themes of child death'],
    warnNote: ['Flicker, flashes and jump scares can be reduced', 'at any time in Settings.'],
    cont: 'CONTINUE', settings: 'SETTINGS', lang: 'LANGUAGE',
  },
  el: {
    warnTitle: 'ΠΡΟΕΙΔΟΠΟΙΗΣΗ ΠΕΡΙΕΧΟΜΕΝΟΥ',
    warnIntro: 'Το παιχνίδι περιέχει:',
    warnItems: ['έντονες σκηνές αίματος και χειρουργείου', 'φώτα που αναβοσβήνουν', 'θέματα θανάτου παιδιών'],
    warnNote: ['Τα εφέ, οι λάμψεις και τα ξαφνικά τρομάγματα', 'μειώνονται οποτεδήποτε από τις Ρυθμίσεις.'],
    cont: 'ΣΥΝΕΧΕΙΑ', settings: 'ΡΥΘΜΙΣΕΙΣ', lang: 'ΓΛΩΣΣΑ',
  },
};

function button(g, label, x, y, w, active) {
  g.fillStyle = active ? '#e8f0ff' : 'rgba(232,240,255,0.08)';
  g.fillRect(x, y, w, 15);
  osdText(g, label, x + w / 2, y + 2, 10, active ? '#05070a' : '#e8f0ff', 'center');
}

function warning(lang) {
  const t = TEXT[lang];
  const c = makeCanvas(UI_W, UI_H), g = c.getContext('2d');
  g.fillStyle = '#050607'; g.fillRect(0, 0, UI_W, UI_H);
  osdText(g, t.warnTitle, UI_W / 2, 36, 15, '#d8382e', 'center');
  g.fillStyle = '#d8382e'; g.fillRect(UI_W / 2 - 90, 56, 180, 1);
  osdText(g, t.warnIntro, 92, 74, 10);
  t.warnItems.forEach((s, i) => osdText(g, '–  ' + s, 104, 92 + i * 15, 10, '#c9d2e0'));
  t.warnNote.forEach((s, i) => osdText(g, s, UI_W / 2, 150 + i * 13, 9, '#8892a2', 'center'));
  button(g, t.cont, UI_W / 2 - 110, 190, 100, true);
  button(g, t.settings, UI_W / 2 + 10, 190, 100, false);
  osdText(g, `${t.lang}:`, UI_W / 2 - 34, 228, 9, '#8892a2', 'center');
  osdText(g, lang === 'en' ? '[EN]  ΕΛ' : ' EN  [ΕΛ]', UI_W / 2 + 26, 228, 9, '#e8f0ff', 'center');
  vhs(g, UI_W, UI_H, { grain: 10, band: 2 });
  present(c);
}

function menu() {
  const { canvas: game } = renderCorridor();
  const c = makeCanvas(UI_W, UI_H), g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.filter = 'brightness(0.45) saturate(0.6)';
  g.drawImage(game, 0, 0, UI_W, UI_H);
  g.filter = 'none';
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, UI_W, UI_H);
  osdText(g, '▶ PLAY', 16, 12, 12);
  osdText(g, 'SP  0:00:00', UI_W - 16, 12, 12, '#e8f0ff', 'right');
  osdText(g, 'LIGHTS OUT', UI_W / 2, 60, 26, '#f2efe6', 'center');
  osdText(g, 'AT ST. AGNES', UI_W / 2, 90, 14, '#c9c2b2', 'center');
  const items = [['▶', 'PLAY', 'New game'], ['◀◀', 'REWIND', 'Continue / load tape'], ['■', 'SETUP', 'Settings'], ['⏏', 'EJECT', 'Extras / credits']];
  items.forEach(([icon, name, hint], i) => {
    const y = 136 + i * 22, on = i === 1;
    if (on) { g.fillStyle = 'rgba(232,240,255,0.9)'; g.fillRect(150, y - 3, 180, 18); }
    const col = on ? '#05070a' : '#e8f0ff';
    osdText(g, icon, 172, y, 11, col);
    osdText(g, name, 206, y, 11, col);
    if (on) osdText(g, hint, UI_W / 2, 228, 9, '#c9d2e0', 'center');
  });
  osdText(g, 'TRACKING ◀ ▮▮▮▮▮▯▯▯ ▶', UI_W / 2, UI_H - 18, 8, '#8892a2', 'center');
  quantise(g, UI_W, UI_H, 0.6);
  vhs(g, UI_W, UI_H, { grain: 26, band: 0.955, bleed: 1 });
  present(c);
}

function settings() {
  const c = makeCanvas(UI_W, UI_H), g = c.getContext('2d');
  g.fillStyle = '#0d1f9e'; g.fillRect(0, 0, UI_W, UI_H); // VCR on-screen-display blue
  osdText(g, 'SETUP MENU', 20, 14, 13);
  const tabs = ['GAME', 'CONTROLS', 'AUDIO', 'VIDEO'];
  tabs.forEach((tab, i) => {
    const x = 20 + i * 92;
    if (i === 0) { g.fillStyle = '#e8f0ff'; g.fillRect(x - 4, 36, 86, 16); }
    osdText(g, tab, x + 39, 38, 10, i === 0 ? '#0d1f9e' : '#e8f0ff', 'center');
  });
  g.fillStyle = '#e8f0ff'; g.fillRect(16, 54, UI_W - 32, 1);
  const rows = [['Language', '◀ English ▶'], ['Difficulty', '◀ Normal ▶'], ['Comfort mode', '◀ Off ▶'], ['Subtitles', '◀ On ▶'], ['Hints', 'Story only'], ['Cloud save', 'Sign in…']];
  rows.forEach(([name, value], i) => {
    const y = 66 + i * 22, on = i === 2;
    if (on) { g.fillStyle = 'rgba(232,240,255,0.18)'; g.fillRect(16, y - 4, UI_W - 32, 20); osdText(g, '▶', 22, y, 10); }
    osdText(g, name, 40, y, 10, i === 4 ? '#8fa0e8' : '#e8f0ff');
    osdText(g, value, UI_W - 30, y, 10, i === 4 ? '#8fa0e8' : '#ffe27a', 'right');
  });
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(16, 204, UI_W - 32, 30);
  osdText(g, 'Fewer jump scares, slower enemies,', 26, 208, 9, '#c9d2ff');
  osdText(g, 'flicker and flashes off.', 26, 220, 9, '#c9d2ff');
  osdText(g, '◀▶ CHANGE    ESC BACK', UI_W - 20, UI_H - 18, 9, '#c9d2ff', 'right');
  vhs(g, UI_W, UI_H, { grain: 12, band: 2, bleed: 1 });
  present(c);
}

function game() {
  const { canvas, ctx } = renderCorridor();
  quantise(ctx, W, H, 1);
  vhs(ctx, W, H, { grain: 14, band: 2, bleed: 1 });
  return present(canvas);
}

function debug() {
  const o = game();
  o.font = '14px "DejaVu Sans Mono", monospace';
  o.textBaseline = 'top';
  const lines = [
    ['FPS 60   frame 4.1 ms   draws 38   tris 1.9k', '#7dff8a'],
    ['wing dorms   room corridor_A   seed 42', '#d8e2ec'],
    ['SANITY 72 / 100   (−0.4/s dark)', '#ffd84a'],
    ['player (1.6, 0.0, 7.9)  stamina 100  noise 0', '#d8e2ec'],
    ['TRIGGERS  3 active   [F3] toggle', '#7fd7ff'],
    ['test_dummy  PATROL  hear 8 m  sight 12 m / 70°', '#ff8a7d'],
  ];
  o.fillStyle = 'rgba(0,0,0,0.6)'; o.fillRect(12, 12, 470, 22 * lines.length + 12);
  lines.forEach(([s, col], i) => { o.fillStyle = col; o.fillText(s, 22, 20 + i * 22); });
  // trigger volume on the floor
  o.strokeStyle = '#7fd7ff'; o.lineWidth = 2; o.setLineDash([8, 6]);
  o.beginPath(); o.moveTo(470, 540); o.lineTo(810, 540); o.lineTo(760, 470); o.lineTo(520, 470); o.closePath(); o.stroke();
  o.setLineDash([]); o.fillStyle = '#7fd7ff'; o.fillText('trig: lullaby_start', 560, 548);
  // test enemy: hearing radius, view cone, state label
  o.strokeStyle = 'rgba(255,138,125,0.9)';
  o.beginPath(); o.ellipse(700, 430, 150, 26, 0, 0, Math.PI * 2); o.stroke();
  o.fillStyle = 'rgba(255,216,74,0.18)';
  o.beginPath(); o.moveTo(700, 400); o.lineTo(560, 470); o.lineTo(640, 470); o.closePath(); o.fill();
  o.fillStyle = '#ff8a7d'; o.fillRect(694, 360, 12, 60);
  o.fillText('test_dummy · PATROL', 640, 336);
}

const screens = { warning_en: () => warning('en'), warning_el: () => warning('el'), menu, settings, game, debug };
const name = new URLSearchParams(location.search).get('s') || 'game';
screens[name]();
document.body.dataset.ready = '1';
