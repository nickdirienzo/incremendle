// Headless pacing sim: node public/wilt-your-way-to-wealth/sim.mjs [sitting minutes] [hours away] [-v]
// A reasonable player: scratches the kite on the board most of the time (three quarters of the
// time at four fifths of the tearing speed, with half the strokes overlapping), tears a kite now and
// then, checks the Exchange every ~6 s and sells what's at or above its usual price (not all of it
// at once), buys the cheapest affordable thing (a taller stalk first, when it can), plays every sky
// event (rumours: sell that scrap; gluts: hold it), and takes ~2 minutes over the showdown.
import * as E from './economy.mjs';

const SIT = Number(process.argv[2] || 30) * 60, AWAY = Number(process.argv[3] || 3) * 3600;
const V = process.argv.includes('-v');
const rnd = E.rng(7); E.setRandom(rnd);
const S = E.newState();
const log = [];
let incRate = 0, lastEarn = 0, kitesAt = 0, valAt = 0;
let played = 0, sittings = 1, sitT = 0, sellT = 0;
const mark = what => log.push([played, what]);
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const DT = 0.1;
E.nextKite(S);
while (!S.ended && played < 6 * 3600) {
  const o = E.step(S, DT);
  if (o.ev === 'start') mark(`  ~ ${E.EVENTS[S.ev.id].name}${S.ev.mat ? ' (' + S.ev.mat + ')' : ''}`);
  played += DT; sitT += DT; sellT += DT;
  if (S.cur) {
    const rate = 2 * E.radius(S) * 0.8 * E.tearSpeed(S) * 0.45 * 0.75;
    S.cur.clean += rate * DT / E.kiteArea(S.cur);
    if (rnd() < DT * 0.08) E.tear(S);
    if (S.cur.clean >= E.DONE) { E.recycle(S); played += 0.6; }
  }
  if (!S.cur) E.nextKite(S);
  if (sellT >= 6) {
    sellT = 0;
    for (const m of E.unlockedMats(S)) {
      if (S.inv[m] <= 0) continue;
      const good = E.fair(S, m) >= E.MATS[m].base * 0.95 && !(S.ev?.id === 'glut' && S.ev.mat === m);
      const d = E.depth(S, m);
      if (good && S.mk[m].sat > 0.6) E.sell(S, m, Math.min(S.inv[m], d * Math.log(S.mk[m].sat / 0.5)));
      else if (S.inv[m] > 4 * d) E.sell(S, m, S.inv[m] - 3 * d);
    }
  }
  if (E.ready(S)) { mark(`*** $1M earned: the Tremendous (showdown) ***`); played += 120; S.ended = true; break; }
  for (let k = 0; k < 20; k++) {
    const opts = [];
    for (const u of E.items(S)) if (S.cash >= u.cost) opts.push({ c: u.cost, go: () => E.buy(S, u.id), n: u.name });
    for (const id of Object.keys(E.LINES)) if (!E.lineMax(S, id) && S.cash >= E.lineCostOf(S, id)) opts.push({ c: E.lineCostOf(S, id), go: () => E.buyLine(S, id), n: id === 'stalk' ? `=== STALK ${S.tier + 1} (${E.STALK_NAMES[S.tier + 1]}) ===` : `${E.LINES[id].name} ${S.lv[id] + 1}`, pri: id === 'stalk' });
    if (E.wormsOpen(S) && S.cash >= E.wormCost(S)) opts.push({ c: E.wormCost(S), go: () => E.buyWorm(S), n: 'worm', rep: 1 });
    if (E.snagOpen(S) && S.cash >= E.lineCost(S)) opts.push({ c: E.lineCost(S), go: () => E.buySnag(S), n: 'snag line', rep: 1 });
    // Saving up: once the next stalk is within ~4 minutes of income, only small things get bought.
    const sc = E.lineMax(S, 'stalk') ? Infinity : E.lineCostOf(S, 'stalk');
    if (sc <= incRate * 300 && S.cash < sc) for (let i = opts.length - 1; i >= 0; i--) if (opts[i].c > sc * 0.04) opts.splice(i, 1);
    if (!opts.length) break;
    opts.sort((a, b) => (b.pri ? 1 : 0) - (a.pri ? 1 : 0) || a.c - b.c);
    if (opts[0].go()) mark(opts[0].n); else break;
  }
  if (Math.floor(played / 30) !== Math.floor((played - DT) / 30)) { incRate = (S.earned - lastEarn) / 30; lastEarn = S.earned; }
  if (sitT >= SIT && !S.ended) { const got = E.offline(S, AWAY); sittings++; sitT = 0; mark(`--- away ${AWAY / 3600}h: ${got ? got.kites : 0} kites, +${E.money(got ? got.cash : 0)} ---`); }
  if (V && Math.floor(played / 300) !== Math.floor((played - DT) / 300)) mark(`    [${fmtT(played)}] earned ${E.money(S.earned)} cash ${E.money(S.cash)} kites ${S.kites} worms ${S.wormN} lines ${S.lines} queue ${S.queue} inc ${E.money(incRate)}/s inv ${Object.entries(S.inv).filter(([,q])=>q>0).map(([m,q])=>m+':'+Math.round(q)).join(' ')} sat ${E.unlockedMats(S).map(m=>S.mk[m].sat.toFixed(2)).join(' ')}`);
}
let prev = 0; const gaps = [];
for (const [t, what] of log) {
  if (!/^( {2}~|---|\*\*\*| {4}\[)/.test(what) && !what.startsWith('===')) { gaps.push(t - prev); prev = t; }
  const rep = what === 'worm' || what === 'snag line';
  if (V || !rep) console.log(fmtT(t).padStart(6), what);
}
gaps.sort((a, b) => a - b);
const purchases = gaps.length;
console.log(`\nended=${S.ended} played ${fmtT(played)} in ${sittings} sittings · ${S.kites} kites · ${purchases} purchases · worms ${S.wormN} · lines ${S.lines} · median gap ${gaps[gaps.length >> 1].toFixed(1)}s · 90th ${gaps[Math.floor(gaps.length * .9)].toFixed(0)}s · max ${gaps[gaps.length - 1].toFixed(0)}s · events ${S.evN}`);
