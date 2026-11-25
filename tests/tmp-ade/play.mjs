import { chromium } from 'playwright';
import fs from 'node:fs';
import { serve } from '../../tools/serve.mjs';
const srv = await serve(process.cwd() + '/public'); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await chromium.launch();
const card = JSON.parse(fs.readFileSync('tools/cards.json','utf8'))['al-dente-encounters'];
async function open(save) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGEERROR', e.message)); p.on('console', m => { if (m.type()==='error' && !/404/.test(m.text())) console.log('ERR', m.text()); });
  if (save) await ctx.addInitScript(s => { if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x',1); localStorage.setItem('di:34:save', s); } }, JSON.stringify(save));
  await p.goto(base + '/al-dente-encounters/?debug'); await p.waitForTimeout(800); return p;
}
async function bot(p, secs) {
  const c = await p.locator('#stage').boundingBox();
  await p.mouse.move(c.x + 300, c.y + 380); await p.mouse.move(c.x + 320, c.y + 390);
  for (let i = 0; i < secs / 0.5; i++) {
    const t = await p.evaluate(() => { const n = window.__game.E.fattest(window.__game.B()); return n ? [n.x + 25, n.y] : null; });
    if (t) await p.mouse.move(c.x + t[0] * c.width / 760, c.y + t[1] * c.height / 470);
    await p.waitForTimeout(500);
    const cheap = p.locator('#shop .up.can').first(); if (await cheap.count()) { await cheap.click(); await p.mouse.move(c.x + 300, c.y + 380); }
  }
}
let p = await open(null);
for (let k = 1; k <= 4; k++) { await bot(p, 60); console.log(k, 'min', await p.evaluate(() => { const S = window.__game.S(); return [S.wave, S.best, Math.round(S.bites), JSON.stringify(S.lv)]; })); }
console.log('monday after 2 min:', await p.evaluate(() => { const S = window.__game.S(); return { wave: S.wave, best: S.best, bites: S.bites, lv: S.lv, odd: S.odd }; }));
await p.screenshot({ path: '/tmp/ade/play-monday.png' });
await b.close(); srv.close(); process.exit(0);
// Wrap from the card save at quota
p = await open({ ...card, best: 30 });
await p.click('#wrapBtn'); await p.waitForTimeout(500);
console.log('after wrap:', await p.evaluate(() => { const S = window.__game.S(); return { day: S.day, wave: S.wave, fan: S.fan, bites: S.bites, lv: S.lv }; }), await p.locator('#log').innerText());
await bot(p, 20); await p.screenshot({ path: '/tmp/ade/play-friday.png' });
// Sunday: live ending
p = await open({ ...card, day: 6, wave: 52, best: 52, big: 0 });
await bot(p, 34);
console.log('ending hidden?', await p.locator('#ending').isHidden(), await p.evaluate(() => window.__game.S().record));
await p.screenshot({ path: '/tmp/ade/play-end.png', fullPage: true });
await b.close(); srv.close(); process.exit(0);
