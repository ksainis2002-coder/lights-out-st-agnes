// The rows of each settings tab. Each row knows its label, current value
// text, how ◀▶ changes it, what ENTER does, and its help line.
import { DEFAULT_KEYS } from '../save/settings.js';

const KEY_NAMES = {
  ShiftLeft: 'L-SHIFT', ShiftRight: 'R-SHIFT', ControlLeft: 'L-CTRL', ControlRight: 'R-CTRL',
  AltLeft: 'L-ALT', AltRight: 'R-ALT', Space: 'SPACE', Tab: 'TAB', Enter: 'ENTER', Backspace: 'BKSP',
  ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', CapsLock: 'CAPS',
};

export function keyName(code) {
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `NUM ${code.slice(6)}`;
  return code.toUpperCase();
}

const step = (value, dir, min, max, size) => {
  const next = Math.round((value + dir * size) / size) * size;
  return Math.min(max, Math.max(min, Number(next.toFixed(2))));
};

function choiceRow(s, t, name, options, valueKey) {
  return {
    label: () => t(`settings.${name}`),
    value: () => t(valueKey(s.get(name))),
    help: () => t(`settings.${name}.help`),
    change(dir) {
      const i = options.indexOf(s.get(name));
      s.set(name, options[(i + dir + options.length) % options.length]);
    },
  };
}

function toggleRow(s, t, name) {
  return {
    label: () => t(`settings.${name}`),
    value: () => t(s.get(name) ? 'settings.on' : 'settings.off'),
    help: () => t(`settings.${name}.help`),
    change: () => s.set(name, !s.get(name)),
  };
}

function numberRow(s, t, name, { min, max, size, format }) {
  return {
    label: () => t(`settings.${name}`),
    value: () => format(s.get(name)),
    help: () => t(`settings.${name}.help`),
    change: (dir) => s.set(name, step(s.get(name), dir, min, max, size)),
  };
}

function volumeRow(s, t, channel) {
  return {
    label: () => t(`settings.volume.${channel}`),
    value: () => `${Math.round(s.get('volume')[channel] * 100)}%`,
    help: () => t('settings.volume.help'),
    change(dir) {
      const volume = s.get('volume');
      volume[channel] = step(volume[channel], dir, 0, 1, 0.1);
      s.set('volume', volume);
    },
  };
}

function infoRow(t, name) {
  return {
    disabled: true,
    label: () => t(`settings.${name}`),
    value: () => t(`settings.${name}.value`),
    help: () => t(`settings.${name}.help`),
  };
}

function keyRow(s, t, action, screen) {
  return {
    label: () => t(`settings.action.${action}`),
    value: () => (screen.waitingFor() === action ? t('settings.key.waiting') : keyName(s.get('keys')[action])),
    help: () => t('settings.key.help'),
    activate: () => screen.waitForKey(action),
  };
}

// Assigns code to action; if another action used it, they swap keys.
export function rebind(settings, action, code) {
  const keys = settings.get('keys');
  const clash = Object.keys(keys).find((other) => other !== action && keys[other] === code);
  if (clash) keys[clash] = keys[action];
  keys[action] = code;
  settings.set('keys', keys);
}

export function buildTabs(settings, t, screen) {
  const s = settings;
  return [
    {
      id: 'game',
      rows: [
        choiceRow(s, t, 'language', ['en', 'el'], (v) => `settings.language.${v}`),
        choiceRow(s, t, 'difficulty', ['story', 'normal', 'hard'], (v) => `settings.difficulty.${v}`),
        toggleRow(s, t, 'comfortMode'),
        toggleRow(s, t, 'subtitles'),
        infoRow(t, 'hints'),
        infoRow(t, 'cloud'),
      ],
    },
    {
      id: 'controls',
      rows: [
        numberRow(s, t, 'mouseSensitivity', { min: 0.1, max: 5, size: 0.1, format: (v) => v.toFixed(1) }),
        toggleRow(s, t, 'invertY'),
        ...Object.keys(DEFAULT_KEYS).map((action) => keyRow(s, t, action, screen)),
        {
          label: () => t('settings.keysReset'),
          value: () => t('settings.keysReset.value'),
          help: () => t('settings.keysReset.help'),
          activate: () => s.set('keys', { ...DEFAULT_KEYS }),
        },
      ],
    },
    {
      id: 'audio',
      rows: ['music', 'effects', 'voices'].map((channel) => volumeRow(s, t, channel)),
    },
    {
      id: 'video',
      rows: [
        numberRow(s, t, 'fov', { min: 50, max: 110, size: 5, format: (v) => `${v}°` }),
        toggleRow(s, t, 'reduceEffects'),
        toggleRow(s, t, 'flickerOff'),
      ],
    },
  ];
}
