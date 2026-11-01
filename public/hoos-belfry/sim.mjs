// Pacing sim: node public/hoos-belfry/sim.mjs [--sit=30] [--away=180] [--quiet] [--seed=7]
// A reasonable player: tunes a bell by hand every ~4 s when there's one to tune (hits the line
// 85% of the time, dead-on 35%; clonks are harder), buys a bell by hand when out of them, buys the cheapest affordable upgrade, keeps the clipboard
// in a sensible order, spreads the night staff over the jobs, and plays in sittings.
import * as E from './economy.mjs';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? Number(a.split('=')[1]) : d; };
const SIT = arg('sit', 30) * 60, AWAY = arg('away', 180) * 60, quiet = process.argv.includes('--quiet');
let seed = arg('seed', 7);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
Math.random = rnd;
if (process.argv.some(a => a.startsWith('--T='))) Object.assign(E.T, JSON.parse(process.argv.find(a => a.startsWith('--T=')).slice(4)));
const S = E.newState();
const log = [], gaps = [], buckets = [];
let played = 0, sitT = 0, sittings = 1, lastBuy = 0, tuneT = 0, clonkSeen = null;
const fmtT = t => `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const mark = s => log.push(`${fmtT(played)}  ${s}`);
const dt = 0.1;
const ORDER1 = ['tune', 'buy', 'chairs', 'lost', 'cover'];
const ORDER2 = ['tune', 'buy', 'cover', 'lost', 'chairs'];
function program(saving) {
  // A sensible order; the buy chore comes off while saving for something.
  const order = S.review ? ORDER2 : ORDER1;
  S.queue.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  for (const q of S.queue) q.on = q.id === 'buy' ? !saving : !(S.review && q.id === 'chairs');
}
function staff() {
  if (!S.review) return;
  const n = S.staff, J = { scrounge: 0, tune: 0, cover: 0 };
  if (S.plan >= E.PLANS.length) { J.cover = n; }
  else {
    J.tune = Math.max(1, Math.round(n * 0.25)); J.scrounge = Math.max(1, Math.round(n * 0.35));
    J.cover = Math.max(0, n - J.tune - J.scrounge);
  }
  S.jobs = J;
}
function bought(what) {
  if (lastBuy) gaps.push({ t: played, gap: played - lastBuy, ph: E.phase(S), what });
  lastBuy = played;
  buckets[Math.floor(played / 600)] = (buckets[Math.floor(played / 600)] || 0) + 1;
}
function handle(out) {
  for (const ev of out) {
    if (ev.type === 'prank') mark(`*** prank ${ev.plan + 1}: ${E.PLANS[ev.plan].name} (★${ev.stars}) ***  [night ${S.night}, staff ${S.staff}]`);
    if (ev.type === 'review') mark('=== THE BUDGET REVIEW: no more pennies; the night staff volunteer ===');
  }
}

while (!S.ended && played < 10 * 3600) {
  played += dt; sitT += dt;
  const out = E.step(S, dt); handle(out);
  // Discover the clonk a minute after the first “?” slot appears.
  const p = E.plan(S);
  if (!S.clonk && p && p.notes.some(n => E.isClonk(n))) { clonkSeen ??= played; }
  const canClonk = S.clonk || (clonkSeen != null && played - clonkSeen > 60);
  // Tune by hand.
  if (S.raw > 0 && (tuneT += dt) >= 4) {
    tuneT = 0;
    const n = E.autoNote(S, canClonk);
    if (n != null) {
      const clonk = E.isClonk(n), st = E.stats(S);
      const r = rnd(), hit = clonk ? 0.45 + st.clonkTol : 0.72 + st.noteTol * 0.4, perf = clonk ? 0.15 : 0.3;
      const pitch = r < perf ? n : r < hit ? n + (clonk ? st.clonkTol * 0.8 : st.noteTol * 0.8) : n + 0.62;
      const o = []; E.tune(S, pitch, o); handle(o);
    }
  }
  // Save for the next upgrade when it's close; otherwise spend spare pennies on bells.
  const cur = E.bellCur(S), cheap = E.items(S).filter(i => i.cur === cur).sort((a, b) => a.cost - b.cost)[0];
  const saving = S.plan >= E.PLANS.length || (!S.review && cheap && cheap.cost - E.have(S, cur) <= 5);
  if (S.raw < 1 && !saving && E.have(S, cur) >= E.stats(S).price && E.autoNote(S, canClonk) != null) { E.buyBell(S); bought('bell'); }
  if (Math.floor(played / 5) !== Math.floor((played - dt) / 5)) { program(saving); staff(); }
  if (E.canGive(S)) { const g = E.giveAway(S); mark(`GIVE IT ALL AWAY: ${g.bells} bells, ${g.favours} favours, ${g.pence}p`); break; }
  for (let guard = 0; guard < 6; guard++) {
    const opts = E.items(S).filter(i => E.have(S, i.cur) >= i.cost).sort((a, b) => (b.kind === 'staff') - (a.kind === 'staff') || a.cost - b.cost);
    // Near the end, save favours for the last purchase instead of buying silly things.
    // After the Review, keep a bell's worth of favours when out of bells.
    const keep = S.review && S.raw < 1 && E.autoNote(S, true) != null ? E.stats(S).price : 0;
    const pick = S.plan >= E.PLANS.length ? null : opts.find(o => o.cur !== 'f' || S.favours - o.cost >= keep);
    if (!pick) break;
    E.buy(S, pick.id); bought(pick.id);
    mark(`${pick.name}${pick.max > 1 ? ' ' + (pick.l + 1) : ''}${pick.kind === 'staff' ? ' (' + S.staff + ')' : ''}  ${pick.cost}${pick.cur}   [p${S.pence} f${S.favours} raw${S.raw} sheet ${S.plan + 1} ${S.installed}/${E.TOTAL_BELLS}]`);
  }
  if (sitT >= SIT && SIT > 0 && !S.ended) {
    const got = E.offline(S, AWAY);
    if (got) mark(`--- away ${AWAY / 60} min: +${got.pence}p +${got.favours} favours, ${got.installed} bells fitted, ${got.pranks} pranks ---`);
    sitT = 0; sittings++; lastBuy = played;
  }
}
if (!quiet) console.log(log.join('\n'));
const g = gaps.map(x => x.gap).sort((a, b) => a - b), q = p => g[Math.floor(g.length * p)]?.toFixed(1);
console.log(`\nended ${S.ended} after ${fmtT(played)} played, ${sittings} sittings, ${S.night} nights; purchases ${g.length + 1}; tuned ${S.tuned} (★${S.perfect}, clonks ${S.clonks})`);
console.log(`gap median ${q(0.5)}s p90 ${q(0.9)}s max ${q(1)}s`);
console.log('longest gaps:', [...gaps].sort((a, b) => b.gap - a.gap).slice(0, 6).map(x => `${x.gap.toFixed(0)}s @${fmtT(x.t)} (p${x.ph})`).join(', '));
console.log('purchases per 10 min:', [...buckets].map((n, i) => `${i * 10}m:${n || 0}`).join(' '));
