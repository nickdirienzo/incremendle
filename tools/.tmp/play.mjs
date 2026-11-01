import { chromium } from 'playwright';
const secs = Number(process.argv[2] || 60), out = process.argv[3] || '/tmp/ep/live.png';
const save = process.argv[4] ? JSON.parse(process.argv[4]) : null;
const phone = process.argv.includes('--phone');
const b = await chromium.launch();
const p = await b.newPage(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 900 } });
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); else if (/EP:/.test(m.text())) console.log(m.text()); });
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
if (save) await p.addInitScript(s => { localStorage.setItem('di:11:save', JSON.stringify(s)); }, save);
await p.goto('http://localhost:8080/eighteen-pleats/?debug'); await p.waitForTimeout(1200);
const t0 = Date.now(); let drops = 0, buys = 0, lastDrop = 0;
while (Date.now() - t0 < secs * 1000) {
  const st = await p.evaluate(() => {
    const G = window.__game, S = G.S(), E = G.E, c = G.clock();
    const top = S.final ? (S.final.stack.length ? S.final.stack[S.final.stack.length - 1].x : 0) : E.topX(S) + E.sway(S, c);
    return { dx: E.hookX(S, c) - top, full: S.hook.n >= E.stats(S).cap, n: S.hook.n, need: S.active ? S.active.want - E.stackN(S) : 99, active: !!S.active, final: !!S.final, ended: S.ended, lowering: S.lowering, slips: S.board.length, quota: !!S.quotaMet };
  });
  if (st.ended) break;
  if (st.quota && !st.final) { const h = await p.$('#handover'); if (h) { await h.click({ force: true }).catch(() => {}); } }
  if (!st.active && st.slips && !st.final) { const s = await p.$('.slip'); if (s) await s.click().catch(() => {}); }
  const ready = st.final || (st.lowering <= 0 && (st.full || st.n >= st.need));
  if (ready && Math.abs(st.dx) < 0.07 && Date.now() - lastDrop > 600) {
    if (phone) await p.tap('#stage'); else await p.click('#stage', { position: { x: 20, y: 20 } }); drops++; lastDrop = Date.now();
  }
  const up = await p.$('.up.can');
  if (up && Math.random() < 0.2) { await up.click().catch(() => {}); if (phone) await up.click().catch(() => {}); buys++; }
  await p.waitForTimeout(25);
}
await p.waitForTimeout(800);
const S = await p.evaluate(() => { const S = window.__game.S(); return { t: Math.round(S.t), served: S.served, chits: S.chits, delivered: S.delivered, topples: S.topples, rejected: S.rejected, ep: S.ep, lv: S.lv, ended: S.ended, nerves: S.nerves.toFixed(2) }; });
await p.screenshot({ path: out });
console.log(JSON.stringify(S), 'drops', drops, 'buys', buys);
console.log(errs.join('\n') || 'no errors');
await b.close();
