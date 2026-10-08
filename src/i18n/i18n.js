// Core string lookup. Pure (no imports) so tests can load it in Node.
// Tables are flat objects: { "warning.title": "CONTENT WARNING", ... }.
// Placeholders use braces: "Slot {n}" with t('save.slot', { n: 1 }).

export const FALLBACK_LANGUAGE = 'en';

export function createI18n(tables, language = FALLBACK_LANGUAGE) {
  let current = tables[language] ? language : FALLBACK_LANGUAGE;
  const listeners = new Set();

  function t(key, params) {
    const text = tables[current]?.[key] ?? tables[FALLBACK_LANGUAGE]?.[key];
    if (text === undefined) {
      console.warn(`i18n: missing key "${key}"`);
      return key;
    }
    return params ? fillParams(text, params) : text;
  }

  function setLanguage(next) {
    if (!tables[next]) throw new Error(`i18n: unknown language "${next}"`);
    current = next;
    listeners.forEach((fn) => fn(current));
  }

  return {
    t,
    setLanguage,
    getLanguage: () => current,
    languages: () => Object.keys(tables),
    onChange: (fn) => listeners.add(fn),
  };
}

function fillParams(text, params) {
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

/** Keys present in one table but not another, per language. Used by tests. */
export function findMissingKeys(tables) {
  const allKeys = new Set(Object.values(tables).flatMap((table) => Object.keys(table)));
  const missing = {};
  for (const [language, table] of Object.entries(tables)) {
    const gaps = [...allKeys].filter((key) => !(key in table) || table[key] === '');
    if (gaps.length) missing[language] = gaps;
  }
  return missing;
}
