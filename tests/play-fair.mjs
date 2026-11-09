// Plays Fair Weather for real: merging by drag, dusting, the hoop (sewing), the Fair, each phase from
// a save, a mid-game resume, the phone layout, everything bought, and the live ending.
import { chromium } from 'playwright';
import { serve } from '../tools/serve.mjs';
import path from 'node:path';
const SP = process.argv[2] || 'tests/screenshots';
const ONLY = process.argv[3] || '';
const SLUG = 'fair-weather', KEY = 'di:19:save';
const server = await serve(path.resolve('public'));
const url = `http://127.0.0.1:${server.address().port}/${SLUG}/?debug`;
const browser = await chromium.launch();
const errs = [];
async function open(save, vp = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 600 });
  await ctx.addInitScript(([k, s]) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1'); localStorage.clear(); if (s) localStorage.setItem(k, s); }, [KEY, save ? JSON.stringify(save) : null]);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(url); await page.waitForFunction(() => window.__game && window.__game.at);
  await page.waitForTimeout(700);
  return page;
}
const St = page => page.evaluate(() => window.__game.S());
async function px(page, [lx, ly]) {
  const b = await page.locator('#stage').boundingBox(); const W = await page.evaluate(() => window.__game.lw()); const k = b.width / W;
  return [b.x + lx * k, b.y + ly * k];
}
async function drag(page, a, b) {
  await page.mouse.move(...await px(page, a)); await page.mouse.down();
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  await page.mouse.move(...await px(page, m), { steps: 5 });
  await page.mouse.move(...await px(page, b), { steps: 5 }); await page.mouse.up();
}
const at = (page, i) => page.evaluate(i => window.__game.at(i), i);
const deck = (...cells) => { const d = Array(35).fill(null); for (const [i, t, g] of cells) d[i] = { t, d: !!g }; return d; };
const base = { v: 1, t: 1, savedAt: Date.now() };
const shot = (page, n) => page.screenshot({ path: `${SP}/fair-weather-${n}.png` });

if (!ONLY || ONLY === 'open') {
  // Opening: wait for pearls, then merge twins by dragging.
  const page = await open(null);
  await page.mouse.click(10, 10);
  await page.waitForTimeout(9000);
  let s = await St(page);
  const ps = s.deck.map((p, i) => [p, i]).filter(([p]) => p);
  console.log('pearls after 9s', ps.length);
  if (ps.length >= 2) { await drag(page, await at(page, ps[0][1]), await at(page, ps[1][1])); }
  s = await St(page);
  console.log('merges', s.merges, 'best', s.best);
  await shot(page, 'p-opening');
  await page.context().close();
}
if (!ONLY || ONLY === 'mid') {
  // Mid-game: season 3, the napkin, a busy deck with some grit.
  const save = { ...base, t: 3600, fairs: 2, season: 2, lastFair: 10, pennies: 48000, earned: 90000, pAll: 3e6, ribbons: 14, rAll: 40, best: 10, bestAll: 10,
    lv: { dive: 14, polish: 12, duster: 5, feed: 3, pair: 6 }, rl: { deck: 2, pride: 3, wage: 1, seed: 2, start: 0 },
    one: { pinwheel: true, hat: true, cozy: true, bell: true }, sewn: [true, true, true, true, true, true],
    deck: deck([0, 3, 1], [1, 5], [2, 6], [3, 8], [4, 7], [7, 4, 1], [8, 9], [9, 3], [10, 10], [11, 5], [14, 4], [15, 6, 1], [16, 7], [17, 3], [18, 8]), seen: ['dive', 'polish', 'duster', 'feed', 'pair', 'bell', 'spyglass'] };
  const page = await open(save);
  await shot(page, 'p-mid');
  // Sew a Plum (tier 7) into its outline: spot 6 is panel 1's [7].
  const s = await St(page);
  const i7 = s.deck.findIndex(p => p && p.t === 7);
  const sp = await page.evaluate(() => window.__game.spot(6));
  await drag(page, await at(page, i7), sp);
  console.log('sewn after drag', (await St(page)).sewn.filter(Boolean).length);
  // Tap grit.
  const ig = (await St(page)).deck.findIndex(p => p && p.d);
  if (ig >= 0) { await page.mouse.click(...await px(page, await at(page, ig))); console.log('dusted', !(await St(page)).deck[ig]?.d); }
  // Hover an upgrade for the tooltip.
  const up = page.locator('#shop button.up').first();
  if (await up.count()) { await up.hover(); await page.waitForTimeout(200); }
  await shot(page, 'p-mid-tip');
  await page.locator('#fairBtn').hover({ force: true }); await page.waitForTimeout(200);
  await shot(page, 'p-fair-tip');
  await page.locator('#fairBtn').click({ force: true }); await page.waitForTimeout(400);
  await shot(page, 'p-fair');
  await page.locator('.over .bigbtn').click(); await page.waitForTimeout(400);
  const s2 = await St(page);
  console.log('after fair: fairs', s2.fairs, 'ribbons', s2.ribbons, 'pennies', s2.pennies, 'best', s2.best);
  await page.reload(); await page.waitForTimeout(800);
  console.log('resume after reload: fairs', (await St(page)).fairs);
  await page.context().close();
  // Phone.
  const ph = await open(save, { width: 390, height: 844 });
  await shot(ph, 'p-phone');
  await ph.screenshot({ path: `${SP}/fair-weather-p-phone-full.png`, fullPage: true });
  await ph.context().close();
}
if (!ONLY || ONLY === 'all') {
  // Everything bought: every prop should be on the boat.
  const save = { ...base, t: 9000, fairs: 5, season: 5, lastFair: 13, pennies: 2e9, best: 12, bestAll: 13, lv: { dive: 30, polish: 30, duster: 8, feed: 6, pair: 20 },
    rl: { deck: 5, pride: 6, wage: 4, seed: 5, start: 2 }, one: Object.fromEntries(['pinwheel', 'hat', 'cozy', 'bell', 'spyglass', 'name', 'autograph', 'lantern', 'cake', 'vane'].map(k => [k, true])),
    sewn: Array(16).fill(true), deck: deck([0, 6], [1, 7], [2, 12], [3, 13], [8, 9], [9, 14], [10, 15], [16, 11], [22, 10]) };
  const page = await open(save);
  await shot(page, 'p-all');
  await page.context().close();
}
if (!ONLY || ONLY === 'end') {
  // The live ending: one spot left (a Moon), and a Moon pearl on deck.
  const sewn = Array(20).fill(true); sewn[19] = false;
  const save = { ...base, t: 14000, fairs: 5, season: 5, lastFair: 14, pennies: 3e9, best: 16, bestAll: 16, lv: { dive: 30, polish: 30, duster: 8, feed: 6, pair: 20 },
    rl: { deck: 5, pride: 6, wage: 4, seed: 6, start: 2 }, one: { pinwheel: true, cozy: true, vane: true }, sewn,
    deck: deck([0, 6, 1], [1, 7], [2, 9], [3, 9], [8, 16], [9, 14], [10, 12], [16, 11], [22, 10]) };
  const page = await open(save);
  await shot(page, 'p-last');
  const sp = await page.evaluate(() => window.__game.spot(19));
  await drag(page, await at(page, 8), sp);
  for (const t of [2, 6, 10, 14, 18]) { await page.waitForTimeout(t === 2 ? 2000 : 4000); await shot(page, `p-finale-${t}`); }
  await page.waitForTimeout(5000);
  console.log('ended', (await St(page)).ended, 'ending visible', await page.locator('#ending').isVisible());
  await page.screenshot({ path: `${SP}/fair-weather-p-ending.png`, fullPage: true });
  await page.context().close();
}
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'no console errors');
await browser.close(); server.close();
