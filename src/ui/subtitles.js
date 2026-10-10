// Subtitles for whispers and voices, as in the approved stills: a dark box at
// the bottom with "(speaker, whispering) line". Ghost children are labelled
// "a child" until the player has learned their name (progress flag
// "name_<id>"). Respects the subtitles setting.
import { osdText, wrapText } from './osd.js';

const W = 480;
const H = 270;

export function createSubtitles(game) {
  let current = null;

  function speakerLabel(speaker) {
    if (!speaker) return null;
    const known = game.progress.hasFlag(`name_${speaker}`);
    return game.i18n.t(known ? `speaker.${speaker}` : 'speaker.child');
  }

  return {
    // speaker: child id ("tommy") or null; key: i18n line; whisper: adds "whispering".
    show(key, { speaker = null, whisper = true, seconds = 4 } = {}) {
      current = { key, speaker, whisper, left: seconds };
      game.events.emit('subtitle.shown', current);
    },
    update(dt) {
      if (current && (current.left -= dt) <= 0) current = null;
    },
    current: () => current,
    draw(ctx) {
      if (!current || !game.settings.get('subtitles')) return false;
      const { t } = game.i18n;
      const who = speakerLabel(current.speaker);
      const manner = current.whisper ? t('speaker.whispering') : null;
      const tag = [who, manner].filter(Boolean).join(', ');
      const text = tag ? `(${tag}) ${t(current.key)}` : t(current.key);
      const lines = wrapText(ctx, text, 10, 380);
      const top = H - 30 - lines.length * 13;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(W / 2 - 200, top - 4, 400, lines.length * 13 + 8);
      lines.forEach((line, i) => osdText(ctx, line, W / 2, top + i * 13, 10, current.whisper ? '#c9d2e0' : '#e8f0ff', 'center'));
      return true;
    },
  };
}
