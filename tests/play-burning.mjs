// Burning Ambition: a short real playthrough in Chromium. node tests/play-burning.mjs
// Types the opening orders on the keyboard (and a fumble), buys the spectacles; loads a save in each section and
// types there; triggers Gordon's affirmation and a power cut; loads a save one ring from the billion, types the
// last order and BIG LIGHT, and watches the epilogue. Also a phone-width pass on the on-screen keys.
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from '../tools/serve.mjs';

const server = await serve(path.resolve('public'));
const BASE = `http://127.0.0.1:${server.address().port}`;
const OUT = 'tests/screenshots';
const errors = [];
const browser = await chromium.launch();
const E = await import('../public/burning-ambition/economy.mjs');
async function page(save, viewport = { width: 1280, height: 900 }, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  if (save) await ctx.addInitScript(s => { if (!sessionStorage.__set) { localStorage.setItem('di:31:save', s); sessionStorage.__set = 1; } }, JSON.stringify(save));
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  p.on('response', r => { if (r.status() >= 400) errors.push('404 ' + r.url()); });
  await p.goto(`${BASE}/burning-ambition/?debug`);
  await p.waitForTimeout(1200);
  return p;
}
const word = p => p.evaluate(() => window.__game.S().order.w.slice(window.__game.S().pos));
async function typeWords(p, n, delay = 30) { for (let i = 0; i < n; i++) { const w = (await word(p)).replace(/ /g, ''); await p.keyboard.type(w, { delay }); await p.waitForTimeout(80); } }
const st = p => p.evaluate(() => { const S = window.__game.S(); return { tin: Math.round(S.tin), value: Math.round(S.value), rings: S.rings, wonky: S.wonky, order: S.order && S.order.w, ended: S.ended, lv: S.lv }; });
const save = (o) => Object.assign(E.fresh(), { started: true, time: 600, nextGordon: 9999, nextCut: 9999 }, o);

// 1. The opening.
let p = await page(null);
await p.screenshot({ path: `${OUT}/burning-start.png` });
await typeWords(p, 2);
await p.keyboard.type('QQ');                          // a fumble
await typeWords(p, 4);
console.log('opening', await st(p));
await p.screenshot({ path: `${OUT}/burning-opening.png` });
const up = p.locator('#shop .up.can').first();
if (await up.count()) { await up.hover(); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/burning-tooltip.png` }); await up.click(); }
console.log('after buying', await st(p));

// 2. Each section, typed for real.
const LV = { needles: 6, spec: 1, board: 1, finish: 2 };
const sections = [
  ['shaft', { rings: 70, value: 9e3, tin: 3e3, lv: LV }],
  ['roof', { rings: 180, value: 4e5, tin: 1e5, lv: { ...LV, needles: 12, wheel: 4, tape2: 1, poster: 1, finish: 3 } }],
  ['town', { rings: 420, value: 1.2e7, tin: 2e6, lv: { ...LV, needles: 12, wheel: 9, loom: 2, tape2: 1, tape3: 1, poster: 1, trap: 1, finish: 5 } }],
  ['spire', { rings: 800, value: 9e7, tin: 2e7, lv: { ...LV, needles: 12, wheel: 10, loom: 5, telegraph: 1, tape2: 1, tape3: 1, poster: 1, trap: 1, hat: 1, finish: 5 } }],
  ['crown', { rings: 1500, value: 4e8, tin: 9e7, lv: { ...LV, needles: 12, wheel: 10, loom: 7, telegraph: 3, tape2: 1, tape3: 1, tape4: 1, poster: 1, trap: 1, hat: 1, finish: 6 } }],
];
for (const [name, s] of sections) {
  p = await page(save({ ...s, seen: Object.fromEntries(E.ITEMS.filter(i => s.value >= i.at).map(i => [i.id, true])) }));
  await typeWords(p, 3);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/burning-${name}.png` });
  console.log(name, await st(p));
  await p.context().close();
}

// 3. Gordon and a power cut.
p = await page(save({ rings: 180, value: 4e5, tin: 1e5, lv: { ...LV, wheel: 4 }, nextGordon: 601, nextCut: 602 }));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/burning-gordon.png` });
await typeWords(p, 2);
console.log('gordon', await st(p), await p.evaluate(() => ({ breakT: window.__game.S().breakT, cutT: window.__game.S().cutT })));
await p.screenshot({ path: `${OUT}/burning-cut.png` });
await p.context().close();

// 4. The end, live: one ring short of a billion, then BIG LIGHT.
p = await page(save({ rings: 2300, value: E.GOAL - 1, tin: 1e8, lv: { ...LV, needles: 12, wheel: 10, loom: 8, telegraph: 4, tape2: 1, tape3: 1, tape4: 1, poster: 1, trap: 1, hat: 1, finish: 7 }, mine: ['GRETA', 'SORRY ABOUT THE GERBIL', 'I AM ENOUGH'] }));
await typeWords(p, 1);
await p.waitForTimeout(500);
console.log('final order', await st(p));
await p.screenshot({ path: `${OUT}/burning-final.png` });
await typeWords(p, 1);
await p.waitForTimeout(3000);
console.log('ended', await st(p));
await p.screenshot({ path: `${OUT}/burning-epilogue.png` });
await p.waitForTimeout(20000);
await p.screenshot({ path: `${OUT}/burning-epilogue-later.png`, fullPage: true });
await p.context().close();

// 5. Phone width: tap the on-screen keys.
p = await page(null, { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
for (let i = 0; i < 2; i++) { const w = (await word(p)).replace(/ /g, ''); for (const ch of w) await p.locator(`#keys button[data-k="${ch}"]`).tap(); }
console.log('phone', await st(p));
await p.screenshot({ path: `${OUT}/burning-phone.png`, fullPage: true });

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close(); server.close();
