// A Coat's Worth: the rules. The page and the pacing sim (sim.mjs) both import this.
// The Alembic, in witness protection, keeps a promise to Nettle (a coat's worth of buttons) by posting
// buttons: tap to drip one and post it, postage due. Whoever opens the door pays a coin. The Marshal's
// map is wrong on purpose, so a share of the parcels end up in ditches and pay nothing; readings of the
// map (better guesses) raise the share that find a doorstep. Every hideout is its own small economy:
// its own coin, its own helpers, its own readings. When a town has seen too many buttons, the Marshal
// deals the next card. The Post's ledger has four digits: at 9,999 it is full, and the world crunches.

export const CAP = 9999;               // the ledger's four digits
export const OFFLINE_CAP = 4 * 3600;   // seconds of time away that count
export const OFFLINE_RATE = 0.04;      // helpers post at a twenty-fifth of the pace with nobody watching
export const MILESTONE = 25;           // every 25 of a helper doubles it

// The three hideouts. gossip: buttons posted from this town before the locals start to talk.
export const TOWNS = [
  { id: 'hamlet', name: 'Little Hobbling', card: 'The Teapot', num: 'IV', cover: 'a teapot at the Hobbling Arms',
    coin: 'pennies', one: 'penny', sym: 'p', gossip: 1800, acc: 0.45 },
  { id: 'fen', name: 'Murkmere', card: 'The Still', num: 'XVIII', cover: 'a still among the witches’ stills',
    coin: 'wishbones', one: 'wishbone', sym: 'w', gossip: 4000, acc: 0.35 },
  { id: 'peaks', name: 'Mount Smoulder', card: 'The Goblet', num: 'XXI', cover: 'a golden goblet in a dragon’s hoard',
    coin: 'crowns', one: 'crown', sym: 'c', gossip: Infinity, acc: 0.4 },
];

// Upgrades. kind: helper (bought many times; posts on its own), tap (more buttons per tap),
// read (a better guess at the map: more parcels find a doorstep), odd (a silly one-off).
export const ITEMS = [
  // Little Hobbling
  { id: 'pigeon', town: 0, kind: 'helper', name: 'Pigeon', rate: 0.0042, cost: 1, grow: 1.1,
    desc: 'A pigeon of low renown carries one button at a time, and mostly the right way.' },
  { id: 'postboy', town: 0, kind: 'helper', name: 'Postboy', rate: 0.02, cost: 7, grow: 1.11,
    desc: 'A boy on a fat pony, paid in buttons he is not allowed to keep.' },
  { id: 'cart', town: 0, kind: 'helper', name: 'Parish Cart', rate: 0.09, cost: 45, grow: 1.12,
    desc: 'The parish cart goes round on Tuesdays. Now it goes round on every day, calling each one Tuesday.' },
  { id: 'spout1', town: 0, kind: 'tap', name: 'Wider Spout', add: 1, cost: 12,
    desc: 'The spout, widened with a hot nail, drips fatter buttons. Postage is by weight: every button you drip pays double.',
    joke: 'And the spout was widened, and the buttons grew stout, and the tea at the Hobbling Arms tasted faintly of brass.' },
  { id: 'read1', town: 0, kind: 'read', name: 'Tuesday Is North', acc: 0.15, cost: 21,
    desc: 'The Marshal’s map has the compass rose labelled with the days of the week. A reading: Tuesday is north.',
    joke: 'The postboy turns the map so Tuesday is up. Two parcels in three now meet a door.' },
  { id: 'read2', town: 0, kind: 'read', name: 'The River Is a Road', acc: 0.15, cost: 66,
    desc: 'On the map, the river is labelled “Road” and the road is labelled “Probably a River”. Read it the other way.',
    joke: 'Fewer buttons drown. The ducks of Little Hobbling are disappointed; they had started a collection.' },
  { id: 'cosy', town: 0, kind: 'odd', name: 'Tea Cosy', cost: 6,
    desc: 'A knitted cosy, so it looks more like a teapot. Does nothing.',
    joke: 'The landlady knits a cosy with a hole for the spout and one for the coil. “Lovely teapot,” say the regulars. The disguise is complete.' },
  // Murkmere
  { id: 'heron', town: 1, kind: 'helper', name: 'Heron', rate: 0.01, cost: 2, grow: 1.1,
    desc: 'A grey heron stalks the reeds with a button in its beak and an air of great importance.' },
  { id: 'toad', town: 1, kind: 'helper', name: 'Ferry-Toad', rate: 0.05, cost: 12, grow: 1.11,
    desc: 'A toad the size of a rowing boat ferries parcels across the mere. Fare: one wishbone, and a respectful tone.' },
  { id: 'wisp', town: 1, kind: 'helper', name: 'Wisp Lantern', rate: 0.22, cost: 78, grow: 1.12,
    desc: 'A will-o’-the-wisp who used to lead travellers astray, now leading parcels astray, but on purpose and in the right direction.' },
  { id: 'spout2', town: 1, kind: 'tap', name: 'Copper Coil', add: 1, cost: 24,
    desc: 'A second coil, borrowed from a witch who has eleven. The buttons come out heavier still: every button you drip pays one more.',
    joke: 'The witches lend a coil and ask no questions. Witches never ask questions; they already know.' },
  { id: 'read3', town: 1, kind: 'read', name: 'Wring Out the Map', acc: 0.2, cost: 36,
    desc: 'The fen is damp, and the map’s ink has run. Wring it out and read the drips.',
    joke: 'The ink runs back where it was, more or less. The fen now has a north again, and it is the wet side.' },
  { id: 'read4', town: 1, kind: 'read', name: 'Cross Out “Here Be Dragons”', acc: 0.2, cost: 132,
    desc: 'The whole east of the map just says HERE BE DRAGONS. Cross it out and send the parcels through.',
    joke: 'There be no dragons, says the Alembic, crossing it out. The Marshal reads the map over its shoulder and goes very quiet, and then very interested.' },
  { id: 'hat', town: 1, kind: 'odd', name: 'Pointy Hat', cost: 9,
    desc: 'Every still in Murkmere wears a pointy hat. Does nothing, except fit in.',
    joke: 'Among a hundred bubbling stills in a hundred pointy hats, one more is no one at all. The witches nod at it in the mornings.' },
  { id: 'tailor', town: 1, kind: 'odd', name: 'The Fen Tailor', cost: 30,
    desc: 'A frog tailor, consulted on coats. Does nothing.',
    joke: '“How many buttons does a coat take?” “Depends on the coat.” “An heroic coat.” The tailor shrugs. “Then all of them, I suppose.” The Alembic posts faster.' },
  // Mount Smoulder
  { id: 'bat', town: 2, kind: 'helper', name: 'Bat', rate: 0.019, cost: 2, grow: 1.1,
    desc: 'A cave bat. It can carry one button and has opinions about the dark, all of them positive.' },
  { id: 'griffin', town: 2, kind: 'helper', name: 'Griffin', rate: 0.09, cost: 18, grow: 1.11,
    desc: 'Half eagle, half lion, all post. Insists on a cap with a badge.' },
  { id: 'wyrm', town: 2, kind: 'helper', name: 'Cousin Wyrm', rate: 0.4, cost: 120, grow: 1.12,
    desc: 'The dragon’s second cousin, who has never hoarded anything and is happy to carry mailbags instead.' },
  { id: 'spout3', town: 2, kind: 'tap', name: 'Gold-Leaf Spout', add: 2, cost: 48,
    desc: 'A spout beaten from a crown of the hoard. Gold-heavy buttons: every button you drip pays two more.',
    joke: 'The dragon lends a crown to be beaten into a spout. “I want it back,” she says, “as a goblet.” The Alembic, as a goblet, agrees.' },
  { id: 'read5', town: 2, kind: 'read', name: 'Ask the Dragon', acc: 0.2, cost: 72,
    desc: 'Dragons know every road; they’ve burned most of them. Ask her which way the map really goes.',
    joke: '“That map,” says the dragon, “was drawn by someone who has never been anywhere.” She draws the roads on it with a claw. Some of them are still smoking.' },
  { id: 'read6', town: 2, kind: 'read', name: 'Hold It to the Fire', acc: 0.2, cost: 270,
    desc: 'Some maps have a second map in lemon juice. Hold this one to dragonfire and see.',
    joke: 'Brown letters rise out of the paper: the real names of every town, in the Marshal’s handwriting, and in the margin, “for emergencies.”' },
  { id: 'polish', town: 2, kind: 'odd', name: 'Gold Polish', cost: 15,
    desc: 'A coat of gold polish, so the Alembic passes for a goblet. Does nothing.',
    joke: 'Polished gold, the Alembic sits in the hoard and is counted by the dragon every night. It has never been so admired. It hates it a little.' },
  { id: 'heap', town: 2, kind: 'odd', name: 'A Spare Heap', cost: 96,
    desc: 'A heap of spare buttons, kept in case the coat needs a few more. Does nothing.',
    joke: 'The Alembic keeps a heap of spares beside it in the hoard. In case. You can never be sure how many reached her. That is the whole trouble.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export function defaults() {
  return {
    v: 1, t: 0, town: 0, ledger: 0, posted: [0, 0, 0], coins: 0, earned: [0, 0, 0],
    astray: 0, taps: 0, lv: {}, one: {}, seen: {}, due: false, full: false, ended: false,
    savedAt: 0, boughtOpen: false,
  };
}
export function load(raw) {
  const S = Object.assign(defaults(), raw || {});
  S.lv = Object.assign({}, S.lv); S.one = Object.assign({}, S.one); S.seen = Object.assign({}, S.seen);
  S.posted = [0, 1, 2].map(i => (S.posted && S.posted[i]) || 0);
  S.earned = [0, 1, 2].map(i => (S.earned && S.earned[i]) || 0);
  if (S.ended) { S.full = true; S.ledger = CAP; S.town = 2; }
  return S;
}

export const town = S => TOWNS[S.town];
export const lv = (S, id) => S.lv[id] || 0;
export const has = (S, id) => !!S.one[id];
export const mult = n => Math.pow(2, Math.floor(n / MILESTONE));
// One helper kind's output, buttons per second.
export const helperRate = (S, id, n = lv(S, id)) => n * BY_ID[id].rate * mult(n);
// Everything the current town's helpers post per second.
export const autoRate = S => ITEMS.filter(i => i.town === S.town && i.kind === 'helper').reduce((s, i) => s + helperRate(S, i.id), 0);
// A tap drips one button. The spouts make it a heavier one, and postage is by weight: a tapped
// parcel that finds a door pays `weight` coins. The spout comes along to every hideout.
export const weight = S => 1 + ITEMS.filter(i => i.kind === 'tap' && S.one[i.id]).reduce((s, i) => s + i.add, 0);
// The share of parcels that find a doorstep (the rest end up in ditches, ponds and owls' nests).
export const acc = S => Math.min(0.95, town(S).acc + ITEMS.filter(i => i.kind === 'read' && i.town === S.town && S.one[i.id]).reduce((s, i) => s + i.acc, 0));
export const income = S => autoRate(S) * acc(S);   // coins per second from the helpers
export const gossip = S => S.posted[S.town];
export const quota = S => town(S).gossip;
export const phase = S => S.ended || S.full ? 'ending' : town(S).id;

// Posting: n buttons from this town, each paying w coins if it finds a door. Returns { n, paid }.
export function post(S, n, w = 1) {
  if (S.due || S.full || S.ended || n <= 0) return { n: 0, paid: 0 };
  n = Math.min(n, CAP - S.ledger, quota(S) - gossip(S));
  if (n <= 0) return { n: 0, paid: 0 };
  const a = acc(S), paid = n * a * w;
  S.ledger += n; S.posted[S.town] += n; S.coins += paid; S.earned[S.town] += paid; S.astray += n * (1 - a);
  if (S.ledger >= CAP - 1e-6) { S.ledger = CAP; S.full = true; }
  else if (gossip(S) >= quota(S) - 1e-6) S.due = true;
  return { n, paid };
}
export const tap = S => { const r = post(S, 1, weight(S)); if (r.n) S.taps++; return r; };
export function tick(S, dt) {
  if (S.ended) return { n: 0, paid: 0 };
  S.t += dt;
  return post(S, autoRate(S) * dt);
}

// Prices.
export function cost(S, id) {
  const it = BY_ID[id];
  return it.kind === 'helper' ? Math.ceil(it.cost * Math.pow(it.grow, lv(S, id))) : it.cost;
}
export const owned = (S, id) => BY_ID[id].kind === 'helper' ? false : has(S, id);
export const canBuy = (S, id) => BY_ID[id].town === S.town && !S.due && !S.full && !owned(S, id) && S.coins >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  S.coins -= cost(S, id);
  const it = BY_ID[id];
  if (it.kind === 'helper') S.lv[id] = lv(S, id) + 1; else S.one[id] = true;
  return true;
}

// An upgrade shows up once you've nearly saved for it; once shown it stays until bought.
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) {
    if (it.town !== S.town || S.seen[it.id]) continue;
    if (S.coins >= cost(S, it.id) * 0.6 || S.earned[S.town] >= it.cost * 0.6) { S.seen[it.id] = true; fresh.push(it.id); }
  }
  return fresh;
}
export const items = S => ITEMS.filter(i => i.town === S.town && S.seen[i.id] && !owned(S, i.id));
export const bought = S => ITEMS.filter(i => i.kind !== 'helper' && S.one[i.id]);

// The Marshal deals the next card: a new town, a new cover, a new coin. The ledger comes along;
// the helpers and the leftover coin stay behind (a forwarding address would lead straight to you).
export function relocate(S) {
  if (!S.due || S.town >= 2) return false;
  S.town++; S.coins = 0; S.due = false;
  return true;
}

// Time away: the helpers kept posting, slowly. Never past the gossip (the Marshal should be met in
// person) or the last button (the ledger fills with someone watching).
export function offline(S, secs) {
  if (S.ended || S.full || S.due) return null;
  const s = Math.min(OFFLINE_CAP, Math.max(0, secs));
  if (s < 30) return null;
  const want = autoRate(S) * s * OFFLINE_RATE;
  const room = Math.min(CAP - 1 - S.ledger, quota(S) - 1 - gossip(S));
  const n = Math.max(0, Math.min(want, room));
  if (n <= 0) return { secs: s, n: 0, paid: 0 };
  const a = acc(S), paid = n * a;
  S.ledger += n; S.posted[S.town] += n; S.coins += paid; S.earned[S.town] += paid; S.astray += n * (1 - a);
  return { secs: s, n, paid };
}

export const fmt = n => Math.floor(n).toLocaleString('en-US');
export const ledgerDigits = S => String(Math.floor(S.ledger)).padStart(4, '0');
