// Nora on the radio (0.4): she talks into a pocket recorder as she goes and
// the building's old valve radios pick her up. Each radio plays once, the
// first time you come near it: static, then her lines as subtitles, one after
// another. She never answers. Level data:
//   "radios": [{ "id": "radio_day", "at": [c, r], "hear": 4, "lines": ["nora.dayRoom"] }]
// The flag heard_<id> keeps a radio from playing twice; her first line gives
// her name (name_nora), so later ones are labelled with it.
import * as THREE from 'three';

const LINE_SECONDS = 6.5;
const STATIC_VOLUME = 0.35;

export function createRadios(game) {
  let playing = null; // { radio, line, left, position }

  function start(level, radio) {
    const position = new THREE.Vector3(radio.at[0] * level.cellSize, 1.0, radio.at[1] * level.cellSize);
    playing = { radio, line: -1, left: 0.8, position };
    game.progress.setFlag(`heard_${radio.id}`);
    game.sfx.play('radio_static', { position, volume: STATIC_VOLUME });
    game.events.emit('radio.started', { id: radio.id });
  }

  function nextLine() {
    playing.line += 1;
    if (playing.line >= playing.radio.lines.length) {
      playing = null;
      return;
    }
    game.subtitles.show(playing.radio.lines[playing.line], { speaker: 'nora', whisper: false, seconds: LINE_SECONDS });
    game.sfx.play('radio_static', { position: playing.position, volume: STATIC_VOLUME * 0.6 });
    game.progress.setFlag('name_nora'); // her first words are her name
    playing.left = LINE_SECONDS + 0.4;
  }

  function update(dt) {
    if (playing) {
      playing.left -= dt;
      if (playing.left <= 0) nextLine();
      return;
    }
    const level = game.world.level;
    const p = game.player.state.position;
    for (const radio of level.radios) {
      if (game.progress.hasFlag(`heard_${radio.id}`)) continue;
      const near = Math.hypot(radio.at[0] * level.cellSize - p.x, radio.at[1] * level.cellSize - p.z) <= radio.hear;
      if (near) return start(level, radio);
    }
  }

  game.events.on('level.loaded', () => { playing = null; });
  return { update, playing: () => playing?.radio.id ?? null };
}
