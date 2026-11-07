// No Two Alike: the rules. Pure functions over one save object, so the pacing sim (sim.mjs)
// plays the same game as the page.
//
// One currency: certified snowflakes, which stand in the Flurry. The Flurry cools Summer's heat
// waves, and every lathe part is pressed from ice, so upgrades are paid out of the same Flurry.
//
// The Inspector's ledger: a flake is a pattern of k cuts, each cut at one of P notches on the
// lathe, so there are P^k patterns of k cuts. No two alike: once every pattern of k cuts has been
// certified, the minimum goes to k + 1. A new notch widens every k at once.
// Ida's paw wobbles, so her flakes never match anything and skip the ledger.

export const WAVES = [
  { id: 'breeze', name: 'A Warm Breeze', heat: 8, memo: 'Summer has scheduled a Warm Breeze for this afternoon. Attendance is mandatory.' },
  { id: 'spell', name: 'A Sunny Spell', heat: 20, memo: 'RE: A Sunny Spell. Summer calls it “a check-in”. Bring flakes.' },
  { id: 'melt', name: 'Re: Your Melt', heat: 48, memo: 'Summer has replied-all with a heat wave titled “Re: Your Melt”.' },
  { id: 'variance', name: 'Q3 Heat Variance', heat: 110, memo: 'Summer has found some unspent Q3 heat and wants it used before year end.' },
  { id: 'muggy', name: 'The Muggy Front', heat: 220, memo: 'A Muggy Front is moving in from Accounts. It is, as advertised, muggy.' },
  { id: 'kettle', name: 'Kettle Week', heat: 400, memo: 'Summer has declared Kettle Week. Every kettle in the county is pointed at the den.' },
  { id: 'sirocco', name: 'A Visiting Sirocco', heat: 640, memo: 'A Sirocco from Head Office is visiting. It would like a tour, and to be hot at us.' },
  { id: 'dome', name: 'The Heat Dome', heat: 999, memo: 'Summer has booked the Heat Dome. It is the size of the sky, it has a lanyard, and its heat is 999 because the form has three boxes.' },
];
export const RACE = { from: 70, to: 100, secs: 150, snow: 360 }; // °F; snow is flakes on the den
export const IDA_CUTS = 3;          // cuts in one of Ida's freehand flakes
export const CRANK_MAX = 1.5;       // turns per second the big lathe allows (it's heavy)
export const FIRE = 0.4;            // the Flurry sends this share of itself per second in a battle (min 3/s)
export const PRESS = 3;             // seconds a heat wave presses on an empty window before it gets through

// One-time things. kind 'odd' = silly, does little but story.
export const ITEMS = {
  ida: { name: 'Ida on the Second Crank', cost: 10, gate: 2, desc: 'Ida, the old she-wolf who raised you, takes the den’s little hand lathe and cranks it on her own. Her paw wobbles, so her flakes never match anything: the Inspector passes them all.', joke: 'Ida has accepted the position. Salary: one (1) ear scratch per shift, paid in arrears.' },
  tie: { name: 'A Clip-On Necktie', cost: 5, gate: 0, kind: 'odd', desc: 'Professional attire, worn round the stalk. Does nothing for the snow.', joke: 'The broccoli now looks the part. It has howled at only two meetings since.' },
  tag: { name: 'Name Tag for Ida', cost: 9, gate: 2, need: 'ida', kind: 'odd', desc: '“HELLO, my name is IDA (temp).” She has no employee number; the Bureau is looking into it.', joke: 'Ida ate the first name tag. The second one is laminated.' },
  stamp: { name: 'A Second Stamp', cost: 18, gate: 2, kind: 'odd', desc: 'The Inspector may now stamp every flake twice. He does. It changes nothing.', joke: 'The Inspector describes the second stamp as “belt and braces”. He is wearing both.' },
  frame: { name: 'Employee of the Month Frame', cost: 40, gate: 3, kind: 'odd', desc: 'A handsome brass frame for the den wall. Nobody qualifies yet, so it stays empty.', joke: 'Frame installed. Nominations are open to all salaried staff (one broccoli).' },
  review: { name: 'Ida’s Performance Review', cost: 90, gate: 5, need: 'ida', kind: 'odd', desc: 'Formally schedule Ida’s first performance review. Someone should look at her numbers.', joke: 'Review postponed: the reviewer (Ida) was asleep on the warm side of the den.' },
};
// Things you buy many of. cost(level); max level; gate = waves beaten before it shows.
export const LINES = {
  notch: { name: 'A New Notch', max: 3, gate: 0, cost: l => [10, 45, 130][l] },
  cutter: { name: 'Extra Cutter', max: 4, gate: 1, cost: l => [14, 40, 95, 200][l] },
  chill: { name: 'Sharpen the Points', max: 50, gate: 1, cost: l => Math.round(5 * Math.pow(1.09, l)) },
  pup: { name: 'A Pup on the Handle', max: 40, gate: 2, need: 'ida', cost: l => Math.round(7 * Math.pow(1.095, l)) },
};

export function newState() {
  return {
    t: 0, flakes: 0, made: { me: 0, ida: 0 }, cuts: 0, idaCuts: 0, turns: 0,
    used: {}, lv: { notch: 0, cutter: 0, chill: 0, pup: 0 }, up: {},
    wave: 0, heat: WAVES[0].heat, battle: null, losses: 0, wins: 0,
    race: null, recounts: 0, ended: false, seen: [], lastFlake: null,
  };
}

export const notches = s => 3 + s.lv.notch;
export const cutsPerTurn = s => 1 + s.lv.cutter;
export const chill = s => 1 + 0.16 * s.lv.chill;
export const idaRate = s => s.up.ida ? 0.5 + 0.24 * s.lv.pup : 0; // turns per second
export const patterns = (s, k) => Math.pow(notches(s), k);
export function minCuts(s) {
  for (let k = 1; k < 60; k++) if ((s.used[k] || 0) < patterns(s, k)) return k;
  return 60;
}
export const left = (s, k = minCuts(s)) => patterns(s, k) - (s.used[k] || 0);
export const cooling = s => s.flakes * chill(s);
export const wave = s => WAVES[Math.min(s.wave, WAVES.length - 1)];
// Flakes per second from the broccoli at a given cranking speed, and from Ida.
export const myFlakeRate = (s, turnsPerSec) => turnsPerSec * cutsPerTurn(s) / minCuts(s);
export const idaFlakeRate = s => idaRate(s) / IDA_CUTS;

let rand = Math.random;
export const setRandom = f => { rand = f; };
export function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

// A finished flake joins the Flurry (or, in the race, goes straight onto the den).
function addFlake(s, who) {
  s.made[who]++;
  if (s.race) s.race.snow++;
  else s.flakes++;
  if (s.battle) s.battle.press = 0;
}

// One crank of the big lathe (turns can be fractional). Returns the patterns certified, newest last:
// [{ k, notches, seq }] where seq is the pattern (a list of notch indices), for drawing.
export function crank(s, turns) {
  const out = [];
  if (s.ended) return out;
  s.turns += turns;
  s.cuts += turns * cutsPerTurn(s);
  let k = minCuts(s);
  while (s.cuts >= k) {
    s.cuts -= k;
    const idx = s.used[k] || 0;
    s.used[k] = idx + 1;
    out.push({ k, notches: notches(s), seq: pattern(idx, k, notches(s)) });
    addFlake(s, 'me');
    k = minCuts(s);
  }
  return out;
}
// The idx-th pattern of k cuts on P notches, written out (the ledger is a count, the patterns are its digits).
export function pattern(idx, k, P) {
  const seq = [];
  for (let i = 0; i < k; i++) { seq.push(idx % P); idx = Math.floor(idx / P); }
  return seq;
}

// Time passes: Ida cranks, battles and the race play out. Heat waves queue outside the window
// until the player opens it; then the Flurry goes out and the fight runs itself.
// Returns events: { ida: n flakes, start, win, lose, race, recount, end }.
export function step(s, dt) {
  const ev = {};
  if (s.ended) return ev;
  s.t += dt;
  if (s.up.ida) {
    s.idaCuts += idaRate(s) * dt;
    while (s.idaCuts >= IDA_CUTS) { s.idaCuts -= IDA_CUTS; addFlake(s, 'ida'); ev.ida = (ev.ida || 0) + 1; }
  }
  if (s.race) {
    s.race.temp += (RACE.to - RACE.from) / RACE.secs * dt;
    if (s.race.snow >= RACE.snow) { s.race.snow = RACE.snow; s.ended = true; ev.end = true; }
    else if (s.race.temp >= RACE.to) {
      s.recounts++; s.race.temp = RACE.from; s.race.snow = Math.round(s.race.snow * 0.6); ev.recount = true;
    }
    return ev;
  }
  if (s.wave >= WAVES.length) {
    s.raceIn = (s.raceIn ?? 5) - dt;
    if (s.raceIn <= 0) { startRace(s); ev.race = true; }
    return ev;
  }
  if (!s.battle) return ev;
  // Battle: the Flurry sends flakes out; each one cools the wave by its chill.
  const b = s.battle;
  if (s.flakes > 0) {
    b.acc += Math.max(3, s.flakes * FIRE) * dt;
    while (b.acc >= 1 && s.flakes > 0 && s.heat > 0) { b.acc -= 1; s.flakes--; s.heat -= chill(s); b.sent++; }
    if (s.flakes === 0) b.acc = 0;
  } else b.press += dt;
  if (s.heat <= 0) {
    s.heat = 0; s.battle = null; s.wins++; s.wave++;
    ev.win = true;
    if (s.wave < WAVES.length) s.heat = WAVES[s.wave].heat;
  } else if (b.press >= PRESS) {
    // The window shuts; the wave stays outside, as cool as the Flurry left it.
    s.battle = null; s.losses++;
    s.heat = Math.ceil(s.heat);
    ev.lose = true;
  }
  return ev;
}
export function startBattle(s) {
  if (s.battle || s.race || s.ended || s.wave >= WAVES.length) return false;
  s.battle = { acc: 0, press: 0, sent: 0, from: s.heat };
  return true;
}
// The bet comes due: the Flurry dives onto the den first, then every new flake lands there.
export function startRace(s) {
  s.race = { temp: RACE.from, snow: s.flakes };
  s.flakes = 0;
}

// ---------- The shop ----------
export const lineCost = (s, id) => LINES[id].cost(s.lv[id]);
export const lineMax = (s, id) => s.lv[id] >= LINES[id].max;
export const gateOk = (s, x) => s.wave >= x.gate && (!x.need || s.up[x.need]);
export function buyLine(s, id) {
  const L = LINES[id];
  if (!gateOk(s, L) || lineMax(s, id)) return false;
  const c = lineCost(s, id);
  if (s.flakes < c || s.race) return false;
  s.flakes -= c; s.lv[id]++;
  return true;
}
export function buy(s, id) {
  const u = ITEMS[id];
  if (!u || s.up[id] || !gateOk(s, u) || s.flakes < u.cost || s.race) return false;
  s.flakes -= u.cost; s.up[id] = 1;
  return true;
}
export const items = s => Object.entries(ITEMS).filter(([id, u]) => !s.up[id] && gateOk(s, u)).map(([id, u]) => ({ id, ...u }));
export const bought = s => Object.entries(ITEMS).filter(([id]) => s.up[id]).map(([id, u]) => ({ id, ...u }));

// Music and look follow the wave reached.
export const phase = s => s.ended ? 'ending' : s.race ? 'race' : s.wave >= 6 ? 'dome' : s.wave >= 3 ? 'front' : 'works';
