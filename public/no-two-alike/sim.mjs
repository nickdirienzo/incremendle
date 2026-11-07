// Headless pacing sim: node public/no-two-alike/sim.mjs [-v]
// A reasonable player: one crank turn every ~1.3 s, buys Ida, notches and cutters as soon as it can
// afford them and otherwise the cheapest affordable thing, as long as
// it still leaves enough Flurry to beat the coming wave (or there's plenty of time to rebuild),
// opens the window early once the Flurry beats the wave with a margin, and keeps cranking in the race.
import * as E from './economy.mjs';

const V = process.argv.includes('-v');
const rnd = E.rng(11); E.setRandom(rnd);
const S = E.newState();
const DT = 0.1, TURN = Number(process.env.TURN || 1 / 1.3);
const log = [], buys = [];
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const mark = w => log.push([S.t, w]);

function options() {
  const out = [];
  for (const id of Object.keys(E.LINES)) if (E.gateOk(S, E.LINES[id]) && !E.lineMax(S, id)) out.push({ id, cost: E.lineCost(S, id), go: () => E.buyLine(S, id) });
  for (const u of E.items(S)) out.push({ id: u.id, cost: u.cost, go: () => E.buy(S, u.id) });
  // Cheapest first, except the big ones (Ida, a notch, a cutter) jump the queue once affordable.
  const big = o => ['ida', 'notch', 'cutter'].includes(o.id) && S.flakes >= o.cost;
  return out.sort((a, b) => (big(b) - big(a)) || a.cost - b.cost);
}
while (!S.ended && S.t < 4 * 3600) {
  E.crank(S, TURN * DT * (0.85 + rnd() * 0.3));
  const ev = E.step(S, DT);
  if (ev.win) mark(`== beat wave ${S.wave} · min cuts ${E.minCuts(S)} · me ${S.made.me} ida ${S.made.ida}`);
  if (ev.lose) mark(`  ✗ lost to ${E.wave(S).name}, ${Math.round(S.heat)} heat left`);
  if (ev.race) mark(`== RACE: starts with ${Math.round(S.race.snow)} of ${E.RACE.snow} snow; makes ${(E.myFlakeRate(S, TURN) + E.idaFlakeRate(S)).toFixed(2)} flakes/s`);
  if (ev.recount) mark(`  ✗ recount`);
  if (S.race || S.ended) continue;
  // Shopping, once every couple of seconds.
  if (Math.round(S.t / DT) % 20 === 0) {
    const opts = options();
    // Save up for a big one that's within reach rather than frittering flakes on points.
    const want = opts.find(o => ['ida', 'notch', 'cutter'].includes(o.id) && o.cost <= S.flakes * 2.5 + 4);
    for (const o of want ? [want] : opts) {
      // Save up once the wave is within reach; otherwise grow.
      const safe = !S.battle && (E.cooling(S) < S.heat * 0.6 || (S.flakes - o.cost) * E.chill(S) >= S.heat * 1.1);
      if (S.flakes >= o.cost && safe) { o.go(); buys.push([S.t, o.id]); if (V) mark(`    buy ${o.id} (${o.cost})`); }
      break;
    }
  }
  if (!S.battle && !S.race && S.wave < E.WAVES.length && E.cooling(S) >= S.heat * 1.1) { E.startBattle(S); mark(`  ⚔ opened the window on ${E.wave(S).name}: heat ${Math.round(S.heat)} vs flurry ${Math.round(E.cooling(S))}`); }
}
for (const [t, w] of log) console.log(fmtT(t), w);
console.log(`\nfinished ${S.ended} at ${fmtT(S.t)} · ${buys.length} purchases (one every ${(S.t / buys.length).toFixed(0)}s)`);
console.log(`made: broccoli ${S.made.me} · Ida ${S.made.ida} (${Math.round(100 * S.made.ida / (S.made.me + S.made.ida))}%) · losses ${S.losses} · recounts ${S.recounts}`);
console.log('levels', JSON.stringify(S.lv), 'min cuts', E.minCuts(S));
// Gaps between purchases, by minute.
let prev = 0, worst = 0, worstAt = 0;
for (const [t] of buys) { if (t - prev > worst) { worst = t - prev; worstAt = prev; } prev = t; }
console.log(`longest gap between purchases: ${worst.toFixed(0)}s after ${fmtT(worstAt)}`);
const perMin = {};
for (const [t] of buys) perMin[Math.floor(t / 60)] = (perMin[Math.floor(t / 60)] || 0) + 1;
console.log('purchases per minute:', Array.from({ length: Math.ceil(S.t / 60) }, (_, i) => perMin[i] || 0).join(' '));
