// Journal (J), as in the approved still ui_journal: a notebook with
// CLUES / DOCUMENTS / MAPS tabs; M opens it on MAPS. TAB or a click switches
// section, ▲▼ or a click picks a document, J, M or ESC closes.
import { osdText, COLORS } from '../osd.js';
import { PAPER, PAPER_DARK, INK, INK_SOFT, paperText, paperParagraph, fitPaperText } from '../paper.js';
import { feeling } from '../../sanity/meter.js';
import { drawMapPage } from './journalMap.js';

const W = 480;
const H = 270;
const TABS = ['clues', 'documents', 'maps'];

export function createJournalScreen(ui, options = {}) {
  const { t, game } = ui;
  let tab = Math.max(0, TABS.indexOf(options.tab));
  let doc = 0;

  function drawClues(ctx) {
    paperText(ctx, t(`journal.wing.${game.world.level.wing}`), 84, 32, 12);
    let y = paperParagraph(ctx, t('journal.feeling', { feeling: t(`feeling.${feeling(game.sanity.value())}`) }), 84, 48, 140, 10, 12, INK_SOFT) + 8;
    let x = 84;
    for (const id of game.journal.clues()) {
      if (y > 220 && x === 84) {
        x = 252;
        y = 32;
      }
      y = paperParagraph(ctx, `– ${t(`clue.${id}`)}`, x, y, 140, 10, 12) + 8;
    }
    if (!game.journal.clues().length) paperText(ctx, t('journal.empty'), 84, y, 10, INK_SOFT);
  }

  function drawDocuments(ctx) {
    const docs = game.journal.documents();
    if (!docs.length) return paperText(ctx, t('journal.empty'), 84, 32, 10, INK_SOFT);
    docs.forEach((id, i) => {
      if (i === doc) {
        ctx.fillStyle = 'rgba(42,36,24,0.12)';
        ctx.fillRect(80, 30 + i * 16, 150, 15);
      }
      paperText(ctx, fitPaperText(ctx, t(`doc.${id}.title`), 142, 10), 84, 32 + i * 16, 10);
    });
    const id = docs[doc];
    const bodyTop = paperParagraph(ctx, t(`doc.${id}.title`), 252, 32, 146, 11, 13) + 7; // long titles wrap
    paperParagraph(ctx, t(`doc.${id}.body`), 252, bodyTop, 146, 9, 11);
  }

  // The map of the wing you are in if you have it, else the first one found.
  function drawMaps(ctx) {
    const maps = game.journal.maps();
    if (!maps.length) return paperText(ctx, t('journal.noMaps'), 84, 32, 10, INK_SOFT);
    drawMapPage(ctx, ui, maps.includes(game.world.level.id) ? game.world.level.id : maps[0]);
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAPER;
    ctx.fillRect(70, 22, 340, 226);
    ctx.fillStyle = '#b8ae94';
    if (TABS[tab] !== 'maps') ctx.fillRect(238, 22, 2, 226); // a map is pasted across both pages
    TABS.forEach((name, i) => {
      ctx.fillStyle = i === tab ? PAPER : PAPER_DARK;
      ctx.fillRect(80 + i * 72, 8, 68, 16);
      osdText(ctx, t(`journal.tab.${name}`), 114 + i * 72, 11, 8, i === tab ? INK : '#4a4434', 'center');
    });
    [drawClues, drawDocuments, drawMaps][tab](ctx);
    osdText(ctx, t('journal.footer'), W / 2, H - 16, 8, COLORS.dim, 'center');
  }

  function hits() {
    const tabs = TABS.map((name, i) => ({ x: 80 + i * 72, y: 8, w: 68, h: 16, click: () => (tab = i) }));
    if (TABS[tab] !== 'documents') return tabs;
    const rows = game.journal.documents().map((id, i) => ({ x: 80, y: 30 + i * 16, w: 150, h: 15, click: () => (doc = i) }));
    return [...tabs, ...rows];
  }

  function key(code, event) {
    const keys = game.settings.get('keys');
    const docs = TABS[tab] === 'documents' ? game.journal.documents().length : 0; // ▲▼ only pick documents on their tab
    if (code === 'Tab') tab = (tab + (event?.shiftKey ? 2 : 1)) % 3;
    else if (code === 'ArrowDown' && docs) doc = (doc + 1) % docs;
    else if (code === 'ArrowUp' && docs) doc = (doc + docs - 1) % docs;
    else if (['Escape', keys.journal, keys.map].includes(code)) ui.resume();
    else return false;
    return true;
  }

  return { name: 'journal', look: 'game', draw, hits, key, tab: () => TABS[tab], selectedDocument: () => game.journal.documents()[doc] };
}
