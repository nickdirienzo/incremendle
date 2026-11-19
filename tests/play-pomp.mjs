// Plays Pomp and Compost for real in headless Chromium: catches socks by keeping the trumpet under the lowest
// one, buys things, then loads a save at the start of each phase (Rule Two, the showdown) and plays it, and
// catches the will for the real ending. Screenshots go to tests/screenshots/pomp-*.png.
//   node tests/play-pomp.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '../tools/serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'tests', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const server = await serve(path.join(ROOT, 'public'));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const KEY = 'di:29:save';
let fails = 0;
const ok = (name, cond, detail = '') => { console.log(`${cond ? '  ok  ' : '  FAIL'} ${name}${detail ? ` (${detail})` : ''}`); if (!cond) fails++; };

async function open(save, { width = 1280, height = 900 } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  if (save) await ctx.addInitScript(([k, v]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem(k, v); } }, [KEY, JSON.stringify(save)]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  if (!fs.existsSync(path.join(ROOT, 'public/pomp-and-compost/music.mjs')))
    await page.route('**/pomp-and-compost/music.mjs', r => r.fulfill({ contentType: 'text/javascript', body: 'export const phases={};export function createSoundtrack(S){return k=>[k,S.silence,0.3];}' }));
  await page.goto(`${base}/pomp-and-compost/?debug`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  return { page, ctx, errors };
}
// Keep the trumpet under the lowest sock for `secs`, buying the cheapest affordable thing as we go.
async function play(page, secs, { buy = true } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < secs * 1000) {
    await page.evaluate(() => {
      const G = window.__game, s = G.socks.filter(s => s.y < 400).sort((a, b) => b.y - a.y)[0];
      if (s) G.aim(s.x);
    });
    if (buy) await page.evaluate(() => { const b = [...document.querySelectorAll('#shop button.can')][0]; if (b) b.click(); });
    await page.waitForTimeout(120);
  }
}
const canvasClick = async page => { const b = await page.locator('canvas#stage').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height * 0.7); };

// 1. A fresh start, played for a minute.
{
  const { page, ctx, errors } = await open(null);
  await page.screenshot({ path: path.join(SHOTS, 'pomp-1-start.png') });
  await canvasClick(page);
  await play(page, 60);
  const S = await page.evaluate(() => window.__game.S());
  ok('fresh start: caught socks and bought things', S.caught > 5 && Object.values(S.lv).some(v => v > 0), `caught ${S.caught}, soil ${S.soil.toFixed(1)}`);
  await page.screenshot({ path: path.join(SHOTS, 'pomp-2-opening.png') });
  ok('no errors (opening)', !errors.length, errors.join(' | '));
  await ctx.close();
}
const lvAll = (f) => ({ worms: 10 * f, footman: 8 * f, bell: 5 * f, bins: 6 * f, umbrella: 5 * f, pegs: 0, labels: 0 });
// 2. The Book complete, about to hand it in; hand it in and play the pairs.
{
  const cat = { monday: 1, hunting: 1, bed: 1, argyle: 1, skating: 1, christening: 1, toe: 1, football: 1, holey: 1, message: 1, stocking: 1, coronation: 1 };
  const seen = { worms: 1, footman: 1, bell: 1, bins: 1, post: 1, gnome: 1, glass: 1, portrait: 1, umbrella: 1, rope: 1, sign: 1 };
  const save = { started: true, phase: 1, soil: 40, soilSeen: 900, soilTotal: 900, dropped: 1000, cat, seen, lv: lvAll(1), one: { post: true, gnome: true, glass: true, portrait: true }, t: 1500, savedAt: Date.now() };
  const { page, ctx, errors } = await open(save);
  await page.screenshot({ path: path.join(SHOTS, 'pomp-3-book-ready.png') });
  ok('the Book button shows', await page.locator('#bookBtn').isVisible());
  await page.locator('#bookBtn').click({ force: true });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, 'pomp-4-rule-two.png') });
  await play(page, 45);
  const S = await page.evaluate(() => window.__game.S());
  ok('Rule Two: phase 2, socks on the line or paired', S.phase === 2 && (S.line.length > 0 || Object.keys(S.paired).length > 0), `line ${S.line.length}, paired ${Object.keys(S.paired).length}`);
  await page.screenshot({ path: path.join(SHOTS, 'pomp-5-pairs.png') });
  // Reload mid-phase: resumes in phase 2.
  await page.reload(); await page.waitForTimeout(800);
  const R = await page.evaluate(() => window.__game.S());
  ok('reload resumes Rule Two', R.phase === 2 && R.bookIn);
  ok('no errors (rule two)', !errors.length, errors.join(' | '));
  await ctx.close();
}
// 3. The attic empty: knock, play the showdown, catch the will, see the real ending.
{
  const cat = Object.fromEntries(['monday', 'hunting', 'bed', 'argyle', 'skating', 'christening', 'toe', 'football', 'holey', 'message', 'stocking', 'coronation'].map(k => [k, 1]));
  const save = { started: true, phase: 2, bookIn: true, soil: 12, soilSeen: 3000, soilTotal: 3000, dropped: 99999, cat, paired: cat, lv: { ...lvAll(1), pegs: 6, labels: 4 }, one: { post: true, gnome: true, glass: true, portrait: true, rope: true, sign: true, crest: true }, t: 4300, savedAt: Date.now() };
  save.dropped = 3240;
  const { page, ctx, errors } = await open(save);
  ok('the attic door shows', await page.locator('#doorBtn').isVisible());
  await page.locator('#doorBtn').click({ force: true });
  await page.waitForTimeout(500);
  await play(page, 8, { buy: false });
  await page.screenshot({ path: path.join(SHOTS, 'pomp-6-showdown.png') });
  for (let i = 0; i < 30 && !(await page.locator('#ending').isVisible()); i++) await play(page, 5, { buy: false });
  const S = await page.evaluate(() => window.__game.S());
  ok('the showdown ends in the ending', await page.locator('#ending').isVisible(), `pairs ${S.sd?.pairs}, will ${S.sd?.will}`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS, 'pomp-7-ending.png'), fullPage: true });
  ok('no errors (showdown)', !errors.length, errors.join(' | '));
  await ctx.close();
}
await browser.close();
server.close();
console.log(fails ? `${fails} failed` : 'all ok');
process.exit(fails ? 1 : 0);
