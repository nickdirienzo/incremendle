// Pacing sim for Light Lunch: node public/light-lunch/sim.mjs [sitting minutes] [hours away]
// A reasonable player: one turn of the crank every 1.3 s, buys the cheapest affordable thing (but saves up for the next
// annex rather than buying stations that cost a fifth of it: space is the point), and puts each new station on the spot that helps most. With arguments, plays in sittings with offline time between them.
import * as E from './economy.mjs';

const SIT = Number(process.argv[2] || 0) * 60, AWAY = Number(process.argv[3] || 0) * 3600;
const S = E.fresh(); S.started = true;
const TURN = 1.3, DT = 0.1;
let t = 0, played = 0, sittings = 1, sitT = 0, lastBuy = 0, nextTurn = 0, nextMin = 300;
const log = [], gaps = [];
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const mark = w => log.push(`${fmtT(played)}  ${w}`);
let ph = 0, c5 = 0, fz = 0;
while (S.covers < E.GOAL && played < 4 * 3600) {
  E.tick(S, DT); t += DT; played += DT; sitT += DT;
  if (played >= nextTurn) { if (!E.turn(S).length) fz++; nextTurn = played + TURN; }
  for (const id of E.reveal(S)) mark(`   + shows: ${E.BY_ID[id].name}`);
  for (;;) {
    const ann = E.visible(S).some(it => it.id === 'annex') ? E.cost(S, 'annex') : Infinity;
    const can = E.visible(S).filter(it => E.canBuy(S, it.id) && (it.kind !== 'station' || E.cost(S, it.id) < 0.2 * ann || S.v - E.cost(S, it.id) >= ann)).sort((a, b) => (b.id === 'annex') - (a.id === 'annex') || E.cost(S, a.id) - E.cost(S, b.id));
    if (!can.length) break;
    const it = can[0], c = E.cost(S, it.id);
    E.buy(S, it.id);
    while (S.hand.length) E.place(S, E.bestTile(S, S.hand[0]));
    gaps.push(played - lastBuy); lastBuy = played;
    mark(`buy ${it.name}${it.kind !== 'one' && it.kind !== 'odd' ? ' ' + (it.kind === 'station' ? S.owned[it.id] : S.lv[it.id]) : ''} (${E.short(c)})  covers ${Math.floor(S.covers)}, cap ${E.rateCap(S).toFixed(2)}/s, idle ${E.rateIdle(S).toFixed(2)}/s, ${E.price(S)}v/cover`);
  }
  if (E.phase(S) !== ph) { ph = E.phase(S); mark(`== PHASE ${ph} (${E.ROOMS[E.lv(S, 'annex')]})`); }
  if (played >= nextMin) { mark(`   · covers ${Math.floor(S.covers)}, vouchers ${Math.floor(S.v)}, ${((S.covers - c5) / 5).toFixed(0)}/min, fizzles ${fz}`); nextMin += 300; c5 = S.covers; fz = 0; }
  if (SIT && sitT >= SIT && S.covers < E.GOAL) {
    const r = E.away(S, AWAY);
    mark(`-- away ${AWAY / 3600} h: +${Math.floor(r.covers)} covers, +${Math.floor(r.v)} vouchers`);
    sittings++; sitT = 0; lastBuy = played;
  }
}
console.log(log.join('\n'));
gaps.sort((a, b) => a - b);
console.log(`\nfinished: played ${fmtT(played)} in ${sittings} sitting(s) · purchases ${gaps.length} · median gap ${gaps[gaps.length >> 1].toFixed(0)} s · 90th pct ${gaps[Math.floor(gaps.length * 0.9)].toFixed(0)} s · longest ${gaps[gaps.length - 1].toFixed(0)} s · turns ${S.turns} · lit ${S.lit}`);
console.log('floor:', E.tiles(S).map(k => (S.grid[k] || '.')[0]).join('').match(new RegExp(`.{${E.size(S)[0]}}`, 'g')).join(' / '));
