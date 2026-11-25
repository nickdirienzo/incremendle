// Headless pacing sim: node public/al-dente-encounters/sim.mjs
// A reasonable player: re-aims every ~1.3 s at the fattest noodle, buys the cheapest affordable thing,
// wraps an episode once the quota is met and the waves have stalled. Sittings: 30 min on, 3 h away.
import * as E from './economy.mjs';
const S = E.load(null); S.started = true;
let B = E.battle(), pos = [300, 360], target = [300, 360], aimT = 0, t = 0, fails = 0, played = 0, sitting = 1, sitT = 0;
const DT = 0.1, log = [], buys = [];
let lastBuy = 0, maxGap = 0, gaps = [];
const fmt = s => `${Math.floor(s / 3600)}h${String(Math.floor(s / 60) % 60).padStart(2, '0')}m`;
let lastBites = 0, bpsT = 0; var spent = 0, popB = 0;
while (!S.ended && t < 14 * 3600) {
  aimT -= DT;
  const auto = E.lv(S, 'auto');
  if (aimT <= 0 || auto) { aimT = 1.3; const n = E.fattest(B); if (n) target = [n.x + 30, n.y]; }
  pos = E.fly(S, pos, E.clampSpot(target), DT);
  const j = E.jitter(S), spot = [pos[0] + (Math.random() - .5) * j * 2, pos[1] + (Math.random() - .5) * j * 2];
  const ev = E.step(S, B, DT, spot, t);
  if (ev.failed) fails++; if (ev.cleared) fails = 0;
  t += DT; played += DT; sitT += DT;
  for (const p of ev.pops) popB += p.b; bpsT += DT; if (bpsT >= 30) { S.bps = S.bps ? S.bps * 0.7 + 0.3 * popB / bpsT : popB / bpsT; popB = 0; bpsT = 0; }
  E.reveal(S);
  // buy cheapest affordable
  for (;;) {
    const opts = E.visible(S).filter(i => E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) / E.wallet(S, a.cur) - E.cost(S, b.id) / E.wallet(S, b.cur));
    if (!opts.length) break;
    const c = E.cost(S, opts[0].id); if (opts[0].cur === 'bites') spent += c;
    E.buy(S, opts[0].id); buys.push([played, opts[0].id]);
    const g = played - lastBuy; gaps.push(g); maxGap = Math.max(maxGap, g); lastBuy = played;
  }
  if (S.day === 6 && S.wave >= E.BIG_WAVE) { S.ended = true; log.push(`${fmt(played)} THE BIG ONE (sitting ${sitting})`); break; }
  if (E.canWrap(S) && fails >= 3) {
    const before = S.best, f = E.wrap(S); fails = 0; B = E.battle();
    log.push(`${fmt(played)} wrap ${E.DAYS[S.day - 1]} at wave ${before}: +${f} fan (total ${S.fanTotal}) bites/s ${S.bps.toFixed(1)}`);
    spent = 0; lastBites = 0;
  }
  if (sitT > 30 * 60) { sitT = 0; sitting++; const a = E.away(S, 3 * 3600); log.push(`${fmt(played)} --- away 3h: +${E.short(a ? a.bites : 0)} bites (wave ${S.wave}, day ${E.DAYS[S.day]})`); }
  if (Math.floor(played) % 600 === 0 && Math.floor(played - DT) % 600 !== 0) log.push(`${fmt(played)}   ${E.DAYS[S.day]} wave ${S.wave} best ${S.best} bites ${E.short(S.bites)} ray ${S.lv.ray||0} drones ${E.drones(S)} lens ${S.lv.lens||0} chop ${S.lv.chop||0}`);
}

console.log(log.join('\n'));
gaps.sort((a, b) => a - b);
console.log(`played ${fmt(played)} in ${sitting} sittings, ${buys.length} buys, median gap ${gaps[gaps.length >> 1]?.toFixed(1)}s, p90 ${gaps[Math.floor(gaps.length * .9)]?.toFixed(1)}s, max ${maxGap.toFixed(0)}s`);
