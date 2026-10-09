// Owns the 480×270 UI canvas and the current screen. Routes keyboard,
// mouse and wheel input to the screen while the game is in UI mode.
import { createWarningScreen } from './screens/warning.js';
import { createMenuScreen } from './screens/menu.js';
import { createSettingsScreen } from './screens/settings.js';

export const UI_WIDTH = 480;
export const UI_HEIGHT = 270;

const SCREENS = { warning: createWarningScreen, menu: createMenuScreen, settings: createSettingsScreen };

export function createUi(game, canvas, uiCanvas) {
  const ctx = uiCanvas.getContext('2d');
  let screen = null;
  let cleared = false;
  let hud = null;

  const api = {
    t: game.i18n.t,
    settings: game.settings,
    open,
    play: () => game.play(),
    hasSession: () => game.session.active,
    playTime: () => game.session.playTime,
    finishWarning(next) {
      game.store.write('flags', { ...(game.store.read('flags') ?? {}), warningSeen: true });
      open(next, { returnTo: 'menu' });
    },
  };

  function open(name, options = {}) {
    screen = SCREENS[name](api, options);
    cleared = false;
  }

  function close() {
    screen = null;
  }

  function toUi(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * UI_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * UI_HEIGHT,
    };
  }

  function hitAt(point) {
    return screen?.hits().find((hit) => point.x >= hit.x && point.x <= hit.x + hit.w && point.y >= hit.y && point.y <= hit.y + hit.h);
  }

  window.addEventListener('keydown', (event) => {
    if (!screen || event.code === 'F3') return;
    if (screen.key(event.code, event)) event.preventDefault();
  });
  canvas.addEventListener('mousemove', (event) => hitAt(toUi(event))?.hover?.());
  canvas.addEventListener('click', (event) => {
    if (!screen) return;
    const point = toUi(event);
    hitAt(point)?.click?.(point.x, point.y);
  });
  canvas.addEventListener('wheel', (event) => screen?.wheel?.(Math.sign(event.deltaY)), { passive: true });

  // Redraws the open screen. Returns true when the UI texture changed.
  function update() {
    if (!screen) {
      if (cleared && !hud) return false;
      ctx.clearRect(0, 0, UI_WIDTH, UI_HEIGHT);
      const drew = hud?.(ctx) ?? false;
      const changed = drew || !cleared;
      cleared = !drew;
      return changed;
    }
    ctx.clearRect(0, 0, UI_WIDTH, UI_HEIGHT);
    screen.draw(ctx);
    return true;
  }

  return {
    open,
    close,
    setHud: (fn) => (hud = fn),
    update,
    current: () => screen,
    look: () => screen?.look ?? 'game',
  };
}
