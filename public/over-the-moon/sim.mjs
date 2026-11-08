// Headless pacing sim: node public/over-the-moon/sim.mjs [-v] [rain|bottle] [sit=30] [away=180]
// A reasonable player: one swipe every ~1.3 s that flicks up to 12 puffed umbrellas (a swipe
// crosses about a shelf and a half), buys the cheapest thing it can afford (skipping a swipe to do
// it), makes the cloud choice ten seconds after reaching it, and plays in sittings of `sit` minutes
// with `away` minutes of offline progress between them.
import * as E from './economy.mjs';

const V = process.argv.includes('-v');
const CHOICE = process.argv.find(a => a === 'rain' || a === 'bottle') || 'rain';
const arg = (k, d) => +(process.argv.find(a => a.startsWith(k + '='))?.split('=')[1] ?? d);
const SIT = arg('sit', 30) * 60, AWAY = arg('away', 180) * 60;
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const S = E.newState();
const log = [];
const mark = what => log.push([S.t, what, E.height(S.alt), E.money(E.tipRate(S)) + '/s', E.LINE[S.line] ? E.money(E.LINE[S.line].cost) : '']);
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let played = 0, sittings = 1, sitT = 0, stuckAt = null, lastPhase = E.phase(S);
const DT = 0.1;

while (!S.landed && played < 4 * 3600) {
  // A swipe.
  const ripe = S.cr.map((p, i) => [p, i]).filter(([p]) => p >= 1).slice(0, 12);
  for (const [, i] of ripe) E.flick(S, i);
  // Look at the shop: buy the cheapest affordable thing.
  const its = E.items(S).filter(it => E.canBuy(S, it.id)).sort((a, b) => a.price - b.price);
  let gap = 1.3 + (rnd() - 0.5) * 0.4;
  if (its.length) { E.reveal(S); E.buy(S, its[0].id); mark(`${its[0].name}${its[0].kind === 'level' ? ' ' + (its[0].level + (its[0].id === 'crock' ? 1 : 1)) : ''}`); gap += 1.3; }
  if (E.choiceDue(S)) {
    if (stuckAt == null) stuckAt = S.t;
    if (S.t - stuckAt > 10) { E.choose(S, CHOICE); E.release(S); mark(`** CLOUD: ${CHOICE} **`); }
  }
  for (let t = 0; t < gap; t += DT) E.tick(S, DT);
  played += gap; sitT += gap;
  const ph = E.phase(S);
  if (ph !== lastPhase) { mark(`== phase ${ph} at ${E.height(S.alt)} ==`); lastPhase = ph; }
  if (sitT >= SIT && !E.pulled(S)) {
    const r = E.offline(S, AWAY);
    mark(`-- away ${AWAY / 60} min: +${E.height(r ? r.alt : 0)}, +${E.money(r ? r.tips : 0)} --`);
    sittings++; sitT = 0;
  }
}
const buys = log.filter(([, w]) => !/^(\*\*|==|--)/.test(w));
console.log(`choice ${CHOICE}: landed ${S.landed} after ${fmtT(played)} played, ${sittings} sittings, ${buys.length} purchases, line ${S.line}/${E.LINE.length}, crocks ${S.lv.crock}, chefs ${S.lv.chef}, basket ${S.lv.basket}`);
let prev = 0, maxGap = 0, maxAt = 0;
for (const [t, w] of buys) { if (t - prev > maxGap) { maxGap = t - prev; maxAt = t; } prev = t; }
console.log(`mean gap ${(S.t / buys.length).toFixed(1)}s, longest ${maxGap.toFixed(0)}s ending ${fmtT(maxAt)}`);
// Gaps per 10-minute window.
for (let w = 0; w < S.t; w += 600) {
  const n = buys.filter(([t]) => t >= w && t < w + 600).length;
  console.log(`${fmtT(w).padStart(6)}  ${String(n).padStart(3)} buys  ${'#'.repeat(n)}`);
}
if (V) for (const [t, w] of log) console.log(fmtT(t).padStart(6), w);
else for (const [t, w, a, r] of log) if (/^(\*\*|==|--)/.test(w) || E.LINE.some(u => u.name === w)) console.log(fmtT(t).padStart(6), w.padEnd(28), a || '', r || '');
