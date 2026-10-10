// Journal (J), as in the approved still ui_journal: a notebook with
// CLUES / DOCUMENTS / MAPS tabs. TAB switches section, ▲▼ picks a document,
// J or ESC closes.
import { osdText, COLORS } from '../osd.js';
import { PAPER, PAPER_DARK, INK, INK_SOFT, paperText, paperParagraph } from '../paper.js';
import { feeling } from '../../sanity/meter.js';

const W = 480;
const H = 270;
const TABS = ['clues', 'documents', 'maps'];

export function createJournalScreen(ui) {
  const { t, game } = ui;
  let tab = 0;
  let doc = 0;

  function drawClues(ctx) {
    paperText(ctx, t(`journal.wing.${game.world.level.wing}`), 84, 32, 12);
    paperText(ctx, t('journal.feeling', { feeling: t(`feeling.${feeling(game.sanity.value())}`) }), 84, 48, 10, INK_SOFT);
    let y = 66;
    let x = 84;
    for (const id of game.journal.clues()) {
      if (y > 220 && x === 84) {
        x = 252;
        y = 32;
      }
      y = paperParagraph(ctx, `– ${t(`clue.${id}`)}`, x, y, 140, 10, 12) + 8;
    }
    if (!game.journal.clues().length) paperText(ctx, t('journal.empty'), 84, 66, 10, INK_SOFT);
  }

  function drawDocuments(ctx) {
    const docs = game.journal.documents();
    if (!docs.length) return paperText(ctx, t('journal.empty'), 84, 32, 10, INK_SOFT);
    docs.forEach((id, i) => {
      if (i === doc) {
        ctx.fillStyle = 'rgba(42,36,24,0.12)';
        ctx.fillRect(80, 30 + i * 16, 150, 15);
      }
      paperText(ctx, t(`doc.${id}.title`), 84, 32 + i * 16, 10);
    });
    const id = docs[doc];
    paperText(ctx, t(`doc.${id}.title`), 252, 32, 11);
    paperParagraph(ctx, t(`doc.${id}.body`), 252, 52, 146, 9, 11);
  }

  function drawMaps(ctx) {
    if (!game.journal.maps().length) paperText(ctx, t('journal.noMaps'), 84, 32, 10, INK_SOFT);
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = PAPER;
    ctx.fillRect(70, 22, 340, 226);
    ctx.fillStyle = '#b8ae94';
    ctx.fillRect(238, 22, 2, 226);
    TABS.forEach((name, i) => {
      ctx.fillStyle = i === tab ? PAPER : PAPER_DARK;
      ctx.fillRect(80 + i * 72, 8, 68, 16);
      osdText(ctx, t(`journal.tab.${name}`), 114 + i * 72, 11, 8, i === tab ? INK : '#4a4434', 'center');
    });
    [drawClues, drawDocuments, drawMaps][tab](ctx);
    osdText(ctx, t('journal.footer'), W / 2, H - 16, 8, COLORS.dim, 'center');
  }

  const hits = () => TABS.map((name, i) => ({ x: 80 + i * 72, y: 8, w: 68, h: 16, click: () => (tab = i) }));

  function key(code, event) {
    const docs = game.journal.documents().length;
    if (code === 'Tab') tab = (tab + (event?.shiftKey ? 2 : 1)) % 3;
    else if (code === 'ArrowDown' && docs) doc = (doc + 1) % docs;
    else if (code === 'ArrowUp' && docs) doc = (doc + docs - 1) % docs;
    else if (code === 'Escape' || code === game.settings.get('keys').journal) ui.resume();
    else return false;
    return true;
  }

  return { name: 'journal', look: 'game', draw, hits, key, tab: () => TABS[tab] };
}
