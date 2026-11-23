// Hold Your Hats: the rules. index.html draws and plays them; sim.mjs runs them headless for pacing.
// Numbers live in plain doubles all the way to Number.MAX_VALUE, the biggest number there is. That's the cap
// the Snow-Eater asks for at dawn, so nothing here ever goes past it (cl() clamps).

export const MAX = Number.MAX_VALUE;
export const WAVES = 40;            // a quarter hour each, 8 pm to dawn; wave 40 is the Snow-Eater herself
export const CROSS = 26;            // seconds for a gust to blow from the hills to Bundt
export const CROSS_CHINOOK = 120;   // she is very big and in no hurry
export const FRESH = 3;             // a hot hat, flicked, fills a wind three times as well as a stale one
export const PAUSE = 2.5;           // breath between waves
export const REGROUP = 3;           // after a gust licks Bundt
export const FAIL_CUT = 0.3;
export let GROW = 1.6;               // each gust in a wave is this much hungrier than the last        // a gust that licked Bundt ate snow: it comes back 70% less hungry
const cl = x => (x > MAX ? MAX : x);
const L10 = Math.log10;

// Where a steady player's bakery stands (log10 hats a second) as each wave starts: measured by the pacing sim with
// everything free, then frozen here so hunger and prices follow the same curve. Index = wave.
export const PATH = [0, 1, 2.6, 9.4, 11.2, 13.2, 20.3, 22.5, 24.9, 32.3, 34.9, 37.6, 41.3, 53.2, 57.3, 61.6, 66, 79.7, 84.5, 89.5,
  94.7, 111, 116.5, 122.2, 128.1, 146.2, 152.4, 158.9, 165.5, 186.3, 193.3, 200.4, 207.7, 214.2, 239.9, 247.8, 254.9, 263.1,
  271.5, 280.1, 306];
const STORM = new Set([8, 12, 16, 20, 24, 28, 33, 39]);     // the wave before each new recipe blows harder
export let SLACK = w => (w <= 2 ? 1.2 : w <= 5 ? 2 : (w <= 12 ? 2.9 : 3.2) + (STORM.has(w) ? 0.45 : 0));
export const stormy = w => STORM.has(w);   // log10 of (hunger / bake rate): seconds of baking, roughly
export const tune = o => { if (o.GROW) GROW = o.GROW; if (o.SLACK) SLACK = o.SLACK; if (o.PATH) PATH.splice(0, PATH.length, ...o.PATH); };
// Total hunger of a wave, in log10 hats. Slow at dusk, absurd by the small hours.
export const hungerLog = w => PATH[Math.min(w, WAVES)] + SLACK(w);
export function waveHunger(w) { return w >= WAVES ? MAX : 10 ** hungerLog(w); }
export const gustCount = w => (w >= WAVES ? 1 : Math.min(6, 2 + Math.ceil(w / 6)));

// The hats. Each recipe nests the last one inside it, so a batch holds far more hat than it looks.
export const RECIPES = [
  { name: 'Bundt', wave: 0, mult: 0, desc: 'A ring of sponge in the shape of the tin. The tin is Bundt\'s hat. Everything comes out hat-shaped.' },
  { name: 'Bowler', wave: 3, mult: 2, desc: 'A bowler, with a Bundt baked inside it.', joke: 'The first bowler is a little lopsided. Bundt apologises to it.' },
  { name: 'Beret', wave: 6, mult: 3, desc: 'A beret: a bowler that has sat down. Two hats inside.', joke: 'The beret is folded around a bowler that is folded around a Bundt. The wind will never know.' },
  { name: 'Top hat', wave: 9, mult: 4, desc: 'A tall top hat with a beret, a bowler and a Bundt nesting inside, like dolls.', joke: 'Bundt tries one on over the tin. It looks very distinguished. He takes it off at once in case anyone saw.' },
  { name: 'Mitre', wave: 13, mult: 6, desc: 'A bishop\'s mitre. There is room in there for a great many top hats.', joke: 'The mitre comes out of the oven so solemn that the sparrows stop chattering.' },
  { name: 'Sombrero', wave: 17, mult: 7, desc: 'A sombrero as wide as the bakery door, packed to the brim with mitres.', joke: 'A sombrero casts a lovely shade. Bundt stands under it for a moment, just to feel safe.' },
  { name: 'Witch\'s hat', wave: 21, mult: 9, desc: 'A tall, crooked witch\'s hat. The crook is where the sombreros go.', joke: 'It came out of the oven already cackling. Bundt is choosing to believe that was the oven door.' },
  { name: 'Crown', wave: 25, mult: 10, desc: 'A golden crown with a witch\'s hat inside every point.', joke: 'Once upon a time a crown was a hat for one king. Now it is a hat for a quattuordecillion hats.' },
  { name: 'Wizard\'s hat', wave: 29, mult: 12, desc: 'A starry wizard\'s hat. Each star is a crown. Each crown is full.', joke: 'The stars on it are sugar. The wizard is not included.' },
  { name: 'Hat for a hill', wave: 34, mult: 15, desc: 'A hat big enough for the hill behind the bakery, with every smaller hat inside.', joke: 'Bundt has to bake it in a quarry. The hill looks very smart in it.' },
  { name: 'Hat for the moon', wave: 40, mult: 60, desc: 'A hat for the moon. Every hat there has ever been is somewhere inside it.', joke: 'The moon tries it on. It fits. The moon is very pleased and keeps it, so Bundt has to bake it again, many times.' },
];

export const ITEMS = [
  { id: 'oven', kind: 'lv', name: 'Another oven', wave: 1,
    desc: 'One more oven in the bakery wall. Every oven bakes three times what the bakery baked before (and a bit).',
    joke: 'Bundt lights it from as far away as a snowman can, with a very long match.' },
  { id: 'recipe', kind: 'lv', name: 'New recipe', wave: 3 },
  { id: 'sparrow', kind: 'lv', name: 'A sparrow', wave: 5, max: 4,
    desc: 'A sparrow on the bakery roof. Stale hats fall off the rack, and a sparrow throws its share into the wind instead of letting them crumble. Four sparrows throw them all.',
    jokes: ['The first sparrow will work for crumbs, which is lucky, because there are a lot of crumbs.',
      'The second sparrow is the first sparrow\'s cousin. It throws underarm.',
      'The third sparrow has a little scarf. Nobody asked about the scarf.',
      'The fourth sparrow is enormous for a sparrow. It throws a stale sombrero like a discus.'] },
  { id: 'peel', kind: 'one', name: 'Long peel', wave: 2,
    desc: 'A baker\'s peel as long as a broom. A flick throws three seconds of baking instead of one.',
    joke: 'With a longer peel Bundt can stand much further back from the ovens. This is not why he bought it. (It is why he bought it.)' },
  { id: 'larder', kind: 'one', name: 'Snow larder', wave: 7,
    desc: 'The rack moves into the cold beside Bundt. Hats keep fresh for 40 seconds instead of 20, so the rack holds twice as many.',
    joke: 'Bundt is, after all, mostly fridge.' },
  { id: 'cowl', kind: 'one', name: 'Chimney cowl', wave: 11,
    desc: 'A tin cowl on the chimney that catches more of a fed gust on its way home. Each wave you fill leaves half as much warmth again in the ovens.',
    joke: 'The cowl turns to face every gust that goes home, like a host seeing guests out.' },
  { id: 'thermo', kind: 'odd', name: 'A thermometer', wave: 2,
    desc: 'A thermometer by the bakery door, for worrying at.',
    joke: 'Bundt checks it. It is a little warm. He checks it again. It is still a little warm. He feels much better having checked.' },
  { id: 'nose', kind: 'odd', name: 'A spare nose', wave: 6,
    desc: 'A spare carrot nose, in a jar of water on the windowsill. Just in case.',
    joke: 'It is a very good carrot. Bundt sometimes looks at it and wonders if it is a better nose than his.' },
  { id: 'napkin', kind: 'odd', name: 'A napkin for the wind', wave: 10,
    desc: 'A big checked napkin, pegged on the washing line for the wind to use.',
    joke: 'It is only polite. The gusts do not use it, but one or two of them look at it.' },
  { id: 'sampler', kind: 'odd', name: 'Grandmother\'s sampler', wave: 15,
    desc: 'An old embroidered sampler, hung by the door. It says: A HUNGRY WIND BLOWS WARM. A FULL WIND BLOWS COLD.',
    joke: 'The baker\'s grandmother stitched it seventy winters ago. Bundt reads it twice and does not see what it has to do with anything.' },
  { id: 'vane', kind: 'odd', name: 'A hat for the weathervane', wave: 22,
    desc: 'A tiny bowler for the tin cockerel on the roof, who has pointed at the wind all night.',
    joke: 'The cockerel cannot turn its head to see the hat, but it stands a little straighter.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// ---------- state ----------
export function fresh() {
  return { hats: 15, baked: 0, fed: 0, crumbs: 0, heat: 0, wave: 1, gusts: null, pause: 1.5, fails: 0, bites: 0,
    lv: {}, revealed: [], time: 0, flicks: 0, thrown: 0, started: false, ended: false };
}
export function load(raw) {
  const S = Object.assign(fresh(), raw || {});
  S.lv = Object.assign({}, S.lv);
  for (const k of ['hats', 'baked', 'fed', 'crumbs']) if (!Number.isFinite(S[k])) S[k] = S[k] > 0 ? MAX : 0;
  if (!S.gusts && !S.ended) spawn(S);
  return S;
}
export const lv = (S, id) => S.lv[id] || 0;

// ---------- rates ----------
export const OVEN_M = 0.5;
export const ovenCostLog = n => 1 + 0.55 * n + 0.0175 * n * n;
export const recipeLog = S => RECIPES.slice(0, lv(S, 'recipe') + 1).reduce((a, r) => a + r.mult, 0);
export const heatStep = (S, w) => (0.5 + 0.12 * w) * (lv(S, 'cowl') ? 1.5 : 1);
export const rateLog = S => lv(S, 'oven') * OVEN_M + recipeLog(S) + S.heat;
export const rate = S => cl(10 ** rateLog(S));
export const keep = S => (lv(S, 'larder') ? 40 : 20);       // seconds a hat stays fresh
export const cover = S => lv(S, 'sparrow') / 4;              // share of stale hats thrown
export const peel = S => (lv(S, 'peel') ? 3 : 1);            // seconds of baking per flick
export const flickSize = S => Math.max(1, rate(S) * peel(S));
export const recipe = S => RECIPES[lv(S, 'recipe')];

// ---------- the shop ----------
export function max(it) { return it.id === 'recipe' ? RECIPES.length - 1 : it.max || (it.kind === 'lv' ? Infinity : 1); }
export function costLog(S, id) {
  const n = lv(S, id);
  if (id === 'oven') return ovenCostLog(n);
  if (id === 'recipe') { const r = RECIPES[n + 1]; return r ? PATH[r.wave - 1] + 1 : Infinity; }
  if (id === 'sparrow') return PATH[5 + 3 * n] + 0.4;
  if (id === 'peel') return L10(25);
  if (id === 'larder') return PATH[7] + 0.5;
  if (id === 'cowl') return PATH[11] + 0.5;
  const it = BY_ID[id];
  return Math.max(L10(40), PATH[it.wave] + 0.4);           // the silly ones are cheap for their moment
}
export const cost = (S, id) => cl(10 ** costLog(S, id));
export const unlocked = (S, it) => S.wave >= it.wave;
// The next recipe is on the shelf from 8:30, but each one can only be baked once the night is late enough.
export const recipeReady = S => { const r = RECIPES[lv(S, 'recipe') + 1]; return !!r && S.wave >= r.wave; };
export const done = (S, it) => lv(S, it.id) >= max(it);
// Revealed items stay until bought, even if the player spends down.
export function reveal(S) {
  const out = [];
  for (const it of ITEMS) if (!S.revealed.includes(it.id) && !done(S, it) && unlocked(S, it)) { S.revealed.push(it.id); out.push(it.id); }
  return out;
}
export const visible = S => ITEMS.filter(it => S.revealed.includes(it.id) && !done(S, it));
export const bought = S => ITEMS.filter(it => it.kind !== 'lv' ? lv(S, it.id) > 0 : (it.max && done(S, it)));
export const canBuy = (S, id) => {
  const it = BY_ID[id];
  if (!it || done(S, it) || !S.revealed.includes(id)) return false;
  if (id === 'recipe' && !recipeReady(S)) return false;
  return S.hats >= cost(S, id) * (1 - 1e-9);
};
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  S.hats = Math.max(0, S.hats - cost(S, id));
  S.lv[id] = lv(S, id) + 1;
  return true;
}

// ---------- the night ----------
export const clock = w => { const m = 20 * 60 + (w - 1) * 15, h = Math.floor(m / 60) % 24; return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h >= 12 && h < 24 ? 'pm' : 'am'}`; };
export function spawn(S) {
  const w = S.wave, n = gustCount(w), H = w >= WAVES ? MAX : waveHunger(w) * FAIL_CUT ** S.fails;
  // Each gust is hungrier than the one before; the last is the gale. Each leaves the same warmth when it goes home.
  const shares = Array.from({ length: n }, (_, i) => GROW ** i);
  const tot = shares.reduce((a, b) => a + b, 0);
  S.gusts = shares.map((s, i) => ({ h: H * s / tot, h0: H * s / tot, x: 1.04 + i * 0.28, big: (i === n - 1 && n > 2) || w >= WAVES, heat: 1 / n }));
}
// After a lick: the gusts already full stay home; the hungry ones come back over the hill, less hungry.
function regroup(S) {
  const left = S.gusts.filter(g => g.h > 0);
  left.sort((a, b) => a.x - b.x).forEach((g, i) => {
    if (S.wave < WAVES) { g.h *= FAIL_CUT; g.h0 = g.h; }
    g.x = 1.04 + i * 0.28;
  });
  S.gusts = left;
}
const front = S => {
  let best = -1;
  if (!S.gusts || S.pause > 0) return -1;
  S.gusts.forEach((g, i) => { if (g.h > 0 && g.x <= 1.02 && (best < 0 || g.x < S.gusts[best].x)) best = i; });
  return best;
};
export const target = front;
function feed(S, i, amount, ev) {
  const g = S.gusts[i];
  const used = Math.min(g.h, amount);
  g.h -= used; S.fed = cl(S.fed + used);
  if (g.h <= g.h0 * 1e-12 || g.h <= 0) {
    // Full, it goes home up the bakery chimney and leaves its warmth in the ovens.
    g.h = 0; ev.full.push(i);
    if (S.wave < WAVES) { const d = heatStep(S, S.wave) * (g.heat ?? 1); S.heat += d; ev.warm = (ev.warm || 0) + d; }
  }
  return used;
}
// One flick at gust i (or the front one): a hot batch straight off the peel, worth peel() seconds of baking, thrown
// before it ever reaches the rack. Returns what was thrown, n = 0 if there was nothing to throw at.
export function flick(S, i = front(S)) {
  if (i < 0 || !S.gusts || !S.gusts[i] || S.gusts[i].h <= 0 || S.gusts[i].x > 1.02 || S.pause > 0) return { n: 0 };
  const n = flickSize(S);
  S.flicks++; S.thrown = cl(S.thrown + n); S.baked = cl(S.baked + n);
  const ev = { full: [] };
  feed(S, i, cl(n * FRESH), ev);
  const r = { n, i, full: ev.full.length > 0 };
  check(S, r);
  return r;
}
function check(S, ev) {
  if (S.gusts && S.gusts.every(g => g.h <= 0)) {
    ev.cleared = S.wave;
    if (S.wave >= WAVES) { ev.end = true; S.hats = MAX; S.baked = MAX; S.fed = MAX; S.gusts = []; return; }
    S.wave++; S.fails = 0; S.gusts = null; S.pause = PAUSE;
  }
}
// Advance the world by dt seconds (keep dt small, ≤ 0.25). Returns what happened, for sound and pictures.
export function tick(S, dt) {
  const ev = { full: [], thrown: 0, crumbs: 0 };
  if (S.ended) return ev;
  const R = rate(S);
  S.hats = cl(S.hats + R * dt); S.baked = cl(S.baked + R * dt);
  const stale = S.hats * (1 - Math.exp(-dt / keep(S)));
  S.hats -= stale;
  const toss = stale * cover(S);
  S.crumbs = cl(S.crumbs + stale - toss);
  ev.crumbs = stale - toss;
  if (S.pause > 0) {
    S.pause -= dt;
    if (S.pause <= 0) { S.pause = 0; if (!S.gusts) spawn(S); else regroup(S); }
    return ev;
  }
  if (!S.gusts) spawn(S);
  const speed = 1 / (S.wave >= WAVES ? CROSS_CHINOOK : CROSS);
  for (const g of S.gusts) if (g.h > 0) g.x -= speed * dt;
  let left = toss;
  while (left > 0) {
    const i = front(S);
    if (i < 0) break;
    const used = feed(S, i, left, ev);
    ev.thrown += used; left -= used;
    if (used <= 0) break;
  }
  S.thrown = cl(S.thrown + ev.thrown);
  if (S.gusts.some(g => g.h > 0 && g.x <= 0)) {
    // A gust reached Bundt: it licks a bit off him, and the wave regroups, less hungry for it.
    ev.lick = true; S.bites++; S.fails++; S.pause = REGROUP;
    return ev;
  }
  check(S, ev);
  return ev;
}

// How far through the night, 0..1 (for the deadline meter).
export const night = S => Math.min(1, (S.wave - 1 + (S.gusts && S.gusts.length ? 1 - S.gusts.reduce((a, g) => a + g.h, 0) / Math.max(1e-300, S.gusts.reduce((a, g) => a + g.h0, 0)) : 0) * 0.999) / WAVES);
export const phase = S => (S.ended ? 4 : S.wave >= WAVES ? 3 : S.wave >= 27 ? 2 : S.wave >= 14 ? 1 : 0);

// ---------- numbers with absurd names ----------
const SMALL = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'];
const UNITS = ['', 'un', 'duo', 'tre', 'quattuor', 'quin', 'sex', 'septen', 'octo', 'novem'];
const TENS = ['', 'dec', 'vigint', 'trigint', 'quadragint', 'quinquagint', 'sexagint', 'septuagint', 'octogint', 'nonagint'];
// The name of 10^(3k): thousand, million ... decillion ... centillion (10^303), uncentillion (10^306).
export function illion(k) {
  if (k < SMALL.length) return SMALL[k];
  const n = k - 1;                                // million = 1st -illion
  if (n === 100) return 'centillion';
  if (n === 101) return 'uncentillion';
  return UNITS[n % 10] + TENS[Math.floor(n / 10)] + 'illion';
}
export function name(x) {
  if (!(x >= 0)) return '0';
  if (x >= MAX) return 'the biggest number there is';
  if (x < 1e6) return Math.floor(x).toLocaleString('en-US');
  const k = Math.floor(L10(x) / 3 + 1e-9), m = x / 10 ** (3 * k);
  return `${m >= 100 ? Math.floor(m) : m.toFixed(m >= 10 ? 1 : 2)} ${illion(k)}`;
}
// Short form for cells: 1,234 · 12.3K · 4.5M · 7.8B · 1.2T, then 3.4e45.
export function short(x) {
  if (!(x >= 0)) return '0';
  if (x >= MAX) return '∞';
  if (x < 1e4) return x < 10 && x % 1 ? x.toFixed(1) : Math.floor(x).toLocaleString('en-US');
  if (x < 1e15) { const k = Math.floor(L10(x) / 3), m = x / 10 ** (3 * k); return `${m.toFixed(m >= 100 ? 0 : 1)}${' KMBT'[k]}`; }
  const e = Math.floor(L10(x) + 1e-9), m = x / 10 ** e;
  return `${m.toFixed(1)}e${e}`;
}
