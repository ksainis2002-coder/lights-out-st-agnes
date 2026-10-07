// Shared save and settings instances backed by localStorage.
// A Firebase cloud adapter joins here in 0.6; local saves never need it.
import { createStore } from './storage.js';
import { createSaves } from './saves.js';
import { createSettings } from './settings.js';

export const store = createStore();
export const saves = createSaves(store);
export const settings = createSettings(store);
