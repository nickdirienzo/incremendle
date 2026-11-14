// Nest Egg: the rules. Imported by index.html and by sim.mjs, so the pacing sim plays the real game.
//
// An empty nest in the gutter can't tell a chirping smoke alarm from a hungry chick. It traces runes in its
// twigs to fill batteries, feeds them to whatever chirps in the house, and Priya fills the feeder for every
// quiet night. Birds it mistakes for its own kids sit on the cells, pack small batteries into big ones,
// and carry them down. When every mouth in the house is fed, one last feast costs everything.

export const TIERS = ['aa', 'v9', 'lan', 'car'];
export const TIER = {
  aa: { name: 'AA cell', short: 'AA', from: null, n: 0 },
  v9: { name: '9-volt', short: '9V', from: 'aa', n: 6 },      // a 9-volt really is six little cells inside
  lan: { name: 'lantern battery', short: 'Lantern', from: 'v9', n: 4 },
  car: { name: 'car battery', short: 'Car', from: 'lan', n: 5 },
};
export const SPARKS_PER_AA = 20;

// Runes: one stroke each, in unit coordinates over the nest. Runes are all straight strokes because they
// were made for carving in wood, and a nest is nothing but wood.
export const RUNES = [
  { id: 'kenaz', glyph: 'ᚲ', name: 'Kenaz, the torch', sparks: 5, path: [[0.64, 0.12], [0.36, 0.5], [0.64, 0.88]] },
  { id: 'sowilo', glyph: 'ᛊ', name: 'Sowilo, the sun', sparks: 10, path: [[0.36, 0.1], [0.64, 0.36], [0.36, 0.64], [0.64, 0.9]] },
  { id: 'thurisaz', glyph: 'ᚦ', name: 'Thurisaz, the thunder', sparks: 22, path: [[0.4, 0.08], [0.4, 0.3], [0.66, 0.49], [0.4, 0.68], [0.4, 0.92]] },
  { id: 'dagaz', glyph: 'ᛞ', name: 'Dagaz, the dawn', sparks: 45, path: [[0.26, 0.14], [0.74, 0.86], [0.74, 0.14], [0.26, 0.86], [0.26, 0.14]] },
];

// Rooms of the house. Feed a room's mouths enough times and it goes quiet, and the next room's chirping
// carries up to the gutter. The meter shows each room's count.
export const ROOMS = [
  { id: 'living', name: 'the living room', need: 50 },
  { id: 'hall', name: 'the hallway', need: 100 },
  { id: 'garage', name: 'the garage', need: 110 },
  { id: 'drive', name: 'the driveway', need: 70 },
];
export const GOAL = ROOMS.reduce((a, r) => a + r.need, 0);   // every mouth in the house, fed
export const FEAST_MIN = 400;       // the last feast needs at least this much seed on hand
export const FEEDER_HOLDS = 999;    // the feeder holds 999 seeds; the squirrels get the rest

// Everything in the house that chirps when its battery runs low.
// quiet: seconds between a feeding and the next chirp; reward: seed Priya puts out.
export const DEVICES = [
  { id: 'remote', room: 0, name: 'the TV remote', need: 'aa', n: 2, reward: 3, quiet: [18, 40] },
  { id: 'clock', room: 0, name: 'the kitchen clock', need: 'aa', n: 1, reward: 2, quiet: [14, 30] },
  { id: 'laser', room: 0, name: 'the cat’s laser pointer', need: 'aa', n: 2, reward: 3, quiet: [22, 46] },
  { id: 'lamp', room: 0, name: 'Priya’s night-light', need: 'aa', n: 3, reward: 4, quiet: [30, 60] },
  { id: 'smoke1', room: 1, name: 'the hallway smoke alarm', need: 'v9', n: 1, reward: 9, quiet: [35, 70] },
  { id: 'smoke2', room: 1, name: 'the landing smoke alarm', need: 'v9', n: 1, reward: 9, quiet: [35, 70] },
  { id: 'walkie', room: 1, name: 'Priya’s walkie-talkie', need: 'v9', n: 2, reward: 18, quiet: [50, 95] },
  { id: 'lantern', room: 2, name: 'the camping lantern', need: 'lan', n: 1, reward: 28, quiet: [60, 110] },
  { id: 'torch', room: 2, name: 'Dad’s big torch', need: 'lan', n: 1, reward: 28, quiet: [60, 110] },
  { id: 'worklight', room: 2, name: 'the workbench light', need: 'lan', n: 2, reward: 60, quiet: [90, 150] },
  { id: 'car', room: 3, name: 'the car', need: 'car', n: 1, reward: 110, quiet: [90, 150] },
  { id: 'mower', room: 3, name: 'the ride-on mower', need: 'car', n: 1, reward: 110, quiet: [110, 170] },
];
export const DEV = Object.fromEntries(DEVICES.map(d => [d.id, d]));
export const PATIENCE = 60;         // seconds a chirp lasts before Dad replaces the battery himself

export const JOBS = ['brood', 'pack', 'carry'];
export const JOB = {
  brood: { name: 'Brood', room: 0, what: 'sit on the cells and warm them' },
  pack: { name: 'Pack', room: 1, what: 'pack small batteries into big ones' },
  carry: { name: 'Carry', room: 1, what: 'carry batteries down to whatever chirps' },
};

// The shop. kind: 'bird' (repeatable), 'lv' (levels, cap grows by room), 'rune', 'odd' (silly one-offs), 'feast'.
export const ITEMS = [
  { id: 'bird', kind: 'bird', name: 'Feed a Bird', base: 3, per: 3.2, sq: 0.18, capPer: 15, room: 0,
    desc: 'Put out a little seed. A night migrant on its way south stops over, and the nest is certain it’s one of its own, home early.',
    joke: 'It is not. Many small birds migrate by night and rest by day; this one rests, and works, and is too polite to correct a nest.' },
  { id: 'lining', kind: 'lv', name: 'Down Lining', base: 5, grow: 1.2, capPer: 8, room: 0,
    desc: 'Line the nest with down. Brooding birds warm the cells faster, and warm cells take charge.',
    joke: 'Warming a cold battery really does bring some charge back. The nest has always known this about eggs.' },
  { id: 'feeder', kind: 'lv', name: 'Bigger Feeder', base: 9, grow: 1.24, capPer: 6, room: 0,
    desc: 'Give Priya a bigger feeder to fill. More seed for every mouth fed.',
    joke: 'Priya caught a bird sitting on the smoke alarm one night. Since then she has kept a chart: every quiet night, seed. She fills whatever is there.' },
  { id: 'sowilo', kind: 'rune', rune: 1, name: 'Learn Sowilo', cost: 20, room: 0,
    desc: 'Sowilo, the sun: a zigzag of three strokes. More twig rubbing, more static, more charge for every cast.',
    joke: 'Runes are all straight strokes because they were made for carving in wood. A nest is nothing but wood. The nest considers this a sign.' },
  { id: 'lullaby', kind: 'lv', name: 'Lullaby', base: 30, grow: 1.8, capPer: 1, room: 0,
    desc: 'The nest hums to whatever chirps. Each chirp waits longer before Dad gives up and changes the battery.',
    joke: 'It is the lullaby it hummed to its chicks in June. It cannot remember the words. The smoke alarm doesn’t mind.' },
  { id: 'bands', kind: 'lv', name: 'Rubber Bands', base: 24, grow: 1.22, capPer: 7, room: 1,
    desc: 'Rubber bands from the kitchen drawer. Packing birds pack faster.',
    joke: 'A 9-volt really is six tiny cells in a box. The nest has concluded that every big battery is just small ones, packed. Nobody has corrected it.' },
  { id: 'route', kind: 'lv', name: 'Gutter Perch', base: 35, grow: 1.26, capPer: 5, room: 1,
    desc: 'A twig perch on the way down the drainpipe. Carrying birds make the trip faster.',
    joke: 'Birds rest on the way down. They would never admit to resting on the way down.' },
  { id: 'thurisaz', kind: 'rune', rune: 2, name: 'Learn Thurisaz', cost: 170, room: 1,
    desc: 'Thurisaz, the thunder: a straight line with a thorn on it. Much more charge per cast.',
    joke: 'Thunder in a nest is, by most accounts, a bad sign. The batteries disagree.' },
  { id: 'dagaz', kind: 'rune', rune: 3, name: 'Learn Dagaz', cost: 600, room: 2,
    desc: 'Dagaz, the dawn: two triangles kissing. The most charge per cast.',
    joke: 'Dawn is when Dad gives up on a chirp. The nest has learned to cast it first.' },
  { id: 'scarf', kind: 'odd', name: 'A Little Scarf', cost: 8, room: 0,
    desc: 'A little knitted scarf for the nest, round the rim.',
    joke: 'Nests do not get cold. The nights are getting colder anyway, and it is the principle of the thing.' },
  { id: 'tags', kind: 'odd', name: 'Name Tags', cost: 45, room: 0,
    desc: 'Every bird gets a name tag, so the nest can tell them apart.',
    joke: 'It reads them, nods, and calls everyone Kevin.' },
  { id: 'luggage', kind: 'odd', name: 'Luggage Tag', cost: 90, room: 1,
    desc: 'A brown luggage tag, tied to a twig. IF FOUND: SOUTH.',
    joke: 'The nest has never been anywhere. It would like to be found somewhere.' },
  { id: 'postcard', kind: 'odd', name: 'A Postcard', cost: 150, room: 1,
    desc: 'A postcard blows into the gutter: palm trees, a beach, WISH YOU WERE HERE.',
    joke: 'It is addressed to nobody in particular. The nest tucks it into its twigs and looks at it every night, toward the south.' },
  { id: 'handles', kind: 'odd', name: 'Ribbon Handles', cost: 260, room: 2,
    desc: 'Two loops of ribbon, woven into either side of the rim.',
    joke: 'For no reason, the nest says. The narrator lets it go.' },
  { id: 'drawing', kind: 'odd', name: 'Priya’s Drawing', cost: 380, room: 3,
    desc: 'Priya tapes a drawing to her window, facing out: a nest, and a great many birds, and arrows.',
    joke: 'The arrows all point south. She has not shown it to her parents.' },
  { id: 'feast', kind: 'feast', name: 'The Last Feast', room: 3,
    desc: 'Costs everything: the flock eats every seed, and every battery goes on Priya’s windowsill, so the house stays quiet all winter.',
    joke: 'Birds really do feast before they migrate, until they are heavy enough to fly a long way. Heavy enough, say, to carry something between them.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export function defaults() {
  return {
    t: 0, ended: false, savedAt: 0,
    seed: 0, seedEver: 0, spark: 0, casts: 0,
    stock: { aa: 0, v9: 0, lan: 0, car: 0 },
    packed: { v9: 0, lan: 0, car: 0 },
    fed: 0, rf: [0, 0, 0, 0], missed: 0, birds: 0, jobs: { brood: 0, pack: 0, carry: 0 },
    lv: { lining: 0, feeder: 0, bands: 0, route: 0, lullaby: 0 },
    rune: 0, one: {}, seen: [],
    dev: {}, trips: [], packT: 0, boughtOpen: false, feast: null,
  };
}
export function load(raw) {
  const S = defaults();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(raw)) {
      if (S[k] && typeof S[k] === 'object' && !Array.isArray(S[k]) && raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k])) Object.assign(S[k], raw[k]);
      else S[k] = raw[k];
    }
  }
  if (S.ended) {
    // A finished save opens on the finished world: everything built, the whole flock.
    S.birds = Math.max(S.birds, 48); S.rune = 3; S.fed = Math.max(S.fed, GOAL); S.rf = ROOMS.map(r => r.need);
    for (const it of ITEMS) if (it.kind === 'odd') S.one[it.id] = true;
    for (const id of Object.keys(S.lv)) S.lv[id] = Math.max(S.lv[id], cap(S, id));
  }
  fixJobs(S);
  for (const d of DEVICES) if (!S.dev[d.id]) S.dev[d.id] = { q: firstQuiet(d), c: 0, left: 0 };
  return S;
}
const firstQuiet = d => d.room === 0 ? (d.id === 'clock' ? 2 : 6 + d.quiet[0] * 0.4) : 4 + d.quiet[0] * 0.3;

export function room(S) { let r = 0; while (r < ROOMS.length - 1 && (S.rf[r] || 0) >= ROOMS[r].need) r++; return r; }
export const quiet = (S, r) => (S.rf[r] || 0) >= ROOMS[r].need;
export const phaseKey = S => S.ended ? 'end' : S.feast ? 'feast' : ['p0', 'p1', 'p2', 'p3'][room(S)];
export const nextRoom = S => ROOMS[room(S) + 1] || null;
export const goalReady = S => quiet(S, ROOMS.length - 1);

export const idle = S => S.birds - JOBS.reduce((a, j) => a + (S.jobs[j] || 0), 0);
export const jobOpen = (S, j) => room(S) >= JOB[j].room;
export function fixJobs(S) {
  for (const j of JOBS) S.jobs[j] = Math.max(0, Math.floor(S.jobs[j] || 0));
  while (idle(S) < 0) { const j = JOBS.slice().reverse().find(k => S.jobs[k] > 0); S.jobs[j]--; }
}
export function assign(S, j, d) {
  if (!jobOpen(S, j)) return false;
  if (d > 0 && idle(S) < 1) {
    // Take one from the biggest other job.
    const from = JOBS.filter(k => k !== j && S.jobs[k] > 0).sort((a, b) => S.jobs[b] - S.jobs[a])[0];
    if (!from) return false;
    S.jobs[from]--;
  }
  if (d < 0 && S.jobs[j] < 1) return false;
  S.jobs[j] += d > 0 ? 1 : -1;
  return true;
}

// ---------- Rates ----------
export const runeOf = S => RUNES[Math.min(S.rune, RUNES.length - 1)];
export const castSparks = S => runeOf(S).sparks;
export const broodRate = (S, n = S.jobs.brood) => n * 0.3 * (1 + 0.15 * S.lv.lining);       // sparks a second
export const packTime = S => 7 / (1 + 0.25 * S.lv.bands);                                     // seconds per pack, per bird
export const tripTime = S => 11 * Math.pow(0.88, S.lv.route);                                 // seconds per delivery, per bird
export const patience = S => PATIENCE * (1 + 0.3 * S.lv.lullaby);
export const seedMul = S => 1 + 0.07 * S.lv.feeder;
export const rewardOf = (S, d) => Math.round(d.reward * seedMul(S));
export const aaFull = S => S.spark / SPARKS_PER_AA;

// ---------- The core action ----------
export function cast(S) {
  const n = castSparks(S);
  addSparks(S, n);
  S.casts++;
  return n;
}
function addSparks(S, n) {
  S.spark += n;
  let made = 0;
  while (S.spark >= SPARKS_PER_AA) { S.spark -= SPARKS_PER_AA; S.stock.aa++; made++; }
  return made;
}

// ---------- Crafting: many of A for one B ----------
export const unlockedTiers = S => TIERS.filter((t, i) => i <= room(S));
export const canPack = (S, t) => t !== 'aa' && unlockedTiers(S).includes(t) && S.stock[TIER[t].from] >= TIER[t].n;
export function pack(S, t) {
  if (!canPack(S, t)) return false;
  S.stock[TIER[t].from] -= TIER[t].n; S.stock[t]++; S.packed[t] = (S.packed[t] || 0) + 1;
  return true;
}
// What the packing birds work on: whatever an open chirp is short of, from the top down;
// then a small reserve of every size, from the bottom up.
export function packTarget(S) {
  const tiers = unlockedTiers(S).slice(1);
  const want = { aa: 0, v9: 0, lan: 0, car: 0 };
  for (const d of DEVICES) if (S.dev[d.id]?.c && d.room <= room(S)) want[d.need] += d.n;
  // A chirp short of a big battery wants the smaller ones it's packed from.
  for (const t of tiers.slice().reverse()) {
    const short = Math.max(0, want[t] - S.stock[t]);
    if (short && TIER[t].from !== 'aa') want[TIER[t].from] += short * TIER[t].n;
  }
  for (const t of tiers.slice().reverse()) if (S.stock[t] < want[t] && canPack(S, t)) return t;
  const reserve = { v9: 3, lan: 2, car: 1 };
  for (const t of tiers) if (S.stock[t] < reserve[t] + want[t] && canPack(S, t)) return t;
  return null;
}

// ---------- Demand: whatever chirps ----------
export const open = S => DEVICES.filter(d => d.room <= room(S) && S.dev[d.id]?.c);
export const canFeed = (S, id) => { const d = DEV[id]; return !!S.dev[id]?.c && S.stock[d.need] >= d.n; };
export function feed(S, id) {
  if (!canFeed(S, id)) return 0;
  const d = DEV[id];
  S.stock[d.need] -= d.n;
  return settle(S, d);
}
function settle(S, d, rnd = Math.random) {
  const st = S.dev[d.id];
  st.c = 0; st.left = 0; st.q = d.quiet[0] + rnd() * (d.quiet[1] - d.quiet[0]);
  const r = rewardOf(S, d);
  S.seed = Math.min(FEEDER_HOLDS, S.seed + r); S.seedEver += r; S.fed++; S.rf[d.room] = (S.rf[d.room] || 0) + 1;
  return r;
}

// One step of the world. Returns what happened, for the scene and the log.
export function tick(S, dt, rnd = Math.random) {
  const ev = { chirp: [], fed: [], gone: [], packed: [], aa: 0 };
  if (S.ended || S.feast) return ev;
  S.t += dt;
  ev.aa = addSparks(S, broodRate(S) * dt);
  const R = room(S);
  for (const d of DEVICES) {
    if (d.room > R) continue;
    const st = S.dev[d.id];
    if (st.c) {
      st.left -= dt;
      if (st.left <= 0 && !S.trips.some(tr => tr.id === d.id)) {
        st.c = 0; st.q = d.quiet[1] + 20 + rnd() * 30; S.missed++; ev.gone.push(d.id);
      }
    } else {
      st.q -= dt;
      if (st.q <= 0) { st.c = 1; st.left = patience(S); ev.chirp.push(d.id); }
    }
  }
  // Packers.
  if (S.jobs.pack > 0 && jobOpen(S, 'pack')) {
    S.packT += dt * S.jobs.pack / packTime(S);
    while (S.packT >= 1) {
      const t = packTarget(S);
      if (!t) { S.packT = Math.min(S.packT, 1); break; }
      pack(S, t); S.packT -= 1; ev.packed.push(t);
    }
  }
  // Carriers: each free bird takes the battery for an open chirp and flies it down.
  for (const tr of S.trips) tr.left -= dt;
  const done = S.trips.filter(tr => tr.left <= 0);
  S.trips = S.trips.filter(tr => tr.left > 0);
  for (const tr of done) { const d = DEV[tr.id]; ev.fed.push({ id: d.id, seed: settle(S, d, rnd), bird: true }); }
  if (jobOpen(S, 'carry')) {
    let free = S.jobs.carry - S.trips.length;
    if (free > 0) {
      const taken = new Set(S.trips.map(tr => tr.id));
      const list = open(S).filter(d => !taken.has(d.id) && S.stock[d.need] >= d.n).sort((a, b) => S.dev[a.id].left - S.dev[b.id].left);
      for (const d of list) {
        if (free <= 0) break;
        if (S.stock[d.need] < d.n) continue;
        S.stock[d.need] -= d.n;
        S.trips.push({ id: d.id, left: tripTime(S), dur: tripTime(S) });
        free--;
      }
    }
  }
  return ev;
}

// ---------- Shop ----------
export const lv = (S, id) => {
  const it = BY_ID[id];
  if (it.kind === 'bird') return S.birds;
  if (it.kind === 'lv') return S.lv[id] || 0;
  if (it.kind === 'rune') return S.rune >= it.rune ? 1 : 0;
  if (it.kind === 'odd') return S.one[id] ? 1 : 0;
  return 0;
};
export function cap(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'bird' || it.kind === 'lv') return it.capPer * (room(S) + 1 - it.room);
  return 1;
}
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'bird') { const n = S.birds; return Math.round(it.base + it.per * n + it.sq * n * n); }
  if (it.kind === 'lv') return Math.min(999, Math.round(it.base * Math.pow(it.grow, lv(S, id))));
  if (it.kind === 'feast') return Math.max(FEAST_MIN, Math.floor(S.seed));
  return it.cost;
}
export const maxed = (S, id) => BY_ID[id].kind === 'feast' ? !!S.feast : lv(S, id) >= cap(S, id);
export function available(S, id) {
  const it = BY_ID[id];
  if (room(S) < it.room) return false;
  if (it.kind === 'feast') return goalReady(S) && !S.feast && !S.ended;
  if (it.kind === 'rune' && S.rune < it.rune - 1) return false;
  return true;
}
// Revealed once you could nearly afford it; once shown it stays until bought (or the level cap catches up).
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) {
    if (S.seen.includes(it.id) || !available(S, it.id)) continue;
    if (it.kind === 'feast' || S.seedEver >= cost(S, it.id) * 0.6 || S.seed >= cost(S, it.id) * 0.6) { S.seen.push(it.id); fresh.push(it.id); }
  }
  return fresh;
}
export const items = S => ITEMS.filter(it => S.seen.includes(it.id) && available(S, it.id) && !(it.kind !== 'bird' && it.kind !== 'lv' && lv(S, it.id) >= 1) && !(it.kind === 'feast' && S.feast));
export const canBuy = (S, id) => S.seen.includes(id) && available(S, id) && !maxed(S, id) && S.seed >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id], c = cost(S, id);
  if (it.kind === 'feast') {
    S.feast = { seed: Math.floor(S.seed), stock: { ...S.stock }, birds: S.birds, at: S.t };
    S.seed = 0; for (const t of TIERS) S.stock[t] = 0; S.spark = 0; S.trips = [];
    return true;
  }
  S.seed -= c;
  if (it.kind === 'bird') { S.birds++; S.jobs.brood++; }
  else if (it.kind === 'lv') S.lv[id]++;
  else if (it.kind === 'rune') S.rune = it.rune;
  else if (it.kind === 'odd') S.one[id] = true;
  return true;
}
// One-time things you've bought, for the Bought shelf.
export const bought = S => ITEMS.filter(it => (it.kind === 'rune' || it.kind === 'odd') && lv(S, it.id) >= 1);

// ---------- Away ----------
// The flock keeps working while you're gone: a tenth of the speed (they're resting up), up to eight hours. Nobody casts runes.
export function away(S, sec) {
  if (S.ended || S.feast || !(sec > 30)) return null;
  const capped = Math.min(sec, 8 * 3600), run = capped * 0.1;
  const before = { fed: S.fed, seed: S.seedEver, aa: S.stock.aa, missed: S.missed };
  const t0 = S.t;
  let left = run;
  while (left > 0) { const dt = Math.min(1, left); tick(S, dt); left -= dt; }
  S.t = t0;   // time away isn't time played
  return { sec: capped, fed: S.fed - before.fed, seed: S.seedEver - before.seed, missed: S.missed - before.missed, aa: S.stock.aa - before.aa };
}
