// A found document, as in the approved still ui_documentView: the paper fills
// the view with a typed transcript beside it. T hides the transcript; click,
// ENTER or ESC puts the paper back.
import { osdText, wrapText, COLORS } from '../osd.js';
import { PAPER, INK_SOFT, BLOT, SERIF, paperText, paperParagraph, fitSize } from '../paper.js';

const W = 480;
const H = 270;
const TEXT_WIDTH = 176; // the paper is 200 wide, with 12 px margins

export function createDocumentScreen(ui, { id }) {
  const { t, game } = ui;
  let transcript = true;
  let bylineSize = 9; // shrinks to fit a long byline (owner 2026-10-25)
  const openedAt = performance.now(); // the click that opened it must not close it
  const body = () => t(`doc.${id}.body`);

  function draw(ctx) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(transcript ? 150 : W / 2, 130);
    ctx.rotate(-0.03);
    ctx.fillStyle = PAPER;
    ctx.fillRect(-100, -112, 200, 226);
    paperText(ctx, t(`doc.${id}.title`), -88, -100, 10);
    const byline = t(`doc.${id}.byline`);
    bylineSize = fitSize(ctx, byline, TEXT_WIDTH, 9);
    paperText(ctx, byline, -88, -86, bylineSize, INK_SOFT);
    paperParagraph(ctx, body(), -88, -66, TEXT_WIDTH, 9, 12);
    ctx.restore();
    if (transcript) {
      ctx.fillStyle = 'rgba(5,7,10,0.6)';
      ctx.fillRect(268, 30, 190, 196);
      osdText(ctx, t('document.transcript'), 278, 38, 9, COLORS.dim);
      wrapText(ctx, body().replaceAll(BLOT, t('document.unreadable')), 9, 170).forEach((line, i) => osdText(ctx, line, 278, 54 + i * 12, 9, COLORS.soft));
    }
    osdText(ctx, t(transcript ? 'document.footer' : 'document.footerHidden'), W / 2, H - 16, 8, COLORS.dim, 'center');
  }

  const hits = () => [{ x: 0, y: 0, w: W, h: H, click: () => performance.now() - openedAt > 400 && ui.resume() }];

  function key(code) {
    if (code === 'KeyT') transcript = !transcript;
    else if (['Escape', 'Enter', 'Space'].includes(code)) ui.resume();
    else return false;
    return true;
  }

  return { name: 'document', look: 'paper', draw, hits, key, transcript: () => transcript, byline: () => ({ text: t(`doc.${id}.byline`), font: `${bylineSize}px ${SERIF}`, width: TEXT_WIDTH }) };
}
