// Pacing sim: node public/with-compliments/sim.mjs
// A reasonable player: throws a rainbow every ~1.3 s, aiming at the festive (declined) orders first, any
// order about to lapse next, and otherwise at the greyest plot in reach. Aim error grows with distance
// (less with the Plumb Line). Extends the reach as soon as it can, otherwise buys the cheapest thing.
// Plays in sittings of 30 minutes with 3 hours away between them (offline: Spout at half rate).
import * as E from './economy.mjs';

export function run(log = true, { sitting = 30 * 60, away = 3 * 3600 } = {}) {
  let seed = 11;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return (u - 3) / Math.sqrt(0.5); };
  const S = E.defaults();
  const dt = 0.1;
  let t = 0, throwT = 0, lastBuy = 0, sit = 0, sittings = 1, hits = 0, tries = 0;
  const buys = [], gaps = [], marks = [], clear = [];
  const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const aim = i => {
    const p = E.PLOTS[i], cx = (p.x0 + p.x1) / 2;
    const sd = (4 + 0.05 * (cx - E.LAUNCH.x)) * (S.one.plumb ? 0.55 : 1);
    const x = Math.min(E.reachX(S) - 0.01, cx + gauss() * sd);
    tries++;
    const j = x < E.PLOTS[0].x0 ? -1 : E.plotAt(x);
    if (j === i) hits++;
    return j;
  };
  while (!E.done(S) && t < 6 * 3600) {
    t += dt; sit += dt;
    for (const ev of E.tick(S, dt, rnd)) if (ev.type === 'spout') { E.land(S, ev.plot, 'spout'); S.spoutN++; }
    throwT += dt;
    if (throwT >= 1.3) {
      throwT = 0;
      const mine = S.orders.filter(o => !S.one.spout || !o.ok || o.due < 6).sort((a, b) => a.due - b.due)[0];
      let target;
      if (mine) target = mine.plot;
      else {
        let best = -1;
        E.PLOTS.forEach((p, i) => { if (E.reachable(S, i) && (best < 0 || S.grey[i] > S.grey[best])) best = i; });
        target = best;
      }
      const j = aim(target);
      E.land(S, j, 'you');
      if (!S.shown) S.shown = true;
    }
    E.reveal(S);
    const R = E.nextReach(S);
    if (R && S.crowns >= R.cost) {
      E.extend(S);
      gaps.push(t - lastBuy); lastBuy = t;
      buys.push(`${m(t)} ★ ${R.reach} → ${R.name}`);
      marks.push(`${m(t)} ── ${R.name} (grey left ${E.fmt(E.greyLeft(S))}; size ${E.fmt(E.size(S))})`);
    } else {
      // Save for the reach when it's close; otherwise the cheapest thing.
      const opts = E.items(S).filter(i => E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
      const saving = R && S.crowns > R.cost * 0.7 && E.regionGrey(S, S.reach) < E.regionAcres(S.reach) * 0.2;
      if (opts.length && !(saving && E.cost(S, opts[0].id) > (R.cost - S.crowns) * 0.5)) {
        const it = opts[0];
        E.buy(S, it.id);
        if (t - lastBuy > 30) marks.push(`  gap ${Math.round(t - lastBuy)} s before ${m(t)} ${it.name}`);
        gaps.push(t - lastBuy); lastBuy = t;
        buys.push(`${m(t)} ${it.name}${it.max ? ' ' + S.lv[it.id] : ''}`);
      }
    }
    for (let r = 0; r < E.REGIONS.length; r++) if (!clear[r] && E.regionGrey(S, r) <= 0) { clear[r] = true; marks.push(`${m(t)} ·· ${E.REGIONS[r].name} all in colour (earned so far ${E.fmt(S.earned)})`); }
    if (sit >= sitting && !E.done(S)) {
      const off = E.offline(S, away);
      marks.push(`${m(t)} ══ sitting ${sittings} ends; away ${away / 3600} h: ${off ? `Spout threw ${off.n}, ${E.fmt(off.acres)} acres, ${E.fmt(off.pay)} crowns` : 'nothing'}`);
      sit = 0; sittings++;
    }
  }
  if (!log) return { t, buys, marks, gaps, S, sittings };
  console.log(buys.join('\n'));
  console.log('\n' + marks.join('\n'));
  const late = gaps.filter(g => g > 30).length, worst = Math.max(...gaps);
  console.log(`\nGrey gone at ${m(t)} played, ${sittings} sitting(s) · ${buys.length} purchases · median gap ${gaps.sort((a, b) => a - b)[gaps.length >> 1].toFixed(1)} s · ${late} gaps over 30 s · longest ${worst.toFixed(0)} s`);
  console.log(`thrown ${S.thrown} · hit rate ${(hits / tries * 100).toFixed(0)}% · orders filled ${S.filled} · lapsed ${S.missed} · Spout threw ${S.spoutN} · earned ${E.fmt(S.earned)} crowns · size ${E.fmt(E.size(S))}`);
  return { t, buys, marks, gaps, S, sittings };
}
if (import.meta.url === `file://${process.argv[1]}`) run();
