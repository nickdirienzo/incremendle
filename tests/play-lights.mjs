// Who Left the Lights On?: a short real playthrough in Chromium. node tests/play-lights.mjs
// Draws real paths from the bin to windows with the mouse (and on a phone-sized touch screen), loads a save at
// the start of each zone and plays it, pins an order, loops a path, then fills the meter and picks an ending.
import { chromium } from 'playwright';
import { serve } from '../tools/serve.mjs';
import path from 'node:path';

const server = await serve(path.resolve('public'));
const BASE = `http://127.0.0.1:${server.address().port}`;
const OUT = 'tests/screenshots';
const errors = [];
const browser = await chromium.launch();
const E = await import('../public/who-left-the-lights-on/economy.mjs');
async function page(save, viewport = { width: 1280, height: 860 }, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  if (save) await ctx.addInitScript(s => { if (!sessionStorage.__set) { localStorage.setItem('di:26:save', s); sessionStorage.__set = 1; } }, JSON.stringify(save));
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(`${BASE}/who-left-the-lights-on/?debug`);
  await p.waitForTimeout(900);
  return p;
}
async function drawTo(p, id, { loop = false } = {}) {
  let pts = await p.evaluate(id => window.__pathTo(id), id);
  if (loop) {
    // A little ring just before the window: past it, up, back and down across the line.
    const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, px = -uy, py = ux;
    const c = [b[0] - ux * 50, b[1] - uy * 50];
    pts = [...pts.slice(0, -1), [c[0] - ux * 20, c[1] - uy * 20], [c[0] + ux * 14, c[1] + uy * 14], [c[0] + ux * 14 + px * 24, c[1] + uy * 14 + py * 24], [c[0] - ux * 8 + px * 24, c[1] - uy * 8 + py * 24], [c[0] - ux * 8 - px * 14, c[1] - uy * 8 - py * 14], b];
  }
  await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 8));
    for (let k = 1; k <= n; k++) await p.mouse.move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n);
  }
  await p.mouse.up();
}
const st = p => p.evaluate(() => { const S = window.__game.S(); return { g: Math.round(S.g), life: Math.round(S.life), n: S.n, lit: Object.keys(S.lit), shouts: S.shouts, launches: S.launches, zone: window.__game.E.zone(S), finale: S.finale, ended: S.ended, choice: S.choice, orders: S.orders.length, sync: S.syncFound }; });

// 1. The opening: draw from the bin to the shower block, watch Dobbin come, buy the first peach.
let p = await page(null);
await p.screenshot({ path: `${OUT}/lights-fresh.png` });
await drawTo(p, 's2'); await p.waitForTimeout(500);
await drawTo(p, 's1'); await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/lights-opening.png` });
await p.waitForTimeout(7000);
console.log('opening', await st(p));
await p.screenshot({ path: `${OUT}/lights-opening-2.png` });

// 2. A save at each zone, played for real.
function mk(fn) { const S = E.load(null); fn(S); return S; }
const reveal = (S, x) => { for (let cx = 0; cx < E.GW; cx++) for (let cy = 0; cy < E.GH; cy++) if ((cx + 0.5) * E.CELL < x) E.reveal(S, (cx + 0.5) * E.CELL, (cy + 0.5) * E.CELL, 1); };
const zones = {
  meadow: mk(S => { reveal(S, 330); S.g = 900; S.life = 3000; S.launches = 30; S.shouts = 20; S.lv = { bait: 6, range: 2, mega: 4 }; S.n = 9; S.one = { hat: 1 }; S.seen = ['bait', 'range', 'mega', 'hat', 'pitch1', 'fire']; S.t = 400; S.dob = { x: 330, y: 380, a: 0, shout: 0, target: null, idle: 0 }; }),
  row: mk(S => { reveal(S, 560); S.g = 3e4; S.life = 4e5; S.launches = 400; S.shouts = 300; S.lv = { bait: 18, range: 4, mega: 16, fan: 3, coffee: 4, dim: 2, wind: 2, notes: 1 }; S.n = 21; S.one = { hat: 1, cap: 1, fire: 1, lid: 1, hike: 1 }; for (const t of ['t4', 't5', 't6', 't7', 't8', 't9']) S.open[t] = 1; S.crowd = { 1: 4 }; S.seen = E.ITEMS.filter(i => i.z <= 2).map(i => i.id); S.finds = ['sock']; S.t = 2000; S.dob = { x: 500, y: 330, a: 3, shout: 0, target: null, idle: 0 }; }),
};
for (const [name, save] of Object.entries(zones)) {
  p = await page(save);
  const ids = E.TARGETS.filter(t => save.open[t.id] && E.known(save, t.id)).sort((a, b) => b.zone - a.zone).slice(0, 4).map(t => t.id);
  for (const id of ids) { await drawTo(p, id); await p.waitForTimeout(250); }
  await p.waitForTimeout(2500);
  console.log(name, await st(p));
  await p.screenshot({ path: `${OUT}/lights-${name}.png` });
}

// 3. Orders and the hidden loop: pin a path, then a ring.
p = await page(zones.row);
await drawTo(p, 'c2', { loop: true }); await p.waitForTimeout(200);
await p.locator('#pinBtn').click(); await p.waitForTimeout(3500);
console.log('pinned + loop', await st(p));
await p.screenshot({ path: `${OUT}/lights-orders.png` });
await p.locator('#shop button.up').first().hover(); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/lights-tip.png` });

// 4. Phone: draw with touch.
p = await page(zones.meadow, { width: 390, height: 844 }, { hasTouch: true, isMobile: true });
const pts = await p.evaluate(() => window.__pathTo('t1'));
const cdp = await p.context().newCDPSession(p);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] });
for (let k = 1; k <= 20; k++) { const u = k / 20; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pts[0][0] + (pts.at(-1)[0] - pts[0][0]) * u, y: pts[0][1] + (pts.at(-1)[1] - pts[0][1]) * u }] }); }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await p.waitForTimeout(1500);
console.log('phone', await st(p));
await p.screenshot({ path: `${OUT}/lights-phone.png`, fullPage: true });

// 5. The end: nearly everyone has heard; one more shout fills the meter, then choose.
const near = mk(S => { S.fog = '1'.repeat(E.GW * E.GH); for (const t of E.TARGETS) S.open[t.id] = 1; S.g = 1e8; S.life = E.WORLD - 10; S.launches = 4000; S.shouts = 3900; S.lv = { bait: 30, range: 12, mega: 50, fan: 8, coffee: 12, dim: 5, wind: 6, notes: 4 }; S.n = 30; S.one = Object.fromEntries(E.ITEMS.filter(i => i.kind === 'one' || i.kind === 'odd').map(i => [i.id, 1])); S.finds = E.FINDS.map(f => f.id); S.seen = E.ITEMS.map(i => i.id); S.t = 10000; S.syncFound = true; });
for (const choice of ['keys', 'lid']) {
  p = await page(near);
  await drawTo(p, 's2'); await p.waitForTimeout(9000);
  console.log('finale', await st(p));
  await p.screenshot({ path: `${OUT}/lights-finale.png` });
  await p.locator(`#end-${choice}`).click(); await p.waitForTimeout(300);
  if (!(await st(p)).ended) await p.locator(`#end-${choice}`).click();
  await p.waitForTimeout(1500);
  console.log('ended', await st(p));
  await p.screenshot({ path: `${OUT}/lights-ending-${choice}.png`, fullPage: true });
}
p = await page(null); await p.goto(`${BASE}/who-left-the-lights-on/?sprites`); await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/lights-sprites.png`, fullPage: true });

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close(); server.close();
