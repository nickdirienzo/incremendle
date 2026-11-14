// Pacing sim: node public/nest-egg/sim.mjs [sitting minutes] [hours away]
// A reasonable player: traces a rune every ~1.3 s (a little slower for the longer runes), taps a chirp when
// a battery for it is on hand, packs by hand when a chirp is short, buys the cheapest affordable thing,
// keeps a few birds packing and carrying once those jobs open, and plays in sittings with time away.
import * as E from './economy.mjs';

export function run(log = true, { sitting = 30 * 60, awayFor = 3 * 3600 } = {}) {
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const S = E.load(null);
  const dt = 0.1;
  let t = 0, act = 0, lastBuy = 0, sitT = 0, sittings = 1, roomWas = 0;
  const buys = [], gaps = [], marks = [];
  const m = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  while (!S.feast && t < 8 * 3600) {
    t += dt; sitT += dt;
    E.tick(S, dt, rnd);
    act += dt;
    const castTime = 1.3 + 0.15 * E.runeOf(S).path.length;
    if (act >= castTime) {
      act = 0;
      // Tap a chirp you can feed, else pack for one, else trace.
      const f = E.open(S).find(d => E.canFeed(S, d.id) && !S.trips.some(tr => tr.id === d.id));
      const pt = E.packTarget(S);
      if (f) E.feed(S, f.id);
      else if (pt && E.open(S).some(d => d.need === pt)) E.pack(S, pt);
      else E.cast(S);
    }
    // Jobs: a share of the flock packing and carrying once those open.
    const R = E.room(S);
    if (R >= 1) {
      const want = { carry: Math.max(1, Math.round(S.birds * (R >= 3 ? 0.22 : 0.18))), pack: Math.max(1, Math.round(S.birds * (R >= 2 ? 0.22 : 0.14))) };
      for (const j of ['carry', 'pack']) {
        while (S.jobs[j] < want[j] && S.jobs.brood > 1) { S.jobs.brood--; S.jobs[j]++; }
      }
    }
    if (R !== roomWas) { roomWas = R; marks.push(`${m(t)} ══ ${E.ROOMS[R].name} opens (fed ${S.fed}, birds ${S.birds})`); buys.push(`${m(t)} ══════ ${E.ROOMS[R].name.toUpperCase()}`); }
    E.reveal(S);
    const opts = E.items(S).filter(i => i.kind !== 'feast' && E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
    if (opts.length) {
      const it = opts[0], c = E.cost(S, it.id);
      E.buy(S, it.id);
      if (t - lastBuy > 60) marks.push(`  gap ${Math.round(t - lastBuy)} s before ${m(t)} ${it.name}`);
      gaps.push(t - lastBuy); lastBuy = t;
      buys.push(`${m(t)} ${it.name}${it.kind === 'bird' || it.kind === 'lv' ? ' ' + E.lv(S, it.id) : ''} (${c})`);
    } else if (E.canBuy(S, 'feast') && E.items(S).filter(i => i.kind !== 'feast' && !E.maxed(S, i.id)).every(i => E.cost(S, i.id) > S.seed)) {
      // Save up a little before the feast: nothing else left worth buying.
      if (S.seed >= 900 || E.items(S).filter(i => i.kind !== 'feast' && !E.maxed(S, i.id)).length === 0) {
        E.buy(S, 'feast'); buys.push(`${m(t)} ★ THE LAST FEAST (${S.feast.seed} seed)`); gaps.push(t - lastBuy);
      }
    }
    if (sitting && sitT >= sitting && !S.feast) {
      const r = E.away(S, awayFor);
      marks.push(`${m(t)} ── away ${awayFor / 3600} h: fed ${r.fed}, seed +${r.seed}, missed ${r.missed}`);
      sitT = 0; sittings++;
    }
  }
  if (!log) return { t, buys, marks, gaps, S, sittings };
  console.log(buys.join('\n'));
  console.log('\n' + marks.join('\n'));
  const sorted = gaps.slice().sort((a, b) => a - b);
  console.log(`\nEnded at ${m(t)} played, ${sittings} sittings · ${buys.length} purchases · median gap ${sorted[sorted.length >> 1].toFixed(1)} s · ${gaps.filter(g => g > 60).length} gaps over 60 s · longest ${Math.max(...gaps).toFixed(0)} s`);
  console.log(`fed ${S.fed} · missed ${S.missed} · birds ${S.birds} ${JSON.stringify(S.jobs)} · rune ${S.rune} · lv ${JSON.stringify(S.lv)} · packed ${JSON.stringify(S.packed)} · casts ${S.casts}`);
  return { t, buys, marks, gaps, S, sittings };
}
if (import.meta.url === `file://${process.argv[1]}`) run(true, { sitting: Number(process.argv[2] ?? 30) * 60, awayFor: Number(process.argv[3] ?? 3) * 3600 });
