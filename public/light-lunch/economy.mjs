// Light Lunch: the rules. The game and the pacing sim (sim.mjs) both import this.
//
// Flo turns the crank; every turn throws a spark down the wire. A spark lights a dark cheese wheel: FWOOMP, the
// inside melts, the pasta goes in, and the plates go out. A lit wheel burns for a few seconds and can't be lit
// again until it is dark; a spark with no dark wheel to land on fizzles. So there are two limits: sparks (the
// crank, the interns) and wheels ready to light. The canteen floor is a small grid: pasta pots put more plates
// out of every wheel beside them, interns relight the wheels beside them. Every cover pays lunch vouchers.
// The bet memo says 10,000 covers.

export const GOAL = 100000;

// The canteen floor grows one annex at a time. Coordinates never move: annexes add columns and rows.
export const SIZES = [[2, 2], [3, 2], [3, 3], [4, 3], [5, 3], [5, 4], [6, 4]];
export const ROOMS = ['the canteen', 'the coat-rack corner', 'the water cooler', 'the copier room', 'meeting room B', 'the boardroom', 'the terrace'];

export const BASE_PLATES = 1;     // covers from one lighting, before pots and the fan
export const BASE_BURN = 3;       // seconds a wheel burns before it can be lit again
export const INTERN_T = 4;        // seconds between an intern's sparks

const MENU = [1, 2, 3, 5, 7];     // vouchers a cover: plain, pepper, pecorino, truffle, gold leaf
export const MENU_NAMES = ['plain', 'cracked pepper', 'pecorino', 'truffle', 'gold leaf'];

// kind: 'station' (bought many times, placed on the floor), 'lv' (levels in a straight line), 'one', 'odd' (silly).
// at: covers served before it shows up. Items show in this order (a straight line), each after the one before.
export const ITEMS = [
  { id: 'wheel', kind: 'station', name: 'Cheese wheel', at: 3, base: 5, k: 1.3,
    desc: 'A forty-kilo Parmesan wheel, hollowed for the pasta. A spark lights it and the plates go out; it burns a few seconds, then it is ready for another spark. A trolley takes four.',
    joke: 'RE: Wheels. Each wheel is to be treated as a colleague. Do not lean on the wheels.' },
  { id: 'menu', kind: 'lv', name: 'The menu', at: 30, costs: [270, 3500, 18600, 52000],
    levels: ['Cracked pepper', 'Pecorino in the mix', 'Shaved truffle', 'Gold leaf'],
    desc: 'Something better on every plate. Every cover pays more lunch vouchers.',
    jokes: ['Pepper, cracked by Flo personally. Most of it lands on the plates.', 'Half Parmesan, half pecorino. Accounts has asked what pecorino is. It is cheese.', 'Shaved truffle. Flo shaves it with great care and some of it goes on the floor.', 'Gold leaf. Legal has signed off on it as a garnish.'] },
  { id: 'annex', kind: 'lv', name: 'Annex', at: 60, costs: [160,  1200,  5100,  16200,  33000,  36000],
    levels: ROOMS.slice(1),
    desc: 'Push the canteen into the next room along. More floor for wheels, pots and interns.',
    jokes: ['The coats now hang over the wheels and come back smelling of Parmesan. Nobody has complained.', 'The water cooler stays where it is. People queue for both at once.', 'The copier stays where it is too. All the printouts come out a little warm.', 'Meeting room B is now lunch. The meeting about this was held over lunch.', 'The boardroom table seats twenty-two. The Board has been reassigned to the old canteen.', 'The terrace overlooks the car park, with a fine view of the Igniter skip.'] },
  { id: 'pot', kind: 'station', name: 'Pasta pot', at: 90, base: 94, k: 1.33,
    desc: 'A big pot of rigatoni at a rolling boil. Every wheel beside it serves faster.',
    joke: 'RE: Pots. Boiling water is not a seat.' },
  { id: 'sign', kind: 'odd', name: 'Out of Order sign', at: 140, cost: 90,
    desc: 'A laminated OUT OF ORDER sign for the Igniter 9000.',
    joke: 'Laminated, so it lasts. Facilities says the replacement part is "on its way". The sign will outlast it.' },
  { id: 'crank', kind: 'lv', name: 'The crank', at: 250, costs: [940, 10500, 39000],
    levels: ['A longer handle', "The Igniter's flint", "The Igniter's flywheel"],
    desc: 'Improve the magneto. Every turn of the crank throws more sparks.',
    jokes: ['A longer handle, borrowed from the mop. Flo gets two sparks a turn and a much cleaner floor.', "The flint from the Igniter's ignition, screwed onto the magneto. The Igniter didn't need it. The Igniter needs a new everything.", "The Igniter's flywheel on the crank. Once it gets going it keeps going. So, it turns out, does Flo."] },
  { id: 'grappa', kind: 'one', name: 'The good grappa', at: 1000, cost: 3500,
    desc: 'Pour the good grappa into the wheels instead of the cooking grappa. Every wheel burns longer before it goes out.',
    joke: 'From the top shelf, behind the cooking grappa, behind the other cooking grappa.' },
  { id: 'intern', kind: 'station', name: 'Intern', at: 400, base: 140, k: 1.35,
    desc: 'An intern with a little hand crank of their own. When a wheel beside them goes out, they light it again.',
    joke: 'RE: Interns. They are here to learn. Today they are learning to crank.' },
  { id: 'coaster', kind: 'odd', name: 'A coaster for Irene', at: 800, cost: 350,
    desc: 'A cork coaster, for Irene from Accounts, who pops in with her coffee and puts her mug down anywhere.',
    joke: 'Irene thanks Flo warmly for the coaster and puts her mug down next to it.' },
  { id: 'paddles', kind: 'one', name: 'Pasta paddles', at: 3000, cost: 11700,
    desc: 'Proper wooden paddles for the pots. Each pot speeds up the wheels beside it a lot more.',
    joke: 'Flo can hold a paddle in each flipper. Not at the same time. Not yet.' },
  { id: 'stamp', kind: 'odd', name: 'A seal of approval', at: 2500, cost: 1400,
    desc: 'A rubber stamp. APPROVED, with a picture of Flo.',
    joke: 'Every memo in the building is now approved. Some of them were resignations.' },
  { id: 'lanyard', kind: 'one', name: 'Lanyards', at: 12000, cost: 25600,
    desc: 'Every intern gets a lanyard. They feel like real staff, and they relight wheels twice as fast.',
    joke: 'The lanyards say VISITOR. The interns are thrilled anyway.' },
  { id: 'fan', kind: 'one', name: "The Igniter's fan", at: 24000, cost: 31200,
    desc: "Salvage the fan from the broken Igniter and point it at the floor. More air, hotter flames: every wheel serves faster.",
    joke: 'The fan works fine. It was never the fan. Nobody knows what it was. Flo sat on it, that was what it was.' },
  { id: 'ball', kind: 'odd', name: 'A beach ball', at: 9000, cost: 5800,
    desc: 'A beach ball, for morale. Seals are famously good at balancing them.',
    joke: 'Flo balances it for nearly a second. Then it lands in a pot. Then it is a cheese ball.' },
  { id: 'bellows', kind: 'one', name: "The Igniter's bellows", at: 36000, cost: 44000,
    desc: 'The bellows from the Igniter, on the spark wire. When a dark wheel lights, the wheels beside it catch too.',
    joke: 'Whoomph. Whoomph. Whoomph. Facilities has been informed. Facilities has said "fine".' },
  { id: 'tiny', kind: 'odd', name: 'A tiny wheel', at: 30000, cost: 11700,
    desc: 'A baby wheel of Parmesan, the size of a coaster, on the counter. For scale.',
    joke: 'For scale. Too small to light, too small for pasta, too small for anything really. Flo keeps it anyway.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(it => [it.id, it]));
export const STATIONS = ['wheel', 'pot', 'intern'];

export function fresh() {
  return {
    covers: 0, v: 0, earned: 0, lit: 0, turns: 0, time: 0, started: false, ended: false,
    lv: {}, owned: { wheel: 2, pot: 0, intern: 0 }, seen: [], hand: [],
    grid: { '0,0': 'wheel', '1,0': 'wheel' }, stack: { '0,0': 1, '1,0': 1 }, fl: {}, it: {}, // grid: "c,r" -> station; stack: wheels on a trolley; fl: flame seconds left; it: intern timers
    savedAt: 0, lastLog: null, boughtOpen: false,
  };
}
export function load(raw) {
  const S = Object.assign(fresh(), raw || {});
  for (const k of ['lv', 'owned', 'grid', 'stack', 'fl', 'it']) S[k] = Object.assign(k === 'owned' ? { wheel: 0, pot: 0, intern: 0 } : {}, S[k] || {});
  if (!Array.isArray(S.seen)) S.seen = [];
  if (!Array.isArray(S.hand)) S.hand = [];
  return S;
}

export const lv = (S, id) => S.lv[id] || 0;
export const size = S => SIZES[Math.min(lv(S, 'annex'), SIZES.length - 1)];
export const price = S => MENU[lv(S, 'menu')];
export const sparksPerTurn = S => 1 + lv(S, 'crank');
export const burn = S => lv(S, 'grappa') ? 2 : BASE_BURN;
export const potBonus = S => lv(S, 'paddles') ? 0.8 : 0.4;
export const fan = S => lv(S, 'fan') ? 1.3 : 1;
export const internT = S => INTERN_T / (lv(S, 'lanyard') ? 2 : 1);
export const phase = S => S.ended ? 3 : lv(S, 'annex') >= 4 ? 2 : lv(S, 'annex') >= 2 ? 1 : 0;

export const key = (c, r) => `${c},${r}`;
export const at = k => k.split(',').map(Number);
export function tiles(S) {
  const [w, h] = size(S), out = [];
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) out.push(key(c, r));
  return out;
}
export function adj(S, k) {
  const [c, r] = at(k), [w, h] = size(S);
  return [[c - 1, r], [c + 1, r], [c, r - 1], [c, r + 1]].filter(([x, y]) => x >= 0 && y >= 0 && x < w && y < h).map(([x, y]) => key(x, y));
}
export const free = S => tiles(S).filter(k => !S.grid[k]);
export const wheels = S => Object.keys(S.grid).filter(k => S.grid[k] === 'wheel');
const count = (S, k, type) => adj(S, k).reduce((n, a) => n + (S.grid[a] === type ? (S.stack[a] || 1) : 0), 0);
export const pots = (S, k) => count(S, k, 'pot');
export const interns = (S, k) => count(S, k, 'intern');
// Covers from one lighting of a wheel.
export const STACK = 4;           // a spot holds up to four: wheels on a trolley, pots on a range, interns at a desk
export const stack = (S, k) => S.grid[k] ? (S.stack[k] || 1) : 0;
export const plates = (S, k) => stack(S, k) * (BASE_PLATES + potBonus(S) * pots(S, k)) * fan(S);
export const isLit = (S, k) => (S.fl[k] || 0) > 0;

// Sparks a second: the crank at a steady turn (one a second, for the readout) and the interns.
export const crankRate = (S, turnsPerSec = 1) => turnsPerSec * sparksPerTurn(S);
export const internRate = S => Object.keys(S.grid).reduce((n, k) => n + (S.grid[k] === 'intern' ? stack(S, k) : 0), 0) / internT(S);
// Covers a second if every wheel were lit the moment it went dark.
export const rateCap = S => wheels(S).reduce((a, k) => a + plates(S, k), 0) / burn(S);

function credit(S, covers) {
  S.covers += covers;
  const v = covers * price(S);
  S.v += v; S.earned += v;
}

// A spark lights the dark wheel with the most plates, or fizzles if every wheel is still burning.
// Returns [{ k, covers }] for each wheel that lit (for the picture).
export function spark(S) {
  const dark = wheels(S).filter(k => !isLit(S, k));
  if (!dark.length) return [];
  dark.sort((a, b) => plates(S, b) - plates(S, a));
  return light(S, dark[0]);
}
function light(S, k) {
  const out = [];
  const one = w => { S.fl[w] = burn(S); S.lit++; const c = plates(S, w); credit(S, c); out.push({ k: w, covers: c }); };
  one(k);
  if (lv(S, 'bellows')) for (const a of adj(S, k)) if (S.grid[a] === 'wheel' && !isLit(S, a)) one(a);
  return out;
}
// One turn of the crank. Returns the lightings; an empty list is a fizzle.
export function turn(S) {
  S.turns++;
  const out = [];
  for (let i = 0; i < sparksPerTurn(S); i++) out.push(...spark(S));
  return out;
}

// Advance the floor by dt seconds. Returns { lit: [lightings by interns], out: [keys that went dark] }.
export function tick(S, dt) {
  const ev = { lit: [], out: [] };
  for (const k of wheels(S)) {
    const f = S.fl[k] || 0;
    if (f <= 0) continue;
    S.fl[k] = f - dt;
    if (S.fl[k] <= 0) { S.fl[k] = 0; ev.out.push(k); }
  }
  for (const k of Object.keys(S.grid)) {
    if (S.grid[k] !== 'intern') continue;
    S.it[k] = (S.it[k] || 0) + dt;
    if (S.it[k] < internT(S)) continue;
    const dark = adj(S, k).filter(a => S.grid[a] === 'wheel' && !isLit(S, a));
    if (!dark.length) { S.it[k] = internT(S); continue; }
    S.it[k] = 0;
    dark.sort((a, b) => plates(S, b) - plates(S, a));
    // Each intern at the desk lights one wheel.
    for (const w of dark.slice(0, stack(S, k))) if (!isLit(S, w)) ev.lit.push(...light(S, w));
  }
  return ev;
}

// What the floor makes with nobody at the crank, in covers a second: run a copy for two minutes.
export function rateIdle(S) {
  const T = load(JSON.parse(JSON.stringify(S)));
  const c0 = T.covers, secs = 120;
  for (let t = 0; t < secs; t += 0.25) tick(T, 0.25);
  return (T.covers - c0) / secs;
}

// ---------- The shop ----------
export function max(it) { return it.kind === 'lv' ? it.costs.length : it.kind === 'station' ? Infinity : 1; }
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'station') return Math.round(it.base * Math.pow(it.k, S.owned[id] || 0));
  if (it.kind === 'lv') return it.costs[Math.min(lv(S, id), it.costs.length - 1)];
  return it.cost;
}
export const maxed = (S, id) => BY_ID[id].kind !== 'station' && lv(S, id) >= max(BY_ID[id]);
// A station needs a free spot on the floor or room in a spot of its own kind; stations waiting in hand count.
export function roomFor(S, id) {
  let n = free(S).length;
  for (const k of Object.keys(S.grid)) if (S.grid[k] === id) n += STACK - stack(S, k);
  for (const t of S.hand) if (t === id || n > 0) n--;
  return n;
}
export function canBuy(S, id) {
  if (maxed(S, id) || !S.seen.includes(id)) return false;
  if (BY_ID[id].kind === 'station' && roomFor(S, id) <= 0) return false;
  return S.v >= cost(S, id);
}
// The straight line: each item shows once the one before it has shown and enough covers are served.
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) {
    if (S.seen.includes(it.id)) continue;
    if (S.covers < it.at) break;
    S.seen.push(it.id); fresh.push(it.id);
  }
  return fresh;
}
export const visible = S => ITEMS.filter(it => S.seen.includes(it.id) && !maxed(S, it.id));
export const bought = S => ITEMS.filter(it => (it.kind === 'one' || it.kind === 'odd') && lv(S, it.id));
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id];
  S.v -= cost(S, id);
  if (it.kind === 'station') { S.owned[id] = (S.owned[id] || 0) + 1; S.hand.push(id); }
  else S.lv[id] = lv(S, id) + 1;
  if (id === 'grappa') for (const k of wheels(S)) if (isLit(S, k)) S.fl[k] = Math.max(S.fl[k], burn(S));
  return true;
}

// ---------- The floor ----------
// How good a floor is, in covers a second: what the wheels could serve, limited by the sparks reaching them
// (the crank at a turn a second goes anywhere; an intern only reaches the wheels beside it).
export function value(S) {
  let cap = 0, reach = 0;
  for (const k of wheels(S)) {
    const p = plates(S, k), r = 1 / burn(S);
    cap += p * r;
    const ins = adj(S, k).filter(a => S.grid[a] === 'intern');
    const supply = ins.reduce((a, i) => a + stack(S, i) / internT(S) / Math.max(1, adj(S, i).filter(b => S.grid[b] === 'wheel').length), 0);
    reach += p * Math.min(r, supply);
  }
  return Math.min(cap, reach + crankRate(S) * 2.5) ;
}
// What a station would add on a spot, in covers a second with every wheel burning (the number the floor shows).
// Can this station go here: an empty spot, or a wheel onto a trolley with room.
export const fits = (S, type, k) => tiles(S).includes(k) && (!S.grid[k] || (S.grid[k] === type && stack(S, k) < STACK));
export function gain(S, type, k) {
  if (!fits(S, type, k)) return 0;
  const before = value(S), had = S.grid[k];
  if (had) S.stack[k] = stack(S, k) + 1; else { S.grid[k] = type; S.stack[k] = 1; }
  const after = value(S);
  if (had) S.stack[k]--; else { delete S.grid[k]; delete S.stack[k]; }
  return after - before;
}
export function bestTile(S, type) {
  let best = null, g = -Infinity;
  for (const k of tiles(S)) { if (!fits(S, type, k)) continue; const v = gain(S, type, k); if (v > g + 1e-9) { g = v; best = k; } }
  return best;
}
export function place(S, k, type = S.hand[0]) {
  if (!type || !fits(S, type, k)) return false;
  const i = S.hand.indexOf(type);
  if (i < 0) return false;
  S.hand.splice(i, 1);
  if (S.grid[k]) { S.stack[k] = stack(S, k) + 1; return true; }
  S.grid[k] = type; S.stack[k] = 1;
  if (type === 'wheel') S.fl[k] = 0;
  if (type === 'intern') S.it[k] = 0;
  return true;
}
// Swap two spots (either may be empty). Flames and timers move with their stations.
export function move(S, a, b) {
  if (a === b || !tiles(S).includes(a) || !tiles(S).includes(b)) return false;
  for (const m of [S.grid, S.stack, S.fl, S.it]) { const t = m[a]; if (m[b] === undefined) delete m[a]; else m[a] = m[b]; if (t === undefined) delete m[b]; else m[b] = t; }
  return true;
}

// ---------- Away ----------
// Time away is credited at a tenth of the rate, up to two hours: the interns keep their wheels lit, nobody turns the crank.
export const AWAY_CAP = 2 * 3600, AWAY_RATE = 0.1;
export function away(S, secs) {
  const t = Math.min(AWAY_CAP, Math.max(0, secs));
  if (t < 30) return null;
  const c0 = S.covers, v0 = S.v, l0 = S.lit;
  const l = S.lit, idle = rateIdle(S);
  const covers = idle * t * AWAY_RATE;
  credit(S, covers);
  S.lit = l + Math.round(covers / Math.max(1, wheels(S).reduce((a, k) => a + plates(S, k), 0) / wheels(S).length));
  return { secs: t, covers: S.covers - c0, v: S.v - v0, lit: S.lit - l0 };
}

export function short(n) {
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('en-US');
  if (n < 1e6) return (n / 1000).toFixed(n < 1e5 ? 1 : 0).replace(/\.0$/, '') + 'k';
  return (n / 1e6).toFixed(2) + 'M';
}
