// Pacing sim for But Wait, There's Moon: node public/but-wait-theres-moon/sim.mjs [seed]
// A reasonable player: one flick every 1.3 s. Splits a clump once it has been visible for ~3 s (or sooner if it is
// about to drop), otherwise flicks the box. Buys the cheapest affordable thing. Reads the labels as they come
// (the Read Every Manual testimonial after the 8th item shows up), lands a top flick and a hat trick now and then.
import * as E from './economy.mjs';

let seed = Number(process.argv[2] || 7);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const S = E.fresh(); S.started = true;
const ACT = 1.3, NOTICE = 3;
let t = 0;
const log = [];
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const mark = w => log.push(`${fmtT(t)}  ${w}`);
let lastBuy = 0; const gaps = []; const born = new Map(); const freedAt = [];
let nextMin = 60;
function advance(dt) {
  const steps = Math.round(dt / 0.1);
  for (let i = 0; i < steps; i++) {
    t += 0.1;
    for (const e of E.tick(S, 0.1, rnd)) {
      if (e.type === 'phase') mark(`==== ${E.BOXES[S.phase].name}: ${E.BOXES[S.phase].sub} (${E.up(S)} up, ${E.totalKnots(S)} knots in the box)`);
      if (e.type === 'clump') for (const id of e.ids) born.set(id, t);
      if (e.type === 'drop') mark(`   drop! ${e.ids.length} moons back in the box`);
      if (e.type === 'free') freedAt.push(t);
      if (e.type === 'crunch') mark('==== CRUNCH');
    }
  }
  if (t >= nextMin) { nextMin += 60; mark(`   · ${E.up(S)} up, box ${S.box.length} (${E.totalKnots(S)} knots), ${E.BOXES[S.phase].cur} ${E.short(S.cur)} (+${E.income(S).toFixed(2)}/s), power ${E.power(S)}, auto ${E.autoRate(S).toFixed(2)}/s, clumps ${E.clumpRate(S).toFixed(3)}/s, ×${E.mult(S).toFixed(2)}`); }
  for (const id of E.reveal(S)) { mark(`   + shows: ${E.BY_ID[id].name}`); if (!S.read.includes(id)) S.read.push(id); }
  for (const a of E.checkCounts(S)) mark(`   ★ ${E.T_BY_ID[a].name}`);
  for (;;) {
    const can = E.visible(S).filter(it => E.cost(S, it.id) <= S.cur).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
    if (!can.length) break;
    const it = can[0], c = E.cost(S, it.id);
    E.buy(S, it.id);
    gaps.push(t - lastBuy); lastBuy = t;
    mark(`buy ${it.name}${it.kind === 'lv' ? ' ' + E.lv(S, it.id) : ''} (${c})`);
  }
}
while (!S.crunch && t < 2 * 3600) {
  advance(ACT);
  const clumped = S.sky.filter(m => m.c && (t - born.get(m.id) >= NOTICE || m.t < 2.5));
  if (clumped.length) {
    const m = clumped[0];
    const r = E.flickMoon(S, m.id);
    if (r && r.left < 3 && E.award(S, 'split') + 0 >= 0) { if (E.award(S, 'close')) mark('   ★ Just in Time'); }
    if (E.award(S, 'split')) mark('   ★ Personal Space');
    continue;
  }
  const r = E.flickBox(S, 0.6);
  if (r.freed.length) {
    freedAt.push(t);
    if (r.clean && E.award(S, 'clean')) mark('   ★ One-Flick Wonder');
    if (rnd() < 0.15 && E.award(S, 'top')) mark('   ★ Top Shelf');
    if (freedAt.filter(x => x > t - 6).length >= 3 && E.award(S, 'hat')) mark('   ★ Hat Trick');
  }
}
console.log(log.join('\n'));
gaps.sort((a, b) => a - b);
console.log(`\nfinished in ${fmtT(t)} · purchases ${gaps.length} · median gap ${gaps[gaps.length >> 1].toFixed(0)} s · longest gap ${gaps[gaps.length - 1].toFixed(0)} s · flicks ${S.stats.flicks} · splits ${S.stats.splits} · clumps ${S.stats.clumps} · drops ${S.stats.drops} · testimonials ${S.ach.length}`);
