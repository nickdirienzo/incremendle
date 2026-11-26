// Headless pacing sim: node public/set-the-table/sim.mjs [tall|squat] [kite|palms] [--log]
// A reasonable player: drops a lemon every 1.3 s (aiming with some error), buys the cheapest affordable thing,
// picks the forks as given, and taps a fallen tower about 4 s after it falls.
import * as E from './economy.mjs';

const [towerPick = 'tall', windPick = 'kite'] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const LOG = process.argv.includes('--log');
const k = process.argv.find(a => a.startsWith('--k='));
if (k) E.TUNE.rate = +k.slice(4);
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());

const S = E.load(null);
const dt = 0.1;
let nextDrop = 1.3, nextGust = 20, lastBuy = 0;
const buys = [], gaps = [], marks = [];
let phase = 1, stretches = 0;
const fallen = {};

function drop() {
  const sd = 0.42 * E.bounceSpeed(S) / 2.4;
  const top = S.tower.length ? S.tower[S.tower.length - 1] : 0;
  const dx = gauss() * sd;
  if (Math.abs(dx) > E.tolerance(S)) return;   // slips off
  const x = Math.abs(dx) < 0.12 ? top : top + dx;
  S.tower.push(x); S.landed++;
  if (Math.abs(x) > E.leanLimit(S)) { S.tower = []; return; }      // topples
  if (S.tower.length > E.BASE) { E.earn(S, E.dishMult(S)); S.handDishes += E.dishMult(S); }
  if (S.tower.length >= E.SERVE_AT) { E.earn(S, E.SERVE_BONUS * E.dishMult(S)); S.served++; S.tower = []; }
}

while (!E.done(S) && S.time < 7200) {
  const ev = E.step(S, dt);
  if (ev.blew) marks.push([S.time, `GALE BLOWS (#${S.gales})`]);
  if (E.handActive(S) && S.time >= nextDrop) { drop(); nextDrop = S.time + 1.3; }
  if (S.time >= nextGust) {
    const id = E.gust(S, rnd);
    if (id) fallen[id] = S.time + 4;
    nextGust = S.time + E.gustGap(S) * (0.7 + 0.6 * rnd());
  }
  for (const [id, t] of Object.entries(fallen)) if (S.time >= t) { E.restack(S, id); delete fallen[id]; }
  if (ev.blew) for (const p of E.PRODUCERS) if (S.toppled[p.id]) fallen[p.id] = S.time + 4 + 1.3 * Object.keys(fallen).length;
  if (E.forkOpen(S, 'tower')) { E.choose(S, 'tower', towerPick); marks.push([S.time, `fork: ${towerPick}`]); }
  if (E.forkOpen(S, 'wind')) { E.choose(S, 'wind', windPick); marks.push([S.time, `fork: ${windPick}`]); }
  E.reveal(S);
  // the cheapest affordable thing
  const opts = E.visible(S).filter(it => E.canBuy(S, it.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
  if (opts.length) {
    const it = opts[0];
    E.buy(S, it.id);
    gaps.push(S.time - lastBuy); lastBuy = S.time;
    buys.push([S.time, it.id + (S.own[it.id] !== undefined ? ' #' + S.own[it.id] : '')]);
  }
  const p = E.phaseOf(S);
  if (p !== phase) { marks.push([S.time, `=== PHASE ${p} ===`]); phase = p; }
  const st = E.stretchesSet(S);
  if (st !== stretches) { stretches = st; marks.push([S.time, `stretch ${st}: ${E.STRETCHES[st - 1].name} set`]); }
}

const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const lines = [...buys.map(([t, s]) => [t, '  buy ' + s]), ...marks.map(([t, s]) => [t, s])].sort((a, b) => a[0] - b[0]);
if (LOG) for (const [t, s] of lines) console.log(mmss(t), s);
else {
  // compact timeline: marks, and buys summarised per minute
  let minute = -1, row = [];
  const flush = () => { if (row.length) console.log(`${mmss(minute * 60)}  ${row.join(', ')}`); row = []; };
  for (const [t, s] of lines) {
    if (!s.startsWith('  buy')) { flush(); console.log(`${mmss(t)}  ** ${s}`); continue; }
    const m = Math.floor(t / 60); if (m !== minute) { flush(); minute = m; }
    row.push(s.slice(6));
  }
  flush();
}
const phase3 = S.phase3At ?? S.time;
const g = gaps.slice(1);
const longest = Math.max(...g);
console.log(`\n${towerPick}/${windPick}: finished ${mmss(S.time)}  (phase 3 began ${mmss(phase3)}, race ${mmss(S.time - phase3)}), gales ${S.gales}, purchases ${buys.length}, median gap ${g.sort((a, b) => a - b)[g.length >> 1].toFixed(1)}s, longest gap ${longest.toFixed(0)}s, hand dishes ${Math.round(S.handDishes)}, served ${S.served}`);
