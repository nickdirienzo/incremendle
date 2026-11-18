// Pacing sim: node public/dyed-in-the-wool/sim.mjs [--quiet]
// A reasonable player: holds the pot to just about the right shade (hitting the just-right band 85% of
// the time) with a short pause between steeps; brews whichever found colour pays best right now, and
// switches when Vi's copying drags it under another; tries every new cross once when a plant goes in.
// Buys the cheapest affordable thing (the next pot first when it's close), spends ribbons at every
// Fair on the cheapest thing in the Ribbons tab. Plays in sittings of 30 minutes, 3 hours away between.
import * as E from './economy.mjs';

let seed = 12345;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export function run(log = true, { sitting = 30 * 60, away = 3 * 3600, seed: sd = 12345 } = {}) {
  seed = sd;
  const S = E.newState();
  const dt = 0.1;
  let t = 0, act = 0, sit = 0, sittings = 1, lastBuy = 0, hold = 0;
  const buys = [], gaps = [], marks = [];
  const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const note = (what) => { buys.push(`${m(t)} ${what}`); gaps.push(t - lastBuy); lastBuy = t; };
  const best = () => Object.keys(S.found).filter(k => E.unlocked(S, E.pair(k)[0])).sort((a, b) => E.pricePerYard(S, b) - E.pricePerYard(S, a))[0];
  let stage = 0;
  while (S.total < E.TARGET && t < 12 * 3600) {
    t += dt; sit += dt;
    for (const ev of E.tick(S, dt, rnd)) {
      if (ev.type === 'fair') {
        marks.push(`${m(t)} == FAIR, summer ${S.season}: ${E.fmt(S.lastYards)} yd -> ${S.lastRibbons} ribbons (pot ${E.POTS[S.pot].name}, kettles ${S.kettles}) ==`);
        // spend ribbons, cheapest first
        for (;;) {
          const it = E.items(S).filter(i => i.cur === 'r' && E.canBuy(S, i.id)).sort((a, b) => a.cost - b.cost)[0];
          if (!it) break;
          E.buy(S, it.id); note(`  [R] ${it.name}${it.kind === 'lv' ? ' L' + S.lv[it.id] : ''} (${E.fmt(it.cost)})`);
        }
        t += 20; // reading the Fair
        E.nextSummer(S);
        marks.push(`${m(t)} -- summer ${S.season} (${m(E.summerLength(S))}) --`);
      }
    }
    if (E.cosyStage(S) > stage) { stage = E.cosyStage(S); marks.push(`${m(t)} ** cosy: ${E.COSY[stage - 1][1]} **`); }
    if (S.fair) continue;
    // what to brew: an untried cross first, else the best payer (switch only if clearly better)
    const untried = [];
    for (let i = 0; i < S.plants; i++) for (let j = 0; j <= i; j++) if (!S.found[E.key(i, j)]) untried.push(E.key(i, j));
    if (hold === 0) {
      if (untried.length) E.choose(S, untried[0]);
      else { const b = best(); if (b !== S.sel && E.pricePerYard(S, b) > E.pricePerYard(S, S.sel) * 1.25) E.choose(S, b); }
    }
    act += dt;
    const target = E.steepTime(S) * (rnd() < 0.85 ? 0.9 : 1.15);
    if (act >= 0.45) {
      hold += dt;
      if (hold >= target) { E.steep(S, hold / E.steepTime(S)); hold = 0; act = 0; }
    }
    // shopping
    if (E.canPot(S)) { E.buyPot(S); note(`Pot: ${E.POTS[S.pot].name} (${E.fmt(E.POTS[S.pot].cost)})`); continue; }
    const opts = E.items(S).filter(i => i.cur === 'p' && E.canBuy(S, i.id)).map(i => ({ id: i.id, c: i.cost, name: i.name }));
    if (E.canBall(S)) opts.push({ id: 'ball#', c: E.ballCost(S), name: 'Another Ball' });
    if (E.canKettle(S)) opts.push({ id: 'kettle#', c: E.kettleCost(S), name: 'Kettle' });
    opts.sort((a, b) => a.c - b.c);
    const o = opts[0];
    if (o && (o.c < E.potCost(S) * 0.4 || E.pot + 1 >= E.POTS.length)) {
      if (o.id === 'kettle#') { const n = E.buyKettle(S, 99); note(`Kettle x${n} -> ${S.kettles} (${E.fmt(o.c)})`); }
      else if (o.id === 'ball#') { const n = E.buyBall(S, 99); note(`Ball x${n} -> ${S.balls} (${E.fmt(o.c)})`); }
      else { E.buy(S, o.id); note(`${o.name}${S.lv[o.id] ? ' L' + S.lv[o.id] : ''} (${E.fmt(o.c)})`); }
    }
    if (sit >= sitting) {
      sit = 0; sittings++;
      const off = E.offline(S, away);
      marks.push(`${m(t)} -- away 3h: +${E.fmt(off?.yards || 0)} yd --`);
    }
  }
  if (log) {
    const p = s => { const [mm, ss] = s.trim().split(' ')[0].split(':'); return +mm * 60 + +ss; };
    const all = [...buys, ...marks].sort((a, b) => p(a) - p(b));
    if (!process.argv.includes('--brief')) console.log(all.join('\n')); else console.log(marks.join('\n'));
    const sorted = gaps.slice().sort((a, b) => a - b);
    console.log(`\nTarget at ${m(t)} played (${(t / 3600).toFixed(2)} h), ${S.season} summers, ${sittings} sittings, ${buys.length} purchases; median gap ${sorted[sorted.length >> 1].toFixed(0)}s, max gap ${sorted.at(-1).toFixed(0)}s`);
    const idx = gaps.map((g, i) => [g, i]).sort((a, b) => b[0] - a[0]).slice(0, 6);
    console.log('longest gaps before: ' + idx.map(([g, i]) => `${buys[i]} (${g.toFixed(0)}s)`).join(' | '));
  }
  return { t, sittings, seasons: S.season, hist: S.history.map(h => h.rung), gaps };
}
if (import.meta.url === `file://${process.argv[1]}`) run(!process.argv.includes('--quiet'));
