// Dyed in the Wool: the rules. Imported by index.html and by sim.mjs (the pacing sim).
// A summer: hold to steep yarn in the pot, sell it on the pavement at whatever the street will pay
// for that colour, buy a bigger pot. The clock runs out at the Vine Street Fair: yards become ribbons,
// the pavement is cleared, and ribbons buy what you keep (dye plants, know-how, kettles).

export const TARGET = 1e17;
export let BAY_STEP = 25;
export let POT_YD = 7, POT_GROW = 200, POT_C0 = 20, PRICE_STEP = 2.2, PRIZE = 1.5;
export function tune(o) { ({ POT_YD = POT_YD, POT_GROW = POT_GROW, POT_C0 = POT_C0, PRICE_STEP = PRICE_STEP, PRIZE = PRIZE, RIB_EXP = RIB_EXP } = o); if (o.ball) BALL = o.ball; if (o.kettle) Object.assign(KETTLE, o.kettle); if (o.plants) o.plants.forEach((c, i) => { PLANT_COST[i] = c; UP['plant' + i] && (UP['plant' + i].cost = c); }); if (o.prizeGrow) UP.prize.grow = o.prizeGrow; for (let k = 1; k < POTS.length; k++) POTS[k] = { ...POTS[k], yd: 4 * Math.pow(POT_YD, k), cost: POT_C0 * Math.pow(POT_GROW, k - 1) }; POTS[0].yd = 4; POTS[POTS.length - 1].cost = POTS[POTS.length - 2].cost * (o.BAY_STEP || BAY_STEP); }           // yards out in the world: enough to knit the Earth a jumper
export const BASE_SUMMER = 6 * 60;    // seconds

// ---------- Dyestuffs (rows of the dye chart). Marigold and onion skins are there from the start. ----------
export const DYES = [
  { id: 'marigold', name: 'Marigold', ink: '#be955c' },
  { id: 'onion', name: 'Onion skins', ink: '#c28d75' },
  { id: 'beet', name: 'Beetroot', ink: '#8b5580' },
  { id: 'nettle', name: 'Nettles', ink: '#6eaa78' },
  { id: 'bramble', name: 'Blackberries', ink: '#433455' },
  { id: 'cabbage', name: 'Red cabbage', ink: '#666092' },
  { id: 'walnut', name: 'Walnut husks', ink: '#6e6962' },
  { id: 'woad', name: 'Woad', ink: '#7ca1c0' },
  { id: 'madder', name: 'Madder root', ink: '#9a4f50' },
  { id: 'indigo', name: 'Indigo', ink: '#416aa3' },
];
// Every cross, i >= j: [name, harmony]. Harmony: 2 lovely, 1 fine, 0 muddy. The lemon's juice is in every pot.
const X = {
  '0-0': ['Buttercup', 1],
  '1-0': ['Marmalade', 1], '1-1': ['Toffee', 1],
  '2-0': ['Coral', 2], '2-1': ['Brick Dust', 1], '2-2': ['Beet Blush', 1],
  '3-0': ['Spring Green', 2], '3-1': ['Old Pond', 0], '3-2': ['Gravy', 0], '3-3': ['Nettle Tea', 1],
  '4-0': ['Bruise', 0], '4-1': ['Plum Jam', 1], '4-2': ['Damson', 2], '4-3': ['Bog', 0], '4-4': ['Bramble', 1],
  '5-0': ['Dishwater', 0], '5-1': ['Heather', 1], '5-2': ['Sweet Pea', 2], '5-3': ['Sea Glass', 1], '5-4': ['Violet', 2], '5-5': ['Lilac', 1],
  '6-0': ['Biscuit', 1], '6-1': ['Conker', 2], '6-2': ['Liver', 0], '6-3': ['Moss', 1], '6-4': ['Puddle', 0], '6-5': ['Slate', 1], '6-6': ['Walnut', 1],
  '7-0': ['Lincoln Green', 2], '7-1': ['Duck Egg', 1], '7-2': ['Mauve', 1], '7-3': ['Teal', 2], '7-4': ['Midnight', 1], '7-5': ['Cornflower', 1], '7-6': ['Storm', 0], '7-7': ['Sky', 1],
  '8-0': ['Paprika', 1], '8-1': ['Rust', 2], '8-2': ['Raspberry', 1], '8-3': ['Gravy Again', 0], '8-4': ['Wine', 1], '8-5': ['Rose', 1], '8-6': ['Mahogany', 2], '8-7': ['Royal Purple', 2], '8-8': ['Turkey Red', 1],
  '9-0': ['Bottle Green', 1], '9-1': ['Mud', 0], '9-2': ['Aubergine', 1], '9-3': ['Deep Sea', 1], '9-4': ['Ink', 2], '9-5': ['Bluebell', 1], '9-6': ['Navy', 1], '9-7': ['Delft', 2], '9-8': ['Damask', 2], '9-9': ['Indigo', 1],
};
const VINIK = ['#6f6776', '#9a9a97', '#c5ccb8', '#8b5580', '#c38890', '#a593a5', '#666092', '#9a4f50', '#c28d75', '#7ca1c0', '#416aa3', '#8d6268', '#be955c', '#68aca9', '#387080', '#6e6962', '#93a167', '#6eaa78', '#557064', '#9d9f7f', '#7e9e99', '#5d6872', '#433455'];
const MUD = ['#6e6962', '#8d6268', '#557064', '#9d9f7f', '#6f6776'];
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function nearest(c, list = VINIK) {
  let best = list[0], bd = Infinity;
  for (const h of list) { const d = rgb(h).reduce((s, v, k) => s + (v - c[k]) ** 2, 0); if (d < bd) { bd = d; best = h; } }
  return best;
}
export const key = (i, j) => i >= j ? `${i}-${j}` : `${j}-${i}`;
export const pair = k => k.split('-').map(Number);
export const CROSS = {};
for (const [k, [name, h]] of Object.entries(X)) {
  const [i, j] = pair(k), a = rgb(DYES[i].ink), b = rgb(DYES[j].ink);
  const mix = a.map((v, n) => (v + b[n]) / 2);
  const ink = h === 0 ? nearest(mix, MUD) : i === j ? DYES[i].ink : nearest(mix);
  CROSS[k] = { key: k, i, j, name, h, ink, price: 0.5 * Math.pow(PRICE_STEP, i + j) * [0.35, 1, 1.8][h] };
}

// ---------- Pots: one ladder, climbed again every summer ----------
export const POTS = [
  ['Saucepan', 4], ['Stockpot', 'x'], ['Jam Pan', 'x'], ['Copper', 'x'], ['Tin Bath', 'x'], ['Water Butt', 'x'],
  ['Paddling Pool', 'x'], ['Garden Pond', 'x'], ['Duck Pond', 'x'],
  ['Reservoir', 'x'], ['The Bay', 'x'],
].map(([name], k) => ({ name, yd: 4 * Math.pow(POT_YD, k), cost: k ? POT_C0 * Math.pow(POT_GROW, k - 1) : 0 }));
// The Bay is the last pot, and nearer than it looks: once you can run a reservoir, the sea is a short walk.
POTS[POTS.length - 1].cost = POTS[POTS.length - 2].cost * BAY_STEP;

// ---------- The shop ----------
// cur 'p' = pennies (this summer's takings), 'r' = ribbons (kept). kind: one, lv, odd.
export const UP = {
  // Pennies: kit for this summer (cleared at the Fair), and a few silly things that stay.
  burner: { cur: 'p', kind: 'lv', max: 6, name: 'Bigger Burner', base: 60, grow: 9, frac: 0.12, desc: 'A bigger gas ring under the pot. Every steep takes less time.' },
  stall: { cur: 'p', kind: 'lv', max: 8, name: 'Bigger Stall', base: 400, grow: 14, frac: 0.3, desc: 'Another trestle on the pavement. Every yard sells for more.' },
  thermo: { cur: 'p', kind: 'odd', name: 'Porch Thermometer', cost: 25, at: 60, desc: 'A brass thermometer by the front door. It says 14°. Lovely.' },
  mat: { cur: 'p', kind: 'odd', name: 'Welcome Mat', cost: 600, at: 3000, desc: 'A doormat for number 9. It says NOT SOUR in big letters.' },
  bunting: { cur: 'p', kind: 'odd', name: 'Bunting', cost: 2e4, at: 1e6, desc: 'Bunting from the gate to the lamppost, in every colour you have found.' },
  postbox: { cur: 'p', kind: 'odd', name: 'Post Box Hat', cost: 5e6, at: 1e9, desc: 'A bobble hat for the post box on the corner. It has been out in all weathers.' },
  fan: { cur: 'p', kind: 'odd', name: 'Desk Fan', cost: 4e9, at: 1e12, desc: 'A little desk fan on the windowsill. Nobody needs it. It is just nice to have.' },
  jug: { cur: 'p', kind: 'odd', name: 'Big Jug', cost: 2e12, at: 1e15, desc: 'A very big glass jug, on the windowsill. Just in case.' },
  // Ribbons: kept for good.
  kettle: { cur: 'r', kind: 'one', name: 'The Kettle Trick', cost: 4, desc: 'A kettle, a ball of wool and a lid that rattles: it steeps on its own. Comes with the first kettle; more go on sale in the Pennies tab, and they live in the kitchen, so the committee can’t clear them.' },
  paw: { cur: 'r', kind: 'one', name: 'Steady Paw', cost: 6, desc: 'An oven glove, and a feel for it. The just-right band on the pot gets wider.' },
  lamp: { cur: 'r', kind: 'one', name: 'Steep by Lamplight', cost: 3, summer: 120, desc: 'A storm lantern on a hook by the pot. You can steep after dark, so every summer is longer.' },
  wellies: { cur: 'r', kind: 'one', name: 'Wellies', cost: 14, summer: 150, desc: 'Yellow wellies. Steep in the rain. Summers are longer.' },
  frame: { cur: 'r', kind: 'one', name: 'Cold Frame', cost: 70, summer: 180, desc: 'A glass box in the garden keeps the dye plants going into October. Summers are longer.' },
  cosy: { cur: 'r', kind: 'one', name: 'Pot Cosy', cost: 400, summer: 210, desc: 'A knitted cosy for the pot. It stays hot through the first frosts. Summers are longer.' },
  bottle: { cur: 'r', kind: 'one', name: 'Hot Water Bottle', cost: 3000, summer: 240, desc: 'One for the lemon, one for the pot. Steep right through November. The longest summers.' },
  fence: { cur: 'r', kind: 'one', name: 'Taller Fence', cost: 30, desc: 'Two more feet of fence between number 9 and number 11. Vi takes longer to see what you are brewing.' },
  prize: { cur: 'r', kind: 'lv', max: 40, name: 'Prize Ribbons', base: 2, grow: 2.3, desc: 'Pin your ribbons to the front door. People come to see a prizewinner steep, and bring their own wool: every steep makes half as much yarn again.' },
  shed: { cur: 'r', kind: 'lv', max: 12, name: 'Garden Shed', base: 12, grow: 4.2, desc: 'Keep a pot in the shed over winter, off the pavement. Every summer starts with one more pot already bought.' },
};
// Dye plants: one per row of the chart after the first two. Bought with ribbons.
export const PLANT_COST = [0, 0, 2, 8, 30, 120, 500, 2000, 6000, 12000];
for (let i = 2; i < DYES.length; i++) UP['plant' + i] = { cur: 'r', kind: 'plant', dye: i, name: DYES[i].name, cost: PLANT_COST[i], desc: `Plant ${DYES[i].name.toLowerCase()} in the dye garden. It comes back every summer, and the dye chart gets a new row to cross.` };
export const KETTLE = { base: 50, grow: 1.6, rate: 0.03 };   // each kettle: 3% of a pot a second. Kettles are kept.

// ---------- State ----------
export function newState() {
  return {
    season: 1, clock: 0, fair: false, ended: false, t: 0,
    pennies: 0, earned: 0, yards: 0, total: 0, ribbons: 0, ribbonsTotal: 0, steeps: 0, right: 0,
    pot: 0, balls: 1, kettles: 0, lv: {}, up: {}, plants: 2,
    found: { '0-0': 1 }, sel: '0-0', market: { '0-0': { m: 1, f: 1 } }, copy: { key: '', t: 0, on: false },
    lastYards: 0, lastRibbons: 0, history: [], seen: [], shopTab: 'p', lastSeen: 0, endedAt: null,
  };
}
export function load(o) {
  const S = Object.assign(newState(), o);
  S.lv ||= {}; S.up ||= {}; S.found ||= {}; S.market ||= {}; S.copy ||= { key: '', t: 0, on: false };
  if (!S.found['0-0']) S.found['0-0'] = 1;
  if (!CROSS[S.sel]) S.sel = '0-0';
  for (const k of Object.keys(S.found)) if (!S.market[k]) S.market[k] = { m: 1, f: 1 };
  if (S.ended) finishAll(S);
  return S;
}
// A finished save draws the finished world: every plant, every pot rung, every silly thing.
export function finishAll(S) {
  S.ended = true; S.fair = false;
  S.plants = DYES.length; S.pot = POTS.length - 1;
  for (const [id, u] of Object.entries(UP)) {
    if (u.kind === 'one' || u.kind === 'odd') S.up[id] = 1;
    if (u.kind === 'lv') S.lv[id] = Math.max(S.lv[id] || 0, id === 'prize' ? 12 : u.max);
  }
  S.total = Math.max(S.total, TARGET); S.kettles = Math.max(S.kettles, 40);
  for (const k of Object.keys(CROSS)) { S.found[k] = 1; S.market[k] ||= { m: 1, f: 1 }; }
}

// ---------- Rules ----------
export const lv = (S, id) => S.lv[id] || 0;
export const summerLength = S => BASE_SUMMER + Object.entries(UP).reduce((s, [id, u]) => s + (u.summer && S.up[id] ? u.summer : 0), 0);
export const timeLeft = S => Math.max(0, summerLength(S) - S.clock);
export const steepTime = S => 1.8 * Math.pow(0.86, lv(S, 'burner'));
export const zone = S => S.up.paw ? [0.66, 1.06] : [0.78, 1.0];
export const BOIL = 1.5;
// What a steep is worth for how long you held it: c is 1 at the deepest good shade.
export function shade(S, c) {
  const [lo, hi] = zone(S);
  if (c < lo) return { q: Math.max(0.15, c / lo), word: c < lo * 0.5 ? 'pale' : 'nearly' };
  if (c <= hi) return { q: 1.5, word: 'just right' };
  return { q: 0.6, word: 'stewed' };
}
export const prizeMult = S => Math.pow(PRIZE, lv(S, 'prize'));
export const potYards = (S, p = S.pot, balls = S.balls) => POTS[p].yd * balls * prizeMult(S);
// More wool in the pot: priced by the size of the pot (a bigger pot takes bigger balls).
export let BALL = { base: 3, grow: 1.1 };
export const ballCost = S => BALL.base * POTS[S.pot].yd * Math.pow(BALL.grow, S.balls - 1);
export function canBall(S) { return !S.fair && !S.ended && S.pennies >= ballCost(S); }
export function buyBall(S, max = 1) { let n = 0; while (n < max && canBall(S)) { S.pennies -= ballCost(S); S.balls++; n++; } return n; }
// How many balls you could buy right now (the shop cell buys them all in one go).
export function ballsAffordable(S, cap = 99) { let n = 0, c = 0, b = S.balls; while (n < cap) { const k = BALL.base * POTS[S.pot].yd * Math.pow(BALL.grow, b - 1); if (c + k > S.pennies) break; c += k; b++; n++; } return n; }
export const stallMult = S => Math.pow(1.6, lv(S, 'stall'));
export const marketM = (S, k = S.sel) => (S.market[k] ? S.market[k].m : 1);
export const pricePerYard = (S, k = S.sel) => CROSS[k].price * marketM(S, k) * stallMult(S);
export const kettleYards = S => S.up.kettle ? S.kettles * KETTLE.rate * potYards(S) : 0;   // a second
export const kettleCost = S => KETTLE.base * Math.pow(KETTLE.grow, S.kettles);
export const potCost = S => S.pot + 1 < POTS.length ? POTS[S.pot + 1].cost : Infinity;
export const copyDelay = S => S.up.fence ? 45 : 20;
export let RIB_EXP = 0.27;
export const ribbonsFor = yards => Math.floor(Math.pow(Math.max(0, yards) / 40, RIB_EXP));
export const unlocked = (S, i) => i < S.plants;
export const cosyTemp = S => 14 + 27 * Math.min(1, Math.log10(1 + S.total) / 17);

export function cost(S, id) {
  const u = UP[id];
  // The burner and the stall are priced against the next pot, so they stay a real choice all summer.
  if (u.frac) return Math.max(u.base * Math.pow(u.grow, lv(S, id)), POTS[Math.min(POTS.length - 1, S.pot + 1)].cost * u.frac * Math.pow(2, lv(S, id)));
  if (u.kind === 'lv') return u.base * Math.pow(u.grow, lv(S, id));
  return u.cost;
}
export function have(S, cur) { return cur === 'r' ? S.ribbons : S.pennies; }
// Which shop items are on show: anything revealed stays until bought.
export function items(S) {
  const out = [];
  for (const [id, u] of Object.entries(UP)) {
    if (u.kind === 'plant') {
      if (u.dye !== S.plants) continue;                // one plant on offer at a time, in order
    } else if (u.kind === 'lv') {
      if (lv(S, id) >= u.max) continue;
    } else if (S.up[id]) continue;
    if (!visible(S, id)) continue;
    out.push({ id, ...u, cost: cost(S, id) });
  }
  return out;
}
function visible(S, id) {
  const u = UP[id];
  if (S.seen.includes(id)) return true;
  if (u.cur === 'r') return S.ribbonsTotal > 0 && (id !== 'shed' || S.season >= 3) && (id !== 'bottle' || S.up.cosy) && (id !== 'cosy' || S.up.frame) && (id !== 'frame' || S.up.wellies) && (id !== 'wellies' || S.up.lamp);
  if (u.kind === 'odd') return S.total >= u.at;
  if (id === 'burner') return S.earned >= 20;
  if (id === 'stall') return S.pot >= 2;
  return true;
}
export function canBuy(S, id) {
  if (S.ended) return false;
  const u = UP[id];
  if (u.cur === 'p' && S.fair) return false;
  if (u.kind === 'lv' && lv(S, id) >= u.max) return false;
  if ((u.kind === 'one' || u.kind === 'odd') && S.up[id]) return false;
  if (u.kind === 'plant' && u.dye !== S.plants) return false;
  return have(S, u.cur) >= cost(S, id);
}
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const u = UP[id], c = cost(S, id);
  if (u.cur === 'r') S.ribbons -= c; else S.pennies -= c;
  if (u.kind === 'lv') S.lv[id] = lv(S, id) + 1;
  else if (u.kind === 'plant') S.plants = u.dye + 1;
  else S.up[id] = 1;
  if (id === 'kettle') S.kettles = Math.max(1, S.kettles);   // the trick comes with its first kettle
  if (!S.seen.includes(id)) S.seen.push(id);
  return true;
}
export function canPot(S) { return !S.fair && !S.ended && S.pot + 1 < POTS.length && S.pennies >= potCost(S); }
export function buyPot(S) { if (!canPot(S)) return false; S.pennies -= potCost(S); S.pot++; return true; }
export function canKettle(S) { return !S.fair && !S.ended && !!S.up.kettle && S.pennies >= kettleCost(S); }
export function buyKettle(S, max = 1) { let n = 0; while (n < max && canKettle(S)) { S.pennies -= kettleCost(S); S.kettles++; n++; } return n; }
export function kettlesAffordable(S, cap = 99) { let n = 0, c = 0, k = S.kettles; while (n < cap && S.up.kettle) { const x = KETTLE.base * Math.pow(KETTLE.grow, k); if (c + x > S.pennies) break; c += x; k++; n++; } return n; }

// Choose what's in the pot: any cross of two planted dyestuffs.
export function choose(S, k) {
  const [i, j] = pair(k);
  if (!CROSS[k] || !unlocked(S, i) || !unlocked(S, j) || S.ended) return false;
  S.sel = k; return true;
}
// Lift the yarn out after holding for charge c (1 = deepest good shade). Returns what happened.
export function steep(S, c) {
  if (S.fair || S.ended) return null;
  const k = S.sel, fresh = !S.found[k];
  if (fresh) { S.found[k] = 1; S.market[k] = { m: 2, f: 1.2 }; }
  const sh = shade(S, c), yd = potYards(S) * sh.q, p = yd * pricePerYard(S, k);
  S.yards += yd; S.total += yd; S.pennies += p; S.earned += p; S.steeps++;
  if (sh.q > 1) S.right++;
  return { k, fresh, yd, p, ...sh };
}
// Time passes (only during a summer). Kettles steep on their own; prices drift; Vi copies.
export function tick(S, dt, rnd = Math.random) {
  const ev = [];
  if (S.ended) return ev;
  S.t += dt;
  if (S.fair) return ev;
  S.clock += dt;
  const ky = kettleYards(S) * dt;
  if (ky > 0) { const p = ky * pricePerYard(S); S.yards += ky; S.total += ky; S.pennies += p; S.earned += p; }
  // Vi watches over the fence: brew one colour long enough and she's selling it too.
  if (S.copy.key !== S.sel) { if (S.copy.on) ev.push({ type: 'viMoves' }); S.copy = { key: S.sel, t: 0, on: false }; }
  S.copy.t += dt;
  if (!S.copy.on && S.copy.t >= copyDelay(S) && S.found[S.sel] && Object.keys(S.found).length >= 3) { S.copy.on = true; ev.push({ type: 'copy', k: S.sel }); }
  for (const [k, mk] of Object.entries(S.market)) {
    if (rnd() < dt / 70) mk.f = 0.6 + rnd() * 1.1;              // the street changes its mind
    if (S.copy.on && k === S.copy.key) mk.m = Math.max(0.3, mk.m * Math.pow(0.985, dt));
    else mk.m += (mk.f - mk.m) * Math.min(1, 0.025 * dt);
  }
  if (S.clock >= summerLength(S)) { fair(S); ev.push({ type: 'fair' }); }
  if (S.total >= TARGET) ev.push({ type: 'target' });
  return ev;
}
// The Vine Street Fair: yards become ribbons, the takings go to the Street Fund, the pavement is cleared.
export function fair(S) {
  S.fair = true;
  S.lastYards = S.yards; S.lastRibbons = ribbonsFor(S.yards);
  S.ribbons += S.lastRibbons; S.ribbonsTotal += S.lastRibbons;
  S.history.push({ season: S.season, yards: S.yards, ribbons: S.lastRibbons, rung: S.pot });
  S.copy = { key: '', t: 0, on: false };
}
export function nextSummer(S) {
  if (!S.fair || S.ended) return false;
  S.fair = false; S.season++; S.clock = 0;
  S.pennies = 0; S.earned = 0; S.yards = 0;
  S.pot = Math.min(POTS.length - 1, lv(S, 'shed')); S.balls = 1; S.lv.burner = 0; S.lv.stall = 0;
  for (const mk of Object.values(S.market)) { mk.m = Math.max(mk.m, 1); }
  return true;
}
// Away: the summer waits for you, and the kettles keep simmering at a low heat.
export const OFFLINE_RATE = 0.25, OFFLINE_CAP = 4 * 3600;
export function offline(S, secs) {
  if (S.ended || S.fair || !S.up.kettle || S.kettles < 1) return null;
  const used = Math.min(secs, OFFLINE_CAP), yd = kettleYards(S) * used * OFFLINE_RATE, p = yd * pricePerYard(S);
  S.yards += yd; S.total += yd; S.pennies += p; S.earned += p;
  return { yards: yd, pennies: p, capped: secs > OFFLINE_CAP };
}
export function phase(S) {
  if (S.ended) return 'end';
  if (S.fair) return 'fair';
  if (S.season <= 2) return 'early';
  return S.total >= 1e9 ? 'late' : 'summer';
}
// Milestones of the Big Cosy: what the yarn out there has wrapped so far.
export const COSY = [
  [100, 'the front gate'], [1e4, 'number 9'], [1e6, 'the lampposts'], [1e8, 'Vine Street'],
  [1e10, 'the town'], [1e12, 'the Downs'], [1e14, 'the clouds'], [1e16, 'the coast'], [TARGET, 'the Earth'],
];
export function cosyStage(S) { let n = 0; for (const [at] of COSY) if (S.total >= at) n++; return n; }

const NAMES = ['', ' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion'];
export function fmt(x) {
  if (!isFinite(x)) return '∞';
  if (x < 1000) return x < 10 && x % 1 ? x.toFixed(1) : Math.floor(x).toLocaleString('en-GB');
  if (x < 1e6) return Math.floor(x).toLocaleString('en-GB');
  const e = Math.min(NAMES.length - 1, Math.floor(Math.log10(x) / 3)), v = x / Math.pow(1000, e);
  return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v)}${NAMES[e]}`;
}
export function fmtShort(x) {
  if (x < 1e4) return fmt(x);
  const S = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  const e = Math.min(S.length - 1, Math.floor(Math.log10(x) / 3)), v = x / Math.pow(1000, e);
  return `${v < 10 ? v.toFixed(1) : Math.floor(v)}${S[e]}`;
}
