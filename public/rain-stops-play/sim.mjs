// Pacing sim: node public/rain-stops-play/sim.mjs [--quiet]
// A reasonable player: one rub every ~1.3 s, on the ball when there's play and it isn't shiny yet,
// otherwise on the mortar. Doses Reg whenever a dose is affordable, otherwise buys the cheapest
// affordable thing in either tab. Plays in sittings of 30 minutes with 3 hours away between them.
import * as E from './economy.mjs';

export function run(log = true, { sitting = 30 * 60, away = 3 * 3600 } = {}) {
  const S = E.defaults();
  const dt = 0.1;
  let t = 0, act = 0, sit = 0, sittings = 1, lastBuy = 0;
  const buys = [], gaps = [], marks = [];
  const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const note = (what) => { buys.push(`${m(t)} ${what}`); gaps.push(t - lastBuy); lastBuy = t; };
  while (!E.finalReady(S) && t < 6 * 3600) {
    t += dt; sit += dt;
    for (const ev of E.tick(S, dt)) if (ev.type === 'fixture') marks.push(`${m(t)} == fixture ${ev.n} done ==`);
    E.reveal(S);
    act += dt;
    if (act >= 1.3) {
      act = 0;
      if (E.playing(S) && S.shine < 1) E.shine(S); else E.rub(S);
    }
    if (E.dose(S)) { note(`DOSE -> comfort ${S.comfort} [rate ${E.fmt(E.layRate(S))}/s, hens ${Math.floor(S.hens)}, br ${Math.floor(S.broodies)}, ro ${S.roosters}]`); if (S.comfort === E.SEASON_AT) marks.push(`${m(t)} == SEASON OPENS ==`); continue; }
    const list = E.items(S).filter(it => E.canBuy(S, it.id)).sort((a, b) => E.cost(S, a.id) / (a.cur === 'cheers' ? 1 : 30) - E.cost(S, b.id) / (b.cur === 'cheers' ? 1 : 30));
    // Hold off on drop-tab buys that would eat more than the next dose's head start, once a dose is near.
    const it = list.find(i => i.cur === 'cheers' || E.cost(S, i.id) < (E.doseCost(S) - S.drops) * 0.6 || E.cost(S, i.id) < E.doseCost(S) * 0.15);
    if (it) { E.buy(S, it.id); note(`${it.name}${it.kind === 'make' ? ' #' + S.n[it.id] : it.kind === 'lv' ? ' L' + S.lv[it.id] : ''} (${E.fmt(E.cost(S, it.id))})`); }
    if (sit >= sitting) {
      sit = 0; sittings++;
      const off = E.offline(S, away);
      marks.push(`${m(t)} -- away 3h: +${E.fmt(off?.drops || 0)} drops, +${E.fmt(off?.cheers || 0)} cheers --`);
    }
  }
  if (log) {
    const all = [...buys, ...marks].sort((a, b) => { const p = s => { const [mm, ss] = s.split(' ')[0].split(':'); return +mm * 60 + +ss; }; return p(a) - p(b); });
    console.log(all.join('\n'));
    const sorted = gaps.slice().sort((a, b) => a - b);
    console.log(`\nFinal ready at ${m(t)} played, ${sittings} sittings, ${buys.length} purchases; median gap ${sorted[sorted.length >> 1].toFixed(0)}s, max gap ${sorted.at(-1).toFixed(0)}s`);
    console.log(`hens ${Math.floor(S.hens)} broodies ${Math.floor(S.broodies)} roosters ${S.roosters}, total drops ${E.fmt(S.total)}, cheers ${E.fmt(S.cheersTotal)}`);
    // Longest gaps, and when.
    const idx = gaps.map((g, i) => [g, i]).sort((a, b) => b[0] - a[0]).slice(0, 6);
    console.log('longest gaps before: ' + idx.map(([g, i]) => `${buys[i]} (${g.toFixed(0)}s)`).join(' | '));
  }
  return { t, sittings };
}
if (import.meta.url === `file://${process.argv[1]}`) run(!process.argv.includes('--quiet'));
