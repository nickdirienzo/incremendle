// Pacing sim: node public/eighteen-pleats/sim.mjs [--quiet] [--tap=1.3] [--seed=7] [--T={...}]
// A reasonable player: takes the best-paying boat it can finish in time, drops a basket once it's
// full (or holds what the order still needs), waits for the swing to come over the stack, and aims
// a little against the lean. Taps no faster than every --tap seconds. Buys the cheapest affordable
// thing. Their aim gets worse with a fast swing and a trembling lighthouse.
import * as E from './economy.mjs';

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? Number(a.split('=')[1]) : d; };
const quiet = process.argv.includes('--quiet'), TAP = arg('tap', 1.3);
let seed = arg('seed', 7);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const Targ = process.argv.find(a => a.startsWith('--T='));
if (Targ) Object.assign(E.T, JSON.parse(Targ.slice(4)));

const S = E.newState();
const log = [], gaps = [];
let expired = 0, gone = 0, lastBuy = 0, buys = 0, tapCool = 0, waitDrop = -1, phaseWas = 'fog';
const fmtT = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const mark = s => log.push(`${fmtT(S.t).padStart(6)}  ${s}`);
const dt = 0.05;

function spend() {
  for (let guard = 0; guard < 30; guard++) {
    E.reveal(S);
    const can = E.items(S).filter(u => u.price <= S.chits);
    // New kinds of orders and helpers first (a person reads those tooltips), then the cheapest.
    const pick = can.find(u => ['prawn', 'soup', 'latch', 'horn'].includes(u.id)) || can.sort((a, b) => a.price - b.price)[0];
    if (!pick) break;
    E.buy(S, pick.id); buys++;
    gaps.push(S.t - lastBuy); lastBuy = S.t;
    if (!quiet) mark(`buy ${pick.name}${pick.max ? ' ' + E.lvl(S, pick.id) : ''} (${pick.price})`);
  }
}
function pickSlip() {
  if (S.active || !S.board.length) return;
  const st = E.stats(S);
  const ok = S.board.filter(b => (b.want - E.stackN(S)) * st.perDumpling + 4 < b.deadline);
  const best = (ok.length ? ok : S.board).sort((a, b) => b.pay - a.pay)[0];
  E.accept(S, best.id);
}
function wantDrop() {
  const st = E.stats(S);
  if (S.hook.n === 0 || S.lowering > 0) return false;
  const need = S.active ? S.active.want - E.stackN(S) : Infinity;
  if (S.hook.n >= st.cap || S.hook.n >= need) return true;
  if (!S.active && S.stack.length >= 4) return false;
  return false;
}
function aimError() {
  const st = E.stats(S);
  const tremble = (0.025 + 0.2 * S.nerves) * st.tremble;
  const sigma = 0.15 * (E.T.period / st.period) + 0.9 * tremble + 0.03 * Math.min(1, S.stack.length / 10);
  return -0.35 * E.com(S) + gauss() * sigma;
}

const limit = 3 * 3600;
while (!S.quotaMet && S.t < limit) {
  const ev = E.tick(S, dt);
  for (const e of ev) {
    if (e.deliver && !quiet && e.deliver.pay > 0 && S.delivered % 5 === 0) mark(`  delivered #${S.delivered}: ${e.deliver.delivered} to ${e.deliver.boat} (+${e.deliver.pay}), served ${S.served}`);
    if (e.eastpoint) mark('== Eastpoint opens ==');
    if (e.expired) expired++;
    if (e.gone) gone++;
  }
  const ph = E.phase(S);
  if (ph !== phaseWas) { mark(`== phase: ${ph} ==`); phaseWas = ph; }
  tapCool -= dt;
  pickSlip();
  if (waitDrop >= 0) {
    waitDrop -= dt;
    if (waitDrop < 0) {
      const r = E.drop(S, aimError());
      if (r.toppled && !quiet) mark(`  TOPPLE at ${r.toppled} (lost ${r.lost})`);
    }
  } else if (tapCool <= 0 && wantDrop()) {
    tapCool = TAP; waitDrop = rnd() * E.stats(S).period / 2;
  }
  spend();
}
const finalT = S.t + 9 * 2.2 + 12;
mark(`== quota met: Form 99 == (finale ~${Math.round(finalT - S.t)}s)`);
gaps.push(finalT - lastBuy);
if (!quiet) console.log(log.join('\n'));
const sorted = [...gaps].sort((a, b) => a - b);
console.log(`\nEnded at ${fmtT(finalT)} · ${buys} purchases · median gap ${sorted[sorted.length >> 1]?.toFixed(0)}s · longest gap ${sorted[sorted.length - 1]?.toFixed(0)}s`);
console.log(`delivered ${S.delivered} · expired ${expired} · left for Eastpoint ${gone} · topples ${S.topples} · perfects ${S.perfects} · best stack ${S.bestStack} · eastpoint fed ${S.epServed} · pleats/s ${E.stats(S).pleats.toFixed(0)} · nerves ${S.nerves.toFixed(2)}`);
