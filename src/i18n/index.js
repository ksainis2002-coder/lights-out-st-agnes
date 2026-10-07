// The game's shared i18n instance. All player-facing text goes through t().
import { createI18n } from './i18n.js';
import en from './en.json';
import el from './el.json';

export const i18n = createI18n({ en, el });
export const t = i18n.t;
