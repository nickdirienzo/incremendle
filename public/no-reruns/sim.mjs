// Pacing sim for No Reruns: a reasonable player in sittings.
//   node public/no-reruns/sim.mjs [sittingMin=30] [awayHours=3]
// One hand pour every ~1.3 s (aiming at the line, a little off), strings the next constellation whenever
// a hook is free, buys the cheapest affordable thing in each currency, picks sensible forms, and lays the
// tape out the way a person would: the longest snake, TVs first, then rewinders, funnels, looms.
import * as E from './economy.mjs';

const SIT = (+process.argv[2] || 30) * 60, AWAY = (+process.argv[3] || 3) * 3600;
const PICK = Object.assign({ t1: 'b', t2: 'a', t3: 'a', t4: 'a', t5: 'a', t6: 'a', t7: 'a', t8: 'b' }, JSON.parse(process.env.ALT || '{}'));
const S = E.fresh();
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
const log = [], fmt = E.fmt, mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function arrange() {
  if (!S.permit) return;
  const snake = E.snakePath(S);
  S.path = snake; S.place = {}; S.h = {};
  let k = 0;
  for (const id of ['tv', 'rew', 'funnel', 'loom']) for (let n = S.own[id]; n > 0 && k < snake.length; k++) { const h = Math.min(E.STACK, n); S.place[snake[k]] = id; S.h[snake[k]] = h; n -= h; }
}
function buys(tPlay) {
  let any = true;
  while (any) {
    any = false;
    if (E.string(S)) { log.push([tPlay, `string ${E.CONS[S.strung - 1].name} (${S.strung})`]); any = true; continue; }
    const all = E.items(S).filter(i => E.canBuy(S, i.id));
    // forms: only the sensible box
    const ok = all.filter(i => i.kind !== 'form' || i.form.single || PICK[i.form.id] === i.opt);
    // Machines: a person buys the multiplier first, and keeps room on the floor for it.
    const cells = S.permit ? S.path.length : 99, mult = S.form.t3 === 'a' ? 'rew' : S.form.t3 === 'b' ? 'loom' : null;
    const cap = { tv: S.permit ? E.STACK * Math.ceil(cells * (mult ? 0.4 : 0.6)) : E.STACK, funnel: E.STACK * Math.ceil(cells * 0.3) };
    const f = E.flow(S), fcap = S.own.funnel * E.funnelCap(S), roomy = fcap < 0.7 * f.made;
    const pick = ok.filter(i => (i.kind !== 'mach' || i.id === mult || S.own[i.id] < cap[i.id]) && (roomy || (i.id !== 'funnel' && i.id !== 'neck')));
    const m = mult && pick.find(i => i.id === mult);
    for (const cur of ['stars', 'static']) {
      const c = pick.filter(i => i.cur === cur).sort((a, b) => a.price - b.price)[0];
      if (c && E.buy(S, c.id)) { arrange(); log.push([tPlay, `${c.name}${c.kind === 'mach' ? ' #' + S.own[c.id] : c.kind === 'level' ? ' L' + S.lv[c.id] : ''} (${fmt(c.price)} ${cur})`]); any = true; }
    }
  }
}
let play = 0, wall = 0, sittings = 0, pourT = 0;
const marks = [];
let wasPermit = false, was50 = false;
while (S.out < E.TOTAL && play < 20 * 3600) {
  sittings++;
  const end = play + SIT;
  while (play < end && S.out < E.TOTAL) {
    const dt = 0.1;
    play += dt; wall += dt;
    E.tick(S, dt);
    pourT += dt;
    if (pourT >= 1.3) {
      pourT = 0;
      const target = E.LINE + gauss() * 0.06;
      const p = { level: 0, full: E.frameStatic(S) };
      for (let k = 0; k < 20 && p.level < target; k++) { E.pourStep(S, p, E.POUR_TIME / 10); if (p.dry) break; }
      E.pour(S, Math.min(p.level, target + 0.001));
    }
    if (Math.round(play * 10) % 10 === 0) buys(play);
    if (process.env.DUMP && play >= +process.env.DUMP * 60) { S.savedAt = 0; console.log(JSON.stringify(S)); process.exit(0); }
    if (S.permit && !wasPermit) { wasPermit = true; marks.push([play, '== PERMIT: the booth floor opens ==']); }
    if (S.out >= 50 && !was50) { was50 = true; marks.push([play, '== 50 out: the small hours ==']); }
  }
  if (S.out >= E.TOTAL) break;
  const r = E.offline(S, AWAY); wall += AWAY;
  marks.push([play, `-- away ${AWAY / 3600} h: +${fmt(r.static)} static, +${fmt(r.stars)} stars, ${r.out} constellations came out --`]);
}
const all = [...log, ...marks].sort((a, b) => a[0] - b[0]);
let prev = 0, gaps = [];
for (const [t, s] of all) {
  if (!s.startsWith('--') && !s.startsWith('==')) { gaps.push(t - prev); prev = t; }
  if (process.argv.includes('-v') || s.startsWith('--') || s.startsWith('==') || /string|Form|Permit|\(.*\)/.test(s) && !/^A (TV|Funnel)/.test(s)) console.log(mm(t).padStart(7), s);
}
gaps.sort((a, b) => a - b);
console.log(`\nfinished: ${S.out}/${E.TOTAL} out, played ${(play / 3600).toFixed(2)} h in ${sittings} sittings (wall ${(wall / 3600).toFixed(1)} h)`);
console.log(`purchases ${log.length}, gap median ${gaps[gaps.length >> 1].toFixed(0)} s, p90 ${gaps[Math.floor(gaps.length * 0.9)].toFixed(0)} s, max ${gaps[gaps.length - 1].toFixed(0)} s`);
console.log(`own`, S.own, 'lv', S.lv, 'static', fmt(S.allStatic), 'stars', fmt(S.allStars), 'pours', S.pours, 'perfect', S.perfects);
// longest gaps
const g2 = []; prev = 0; for (const [t, s] of log) { g2.push([t - prev, t, s]); prev = t; }
console.log('longest gaps:', g2.sort((a, b) => b[0] - a[0]).slice(0, 6).map(([g, t, s]) => `${g.toFixed(0)}s before ${mm(t)} ${s}`).join(' | '));
{ const f = E.flow(S); console.log('end flow: spout', fmt(f.spout), '/s, funnel stars', fmt(f.stars), '/s, hand pour', fmt(E.pourResult(S, E.LINE).stars / 1.3), 'stars/s, tvOut', fmt(E.tvOut(S)), 'cap', fmt(E.funnelCap(S)), 'cost last', fmt(E.consCost(87))); }
