// Light Lunch: a short real playthrough in Chromium. node tests/play-lunch.mjs
// Cranks the magneto by dragging circles, buys and places a wheel, drags a station to a new spot; loads a save at
// the start of each phase and cranks there; loads a save with everything bought; loads a save a few covers short
// of the bet, cranks over the line and watches the ending. Also a phone-width pass.
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from '../tools/serve.mjs';

const server = await serve(path.resolve('public'));
const BASE = `http://127.0.0.1:${server.address().port}`;
const OUT = 'tests/screenshots';
const errors = [];
const browser = await chromium.launch();
const E = await import('../public/light-lunch/economy.mjs');
async function page(save, viewport = { width: 1280, height: 900 }, opts = {}) {
  const ctx = await browser.newContext({ viewport, ...opts });
  if (save) await ctx.addInitScript(s => { if (!sessionStorage.__set) { localStorage.setItem('di:32:save', s); sessionStorage.__set = 1; } }, JSON.stringify(save));
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  p.on('response', r => { if (r.status() >= 400) errors.push('404 ' + r.url()); });
  await p.goto(`${BASE}/light-lunch/?debug`);
  await p.waitForTimeout(1200);
  return p;
}
const st = p => p.evaluate(() => { const S = window.__game.S(); return { v: Math.round(S.v), covers: Math.round(S.covers), turns: S.turns, lit: S.lit, hand: S.hand, ended: S.ended, phase: window.__game.E.phase(S) }; });
// Canvas units -> page coordinates.
async function at(p, x, y) { const b = await p.locator('#stage').boundingBox(); return [b.x + x * b.width / 760, b.y + y * b.height / 470]; }
async function crank(p, turns) {
  const [cx, cy] = await at(p, 172, 268), b = await p.locator('#stage').boundingBox(), r = 40 * b.width / 760;
  await p.mouse.move(cx + r, cy); await p.mouse.down();
  for (let i = 1; i <= turns * 12; i++) { const a = i / 12 * Math.PI * 2; await p.mouse.move(cx + Math.cos(a) * r, cy + Math.sin(a) * r); await p.waitForTimeout(16); }
  await p.mouse.up();
}
const save = o => Object.assign(E.fresh(), { started: true, firstLit: true, time: 600, turns: 50, savedAt: 0 }, o);
const floor = (plan, n = 1) => { const grid = {}, stack = {}; plan.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') { grid[E.key(c, r)] = { w: 'wheel', p: 'pot', i: 'intern' }[ch]; stack[E.key(c, r)] = typeof n === 'number' ? n : n[r][c]; } })); return { grid, stack }; };
const seenAll = ids => ITEMS().filter(i => ids.includes('*') || ids.includes(i.id)).map(i => i.id);
const ITEMS = () => E.ITEMS;

// 1. The opening.
let p = await page(null);
await p.screenshot({ path: `${OUT}/lunch-start.png` });
await crank(p, 6);
console.log('opening', await st(p));
await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/lunch-opening.png` });
for (let i = 0; i < 4; i++) { await crank(p, 5); }
console.log('after cranking', await st(p));
const up = p.locator('#shop .up.can').first();
if (await up.count()) { await up.hover(); await p.waitForTimeout(200); await p.screenshot({ path: `${OUT}/lunch-tooltip.png` }); await up.click(); }
await p.waitForTimeout(200);
await p.screenshot({ path: `${OUT}/lunch-holding.png` });
const [tx, ty] = await at(p, 268 + 79 * 1.5, 80 + 96 * 0.5);
await p.mouse.click(tx, ty);
console.log('placed', await st(p));
// drag the first wheel to the bottom-left spot
const [ax, ay] = await at(p, 268 + 40, 80 + 48), [bx, by] = await at(p, 268 + 40, 80 + 96 + 48);
await p.mouse.move(ax, ay); await p.mouse.down(); await p.mouse.move(bx, by, { steps: 6 }); await p.mouse.up();
await crank(p, 3);
await p.screenshot({ path: `${OUT}/lunch-moved.png` });

// 2. Each phase: a save at its start, crank a bit.
const phases = [
  ['service', save({ covers: 2200, v: 600, lv: { annex: 2, menu: 1, crank: 1, sign: 1 }, owned: { wheel: 9, pot: 4, intern: 1 }, ...floor(['wpw', 'pwi', 'w..'], [[3, 2, 2], [1, 1, 1], [1, 1, 1]]), seen: seenAll(['wheel', 'menu', 'annex', 'pot', 'sign', 'crank', 'intern']) })],
  ['rush', save({ covers: 26000, v: 12000, lv: { annex: 4, menu: 2, crank: 2, sign: 1, grappa: 1, coaster: 1, paddles: 1, stamp: 1 }, owned: { wheel: 24, pot: 14, intern: 8 }, irene: 5, ...floor(['wpwiw', 'pwpwp', 'iwiw.'], 3), seen: seenAll(['*']).slice(0, 12) })],
];
for (const [name, s] of phases) {
  p = await page(s);
  await crank(p, 4);
  await p.waitForTimeout(800);
  console.log(name, await st(p));
  await p.screenshot({ path: `${OUT}/lunch-${name}.png` });
}
// 3. Everything bought.
const allLv = { annex: 6, menu: 4, crank: 3, grappa: 1, paddles: 1, lanyard: 1, fan: 1, bellows: 1, sign: 1, coaster: 1, stamp: 1, ball: 1, tiny: 1 };
p = await page(save({ covers: 80000, v: 5000, lv: allLv, owned: { wheel: 40, pot: 28, intern: 24 }, irene: 9, ...floor(['wpwiwp', 'iwpwiw', 'wpwpwp', 'iwiwiw'], 4), seen: seenAll(['*']) }));
await crank(p, 3);
await p.waitForTimeout(500);
await p.screenshot({ path: `${OUT}/lunch-everything.png` });
// 4. The end, live.
p = await page(save({ covers: E.GOAL - 3, v: 5000, lv: allLv, owned: { wheel: 40, pot: 28, intern: 24 }, irene: 9, ...floor(['wpwiwp', 'iwpwiw', 'wpwpwp', 'iwiwiw'], 4), seen: seenAll(['*']) }));
await crank(p, 3);
await p.waitForTimeout(1500);
console.log('end', await st(p));
await p.screenshot({ path: `${OUT}/lunch-ending.png`, fullPage: true });
// 5. Phone.
p = await page(phases[0][1], { width: 390, height: 844 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.screenshot({ path: `${OUT}/lunch-phone.png`, fullPage: true });
// 6. Away for two hours with interns on the floor.
p = await page(Object.assign(phases[1][1], { savedAt: Date.now() - 2 * 3600 * 1000 }));
console.log('away', await p.locator('#log').textContent());
console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'no errors');
await browser.close(); server.close();
