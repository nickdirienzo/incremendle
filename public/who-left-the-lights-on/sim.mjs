// Pacing sim: node public/who-left-the-lights-on/sim.mjs [sitting minutes] [hours away]
// A reasonable player: draws one path every ~1.3 s while there's a firefly in the bin, at the best dark window
// it can reach, bending the path round Dobbin's torch when it has to; flies into the dark now and then to see
// what's there; loops its paths once it knows the trick; pins its best paths as orders once the lid can take
// them; buys the cheapest affordable thing; plays in sittings with time away.
import * as E from './economy.mjs';

const plan = E.autoPath;

export function run(log = true, { sitting = 30 * 60, awayFor = 3 * 3600, maxT = 9 * 3600 } = {}) {
  const S = E.load(null);
  const dt = 0.1;
  let t = 0, act = 0, lastBuy = 0, sitT = 0, sittings = 1, z = 0, k = 0;
  const buys = [], gaps = [], marks = [];
  const m = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const best = {};
  while (!S.finale && t < maxT) {
    t += dt; sitT += dt;
    const ev = E.tick(S, dt);
    for (const f of ev.finds) marks.push(`${m(t)} find: ${f}`);
    if (ev.zone != null && ev.zone > z) { z = ev.zone; marks.push(`${m(t)} ══ ${E.ZONES[z].name}`); buys.push(`${m(t)} ══════ ${E.ZONES[z].name.toUpperCase()}`); }
    act += dt;
    if (Math.floor(t / 300) !== Math.floor((t - dt) / 300)) marks.push(`${m(t)} ·· avg ${fmt(S.avg)}/s · heard ${fmt(S.life)} · have ${fmt(S.g)} · ff ${E.fireflies(S)} · range ${E.range(S)} · lit ${Object.keys(S.lit).length}`);
    if (act >= 1.3 && S.n > 0) {
      act = 0; k++;
      const busy = new Set(S.flights.filter(f => f.kind === 'out').map(f => f.target));
      const cands = E.TARGETS.filter(x => S.open[x.id] && !S.lit[x.id] && !busy.has(x.id) && !S.orders.some(o => o.target === x.id && S.one.lid))
        .sort((a, b) => E.ZONES[b.zone].base - E.ZONES[a.zone].base);
      let done = false;
      if (k % 14 !== 0) for (const c of cands) {
        const p = plan(S, c.id);
        if (p) { E.launch(S, p); best[c.id] = p; done = true; break; }
      }
      if (!done) {
        // Into the dark: the farthest unseen spot in reach, straight out.
        const R = E.range(S) * 0.92;
        let bp = null, bd = 0;
        for (let i = 0; i < 40; i++) {
          const a = (i / 40) * Math.PI * 2, x = E.BIN.x + Math.cos(a) * R, y = E.BIN.y + Math.sin(a) * R;
          const cx = Math.max(10, Math.min(E.W - 10, x)), cy = Math.max(10, Math.min(E.H - 10, y));
          if (E.seenAt(S, cx, cy)) continue;
          const d = Math.hypot(cx - E.BIN.x, cy - E.BIN.y);
          const p = [[E.BIN.x, E.BIN.y], [cx, cy]];
          if (d > bd && E.pathClear(S, p)) { bd = d; bp = p; }
        }
        if (bp) E.launch(S, bp);
      }
    }
    // Orders: the best windows it has paths for.
    if (S.one.lid) {
      const want = Object.keys(best).filter(id => S.open[id]).sort((a, b) => E.ZONES[E.TG[b].zone].base - E.ZONES[E.TG[a].zone].base);
      for (const id of want) {
        if (S.orders.some(o => o.target === id)) continue;
        if (S.orders.length < E.slots(S)) { E.pin(S, best[id], id); continue; }
        const worst = S.orders.reduce((w, o, i) => (E.ZONES[E.TG[o.target].zone].base < E.ZONES[E.TG[S.orders[w].target].zone].base ? i : w), 0);
        if (E.ZONES[E.TG[S.orders[worst].target].zone].base < E.ZONES[E.TG[id].zone].base) { S.orders.splice(worst, 1); E.pin(S, best[id], id); }
        break;
      }
      // Refresh orders whose paths a longer thread or the loop trick would improve.
      for (const o of S.orders) if (S.syncFound && !o.sync && best[o.target] && E.loops(best[o.target])) { o.path = best[o.target]; o.sync = true; }
    }
    E.reveals(S);
    const opts = E.items(S).filter(i => E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
    if (opts.length) {
      const it = opts[0], c = E.cost(S, it.id);
      E.buy(S, it.id);
      if (t - lastBuy > 60) marks.push(`  GAP ${Math.round(t - lastBuy)} s before ${m(t)} ${it.name}`);
      gaps.push(t - lastBuy); lastBuy = t;
      buys.push(`${m(t)} ${it.name}${it.kind === 'lv' ? ' ' + E.lv(S, it.id) : ''} (${fmt(c)})  heard ${fmt(S.life)}`);
    }
    if (sitting && sitT >= sitting && !S.finale) {
      const r = E.away(S, awayFor);
      marks.push(`${m(t)} ── away ${awayFor / 3600} h: +${fmt(r?.g || 0)} (avg ${fmt(S.avg)}/s)`);
      sitT = 0; sittings++;
    }
  }
  if (!log) return { t, buys, marks, gaps, S, sittings };
  console.log(buys.join('\n'));
  console.log('\n' + marks.join('\n'));
  const sorted = gaps.slice().sort((a, b) => a - b);
  console.log(`\nEnded ${S.finale ? '' : '(NOT FINISHED) '}at ${m(t)} played, ${sittings} sittings · ${buys.length} purchases · median gap ${sorted[sorted.length >> 1]?.toFixed(1)} s · ${gaps.filter(g => g > 60).length} gaps over 60 s · longest ${Math.max(...gaps).toFixed(0)} s`);
  console.log(`launches ${S.launches} · shouts ${S.shouts} · caught ${S.caught} · fireflies ${E.fireflies(S)} · range ${Math.round(E.range(S))} · orders ${S.orders.length} · revealed ${(E.revealed(S) * 100).toFixed(0)}% · finds ${S.finds.length} · lv ${JSON.stringify(S.lv)}`);
  return { t, buys, marks, gaps, S, sittings };
}
function fmt(n) { return n >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'k' : Math.round(n) + ''; }
if (import.meta.url === `file://${process.argv[1]}`) run(true, { sitting: Number(process.argv[2] ?? 30) * 60, awayFor: Number(process.argv[3] ?? 3) * 3600 });
