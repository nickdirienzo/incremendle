// Pacing sim: node public/hold-it-up-to-the-light/sim.mjs [--quiet]
// A reasonable player: re-aims the trolley every ~1.3 s at the crystal worth the most to top up,
// buys the cheapest affordable thing (shop, recipes it can see hints for, the Peek when ready),
// and plays in sittings of 30 minutes with 3 hours away (offline lamps) in between.
import * as E from './economy.mjs';

const quiet = process.argv.includes('--quiet');
const dumpAt = process.argv.includes('--dump') ? +process.argv[process.argv.indexOf('--dump') + 1] * 60 : null;
const S = E.defaults();
const tr = { x: E.CX, y: E.CY + 40, h: 0, v: 0 };
const dt = 0.1, SITTING = 30 * 60, AWAY = 3 * 3600;
let t = 0, played = 0, sit = 0, sittings = 1, target = null, retarget = 0, lampA = 0;
const log = [], gaps = [];
let lastBuy = 0;
const buyLog = (what) => { log.push([played, what]); gaps.push(played - lastBuy); lastBuy = played; };

function pick() {
  let best = null, bv = -1;
  const full = E.lensCharge(S);
  for (const id of S.own) {
    const s = E.slotOf(S, id), c = S.charge[id] || 0;
    const d = Math.hypot(s.x - tr.x, s.y - tr.y);
    const v = E.speciesRate(S, E.BY_ID[id]) * (full - c) / (d / E.speed(S) + E.FILL_TIME + 0.4);
    if (v > bv) { bv = v; best = s; }
  }
  return best;
}
function options() {
  const o = [];
  for (const u of E.UPGRADES) if (E.unlocked(S, u) && !E.maxed(S, u)) o.push({ cost: E.upCost(S, u), go: () => E.buy(S, u), name: u.name + (u.kind === 'rep' ? ' ' + (E.lvl(S, u.id) + 1) : '') });
  for (const sp of E.SPECIES) if (sp.mix && !S.own.includes(sp.id) && E.has(S, sp.mix[0]) && E.has(S, sp.mix[1]))
    o.push({ cost: sp.cost, go: () => E.mix(S, ...sp.mix).ok, name: '⚗ ' + sp.name });
  return o;
}
while (!S.ended && played < 20 * 3600) {
  retarget -= dt;
  if (retarget <= 0) { target = pick(); retarget = 1.3; }
  const spot = E.steer(tr, target, dt, E.speed(S));
  const sx = spot.x + Math.cos(tr.h) * 6, sy = spot.y + Math.sin(tr.h) * 5;
  lampA = (lampA + dt * Math.PI * 2 / E.LAMP_PERIOD) % (Math.PI * 2);
  const r = E.tick(S, dt, { x: sx, y: sy }, lampA);
  E.addGlow(S, r.made);
  t += dt; played += dt; sit += dt; S.time = played;
  if (dumpAt != null && played >= dumpAt) { S.seen = E.UPGRADES.filter(u => E.unlocked(S, u)).map(u => u.id); console.log(JSON.stringify(S)); process.exit(0); }
  // Peek first if possible (the goal); then cheapest purchase, but don't starve a near peek.
  if (E.canPeek(S)) { const L = E.LAYERS[S.peeks].name; E.peek(S); buyLog(`👁 PEEK ${S.peeks}: ${L}`); continue; }
  const opts = options().sort((a, b) => a.cost - b.cost);
  const pc = E.peekCost(S), cap = E.capacity(S);
  for (const o of opts) {
    if (o.cost > S.glow) break;
    // Saving for a peek the jars can hold: only buy things under a fifth of it.
    if (cap >= pc && o.cost > pc * 0.2 && !o.name.startsWith('⚗')) continue;
    if (o.go()) { buyLog(o.name); break; }
  }
  if (sit >= SITTING) {
    const off = E.offline(S, AWAY);
    log.push([played, `💤 away 3h: +${E.fmt(off.gained)} (lamps ${E.lamps(S)})`]);
    sit = 0; sittings++; lastBuy = played;
  }
}
const m = s => `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, '0')}`;
if (!quiet) for (const [at, w] of log) console.log(m(at).padStart(8), w);
const sorted = [...gaps].sort((a, b) => a - b);
console.log(`\nended=${S.ended} played=${m(played)} (${(played / 3600).toFixed(2)} h) sittings=${sittings} purchases=${gaps.length}`);
console.log(`gap median ${sorted[sorted.length >> 1]?.toFixed(0)}s p90 ${sorted[Math.floor(sorted.length * .9)]?.toFixed(0)}s max ${sorted[sorted.length - 1]?.toFixed(0)}s`);
const peeks = log.filter(l => l[1].includes('PEEK')).map(l => m(l[0]));
console.log('peeks at', peeks.join(' '));
console.log('end state: glow', E.fmt(S.glow), 'cap', E.fmt(E.capacity(S)), 'own', S.own.length, JSON.stringify(S.up));
const pk = [0, ...log.filter(l => l[1].includes('PEEK')).map(l => l[0])];
console.log('chapter minutes', pk.slice(1).map((v, i) => ((v - pk[i]) / 60).toFixed(0)).join(' '));
