// Load-Bearing Noodles: a short real playthrough in Chromium. node tests/play-noodles.mjs [shot-prefix]
// Tugs the knot, roots rooms, loads a save at the start of each phase and plays that phase's action
// (tug, listen, sweep salt), then roots the Mother Knot, holds the final tug and watches the ending.
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const OUT = 'tests/screenshots';
const errors = [];
const browser = await chromium.launch();
async function page(save, viewport = { width: 1280, height: 900 }, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  if (save) await ctx.addInitScript(s => { if (!sessionStorage.__set) { localStorage.setItem('di:12:save', s); sessionStorage.__set = 1; } }, JSON.stringify(save));
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(`${BASE}/load-bearing-noodles/?debug`);
  await p.waitForTimeout(1200);
  return p;
}
async function knot(p, ms = 1300) {
  const b = await p.locator('#stage').boundingBox();
  const narrow = b.width < 600;
  const x = b.x + b.width * (narrow ? 0.245 : 0.14), y = b.y + b.height * (narrow ? 0.07 : 0.14);
  await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up();
}
async function listen(p, ms = 1800) {
  const b = await p.locator('#stage').boundingBox();
  const narrow = b.width < 600;
  const x = b.x + b.width * (narrow ? 0.75 : 0.14), y = b.y + b.height * (narrow ? 0.14 : 0.75);
  await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up();
}
const room = (p, i) => p.locator('.room').nth(i);
const st = p => p.evaluate(() => { const S = window.__game.S(); return { n: S.noodles, d: S.dirt, rooted: S.rooted, tugs: S.tugs, listens: S.listens, vine: S.vine, ended: S.ended, phase: window.__game.E.phase(S) }; });

// 1. The opening: tug, then root the first room.
let p = await page(null);
for (let k = 0; k < 4; k++) await knot(p);
console.log('after 4 tugs', await st(p));
await room(p, 10).click(); // 3A
await p.waitForTimeout(300);
console.log('after rooting 3A', await st(p));
await p.screenshot({ path: `${OUT}/noodles-opening.png` });

// 2. Mid phase 1 save: a few rooms.
const E = await import('../public/load-bearing-noodles/economy.mjs');
function mk(fn) { const S = E.newState(); fn(S); S.rooted = S.lv.filter(l => l > 0).length; S.t = 600; return S; }
const walls = mk(S => { for (const i of [6, 10, 11, 12, 16]) S.lv[i] = 6; S.lv[5] = 2; S.noodles = 5e4; S.tugs = 40; S.up.hairs = 1; S.up.grip = 1; S.seen = ['hairs', 'grip', 'worry', 'damp']; });
p = await page(walls);
await knot(p); await room(p, 5).click(); await room(p, 7).click(); await p.waitForTimeout(400);
await room(p, 6).hover(); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/noodles-walls.png` });
console.log('walls', await st(p));

// 3. The grapevine: listen a few times (once greedy, to get caught), sweep a salt.
const vine = mk(S => { for (const i of [5, 6, 7, 10, 11, 12, 13, 15, 16, 17, 21, 8, 18, 20]) S.lv[i] = 12; S.vine = true; S.noodles = 3e8; S.dirt = 60; S.tugs = 300; S.t = 1800; for (const u of ['hairs', 'grip', 'worry', 'damp', 'slurp', 'warm', 'yank']) S.up[u] = 1; S.seen = Object.keys(S.up); S.shopTab = 'd'; });
p = await page(vine);
for (let k = 0; k < 3; k++) { await listen(p, 1500); await p.waitForTimeout(200); }
await listen(p, 6000); await p.waitForTimeout(200);
console.log('vine', await st(p));
await room(p, 1).click(); await p.waitForTimeout(300); // pigeon loft salt
await listen(p, 1200);
await p.screenshot({ path: `${OUT}/noodles-grapevine.png` });
console.log('vine after sweep', await st(p), await p.evaluate(() => window.__game.S().salted.join('')));

// 4. Deep: everything but the knot, enough to root it, then the final hold and the ending.
const deep = mk(S => { S.lv = S.lv.map((l, i) => (i === E.KNOT ? 0 : E.MAX_LV)); S.salted = S.salted.map(() => 0); S.saltCleared = 11; S.vine = true; S.noodles = 2e18; S.dirt = 500; S.t = 5400; for (const u of E.UPGRADES) if (u.kind !== 'odd') S.up[u.id] = 1; S.up.hat = 1; S.seen = Object.keys(S.up); S.dirtTotal = 9000; });
p = await page(deep);
await p.screenshot({ path: `${OUT}/noodles-deep.png` });
await room(p, E.KNOT).click(); await p.waitForTimeout(500);
console.log('knot rooted', await st(p));
await p.screenshot({ path: `${OUT}/noodles-motherknot.png` });
await knot(p, 1500);   // too short: should not end
console.log('short final hold', await st(p));
await knot(p, 4600);
await p.waitForTimeout(3000);
await p.screenshot({ path: `${OUT}/noodles-collapse.png` });
await p.waitForTimeout(8000);
console.log('ended', await st(p));
await p.screenshot({ path: `${OUT}/noodles-epilogue.png`, fullPage: false });

// 5. Phone, mid-game.
p = await page(vine, { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.screenshot({ path: `${OUT}/noodles-phone.png`, fullPage: true });
p = await page({ ended: true }, { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/noodles-phone-ending.png` });

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
