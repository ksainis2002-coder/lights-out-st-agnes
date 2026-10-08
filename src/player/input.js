// Keyboard and mouse input. Actions are looked up through the rebindable
// key map in settings, so code never checks raw keys for gameplay.

export function createInput(target, settings) {
  const down = new Set();
  const pressedThisFrame = new Set();
  const look = { x: 0, y: 0 };
  const virtual = new Set(); // actions held by a bot, not the keyboard
  let enabled = false;

  window.addEventListener('keydown', (event) => {
    if (!down.has(event.code)) pressedThisFrame.add(event.code);
    down.add(event.code);
    if (enabled && isGameKey(event.code)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => down.delete(event.code));
  window.addEventListener('blur', () => down.clear());

  document.addEventListener('mousemove', (event) => {
    if (!enabled || document.pointerLockElement !== target) return;
    look.x += event.movementX;
    look.y += event.movementY;
  });

  function isGameKey(code) {
    return Object.values(settings.get('keys')).includes(code);
  }

  const codeFor = (action) => settings.get('keys')[action];

  return {
    isDown: (action) => enabled && (virtual.has(action) || down.has(codeFor(action))),
    setVirtual(action, held) {
      if (held) virtual.add(action);
      else virtual.delete(action);
    },
    wasPressed: (action) => enabled && pressedThisFrame.has(codeFor(action)),
    wasCodePressed: (code) => pressedThisFrame.has(code),
    takeLook() {
      const result = { x: look.x, y: look.y };
      look.x = 0;
      look.y = 0;
      return result;
    },
    addLook(x, y) {
      look.x += x;
      look.y += y;
    },
    setEnabled(value) {
      enabled = value;
      if (!value) {
        down.clear();
        virtual.clear();
      }
    },
    lockPointer() {
      target.requestPointerLock?.()?.catch?.(() => {});
    },
    endFrame() {
      pressedThisFrame.clear();
    },
  };
}
