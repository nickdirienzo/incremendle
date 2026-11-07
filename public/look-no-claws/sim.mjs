// Headless pacing sim: node public/look-no-claws/sim.mjs [-v] [claw|machine|mixed]
// A reasonable player: taps on about four beats in five (looking at the shop the rest of the time),
// 40% perfect, 40% good, 20% off the beat; stops tapping for two beats per purchase; buys the
// cheapest affordable thing; plays each demo as soon as it's booked (passing on the first or second
// try), picks gifts by the strategy given, and holds back for the 40 s finale plus the credits.
import * as E from './economy.mjs';

const V = process.argv.includes('-v');
const STRAT = process.argv.find(a => ['claw', 'machine', 'mixed'].includes(a)) || 'mixed';
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const S = E.newState();
const log = [];
const mark = what => log.push([S.t, what]);
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let busy = 0, demosPlayed = 0;

function play(beats) {
  for (let b = 0; b < beats; b++) {
    E.tick(S, E.BEAT);
    if (busy > 0) { busy--; continue; }
    if (rnd() > 0.8) continue;
    const r = rnd();
    E.herd(S, E.judge(S, r < 0.4 ? 0.03 : r < 0.8 ? 0.11 : 0.3));
  }
}

while (!S.ended && S.t < 3 * 3600) {
  play(1);
  // Demos: count-in, the segment, the gift card.
  const d = E.nextDemo(S);
  if (d) {
    const D = E.DEMOS[d], span = D.pattern === 'half' ? D.beats * 2 : D.pattern === 'double' ? D.beats / 2 : D.beats;
    const tries = rnd() < 0.5 ? 1 : 2;
    for (let i = 0; i < tries; i++) { for (let b = 0; b < span + 6; b++) E.tick(S, E.BEAT); }
    E.passDemo(S, d);
    const [claw, mach] = D.gifts;
    const pick = STRAT === 'claw' ? claw : STRAT === 'machine' ? mach : (demosPlayed % 2 ? mach : claw);
    E.pickGift(S, d, pick); demosPlayed++;
    mark(`  >> DEMO ${D.name} (${tries} ${tries > 1 ? 'tries' : 'try'}) -> ${E.GIFTS[pick].name}`);
  }
  if (E.skyFull(S)) {
    mark('*** SKY FULL: Look, No Claws! ***');
    S.t += E.FINAL_SECS + 20; S.ended = true; break;
  }
  for (let k = 0; k < 5; k++) {
    const opts = E.items(S).filter(it => S.cash >= it.price).sort((a, b) => a.price - b.price);
    if (!opts.length) break;
    E.reveal(S);
    const it = opts[0];
    if (E.buy(S, it.id)) { busy += 2; mark(it.kind === 'line' ? `${it.name} ${S.lv[it.id]}` : (it.odd ? `(${it.name})` : it.name)); }
  }
  if (V && Math.floor(S.t / 120) !== Math.floor((S.t - E.BEAT) / 120)) {
    const tap = E.clawPer(S) * 1.6, m = E.machineRate(S);
    mark(`    [${fmtT(S.t)}] sky ${E.fmt(S.cranes)} (${(E.progress(S) * 100).toFixed(0)}%) cash ${E.money(S.cash)} per-tap ~${E.fmt(tap)} machine ${E.fmt(m)}/s share ${(m / (m + tap * 1.3) * 100).toFixed(0)}% streak best ${S.best}`);
  }
}
let prev = 0; const gaps = [];
for (const [t, what] of log) {
  if (!/^( {2}>>|\*\*\*| {4}\[)/.test(what)) { gaps.push(t - prev); prev = t; }
  console.log(fmtT(t).padStart(6), what);
}
gaps.sort((a, b) => a - b);
console.log(`\n${STRAT}: ended=${S.ended} played ${fmtT(S.t)} · ${gaps.length} purchases · median gap ${gaps[gaps.length >> 1].toFixed(1)}s · 90th ${gaps[Math.floor(gaps.length * 0.9)].toFixed(0)}s · max ${gaps[gaps.length - 1].toFixed(0)}s · claws ${(S.clawCranes / S.cranes * 100).toFixed(0)}% machine ${(S.machineCranes / S.cranes * 100).toFixed(0)}%`);
