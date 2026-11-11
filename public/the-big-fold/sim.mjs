// Pacing sim: node public/the-big-fold/sim.mjs
// A reasonable player: sorts a letter by hand every ~1.3 s (one in twenty into the wrong pigeonhole),
// buys the cheapest affordable thing, moves cranes a few seconds after a rush starts and back after it
// ends (by hand at first, with MATCH once the clipboard is bought), and feeds the Great Frog every
// ten seconds once it's open, after saving up for the last chute.
import * as E from './economy.mjs';

export function run(log = true) {
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const S = E.defaults();
const dt = 0.1;
let t = 0, sortT = 0, lastBuy = 0, react = null, nRush = 0;
const buys = [], gaps = [], marks = [];
const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
let handType = 0;
while (!E.greatDone(S) && t < 3 * 3600) {
  t += dt;
  E.tick(S, dt);
  const ev = E.tickRush(S, dt, rnd);
  if (ev === 'start') { nRush++; react = t + (S.one.clip ? 2 : 5); }
  if (ev === 'end') react = t + 4;
  if (react != null && t >= react) { E.match(S); react = null; }
  sortT += dt;
  if (sortT >= 1.3) {
    sortT = 0;
    if (rnd() > 0.05) E.handSort(S, S.rush && S.rush.on ? S.rush.type : handType); else E.shredHand(S);
    handType = Math.floor(rnd() * E.types(S));
  }
  E.reveal(S);
  const wantNever = false;
  const opts = E.items(S).filter(i => E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
  // Cranes that would only stand idle aren't worth buying.
  const short = () => { const f = E.flow(S); return f.bins.some(b => b.in > b.cap + 0.01) || E.speed(S) * S.cranes < f.bins.reduce((a, b) => a + b.in, 0) * 1.6; };
  const useful = opts;
  if (useful.length && !(wantNever && useful[0].id !== 'never' && E.cost(S, useful[0].id) > S.frogs * 0.2)) {
    const it = useful[0];
    const ch = S.chute, inc0 = E.flow(S).frogs;
    E.buy(S, it.id);
    if (t - lastBuy > 30) marks.push(`  gap ${Math.round(t - lastBuy)} s before ${m(t)} ${it.name}`);
    gaps.push(t - lastBuy); lastBuy = t;
    buys.push(`${m(t)} ${it.name}${it.kind === 'crane' ? ' ' + S.cranes : it.kind === 'fold' ? ' ' + S.fold : ''}`);
    if (S.chute !== ch) marks.push(`${m(t)} ── ${E.chute(S).name} (${E.fmt(S.total)} frogs so far; income before ${E.fmt(inc0)}/s, after ${E.fmt(E.flow(S).frogs)}/s)`);
  }
  if (E.canFeed(S) && !wantNever && !(useful.length && E.cost(S, useful[0].id) < E.nextCrease(S).cost * 0.25)) {
    if (!S.greatOn) marks.push(`${m(t)} ── the Great Frog`);
    E.feed(S); if (t - lastBuy > 30) marks.push(`  gap ${Math.round(t - lastBuy)} s before ${m(t)} crease`); gaps.push(t - lastBuy); lastBuy = t;
    buys.push(`${m(t)} ★ Great Frog crease ${S.great}`);
  }
}
if (!log) return { t, buys, marks, gaps, S };
console.log(buys.join('\n'));
console.log('\n' + marks.join('\n'));
const late = gaps.filter(g => g > 30).length, worst = Math.max(...gaps);
console.log(`\nEnded at ${m(t)} · ${buys.length} purchases · median gap ${gaps.sort((a, b) => a - b)[gaps.length >> 1].toFixed(1)} s · ${late} gaps over 30 s · longest ${worst.toFixed(0)} s`);
console.log(`cranes ${S.cranes} · fold ${S.fold} · rushes ${nRush} · hand sorts ${S.hand} · Johnny shredded ${E.fmt(S.shred)} letters`);
return { t, buys, marks, gaps, S };
}
if (import.meta.url === `file://${process.argv[1]}`) run();
