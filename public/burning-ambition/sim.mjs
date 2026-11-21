// Pacing sim for Burning Ambition: node public/burning-ambition/sim.mjs [seed]
// A reasonable player: types about 2.8 letters a second with a fumble on 5% of letters (each costs 0.6 s), takes
// 0.7 s to read each new order, types Gordon's affirmations when they come, and buys the cheapest affordable thing.
import * as E from './economy.mjs';

let seed = Number(process.argv[2] || 7);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const S = E.fresh(); S.started = true;
const LETTER = 0.36, FUMBLE = 0.05, FUMBLE_COST = 0.6, READ = 0.7;
let t = 0;
const log = [];
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const mark = w => log.push(`${fmtT(t)}  ${w}`);
let sec = 0, lastBuy = 0, gaps = [], affirmNext = false, ended = false;

let nextMin = 60;
function advance(dt) {
  if (t >= nextMin) { mark(`   · ${S.rings} rings, value ${E.short(S.value)}, tin ${E.short(S.tin)}, ${E.short(E.letterPrice(S))}/letter`); nextMin += 60; }
  const mult = (S.cutT > 0 ? E.CUT_MULT : 1) * (S.breakT > 0 ? E.breakMult(S) : 1);
  E.helpersTick(S, dt, mult, rnd);
  t += dt;
  S.cutT = Math.max(0, S.cutT - dt); S.breakT = Math.max(0, S.breakT - dt);
  if (t >= S.nextGordon) { S.nextGordon = t + 70 + rnd() * 40; affirmNext = true; S.gordons++; }
  if (t >= S.nextCut) { S.nextCut = t + 150 + rnd() * 70; S.cutT = E.CUT_SECS; S.cuts++; mark(`   (power cut ×${E.CUT_MULT})`); }
  for (const id of E.reveal(S)) mark(`   + shows: ${E.BY_ID[id].name}`);
  const s = E.section(S);
  if (s !== sec) { sec = s; mark(`== SECTION ${E.SECTIONS[s].name} (${S.rings} rings, ${E.heightM(S).toFixed(1)} m, value ${E.short(S.value)})`); }
  // Buy the cheapest affordable thing, one at a time.
  for (;;) {
    const can = E.visible(S).filter(it => E.cost(S, it.id) <= S.tin).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
    if (!can.length) break;
    const it = can[0], c = E.cost(S, it.id);
    E.buy(S, it.id);
    gaps.push(t - lastBuy); lastBuy = t;
    mark(`buy ${it.name}${it.kind === 'lv' ? ' ' + S.lv[it.id] : ''} (${E.short(c)})  value ${E.short(S.value)}, ${E.short(E.letterPrice(S))}/letter, helpers ${E.helperRate(S).toFixed(1)} l/s`);
  }
}

while (!ended && t < 3 * 3600) {
  const final = S.value >= E.GOAL;
  const word = final ? E.FINAL : affirmNext ? E.AFFIRMATIONS[S.gordons % E.AFFIRMATIONS.length] : E.pickOrder(S, rnd);
  const isAff = !final && affirmNext; affirmNext = false;
  advance(READ);
  let miss = 0;
  for (let i = 0; i < E.letters(word); i++) {
    advance(LETTER);
    if (rnd() < FUMBLE) { miss++; advance(FUMBLE_COST); }
  }
  if (final) { mark(`== THE END: BIG LIGHT. ${S.rings} rings (${S.typed} typed, ${S.helperRings} by helpers), ${E.heightM(S).toFixed(1)} m`); ended = true; break; }
  const wonky = miss > (S.lv.spec ? 1 : 0);
  const mult = (S.cutT > 0 ? E.CUT_MULT : 1) * (S.breakT > 0 ? E.breakMult(S) : 1);
  E.printRing(S, word, { wonky, mult });
  if (isAff) S.breakT = E.breakSecs(S);
}
console.log(log.join('\n'));
gaps.sort((a, b) => a - b);
console.log(`\nfinished in ${fmtT(t)} · purchases ${gaps.length} · median gap ${gaps[gaps.length >> 1].toFixed(0)} s · longest gap ${gaps[gaps.length - 1].toFixed(0)} s · gordons ${S.gordons} · cuts ${S.cuts} · wonky ${S.wonky}`);
