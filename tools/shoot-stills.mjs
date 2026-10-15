// Screenshots mockup stills at 1280×720 into docs/mockups/stills-0.2/
// (0.3 school stills into docs/mockups/stills-0.3/).
// Usage: npx vite --port 5199 &  then  node tools/shoot-stills.mjs [names…]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const ALL = ['intro_wake', 'hub', 'dorm', 'tommy', 'low_sanity', 'rewind', 'ui_prompt', 'ui_inventory', 'ui_journal', 'ui_documentView', 'ui_save', 'ui_heldNote', 'ui_battery', 'collapse_scare', 'ui_musicBoxClose', 'ui_itemHover', 'ui_itemCard', 'ui_sanityPulse', 'ui_sanityCard', 'ui_mapMarks', 'room_washroom', 'room_washroom_sinks', 'room_linen', 'room_quiet', 'room_quiet_tally', 'furnished_corridor', 'furnished_landing', 'furnished_office', 'furnished_sickbay', 'furnished_eastdorm', 'furnished_westdorm', 'furnished_playroom'];
const SCHOOL = ['classroom', 'blackboard', 'watcher', 'watcher_close', 'maggie', 'courtyard', 'cemetery', 'watcher_grab', 'storm', 'ui_codeLock', 'library', 'gym', 'music_room', 'ui_piano', 'ui_piano_shapes', 'nurse_room', 'art_room', 'entrance_hall', 'entrance_stairs', 'cloakroom', 'ui_cardIndex', 'ui_shelf', 'ui_countingBoard', 'ui_gravestone', 'ui_gravestone_worn', 'ui_painting', 'ui_hopscotch', 'ui_fuseBox', 'chalk_hint', 'chalk_taunt', 'class1_turned'];
const names = process.argv.slice(2).length ? process.argv.slice(2) : [...ALL, ...SCHOOL];
const folder = (name) => new URL(`../docs/mockups/stills-${SCHOOL.includes(name) ? '0.3' : '0.2'}/`, import.meta.url).pathname;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()));
for (const name of names) {
  await page.goto(`http://localhost:5199/mockup.html?s=${name}`);
  await page.waitForSelector('body[data-ready="1"]', { state: 'attached', timeout: 30000 });
  mkdirSync(folder(name), { recursive: true });
  await page.screenshot({ path: `${folder(name)}${name}.png` });
  console.log('shot', name);
}
await browser.close();
