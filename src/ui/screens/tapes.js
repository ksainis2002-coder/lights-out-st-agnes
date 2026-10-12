// The three tapes, as in the approved still ui_save. Two modes:
//   save: "● REC / RECORD TO TAPE" at a tape recorder (asks before
//         recording over a used tape)
//   load: "◀◀ REWIND" from the main menu, with the checkpoint autosave on top.
import { osdText, fittedSize, COLORS } from '../osd.js';
import { MANUAL_SLOTS, AUTO_SLOT } from '../../save/saves.js';

const W = 480;
const H = 270;

function clock(seconds = 0) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function shortDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function createTapeScreen(ui, { mode = 'save', returnTo = 'menu' } = {}) {
  const { t, game } = ui;
  const slots = mode === 'save' ? MANUAL_SLOTS : [AUTO_SLOT, ...MANUAL_SLOTS];
  let focus = 0;
  let confirming = false;

  const entries = () => {
    const list = game.saves.list();
    return slots.map((slot) => list.find((entry) => entry.slot === slot));
  };

  function label(slot) {
    return slot === AUTO_SLOT ? t('tapes.auto') : t('tapes.tape', { n: MANUAL_SLOTS.indexOf(slot) + 1 });
  }

  function choose() {
    const entry = entries()[focus];
    if (mode === 'load') {
      if (entry.empty) return;
      game.loadFromTape(entry.slot);
      return ui.play();
    }
    if (!entry.empty && !confirming) {
      confirming = true;
      return;
    }
    game.saveToTape(entry.slot);
    ui.game.messages.show('msg.saved', { tape: label(entry.slot) });
    ui.resume();
  }

  function back() {
    if (confirming) confirming = false;
    else if (mode === 'save') ui.resume();
    else ui.open(returnTo);
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = mode === 'save' ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    if (mode === 'save') osdText(ctx, '● REC', 20, 16, 13, COLORS.red);
    else osdText(ctx, '◀◀ REW', 20, 16, 13, COLORS.text);
    osdText(ctx, t(mode === 'save' ? 'tapes.record' : 'tapes.rewind'), W / 2, 46, 14, COLORS.text, 'center');
    const top = mode === 'save' ? 84 : 72;
    entries().forEach((entry, i) => drawTape(ctx, entry, top + i * 38, i === focus));
    const note = confirming ? t('tapes.confirm', { tape: label(entries()[focus].slot) }) : mode === 'save' ? t('tapes.warning') : '';
    osdText(ctx, note, W / 2, 222, fittedSize(ctx, note, 9, 380), confirming ? COLORS.osdValue : COLORS.soft, 'center');
    const footer = t(mode === 'save' ? 'tapes.footerSave' : 'tapes.footerLoad');
    osdText(ctx, footer, W / 2, H - 18, fittedSize(ctx, footer, 8, 440), COLORS.dim, 'center');
  }

  function drawTape(ctx, entry, y, on) {
    ctx.fillStyle = on ? 'rgba(232,240,255,0.9)' : 'rgba(232,240,255,0.08)';
    ctx.fillRect(110, y, 260, 32);
    const color = on ? COLORS.ink : COLORS.text;
    const soft = on ? '#2a3040' : COLORS.soft;
    osdText(ctx, label(entry.slot), 122, y + 4, 11, color);
    if (entry.empty) return osdText(ctx, t('tapes.empty'), 122, y + 18, 9, soft);
    const place = t(`room.${entry.meta.room}`);
    osdText(ctx, place, 122, y + 18, fittedSize(ctx, place, 9, 170), soft);
    osdText(ctx, clock(entry.meta.playTime), 358, y + 4, 11, color, 'right');
    osdText(ctx, shortDate(entry.savedAt), 358, y + 18, 9, soft, 'right');
  }

  const hits = () => slots.map((slot, i) => ({
    x: 110, y: (mode === 'save' ? 84 : 72) + i * 38, w: 260, h: 32,
    hover: () => !confirming && (focus = i),
    click: choose,
  }));

  function key(code) {
    if (code === 'ArrowDown' && !confirming) focus = (focus + 1) % slots.length;
    else if (code === 'ArrowUp' && !confirming) focus = (focus + slots.length - 1) % slots.length;
    else if (code === 'Enter' || code === 'Space') choose();
    else if (code === 'Escape' || code === 'Backspace') back();
    else return false;
    return true;
  }

  return { name: mode, look: mode === 'save' ? 'game' : 'menu', draw, hits, key, focused: () => entries()[focus], confirming: () => confirming };
}
