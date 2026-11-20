// Every Cloud: the rules. The page and the pacing sim (sim.mjs) both import this.
// Every cloud has a silver lining, they say. None of the clouds over the hut has one, so the cook paints them on
// (from a basket hauled up Houston, the runner bean), and you scratch through: a lined tin releases clean, and a
// lined cloud releases rain, sometimes hail, now and then something the sky lost. Rain waters Houston, who grows
// up to the higher cloud layers. Three missions replay the sky with one law of physics turned up. At 600 m the
// Big One arrives, and the only way into it is to hold back.

// ---------- Cloud layers ----------
// reach: Houston's height (m) that puts the layer in reach. rain: [min, max] litres from a clean release.
export const LAYERS = [
  { id: 'cu', name: 'Cumulus', short: 'cumulus', alt: 60, reach: 0, rain: [2, 4] },
  { id: 'sc', name: 'Stratocumulus', short: 'stratocumulus', alt: 190, reach: 150, rain: [5, 8] },
  { id: 'ac', name: 'Altocumulus', short: 'altocumulus', alt: 340, reach: 300, rain: [9, 14] },
  { id: 'cc', name: 'Cirrocumulus', short: 'cirrocumulus', alt: 490, reach: 450, rain: [15, 22] },
];
export const BIG_ONE = 600;
export const STEP_M = 20;                      // each watering grows Houston 20 m
export const WATER_MAX = BIG_ONE / STEP_M;     // 30 waterings to the Big One
export const height = S => S.lv.water * STEP_M;
export const reachLayer = S => { let i = 0; LAYERS.forEach((L, k) => { if (height(S) >= L.reach) i = k; }); return i; };
// Which layer a new cloud comes from: mostly the highest in reach, sometimes lower ones.
export function pickLayer(S, r = Math.random()) {
  const top = reachLayer(S);
  if (top === 0 || r < 0.6) return top;
  return Math.floor((r - 0.6) / 0.4 * top);
}

// ---------- Lost things (loot) ----------
// Two per layer below the top; each is drawn in the garden and adds 5% to every release.
export const FINDS = [
  { id: 'kite', layer: 0, name: 'a kite', line: 'A red kite, string and all. Last seen in 1994, over a beach. Now tied to Houston, flying.' },
  { id: 'glove', layer: 0, name: 'a woolly glove', line: 'One woolly glove, left hand. On the fence post now, waving at anything that passes.' },
  { id: 'plane', layer: 1, name: 'a paper plane', line: 'A paper plane, folded from a maths test (B minus). It lives in the gutter and relaunches itself on windy nights.' },
  { id: 'balloon', layer: 1, name: 'a party balloon', line: 'A party balloon, still a little bit happy birthday. Tied to the chimney. It bobs when the kettle boils.' },
  { id: 'cockerel', layer: 2, name: 'a weathervane cockerel', line: 'A brass weathervane cockerel. It must have been very windy somewhere. On the roof now, pointing at everything.' },
  { id: 'rock', layer: 3, name: 'a small meteorite', line: 'A small meteorite, still warm. Not lost, exactly: just passing. On the windowsill, glowing a bit.' },
];
export const FIND = Object.fromEntries(FINDS.map(f => [f.id, f]));
export const findsHave = S => FINDS.filter(f => S.finds[f.id]).length;

// ---------- The shop ----------
// kind: 'lv' (levels), 'one' (once, real), 'odd' (silly, for the picture). at: Houston's height (m) when it shows up.
export const ITEMS = [
  { id: 'loofah', kind: 'lv', max: 3, at: 0, name: 'Loofah', base: 12, mult: 3.4,
    desc: 'A loofah, grown on the trellis by the door. Scrubs a wider stripe of lining with each pass.',
    joke: 'Loofah deployed. It is a vegetable. It is also a sponge. Kitchen has stopped asking how.' },
  { id: 'butt', kind: 'lv', max: 4, at: 25, name: 'Pumpkin Rain-Butt', base: 30, mult: 2.6,
    desc: 'A pumpkin, hollowed out, under the gutter. Catches the rain the old bucket misses.',
    joke: 'Pumpkin one, on station. It was going to be soup. It has accepted a career in water storage.' },
  { id: 'tendril', kind: 'lv', max: 6, at: 50, name: 'Tendrils', base: 45, mult: 1.9,
    desc: 'Houston grows a tendril and curls it round the nearest painted cloud. Tendrils scratch by themselves.',
    joke: 'Houston has put out a tendril. It is scratching a cloud. Nobody asked it to. Logged as initiative.' },
  { id: 'brush', kind: 'lv', max: 3, at: 100, name: 'Bamboo Brush', base: 70, mult: 2.8,
    desc: 'A longer bamboo handle for the pastry brush. The cook lines each cloud faster.',
    joke: 'Bamboo handle fitted. Kitchen can now reach a cloud and the biscuit tin from the same basket.' },
  { id: 'sunflower', kind: 'one', at: 200, name: 'Sunflower', base: 160,
    desc: 'A sunflower by the hut. At night it turns to whatever is shiniest, which tells you where the hail is.',
    joke: 'Sunflower online. It is facing the moon. Then a cloud. Then the moon. It has opinions about shine.' },
  { id: 'hat', kind: 'odd', at: 75, name: 'Chef’s Hat for Houston', base: 40,
    desc: 'A small chef’s hat, for the top of Houston, wherever the top of Houston currently is.',
    joke: 'Hat placed on Houston. Houston is now the tallest member of the kitchen. She’d been asking, you could tell.' },
  { id: 'radio', kind: 'odd', at: 125, name: 'Transistor Radio', base: 65,
    desc: 'A radio on the windowsill, tuned to the shipping forecast, so Houston has company while the cook is up a cloud.',
    joke: 'Radio on. Houston is listening to the shipping forecast. She leans toward it at “rain later”.' },
  { id: 'kettle', kind: 'odd', at: 250, name: 'Kettle on the Stove', base: 120,
    desc: 'The kettle on. The chimney puffs out its own little cloud, which the cook has lined, obviously.',
    joke: 'Kettle on. The chimney cloud has a silver lining. Inside it: one litre of tea. Clean release.' },
  { id: 'patch', kind: 'odd', at: 350, name: 'Mission Patch', base: 180,
    desc: 'An embroidered patch for the hut door: KITCHEN · HOUSTON · EVERY CLOUD.',
    joke: 'Patch sewn on. The crew is one cook and one bean. The patch has room for both names and a cloud.' },
  { id: 'gnome', kind: 'odd', at: 425, name: 'Gnome in a Helmet', base: 240,
    desc: 'A garden gnome in a goldfish-bowl space helmet, by the bean rows.',
    joke: 'Gnome on station. He has a helmet and a fishing rod and no mission. Like all the best ground crew.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const max = it => it.kind === 'lv' ? it.max : 1;
export const lv = (S, id) => id === 'water' ? S.lv.water : BY_ID[id].kind === 'lv' ? S.lv[id] : (S.one[id] ? 1 : 0);
export function cost(S, id) {
  if (id === 'water') return waterCost(S.lv.water);
  const it = BY_ID[id];
  return Math.round(it.base * Math.pow(it.mult || 1, it.kind === 'lv' ? S.lv[id] : 0));
}
// Watering Houston: the repeat button at the top of the column.
export const waterCost = n => Math.round(10 * Math.pow(1.155, n) + n * 9);
export const owned = (S, id) => lv(S, id) >= max(BY_ID[id]);
// Upgrades in the shop: once shown (by height), they stay until bought out.
export function items(S) { return ITEMS.filter(it => S.seen[it.id] && !owned(S, it.id)); }
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) if (!S.seen[it.id] && height(S) >= it.at) { S.seen[it.id] = true; fresh.push(it.id); }
  return fresh;
}
export const bought = S => ITEMS.filter(it => it.kind !== 'lv' && S.one[it.id]);
export function buy(S, id) {
  const c = cost(S, id);
  if (S.rain < c) return false;
  if (id === 'water') { if (S.lv.water >= WATER_MAX) return false; S.rain -= c; S.lv.water++; return true; }
  const it = BY_ID[id];
  if (owned(S, id)) return false;
  S.rain -= c;
  if (it.kind === 'lv') S.lv[id]++; else S.one[id] = true;
  return true;
}

// ---------- Missions (the challenges) ----------
// One minute of sky with one law of physics turned up. Release `need` clouds in time for a permanent reward.
export const MISSIONS = [
  { id: 'wind', at: 75, name: 'Crosswind', secs: 45, need: 8,
    desc: 'Forty-five seconds of sky with the wind turned up. Clouds cross at three times the speed. Release eight.',
    reward: 'Windsock', rewardFx: 'Clouds come by half again as often, for good',
    line: 'Windsock raised. Kitchen has learned which way the weather comes from. More of it comes.' },
  { id: 'evap', at: 225, name: 'Evaporation', secs: 45, need: 8,
    desc: 'Forty-five seconds of warm air. Every cloud thins away to nothing six seconds after it arrives. Release eight.',
    reward: 'Pan Lids', rewardFx: 'Lids on the rain-butts: every release keeps 50% more rain',
    line: 'Pan lids fitted to every butt. Rain that used to evaporate now stays put. Physics: noted.' },
  { id: 'dark', at: 375, name: 'Moonless', secs: 45, need: 8,
    desc: 'Forty-five seconds with the moon behind a hill. You can only see by the head-torch, wherever you point it. Release eight.',
    reward: 'Head-Torch', rewardFx: 'Hail glints: twice the chance of a hailstorm jackpot',
    line: 'Head-torch issued. Hail glints in it before the lining is off. Kitchen can see the jackpots coming.' },
];
export const MISSION = Object.fromEntries(MISSIONS.map(m => [m.id, m]));
export const missionsOpen = S => MISSIONS.filter(m => height(S) >= m.at && !S.won[m.id]);

// ---------- Rates ----------
// Strokes a person needs to clear 65% of a lining (the page's scratch radius matches these roughly).
export const radius = S => [17, 23, 29, 35][S.lv.loofah];
export const STROKES = [4, 3, 2.3, 1.8];
export const paintSecs = S => [2.2, 1.5, 1.05, 0.75][S.lv.brush];
// A new cloud drifts in every so many seconds (the windsock brings them half again as often).
export const spawnSecs = S => (S.won.wind ? 2.1 : 3.2);
// Tendrils: clouds a minute that Houston releases on her own.
export const tendrilPerMin = S => [0, 5, 10, 16, 23, 31, 40][S.lv.tendril];
export const rainMult = S => (1 + 0.25 * S.lv.butt) * (S.won.evap ? 1.5 : 1) * (1 + 0.05 * findsHave(S));
export const hailChance = S => 0.03 * (S.one.sunflower ? 2 : 1) * (S.won.dark ? 2 : 1);
export const HAIL_X = 5;
// Average rain from one release in layer L (with hail).
export const avgRain = (S, L) => (LAYERS[L].rain[0] + LAYERS[L].rain[1]) / 2 * rainMult(S) * (1 + hailChance(S) * (HAIL_X - 1));
// What's behind a lining, decided when the cook paints it: { L, rain, hail, find }. `pending` lists finds
// already behind other linings, so the same lost thing isn't in two clouds at once.
export function roll(S, L, rnd = Math.random, pending = []) {
  const [a, b] = LAYERS[L].rain;
  let rain = (a + rnd() * (b - a)) * rainMult(S);
  const hail = rnd() < hailChance(S);
  if (hail) rain *= HAIL_X;
  let find = null;
  const left = FINDS.filter(f => f.layer === L && !S.finds[f.id] && !pending.includes(f.id));
  if (left.length && rnd() < ((S.pity[L] || 0) >= 13 ? 1 : 0.05)) find = left[0].id;
  return { L, rain: Math.max(1, Math.round(rain)), hail, find };
}
// A clean release: the rain goes in the butts, hail dents the roof, a find goes in the garden.
export function collect(S, p, who = 'me') {
  S.rain += p.rain; S.total += p.rain;
  if (p.hail) S.dents++;
  if (p.find) { S.finds[p.find] = true; S.pity[p.L] = 0; }
  else if (FINDS.some(f => f.layer === p.L && !S.finds[f.id])) S.pity[p.L] = (S.pity[p.L] || 0) + 1;
  if (who === 'me') S.mine++; else if (who === 'her') S.hers++;
}
export function release(S, L, rnd = Math.random, who = 'me') { const p = roll(S, L, rnd); collect(S, p, who); return p; }

// ---------- The hold ----------
export const HOLD_SECS = 40;

// ---------- State ----------
export function fresh() {
  return {
    v: 1, started: false, ended: false, t: 0, rain: 0, total: 0,
    lv: { water: 0, loofah: 0, butt: 0, tendril: 0, brush: 0 }, one: {}, seen: {}, won: {}, finds: {}, pity: {},
    mine: 0, hers: 0, dents: 0, hold: null, held: 0, tab: null, boughtOpen: false, savedAt: 0,
  };
}
export function load(raw) {
  const S = fresh();
  if (raw && typeof raw === 'object') for (const k of Object.keys(raw)) {
    if (S[k] && typeof S[k] === 'object' && !Array.isArray(S[k]) && raw[k] && typeof raw[k] === 'object') Object.assign(S[k], raw[k]);
    else S[k] = raw[k];
  }
  return S;
}
export const fmt = n => n >= 10000 ? Math.round(n).toLocaleString('en-GB') : String(Math.floor(n));
export const fmtRate = n => n >= 10 ? String(Math.round(n)) : n.toFixed(1).replace(/\.0$/, '');
