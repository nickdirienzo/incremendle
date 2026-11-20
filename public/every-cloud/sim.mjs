// Pacing sim for Every Cloud: node public/every-cloud/sim.mjs [seed]
// A reasonable player: one scratch stroke every ~1.3 s on a lined cloud, buys the cheapest affordable thing
// (watering Houston counts), flies each mission as soon as it opens (a run of 45 s; retried if it fails),
// and holds back at the end.
import * as E from './economy.mjs';

let seed = Number(process.argv[2] || 7);
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const S = E.fresh(); S.started = true;
const CROSS = 24;                 // seconds a cloud takes to cross the sky
let tacc = 0, target = null, t = 0, nextSpawn = 0, nextStroke = 0, paintLeft = 0;
const clouds = [];                // { L, born, painted, prog }
const log = [];
const mark = (what) => log.push([t, what]);
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function relCloud(c, who) { const r = E.release(S, c.L, rnd, who); if (r.find) mark(`  find: ${r.find}`); c.done = true; }

function mission(m) {
  // Clouds come pre-lined, one every 2.5 s; the handicap costs the sim player some efficiency.
  const eff = { wind: 0.8, evap: 0.85, dark: 0.7 }[m.id];
  const strokes = E.STROKES[S.lv.loofah] / eff;
  const got = Math.min(Math.floor(m.secs / 2.5), Math.floor(m.secs / 1.3 / strokes));
  for (let i = 0; i < got; i++) E.release(S, E.reachLayer(S), rnd);
  t += m.secs + 6;
  const ok = got >= m.need;
  if (ok) S.won[m.id] = true;
  mark(`== MISSION ${m.name}: ${got}/${m.need} ${ok ? 'WON' : 'failed'}`);
}

while (!S.ended && t < 4 * 3600) {
  const dt = 0.1; t += dt;
  // Spawn
  if (t >= nextSpawn) { clouds.push({ L: E.pickLayer(S, rnd()), born: t, painted: false, prog: 0 }); nextSpawn = t + E.spawnSecs(S); }
  // Paint the oldest unpainted cloud
  const up = clouds.find(c => !c.painted && !c.done);
  if (up) { paintLeft += dt; if (paintLeft >= E.paintSecs(S)) { up.painted = true; paintLeft = 0; } }
  // Player stroke
  const ready = clouds.filter(c => c.painted && !c.done);
  if (t >= nextStroke && ready.length) {
    if (!target || target.done || !clouds.includes(target)) target = ready.filter(c => c.born > t - CROSS + 5)[0] || ready[ready.length - 1];
    const c = target; c.prog += 1 / E.STROKES[S.lv.loofah]; c.me = true;
    if (c.prog >= 1) relCloud(c, 'me');
    nextStroke = t + 1.3;
  }
  // Tendrils work the newest lined cloud
  const tr = E.tendrilPerMin(S) / 60;
  if (tr) { const c = clouds.find(c => c.painted && !c.done && c !== target); if (c) { tacc += tr * dt; if (tacc >= 1) { tacc -= 1; relCloud(c, 'her'); } } }
  // Leave
  for (let i = clouds.length - 1; i >= 0; i--) if (clouds[i].done || t - clouds[i].born > CROSS) clouds.splice(i, 1);
  // Missions
  for (const m of E.missionsOpen(S)) mission(m);
  // Buy cheapest
  for (let k = 0; k < 3; k++) {
    for (const id of E.reveal(S)) mark(`  unlock ${id}`);
    const opts = [...E.items(S).map(i => i.id)];
    if (S.lv.water < E.WATER_MAX) opts.push('water');
    opts.sort((a, b) => E.cost(S, a) - E.cost(S, b));
    const id = opts.find(id => E.cost(S, id) <= S.rain);
    if (!id) break;
    const c = E.cost(S, id);
    E.buy(S, id);
    mark(`buy ${id === 'water' ? `water -> ${E.height(S)} m` : id + (E.BY_ID[id].kind === 'lv' ? ' ' + S.lv[id] : '')} (${c})`);
  }
  if (S.lv.water >= E.WATER_MAX) { mark('== THE BIG ONE: hold'); t += E.HOLD_SECS + 10; S.ended = true; mark('== END'); }
}

let prev = 0; const gaps = [];
for (const [tt, w] of log) { if (w.startsWith('buy')) { gaps.push(tt - prev); prev = tt; } console.log(fmtT(tt), w); }
gaps.sort((a, b) => a - b);
console.log(`\nfinished ${fmtT(t)}; purchases ${gaps.length}; median gap ${gaps[gaps.length >> 1].toFixed(0)} s; max gap ${gaps[gaps.length - 1].toFixed(0)} s`);
console.log(`clouds: you ${S.mine}, Houston ${S.hers} (${Math.round(S.hers / (S.mine + S.hers) * 100)}%); dents ${S.dents}; finds ${E.findsHave(S)}/6; total rain ${S.total}`);
