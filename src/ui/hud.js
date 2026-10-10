// In-game HUD on the 480×270 UI layer. Approved stills: ui_prompt (centre dot
// and one prompt line when something usable is in view) and ui_inventory
// (TAB strip at the bottom). Plus short message lines. Nothing else.
import { osdText, COLORS } from './osd.js';
import { keyName } from './settingsRows.js';
import { drawIcon } from './icons.js';
import { ITEMS, INVENTORY_SLOTS } from '../items/catalog.js';

const W = 480;
const H = 270;
const SLOT = 36;

function panel(ctx, x, y, w, h, alpha) {
  ctx.fillStyle = `rgba(5,7,10,${alpha})`;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(232,240,255,0.35)';
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawPrompt(ctx, game) {
  const target = game.interaction.target();
  if (!target || game.inventory.isOpen()) return false;
  const prompt = target.prompt();
  if (!prompt) return false;
  ctx.fillStyle = 'rgba(232,240,255,0.8)';
  ctx.fillRect(W / 2 - 1, H / 2 - 1, 2, 2);
  const text = `${keyName(game.settings.get('keys').use)}  ${game.i18n.t(prompt.key, prompt.params)}`;
  ctx.font = 'bold 10px monospace';
  const width = ctx.measureText(text).width + 16;
  panel(ctx, W / 2 - width / 2, H / 2 + 22, width, 16, 0.55);
  osdText(ctx, text, W / 2, H / 2 + 25, 10, COLORS.text, 'center');
  return true;
}

function drawInventory(ctx, game) {
  const { inventory, i18n, settings } = game;
  if (!inventory.isOpen()) return false;
  const keys = settings.get('keys');
  const items = inventory.items();
  const x0 = W / 2 - (INVENTORY_SLOTS * (SLOT + 4)) / 2;
  const y0 = H - 78;
  panel(ctx, x0 - 8, y0 - 22, INVENTORY_SLOTS * (SLOT + 4) + 12, SLOT + 64, 0.72);
  osdText(ctx, i18n.t('inventory.title'), x0, y0 - 17, 9, COLORS.dim);
  const help = i18n.t('inventory.help', { close: keyName(keys.inventory), use: keyName(keys.use), combine: keyName(keys.combine) });
  osdText(ctx, help, x0 + INVENTORY_SLOTS * (SLOT + 4) - 4, y0 - 17, 8, COLORS.dim, 'right');
  for (let i = 0; i < INVENTORY_SLOTS; i++) {
    const x = x0 + i * (SLOT + 4);
    ctx.fillStyle = i === inventory.selectedIndex() && items[i] ? 'rgba(232,240,255,0.25)' : 'rgba(232,240,255,0.07)';
    ctx.fillRect(x, y0, SLOT, SLOT);
    if (items[i]) drawIcon(ctx, ITEMS[items[i]].icon, x + 2, y0 + 2, 2);
  }
  const selected = inventory.selectedItem();
  if (selected) {
    osdText(ctx, i18n.t(`item.${selected}.name`).toUpperCase(), x0, y0 + SLOT + 6, 10, COLORS.text);
    osdText(ctx, i18n.t(`item.${selected}.desc`), x0, y0 + SLOT + 19, 9, COLORS.soft);
  } else {
    osdText(ctx, i18n.t('inventory.empty'), x0, y0 + SLOT + 6, 9, COLORS.soft);
  }
  return true;
}

function drawMessage(ctx, game) {
  const message = game.messages.current();
  if (!message) return false;
  const y = game.inventory.isOpen() ? H - 112 : H - 34;
  osdText(ctx, game.i18n.t(message.key, message.params), W / 2, y, 10, COLORS.soft, 'center');
  return true;
}

// During a sanity collapse rewind: the VCR's "◀◀ REW" and a counter running back.
function drawRewind(ctx, game) {
  if (!game.collapse.rewinding()) return false;
  const s = Math.floor(game.collapse.counter());
  const pad = (n) => String(n).padStart(2, '0');
  osdText(ctx, '◀◀ REW', 16, 12, 14);
  osdText(ctx, `SP  ${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`, W - 16, 12, 12, COLORS.text, 'right');
  return true;
}

export function drawHud(ctx, game) {
  if (drawRewind(ctx, game)) {
    game.subtitles.draw(ctx);
    return true;
  }
  const subtitle = game.subtitles.draw(ctx);
  const prompt = drawPrompt(ctx, game);
  const inventory = drawInventory(ctx, game);
  const message = drawMessage(ctx, game);
  return prompt || inventory || message || subtitle;
}
