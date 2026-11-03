// Temporary screenshot helper for building Gilda's Last Card (deleted before commit).
import { chromium } from 'playwright';
import fs from 'node:fs';
const [,, name = 'shot', saveJson = '', w = '1280', h = '900', actions = ''] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +(process.env.DPR || 1), hasTouch: +w < 500, isMobile: +w < 500 });
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
if (!fs.existsSync('public/gildas-last-card/music.mjs')) await page.route('**/gildas-last-card/music.mjs', r => r.fulfill({ contentType: 'text/javascript', body: 'export const phases={}; export function createSoundtrack(S){ return k => [k, S.silence, 0.5]; }' }));
await page.addInitScript(s => { if (s) localStorage.setItem('di:13:save', s); }, saveJson);
await page.goto('http://localhost:8080/gildas-last-card/' + (actions.includes('sprites') ? '?sprites' : ''));
await page.waitForTimeout(1500);
for (const a of actions.split(';').filter(Boolean)) {
  const [k, ...v] = a.split(':');
  if (k === 'click') { const [x, y] = v.map(Number); await page.mouse.click(x, y); await page.waitForTimeout(150); }
  if (k === 'drag') { const [x1, y1, x2, y2] = v.map(Number); await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move((x1 + x2) / 2, (y1 + y2) / 2, { steps: 4 }); await page.mouse.move(x2, y2, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(200); }
  if (k === 'wait') await page.waitForTimeout(+v[0]);
  if (k === 'hover') { await page.hover(v.join(':')); await page.waitForTimeout(200); }
  if (k === 'eval') console.log(await page.evaluate(v.join(':')));
}
await page.screenshot({ path: `/tmp/${name}.png`, fullPage: actions.includes('full'), ...(process.env.CLIP ? { clip: JSON.parse(process.env.CLIP) } : {}) });
console.log(errs.join('\n') || 'no errors');
await browser.close();
