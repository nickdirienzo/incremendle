// Pacing sim: node public/pomp-and-compost/sim.mjs [--quiet]
// A reasonable player: keeps the trumpet under the socks (catching most of them while the windows are few, fewer
// once four windows are busy; a wider bell helps), buys the cheapest affordable thing, hands in the Household Book
// and knocks on the attic door as soon as they can. Sittings of 30 minutes with 3 hours away between them.
import * as E from './economy.mjs';

let seed = 7;
const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const FALL = 3.8; // seconds from the window to the bell

export function run(log = true, { sitting = 30 * 60, away = 3 * 3600 } = {}) {
  const S = E.defaults();
  const dt = 0.1;
  let t = 0, sit = 0, sittings = 1, lastBuy = 0, dropT = 0, sdT = 0;
  const air = []; // [landAt, kind, counted]
  const buys = [], gaps = [], marks = [];
  const m = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const note = what => { buys.push(`${m(t)} ${what}`); gaps.push(t - lastBuy); lastBuy = t; };
  let lastTrunk = 0, lastCat = 0;
  while (!S.ended && t < 6 * 3600) {
    t += dt; sit += dt;
    E.tick(S, dt);
    E.reveal(S);
    // Ormsby drops.
    if (S.phase < 3) {
      dropT += dt * E.dropRate(S);
      while (dropT >= 1) {
        dropT -= 1;
        if (S.phase === 2 && E.atticEmpty(S)) break;
        if (!E.room(S, air.length)) { dropT = 0; break; }
        const counted = E.dropped(S);
        air.push([t + FALL, E.pickKind(S, rng), counted]);
      }
    } else if (S.sd && S.sd.q.length) {
      sdT += dt;
      if (sdT > 1.1) { sdT = 0; air.push([t + FALL * 0.8, S.sd.q.shift(), false]); }
    }
    // Landings.
    const rate = Math.min(E.dropRate(S), E.windows(S) * 0.35);
    while (air.length && air[0][0] <= t) {
      const [, kind, counted] = air.shift();
      let p = Math.min(0.95, Math.max(0.5, 0.95 - 0.4 * Math.max(0, rate - 0.5) + 0.03 * S.lv.bell));
      if (S.phase === 1 && !S.cat[kind]) p = Math.min(0.97, p + (S.one.glass ? 0.1 : 0));
      if (S.phase === 3) p = 0.8;
      const got = rng() < p || rng() < E.umbrellaShare(S);
      if (S.phase === 3) {
        if (!got) { S.sd.q.push(kind); continue; }
        const at = S.line.indexOf(kind);
        if (at >= 0) { S.line.splice(at, 1); S.sd.pairs++; } else S.line.push(kind);
        if (S.sd.pairs >= E.SHOWDOWN_PAIRS) { marks.push(`${m(t)} == the will flutters down; composted. THE END ==`); S.ended = true; }
        continue;
      }
      if (got) { const r = E.caught(S, kind); if (r.fresh && S.phase === 1) marks.push(`${m(t)}    catalogued ${E.catalogued(S)}/12 (${kind}) at trunk ${E.trunk(S).n}`); }
      else E.missed(S, counted, rng);
    }
    const tr = E.trunk(S).emptied;
    if (tr !== lastTrunk && tr % 5 === 0) marks.push(`${m(t)}    -- trunk ${tr} emptied (souvenirs ${S.souvenirs}) --`);
    lastTrunk = tr;
    if (E.bookReady(S)) { E.handIn(S); marks.push(`${m(t)} == RULE TWO: pairs only (trunk ${E.trunk(S).n}) ==`); }
    if (E.atticEmpty(S) && S.phase === 2 && !air.length) { E.startShowdown(S, rng); marks.push(`${m(t)} == SHOWDOWN: King Humphrey's trunk ==`); }
    const list = E.items(S).filter(it => E.canBuy(S, it.id)).sort((a, b) => E.cost(S, a.id) - E.cost(S, b.id));
    if (list.length) { const it = list[0]; const price = E.cost(S, it.id); E.buy(S, it.id); note(`${it.name}${it.kind === 'lv' ? ' L' + S.lv[it.id] : ''} (${price})`); }
    if (sit >= sitting && S.phase < 3) {
      sit = 0; sittings++;
      const off = E.offline(S, away);
      marks.push(`${m(t)} -- away 3h: +${off?.socks || 0} socks, +${off?.soil || 0} soil --`);
    }
  }
  if (log) {
    const p = s => { const [mm, ss] = s.trim().split(' ')[0].split(':'); return +mm * 60 + +ss; };
    console.log([...buys, ...marks].sort((a, b) => p(a) - p(b)).join('\n'));
    const sorted = gaps.slice().sort((a, b) => a - b);
    console.log(`\nEnded at ${m(t)} played, ${sittings} sittings, ${buys.length} purchases; median gap ${sorted[sorted.length >> 1].toFixed(0)}s, p90 ${sorted[Math.floor(sorted.length * 0.9)].toFixed(0)}s, max ${sorted.at(-1).toFixed(0)}s`);
    console.log(`souvenirs ${S.souvenirs}, caught ${S.caught}, soil total ${E.fmt(S.soilTotal)}, attic ${E.ATTIC_TOTAL}`);
    const idx = gaps.map((g, i) => [g, i]).sort((a, b) => b[0] - a[0]).slice(0, 6);
    console.log('longest gaps before: ' + idx.map(([g, i]) => `${buys[i]} (${g.toFixed(0)}s)`).join(' | '));
  }
  return { t, sittings };
}
if (import.meta.url === `file://${process.argv[1]}`) run(!process.argv.includes('--quiet'));
