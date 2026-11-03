// Gilda's Last Card: the rules. Pure functions on a plain save object, shared by the game and sim.mjs.
//
// A tin soldier on leave folds frogs from tin-foil sweet wrappers, melts two alike into one bigger
// frog, and sells them at the Paper Fair for buttons. Gilda, the fortune-telling automaton, sets the
// fair's prices by dealing tarot cards: each card moves the price of the three bands of sizes. Every
// part he fits lets her see one card further ahead. With the last cog in, she will turn her last
// card for anyone who can keep still for one whole reading.

export const T = {
  slots: 16, slotsPer: 4,         // the table: 16 cards, +4 per Wider Table
  deal: 30,                       // seconds per card
  still: 30,                      // one whole reading, for the finale
  drift: 3,                       // seconds for prices to settle on a new card
  haggle: 0.25,                   // sale price per Haggling level
  ratio: 3.5,                     // price per size: two melted into one are worth 75% more
};

// Twelve sizes, base price 3^(size-1): two melted into one is worth half again as much, at base.
export const SIZES = [
  'Pip Frog', 'Hopper', 'Croaker', 'Puddler', 'Bullfrog', 'Pond Squire',
  'Lily Baron', 'Marsh Duke', 'Frog Prince', 'Frog King', 'Frog Emperor', 'Great Frog',
];
export const MAX = SIZES.length;
export const base = t => Math.round(Math.pow(T.ratio, t - 1));
export const band = t => (t <= 4 ? 0 : t <= 8 ? 1 : 2);
export const BANDS = ['Small', 'Middling', 'Great'];
export const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII',
  'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

// The Major Arcana, I to XXI. Each sets a price for [small, middling, great] frogs.
// (There should be twenty-two. Nobody at the fair has ever seen card 0.)
export const CARDS = [
  null,
  { name: 'The Magician', m: [1, 1.8, 1], say: 'a trick of the hands: middling frogs are wanted' },
  { name: 'The High Priestess', m: [1.4, 0.8, 1.4], say: 'she keeps her secrets, and her middling frogs' },
  { name: 'The Empress', m: [1.8, 1, 0.8], say: 'small things, well loved' },
  { name: 'The Emperor', m: [0.8, 1, 1.9], say: 'great frogs for great folk' },
  { name: 'The Hierophant', m: [1, 1, 1], say: 'everything at its proper price, and no nonsense' },
  { name: 'The Lovers', m: [1.5, 1.5, 0.7], say: 'frogs for giving, not for showing' },
  { name: 'The Chariot', m: [0.7, 1.2, 1.7], say: 'onward, and bigger' },
  { name: 'Strength', m: [0.8, 1.8, 1.2], say: 'sturdy middling frogs' },
  { name: 'The Hermit', m: [2.2, 0.6, 0.6], say: 'something small, to keep by the lamp' },
  { name: 'Wheel of Fortune', m: null, say: 'round and round: anything might be worth anything' },
  { name: 'Justice', m: [1.2, 1.2, 1.2], say: 'fair weights, fair prices' },
  { name: 'The Hanged Man', m: [1.7, 1.2, 0.7], say: 'all the world upside down: the small fetch more' },
  { name: 'Death', m: [0.7, 2, 0.7], say: 'not what you think: only change, and middling frogs' },
  { name: 'Temperance', m: [1.1, 1.1, 1.1], say: 'a little of everything' },
  { name: 'The Devil', m: [0.5, 0.8, 2.3], say: 'greed: the great frogs, and only the great' },
  { name: 'The Tower', m: [0.45, 0.45, 0.45], say: 'everything falls down' },
  { name: 'The Star', m: [1.5, 1.5, 1.5], say: 'hope, and good prices' },
  { name: 'The Moon', m: [2, 1, 0.5], say: 'small frogs by moonlight' },
  { name: 'The Sun', m: [0.8, 1.3, 2.2], say: 'great frogs shine' },
  { name: 'Judgement', m: [1.3, 0.7, 1.6], say: 'the smallest and the greatest are called' },
  { name: 'The World', m: [2, 2, 2], say: 'everything, everywhere, at twice the price' },
];
// While he keeps still for the last reading, the fair goes wild (to tempt him).
export const STILL_M = [3, 3, 3];

// Gilda's parts, in order. The goal meter, not shop items. Each lets her see one card further.
export const PARTS = [
  { id: 'eye1', name: 'a Glass Eye', price: 20, desc: 'Gilda sees the next card before she deals it.', joke: 'Her left eye goes in with a click. She blinks it at you, slowly, which is worse than not blinking at all.' },
  { id: 'eye2', name: 'her Other Eye', price: 1200, desc: 'Gilda sees two cards ahead.', joke: 'Two eyes. She looks at the soldier, then at the deck, then at the soldier again.' },
  { id: 'specs', name: 'Spectacles', price: 25000, desc: 'Gilda sees three cards ahead.', joke: 'Gold wire, a little bent. "Ah," says Gilda, who has not said anything in a hundred years. "Ah."' },
  { id: 'ball', name: 'a Crystal Ball', price: 800000, desc: 'Gilda sees four cards ahead.', joke: 'It was a doorknob once. It is a crystal ball now. Things are what they are used for.' },
  { id: 'cog', name: 'the Last Cog', price: 6000000, desc: 'Gilda is mended. She will turn her last card, for anyone who can keep still for one whole reading.', joke: 'The last cog turns. Her hand, which has held one card for a hundred years, begins to open.' },
];
export const forecast = S => Math.min(S.parts, 4);

export const UPGRADES = [
  // Real upgrades.
  { id: 'doll', name: 'Paper Apprentice', max: 10, price: L => Math.round(25 * Math.pow(2.6, L)),
    desc: 'A paper doll folds frogs from the sweet tin for you.', joke: 'She is cut from a birthday card and still says HAPPY on one side. She folds with great care and no opinions.' },
  { id: 'wrap', name: 'Bigger Wrappers', max: 5, price: L => [150, 2500, 30000, 300000, 2500000][L],
    desc: 'New frogs fold one size bigger.', joke: 'The wrappers from the very best chocolates. Somebody upstairs has been having a lovely time.' },
  { id: 'moth', name: 'Candle Moth', max: 8, price: L => Math.round(120 * Math.pow(3.4, L)),
    desc: 'A moth who loves the candle melts the smallest pair on the table for you.', joke: 'She does not want the frogs. She wants to be near the flame. The frogs are an excuse.' },
  { id: 'table', name: 'Wider Table', max: 2, price: L => [500, 25000][L],
    desc: 'Four more cards on the table, for four more frogs.', joke: 'A second card table, pushed against the first. The wobble is on the left now.' },
  { id: 'fingers', name: 'Nimble Fingers', max: 3, price: L => [60, 2000, 50000][L],
    desc: 'Each tap on the sweet tin folds one more frog.', joke: 'Tin fingers do not bend. He folds with his whole arm, like a windmill, and it works.' },
  { id: 'haggle', name: 'Haggling', max: 8, price: L => Math.round(800 * Math.pow(3, L)),
    desc: 'Every frog sells for more.', joke: 'He learns to say "Hm." and look at the ceiling. The paper folk find this very worrying.' },
  { id: 'barrow', name: 'A Barrow', price: 3000,
    desc: 'Sell every frog of one size at once.', joke: 'A matchbox on cotton-reel wheels. It squeaks on the left, like everything at the fair.' },
  // Silly one-offs (they plant the ending).
  { id: 'pass', name: 'Leave Pass, Stamped', price: 15, silly: true,
    desc: 'Proof of leave. Does nothing.', joke: 'SEVEN DAYS LEAVE. RETURN TO THE MANTELPIECE AT ATTENTION. He has never been anything but at attention. He is not sure he knows how to stop.' },
  { id: 'guess', name: 'Your Guess, in Writing', price: 400, silly: true,
    desc: 'The sign says: name my last card and win my drawer. He writes his guess on a slip.', joke: '"THE CHARIOT," he writes, because it is the soldier\'s card, with horses and a flag. "Obviously."' },
  { id: 'count', name: 'Count the Deck', price: 9000, silly: true,
    desc: 'He counts every card Gilda deals. Does nothing.', joke: 'Twenty-one. He counts again. Twenty-one. A deck should have twenty-two. One is missing, and it is the first one.' },
  { id: 'hat', name: 'A Hat for the Frog', price: 150000, silly: true,
    desc: 'The biggest frog on the table wears a paper hat. Does nothing.', joke: 'Folded from the corner of a newspaper. The frog wears it at an angle. The frog knows.' },
  { id: 'post', name: 'Postcard Home', price: 2000000, silly: true,
    desc: 'He writes to the paper dancer on the mantelpiece. Does nothing.', joke: '"Dear Dancer, the fair is wonderful. I have melted a great many frogs. I will be home soon, standing still. Yours, steadfastly."' },
];
export const BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
export const lvl = (S, id) => S.lv[id] || 0;
export const has = (S, id) => !!S.lv[id];
export const priceOf = (S, u) => (typeof u.price === 'function' ? u.price(lvl(S, u.id)) : u.price);

// ---- helpers' rates ----
export const DOLL = [0, 6, 4.5, 3.4, 2.6, 2, 1.5, 1.1, 0.8, 0.6, 0.45];     // seconds per frog
export const MOTH = [0, 5, 3.5, 2.4, 1.6, 1.1, 0.75, 0.5, 0.35];                   // seconds per melt
export const foldSize = S => 1 + lvl(S, 'wrap');
export const slots = S => T.slots + T.slotsPer * lvl(S, 'table');
export const haggle = S => 1 + T.haggle * lvl(S, 'haggle');

// ---- a tiny seeded RNG kept in the save, so the deck resumes exactly ----
function rnd(S) {
  S.rng = (S.rng + 0x6D2B79F5) >>> 0;
  let t = S.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function wheel(S) { return [0, 1, 2].map(() => +(0.5 + rnd(S) * 1.7).toFixed(2)); }
function draw(S) {
  if (!S.deck.length) {
    const d = Array.from({ length: 21 }, (_, i) => i + 1);
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rnd(S) * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    // Never the same card twice in a row across a reshuffle.
    if (d[0] === S.card) d.push(d.shift());
    S.deck = d;
  }
  return S.deck.shift();
}
// The queue of upcoming cards (as many as she could ever see), refilled from the deck.
function fill(S) { while (S.next.length < 4) S.next.push(draw(S)); }
export function cardM(S, c, wheelM) { return CARDS[c].m || wheelM || [1, 1, 1]; }

export function newState(seed = 20261104) {
  const S = {
    v: 1, t: 0, buttons: 0, earned: 0, best: 1, made: 0, melts: 0, sold: 0,
    board: [1, 1, 1, null, 1, null, null, null, null, null, null, null, null, null, null, null],
    lv: {}, parts: 0, seen: [], revealed: [],
    rng: seed >>> 0, deck: [], next: [], card: 0, wheelM: null, nextWheel: [], dealT: 0,
    price: [1, 1, 1], dollT: 0, mothT: 0,
    still: null, ended: false, finishedAt: 0,
  };
  fill(S);
  deal(S);
  S.dealT = 20; // the first card is dealt a little sooner
  return S;
}
export function load(raw) {
  const S = newState();
  if (raw && typeof raw === 'object') Object.assign(S, raw);
  while (S.board.length < slots(S)) S.board.push(null);
  if (!S.card || !CARDS[S.card]) { S.next = []; fill(S); deal(S); }
  fill(S);
  return S;
}

export function deal(S) {
  S.card = S.next.shift();
  S.wheelM = S.card === 10 ? wheel(S) : null;
  if (!S.seen.includes(S.card)) S.seen.push(S.card);
  fill(S);
  S.dealT = T.deal;
  return S.card;
}
export function target(S) {
  if (S.still) return STILL_M;
  return cardM(S, S.card, S.wheelM);
}
export const mult = (S, t) => S.price[band(t)];
export const priceAt = (S, t) => Math.max(1, Math.round(base(t) * mult(S, t) * haggle(S)));
export const trend = (S, t) => Math.sign(+(target(S)[band(t)] - 1).toFixed(2));

// ---- actions ----
export const empty = S => S.board.findIndex(x => !x);
export const full = S => empty(S) < 0;

export function place(S, t) {
  const i = empty(S);
  if (i < 0) return -1;
  S.board[i] = t; S.made++;
  return i;
}
export function fold(S) { return place(S, foldSize(S)); }
export const perTap = S => 1 + lvl(S, 'fingers');
// A tap on the sweet tin: folds perTap frogs (as many as fit). Returns the slots filled.
export function tap(S) { const out = []; for (let k = 0; k < perTap(S); k++) { const i = fold(S); if (i < 0) break; out.push(i); } return out; }

// Melt the frog in slot a into its twin in slot b: one frog, one size bigger, in slot b.
export function melt(S, a, b) {
  const t = S.board[a];
  if (a === b || !t || S.board[b] !== t || t >= MAX) return 0;
  S.board[a] = null; S.board[b] = t + 1; S.melts++;
  if (t + 1 > S.best) S.best = t + 1;
  return t + 1;
}
// The candle moth: the smallest pair on the table.
export function mothPair(S) {
  const seen = new Map();
  let best = null;
  S.board.forEach((t, i) => {
    if (!t || t >= MAX) return;
    if (seen.has(t)) { if (!best || t < best[2]) best = [seen.get(t), i, t]; } else seen.set(t, i);
  });
  return best;
}
export function sell(S, i) {
  const t = S.board[i];
  if (!t) return 0;
  const p = priceAt(S, t);
  S.board[i] = null; S.buttons += p; S.earned += p; S.sold++;
  return p;
}
export function sellAll(S, t) {
  let sum = 0;
  S.board.forEach((x, i) => { if (x === t) sum += sell(S, i); });
  return sum;
}

// ---- the shop ----
// An upgrade shows up once the player has earned 40% of its price (or once its level is bought),
// and stays until bought out.
export function reveal(S) {
  const fresh = [];
  for (const u of UPGRADES) {
    if (S.revealed.includes(u.id)) continue;
    if (u.id === 'count' && S.seen.length < 6) continue;
    if (S.earned >= priceOf(S, u) * 0.4 || S.buttons >= priceOf(S, u)) { S.revealed.push(u.id); fresh.push(u.id); }
  }
  return fresh;
}
export function items(S) {
  return UPGRADES.filter(u => S.revealed.includes(u.id) && (u.max ? lvl(S, u.id) < u.max : !has(S, u.id)))
    .map(u => ({ ...u, level: lvl(S, u.id), price: priceOf(S, u) }));
}
export function buy(S, id) {
  const u = BY_ID[id];
  if (!u || S.ended) return false;
  const L = lvl(S, id), p = priceOf(S, u);
  if ((u.max ? L >= u.max : L > 0) || S.buttons < p) return false;
  S.buttons -= p; S.lv[id] = L + 1;
  if (id === 'table') while (S.board.length < slots(S)) S.board.push(null);
  return true;
}
export const nextPart = S => PARTS[S.parts] || null;
export function fit(S) {
  const p = nextPart(S);
  if (!p || S.buttons < p.price || S.still) return false;
  S.buttons -= p.price; S.parts++;
  if (S.parts === PARTS.length) S.still = { t: 0, best: 0, resets: 0 };
  return true;
}

// What an upgrade changes, now → after, for its tooltip.
export function effect(S, id) {
  const L = lvl(S, id);
  const per = s => (s ? `a frog every ${s}s` : 'none');
  if (id === 'doll') return `${per(DOLL[L])} → ${per(DOLL[L + 1])}`;
  if (id === 'moth') return `${MOTH[L] ? `a melt every ${MOTH[L]}s` : 'none'} → a melt every ${MOTH[L + 1]}s`;
  if (id === 'wrap') return `new frogs: ${SIZES[L]} → ${SIZES[L + 1]}`;
  if (id === 'table') return `${slots(S)} → ${slots(S) + T.slotsPer} cards`;
  if (id === 'fingers') return `${perTap(S)} → ${perTap(S) + 1} frogs a tap`;
  if (id === 'haggle') return `sale prices ×${haggle(S).toFixed(2)} → ×${(haggle(S) + T.haggle).toFixed(2)}`;
  return '';
}

// A stillness breaks when he does something on purpose: fold, melt, sell, buy.
export function fidget(S) {
  if (!S.still || S.ended) return false;
  const broke = S.still.t > 1;
  S.still.t = 0; S.still.resets++;
  return broke;
}

// ---- time ----
// Returns a list of events for the game to sound and log.
export function tick(S, dt) {
  const ev = [];
  if (S.ended) return ev;
  S.t += dt;
  // Prices drift toward the card's, with a small wobble so the fair never quite sits still.
  const tg = target(S), k = 1 - Math.exp(-dt / T.drift);
  for (let b = 0; b < 3; b++) S.price[b] += (tg[b] - S.price[b]) * k;
  if (S.still) {
    S.still.t += dt;
    S.still.best = Math.max(S.still.best, S.still.t);
    if (S.still.t >= T.still) { S.ended = true; S.finishedAt = S.t; ev.push({ type: 'end' }); }
  } else {
    S.dealT -= dt;
    if (S.dealT <= 0) { deal(S); ev.push({ type: 'deal', card: S.card }); }
  }
  // Helpers keep working, even while he stands still: they're not him.
  if (lvl(S, 'doll')) {
    S.dollT += dt;
    const every = DOLL[lvl(S, 'doll')];
    while (S.dollT >= every) { S.dollT -= every; const i = fold(S); if (i >= 0) ev.push({ type: 'fold', i, by: 'doll' }); else { S.dollT = 0; break; } }
  }
  if (lvl(S, 'moth')) {
    S.mothT += dt;
    const every = MOTH[lvl(S, 'moth')];
    if (S.mothT >= every) {
      const pr = mothPair(S);
      if (pr) { S.mothT -= every; const t = melt(S, pr[0], pr[1]); ev.push({ type: 'melt', a: pr[0], i: pr[1], t, by: 'moth' }); }
      else S.mothT = every;
    }
  }
  return ev;
}

export const meter = S => S.parts / PARTS.length;
export const phase = S => (S.ended ? 'fool' : S.still ? 'still' : S.parts >= 3 ? 'mended' : S.parts >= 1 ? 'fair' : 'stall');
export function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
  return n.toLocaleString('en-GB');
}
