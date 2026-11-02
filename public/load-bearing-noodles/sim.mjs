// Headless pacing sim: node public/load-bearing-noodles/sim.mjs [sitting minutes] [hours away]
// A reasonable player: one action every ~1.3 s (a full tug, or once the grapevine's open, every
// other action a listen that lets go when the tenant glances over, a little late now and then),
// buying the cheapest affordable thing (upgrade, room, salt). Plays in sittings with offline time.
import * as E from './economy.mjs';

const SIT = Number(process.argv[2] || 30) * 60, AWAY = Number(process.argv[3] || 3) * 3600;
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const S = E.newState();
const log = [];
let played = 0, sittings = 1, sitT = 0, act = 0, alt = 0;
const mark = (what) => log.push([played, what]);
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let lastPhase = E.phase(S);

function options() {
  const o = [];
  for (const u of E.items(S)) o.push({ cost: u.cost, cur: u.cur, go: () => E.buy(S, u.id), name: u.name });
  for (let i = 0; i < E.N_ROOMS; i++) {
    const st = E.roomState(S, i);
    if (st === 'reach' || st === 'grow') o.push({ cost: E.roomCost(S, i), cur: 'n', go: () => E.grow(S, i), name: `${E.ROOMS[i].name} ${S.lv[i] + 1}` });
    if (st === 'salt' && S.vine && !(i === E.KNOT && S.saltCleared < E.SALT_COSTS.length)) o.push({ cost: E.saltCostFor(S, i), cur: 'd', go: () => E.clearSalt(S, i), name: `salt: ${E.ROOMS[i].name}` });
  }
  return o;
}
const DT = 0.1;
while (!S.ended && played < 6 * 3600) {
  E.step(S, DT); played += DT; sitT += DT; act += DT;
  if (act >= 1.3) {
    act = 0;
    const sp = E.speakers(S);
    if (S.vine && sp.length && S.wilt <= 0 && alt++ % 2 === 0) {
      const tN = E.noticeAt(rnd()), late = rnd() < 0.15 ? 0.9 : 0.35;
      const t = tN - E.warnTime(S) + late;
      if (t >= tN) E.caught(S); else E.listen(S, sp[Math.floor(rnd() * sp.length)], Math.max(0, t));
      act = -Math.max(0, t) + 0.3;
    } else E.tug(S, 1);
  }
  if (E.roomState(S, E.KNOT) === 'reach' && S.noodles >= E.KNOT_COST) { E.grow(S, E.KNOT); mark('root the knot'); }
  // Buy everything affordable, cheapest first (in its own currency).
  for (let k = 0; k < 40; k++) {
    const o = options().filter(x => E.have(S, x.cur) >= x.cost).sort((a, b) => a.cost / (a.cur === 'd' ? 1 : 1) - b.cost);
    if (!o.length) break;
    const x = o[0]; if (x.go()) mark(x.name); else break;
  }
  if (E.canFinish(S)) { played += E.FINAL_HOLD; mark('THE MOTHER KNOT (end)'); S.ended = true; break; }
  if (process.argv.includes('-d') && Math.abs(played % 60) < DT * 0.6) console.log(fmtT(played), 'rate', E.fmt(E.rate(S)), 'rooted', S.rooted, 'n', E.fmt(S.noodles), 'g', E.globalMult(S).toFixed(0), 'nm', E.neighbourMult(S, E.HOME).toFixed(1), 'dirt', E.fmt(S.dirt));
  const ph = E.phase(S); if (ph !== lastPhase) { mark(`=== phase: ${ph} ===`); lastPhase = ph; }
  if (sitT >= SIT && !S.ended) { const got = E.offline(S, AWAY); sittings++; sitT = 0; mark(`--- away ${AWAY / 3600}h: +${E.fmt(got.noodles)} noodles, +${E.fmt(got.dirt)} dirt ---`); }
}
// Purchase timeline, compressed: every event, then gaps.
let prev = 0, gaps = [];
for (const [t, what] of log) {
  if (!what.startsWith('=') && !what.startsWith('-')) { gaps.push(t - prev); prev = t; }
  if (process.argv.includes('-v') || what.startsWith('=') || what.startsWith('-') || /^(Flat|salt|Ko|Pettibone|The|Boiler|Root|Firm|Slurp|Al|Second|Gossip|Lean|Act|Party|Big|Damp|Warm|Sun|Festival|Worry|Bottle|Slow)/.test(what) && !/ \d+$/.test(what) || / 1$/.test(what))
    console.log(fmtT(t).padStart(6), what);
}
gaps.sort((a, b) => a - b);
const max = gaps[gaps.length - 1], med = gaps[Math.floor(gaps.length / 2)];
console.log(`\nended=${S.ended} played ${fmtT(played)} in ${sittings} sittings · ${log.length} purchases · median gap ${med.toFixed(1)}s · max gap ${max.toFixed(0)}s · rooms ${S.rooted}/${E.N_ROOMS} · noodles total ${E.fmt(S.total, true)}`);
// Longest gaps, with when.
let p = 0; const big = [];
for (const [t, what] of log) { if (what.startsWith('=') || what.startsWith('-')) continue; if (t - p > 60) big.push(`${fmtT(p)}→${fmtT(t)} (${Math.round(t - p)}s, then ${what})`); p = t; }
console.log('final rate', E.fmt(E.rate(S)), 'dirt left', E.fmt(S.dirt));
console.log('gaps > 60s:', big.slice(0, 12).join('; ') || 'none');
