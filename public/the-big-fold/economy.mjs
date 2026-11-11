// The Big Fold: the rules. The page and the pacing sim (sim.mjs) both import this.
// One night at the Dead Letter Office. Whatever nobody sorts rides the belt into Johnny Confetti, the
// shredder. Regulation 9: a letter folded into a frog is legally a frog. Paper remembers what it was, so
// each pigeonhole's frog eats only its own kind of mail, and a frog fed a letter folds into more frogs.
// You sort by hand until the chute outgrows two paper corners; then paper cranes sort, and you decide
// which pigeonhole each crane works. Rushes flood one pigeonhole with thick mail for thirty seconds.
// Every small frog fits in Johnny's mouth, so the night ends with one Great Frog that doesn't.

export const TYPES = [
  { id: 'love', glyph: '♥', name: 'LOVE', long: 'love letters' },
  { id: 'bill', glyph: '$', name: 'BILLS', long: 'bills' },
  { id: 'air', glyph: '✈', name: 'AIRMAIL', long: 'airmail' },
  { id: 'anon', glyph: '?', name: 'NO ADDRESS', long: 'letters to nobody' },
];

// The chute, widening. Each one replaces the last: B letters to a bundle, F bundles a second.
export const CHUTES = [
  { id: 'slot', name: 'The Night Slot', F: 0, B: 1, unit: 'letter', units: 'letters', types: 2 },
  { id: 'door', name: 'The Back Door', F: 1.2, B: 1, unit: 'letter', units: 'letters', types: 2, cost: 420,
    desc: 'Prop open the back door. Dead letters come in from the alley, one at a time, all night. Somebody has to sort them.',
    joke: 'The door opens on the alley and the rain and a draught of letters. “More friends!” says the envelope. The rain says nothing. The rain never does.' },
  { id: 'train', name: 'The Night Train', F: 2.4, B: 40, unit: 'sack', units: 'sacks', types: 3, cost: 1.7e3,
    desc: 'The 2:10 mail train stops behind the Office and leaves its dead letters in sacks of forty, airmail among them. A third pigeonhole opens.',
    joke: 'The train slows, the sacks come off, the train doesn’t stop. Nobody stops for dead letters. The envelope waves anyway.' },
  { id: 'tube', name: 'The Pneumatic Main', F: 3, B: 600, unit: 'canister', units: 'canisters', types: 4, cost: 6e5,
    desc: 'Tap the brass tube that runs under the whole post office. Canisters of 600 letters, and the ones addressed to nobody at all. A fourth pigeonhole.',
    joke: 'The canisters arrive with a thunk and a sigh. Some of them are addressed “To Whom It May Concern”. It concerns the envelope. Everything does.' },
  { id: 'town', name: 'Every Dead Letter in Town', F: 3.6, B: 2e4, unit: 'truckload', units: 'truckloads', types: 4, cost: 4.1e8,
    desc: 'Every post office in the city sends its dead letters here tonight, by the truckload. They were going to anyway, eventually.',
    joke: 'The trucks back up to the loading dock with their lights off, the way trucks do in this town. Twenty thousand letters each, and not one of them got where it was going.' },
  { id: 'land', name: 'Every Dead Letter in the Country', F: 4.2, B: 1e6, unit: 'boxcar', units: 'boxcars', types: 4, cost: 5.9e11,
    desc: 'Every dead letter office in the country ships its mail here tonight, a million letters to a boxcar. Nobody remembers who signed the order. (You did.)',
    joke: 'The freight train is a mile long and it doesn’t whistle. Boxcar after boxcar of letters that went to the wrong town, the wrong street, the wrong decade. “Welcome!” says the envelope, to all of them.' },
  { id: 'ever', name: 'Every Dead Letter Ever Written', F: 5, B: 1e8, unit: 'decade', units: 'decades', types: 4, cost: 4e15,
    desc: 'The basement goes down further than the plans say. Every letter that never arrived, since letters, a decade at a time.',
    joke: 'A crack opens in the floor and the past comes up it, a decade at a time. A love letter from 1931. A bill from 1846, still unpaid. The envelope reads it and says “Oh, Harold.”' },
  { id: 'never', name: 'Letters Nobody Wrote', F: 6, B: 1e10, unit: 'maybe', units: 'maybes', types: 4, cost: 2.5e19,
    desc: 'The letters people meant to write and never did. There are more of those than any other kind. They come in maybes.',
    joke: '“I meant to write.” “I should have said.” “Dear—” Ten billion of them to a maybe. They’re very light. They fold beautifully.' },
];

// The Great Frog, folded in seven creases from every frog in the building. After the last it's too big
// for Johnny's mouth.
export const CREASES = [
  { name: 'The Base Fold', cost: 8e21, line: 'Every frog in the building, folded in half. It’s a start. It’s a big start.' },
  { name: 'The Squash Fold', cost: 2.5e22, line: 'Squashed flat and opened up. It looks like a kite. A kite the size of a tram.' },
  { name: 'The Petal Fold', cost: 7e22, line: 'Folded up like a petal. The cranes have to stand on each other to reach.' },
  { name: 'The Legs', cost: 2e23, line: 'Four legs, folded out. The back two are for jumping. Nobody asks why it needs to jump.' },
  { name: 'The Inside Reverse', cost: 3.2e23, line: 'Folded inside out and back again. The floor creaks. Johnny’s teeth go quiet.' },
  { name: 'The Eyes', cost: 6.5e23, line: 'Two eyes, folded from the love letters of 1931. It blinks. Paper shouldn’t blink.' },
  { name: 'The Last Crease', cost: 1.3e24, line: 'One crease, down the back, the one that makes it spring. It’s done. It’s too big for anything.' },
];
export const GREAT = CREASES.length;
export const RUSH_LEN = 30;         // seconds a rush lasts
export const RUSH_WARN = 6;         // seconds of warning on the wire
export const RUSH_GAP = [55, 80];   // seconds between rushes
export const RUSH_FLOOD = 4;        // the rushing kind arrives this many times as fast
export const RUSH_THICK = 3;        // and folds this many times as many frogs (twelve-page love letters)
export const HAND_BELT = 5.2;       // seconds a hand letter takes to ride past every pigeonhole into Johnny

export const RUSHES = {
  love: ['THE 2 A.M. LOVE LETTERS', 'Somebody always writes at 2 A.M. Twelve pages, both sides.'],
  bill: ['QUARTER DAY', 'The bills all come due at once. Final demands are thick: they have a lot to say.'],
  air: ['A SHIP IN THE HARBOR', 'A liner docks with a hold full of airmail nobody could deliver. Onionskin, but lots of it.'],
  anon: ['THE MAYBE HOUR', 'Four A.M., when people write to nobody. They write long.'],
};

// Upgrades. kind: chute (the mail gets bigger), crane (sorters, bought many times), fold (more frogs
// per letter, leveled), hand (your own sorting), speed (cranes sort faster), clip (the Match button),
// odd (a silly one-off that only gets drawn), great (the Great Frog's slot: not a shop item).
export const ITEMS = [
  { id: 'lick', kind: 'hand', name: 'Lick the Flap', cost: 14, mul: 3,
    desc: 'Lick your own flap and you can sort with a wet corner. Every letter you sort by hand folds into three times as many frogs.',
    joke: 'The envelope licks its flap. It tastes of glue and 1931. “Delicious!” it says. Nobody asked.' },
  { id: 'hat', kind: 'odd', name: 'A Party Hat', cost: 160,
    desc: 'A paper party hat from the lost-property drawer. Does nothing.',
    joke: 'Nobody is throwing a party. Nobody has thrown a party in this building since the war. The envelope puts the hat on anyway, at an angle.' },
  ...CHUTES.slice(1).map(c => ({ id: c.id, kind: 'chute', name: c.name, cost: c.cost, desc: c.desc, joke: c.joke })),
  { id: 'crane', kind: 'crane', name: 'Fold a Crane', cost: 12, grow: 2.2, max: 6,
    desc: 'An origami crane, folded from an office memo. It stands at a pigeonhole and sorts whatever comes down the chute for it.' },
  { id: 'fold', kind: 'fold', name: 'Fold Smaller', cost: 80, grow: 9, mul: 3,
    desc: 'Smaller folds, smaller frogs, more of them to a letter. Every letter, sorted by hand or by crane, folds into three times as many frogs.' },
  { id: 'lamp', kind: 'speed', name: 'Green Desk Lamp', cost: 700, mul: 1.5,
    desc: 'A green glass desk lamp over the pigeonholes, so the cranes can read the handwriting. Cranes sort half again as fast.',
    joke: 'The lamp clicks on. A pool of green light, a haze of cigarette smoke from nobody’s cigarette. The cranes read faster. The envelope reads the lamp’s label: “Made in 1931”. “Me too!”' },
  { id: 'clip', kind: 'clip', name: 'Supervisor’s Clipboard', cost: 9e3,
    desc: 'A clipboard and a pencil on a string. Adds MATCH to the sorting floor: one tap puts every crane where the mail is.',
    joke: 'The envelope holds the clipboard the way a supervisor would, if a supervisor were an envelope. It ticks a box. The box was “cheerful”.' },
  { id: 'coffee', kind: 'odd', name: 'Coffee for Johnny', cost: 2.4e4,
    desc: 'A mug of black coffee, set on the shredder’s lid. Does nothing. Johnny doesn’t drink.',
    joke: 'You set the mug on Johnny’s lid. He looks at it a long time. “Nobody ever brought me coffee, kid.” He doesn’t drink it. He keeps it.' },
  { id: 'radio', kind: 'speed', name: 'Radio on the Shelf', cost: 6e5, mul: 1.6,
    desc: 'A wireless tuned to the all-night surf station. The cranes sort to the beat. Cranes sort 60% faster.',
    joke: 'Reverb and twang at four in the morning. The cranes bob. The frogs bob. The envelope bobs worst of all.' },
  { id: 'kazoo', kind: 'odd', name: 'A Kazoo', cost: 8e7,
    desc: 'A tin kazoo, also from lost property. Does nothing, loudly.',
    joke: 'The envelope plays the kazoo. One note, then the same note. Johnny’s teeth clench. “You’re saving that for something?” “Maybe!”' },
  { id: 'visor', kind: 'odd', name: 'Supervisor’s Visor', cost: 3e10,
    desc: 'A green eyeshade, for supervising. You haven’t sorted by hand in a while. Does nothing.',
    joke: 'With the visor on, the envelope looks like a man who has seen too much mail. It has. It loved all of it.' },
  { id: 'wings', kind: 'speed', name: 'Longer Wings', cost: 4e11, mul: 1.6,
    desc: 'Refold every crane with longer wings, from the Office’s good paper. Cranes sort 60% faster.',
    joke: 'The good paper was kept for letters to the Postmaster General. There won’t be any. The cranes look magnificent.' },
  { id: 'skylight', kind: 'odd', name: 'Oil the Skylight', cost: 6e13,
    desc: 'The skylight over the sorting floor hasn’t opened since 1931. Oil the hinges. Does nothing. Probably.',
    joke: 'One drop of oil on each hinge. The skylight creaks, considers, and stays shut. “Just in case!” says the envelope. In case of what? It doesn’t say.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export function defaults() {
  return {
    t: 0, frogs: 0, total: 0, shred: 0, hand: 0, chute: 0, cranes: 0, fold: 0,
    one: {}, seen: [], nb: [0, 0, 0, 0],
    rush: null, rushNext: null, great: 0, greatOn: false, ended: false, savedAt: 0,
  };
}
export function load(raw) {
  const S = Object.assign(defaults(), raw || {});
  S.one = Object.assign({}, S.one); S.nb = (S.nb || []).concat([0, 0, 0, 0]).slice(0, 4);
  S.seen = Array.isArray(S.seen) ? S.seen : [];
  if (S.ended) { // a finished save opens on the finished world: every chute, every crane, the Great Frog
    for (const it of ITEMS) if (it.kind !== 'crane' && it.kind !== 'fold') S.one[it.id] = true;
    S.chute = CHUTES.length - 1; S.cranes = Math.max(S.cranes, 24); S.fold = Math.max(S.fold, 9);
    if (S.nb.reduce((a, b) => a + b, 0) < S.cranes) S.nb = [6, 6, 6, 6];
    S.great = GREAT; S.greatOn = true; S.rush = null;
  }
  return S;
}

export const chute = S => CHUTES[S.chute];
export const types = S => chute(S).types;
export const lv = (S, id) => id === 'crane' ? S.cranes : id === 'fold' ? S.fold : S.one[id] ? 1 : 0;
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'crane') return Math.ceil(it.cost * Math.pow(it.grow, S.cranes));
  if (it.kind === 'fold') return Math.ceil(it.cost * Math.pow(it.grow, S.fold));
  return it.cost;
}
export const canBuy = (S, id) => !S.ended && S.frogs >= cost(S, id) && avail(S, id);
function avail(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'crane') return S.cranes < craneMax(S);
  if (it.kind === 'fold') return true;
  if (S.one[id]) return false;
  if (it.kind === 'chute') return CHUTES.findIndex(c => c.id === id) === S.chute + 1;
  return true;
}
// Frogs per letter.
export const perLetter = S => Math.pow(BY_ID.fold.mul, S.fold);
export const handPer = S => perLetter(S) * (S.one.lick ? BY_ID.lick.mul : 1);
// Bundles a crane sorts each second.
export function speed(S) {
  let s = 0.32;
  for (const id of ['lamp', 'radio', 'wings']) if (S.one[id]) s *= BY_ID[id].mul;
  return s;
}
// Bundles arriving each second, per pigeonhole.
export function arrivals(S) {
  const C = chute(S), n = C.types;
  return [0, 1, 2, 3].map(i => i >= n ? 0 : (C.F / n) * (S.rush && S.rush.on && S.rush.type === i ? RUSH_FLOOD : 1));
}
const thick = (S, i) => S.rush && S.rush.on && S.rush.type === i ? RUSH_THICK : 1;
// What each pigeonhole does per second: { in, sorted, lost } in bundles, frogs/s and shred letters/s.
export function flow(S) {
  const a = arrivals(S), s = speed(S), B = chute(S).B, V = perLetter(S);
  let frogs = 0, lost = 0;
  const bins = a.map((x, i) => {
    const sorted = Math.min(x, S.nb[i] * s);
    frogs += sorted * B * V * thick(S, i);
    lost += (x - sorted) * B;
    return { in: x, sorted, lost: x - sorted, cap: S.nb[i] * s };
  });
  return { bins, frogs, lost, letters: a.reduce((p, q) => p + q, 0) * B };
}
// A pigeonhole has room for six cranes on its ledge.
export const PER_BIN = 6;
export const craneMax = S => PER_BIN * types(S);
export const idle = S => S.cranes - S.nb.reduce((a, b) => a + b, 0);

// Where cranes should stand: proportional to what's arriving (rush mail first), whole cranes.
export function match(S) {
  const a = arrivals(S), w = a.map((x, i) => x * thick(S, i)), n = S.cranes, s = speed(S);
  const nb = [0, 0, 0, 0];
  // Fill the pigeonholes that pay most per crane first, up to what they can use, then spread the rest.
  for (let k = 0; k < n; k++) {
    let best = -1, bv = -1;
    for (let i = 0; i < 4; i++) {
      if (!a[i] || nb[i] >= PER_BIN) continue;
      const room = Math.max(0, a[i] - nb[i] * s);
      const v = Math.min(room, s) * thick(S, i) + (room > 0 ? 0 : -1 - nb[i] / 100);
      if (v > bv) { bv = v; best = i; }
    }
    if (best < 0) break;
    nb[best]++;
  }
  S.nb = nb;
  return nb;
}
// A new crane goes where it's needed most.
function place(S) {
  const a = arrivals(S), s = speed(S);
  let best = 0, bv = -Infinity;
  for (let i = 0; i < types(S); i++) { if (S.nb[i] >= PER_BIN) continue; const v = a[i] - S.nb[i] * s; if (v > bv) { bv = v; best = i; } }
  S.nb[best]++;
}
export function nudge(S, i, d) {
  if (S.ended || i >= types(S)) return false;
  if (d > 0) { if (S.nb[i] >= PER_BIN) return false;
    if (idle(S) > 0) { S.nb[i]++; return true; }
    // No idle crane: borrow one from the pigeonhole with the most spare.
    const f = flow(S); let from = -1, spare = -Infinity;
    for (let j = 0; j < 4; j++) if (j !== i && S.nb[j] > 0) { const sp = f.bins[j].cap - f.bins[j].in; if (sp > spare) { spare = sp; from = j; } }
    if (from < 0) return false; S.nb[from]--; S.nb[i]++; return true; }
  if (S.nb[i] > 0) { S.nb[i]--; return true; }
  return false;
}

export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id];
  S.frogs -= cost(S, id);
  if (it.kind === 'crane') { S.cranes++; place(S); }
  else if (it.kind === 'fold') S.fold++;
  else {
    S.one[id] = true;
    if (it.kind === 'chute') { S.chute = CHUTES.findIndex(c => c.id === id); if (S.cranes) match(S); }
  }
  return true;
}
// The Great Frog: unlocked once the past comes up through the floor. Feed it everything you have.
export const greatOpen = S => S.chute >= 7 || S.greatOn;
export const nextCrease = S => CREASES[S.great] || null;
export const canFeed = S => greatOpen(S) && !S.ended && S.great < GREAT && S.frogs >= CREASES[S.great].cost;
export function feed(S) {
  if (!canFeed(S)) return false;
  S.greatOn = true;
  S.frogs -= CREASES[S.great].cost;
  S.great++;
  return true;
}
export const greatDone = S => S.great >= GREAT;

// A letter sorted by hand: right pigeonhole folds frogs, wrong one gets spat back on the belt.
export function handSort(S, type) {
  const n = handPer(S) * thick(S, type);
  S.frogs += n; S.total += n; S.hand++;
  return n;
}
export function shredHand(S) { S.shred += 1; }

// What's for sale: everything revealed so far (once seen, an upgrade stays until bought).
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) {
    if (S.seen.includes(it.id)) continue;
    let show;
    if (it.kind === 'crane') show = S.one.door;
    else if (it.kind === 'fold') show = S.hand >= 10;
    else if (it.kind === 'chute') show = CHUTES.findIndex(c => c.id === it.id) === S.chute + 1 && (S.total >= it.cost * 0.3 || it.id === 'door' && S.hand >= 4);
    else if (it.id === 'lick') show = S.hand >= 2;
    else if (it.id === 'hat') show = S.hand >= 6;
    else if (it.id === 'clip') show = S.chute >= 2;
    else show = S.total >= it.cost * 0.3 && S.cranes > 0;
    if (show) { S.seen.push(it.id); fresh.push(it.id); }
  }
  return fresh;
}
export const items = S => ITEMS.filter(i => S.seen.includes(i.id) && (i.kind === 'crane' || i.kind === 'fold' || !S.one[i.id]));
export const bought = S => ITEMS.filter(i => S.one[i.id]);

// Rushes start once cranes are on the floor. Returns 'warn' | 'start' | 'end' when something happens.
export function tickRush(S, dt, rnd = Math.random) {
  if (S.ended || !S.cranes || !S.one.door) return null;
  if (S.rushNext == null) S.rushNext = 20;
  if (S.rush) {
    S.rush.t -= dt;
    if (!S.rush.on && S.rush.t <= 0) { S.rush.on = true; S.rush.t = RUSH_LEN; return 'start'; }
    if (S.rush.on && S.rush.t <= 0) { S.rush = null; S.rushNext = RUSH_GAP[0] + rnd() * (RUSH_GAP[1] - RUSH_GAP[0]); return 'end'; }
    return null;
  }
  S.rushNext -= dt;
  if (S.rushNext <= 0) {
    const n = types(S);
    let type = Math.floor(rnd() * n);
    if (type === S.lastRush) type = (type + 1) % n;
    S.lastRush = type;
    S.rush = { type, on: false, t: RUSH_WARN };
    return 'warn';
  }
  return null;
}

export function tick(S, dt) {
  if (S.ended) return { frogs: 0, lost: 0 };
  S.t += dt;
  const f = flow(S);
  S.frogs += f.frogs * dt; S.total += f.frogs * dt; S.shred += f.lost * dt;
  return { frogs: f.frogs * dt, lost: f.lost * dt, f };
}

// The night clock: 11 P.M. at the first letter, dawn (6 A.M.) when the Great Frog is fed.
export function clock(S) {
  const p = S.ended ? 1 : Math.min(0.995, 0.75 * Math.min(1, Math.log10(1 + S.total) / 16.5) + 0.25 * (S.great / GREAT));
  return 23 * 60 + p * 7 * 60;
}

// Numbers, the way a noir terminal says them.
const NAMES = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion'];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
  if (n < 1e6) return Math.floor(n).toLocaleString('en-US');
  const k = Math.min(NAMES.length - 1, Math.floor(Math.log10(n) / 3));
  const v = n / Math.pow(10, k * 3);
  return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v)} ${NAMES[k]}`;
}
export function phase(S) {
  if (S.ended) return 'end';
  if (S.greatOn) return 'frog';
  if (S.rush && S.rush.on) return 'rush';
  return S.cranes ? 'floor' : 'desk';
}
