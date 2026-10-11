// Journal (J), as in the approved still ui_journal: a notebook with
// CLUES / DOCUMENTS / MAPS tabs; M opens it on MAPS. TAB or a click switches
// section, ▲▼ or a click picks a document, ◀▶ turn pages, H holds it at your
// side (see heldNote.js), J, M or ESC closes.
import { osdText, COLORS } from '../osd.js';
import { PAPER, PAPER_DARK, INK, INK_SOFT, BLOT, paperText, fitPaperText } from '../paper.js';
import { layoutPages } from './journalPages.js';
import { feeling } from '../../sanity/meter.js';
import { drawMapPage } from './journalMap.js';
import { keyName } from '../settingsRows.js';

const W = 480;
const H = 270;
const TABS = ['clues', 'documents', 'maps'];
// Text columns: left page, right page (paper is 22..248 high).
const SPREAD = [{ x: 84, top: 32, bottom: 226 }, { x: 252, top: 32, bottom: 226 }];

export function createJournalScreen(ui, options = {}) {
  const { t, game } = ui;
  let tab = Math.max(0, TABS.indexOf(options.tab));
  let doc = 0;
  let page = 0; // of the clues, or of the open document
  let pageCount = 1;
  const turn = (step) => (page = Math.max(0, Math.min(pageCount - 1, page + step)));

  // Clues run down the left page, then the right, then onto the next spread.
  function cluePages(ctx) {
    const clues = game.journal.clues();
    const blocks = [
      { text: t(`journal.wing.${game.world.level.wing}`), size: 12, lineHeight: 16, color: INK },
      { text: t('journal.feeling', { feeling: t(`feeling.${feeling(game.sanity.value())}`) }), size: 10, lineHeight: 12, gap: 8, color: INK_SOFT },
      ...clues.map((id) => ({ text: `– ${t(`clue.${id}`)}`, size: 10, lineHeight: 12, gap: 8, color: INK })),
    ];
    if (!clues.length) blocks.push({ text: t('journal.empty'), size: 10, lineHeight: 12, color: INK_SOFT });
    return layoutPages(ctx, SPREAD, blocks, 140);
  }

  // Long document texts continue on further pages of the right-hand side.
  function docPages(ctx, id) {
    const blocks = [
      { text: t(`doc.${id}.title`), size: 11, lineHeight: 13, gap: 7, color: INK },
      { text: t(`doc.${id}.body`).replaceAll(BLOT, t('document.unreadable')), size: 9, lineHeight: 11, color: INK },
    ];
    return layoutPages(ctx, [SPREAD[1]], blocks, 146);
  }

  function drawPage(ctx, pages) {
    page = Math.min(page, pages.length - 1);
    pageCount = pages.length;
    for (const line of pages[page]) paperText(ctx, line.text, line.x, line.y, line.size, line.color);
    if (pageCount < 2) return;
    osdText(ctx, `◀ ${page + 1}/${pageCount} ▶`, 392, 230, 8, INK_SOFT, 'right');
  }

  function drawClues(ctx) {
    drawPage(ctx, cluePages(ctx));
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
    drawPage(ctx, docPages(ctx, docs[doc]));
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
    const footer = TABS[tab] === 'documents' ? 'journal.footerDocuments' : 'journal.footer';
    osdText(ctx, t(footer, { hold: keyName(game.settings.get('keys').hold) }), W / 2, H - 16, 8, COLORS.dim, 'center');
  }

  const showTab = (i) => {
    tab = i;
    page = 0;
  };
  const showDoc = (i) => {
    doc = i;
    page = 0;
  };

  function hits() {
    const tabs = TABS.map((name, i) => ({ x: 80 + i * 72, y: 8, w: 68, h: 16, click: () => showTab(i) }));
    // The "◀ 1/3 ▶" corner: left half turns back, right half forward.
    const turns = [{ x: 350, y: 226, w: 25, h: 18, click: () => turn(-1) }, { x: 375, y: 226, w: 30, h: 18, click: () => turn(1) }];
    if (TABS[tab] !== 'documents') return [...tabs, ...turns];
    const rows = game.journal.documents().map((id, i) => ({ x: 80, y: 30 + i * 16, w: 150, h: 15, click: () => showDoc(i) }));
    return [...tabs, ...rows, ...turns];
  }

  // Pull the chosen document out to the player's side and go back to the game.
  function holdSelected() {
    game.journal.hold(game.journal.documents()[doc]);
    ui.resume();
  }

  function key(code, event) {
    const keys = game.settings.get('keys');
    const docs = TABS[tab] === 'documents' ? game.journal.documents().length : 0; // ▲▼ only pick documents on their tab
    if (code === 'Tab') showTab((tab + (event?.shiftKey ? 2 : 1)) % 3);
    else if (code === 'ArrowDown' && docs) showDoc((doc + 1) % docs);
    else if (code === 'ArrowUp' && docs) showDoc((doc + docs - 1) % docs);
    else if (code === 'ArrowRight') turn(1);
    else if (code === 'ArrowLeft') turn(-1);
    else if (code === keys.hold && docs) holdSelected();
    else if (['Escape', keys.journal, keys.map].includes(code)) ui.resume();
    else return false;
    return true;
  }

  return { name: 'journal', look: 'game', draw, hits, key, tab: () => TABS[tab], page: () => page, pageCount: () => pageCount, selectedDocument: () => game.journal.documents()[doc] };
}
