// Pacing sim for Hold Your Hats: node public/hold-your-hats/sim.mjs [flickEvery] [idle]
// A reasonable player flicks at the front gust about every 1.3 s while gusts are on screen, and buys the cheapest
// affordable thing (one at a time, a short pause to read each). Real players take longer than this.
import * as E from './economy.mjs';

const FLICK = Number(process.argv[2] || 1.3);
const S = E.fresh(); S.started = true;
let t = 0, nextFlick = 0, lastBuy = 0, nextMin = 60, ended = false;
const gaps = [], log = [];
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const mark = w => log.push(`${fmtT(t)}  ${w}`);
let waveStart = 0, licks = 0;
while (!ended && t < 3 * 3600) {
  const dt = 0.1;
  const ev = E.tick(S, dt); t += dt;
  if (ev.lick) { licks++; mark(`   lick on wave ${S.wave} (fail ${S.fails}), R ${E.short(E.rate(S))}, hunger ${E.short(E.waveHunger(S.wave))}`); }
  if (ev.cleared) { mark(`== wave ${ev.cleared} cleared (${E.clock(ev.cleared + 1)}) in ${(t - waveStart).toFixed(0)} s · R ${E.short(E.rate(S))} · heat 1e${S.heat.toFixed(0)}`); waveStart = t; }
  if (ev.end) { ended = true; break; }
  if (FLICK > 0 && t >= nextFlick && E.target(S) >= 0) {
    nextFlick = t + FLICK;
    const r = E.flick(S);
    if (r.cleared) { mark(`== wave ${r.cleared} cleared by flick in ${(t - waveStart).toFixed(0)} s · R ${E.short(E.rate(S))}`); waveStart = t; }
    if (r.end) { ended = true; break; }
  }
  for (const id of E.reveal(S)) mark(`   + shows: ${E.BY_ID[id].name}`);
  if (t - lastBuy > 1.2) {
    const can = E.visible(S).filter(it => E.canBuy(S, it.id)).sort((a, b) => E.costLog(S, a.id) - E.costLog(S, b.id));
    if (can.length) {
      const it = can[0], c = E.cost(S, it.id);
      E.buy(S, it.id); gaps.push(t - lastBuy); lastBuy = t;
      mark(`buy ${it.id === 'recipe' ? E.recipe(S).name : it.name}${it.kind === 'lv' ? ' ' + S.lv[it.id] : ''} (${E.short(c)}) R ${E.short(E.rate(S))}`);
    }
  }
  if (t >= nextMin) { nextMin += 60; mark(`   · wave ${S.wave}, hats ${E.short(S.hats)}, R ${E.short(E.rate(S))}/s`); }
}
console.log(log.join('\n'));
gaps.sort((a, b) => a - b);
console.log(`\n${ended ? 'finished' : 'NOT finished'} in ${fmtT(t)} · wave ${S.wave} · purchases ${gaps.length} · median gap ${gaps[gaps.length >> 1]?.toFixed(0)} s · 90% gap ${gaps[Math.floor(gaps.length * 0.9)]?.toFixed(0)} s · longest ${gaps[gaps.length - 1]?.toFixed(0)} s · licks ${licks} · ovens ${E.lv(S, 'oven')}`);
