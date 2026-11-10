// Pacing sim: node public/a-coats-worth/sim.mjs [--sittings]
// A reasonable player: a tap every ~1.3 s, buys the cheapest affordable upgrade, meets the Marshal
// a few seconds after the town starts to talk. With --sittings: 30 minutes of play, 3 hours away.
import * as E from './economy.mjs';

const sittings = process.argv.includes('--sittings');
const smart = process.argv.includes('--smart');   // buys the best buttons-per-coin helper instead of the cheapest thing
const S = E.defaults();
const dt = 0.1;
let tapT = 0, played = 0, sitT = 0, nSit = 1, lastBuy = 0, dueAt = null;
const buys = [], gaps = [], marks = [];
const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
while (!S.full && played < 6 * 3600) {
  played += dt; sitT += dt;
  E.tick(S, dt);
  tapT += dt;
  if (tapT >= 1.3) { tapT = 0; E.tap(S); }
  E.reveal(S);
  if (S.due) {
    dueAt ??= played;
    if (played - dueAt > 5) { marks.push(`${m(played)} → ${E.TOWNS[S.town + 1].name} (ledger ${E.fmt(S.ledger)})`); E.relocate(S); E.reveal(S); dueAt = null; lastBuy = played; }
    continue;
  }
  const opts = E.items(S).filter(i => E.canBuy(S, i.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
  if (opts.length) {
    let it = opts[0];
    if (smart) {
      const val = i => i.kind === 'helper' ? (E.helperRate(S, i.id, E.lv(S, i.id) + 1) - E.helperRate(S, i.id)) / E.cost(S, i.id) : i.kind === 'odd' ? 1 : 0.01;
      const best = E.items(S).filter(i => i.kind === 'helper').sort((a, b) => val(b) - val(a))[0];
      const want = E.items(S).filter(i => i.kind !== 'helper' && E.cost(S, i.id) < E.cost(S, best.id) * 2).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id))[0] || best;
      if (!E.canBuy(S, want.id)) continue;
      it = want;
    }
    E.buy(S, it.id);
    gaps.push([played - lastBuy, S.town]); lastBuy = played;
    buys.push(`${m(played)} ${E.TOWNS[S.town].id.padEnd(6)} ${it.name}${it.kind === 'helper' ? ' ' + E.lv(S, it.id) : ''}`);
  }
  if (sittings && sitT > 30 * 60) {
    const r = E.offline(S, 3 * 3600);
    marks.push(`${m(played)} away 3 h: +${E.fmt(r?.n || 0)} buttons`);
    sitT = 0; nSit++;
  }
}
console.log(buys.filter((_, i) => i % 6 === 0).join('\n'));
console.log('\n' + marks.join('\n'));
console.log(`\nfinished: ${S.full} at ${m(played)} played, ${nSit} sitting(s), ${buys.length} purchases, taps ${S.taps}, astray ${E.fmt(S.astray)}`);
for (const t of [0, 1, 2]) {
  const g = gaps.filter(x => x[1] === t).map(x => x[0]);
  const sorted = [...g].sort((a, b) => a - b);
  console.log(`${E.TOWNS[t].id}: ${g.length} buys, median gap ${sorted[g.length >> 1]?.toFixed(1)} s, max gap ${Math.max(...g).toFixed(1)} s`);
}
console.log('levels', JSON.stringify(S.lv));
