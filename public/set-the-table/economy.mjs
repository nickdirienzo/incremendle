// Set the Table: the rules. index.html draws and plays them; sim.mjs runs them headless.
// Dishes are lemons held up high enough to remember what they were. Every dish earns one Thanks
// (the currency), and the Long Table is set stretch by stretch as the dishes add up.

export const GOAL = 4e9;

// The Long Table, one stretch at a time. `at` is total dishes restored.
export const STRETCHES = [
  { at: 100, name: 'the Family End' },
  { at: 1e3, name: "the Cousins' Corner" },
  { at: 1e4, name: 'the Snack Hut' },
  { at: 1e5, name: 'the Boardwalk' },
  { at: 1e6, name: 'the Pier' },
  { at: 1e7, name: 'Palm Row' },
  { at: 1e8, name: 'the Mini Golf' },
  { at: 5e8, name: 'the Neon Arcade' },
  { at: 1.6e9, name: 'the Marina' },
  { at: GOAL, name: 'the Far End' },
];
export const PHASE3_AT = 1e7;    // Palm Row set: Bumpkin retires to the lifeguard chair, Wilhelmina gathers her gale
export const TOWER_FORK_AT = 1e3;

// Bumpkin's own tower (phase 1 and 2).
export const BASE = 1;            // the first lemon of a tower is the pedestal: too low to remember anything
export const SERVE_AT = 10;       // ten high and the tower is served
export const SERVE_BONUS = 8;     // dishes for serving a tower, times the dish multiplier

export const PRODUCERS = [
  { id: 'crab', name: 'Hermit Crabs', one: 'hermit crab', cost: 15, rate: 0.5, unlock: 100,
    desc: 'A hermit crab moves into a lemon and carries it up a table leg. Up high, the lemon remembers it was a bread roll. The crab moves out.',
    joke: 'Best shell on the beach, the crabs say. Smells of a holiday.' },
  { id: 'flam', name: 'Lawn Flamingos', one: 'lawn flamingo', cost: 180, rate: 6, unlock: 300,
    desc: 'A plastic flamingo stands on one leg and balances a stack of lemons on its head. Nobody on this beach is better at balance.',
    joke: 'They came with the beach house. Nobody remembers buying them.' },
  { id: 'atlas', name: 'Marble Atlases', one: 'marble Atlas', cost: 3000, rate: 100, unlock: 2500,
    desc: 'A boardwalk statue of a man holding up the sky. He holds up a globe of lemons instead, which is lighter.',
    joke: 'He has held things up for two thousand years. He finds lemons a nice change.' },
  { id: 'dolph', name: 'Dolphins', one: 'dolphin', cost: 5e4, rate: 1500, unlock: 4e4,
    desc: 'A dolphin leaps out of the surf and balances a lemon on its nose, very high, for applause. It gets the applause.',
    joke: 'Dolphins will balance anything on their noses. These ones have been waiting all year.' },
  { id: 'ball', name: 'Parade Balloons', one: 'parade balloon', cost: 9e5, rate: 25000, unlock: 7e5,
    desc: 'A giant parade balloon tied to the table, with a net of lemons slung under it. Very high indeed.',
    joke: 'Palm Grove has a Thanksgiving parade every year. It is one balloon long, and it is a balloon of a balloon.' },
];
export const GROWTH = 1.4;
export const TUNE = { rate: 1 };  // the sim sweeps this; the game leaves it at 1

// One-time upgrades. kind: 'hand' (Bumpkin's tower), 'boost' (a helper ×), 'all' (every helper ×), 'odd' (silly: draws a thing).
export const UPGRADES = [
  { id: 'platter', kind: 'hand', name: 'Wide Platter', cost: 12, unlock: 4,
    desc: 'A big silver platter under Bumpkin\'s tower. Lemons that land a little off-centre stay on.',
    joke: 'It was the turkey platter. The turkey is currently forty lemons.' },
  { id: 'kneepads', kind: 'hand', name: 'Kneepads', cost: 30, unlock: 14,
    desc: 'Bumpkin bounces back and forth more slowly, so it is easier to drop a lemon in the middle.',
    joke: 'A volleyball has no knees. It wears them anyway. It feels more professional.' },
  { id: 'gravy', kind: 'hand', name: 'Gravy Boat', cost: 60, unlock: 30,
    desc: 'Every lemon Bumpkin stacks high enough comes back as a dish with gravy on it, which counts as two.',
    joke: 'The gravy boat was too far from Bumpkin to turn sour. It is the only gravy left in Palm Grove.' },
  { id: 'shells', kind: 'boost', of: 'crab', mult: 3, name: 'Sea-View Shells', cost: 500, unlock: 300, need: { crab: 5 },
    desc: 'Every hermit crab gets a lemon with a porthole cut in it. They climb three times as fast to see the view.',
    joke: 'A crab with a view is a happy crab. A happy crab climbs table legs.' },
  { id: 'legday', kind: 'boost', of: 'flam', mult: 3, name: 'Leg Day', cost: 6000, unlock: 4000, need: { flam: 5 },
    desc: 'The flamingos swap legs on the hour, so neither gets tired. Three times the stacking, and sweatbands.',
    joke: 'For decades, every lawn flamingo has stood on the same leg. Nobody had told them about the other one.' },
  { id: 'shoulder', kind: 'boost', of: 'atlas', mult: 3, name: 'Second Shoulder', cost: 9e4, unlock: 6e4, need: { atlas: 5 },
    desc: 'Each Atlas gets a second globe of lemons for the other shoulder. Three times the lemons held high.',
    joke: 'He has two shoulders. In two thousand years, nobody asked him to use the other one.' },
  { id: 'sync', kind: 'boost', of: 'dolph', mult: 3, name: 'Synchronised Swimming', cost: 1.5e6, unlock: 1e6, need: { dolph: 5 },
    desc: 'The dolphins leap in a line, all at once, each with a lemon on its nose. Three times as many lemons in the air.',
    joke: 'The judges give it a ten. There are no judges. The dolphins brought their own scorecards.' },
  { id: 'helium', kind: 'boost', of: 'ball', mult: 3, name: 'Extra Helium', cost: 3e7, unlock: 2e7, need: { ball: 5 },
    desc: 'The balloons get topped up and float twice as high with three times the lemons in their nets.',
    joke: 'Bumpkin tried one breath of it. For a minute the narrator was squeaky as well.' },
  { id: 'whistle', kind: 'all', mult: 2, name: 'Lifeguard Whistle', cost: 4e5, unlock: 2e5,
    desc: 'Bumpkin blows a whistle every time a lemon reaches the top. Everybody works twice as fast.',
    joke: 'Nobody knows how a volleyball blows a whistle. It is a fairy tale. Let it go.' },
  { id: 'megaphone', kind: 'all', mult: 2, name: 'Megaphone', cost: 6e7, unlock: 3e7,
    desc: 'Bumpkin can call the whole coast from the lifeguard chair. Every helper works twice as fast.',
    joke: 'Mostly it says "lovely, lovely" and "up a bit".' },
  { id: 'hat', kind: 'odd', name: 'Pilgrim Hat', cost: 2500, unlock: 2000, need: { atlas: 1 },
    desc: 'A tall black hat with a buckle, for the first Atlas. It does nothing at all.',
    joke: 'He has held up the sky for two thousand years, and today he gets to wear a hat. He looks very pleased.' },
  { id: 'fog', kind: 'odd', name: 'Fog Machine', cost: 4e4, unlock: 3e4,
    desc: 'A fog machine on the sand. Pink fog drifts along the table. It does nothing for the lemons.',
    joke: '"Atmosphere," says Bumpkin. Wilhelmina blows it all into the sea. Bumpkin makes more.' },
  { id: 'laser', kind: 'odd', name: 'Laser Pointer', cost: 2e6, unlock: 1.5e6,
    desc: 'A laser pointer, taped to the table, pointing at the sky. It does nothing.',
    joke: 'It is pointing at the spot where the sun would go, if the sun ever went anywhere.' },
  { id: 'ladder', kind: 'odd', name: 'A Very Tall Ladder', cost: 2e8, unlock: 1.2e8,
    desc: 'A ladder, leaning on the table. It is not very tall. It is for later.',
    joke: 'The shop called it Very Tall. It reaches the tablecloth.' },
];

// The two forks in the tale: pick one, and the other is gone.
export const FORKS = {
  tower: {
    title: 'How shall the towers be built?',
    options: [
      { id: 'tall', name: 'Tall', mult: 2, desc: 'Every helper twice as productive. But each of Wilhelmina\'s gusts knocks one helper\'s tower down, and it does nothing until it is stacked up again (tap it, or wait).' },
      { id: 'squat', name: 'Squat', mult: 1.7, desc: 'Every helper a third more productive, and squat towers never fall down. Ever.' },
    ],
  },
  wind: {
    title: 'How shall we meet the West Wind?',
    options: [
      { id: 'palms', name: 'Windbreak Palms', desc: 'A row of palms between the sea and the table. Wilhelmina\'s gale gathers 40% more slowly.' },
      { id: 'kite', name: 'Kite Sails', desc: 'Kites on every tower. The stronger her gale, the faster the helpers stack: up to three times as fast when it is about to blow.' },
    ],
  },
};

// Wilhelmina's gale (phase 3): it fills over GALE_SECS; when it blows, helpers are slowed for SLOW_SECS,
// every tall tower falls, and she starts gathering again from GALE_RESET.
export const GALE_SECS = 420;
export const SLOW_SECS = 40, SLOW_MULT = 0.35, GALE_RESET = 0.3;
export const RESTACK_SECS = 30;   // a fallen tower stacks itself up again after this long

export const BY_ID = Object.fromEntries([...PRODUCERS, ...UPGRADES].map(x => [x.id, x]));

export function defaults() {
  return {
    v: 1, total: 0, thanks: 0, time: 0, started: false, ended: false,
    own: Object.fromEntries(PRODUCERS.map(p => [p.id, 0])), up: {}, fork: { tower: null, wind: null },
    phase: 1, gale: 0, gales: 0, slow: 0, toppled: {}, tower: [], served: 0, landed: 0, perfect: 0, handDishes: 0,
    seen: [], newSeen: [], boughtOpen: false, lastLog: null, phase3At: null, finishedAt: null,
  };
}
export function load(raw) {
  const d = defaults();
  const S = Object.assign(d, raw || {});
  S.own = Object.assign(defaults().own, S.own || {});
  S.fork = Object.assign({ tower: null, wind: null }, S.fork || {});
  S.up = Object.assign({}, S.up || {}); S.toppled = Object.assign({}, S.toppled || {});
  if (S.ended) S.total = Math.max(S.total, GOAL);
  S.phase = phaseOf(S);
  return S;
}

export const phaseOf = S => S.ended ? 4 : S.total >= PHASE3_AT ? 3 : S.total >= STRETCHES[0].at ? 2 : 1;
export const stretchesSet = S => STRETCHES.filter(s => S.total >= s.at).length;

// ---- Bumpkin's tower ----
export const dishMult = S => (S.up.gravy ? 2 : 1);
export const tolerance = S => (S.up.platter ? 0.75 : 0.55);   // lemon widths a drop can miss the top by and still stay
export const leanLimit = S => (S.up.platter ? 1.6 : 1.15);    // lemon widths the top may lean off the platter's centre
export const bounceSpeed = S => (S.up.kneepads ? 1.7 : 2.4); // radians per second of Bumpkin's side-to-side bounce
export const handActive = S => phaseOf(S) < 3;

// ---- Helpers ----
export const cost = (S, id) => {
  const p = PRODUCERS.find(x => x.id === id);
  return p ? Math.ceil(p.cost * Math.pow(GROWTH, S.own[id])) : BY_ID[id].cost;
};
export function towerMult(S) {
  const f = FORKS.tower.options.find(o => o.id === S.fork.tower);
  return f ? f.mult : 1;
}
export function allMult(S) {
  let m = towerMult(S);
  for (const u of UPGRADES) if (u.kind === 'all' && S.up[u.id]) m *= u.mult;
  return m;
}
export function kiteMult(S) { return S.fork.wind === 'kite' ? 1 + 1.5 * S.gale : S.fork.wind === 'palms' ? 1.5 : 1; }
export function windMult(S) { return kiteMult(S) * (S.slow > 0 ? SLOW_MULT : 1); }
// One helper's dishes per second, before falls and the wind.
export function each(S, id) {
  const p = PRODUCERS.find(x => x.id === id);
  let r = p.rate * TUNE.rate * allMult(S);
  for (const u of UPGRADES) if (u.kind === 'boost' && u.of === id && S.up[u.id]) r *= u.mult;
  return r;
}
export function rateOf(S, id) { return S.toppled[id] ? 0 : S.own[id] * each(S, id) * windMult(S); }
export function beachRate(S) { return PRODUCERS.reduce((a, p) => a + rateOf(S, p.id), 0); }

// ---- Wilhelmina ----
export const galeSecs = S => GALE_SECS * (S.fork.wind === 'palms' ? 1.6 : 1);

// ---- Shop ----
export function unlocked(S, it) {
  if (S.total < (it.unlock || 0)) return false;
  if (it.need) for (const [k, v] of Object.entries(it.need)) if (S.own[k] < v) return false;
  if (it.kind === 'hand' && !handActive(S) && !S.up[it.id]) return S.seen.includes(it.id);
  return true;
}
// Everything that has shown up stays until bought.
export function reveal(S) {
  const fresh = [];
  for (const it of [...PRODUCERS, ...UPGRADES]) {
    if (!S.seen.includes(it.id) && unlocked(S, it)) { S.seen.push(it.id); fresh.push(it.id); }
  }
  return fresh;
}
export const visible = S => [...PRODUCERS, ...UPGRADES].filter(it => S.seen.includes(it.id) && !S.up[it.id]);
export const bought = S => UPGRADES.filter(u => S.up[u.id]);
export const canBuy = (S, id) => S.seen.includes(id) && !S.up[id] && S.thanks >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  S.thanks -= cost(S, id);
  if (S.own[id] !== undefined) S.own[id]++; else S.up[id] = true;
  return true;
}
export const forkOpen = (S, k) => !S.fork[k] && (k === 'tower' ? S.total >= TOWER_FORK_AT : phaseOf(S) === 3);
export function choose(S, k, id) { if (forkOpen(S, k)) S.fork[k] = id; }

// Earn dishes (and the Thanks that come with them).
export function earn(S, n) { S.total += n; S.thanks += n; }

// Advance the beach by dt seconds. Returns events: { blew, restacked: [ids] }.
export function step(S, dt) {
  const ev = { blew: false, restacked: [] };
  if (S.ended) return ev;
  S.time += dt;
  if (S.slow > 0) S.slow = Math.max(0, S.slow - dt);
  for (const id of Object.keys(S.toppled)) {
    S.toppled[id] -= dt;
    if (S.toppled[id] <= 0) { delete S.toppled[id]; ev.restacked.push(id); }
  }
  earn(S, beachRate(S) * dt);
  if (phaseOf(S) === 3) {
    if (S.phase3At == null) S.phase3At = S.time;
    S.gale += dt / galeSecs(S);
    if (S.gale >= 1) { blow(S); ev.blew = true; }
  }
  S.phase = phaseOf(S);
  return ev;
}
export function blow(S) {
  S.gale = GALE_RESET; S.gales++; S.slow = SLOW_SECS;
  if (S.fork.tower === 'tall') for (const p of PRODUCERS) if (S.own[p.id]) S.toppled[p.id] = RESTACK_SECS;
}
// A gust: with tall towers, knocks one helper's tower over. Returns the id or null.
export function gust(S, rnd = Math.random) {
  if (S.fork.tower !== 'tall') return null;
  const ids = PRODUCERS.filter(p => S.own[p.id] && !S.toppled[p.id]).map(p => p.id);
  if (!ids.length) return null;
  const id = ids[Math.floor(rnd() * ids.length)];
  S.toppled[id] = RESTACK_SECS;
  return id;
}
export const gustGap = S => phaseOf(S) === 3 ? 14 + 10 * (1 - S.gale) : 26;
export function restack(S, id) { if (S.toppled[id]) { delete S.toppled[id]; return true; } return false; }
export const done = S => S.total >= GOAL;

// Big numbers, said the way a fairy tale would.
const NAMES = [[1e9, ' billion'], [1e6, ' million']];
export function short(n) {
  n = Math.floor(n);
  for (const [v, w] of NAMES) if (n >= v) { const x = n / v; return (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2)) + w; }
  return n.toLocaleString('en-US');
}
