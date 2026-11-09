// Headless pacing sim: node public/fair-weather/sim.mjs [-v] [sit=30] [away=180] [stall=150]
// A reasonable player: one action every ~1.3 s. Sews a pearl when it matches a chalk outline;
// dusts a gritty pearl worth having; otherwise merges the smallest twins (into the cup further
// east, keeping the big ones in the lee); tosses the smallest pearl if the deck is full with no
// twins. Buys the cheapest affordable thing (that costs an action). Goes to the Fair once the
// season's best pearl hasn't grown for `stall` seconds. Plays in sittings of `sit` minutes with
// `away` minutes of time away between them.
import * as E from './economy.mjs';

const V = process.argv.includes('-v');
const arg = (k, d) => +(process.argv.find(a => a.startsWith(k + '='))?.split('=')[1] ?? d);
const SIT = arg('sit', 30) * 60, AWAY = arg('away', 180) * 60, STALL = arg('stall', 150);
let seed = 12;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const S = E.freshDeck(E.newState());
const log = [];
const fmtT = t => `${Math.floor(t / 3600)}:${String(Math.floor(t % 3600 / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const mark = what => log.push([played, what, `${E.pence(E.income(S))}/s`, `best ${S.best}`]);
let seasons = [], seasonStart = 0;
let played = 0, sittings = 1, sitT = 0, bestAt = 0, bestWas = 0;
const DT = 0.25;

function act() {
  // Sew.
  const open = E.hoop(S) ? E.openSpots(S) : [];
  for (const s of open) {
    const i = E.pearls(S).find(i => S.deck[i].t === s.t);
    if (i != null && E.sew(S, i, s.k)) { mark(`  sew ${E.tierName(s.t)} (${E.SAIL[s.panel].name})`); return; }
  }
  const ps = E.pearls(S);
  const topT = Math.max(0, ...ps.map(i => S.deck[i].t));
  // Dust a good gritty pearl.
  const g = ps.filter(i => S.deck[i].d && S.deck[i].t >= topT - 2).sort((a, b) => S.deck[b].t - S.deck[a].t);
  if (g.length && !(S.lv.duster > 3)) { E.dust(S, g[0]); return; }
  // Merge the smallest twins, into the eastern cup.
  const by = {};
  for (const i of ps) (by[S.deck[i].t] ||= []).push(i);
  const ts = Object.keys(by).map(Number).filter(t => by[t].length >= 2 && t < E.TOP).sort((a, b) => a - b);
  if (ts.length) {
    const l = by[ts[0]].sort((a, b) => a % E.MAXC - b % E.MAXC);
    E.merge(S, l[0], l[l.length - 1]); return;
  }
  if (!E.empties(S).length && ps.length) {
    const small = ps.sort((a, b) => S.deck[a].t - S.deck[b].t)[0];
    E.toss(S, small); return;
  }
  const any = ps.filter(i => S.deck[i].d);
  if (any.length) E.dust(S, any[0]);
}

while (!S.finale && played < 12 * 3600) {
  act();
  let gap = 1.3 + (rnd() - 0.5) * 0.4;
  E.reveal(S);
  const its = E.items(S).filter(it => E.canBuy(S, it.id)).sort((a, b) => (a.cur === b.cur ? a.price - b.price : a.cur === 'r' ? -1 : 1));
  if (its.length) { const it = its[0]; E.buy(S, it.id); mark(`${it.name}${it.kind === 'level' ? ' ' + (it.level + 1) : ''}${it.cur === 'r' ? ' (ribbons)' : ''}`); gap += 1.3; }
  for (let t = 0; t < gap; t += DT) E.tick(S, DT);
  played += gap; sitT += gap;
  if (S.best > bestWas) { bestWas = S.best; bestAt = played; }
  // Wait for the next sail pearl if it's within about ten minutes; otherwise go when stalled.
  const need = E.hoop(S) ? Math.min(99, ...E.openSpots(S).map(s => s.t)) : 99;
  const mRate = 0.75 + (S.lv.pair ? 1 / E.pairTime(S) : 0);
  const eta = Math.pow(2, Math.max(0, need - E.seedTier(S))) / mRate;
  const waiting = need <= S.best + 2 && eta < 600 + (played - bestAt);
  if (E.fairOpen(S) && played - bestAt > STALL && !waiting) {
    // Sew whatever matches first.
    for (let k = 0; k < 4; k++) act();
    const b = S.best, got = E.fair(S);
    seasons.push([played - seasonStart, b, got]); seasonStart = played;
    mark(`** FAIR ${S.fairs}: showed a ${E.tierName(b)}, Regina a ${E.tierName(Math.min(E.TOP, b + 1))}; +${got} ribbons (have ${S.ribbons}); sail ${Math.round(E.progress(S) * 100)}% **`);
    bestWas = S.best; bestAt = played;
  }
  if (sitT >= SIT && !S.finale) {
    const r = E.offline(S, AWAY);
    mark(`-- away ${AWAY / 60} min: +${E.pence(r ? r.pennies : 0)}, ${r ? r.dived : 0} dived, ${r ? r.paired : 0} paired --`);
    sittings++; sitT = 0;
  }
}
const buys = log.filter(([, w]) => !/^(\*\*|--|  )/.test(w));
const fairs = log.filter(([, w]) => w.startsWith('**')).length;
console.log(`finished ${S.finale} after ${fmtT(played)} played, ${sittings} sittings, ${fairs} fairs, ${buys.length} purchases, sewn ${S.sewnN}/${E.SPOTS.length}, best ever ${E.tierName(S.bestAll)}, pennies all ${E.pence(S.pAll)}, ribbons all ${S.rAll}`);
console.log('seasons (min, best, ribbons):', seasons.map(([d, b, g]) => `${(d / 60).toFixed(0)}m/${b}/${g}`).join(' '));
let prev = 0, maxGap = 0, maxAt = 0;
for (const [t] of buys) { if (t - prev > maxGap) { maxGap = t - prev; maxAt = t; } prev = t; }
console.log(`mean gap ${(played / buys.length).toFixed(1)}s, longest ${maxGap.toFixed(0)}s ending ${fmtT(maxAt)}`);
for (let w = 0; w < played; w += 600) {
  const n = buys.filter(([t]) => t >= w && t < w + 600).length;
  const ev = log.filter(([t, x]) => t >= w && t < w + 600 && /^(\*\*|  sew)/.test(x)).map(([, x]) => x.startsWith('**') ? 'F' : 's').join('');
  console.log(`${fmtT(w).padStart(8)}  ${String(n).padStart(3)} buys  ${'#'.repeat(Math.min(60, n)).padEnd(60)} ${ev}`);
}
if (V) for (const [t, w, a, b] of log) console.log(fmtT(t).padStart(8), w.padEnd(44), a, b);
else for (const [t, w, a, b] of log) if (/^(\*\*|--|  sew)/.test(w)) console.log(fmtT(t).padStart(8), w, a, b);
