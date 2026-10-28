// Maggie's chalk (design 0.3, approved stills chalk_hint and chalk_taunt):
// fresh capitals appear on a corridor board while your back is turned, and
// you hear them being written. Mostly a hint: once you have tried a puzzle
// and then made no progress for three minutes (nothing new found, read or
// done), and the watcher's after her second catch. About one board in four
// a taunt, once she is awake, and never while she is near you: "SHE'S BEHIND
// YOU" is always a lie. A board keeps its words (saved) until Maggie writes
// over it. Nothing moves at you and nothing stings, so comfort mode keeps it.
// Level data: "chalk": {
//   "boards": ["chalk_library", ...],                      (ids of chalkBoard props)
//   "hints": [{ "id": "library", "stuck": "tried_libraryIndex", "solved": "puzzle_library",
//               "text": "chalk.hint.library" }, { "id": "watcher", "catches": 2, "text": ... }],
//   "taunts": { "after": "watcher_awake", "lines": ["chalk.taunt.behind", ...] } }
import * as THREE from 'three';
import { findProp } from '../props/place.js';
import { writeOnBoard } from '../props/chalkBoard.js';
import { roomAt } from '../levels/loader.js';
import { inView } from '../ai/gaze.js';

const STUCK_SECONDS = 180; // no progress this long on a tried puzzle: its hint is due
const WRITE_RANGE = 6; // metres: she writes on a board this near you
const WRITE_GAP = 60; // seconds between two boards
const TAUNT_GAP = 240; // seconds from the last board (or the watcher waking) to a taunt
const HINTS_PER_TAUNT = 3; // about one board in four is a taunt
const LIE_DISTANCE = 10; // metres: no taunt while the watcher is nearer than this
const SCRATCHES = [0, 0.35, 0.8, 1.2, 1.7]; // seconds: the chalk heard on the board
const SAVED = 'chalk'; // progress value: { boards: { id: key }, order: [ids], hints: [ids], taunts: n }

const nothingWritten = () => ({ boards: {}, order: [], hints: [], taunts: 0 });

export function createChalk(game) {
  let boards = []; // { id, object, position, room, points }
  let saved = nothingWritten();
  let clock = 0;
  let steps = 0;
  let calmSince = 0; // the clock at the last step forward
  let lastWrite = -Infinity;
  let awakeSince = null;
  let scratch = null; // { position, t, next }

  const data = () => game.world.level.chalk;

  function draw(board) {
    const key = saved.boards[board.id];
    writeOnBoard(board.object, key ? game.i18n.t(key) : '');
  }

  function setUp() {
    const level = game.world.level;
    saved = { ...nothingWritten(), ...game.progress.getValue(SAVED, {}) };
    boards = (level.chalk?.boards ?? []).map((id) => {
      const object = findProp(game.world.levelGroup, id);
      object.updateWorldMatrix(true, false);
      const points = [-0.75, 0, 0.75].map((x) => object.localToWorld(new THREE.Vector3(x, 1.5, 0.1)));
      return { id, object, position: points[1], room: roomAt(level, points[1]), points };
    });
    boards.forEach(draw);
    steps = game.progress.steps();
    calmSince = clock;
    lastWrite = -Infinity;
    awakeSince = null;
    scratch = null;
  }

  function hintDue(hint) {
    if (saved.hints.includes(hint.id)) return false;
    if (hint.catches) return (game.watcher?.state().catches ?? 0) >= hint.catches;
    const { progress } = game;
    return progress.hasFlag(hint.stuck) && !progress.hasFlag(hint.solved) && clock - calmSince >= STUCK_SECONDS;
  }

  function watcherNear() {
    const her = game.watcher?.position();
    const p = game.player.state.position;
    return Boolean(her) && Math.hypot(her.x - p.x, her.z - p.z) < LIE_DISTANCE;
  }

  function tauntDue(taunts) {
    if (!taunts || awakeSince === null || saved.taunts >= taunts.lines.length) return false;
    if (saved.taunts * HINTS_PER_TAUNT > saved.hints.length) return false;
    return clock - Math.max(lastWrite, awakeSince) >= TAUNT_GAP && !watcherNear();
  }

  // The words due next, if any: a hint first, else a taunt.
  function nextWords() {
    const { hints = [], taunts } = data();
    const hint = hints.find(hintDue);
    if (hint) return { key: hint.text, hint: hint.id };
    if (tauntDue(taunts)) return { key: taunts.lines[saved.taunts], taunt: true };
    return null;
  }

  // A board in your room, near you, that you can't see: a clean one first,
  // else the one written longest ago; the nearest of those.
  function boardToWrite() {
    const p = game.player.state.position;
    const here = roomAt(game.world.level, p);
    const distance = (board) => Math.hypot(board.position.x - p.x, board.position.z - p.z);
    const free = boards.filter((board) => board.room === here && distance(board) <= WRITE_RANGE && !inView(game, board.points));
    const age = (board) => saved.order.indexOf(board.id); // -1: never written
    return free.sort((a, b) => age(a) - age(b) || distance(a) - distance(b))[0] ?? null;
  }

  function write(board, words) {
    saved.boards[board.id] = words.key;
    saved.order = [...saved.order.filter((id) => id !== board.id), board.id];
    if (words.hint) saved.hints.push(words.hint);
    if (words.taunt) saved.taunts += 1;
    game.progress.setValue(SAVED, saved);
    draw(board);
    lastWrite = clock;
    scratch = { position: board.position, t: 0, next: 0 };
    game.events.emit('chalk.written', { board: board.id, key: words.key, taunt: Boolean(words.taunt), position: board.position });
  }

  function updateScratch(dt) {
    if (!scratch) return;
    while (scratch.next < SCRATCHES.length && scratch.t >= SCRATCHES[scratch.next]) {
      game.events.emit('chalk.scratch', { position: scratch.position });
      scratch.next += 1;
    }
    scratch.t += dt;
    if (scratch.next === SCRATCHES.length) scratch = null;
  }

  function update(dt) {
    clock += dt;
    updateScratch(dt);
    const chalk = data();
    if (!chalk || game.watcherIntro?.active() || game.collapse.active()) return; // not mid-grab or mid-beat
    const now = game.progress.steps();
    if (now !== steps) {
      steps = now;
      calmSince = clock;
    }
    const after = chalk.taunts?.after;
    if (awakeSince === null && (!after || game.progress.hasFlag(after))) awakeSince = clock;
    if (clock - lastWrite < WRITE_GAP) return;
    const words = nextWords();
    const board = words && boardToWrite();
    if (board) write(board, words);
  }

  function debugLine() {
    if (!data()) return 'CHALK  no boards here';
    const next = nextWords()?.key.replace('chalk.', '') ?? '-';
    const written = Object.keys(saved.boards).length;
    return `CHALK  calm ${Math.floor(clock - calmSince)}/${STUCK_SECONDS} s   next ${next}   written ${written}/${boards.length}   taunts ${saved.taunts}`;
  }

  game.events.on('level.loaded', setUp);
  game.i18n.onChange(() => boards.forEach(draw));
  setUp();

  return {
    update,
    debugLine,
    written: () => ({ ...saved.boards }), // board id → text key (tests)
    text: (id) => boards.find((board) => board.id === id)?.object.getObjectByName('chalk').userData.text ?? null,
  };
}
