// Pacing sim: node public/lost-your-marbles/sim.mjs
// A reasonable player: one hand action every 1.3 s (sort a marble off the mat, or stamp a form when the tray fills),
// buys the cheapest affordable useful thing, and lays the floor out the way the game teaches it
// (ruler under the hatch, combs along the top, a staircase of swap desks).
import * as E from './economy.mjs';

const S = E.fresh(); S.started = true;
let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const PLAN = {
  ruler: [[0, 0, 1]],
  comb: [[1, 0, 0], [2, 0, 1], [3, 0, 2]],
  desk: [[1, 1, 0], [2, 2, 1], [1, 2, 0], [2, 3, 1], [3, 2, 2], [3, 3, 2], [1, 3, 0], [2, 1, 1]],
};
const want = id => {
  const it = E.BY_ID[id];
  if (it.kind !== 'piece') return true;
  if (S.own[id] >= PLAN[id].length) return false;
  if (id === 'comb' && S.own.comb === 2 && !E.kindOpen(S, 3)) return false;
  if (id === 'desk' && S.own.desk >= 4 && !E.kindOpen(S, 2)) return false;
  return true;
};
function layout() {
  for (const t of ['ruler', 'comb', 'desk']) {
    let n = 0;
    for (const [c, r, set] of PLAN[t]) {
      if (n >= S.own[t]) break; n++;
      if (!S.grid[E.cell(c, r)]) E.place(S, t, c, r, set);
    }
  }
}
const dt = 0.1; let act = 0, t = 0; const log = []; let lastBuy = 0, maxGap = 0;
const marks = []; const kOpen = [true, true, false, false];
while (!E.done(S) && t < 7200) {
  E.step(S, dt, rng); t += dt; act += dt;
  for (const k of [2, 3]) if (!kOpen[k] && E.kindOpen(S, k)) { kOpen[k] = true; marks.push(`${(t / 60).toFixed(1)}m  ── ${E.KINDS[k].many} open (record ${Math.floor(S.record)})`); }
  E.reveal(S);
  if (act >= 1.3) {
    act = 0;
    if (S.mat.length) { const k = S.mat[0]; E.sortHand(S, 0, k + 1); }
    else if (S.tray >= 3) E.stampHand(S);
  }
  const opts = E.visible(S).filter(i => E.canBuy(S, i.id) && want(i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
  if (opts.length) {
    const it = opts[0], c = E.cost(S, it.id); E.buy(S, it.id); layout();
    maxGap = Math.max(maxGap, t - lastBuy);
    log.push(`${(t / 60).toFixed(1)}m  +${(t - lastBuy).toFixed(0)}s  ${it.name}${it.kind === 'piece' ? ' #' + S.own[it.id] : ''} (${c})  now ${Math.floor(S.now)} rec ${Math.floor(S.record)}`);
    lastBuy = t;
  }
}
console.log([...log, ...marks].sort((a, b) => parseFloat(a) - parseFloat(b)).join('\n'));
console.log(`\nDONE at ${(t / 60).toFixed(1)} min · purchases ${log.length} · longest gap ${maxGap.toFixed(0)}s · final ${Math.floor(t - lastBuy)}s after last buy`);
console.log(`jars ${S.jars} swaps ${S.swaps} lost ${S.lost} hand ${S.handSorted} mat ${S.mat.length} tray ${S.tray} rate ${E.arrivalRate(S).toFixed(2)}/s`);
