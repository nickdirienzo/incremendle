// Pacing sim: node public/gildas-last-card/sim.mjs [--quiet] [--tap=1.3] [--seed=7]
// A reasonable player, one action every --tap seconds: buys the cheapest affordable thing (Gilda's
// next part included), sells a frog whose band is paying well (×1.5 or more), otherwise melts the
// smallest pair, otherwise folds a frog, otherwise (table full) sells the frog that pays best.
// At the end they keep still for the reading, fidgeting once after 12 seconds.
import * as E from './economy.mjs';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? Number(a.split('=')[1]) : d; };
const quiet = process.argv.includes('--quiet'), TAP = arg('tap', 1.3);
const S = E.newState(arg('seed', 20261104));
const log = [], gaps = [];
let lastBuy = 0, buys = 0, cool = 0, fidgeted = false;
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const mark = s => log.push(`${fmtT(S.t).padStart(6)}  ${s}`);
const dt = 0.05;

function spend() {
  for (let guard = 0; guard < 20; guard++) {
    E.reveal(S);
    const can = E.items(S).filter(u => u.price <= S.buttons);
    const part = E.nextPart(S);
    if (part && part.price <= S.buttons) can.push({ id: '#part', name: `PART ${part.name}`, price: part.price });
    const pick = can.sort((a, b) => a.price - b.price)[0];
    if (!pick) return false;
    if (pick.id === '#part') E.fit(S); else E.buy(S, pick.id);
    buys++; gaps.push(S.t - lastBuy); lastBuy = S.t;
    if (!quiet || pick.id === '#part') mark(`buy ${pick.name}${pick.max ? ' ' + E.lvl(S, pick.id) : ''} (${E.fmt(pick.price)})`);
    return true;
  }
}
function act() {
  if (spend()) return;
  const B = S.board;
  const count = t => B.filter(x => x === t).length;
  // Sell into a hot band: one of the biggest frogs, when its band pays ×1.4 or more.
  const frogs = B.map((t, i) => [t, i]).filter(([t]) => t).sort((a, b) => E.priceAt(S, b[0]) - E.priceAt(S, a[0]));
  const hot = frogs.find(([t]) => t >= S.best - 2 && E.mult(S, t) >= 1.4);
  // Or sell the biggest frog when it's enough for the next thing wanted, at a fair price.
  const want = Math.min(...E.items(S).map(u => u.price), E.nextPart(S)?.price ?? Infinity);
  const top = frogs[0];
  const enough = top && E.mult(S, top[0]) >= 0.9 && S.buttons < want && S.buttons + E.priceAt(S, top[0]) >= want;
  const pickF = hot || (enough ? top : null);
  if (pickF) { if (E.has(S, 'barrow') && hot) E.sellAll(S, pickF[0]); else E.sell(S, pickF[1]); return; }
  // Melt the smallest pair.
  const pr = E.mothPair(S);
  if (pr) { E.melt(S, pr[0], pr[1]); return; }
  if (E.tap(S).length) return;
  // Table full and no pairs: sell what pays best relative to its size.
  let bi = -1, bm = -1;
  B.forEach((t, i) => { if (t && E.mult(S, t) > bm) { bm = E.mult(S, t); bi = i; } });
  if (bi >= 0) E.sell(S, bi);
}

let partsWas = 0, nextRep = 120, earnedWas = 0;
while (!S.ended && S.t < 3 * 3600) {
  for (const e of E.tick(S, dt)) if (e.type === 'end') mark('THE LAST CARD TURNS');
  if (S.parts !== partsWas) { partsWas = S.parts; mark(`-- Gilda ${S.parts}/${E.PARTS.length} mended, best ${E.SIZES[S.best - 1]}`); }
  if (S.t >= nextRep && !quiet) { mark(`   ~ ${E.fmt((S.earned - earnedWas) / 120)}/s, best ${E.SIZES[S.best - 1]}, board ${S.board.filter(Boolean).length}/${S.board.length}`); earnedWas = S.earned; nextRep += 120; }
  cool -= dt;
  if (S.still) {
    // Keeping still. One slip after 12 seconds, as people do.
    if (!fidgeted && S.still.t > 12) { fidgeted = true; E.fidget(S); mark('fidget! the hourglass starts over'); }
    continue;
  }
  if (cool <= 0) { act(); cool = TAP; }
}
const g = gaps.slice(1);
console.log(log.join('\n'));
console.log(`\nfinished ${fmtT(S.t)} · ${buys} purchases · gap median ${g.sort((a, b) => a - b)[g.length >> 1]?.toFixed(1)}s, max ${Math.max(...g).toFixed(1)}s · earned ${E.fmt(S.earned)} · best ${E.SIZES[S.best - 1]} · melts ${S.melts} · sold ${S.sold}`);
