// Content warning, shown on first launch (approved still: warning_en/el).
import { osdText, button, wrapText, fittedSize, COLORS } from '../osd.js';

const W = 480;
const ITEMS = ['warning.item.gore', 'warning.item.flicker', 'warning.item.childDeath'];

export function createWarningScreen(ui) {
  const { t, settings } = ui;
  // focus: 0 = CONTINUE, 1 = SETTINGS, 2 = language row
  let focus = 0;

  const actions = [() => ui.finishWarning('menu'), () => ui.finishWarning('settings')];

  function toggleLanguage() {
    settings.set('language', settings.get('language') === 'en' ? 'el' : 'en');
  }

  function draw(ctx) {
    ctx.fillStyle = '#050607';
    ctx.fillRect(0, 0, W, 270);
    const title = t('warning.title');
    osdText(ctx, title, W / 2, 36, fittedSize(ctx, title, 15, 440), COLORS.red, 'center');
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(W / 2 - 90, 56, 180, 1);
    osdText(ctx, t('warning.intro'), 92, 74, 10);
    ITEMS.forEach((key, i) => osdText(ctx, `–  ${t(key)}`, 104, 92 + i * 15, 10, COLORS.soft));
    wrapText(ctx, t('warning.note'), 9, 330).forEach((line, i) => {
      osdText(ctx, line, W / 2, 150 + i * 13, 9, COLORS.dim, 'center');
    });
    button(ctx, t('warning.continue'), W / 2 - 110, 190, 100, focus === 0);
    button(ctx, t('warning.settings'), W / 2 + 10, 190, 100, focus === 1);
    drawLanguage(ctx);
  }

  function drawLanguage(ctx) {
    const english = settings.get('language') === 'en';
    const color = focus === 2 ? COLORS.text : COLORS.dim;
    osdText(ctx, `${t('language.label')}:`, W / 2 - 34, 228, 9, color, 'center');
    const value = english ? `[${t('language.en')}]  ${t('language.el')}` : ` ${t('language.en')}  [${t('language.el')}]`;
    osdText(ctx, value, W / 2 + 26, 228, 9, COLORS.text, 'center');
  }

  const hits = () => [
    { x: W / 2 - 110, y: 190, w: 100, h: 15, hover: () => (focus = 0), click: actions[0] },
    { x: W / 2 + 10, y: 190, w: 100, h: 15, hover: () => (focus = 1), click: actions[1] },
    { x: W / 2 - 90, y: 224, w: 180, h: 16, hover: () => (focus = 2), click: toggleLanguage },
  ];

  function key(code) {
    if (code === 'ArrowDown' || code === 'ArrowUp') focus = focus === 2 ? 0 : 2;
    else if ((code === 'ArrowLeft' || code === 'ArrowRight') && focus === 2) toggleLanguage();
    else if (code === 'ArrowLeft' || code === 'ArrowRight') focus = 1 - focus;
    else if (code === 'Enter' || code === 'Space') focus === 2 ? toggleLanguage() : actions[focus]();
    else return false;
    return true;
  }

  return { name: 'warning', look: 'screen', draw, hits, key };
}
