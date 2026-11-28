// Pacing sim: node public/knock-on-wood/sim.mjs [sittingMinutes] [awayHours]
// A reasonable player: one knock attempt every ~1.3 s (80% land in time, 90% with the Grandfather Clock; a third of
// those perfect), buys the cheapest affordable thing (ghost, hand, the next map correction or an upgrade), says yes to
// the borrowers when it would raise credit by at least 30% (and not once the whole map is open), and plays in sittings
// with offline progress in between.
import * as E from './economy.mjs';

const SIT = Number(process.argv[2] || 30) * 60, AWAY = Number(process.argv[3] || 3) * 3600;
const S = E.fresh(); S.started = true;
let seed = 11; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const dt = 0.1; let t = 0, act = 0, sitT = 0, sittings = 1, played = 0;
const log = []; let lastBuy = 0, maxGap = 0; const gaps = []; const phaseGaps = {};
const fmt = s => `${(s / 60).toFixed(1)}m`;
let phase = E.phaseOf(S);
while (!S.ended && played < 12 * 3600) {
  const ev = E.step(S, dt, rng); t += dt; act += dt; sitT += dt; played += dt;
  if (act >= 1.3) {
    act = 0;
    const hit = rng() < (S.up.clock ? 0.9 : 0.8);
    if (hit) E.knock(S, rng() < (S.up.clock ? 0.4 : 0.3));
  }
  for (const id of E.visible(S)) S.seen[id.id] = true;
  // Say yes when it pays.
  if (E.canLend(S) && S.open < E.ROOMS.length && S.home >= 12 && (E.creditAfterLend(S) / E.credit(S) >= 1.25 || (E.out(S) === 0 && E.creditAfterLend(S) / E.credit(S) >= 1.08))) {
    const n = E.lend(S, rng); log.push(`${fmt(played)}  ── say yes: lent ${n}, credit ×${E.credit(S).toFixed(2)}`);
  }
  if (E.canBalance(S)) {
    E.balance(S); S.home += E.CELLAR; S.ended = true;
    log.push(`${fmt(played)}  ══ BALANCE THE BOOKS (paid ${S.paid.knocks} knocks, ${S.paid.ghosts} ghosts)`); break;
  }
  if (E.canBuy(S, "fix") && E.out(S) <= 12) { const c = E.cost(S, 'fix'); E.buy(S, 'fix'); log.push(`${fmt(played)}  ▶ FIX MAP → ${E.ROOMS[S.open - 1].name} (${c} ghosts)  home ${S.home} g${S.ghosts}`); }
  const saving = E.balanceShown(S) && S.ghosts >= E.BALANCE_GHOSTS;
  const opts = saving ? [] : ['ghost', ...(E.handsUnlocked(S) ? ['hand'] : []), ...E.visible(S).map(i => i.id)]
    .filter(id => E.canBuy(S, id)).sort((a, b) => E.cost(S, a) - E.cost(S, b));
  if (opts.length) {
    const id = opts[0], c = E.cost(S, id); E.buy(S, id);
    const gap = played - lastBuy; maxGap = Math.max(maxGap, gap); gaps.push(gap); (phaseGaps[phase] ||= []).push(gap);
    const name = id === 'fix' ? `FIX MAP → ${E.ROOMS[S.open - 1].name}` : id === 'ghost' ? `ghost #${S.ghosts}` : id === 'hand' ? `hand #${S.hands}` : E.BY_ID[id].name;
    if (id === 'fix' || E.BY_ID[id] || S.ghosts % 5 === 0 || S.hands % 5 === 0)
      log.push(`${fmt(played)}  +${gap.toFixed(0)}s  ${name} (${c})  home ${S.home} out ${E.out(S)} owed ${S.owed} g${S.ghosts} h${S.hands} acc ${(E.accuracy(S) * 100) | 0}% cr ×${E.credit(S).toFixed(2)} ${E.cupsPerMin(S).toFixed(2)}c/m`);
    lastBuy = played;
  }
  const ph = E.phaseOf(S); if (ph !== phase) { log.push(`${fmt(played)}  ═══ phase: ${E.PHASE_NAMES[ph]}`); phase = ph; }
  if (sitT >= SIT) {
    const before = S.home, w = S.owed;
    const sum = E.offline(S, AWAY, rng);
    log.push(`${fmt(played)}  ~~~ away ${AWAY / 3600}h: +${sum.cups} cups (home ${before}→${S.home}), +${sum.wrong} wrong, +${Math.floor(sum.knocks)} knocks`);
    sitT = 0; sittings++; lastBuy = played;
  }
}
console.log(log.join('\n'));
const sorted = gaps.slice().sort((a, b) => a - b);
console.log(`\nDONE: played ${fmt(played)} over ${sittings} sittings · purchases ${gaps.length} · median gap ${sorted[sorted.length >> 1].toFixed(0)}s · longest ${maxGap.toFixed(0)}s`);
for (const [ph, g] of Object.entries(phaseGaps)) { const so = g.slice().sort((a, b) => a - b); console.log(`${E.PHASE_NAMES[ph]}: ${g.length} purchases, median ${so[so.length >> 1].toFixed(0)}s, 90th ${so[Math.floor(so.length * 0.9)].toFixed(0)}s, max ${so[so.length - 1].toFixed(0)}s`); }
console.log(`owed ${S.owed} lends ${S.lends} lent ${S.lentTotal} ghosts ${S.ghosts} hands ${S.hands} knocks ${Math.floor(S.knocks)}`);
