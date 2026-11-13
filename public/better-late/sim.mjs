// Pacing sim: node public/better-late/sim.mjs
// A reasonable player: drags a tooth every ~1.3 s (from the biggest huddle, onto the gear), buys the
// cheapest affordable thing, saves for the recut once the drive is full or the recut is the better buy,
// and plays in sittings: 30 minutes on, three hours away (moths at half rate), and again.
import * as E from './economy.mjs';

export function run(log = true, { sitting = 30 * 60, awayFor = 3 * 3600 } = {}) {
  let seed = 11;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const S = E.defaults();
  const dt = 0.1;
  let t = 0, act = 0, lastBuy = 0, sitT = 0, sittings = 1;
  const buys = [], gaps = [], marks = [];
  const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  while (!E.finalReady(S) && t < 4 * 3600) {
    t += dt; sitT += dt;
    E.tick(S, dt, rnd);
    act += dt;
    if (act >= 1.3 && S.dark.length) {
      act = 0;
      // Pick the tooth with the biggest huddle (a person eyeballs it: take the best of five).
      let bi = 0, bn = -1;
      for (let k = 0; k < 5; k++) { const i = Math.floor(rnd() * S.dark.length); const n = E.huddle(S, S.dark[i], i).length; if (n > bn) { bn = n; bi = i; } }
      E.tame(S, bi, null, rnd);
    }
    E.reveal(S);
    // The recut, once it's affordable and the drive is full (or it's simply the better buy).
    const driveFull = E.maxed(S, 'drive');
    if (E.canRecut(S) && (driveFull || E.speedAfterRecut(S) > E.speed(S) * 1.8)) {
      const r0 = E.rate(S);
      E.recut(S, rnd);
      marks.push(`${m(t)} ══ recut to ${E.size(S)} teeth (late ${E.fmtLate(S.late)}, drive ${S.drive}, rate before ${r0.toFixed(3)} s/s)`);
      buys.push(`${m(t)} ★ RECUT → ${E.size(S)}`);
      gaps.push(t - lastBuy); lastBuy = t;
    }
    const saving = E.recutOpen(S) && driveFull;
    const opts = E.items(S).filter(i => E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
    if (opts.length && !(saving && E.cost(S, opts[0].id) > S.glass - E.recutCost(S) && E.cost(S, opts[0].id) > 12)) {
      const it = opts[0];
      const c = E.cost(S, it.id);
      E.buy(S, it.id);
      if (t - lastBuy > 45) marks.push(`  gap ${Math.round(t - lastBuy)} s before ${m(t)} ${it.name}`);
      gaps.push(t - lastBuy); lastBuy = t;
      buys.push(`${m(t)} ${it.short || it.name}${it.kind === 'drive' ? ' ' + S.drive : it.kind !== 'odd' ? ' ' + E.lv(S, it.id) : ''} (${c}) late ${E.fmtLate(S.late)}`);
    }
    if (sitting && sitT >= sitting && !E.finalReady(S)) {
      const r = E.away(S, awayFor);
      marks.push(`${m(t)} ── away ${awayFor / 3600} h: moths carried ${r.carried}, caught ${E.fmtLate(r.caught)}, glass +${r.glass}`);
      sitT = 0; sittings++;
    }
  }
  if (!log) return { t, buys, marks, gaps, S, sittings };
  console.log(buys.join('\n'));
  console.log('\n' + marks.join('\n'));
  const sorted = gaps.slice().sort((a, b) => a - b);
  console.log(`\nEnded at ${m(t)} played, ${sittings} sittings · ${buys.length} purchases · median gap ${sorted[sorted.length >> 1].toFixed(1)} s · ${gaps.filter(g => g > 45).length} gaps over 45 s · longest ${Math.max(...gaps).toFixed(0)} s`);
  console.log(`tamed ${S.tamed} · chains ${S.chains} · best chain ${S.best} · drive ${S.drive} · lv ${JSON.stringify(S.lv)}`);
  return { t, buys, marks, gaps, S, sittings };
}
if (import.meta.url === `file://${process.argv[1]}`) run(true, { sitting: Number(process.argv[2] ?? 30) * 60, awayFor: Number(process.argv[3] ?? 3) * 3600 });
