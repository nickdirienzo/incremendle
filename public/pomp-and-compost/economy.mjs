// Pomp and Compost: the rules. The page and the pacing sim (sim.mjs) both import this.
// Rule One of the palace household (1702): nothing belonging to the Crown shall leave the palace. Two centuries
// of royal socks fill the attic, so Mr Ormsby, Keeper of the Household Rules, drops them out of the attic windows
// into the kitchen garden (still the palace). The trumpet catches them in its bell before a tourist can pocket
// one, and composts them: soil in the palace garden never left the palace. Ormsby only drops a sock when the heap
// has room for it. Phase 1: catalogue all twelve kinds for the Household Book. Handing it in wakes Rule Two
// (what the Crown has paired, let no one part): from then on socks wait on a washing line for their partner and
// only pairs go in the heap. When the attic's forty trunks are empty, King Humphrey's own trunk is the showdown.

// ---------- The socks ----------
// at: the trunk where Ormsby first finds this kind. col/alt: chalk colours. pat: how it's drawn.
export const KINDS = [
  { id: 'monday', name: 'The Monday Sock', at: 0, col: '#ab947a', alt: '#ffffff', pat: 'plain',
    line: 'Grey, by statute. King Humphrey wore it on Mondays, and its twin on the other six days, to keep things fair.' },
  { id: 'hunting', name: 'The Hunting Sock', at: 0, col: '#cd683d', alt: '#e3c896', pat: 'tweed',
    line: 'Tweed, with a pocket for a biscuit. The royal hunt has caught nothing since 1803. The biscuit is still there.' },
  { id: 'bed', name: 'The Bed Sock', at: 0, col: '#f68181', alt: '#fca790', pat: 'fluffy',
    line: 'Worn to bed, against draughts, by a queen who had the palace heated and kept the windows open on principle.' },
  { id: 'argyle', name: 'The Argyle', at: 1, col: '#4d9be6', alt: '#fbff86', pat: 'argyle',
    line: 'Knitted for the Diplomatic Golf Tournament of 1888, which ended in a treaty and a lost ball. The ball is in the attic too.' },
  { id: 'skating', name: 'The Skating Sock', at: 2, col: '#8fd3ff', alt: '#ffffff', pat: 'snow',
    line: 'For the year the moat froze. Please note the darn on the heel: a royal fall, unrecorded by order.' },
  { id: 'christening', name: 'The Christening Sock', at: 3, col: '#eaaded', alt: '#ffffff', pat: 'lace',
    line: 'Lace, and very small. Worn once, by a prince, for eleven minutes, before he kicked it into the font.' },
  { id: 'toe', name: 'The Toe Sock', at: 5, col: '#91db69', alt: '#1ebc73', pat: 'toes',
    line: 'Five toes. A scandal in 1840. The court was divided, roughly into five.' },
  { id: 'football', name: 'The Football Sock', at: 7, col: '#e83b3b', alt: '#ffffff', pat: 'hoops',
    line: 'Hooped, muddy, number six. A centre-half prince who was never once booked, because nobody dared.' },
  { id: 'holey', name: 'The Holey Sock', at: 9, col: '#a884f3', alt: '#3e3546', pat: 'hole',
    line: 'Note the hole, the size of a small duchy. It was kept, as all things are kept. Rule One.' },
  { id: 'message', name: 'The Sock with a Message', at: 11, col: '#fbb954', alt: '#e83b3b', pat: 'message',
    line: 'Embroidered, in a careful hand: HELP, I AM IN THE ATTIC. The palace has no record of who. The sock is fine now.' },
  { id: 'stocking', name: 'The Christmas Stocking', at: 13, col: '#c32454', alt: '#ffffff', pat: 'stocking',
    line: 'Enormous. Hung each year for a king who asked, each year, for fewer socks.' },
  { id: 'coronation', name: 'The Coronation Sock', at: 15, col: '#fbff86', alt: '#fbb954', pat: 'gold',
    line: 'Gold thread, ermine cuff. Worn under the robes at three coronations, and seen at none of them. Until now.' },
];
export const KIND = Object.fromEntries(KINDS.map((k, i) => [k.id, i]));

// ---------- The attic ----------
export const TRUNKS = 40;
export const BOOK_TRUNK = 16;   // Ormsby opens no trunk past this one until the Household Book is handed in
// Socks in trunk i (1-based): the early ones are small.
export const trunkSize = i => Math.round(40 + i * 2);
const TRUNK_END = [0];
for (let i = 1; i <= TRUNKS; i++) TRUNK_END[i] = TRUNK_END[i - 1] + trunkSize(i);
export const ATTIC_TOTAL = TRUNK_END[TRUNKS];
// Which trunk Ormsby is emptying, how many socks are left in it.
export function trunk(S) {
  let i = 1;
  while (i < TRUNKS && S.dropped >= TRUNK_END[i]) i++;
  const done = S.dropped >= TRUNK_END[TRUNKS];
  return { n: i, left: Math.max(0, TRUNK_END[i] - S.dropped), size: trunkSize(i), emptied: done ? TRUNKS : i - 1, done };
}
export const atticFrac = S => Math.min(1, S.dropped / ATTIC_TOTAL);
// Ormsby keeps to the book: past trunk BOOK_TRUNK he only drops odds and ends (the strays) until it's in.
export const holdingForBook = S => S.phase === 1 && S.dropped >= TRUNK_END[BOOK_TRUNK];

// ---------- The shop ----------
// kind: 'lv' (levels), 'one' (once, real), 'odd' (silly, for the picture). phase: the phase it shows up in.
// show: soil seen (total) before it is revealed.
export const ITEMS = [
  { id: 'worms', kind: 'lv', name: 'Worms', costs: [3, 5, 7, 9, 11, 13, 16, 19, 22, 25, 28, 31, 35, 39, 43, 47, 52, 56, 61, 66, 71, 76], show: 2, phase: 1,
    desc: 'Red brandling worms for the heap. They eat socks. They have eaten, in their time, a great deal worse.',
    joke: 'A worm. It has been given a name (Clive) and a small chalk crown, which the audio guide asks you to ignore.' },
  { id: 'footman', kind: 'lv', name: 'A Footman', costs: [5, 8, 12, 16, 21, 26, 32, 38, 45, 52, 60, 68, 77, 86], show: 4, phase: 1,
    desc: 'Lend Mr Ormsby a footman for the attic. More hands on the trunks: more socks out of the windows, and another window open.',
    joke: 'A footman, in livery, holding a sock at arm’s length, out of a window, with dignity. It is in his contract.' },
  { id: 'bell', kind: 'lv', name: 'A Wider Bell', costs: [6, 12, 18, 26, 34, 44, 54, 66, 78], show: 4, phase: 1,
    desc: 'Tape another cone round the trumpet’s bell. A wider mouth catches socks that would have gone to the tourists.',
    joke: 'The bell now flares like a gramophone. The trumpet holds its note a little prouder. Visitors are asked not to shout into it.' },
  { id: 'bins', kind: 'lv', name: 'Compost Bin', costs: [8, 12, 16, 21, 26, 32, 38, 45, 52, 60, 68, 77], show: 6, phase: 1,
    desc: 'Another slatted bin for the heap. Ormsby only drops a sock when the heap has room for it: more room, less waiting.',
    joke: 'A new bin, slatted, in oak from a royal barge that sank politely in 1911.' },
  { id: 'post', kind: 'odd', name: 'Stop 14a', cost: 7, show: 6, phase: 1,
    desc: 'A numbered post for the audio-guide tour, beside the compost heap. There is no recording for it yet.',
    joke: 'Stop 14a. Press play. (Recording pending.) The audio guide regrets that it has nothing to say about the compost heap at this time.' },
  { id: 'gnome', kind: 'odd', name: 'Crowned Gnome', cost: 12, show: 9, phase: 1,
    desc: 'A garden gnome, wearing a crown, beside the heap. For no reason the audio guide is prepared to discuss.',
    joke: 'Tourists photograph the gnome. Several have curtsied. The trumpet, beside it, catches socks and is not photographed. It prefers that.' },
  { id: 'glass', kind: 'one', name: 'Magnifying Glass', cost: 18, show: 12, phase: 1,
    desc: 'For the Household Book. Kinds of sock not yet in the catalogue glow as they fall, and fall a little slower while you look.',
    joke: 'The glass is from the Royal Observatory, where it was used to look at the moon. It says this is a step down. It is not wrong.' },
  { id: 'portrait', kind: 'odd', name: 'The King’s Portrait', cost: 22, show: 16, phase: 1,
    desc: 'King Humphrey the Tidy, in oils, rehung on the garden wall where he can see the heap. He is holding a trumpet.',
    joke: 'Please note the trumpet in the portrait. Please note the trumpet in the garden. The audio guide draws no conclusions.' },
  { id: 'umbrella', kind: 'lv', name: 'Upside-down Brolly', costs: [20, 25, 31, 38, 46, 54, 63, 72, 84], show: 18, phase: 1,
    desc: 'An umbrella from the lost property, opened and stuck in the lawn upside down. It catches socks on its own, and passes them on.',
    joke: 'A black umbrella, upside down, full of socks. In the palace, this is known as an umbrella stand.' },
  { id: 'rope', kind: 'one', name: 'Velvet Rope', cost: 30, show: 26, phase: 1,
    desc: 'A velvet rope between the lawn and the tour. Half the socks you miss land on the wrong side of it, and a footman takes them back up.',
    joke: 'Red velvet, on brass posts. The tourists stand behind it, very properly, with their hands out.' },
  { id: 'sign', kind: 'odd', name: 'Polite Sign', cost: 16, show: 14, phase: 1,
    desc: 'A sign on the path, in the palace’s best chalk: THE GIFT SHOP DOES NOT SELL SOCKS. PLEASE RETURN YOURS.',
    joke: 'Nobody has returned a sock. One visitor returned a mitten, which is now, under Rule One, Crown property.' },
  // After Rule Two.
  { id: 'pegs', kind: 'lv', name: 'Clothes Pegs', costs: [6, 9, 13, 18, 24, 30, 37, 44, 52, 61], show: 0, phase: 2,
    desc: 'More pegs on the washing line. Odd socks wait there for their partner; when it’s full, the oldest is sent back up to the attic.',
    joke: 'Wooden pegs, the old-fashioned kind, with no spring. The palace does not trust springs.' },
  { id: 'labels', kind: 'lv', name: 'Label the Trunks', costs: [12, 19, 26, 35, 46, 57, 70], show: 4, phase: 2,
    desc: 'Chalk a label on every trunk, so Ormsby can find partners. More of the socks he drops match one already on the line.',
    joke: 'Ormsby has written MATCHING on a trunk in capital letters. It is the most emotion he has shown since 1987.' },
  { id: 'crest', kind: 'odd', name: 'By Appointment', cost: 26, show: 10, phase: 2,
    desc: 'A Royal Warrant crest for the front of the heap: BY APPOINTMENT TO HIS MAJESTY. Supplier of compost.',
    joke: 'The trumpet ordered the crest itself. Nobody asked which Majesty. The trumpet did not say.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export function defaults() {
  const lv = {}, one = {};
  for (const it of ITEMS) { if (it.kind === 'lv') lv[it.id] = 0; else one[it.id] = false; }
  return {
    phase: 1, soil: 0, soilSeen: 0, soilTotal: 0, heap: 0, pairsHeap: 0, dropped: 0, caught: 0, souvenirs: 0,
    cat: {}, paired: {}, line: [], lv, one, seen: {}, t: 0, savedAt: 0, ended: false, bookIn: false,
    sd: null, boughtOpen: false, started: false, soilAtRule: 0,
  };
}
export function load(raw) {
  const S = defaults();
  if (!raw || typeof raw !== 'object') return S;
  for (const k of Object.keys(S)) if (raw[k] !== undefined) {
    if (k === 'lv' || k === 'one') Object.assign(S[k], raw[k]); else S[k] = raw[k];
  }
  if (!Array.isArray(S.line)) S.line = [];
  return S;
}

// ---------- Rates ----------
export const lv = (S, id) => S.lv[id] ?? (S.one[id] ? 1 : 0);
export const max = it => it.kind === 'lv' ? it.costs.length : 1;
// Socks a second Ormsby and his footmen drop (when the heap has room).
export const dropRate = S => 0.25 + 0.06 * S.lv.footman;
// Attic windows open: Ormsby's, and one more for every two footmen.
export const windows = S => Math.min(4, 1 + Math.ceil(S.lv.footman / 4));
// Socks a second the worms turn into soil.
export const compostRate = S => 0.18 + 0.042 * S.lv.worms;
export const heapCap = S => 6 + 4 * S.lv.bins;
export const lineCap = S => 4 + 2 * S.lv.pegs;
export const bellWidth = S => 46 + 8 * S.lv.bell;        // in scene pixels (the scene is 720 wide)
export const umbrellas = S => S.lv.umbrella;
// Chance a sock dropped after Rule Two partners one already on the line.
export const matchChance = S => S.line.length ? 0.3 + 0.07 * S.lv.labels : 0;
export const soilPerSock = 1;
export const catalogued = S => KINDS.filter(k => S.cat[k.id]).length;
export const pairedCount = S => KINDS.filter(k => S.paired[k.id]).length;
export const unlockedKinds = S => KINDS.filter(k => trunk(S).n > k.at || (k.at === 0)).map(k => k.id);
export const bookReady = S => S.phase === 1 && catalogued(S) === KINDS.length;
export const atticEmpty = S => S.phase === 2 && S.dropped >= ATTIC_TOTAL;

// Room in the heap for the next sock Ormsby drops, counting the socks already in the air (`inFlight`).
// After Rule Two a catch can put a pair in at once, so he keeps two places free.
export function room(S, inFlight = 0) {
  if (S.phase === 2) return S.heap + 2 <= heapCap(S);
  return S.heap + inFlight < heapCap(S);
}

// Which kind Ormsby finds next. rng: () => [0, 1).
export function pickKind(S, rng = Math.random) {
  const open = unlockedKinds(S);
  if (S.phase === 2 && S.line.length && rng() < matchChance(S)) return S.line[Math.floor(rng() * S.line.length)];
  const w = open.map(id => {
    if (S.phase === 1 && !S.cat[id]) return holdingForBook(S) ? 10 : KINDS[KIND[id]].at === trunk(S).n - 1 ? 4 : 2.5;
    return 1;
  });
  let r = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < open.length; i++) { r -= w[i]; if (r <= 0) return open[i]; }
  return open[open.length - 1];
}

// A sock leaves the attic. Returns whether it counted against the trunks: strays shuffled while Ormsby waits
// for the Household Book don't.
export function dropped(S) {
  if (holdingForBook(S) || S.dropped >= ATTIC_TOTAL) return false;
  S.dropped++;
  return true;
}

// The trumpet (or an umbrella) catches a sock. Returns what happened.
export function caught(S, kind) {
  S.caught++;
  const out = { kind, fresh: false, pair: false, line: false, bumped: null };
  if (S.phase === 1) {
    S.heap++;
    if (!S.cat[kind]) { S.cat[kind] = true; out.fresh = true; }
    return out;
  }
  // Rule Two: partner on the line? Then both go in the heap together.
  const at = S.line.indexOf(kind);
  if (at >= 0) {
    S.line.splice(at, 1); S.heap += 2; out.pair = true;
    if (!S.paired[kind]) { S.paired[kind] = true; out.fresh = true; }
    return out;
  }
  S.line.push(kind); out.line = true;
  if (S.line.length > lineCap(S)) { out.bumped = S.line.shift(); S.dropped = Math.max(0, S.dropped - 1); }
  return out;
}
// A sock hits the path. With the velvet rope, half come back to the attic; the rest are souvenirs.
export function missed(S, counted = true, rng = Math.random) {
  if (S.one.rope && rng() < 0.5) { if (counted) S.dropped = Math.max(0, S.dropped - 1); return 'rope'; }
  S.souvenirs++;
  return 'souvenir';
}

// The heap at work: socks into soil.
export function tick(S, dt) {
  if (S.ended) return 0;
  S.t += dt;
  if (S.heap <= 0) return 0;
  const n = Math.min(S.heap, compostRate(S) * dt);
  S.heap -= n;
  if (S.heap < 1e-6) S.heap = 0;
  const soil = n * soilPerSock;
  S.soil += soil; S.soilTotal += soil; S.soilSeen = Math.max(S.soilSeen, S.soilTotal);
  return soil;
}

// ---------- Buying ----------
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'lv') return it.costs[Math.min(S.lv[id], it.costs.length - 1)];
  return it.cost;
}
export const maxed = (S, id) => { const it = BY_ID[id]; return it.kind === 'lv' ? S.lv[id] >= it.costs.length : !!S.one[id]; };
export const canBuy = (S, id) => !maxed(S, id) && S.soil >= cost(S, id) && !S.ended && S.phase < 3;
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  S.soil -= cost(S, id);
  const it = BY_ID[id];
  if (it.kind === 'lv') S.lv[id]++; else S.one[id] = true;
  return true;
}
// Revealed: phase reached and enough soil seen in this phase. Once seen, stays until bought.
export function reveal(S) {
  const fresh = [];
  if (S.phase >= 3 || S.ended) return fresh;
  for (const it of ITEMS) {
    if (S.seen[it.id] || it.phase > S.phase) continue;
    const seen = it.phase === 2 ? S.soilTotal - (S.soilAtRule ?? 0) : S.soilSeen;
    if (seen >= it.show) { S.seen[it.id] = true; fresh.push(it.id); }
  }
  return fresh;
}
export const items = S => S.phase >= 3 || S.ended ? [] : ITEMS.filter(it => S.seen[it.id] && !maxed(S, it.id));
export const bought = S => ITEMS.filter(it => it.kind !== 'lv' && S.one[it.id]);

// ---------- The rule change, the showdown ----------
export function handIn(S) {
  if (!bookReady(S)) return false;
  S.phase = 2; S.bookIn = true; S.soilAtRule = S.soilTotal; S.line = [];
  return true;
}
// King Humphrey's own trunk: a pair of every kind, shuffled, partners never far apart.
export function startShowdown(S, rng = Math.random) {
  if (!atticEmpty(S)) return false;
  const q = [];
  const order = KINDS.map(k => k.id).sort(() => rng() - 0.5);
  for (let i = 0; i < order.length; i += 2) {
    const a = order[i], b = order[i + 1] || order[0];
    q.push(...[a, b, a, b].sort(() => rng() - 0.5));
  }
  S.phase = 3; S.sd = { q, pairs: 0, will: 0 };
  S.line = []; S.heap = 0;
  return true;
}
export const SHOWDOWN_PAIRS = KINDS.length;

// ---------- Away ----------
// The umbrellas keep catching while you're out, at 30% pace, and Ormsby only drops what they can reach.
// Capped at two hours. After Rule Two the umbrellas' socks still need partners: a share of them pair up.
export const OFFLINE_CAP = 2 * 3600, OFFLINE_RATE = 0.3;
export const umbrellaShare = S => Math.min(0.75, 0.075 * S.lv.umbrella);
export function offline(S, secs) {
  if (S.ended || S.phase >= 3 || secs < 60) return null;
  const t = Math.min(secs, OFFLINE_CAP) * OFFLINE_RATE;
  const left = S.phase === 1 ? Math.max(0, TRUNK_END[BOOK_TRUNK] - S.dropped) : ATTIC_TOTAL - S.dropped;
  let socks = Math.floor(Math.min(Math.min(dropRate(S), compostRate(S)) * umbrellaShare(S) * t, left));
  S.dropped += socks;
  if (S.phase === 2) socks = 2 * Math.floor(socks * (0.3 + 0.07 * S.lv.labels) / 2);
  // What was already in the heap finishes rotting too.
  const fromHeap = Math.min(S.heap, compostRate(S) * t);
  const soil = socks * soilPerSock + fromHeap;
  S.caught += socks; S.heap -= fromHeap;
  S.soil += soil; S.soilTotal += soil; S.soilSeen = Math.max(S.soilSeen, S.soilTotal);
  return { secs, socks, soil: Math.floor(soil) };
}

export const fmt = n => Math.floor(n + 1e-9).toLocaleString('en-GB');
export const fmtRate = n => (n >= 10 ? n.toFixed(0) : n.toFixed(1));
