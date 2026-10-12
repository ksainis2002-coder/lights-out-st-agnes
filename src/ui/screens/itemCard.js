// "New item" card (approved still ui_itemCard): the first time a usable item
// is picked up, its icon, name, what it is and how to use it. The world waits;
// ENTER, SPACE, ESC or a click puts it away.
import { osdText, wrapText, capitals, COLORS } from '../osd.js';
import { keyName } from '../settingsRows.js';
import { drawIcon, ICONS } from '../icons.js';
import { itemDef, itemText } from '../../items/catalog.js';

const W = 480;
const H = 270;
const PANEL = { x: 120, y: 56, w: 240 }; // grows with its text
const ICON_SCALE = 3;

function panel(ctx, h) {
  ctx.fillStyle = 'rgba(5,7,10,0.9)';
  ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, h);
  ctx.strokeStyle = 'rgba(232,240,255,0.35)';
  ctx.strokeRect(PANEL.x + 0.5, PANEL.y + 0.5, PANEL.w - 1, h - 1);
}

export function createItemCardScreen(ui, { item }) {
  const { t, game } = ui;
  const openedAt = performance.now(); // the click that took the item must not close it

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    const body = wrapText(ctx, t(`card.${item}.body`), 9, PANEL.w - 24);
    const howY = 166 + body.length * 12;
    panel(ctx, howY + 34 - PANEL.y);
    osdText(ctx, t('card.title'), W / 2, PANEL.y + 8, 8, COLORS.dim, 'center');
    ctx.fillStyle = 'rgba(232,240,255,0.07)';
    ctx.fillRect(W / 2 - 26, 84, 52, 52);
    const icon = itemDef(item).icon;
    const rows = ICONS[icon].rows.length;
    drawIcon(ctx, icon, W / 2 - 24, 110 - (rows / 2) * ICON_SCALE, ICON_SCALE);
    osdText(ctx, capitals(itemText(game.i18n, item)), W / 2, 144, 12, COLORS.text, 'center');
    body.forEach((line, i) => osdText(ctx, line, W / 2, 162 + i * 12, 9, COLORS.soft, 'center'));
    const keys = game.settings.get('keys');
    const how = t(`card.${item}.use`, { flashlight: keyName(keys.flashlight), battery: keyName(keys.battery), inventory: keyName(keys.inventory), use: keyName(keys.use) });
    osdText(ctx, how, W / 2, howY, 9, COLORS.osdValue, 'center');
    osdText(ctx, t('card.footer'), W / 2, howY + 18, 8, COLORS.dim, 'center');
  }

  const close = () => performance.now() - openedAt > 400 && ui.resume();
  const hits = () => [{ x: 0, y: 0, w: W, h: H, click: close }];

  function key(code) {
    if (!['Enter', 'Space', 'Escape'].includes(code)) return false;
    ui.resume();
    return true;
  }

  return { name: 'itemCard', look: 'game', draw, hits, key, item: () => item };
}
