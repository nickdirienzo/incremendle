// Fair Weather: the rules. The page and the pacing sim (sim.mjs) both import this.
// Once upon a time on Lake Linden, Tuppence, a little motor boat with an unpaid intern called Pim,
// wanted to beat Regina, the white yacht who wins the Pearl Fair every year. Two pearls of a size,
// dusted together and put to bed in one mussel, wake up as one pearl a size finer: that's the merge.
// The lake folk pay a penny a look at clean pearls. The West Wind, who loves sails and can't stand
// engines, blows grit down every row of the deck from the west. Each Fair, Regina shows a pearl one
// size bigger than yours (the Wind fetches it), and you go home with Second-Place Ribbons. After the
// first Fair, Pim sews pearls into a handkerchief that keeps growing. When it's done, it's a sail.

export const MAXC = 7, MAXR = 5;                 // the biggest deck: 7 cups by 5
export const DECKS = [[4, 3], [5, 3], [5, 4], [6, 4], [6, 5], [7, 5]];
export const OFFLINE_CAP = 8 * 3600;             // seconds of time away that count
export const OFFLINE_RATE = 0.2;                 // Pim works at a fifth of the speed with nobody watching
export const FAIR_MIN = 8;                       // a Goose Egg pearl gets you into the Fair

export const TIERS = [
  'Seed', 'Rice', 'Pea', 'Button', 'Thimble', 'Cherry', 'Plum',
  'Goose Egg', 'Apple', 'Cabbage', 'Pumpkin', 'Cartwheel', 'Millstone',
  'Haystack', 'Cottage', 'Moon',
];
export const TOP = TIERS.length;
export const tierName = t => `${TIERS[Math.min(t, TOP) - 1]} pearl`;
// Pennies a second that one clean pearl earns, before polish, pride and the sail.
export const shine = t => 0.1 * Math.pow(2.05, t - 1);

// The handkerchief, panel by panel. Each spot is a chalk outline of the pearl it wants.
export const SAIL = [
  { name: 'Handkerchief', spots: [4, 5, 5, 6] },
  { name: 'Napkin', spots: [7, 8, 8, 9] },
  { name: 'Tablecloth', spots: [9, 10, 10, 11] },
  { name: 'Bedsheet', spots: [11, 12, 12, 13] },
  { name: 'Something Very Large', spots: [14, 15, 15, 16] },
];
export const SPOTS = SAIL.flatMap((p, i) => p.spots.map((t, j) => ({ panel: i, j, t })));
export const SEW_BONUS = 0.01;                   // each sewn pearl: +1% shine per size, forever

// ---------- Upgrades ----------
// Pennies, levelled: they go back to nothing at every Fair (a new season, a new boat-load of jobs).
export const LEVELS = {
  dive: { name: 'Pim’s Goggles', cur: 'p', base: 10, k: 1.4, max: 90,
    desc: 'Pim can see the mussel beds now. New pearls come up faster.',
    joke: 'Pim is an intern. Pim is paid in pennies and thanked in nothing. Pim can now see underwater.' },
  polish: { name: 'Beeswax Polish', cur: 'p', base: 40, k: 1.42, max: 90,
    desc: 'Every clean pearl shines brighter, so the lake folk pay more to look.',
    joke: 'The bees wanted to know what it was for. Nobody told the bees.' },
  duster: { name: 'A Feather Duster', cur: 'p', base: 60, k: 2.0, max: 10,
    desc: 'Pim dusts the gritty pearl worth the most, all on their own, every few seconds.',
    joke: 'It was a goose once. It has been promoted.' },
  feed: { name: 'Porridge for the Mussels', cur: 'p', base: 300, k: 2.6, max: 8,
    desc: 'Well-fed mussels: some new pearls come up one size bigger.',
    joke: 'Oats, honey and a pinch of salt. The mussels say thank you by not saying anything.' },
  pair: { name: 'Pim’s Matchmaking', cur: 'p', base: 400, k: 1.45, max: 90, gate: S => S.fairs >= 1 && S.bestAll >= 9,
    desc: 'Pim finds the two smallest twins on the deck and puts them to bed together, every few seconds.',
    joke: '“You two have so much in common,” says Pim, to two identical pearls.' },
};
// Ribbons, levelled and permanent.
export const RIBBONS = {
  deck: { name: 'More Mussel Cups', cur: 'r', costs: [2, 8, 30, 110, 400], max: 5,
    desc: 'Screw another row of mussel cups to the deck. More room for pearls.',
    joke: 'Tuppence sits a little lower in the water. Tuppence is fine about it.' },
  pride: { name: 'Second-Place Pride', cur: 'r', base: 2, k: 1.8, max: 25,
    desc: 'Every pearl shines an eighth brighter, out of sheer stubbornness.',
    joke: 'Second is the first of the losers. Second is also the first of the people who will be back.' },
  wage: { name: 'Pay Pim', cur: 'r', costs: [4, 20, 90, 400, 1600], max: 5,
    desc: 'Pim dives, dusts and matchmakes a quarter faster. Pim is paid in ribbons now, which is a start.',
    joke: 'Pim pins the ribbon to their jumper. It says SECOND. Pim has never been happier.' },
  seed: { name: 'Deeper Dives', cur: 'r', costs: [3, 9, 22, 50, 110, 240, 500, 1000], max: 8,
    desc: 'Pim dives to the older mussel beds. Every new pearl comes up one size bigger.',
    joke: 'The deep mussels are very old and very slow and they have been waiting for someone to ask.' },
  start: { name: 'A Head Start', cur: 'r', base: 6, k: 4, max: 4,
    desc: 'Pim keeps a pearl in a sock between seasons. Each season starts with it on deck, a size bigger per level.',
    joke: 'It is a clean sock. Pim is very clear on this point.' },
};
// One-offs, bought with pennies, kept forever and drawn on the boat. odd: does very little.
export const ONE = [
  { id: 'pinwheel', name: 'A Pinwheel', cost: 35, odd: true,
    desc: 'A paper pinwheel for the bow. It does nothing. The Wind spins it every time it passes.',
    joke: 'The Wind stops to spin it. The Wind pretends it didn’t.' },
  { id: 'hat', name: 'A Sou’wester for Pim', cost: 700, odd: true,
    desc: 'A yellow rain hat with a brim at the back. For the grit. Mostly for the look.',
    joke: 'Pim wears it indoors. There is no indoors. Pim wears it anyway.' },
  { id: 'cozy', name: 'A Tea Cozy for the Engine', cost: 2600,
    desc: 'Knitted, with a bobble. The engine putters more quietly and the Wind gets cross less often: gusts come further apart.',
    joke: 'The teapot is furious. The teapot is now cold all the time.' },
  { id: 'bell', name: 'A Brass Bell', cost: 16000, odd: true,
    desc: 'Pim rings it every time they come up with a pearl. Ding.',
    joke: 'Ding. Ding. Ding. Regina’s crew have asked if there is a fire.' },
  { id: 'spyglass', name: 'A Spyglass', cost: 140000, odd: true,
    desc: 'For keeping an eye on Regina. Pim reports everything Regina does. Regina mostly sails.',
    joke: '“Regina is sailing,” says Pim. “Still sailing. Oh! No. Still sailing.”' },
  { id: 'name', name: 'A Name in Gold Thread', cost: 1.2e6, odd: true,
    desc: 'TUPPENCE, across the bow, in gold chain stitch, so the judges can’t say they didn’t know.',
    joke: 'Last year the judges wrote “the little smelly one”. Not this year.' },
  { id: 'autograph', name: 'Regina’s Autograph', cost: 9e6, odd: true,
    desc: 'Framed, in the cabin window. It says “Better luck next year. R.”',
    joke: 'Pim asked for it. Regina was delighted. Tuppence will never forgive either of them.' },
  { id: 'lantern', name: 'A Paper Lantern', cost: 6e7, odd: true,
    desc: 'Pink, round, strung from the flagpole. For the night crossings.',
    joke: 'There are no night crossings. The lantern is optimistic.' },
  { id: 'cake', name: 'A Cake for Regina', cost: 5e8, odd: true,
    desc: 'Pim bakes it, ices it and leaves it on the cabin roof to send across. Sportsmanship.',
    joke: 'Regina sends a thank-you note. It says “Lovely. Second place in baking, too.”' },
  { id: 'vane', name: 'A Weathervane', cost: 3e9, odd: true,
    desc: 'A tin rooster on the cabin roof that turns to show where the Wind is going.',
    joke: 'It has never once pointed at Tuppence. It points at Regina. It always points at Regina.' },
];
export const ONE_BY_ID = Object.fromEntries(ONE.map(o => [o.id, o]));

// ---------- State ----------
export function newState() {
  return {
    v: 1, t: 0, season: 0, fairs: 0,
    pennies: 0, earned: 0, pAll: 0, ribbons: 0, rAll: 0,
    deck: Array(MAXC * MAXR).fill(null),
    lv: { dive: 0, polish: 0, duster: 0, feed: 0, pair: 0 },
    rl: { deck: 0, pride: 0, wage: 0, seed: 0, start: 0 },
    one: {}, sewn: [], best: 0, bestAll: 0, lastBest: 0, lastFair: 0,
    diveT: 0, gustT: 0, gusts: 0, dustT: 0, pairT: 0, rng: 1517,
    merges: 0, dusted: 0, tossed: 0, sewnN: 0, seasonT: 0,
    seen: [], ended: false, finale: false, savedAt: 0, tab: 'p', boughtOpen: false,
  };
}
// A fresh game starts with four seed pearls on deck (two pairs of twins), so there's something to do.
export function freshDeck(S) {
  for (const i of [1, 2, 8, 10]) S.deck[i] = { t: 1, d: false };
  S.best = S.bestAll = 1;
  return S;
}
export function load(raw) {
  const S = newState();
  if (!raw || typeof raw !== 'object') return freshDeck(S);
  for (const k of Object.keys(S)) if (raw[k] !== undefined) S[k] = raw[k];
  S.lv = Object.assign(newState().lv, raw.lv || {});
  S.rl = Object.assign(newState().rl, raw.rl || {});
  S.one = Object.assign({}, raw.one || {});
  if (!Array.isArray(S.deck) || S.deck.length !== MAXC * MAXR) S.deck = Array(MAXC * MAXR).fill(null);
  if (!Array.isArray(S.sewn)) S.sewn = [];
  if (S.ended) { S.sewn = SPOTS.map(() => true); S.fairs = Math.max(1, S.fairs); }
  return S;
}

const rand = S => { S.rng = (S.rng * 16807) % 2147483647; return S.rng / 2147483647; };

// ---------- The deck ----------
export const size = S => DECKS[Math.min(S.rl.deck, DECKS.length - 1)];
export const cupOn = (S, i) => { const [c, r] = size(S); return i % MAXC < c && Math.floor(i / MAXC) < r; };
export const cups = S => S.deck.map((_, i) => i).filter(i => cupOn(S, i));
export const pearls = S => cups(S).filter(i => S.deck[i]);
export const empties = S => cups(S).filter(i => !S.deck[i]);

// Multipliers.
export const seedTier = S => 1 + S.rl.seed;
export const sewnSum = S => SPOTS.reduce((a, s, i) => a + (S.sewn[i] ? s.t : 0), 0);
export const sailMult = S => 1 + SEW_BONUS * sewnSum(S);
export const polishMult = S => Math.pow(1.05, S.lv.polish);
export const prideMult = S => Math.pow(1.12, S.rl.pride);
export const mult = S => sailMult(S) * polishMult(S) * prideMult(S);
export const pearlRate = (S, t) => shine(t) * mult(S);
export function income(S) {
  let r = 0;
  for (const i of pearls(S)) if (!S.deck[i].d) r += shine(S.deck[i].t);
  return r * mult(S);
}
export const grittyLoss = S => pearls(S).reduce((a, i) => a + (S.deck[i].d ? shine(S.deck[i].t) : 0), 0) * mult(S);

// Pim's pace.
export const wage = S => Math.pow(1.25, S.rl.wage);
export const diveTime = S => 5 / Math.pow(1.065, S.lv.dive) / wage(S);
export const dustTime = S => S.lv.duster ? 7 * Math.pow(0.86, S.lv.duster - 1) / wage(S) : Infinity;
export const pairTime = S => S.lv.pair ? 8 * Math.pow(0.94, S.lv.pair - 1) / wage(S) : Infinity;
export const feedChance = S => Math.min(0.8, 0.08 * S.lv.feed);
// The West Wind: a gust every so often, and every fourth one is a big one.
export const gustTime = S => 20 * (S.one.cozy ? 1.6 : 1);

function note(S, t) { if (t > S.best) S.best = t; if (t > S.bestAll) S.bestAll = t; }

export function merge(S, from, to) {
  const a = S.deck[from], b = S.deck[to];
  if (from === to || !a || !b || a.t !== b.t || a.t >= TOP || !cupOn(S, from) || !cupOn(S, to)) return false;
  S.deck[to] = { t: a.t + 1, d: false };
  S.deck[from] = null;
  S.merges++;
  note(S, a.t + 1);
  return true;
}
// Drag to another cup: move, or swap if it's taken by a different pearl.
export function move(S, from, to) {
  if (from === to || !S.deck[from] || !cupOn(S, to)) return false;
  const b = S.deck[to];
  S.deck[to] = S.deck[from]; S.deck[from] = b;
  return true;
}
export function dust(S, i) {
  const p = S.deck[i];
  if (!p || !p.d) return false;
  p.d = false; S.dusted++;
  return true;
}
// Back to the lake: the lake folk pay ten seconds' worth to watch it splash.
export const tossValue = (S, t) => pearlRate(S, t) * 10;
export function toss(S, i) {
  const p = S.deck[i];
  if (!p) return 0;
  const v = tossValue(S, p.t);
  S.deck[i] = null; S.tossed++;
  earn(S, v);
  return v;
}
function earn(S, v) { S.pennies += v; S.earned += v; S.pAll += v; }

// Sewing: drag a pearl onto its chalk outline in the hoop.
export const panel = S => { const i = SPOTS.findIndex((_, k) => !S.sewn[k]); return i < 0 ? SAIL.length : SPOTS[i].panel; };
export const openSpots = S => SPOTS.map((s, k) => ({ ...s, k })).filter(s => s.panel === panel(S) && !S.sewn[s.k]);
export const hoop = S => S.fairs >= 1;
export function sew(S, i, k) {
  const p = S.deck[i], s = SPOTS[k];
  if (!hoop(S) || !p || !s || S.sewn[k] || s.panel !== panel(S) || p.t !== s.t) return false;
  S.sewn[k] = true; S.deck[i] = null; S.sewnN++;
  if (SPOTS.every((_, j) => S.sewn[j])) S.finale = true;
  return true;
}
export const sailDone = S => SPOTS.every((_, j) => S.sewn[j]);

// ---------- The Fair ----------
// The Fair won't take a smaller pearl than the one you brought last year.
export const fairNeed = S => Math.max(FAIR_MIN, S.lastFair || 0);
export const fairOpen = S => S.best >= fairNeed(S) && !S.finale && !S.ended;
export const ribbonsFor = best => best >= FAIR_MIN ? Math.round(6 * Math.pow(2, best - FAIR_MIN)) : 0;
export const reginaShows = S => Math.min(TOP, Math.max(S.best, 1) + 1);   // always one size bigger. Always.
export function fair(S) {
  if (!fairOpen(S)) return 0;
  const got = ribbonsFor(S.best);
  S.ribbons += got; S.rAll += got;
  S.lastFair = S.best; S.fairs++; S.season++;
  S.pennies = 0; S.earned = 0; S.seasonT = 0;
  for (const k of Object.keys(S.lv)) S.lv[k] = 0;
  S.deck = Array(MAXC * MAXR).fill(null);
  S.best = 0; S.lastBest = S.t;
  S.diveT = 0; S.gustT = 0; S.dustT = 0; S.pairT = 0;
  startPearl(S);
  return got;
}
function startPearl(S) {
  if (!S.rl.start) return;
  const t = Math.min(TOP - 1, seedTier(S) + 2 * S.rl.start);
  const free = empties(S);
  if (free.length) { S.deck[free[free.length - 1]] = { t, d: false }; note(S, t); }
}

// ---------- Time ----------
// Returns what happened this tick, for the page's sounds and pictures.
export function tick(S, dt, { calm = false } = {}) {
  const ev = { dived: [], gust: null, dusted: [], paired: [] };
  if (S.ended || S.finale) return ev;
  S.t += dt; S.seasonT += dt;
  const r = income(S) * dt;
  earn(S, r);
  // Pim dives.
  S.diveT += dt;
  const dt0 = diveTime(S);
  while (S.diveT >= dt0) {
    const free = empties(S);
    if (!free.length) { S.diveT = dt0; break; }
    S.diveT -= dt0;
    const i = free[Math.floor(rand(S) * free.length)];
    const t = Math.min(TOP - 1, seedTier(S) + (rand(S) < feedChance(S) ? 1 : 0));
    S.deck[i] = { t, d: false }; note(S, t);
    ev.dived.push(i);
  }
  // The Wind.
  if (!calm) {
    S.gustT += dt;
    if (S.gustT >= gustTime(S)) {
      S.gustT = 0; S.gusts++;
      const depth = S.gusts % 4 === 0 ? 2 : 1;
      const [c, rows] = size(S), hit = [];
      for (let row = 0; row < rows; row++) {
        let n = 0;
        for (let col = 0; col < c && n < depth; col++) {
          const p = S.deck[row * MAXC + col];
          if (!p) continue;
          p.d = true; hit.push(row * MAXC + col); n++;
        }
      }
      ev.gust = { depth, hit };
    }
  }
  // Pim dusts.
  if (S.lv.duster) {
    S.dustT += dt;
    if (S.dustT >= dustTime(S)) {
      const g = pearls(S).filter(i => S.deck[i].d).sort((a, b) => S.deck[b].t - S.deck[a].t);
      if (g.length) { S.dustT = 0; dust(S, g[0]); ev.dusted.push(g[0]); } else S.dustT = dustTime(S);
    }
  }
  // Pim matchmakes.
  if (S.lv.pair) {
    S.pairT += dt;
    if (S.pairT >= pairTime(S)) {
      const pr = smallestPair(S);
      if (pr) { S.pairT = 0; merge(S, pr[0], pr[1]); ev.paired.push(pr[1]); } else S.pairT = pairTime(S);
    }
  }
  return ev;
}
// The two smallest twins: the later one goes to bed in the earlier one's cup (the windward one
// stays put, so it keeps shielding).
export function smallestPair(S) {
  const by = {};
  for (const i of pearls(S)) { const t = S.deck[i].t; if (t >= TOP) continue; (by[t] ||= []).push(i); }
  const ts = Object.keys(by).map(Number).filter(t => by[t].length >= 2).sort((a, b) => a - b);
  if (!ts.length) return null;
  const l = by[ts[0]];
  return [l[l.length - 1], l[0]];
}

// Time away: Pim keeps going at a quarter speed and the Wind sleeps (it's a lullaby, after all).
export function offline(S, secs) {
  if (S.ended || S.finale) return null;
  const eff = Math.min(secs, OFFLINE_CAP) * OFFLINE_RATE;
  if (eff < 10) return null;
  const p0 = S.pAll, m0 = S.merges;
  let dived = 0;
  for (let t = 0; t < eff; t += 1) dived += tick(S, Math.min(1, eff - t), { calm: true }).dived.length;
  return { secs: Math.min(secs, OFFLINE_CAP), pennies: S.pAll - p0, dived, paired: S.merges - m0 };
}

// ---------- Shop ----------
export const levelCost = (S, id) => {
  const V = LEVELS[id] || RIBBONS[id], lv = LEVELS[id] ? S.lv[id] : S.rl[id];
  return V.costs ? V.costs[lv] : Math.round(V.base * Math.pow(V.k, lv));
};
const lvOf = (S, id) => LEVELS[id] ? S.lv[id] : S.rl[id];
const purse = (S, cur) => cur === 'r' ? S.ribbons : S.pennies;
// Visible items, revealed once they come within reach (and then kept until bought).
export function items(S) {
  const out = [];
  const seen = new Set(S.seen);
  for (const [id, V] of Object.entries(LEVELS)) {
    if (V.gate && !V.gate(S)) continue;
    const lv = S.lv[id];
    out.push({ id, cur: 'p', kind: 'level', name: V.name, price: levelCost(S, id), level: lv, max: V.max, capped: lv >= V.max, show: seen.has(id) || S.pennies >= levelCost(S, id) * 0.6 || lv > 0 });
  }
  for (const o of ONE) {
    if (S.one[o.id]) continue;
    out.push({ id: o.id, cur: 'p', kind: 'one', name: o.name, price: o.cost, odd: !!o.odd, show: seen.has(o.id) || S.pennies >= o.cost * 0.5 });
  }
  if (S.fairs >= 1) for (const [id, V] of Object.entries(RIBBONS)) {
    const lv = S.rl[id];
    if (lv >= V.max) continue;
    out.push({ id, cur: 'r', kind: 'level', name: V.name, price: levelCost(S, id), level: lv, max: V.max, capped: false, show: true });
  }
  return out.filter(i => i.show && !(i.kind === 'level' && i.capped && i.cur === 'p'));
}
export function reveal(S) {
  const fresh = [];
  for (const it of items(S)) if (!S.seen.includes(it.id)) { S.seen.push(it.id); fresh.push(it.id); }
  return fresh;
}
export const canBuy = (S, id) => {
  if (S.ended || S.finale) return false;
  const o = ONE_BY_ID[id];
  if (o) return !S.one[id] && S.pennies >= o.cost;
  const V = LEVELS[id] || RIBBONS[id];
  if (!V || (V.gate && !V.gate(S))) return false;
  if (RIBBONS[id] && S.fairs < 1) return false;
  const lv = lvOf(S, id);
  return lv < V.max && purse(S, V.cur) >= levelCost(S, id);
};
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const o = ONE_BY_ID[id];
  if (o) { S.pennies -= o.cost; S.one[id] = true; return true; }
  const c = levelCost(S, id);
  if (LEVELS[id]) { S.pennies -= c; S.lv[id]++; }
  else { S.ribbons -= c; S.rl[id]++; }
  return true;
}
// One-time things on the Bought shelf.
export const bought = S => ONE.filter(o => S.one[o.id]);

// ---------- Story ----------
export const progress = S => SPOTS.filter((_, k) => S.sewn[k]).length / SPOTS.length;
export function phase(S) {
  if (S.ended || S.finale) return 'ending';
  if (S.fairs < 1) return 'deck';
  return panel(S) >= 3 ? 'sail' : 'hoop';
}

// ---------- Numbers ----------
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
  const u = ['', 'k', 'M', 'B', 'T', 'Qa'];
  let i = 0; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + u[i];
}
export function long(n) {
  if (n < 1e6) return Math.floor(n).toLocaleString('en-GB');
  return fmt(n).replace('M', ' million').replace('B', ' billion').replace('T', ' trillion');
}
export const pence = n => `${fmt(n)}d`;
