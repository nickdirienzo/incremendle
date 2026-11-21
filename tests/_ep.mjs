import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from '../tools/serve.mjs';
const E = await import('../public/burning-ambition/economy.mjs');
const server = await serve(path.resolve('public'));
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const s = Object.assign(E.fresh(), { started: true, time: 600, nextGordon: 9999, nextCut: 9999, rings: 2300, value: E.GOAL - 1, tin: 1e8, lv: { needles: 12 } });
await ctx.addInitScript(s => { if (!sessionStorage.__set) { localStorage.setItem('di:31:save', s); sessionStorage.__set = 1; } }, JSON.stringify(s));
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e)));
await p.goto(`http://127.0.0.1:${server.address().port}/burning-ambition/?debug`); await p.waitForTimeout(1500);
for (let i = 0; i < 2; i++) { const w = await p.evaluate(() => window.__game.S().order.w.slice(window.__game.S().pos)); await p.keyboard.type(w.replace(/ /g, ''), { delay: 20 }); await p.waitForTimeout(300); }
for (let i = 0; i < 4; i++) { await p.waitForTimeout(1000); console.log(await p.evaluate(() => window.__game.dbg())); }
await p.keyboard.press('Escape');
await p.screenshot({ path: 'tests/screenshots/burning-ended.png' });
console.log(errs); await b.close(); server.close();
