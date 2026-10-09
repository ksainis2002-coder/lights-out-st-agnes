// All game sounds by name. Files live in assets/sounds/ (credits in
// assets/CREDITS.md); Vite turns each into a relative URL at build time.
// Numbered files form a group: play('step_wood') picks one of step_wood_1…6.
import { loadSound } from './sounds.js';

const files = import.meta.glob('../../assets/sounds/*.ogg', { query: '?url', import: 'default', eager: true });

// name → list of URLs ("step_wood" → [step_wood_1.ogg, …], "heartbeat" → [heartbeat.ogg])
const GROUPS = {};
for (const [path, url] of Object.entries(files)) {
  const file = path.split('/').pop().replace('.ogg', '');
  const name = file.replace(/_\d+$/, '');
  (GROUPS[name] ??= []).push(url);
}

export const SOUND_NAMES = Object.keys(GROUPS);

export function createLibrary(mixer) {
  const buffers = new Map(); // url → AudioBuffer once decoded

  async function preload() {
    const ctx = mixer.context();
    const urls = Object.values(GROUPS).flat();
    await Promise.all(urls.map(async (url) => buffers.set(url, await loadSound(ctx, url))));
  }

  // A random decoded buffer of the group, or null while still loading.
  function pick(name) {
    const urls = GROUPS[name];
    if (!urls) throw new Error(`Unknown sound "${name}"`);
    return buffers.get(urls[Math.floor(Math.random() * urls.length)]) ?? null;
  }

  return { preload, pick, has: (name) => name in GROUPS };
}
