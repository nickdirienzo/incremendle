// Sticky Finish: a short real playthrough in Chromium. node tests/play-sticky.mjs
// Types labels on the keyboard, buys frames and hives, loads a save mid-summer, in winter (reads the
// review, spends Notes, starts the next summer) and one label short of a full stair, types the last
// label, picks an ending and watches it. Also a phone-width pass that types through the hidden input.
import { chromium } from 'playwright';
import fs from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:8080';
const OUT = 'tests/screenshots';
const errors = [];
const browser = await chromium.launch();
const stub = !fs.existsSync('public/sticky-finish/music.mjs');
async function page(save, viewport = { width: 1280, height: 860 }, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  if (stub) await ctx.route('**/sticky-finish/music.mjs', r => r.fulfill({ contentType: 'text/javascript', body: 'export const phases={}; export function createSoundtrack(S){ return k => [k, S.silence, 0.45]; }' }));
  if (save) await ctx.addInitScript(s => { if (!sessionStorage.__set) { localStorage.setItem('di:13:save', s); sessionStorage.__set = 1; } }, JSON.stringify(save));
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(`${BASE}/sticky-finish/?debug`);
  await p.waitForTimeout(1200);
  return p;
}
const word = p => p.evaluate(() => document.getElementById('word').textContent);
async function typeWords(p, n, delay = 25) { for (let i = 0; i < n; i++) { const w = await word(p); await p.keyboard.type(w, { delay }); } }
const st = p => p.evaluate(() => { const S = window.__game.S(); return { jars: Math.floor(S.jars), frame: Math.floor(S.frame), hive: Math.floor(S.hive), season: S.season, winter: S.winter, notes: S.notes, record: S.record, ended: S.ended, phase: window.__game.E.phase(S), labels: S.labels }; });
const E = await import('../public/sticky-finish/economy.mjs');

// 1. The opening: type, then buy a frame.
let p = await page(null);
await typeWords(p, 4);
console.log('after 4 labels', await st(p));
await p.locator('#shop .up').first().click();
await typeWords(p, 3);
await p.screenshot({ path: `${OUT}/sticky-opening.png` });
console.log('opening', await st(p));

// 2. Mid-summer: a busy stair, kit to buy, tooltip open.
const mid = Object.assign(E.newState(), { season: 6, clock: 140, jars: 2600, peak: 2600, best: 9000, total: 60000, labels: 600, frame: 22, hive: 5, queen: 0,
  bought: { frame: 22, hive: 5, queen: 0 }, notes: 9, notesTotal: 80, winterLv: 2, t: 1700, shopTab: 'j', reviews: [400, 800, 1300, 3900, 6400],
  up: { mic: 1, bigjars: 1, extractor: 1, thrift: 1, bramble: 1, rosebay: 1, mischief: 1, plate: 1 } });
mid.seen = ['p:frame', 'p:hive', 'p:winter', 'mic', 'bigjars', 'extractor', 'thrift', 'bramble', 'rosebay', 'mischief', 'plate', 'pennant', 'excluder', 'rearing', 'heather', 'duster', 'stamp', 'ivy', 'aster'];
p = await page(mid);
await typeWords(p, 3);
await p.locator('#shop .up').nth(1).click();
await p.locator('#shop .up').nth(3).hover(); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/sticky-mid.png` });
console.log('mid', await st(p));

// 3. Winter: the review, spend Notes, next summer.
const win = Object.assign(E.newState(), JSON.parse(JSON.stringify(mid)), { winter: true, jars: 0, peak: 0, frame: 0, hive: 0, lastPeak: 7535, lastNotes: 38, notes: 47, shopTab: 'n', reviews: [400, 800, 1300, 3900, 6400, 7535] });
win.bought = { frame: 0, hive: 0, queen: 0 };
p = await page(win);
await p.screenshot({ path: `${OUT}/sticky-winter.png` });
console.log('review:', await p.locator('#revQuote').textContent());
await p.locator('#shop .up', { hasText: 'Heather' }).click();
await p.locator('#nextBtn').click(); await p.waitForTimeout(300);
await typeWords(p, 2);
console.log('after winter', await st(p));

// 4. The clutch and the last jar: one label short of the lamp.
const fin = Object.assign(E.newState(), JSON.parse(JSON.stringify(mid)), { season: 10, clock: 470, jars: E.RECORD - 8, peak: E.RECORD - 8, best: 74000 });
for (const u of E.UPGRADES) fin.up[u.id] = 1;
fin.frame = 60; fin.hive = 20; fin.queen = 4;
p = await page(fin);
await p.screenshot({ path: `${OUT}/sticky-clutch.png` });
await typeWords(p, 1); await p.waitForTimeout(500);
console.log('record', await st(p));
await p.screenshot({ path: `${OUT}/sticky-choice.png` });
await p.locator('#lampBtn').click(); await p.waitForTimeout(3200);
await p.screenshot({ path: `${OUT}/sticky-ending-lamp.png`, fullPage: true });
console.log('ended', await st(p));

// 5. Phone: tap the label, type through the hidden input.
p = await page(mid, { width: 390, height: 844 }, { hasTouch: true, isMobile: true });
await p.locator('#typer').tap();
for (let i = 0; i < 2; i++) { const w = await word(p); await p.locator('#type').pressSequentially(w, { delay: 20 }); }
console.log('phone', await st(p));
await p.screenshot({ path: `${OUT}/sticky-phone.png`, fullPage: true });
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
await browser.close();
