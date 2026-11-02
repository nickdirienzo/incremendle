// Load-Bearing Noodles: the rules. index.html draws and plays them; sim.mjs runs them headless.
//
// Marrow Court is a grid of rooms, five across and six high (roof to basement). Its walls are
// packed with forty years of tangled noodles. Mona (flat 3B) tugs strands loose; her roots feed on
// the loose strands (noodles are spent to grow) and spread room to room. Each rooted room
// untangles noodles on its own, and every rooted room boosts its four neighbours. Pettibone has
// salted the roof, his office and the basement; gossip (dirt), overheard through the roots, gets
// the salt swept out. Under the lobby sits the Mother Knot.

export const COLS = 5, ROWS = 6;
export const HOME = 11; // flat 3B: row 2, column 1

// type: what roots do there. prod = noodles per level; boost = what a rooted room adds to each neighbour's
// output (+40% is 0.4), doubling as the room fills.
export const TYPES = {
  home:  { prod: 1,    boost: 0.2,  label: 'Mona’s pot' },
  flat:  { prod: 1,    boost: 0.1,  label: 'a flat' },
  wet:   { prod: 0.3,  boost: 0.25,  label: 'damp' },
  warm:  { prod: 0.3,  boost: 0.25,  label: 'warm' },
  light: { prod: 0.3,  boost: 0.25,  label: 'bright' },
  stair: { prod: 0.6,  boost: 0.15,  label: 'stairs' },
  knot:  { prod: 0,    boost: 0,    label: 'the knot' },
};

// who: the tenant (flats gossip). salt: Pettibone has salted it. note: one line for the tooltip.
export const ROOMS = [
  // Roof
  { id: 'tank',   name: 'Water Tank',      type: 'wet',   salt: 1, note: 'A slow drip, forty years of it.' },
  { id: 'loft',   name: 'Pigeon Loft',     type: 'flat',  salt: 1, who: 'Mr. Duda', note: 'Mr. Duda and eleven pigeons, all named Duda.' },
  { id: 'sky',    name: 'Skylight',        type: 'light', salt: 1, note: 'The only clean glass in the building.' },
  { id: 'chim',   name: 'Chimney Stack',   type: 'warm',  salt: 1, note: 'Still warm from the ramen stock below.' },
  { id: 'garden', name: 'Roof Garden',     type: 'light', salt: 1, note: 'Pettibone calls it “the roof”. It was a garden once.' },
  // Fourth floor
  { id: '4a',     name: 'Flat 4A',         type: 'flat',  who: 'Mrs. Vale', note: 'Mrs. Vale, three cats, one opinion about everyone.' },
  { id: 'bath4',  name: 'Shared Bath',     type: 'wet',   note: 'The tap has been dripping since before the moon landing.' },
  { id: 'st4',    name: 'Top Landing',     type: 'stair', note: 'The stairs creak in a chord.' },
  { id: '4c',     name: 'Flat 4C',         type: 'flat',  who: 'the Fennick twins', note: 'The Fennick twins, a two-person accordion band.' },
  { id: 'well',   name: 'Light Well',      type: 'light', note: 'A shaft of sun, ten minutes a day.' },
  // Third floor
  { id: '3a',     name: 'Flat 3A',         type: 'flat',  who: 'Dot', note: 'Dot, a night nurse who sleeps through everything but whispers.' },
  { id: '3b',     name: 'Flat 3B',         type: 'home',  note: 'Mona’s flat. Mona’s pot. Mona.' },
  { id: 'st3',    name: 'Third Landing',   type: 'stair', note: 'Somebody’s umbrella has lived here since spring.' },
  { id: '3c',     name: 'Flat 3C',         type: 'flat',  who: 'Pim', note: 'Pim, a student building something for the school culture festival.' },
  { id: 'airing', name: 'Airing Cupboard', type: 'warm',  note: 'Hot pipes and other people’s towels.' },
  // Second floor
  { id: '2a',     name: 'Flat 2A',         type: 'flat',  who: 'the Okafors', note: 'The Okafors, newlyweds, very loud about whose turn it is.' },
  { id: 'laundry', name: 'Laundry',        type: 'wet',   note: 'One machine. A rota nobody follows.' },
  { id: 'st2',    name: 'Second Landing',  type: 'stair', note: 'The floor here dips. Everybody steps around it.' },
  { id: '2c',     name: 'Flat 2C',         type: 'flat',  who: 'Señor Ruiz', note: 'Señor Ruiz teaches tango. The ceiling below knows it.' },
  { id: 'rad',    name: 'Radiator Closet', type: 'warm',  note: 'The radiator bangs at 6 am exactly.' },
  // Ground floor
  { id: 'shop',   name: 'Ko’s Counter',    type: 'flat',  who: 'Auntie Ko', prod: 3, note: 'Auntie Ko’s ramen counter. The source of everything.' },
  { id: 'kitchen', name: 'Ko’s Kitchen',   type: 'warm',  note: 'The stock pot has not been off since 1984.' },
  { id: 'lobby',  name: 'Lobby',           type: 'stair', note: 'Pettibone’s notices, eleven deep. The floor is solid concrete.' },
  { id: 'office', name: 'Pettibone’s Office', type: 'flat', salt: 1, who: 'Mr. Pettibone', note: 'Mr. Pettibone, the landlord. A desk, a ledger, a lot of salt.' },
  { id: 'yard',   name: 'Back Door',       type: 'light', note: 'Propped open with a brick for the bins.' },
  // Basement
  { id: 'cellar', name: 'Damp Cellar',     type: 'wet',   salt: 1, note: 'It is very damp. Pettibone says the salt is for the damp.' },
  { id: 'boiler', name: 'Boiler',          type: 'warm',  salt: 1, note: 'It rumbles like it knows something.' },
  { id: 'knot',   name: 'The Mother Knot', type: 'knot',  salt: 1, note: 'The tangle under everything. Everything sits on it.' },
  { id: 'coal',   name: 'Coal Hole',       type: 'warm',  salt: 1, note: 'No coal since 1971. Still warm, somehow.' },
  { id: 'drains', name: 'Drain Pipes',     type: 'wet',   salt: 1, note: 'Every sink in the building ends up here.' },
];
export const N_ROOMS = ROOMS.length;
export const KNOT = ROOMS.findIndex(r => r.id === 'knot');
export const LOBBY = ROOMS.findIndex(r => r.id === 'lobby');
export const rowOf = i => Math.floor(i / COLS), colOf = i => i % COLS;
export const ring = i => Math.abs(rowOf(i) - rowOf(HOME)) + Math.abs(colOf(i) - colOf(HOME));
// Four neighbours. The lobby floor is concrete (Pettibone poured it): no roots between the lobby and the knot.
export function neighbours(i) {
  const r = rowOf(i), c = colOf(i), out = [];
  if (r > 0) out.push(i - COLS);
  if (r < ROWS - 1) out.push(i + COLS);
  if (c > 0) out.push(i - 1);
  if (c < COLS - 1) out.push(i + 1);
  return out.filter(j => !((i === LOBBY && j === KNOT) || (i === KNOT && j === LOBBY)));
}
export const isTenant = i => !!ROOMS[i].who;

// ---------- Tunables ----------
// By ring (steps from Mona's flat): what the first root costs, and what one level untangles a second.
export const RING_COST = [15, 30, 1.5e4, 1.4e6, 1.6e9, 1.2e12, 6e14];
export const RING_PROD = [1, 2, 60, 6e3, 2e6, 2e9, 2.5e12];
export const MAX_LV = 18;                                    // a room full of roots
export const COST_GROW = 1.35;                               // level L -> L+1 costs reach * COST_GROW^L
export const KNOT_COST = 1.5e18;                               // noodles to root the Mother Knot
// Salt: dirt to get it swept out of each salted room, in the order they're cleared.
export const SALT_COSTS = [40, 70, 110, 170, 250, 360, 520, 750, 1050, 1450];
export const KNOT_SALT = 4000;
export const TENANTS_FOR_VINE = 6;                           // the grapevine opens with this many tenant flats rooted
export const OFFLINE_CAP = 3 * 3600, OFFLINE_RATE = 0.25;
export const FINAL_HOLD = 4;                                 // seconds to hold the last tug

// ---------- Upgrades ----------
// cur: 'n' noodles or 'd' dirt. at(S): when it shows up. kind 'odd' for the silly ones.
export const UPGRADES = [
  { id: 'hairs', cur: 'n', cost: 60, name: 'Root Hairs', at: S => S.tugs >= 4,
    desc: 'Fine little hairs on the root that does the tugging. Each tug pulls three times the loose strands.' },
  { id: 'grip', cur: 'n', cost: 900, name: 'Firm Grip', at: S => S.rooted >= 2,
    desc: 'Mona stops apologising to the noodles before she pulls. A full tug charges faster.' },
  { id: 'worry', cur: 'n', cost: 2500, name: 'Worry Journal', kind: 'odd', at: S => S.rooted >= 3,
    desc: 'A notebook for the worries. Does nothing for the noodles. Entry one: “Is the floor tilting, or is it me?”' },
  { id: 'damp', cur: 'n', cost: 3.5e4, name: 'Damp-Loving', at: S => hasType(S, 'wet'),
    desc: 'Roots drink up drips. Damp rooms boost their neighbours twice as much.' },
  { id: 'slurp', cur: 'n', cost: 2.2e5, name: 'Slurp', at: S => S.rooted >= 4,
    desc: 'Roots stop nibbling the loose strands and start slurping them. Every room untangles twice as fast.' },
  { id: 'warm', cur: 'n', cost: 1.5e6, name: 'Warm Feet', at: S => hasType(S, 'warm'),
    desc: 'Roots curl round hot pipes like cats. Warm rooms boost their neighbours twice as much.' },
  { id: 'yank', cur: 'n', cost: 8e6, name: 'Big Yank', at: S => S.rooted >= 6,
    desc: 'Mona puts her whole stem into it. A full tug also pulls four more seconds of everything the rooms untangle.' },
  { id: 'flyer', cur: 'n', cost: 3e7, name: 'Festival Flyer', kind: 'odd', at: S => S.lv[13] > 0,
    desc: 'Pim’s flyer for the school culture festival, slid under every door: “EVERYONE COME. Noodle sculpture. The 3rd.” Mona keeps hers by the pot.' },
  { id: 'light', cur: 'n', cost: 2e8, name: 'Sunbather', at: S => hasType(S, 'light'),
    desc: 'Leaves turn to every crack of sun. Bright rooms boost their neighbours twice as much.' },
  { id: 'aldente', cur: 'n', cost: 2e10, name: 'Al Dente', at: S => S.vine,
    desc: 'Mona learns the exact firmness at which a noodle gives up. Every room untangles three times as fast.' },
  { id: 'hat', cur: 'n', cost: 2e12, name: 'Bottle-Cap Hard Hat', kind: 'odd', at: S => S.vine && S.rooted >= 14,
    desc: 'A bottle cap, worn at an angle. Protects nothing. Just in case.' },
  { id: 'helping', cur: 'n', cost: 1e13, name: 'Second Helping', at: S => S.vine && basementRooted(S) >= 1,
    desc: 'The basement noodles are the oldest and the softest. Every room untangles four times as fast.' },
  // Dirt
  { id: 'lean', cur: 'd', cost: 15, name: 'Lean In', at: S => S.vine,
    desc: 'Mona tilts one leaf toward the wall, casually. Gossip gets juicy faster while you listen.' },
  { id: 'natural', cur: 'd', cost: 45, name: 'Act Natural', at: S => S.vine && S.listens >= 3,
    desc: 'A relaxed posture for a plant who is definitely not listening. Tenants take longer to glance over, so you see it coming sooner.' },
  { id: 'exhale', cur: 'd', cost: 90, name: 'Slow Exhale', at: S => S.vine && S.caught >= 1,
    desc: 'A breathing exercise from the Worry Journal. After being caught, Mona perks back up much sooner.' },
  { id: 'partywall', cur: 'd', cost: 160, name: 'Party Wall', at: S => S.vine && S.listens >= 8,
    desc: 'Roots run right through the thinnest walls. Every rooted flat overhears gossip on its own three times as fast.' },
  { id: 'diary', cur: 'd', cost: 260, name: 'Pettibone’s Diary', kind: 'odd', at: S => S.vine && S.saltCleared >= 3,
    desc: 'A torn page, overheard being read aloud in 2C: “NEVER untie the knot in the basement. It is holding EVERYTHING up.” Underlined three times.' },
  { id: 'grapevine', cur: 'd', cost: 420, name: 'The Grapevine', at: S => S.vine && S.saltCleared >= 4,
    desc: 'Every rumour Mona hears, she passes along the roots, and it comes back juicier. Twice the dirt from every listen.' },
  { id: 'fertilizer', cur: 'd', cost: 700, name: 'Gossip Fertilizer', at: S => S.vine && S.saltCleared >= 5,
    desc: 'It turns out the juicy stuff is good for roots. Every room untangles faster for all the dirt you have ever heard.' },
];
export const UP = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

// ---------- State ----------
export function newState() {
  const lv = new Array(N_ROOMS).fill(0); lv[HOME] = 1;
  return {
    t: 0, noodles: 0, dirt: 0, total: 0, dirtTotal: 0,
    lv, salted: ROOMS.map(r => (r.salt ? 1 : 0)), saltCleared: 0,
    up: {}, seen: [], rooted: 1, tugs: 0, listens: 0, caught: 0, juicy: 0,
    vine: false, speaker: -1, wilt: 0, ended: false, lastSeen: 0, shopTab: 'n', news: 0,
  };
}
export function load(o) {
  const S = newState();
  if (!o || typeof o !== 'object') return S;
  Object.assign(S, o);
  if (!Array.isArray(S.lv) || S.lv.length !== N_ROOMS) S.lv = newState().lv;
  if (!Array.isArray(S.salted) || S.salted.length !== N_ROOMS) S.salted = newState().salted;
  S.up ||= {}; S.seen ||= [];
  S.rooted = S.lv.filter(l => l > 0).length;
  if (S.ended) finishAll(S);
  return S;
}
// A finished save draws the finished world: every room rooted, no salt.
export function finishAll(S) {
  S.lv = S.lv.map((l, i) => (i === KNOT ? 1 : MAX_LV)); S.salted = S.salted.map(() => 0); S.rooted = N_ROOMS; S.vine = true;
}
const hasType = (S, type) => ROOMS.some((r, i) => r.type === type && S.lv[i] > 0 && i !== HOME);
export const basementRooted = S => ROOMS.reduce((a, r, i) => a + (rowOf(i) === ROWS - 1 && S.lv[i] > 0 ? 1 : 0), 0);
export const tenantsRooted = S => ROOMS.reduce((a, r, i) => a + (r.who && S.lv[i] > 0 ? 1 : 0), 0);

// ---------- Rooms ----------
export const reachable = (S, i) => S.lv[i] === 0 && neighbours(i).some(j => S.lv[j] > 0);
export function roomCost(S, i) {
  if (i === KNOT) return KNOT_COST;
  return RING_COST[ring(i)] * COST_GROW ** Math.max(0, S.lv[i] - (i === HOME ? 1 : 0));
}
export const saltCost = S => S.saltCleared >= SALT_COSTS.length ? KNOT_SALT : SALT_COSTS[S.saltCleared];
export function saltCostFor(S, i) { return i === KNOT ? KNOT_SALT : SALT_COSTS[Math.min(S.saltCleared, SALT_COSTS.length - 1)]; }
// What a room's button does right now: 'hidden' (not next to roots), 'salt' (needs dirt), 'reach', 'grow', 'knot' (rooted knot).
export function roomState(S, i) {
  if (S.lv[i] > 0) return i === KNOT ? 'knot' : S.lv[i] >= MAX_LV ? 'full' : 'grow';
  if (!neighbours(i).some(j => S.lv[j] > 0)) return 'hidden';
  if (S.salted[i]) return 'salt';
  return 'reach';
}
export function canClearSalt(S, i) {
  if (roomState(S, i) !== 'salt' || !S.vine) return false;
  if (i === KNOT && S.saltCleared < SALT_COSTS.length) return false; // the knot's salt comes last
  return S.dirt >= saltCostFor(S, i);
}
export function clearSalt(S, i) {
  if (!canClearSalt(S, i)) return false;
  S.dirt -= saltCostFor(S, i); S.salted[i] = 0; S.saltCleared++;
  return true;
}
export function grow(S, i) {
  const st = roomState(S, i);
  if (st !== 'reach' && st !== 'grow') return false;
  const c = roomCost(S, i);
  if (S.noodles < c) return false;
  S.noodles -= c; S.lv[i]++;
  if (S.lv[i] === 1) S.rooted++;
  if (!S.vine && tenantsRooted(S) >= TENANTS_FOR_VINE) S.vine = true;
  return true;
}

// Global multiplier on every room's output.
export function globalMult(S) {
  let m = 1;
  if (S.up.slurp) m *= 2;
  if (S.up.aldente) m *= 3;
  if (S.up.helping) m *= 4;
  if (S.up.fertilizer) m *= fertMult(S);
  return m;
}
export const fertMult = S => 1 + Math.sqrt(S.dirtTotal) / 40;
export function boostOf(S, j) {
  const T = TYPES[ROOMS[j].type];
  let b = T.boost;
  if ((ROOMS[j].type === 'wet' && S.up.damp) || (ROOMS[j].type === 'warm' && S.up.warm) || (ROOMS[j].type === 'light' && S.up.light)) b *= 2;
  return b * (1 + S.lv[j] / MAX_LV);
}
// A room's multiplier from its rooted neighbours.
export function neighbourMult(S, i) {
  let m = 1;
  for (const j of neighbours(i)) if (S.lv[j] > 0) m *= 1 + boostOf(S, j);
  return m;
}
export function baseProd(i) {
  const r = ROOMS[i];
  return (r.prod || TYPES[r.type].prod) * RING_PROD[ring(i)];
}
export function roomRate(S, i, lv = S.lv[i]) {
  if (lv <= 0 || i === KNOT) return 0;
  return baseProd(i) * lv * neighbourMult(S, i) * globalMult(S);
}
export function rate(S) {
  let r = 0;
  for (let i = 0; i < N_ROOMS; i++) r += roomRate(S, i);
  return r;
}
// How much the whole building's rate changes if room i goes up a level (it boosts its neighbours too).
export function rateAfterGrow(S, i) {
  const lv = S.lv.slice(); lv[i]++;
  return rate({ ...S, lv });
}

// ---------- The tug ----------
export const chargeTime = S => (S.up.grip ? 0.75 : 1.2);
export const tugFlat = S => (S.up.hairs ? 3 : 1) * 4 * (1 + 0.5 * (S.lv[HOME] - 1));
export const tugSecs = S => (S.up.yank ? 6 : 2);
export const tugYield = (S, c) => (tugFlat(S) + tugSecs(S) * rate(S)) * Math.max(0, Math.min(1, c));
export function tug(S, c) {
  const got = tugYield(S, c);
  S.noodles += got; S.total += got; S.tugs++;
  return got;
}

// ---------- Eavesdropping (the grapevine) ----------
export const juiceRate = S => (S.up.lean ? 1.6 : 1);           // juiciness per second of listening
export const warnTime = S => (S.up.natural ? 1.25 : 0.7);       // seconds between the glance and being caught
export const wiltTime = S => (S.up.exhale ? 2 : 6);
// When the speaker notices: a random moment 1.8-5 s into listening (rolled by the caller, from rnd).
export const noticeAt = rnd => 1.8 + rnd * 3.2;
export function dirtPerListen(S, i) {
  return S.up.grapevine ? 2 : 1;
}
export const listenDirt = (S, i, secs) => dirtPerListen(S, i) * 2 * (1 + secs * juiceRate(S));
export function listen(S, i, secs) {
  const got = listenDirt(S, i, secs);
  S.dirt += got; S.dirtTotal += got; S.listens++;
  return got;
}
export function caught(S) { S.caught++; S.wilt = wiltTime(S); }
// Rooted flats overhear a little on their own once the grapevine's open.
export function dirtRate(S) {
  if (!S.vine) return 0;
  let r = 0;
  for (let i = 0; i < N_ROOMS; i++) if (ROOMS[i].who && S.lv[i] > 0) r += 0.01;
  return r * (S.up.partywall ? 3 : 1);
}
export const speakers = S => ROOMS.map((r, i) => i).filter(i => ROOMS[i].who && S.lv[i] > 0 && i !== KNOT);

// ---------- Upgrades ----------
export const have = (S, cur) => (cur === 'd' ? S.dirt : S.noodles);
export function items(S) {
  return UPGRADES.filter(u => !S.up[u.id] && (S.seen.includes(u.id) || u.at(S)));
}
export function buy(S, id) {
  const u = UP[id];
  if (!u || S.up[id] || have(S, u.cur) < u.cost) return false;
  if (u.cur === 'd') S.dirt -= u.cost; else S.noodles -= u.cost;
  S.up[id] = 1;
  return true;
}
export const bought = S => UPGRADES.filter(u => S.up[u.id]);

// ---------- Time ----------
export function step(S, dt) {
  if (S.ended) return;
  S.t += dt;
  const r = rate(S) * dt;
  S.noodles += r; S.total += r;
  const d = dirtRate(S) * dt;
  S.dirt += d; S.dirtTotal += d;
  if (S.wilt > 0) S.wilt = Math.max(0, S.wilt - dt);
}
export function offline(S, secs) {
  if (S.ended || secs < 30) return null;
  const s = Math.min(OFFLINE_CAP, secs) * OFFLINE_RATE;
  const n = rate(S) * s, d = dirtRate(S) * s;
  S.noodles += n; S.total += n; S.dirt += d; S.dirtTotal += d;
  return { noodles: n, dirt: d, capped: secs > OFFLINE_CAP };
}
export const comfort = S => (S.rooted - 1) / (N_ROOMS - 1);
export const phase = S => (S.ended ? 'epilogue' : basementRooted(S) > 0 ? 'deep' : S.vine ? 'grapevine' : 'walls');
export const canFinish = S => S.lv[KNOT] > 0 && !S.ended;

// ---------- Numbers ----------
const BIG = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion'];
const SHORT = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
export function fmt(x, long = false) {
  if (!isFinite(x)) return '∞';
  if (x < 1000) return x < 10 && x % 1 ? x.toFixed(1) : Math.floor(x).toLocaleString('en-US');
  const k = Math.min(BIG.length - 1, Math.floor(Math.log10(x) / 3));
  const v = x / 10 ** (3 * k);
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return long ? `${s} ${BIG[k]}` : `${s}${SHORT[k]}`;
}
