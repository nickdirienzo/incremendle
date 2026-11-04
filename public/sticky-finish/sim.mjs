// Headless pacing sim: node public/sticky-finish/sim.mjs [sitting minutes] [hours away] [-v]
// A reasonable player: types each label at about 48 words a minute (0.8 s to read it, 0.25 s a letter), buys the cheapest affordable thing, but stops
// buying producers late in a summer to let the stair stand for the review (hoard window grows with
// the summer), and buys Notes upgrades over winter, cheapest first, flowers preferred.
import * as E from './economy.mjs';

const SIT = Number(process.argv[2] || 30) * 60, AWAY = Number(process.argv[3] || 3) * 3600;
const V = process.argv.includes('-v');
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const S = E.newState();
const log = [];
let played = 0, sittings = 1, sitT = 0, act = 0;
const pickWord = () => { const w = E.words(S); return w[Math.floor(rnd() * w.length)]; };
let word = pickWord(), next = 2;
const mark = what => log.push([played, what]);
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const DT = 0.1;
while (!S.ended && played < 6 * 3600) {
  if (S.winter) {
    // Winter: read the review, spend Notes, start the next summer (about 15 s).
    played += 15; sitT += 15;
    for (let k = 0; k < 20; k++) {
      const o = E.items(S).filter(u => u.cur === 'n' && S.notes >= u.cost).sort((a, b) => (b.flower ? 1 : 0) - (a.flower ? 1 : 0) || a.cost - b.cost);
      if (o.length && E.buy(S, o[0].id)) { mark('  ' + o[0].name); continue; }
      const next1 = E.items(S).filter(u => u.cur === 'n').reduce((m, u) => Math.min(m, u.cost), Infinity);
      if (!o.length && (E.winterCost(S) * 2.5 < next1 || next1 === Infinity || S.notes - E.winterCost(S) + S.lastNotes >= next1) && E.buyWinter(S)) { mark(`  Overwintering ${S.winterLv}`); continue; }
      break;
    }
    E.startSummer(S); mark(`=== summer ${S.season} (${fmtT(E.summerLength(S))}) ===`);
    continue;
  }
  E.step(S, DT); played += DT; sitT += DT; act += DT;
  if (S.winter) { mark(`--- boat: stair ${S.lastPeak}, Notes +${S.lastNotes} ---`); continue; }
  if (act >= next) { act = 0; E.label(S, word); word = pickWord(); next = 0.8 + 0.25 * word.length + rnd() * 0.4; }
  if (S.record) { played += 20; mark(`*** THE LAMP (season ${S.season}) ***`); S.ended = true; break; }
  const hoard = E.timeLeft(S) < E.summerLength(S) * 0.22;
  for (let k = 0; k < 30; k++) {
    const o = [];
    for (const u of E.items(S)) if (u.cur === 'j' && S.jars >= u.cost && (!hoard || u.kind !== 'odd')) o.push({ c: u.cost, go: () => E.buy(S, u.id), n: u.name });
    if (!hoard) for (const p of ['frame', 'hive', 'queen']) if (E.unlocked(S, p) && S.jars >= E.prodCost(S, p)) o.push({ c: E.prodCost(S, p), go: () => E.buyProd(S, p), n: p, tier: { frame: 1, hive: 2, queen: 3 }[p] });
    if (hoard) { for (let i = o.length - 1; i >= 0; i--) if (o[i].c > S.jars * 0.3) o.splice(i, 1); }
    if (!o.length) break;
    o.sort((a, b) => a.c - b.c);
    // A person reaches for the bigger producer once it costs no more than twice the cheapest thing.
    const up = o.filter(x => x.tier && x.c <= o[0].c * 2).sort((a, b) => b.tier - a.tier)[0];
    if (up) { o.unshift(up); }
    if (o[0].go()) mark(o[0].n); else break;
  }
  if (sitT >= SIT && !S.ended) { const got = E.offline(S, AWAY); sittings++; sitT = 0; mark(`--- away ${AWAY / 3600}h: +${got ? E.fmt(got.jars) : 0} jars ---`); }
}
let prev = 0; const gaps = [];
let lastProd = '';
for (const [t, what] of log) {
  if (!what.startsWith('=') && !what.startsWith('-') && !what.startsWith('*')) { gaps.push(t - prev); prev = t; }
  else prev = Math.max(prev, t);
  const isProd = /^(frame|hive|queen)$/.test(what);
  if (V || !isProd) console.log(fmtT(t).padStart(6), what);
}
gaps.sort((a, b) => a - b);
console.log(`\nended=${S.ended} played ${fmtT(played)} in ${sittings} sittings · ${S.season} summers · ${log.length} purchases · median gap ${gaps[gaps.length >> 1].toFixed(1)}s · 90th ${gaps[Math.floor(gaps.length * .9)].toFixed(0)}s · max ${gaps[gaps.length - 1].toFixed(0)}s · reviews ${S.reviews.join(',')}`);
