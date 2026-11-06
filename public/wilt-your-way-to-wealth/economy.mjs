// Wilt Your Way to Wealth: the rules. The page and the pacing sim (sim.mjs) both import this.
// Kites blow onto Tumble Hill caked in mud. Scratch the mud off (the page measures real pixels; the
// sim models it) and the kite is recycled into scrap. Scrap sells on the Scrap Exchange, whose prices
// drift on their own and sag when you sell a lot of one thing at once (you are the only supplier).

export const GOAL = 1_000_000;      // dollars earned, all time: the seven figures
export const KITE_AREA = 15000;     // mud on a paper diamond, in canvas pixels (the page's kite is this big)
export const DONE = 0.9;            // scratched clean enough to recycle
export const RECOVER = 25;         // seconds for a flooded price to win back two thirds of its sag

export const MATS = {
  paper:   { name: 'Paper',       unit: 'sheets',  base: 1,   depth: 120,  tier: 0 },
  string:  { name: 'String',      unit: 'yards',   base: 1.5, depth: 160,  tier: 0 },
  silk:    { name: 'Silk',        unit: 'panels',  base: 8,   depth: 80,  tier: 1 },
  bamboo:  { name: 'Bamboo',      unit: 'spars',   base: 5,   depth: 100,  tier: 1 },
  ripstop: { name: 'Ripstop',     unit: 'panels',  base: 45,  depth: 40,  tier: 3 },
  gold:    { name: 'Gold thread', unit: 'spools',  base: 250, depth: 6,   tier: 4 },
};
export const MAT_IDS = Object.keys(MATS);

export const KITES = {
  diamond: { name: 'paper diamond',  tier: 0, area: 1.0,  yield: { paper: 4, string: 2 } },
  delta:   { name: 'silk delta',     tier: 1, area: 1.12, yield: { silk: 3, bamboo: 1, string: 3 } },
  box:     { name: 'box kite',       tier: 2, area: 1.25, yield: { bamboo: 12, paper: 10, silk: 6, string: 8 } },
  stunt:   { name: 'stunt kite',     tier: 3, area: 1.3,  yield: { ripstop: 7, bamboo: 6, string: 12 } },
  dragon:  { name: 'dragon kite',    tier: 4, area: 1.55, yield: { gold: 2, silk: 16, ripstop: 5, string: 16 } },
};
export const KITE_IDS = Object.keys(KITES);

// Leveled lines: one cell each in the shop, with a count.
export const LINES = {
  stalk:  { name: 'Grow Taller', costs: [150, 2500, 30000, 220000],
            levels: ['Grow Taller', 'Grow Taller', 'Grow Taller', 'Grow Taller'] },
  scrape: { name: 'Scraper', costs: [40, 900, 9000, 70000, 400000], radius: [11, 13, 16, 19, 23, 28],
            levels: ['Thorn File', 'Leaf Edge', 'Second Leaf', 'Old Rake', 'Petal Comb'] },
  steady: { name: 'Steady Stem', costs: [70, 1500, 16000, 120000, 600000], speed: [380, 480, 610, 760, 950, 1150],
            levels: ['Lolly Stick', 'Twine Brace', 'Bamboo Stake', 'Trellis', 'Posture Coach'] },
  advert: { name: 'Advertise', costs: [300, 5000, 50000, 300000], depth: [1, 2.5, 6, 15, 40],
            levels: ['SCRAP WANTED sign', 'Classified ad', 'Billboard', 'Newsletter'] },
};
export const STALK_NAMES = ['knee-high', 'waist-high', 'head-high', 'lamp-post-high', 'cloud-high'];

// One-time upgrades. kind: 'odd' is a silly one-off. need: stalk tier required to show.
export const UP = {
  mirror:   { name: 'Affirmation Mirror', cost: 25, kind: 'odd', need: 0,
              desc: 'A shard of mirror propped against a stone, for morning affirmations. Does nothing to the economy.' },
  ticker:   { name: 'Ticker Tape', cost: 60, need: 0,
              desc: 'A strip of kite paper that remembers prices. Every scrap gets a two-minute price chart, so you can sell at the top.' },
  patch:    { name: 'Patch Kit', cost: 220, need: 0,
              desc: 'Glue and offcuts. A tear costs the kite 4% of its grade instead of 7%.' },
  worms:    { name: 'Worm Hotel', cost: 1200, need: 1,
              desc: 'A cosy layer of leaf litter. Every earthworm cleans twice as fast.' },
  press:    { name: 'Sail Press', cost: 450, need: 1,
              desc: 'Two flat stones. Flattened paper goes further: +50% paper from every kite.' },
  splitter: { name: 'Bamboo Splitter', cost: 2200, need: 1,
              desc: 'Split a cracked spar into two good ones: +50% bamboo from every kite.' },
  testimonial: { name: 'Worm Testimonial', cost: 800, kind: 'odd', need: 1,
              desc: 'A satisfied customer, on the record. Pinned to the stalk. Does nothing.' },
  magpie:   { name: 'Magpie Broker', cost: 6500, need: 2,
              desc: 'A magpie in a little visor. Every few seconds it sells the easy part of any scrap that is trading at or above its usual price, and keeps going while you are away.' },
  vane:     { name: 'Weathervane', cost: 9000, need: 2,
              desc: 'A tin rooster on the top leaf. Sky events blow in about half as often again.' },
  iron:     { name: 'Silk Iron', cost: 8000, need: 2,
              desc: 'A warm flat stone for the creases: +50% silk from every kite.' },
  vision:   { name: 'Vision Board', cost: 5000, kind: 'odd', need: 2,
              desc: 'Kite paper, glue and a dream: a picture of a million dollars, and forty folding chairs, full. Does nothing.' },
  compost:  { name: 'Compost Heap', cost: 30000, need: 3,
              desc: 'The worms eat the mud and make more soil, which makes more worms happy. Every earthworm cleans twice as fast again.' },
  shears:   { name: 'Ripstop Shears', cost: 35000, need: 3,
              desc: 'Cut round the tears instead of through them: +50% ripstop from every kite.' },
  snail:    { name: 'Detective Snail', cost: 25000, kind: 'odd', need: 3,
              desc: 'Hire a snail to find out who L.K.C. is. Does nothing, slowly.' },
  lanyard:  { name: 'VIP Lanyard', cost: 20000, kind: 'odd', need: 3,
              desc: 'Woven from the best string. For the first attendee of the seminar. Does nothing (yet).' },
  tweezers: { name: 'Gold Tweezers', cost: 120000, need: 4,
              desc: 'Pick the gold thread out of the knots: +50% gold thread from every dragon kite.' },
  chairs:   { name: 'Forty Folding Chairs', cost: 90000, kind: 'odd', need: 4,
              desc: 'Set out on the hilltop for the seminar, in rows. For the attendees. Who will come. Does nothing.' },
};
export const UP_IDS = Object.keys(UP);

export const EVENTS = {
  gust:    { name: 'Gust', secs: 30 },     // kites arrive three times as fast
  rain:    { name: 'Drizzle', secs: 40 },  // worms come up: twice as fast
  dew:     { name: 'Heavy Dew', secs: 30 },// soft mud: scraper half again as wide
  rumour:  { name: 'Rumour', secs: 45 },   // one scrap's price ×1.8
  glut:    { name: 'Glut', secs: 45 },     // one scrap's price ×0.55
  fireball:{ name: 'Fireball', secs: 12 }, // a slow Taurid: the valley looks up and lets go: a kite shower
};

// ---------- RNG (seedable so the sim is repeatable) ----------
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
let R = Math.random;
export const setRandom = f => { R = f; };

export function newState() {
  const mk = {};
  for (const m of MAT_IDS) mk[m] = { drift: 0, sat: 1, hist: [], shock: 1 };
  return {
    t: 0, cash: 0, earned: 0, kites: 0, tears: 0, sold: 0,
    tier: 0, lv: { scrape: 0, steady: 0, advert: 0 }, wormN: 0, lines: 0,
    up: {}, inv: Object.fromEntries(MAT_IDS.map(m => [m, 0])), mk,
    queue: 1, arrive: 0, cur: null,
    ev: null, nextEv: 100, evN: 0, evCount: {},
    seen: [], show: null, ended: false, magT: 0, histT: 0,
    lastSeen: Date.now(),
  };
}

// ---------- Derived numbers ----------
export const radius = S => LINES.scrape.radius[S.lv.scrape] * (S.ev?.id === 'dew' ? 1.5 : 1);
export const tearSpeed = S => LINES.steady.speed[S.lv.steady];
export const tearCost = S => S.up.patch ? 0.04 : 0.07;
export const depthMult = S => LINES.advert.depth[S.lv.advert];
export const wormEach = S => 460 * (S.up.worms ? 2 : 1) * (S.up.compost ? 2 : 1) * (S.ev?.id === 'rain' ? 2 : 1); // px²/s
export const wormRate = S => S.wormN * wormEach(S);
export const wormCost = S => Math.round(25 * Math.pow(1.13, S.wormN));
export const lineCost = S => Math.round(15 * Math.pow(1.24, S.lines));
export const arriveEvery = S => 6.5 * Math.pow(0.88, S.lines) / (S.ev?.id === 'gust' ? 3 : 1);
export const queueCap = S => 3 + Math.floor(S.lines / 2) + (S.ev?.id === 'fireball' ? 6 : 0);
export const lineCostOf = (S, id) => LINES[id].costs[id === 'stalk' ? S.tier : S.lv[id]];
export const lineMax = (S, id) => (id === 'stalk' ? S.tier : S.lv[id]) >= LINES[id].costs.length;
export const unlockedMats = S => MAT_IDS.filter(m => MATS[m].tier <= S.tier);
export const yieldMult = (S, m) => (m === 'paper' && S.up.press) || (m === 'bamboo' && S.up.splitter) || (m === 'silk' && S.up.iron)
  || (m === 'ripstop' && S.up.shears) || (m === 'gold' && S.up.tweezers) ? 1.5 : 1;
export const evGap = S => (S.up.vane ? 0.66 : 1) * (75 + R() * 50);

// Which kites the wind brings: everything you can reach, mostly the highest.
export function kiteWeights(S) {
  const out = [];
  for (const k of KITE_IDS) {
    const t = KITES[k].tier;
    if (t > S.tier) continue;
    out.push([k, t === S.tier ? 5 : t === S.tier - 1 ? 2.2 : 1]);
  }
  return out;
}
function pickKite(S) {
  const w = kiteWeights(S); let x = R() * w.reduce((a, [, v]) => a + v, 0);
  for (const [k, v] of w) { if ((x -= v) <= 0) return k; }
  return w[w.length - 1][0];
}
export function newKite(S) {
  S.cur = { type: pickKite(S), clean: 0, grade: 1, tears: 0 };
  return S.cur;
}
export const kiteArea = k => KITE_AREA * KITES[k.type].area;

// Unit price right now: fair value (drift and shocks around the base) times saturation.
export const fair = (S, m) => MATS[m].base * Math.exp(S.mk[m].drift) * S.mk[m].shock;
export const price = (S, m) => fair(S, m) * S.mk[m].sat;
export const depth = (S, m) => MATS[m].depth * 6 * depthMult(S);
// What selling q units brings in (prices sag as you sell).
export function quote(S, m, q = S.inv[m]) {
  const d = depth(S, m);
  return fair(S, m) * d * S.mk[m].sat * (1 - Math.exp(-q / d));
}
export function sell(S, m, q = S.inv[m]) {
  q = Math.min(q, S.inv[m]);
  if (q <= 0) return 0;
  const got = quote(S, m, q);
  S.mk[m].sat *= Math.exp(-q / depth(S, m));
  S.inv[m] -= q; if (S.inv[m] < 1e-9) S.inv[m] = 0;
  S.cash += got; S.earned += got; S.sold += got;
  return got;
}
export const kiteValue = (S, type) => Object.entries(KITES[type].yield).reduce((a, [m, q]) => a + q * yieldMult(S, m) * MATS[m].base, 0);

// The kite on the board is clean: scrap goes to the store, the next one comes up.
export function recycle(S) {
  const k = S.cur; if (!k) return null;
  const got = {};
  for (const [m, q] of Object.entries(KITES[k.type].yield)) {
    const n = q * yieldMult(S, m) * k.grade;
    S.inv[m] += n; got[m] = n;
  }
  S.kites++;
  S.cur = null;
  return { type: k.type, grade: k.grade, got };
}
// Next kite from the queue, if any.
export function nextKite(S) {
  if (S.cur || S.queue < 1) return null;
  S.queue--;
  return newKite(S);
}
export function tear(S) {
  if (!S.cur) return;
  S.cur.grade = Math.max(0.3, S.cur.grade - tearCost(S)); S.cur.tears++; S.tears++;
}

// ---------- Time ----------
// One tick: kites arrive, worms clean, markets drift and recover, the magpie trades, events come and go.
// Returns notable things for the page: { arrived, magpie: [[mat, q, $]], ev: 'start'|'end' }.
export function step(S, dt, { worms = true } = {}) {
  const out = { arrived: 0, magpie: null, ev: null };
  if (S.ended) return out;
  S.t += dt;
  // Arrivals
  if (!S.show) {
    S.arrive += dt;
    const every = arriveEvery(S);
    while (S.arrive >= every) {
      S.arrive -= every;
      if (S.queue < queueCap(S)) { S.queue++; out.arrived++; }
      else S.arrive = 0;
    }
  }
  // Worms (the page can do the scratching itself and pass worms: false)
  if (worms && S.cur && S.wormN) {
    S.cur.clean += wormRate(S) * dt / kiteArea(S.cur);
  }
  // Markets: fair value wanders (mean-reverting), saturation recovers.
  for (const m of MAT_IDS) {
    const k = S.mk[m];
    k.drift = k.drift * Math.exp(-dt / 80) + (R() - 0.5) * 0.11 * Math.sqrt(dt);
    k.drift = Math.max(-0.4, Math.min(0.4, k.drift));
    k.sat += (1 - k.sat) * (1 - Math.exp(-dt / RECOVER));
  }
  S.histT += dt;
  if (S.histT >= 2) {
    S.histT = 0;
    for (const m of MAT_IDS) { const h = S.mk[m].hist; h.push(+price(S, m).toPrecision(4)); if (h.length > 60) h.shift(); }
  }
  // The magpie: sells the part of each holding that keeps the price at three quarters or better.
  if (S.up.magpie) {
    S.magT += dt;
    if (S.magT >= 4) {
      S.magT = 0; const sold = [];
      for (const m of unlockedMats(S)) {
        if (S.inv[m] <= 0 || fair(S, m) < MATS[m].base * 0.98) continue;
        const q = Math.min(S.inv[m], depth(S, m) * Math.log(S.mk[m].sat / 0.75));
        if (q > 0.05) sold.push([m, q, sell(S, m, q)]);
      }
      if (sold.length) out.magpie = sold;
    }
  }
  // Events
  if (S.ev) {
    if (S.t >= S.ev.until) { endEvent(S); out.ev = 'end'; }
  } else if (!S.show && S.t >= S.nextEv) { startEvent(S); out.ev = 'start'; }
  return out;
}

export function eventPool(S) {
  const p = ['gust', 'rumour', 'dew'];
  if (S.wormN > 0) p.push('rain');
  if (S.tier >= 1) p.push('glut');
  if (S.kites >= 20) p.push('fireball');
  return p;
}
export function startEvent(S, id) {
  const pool = eventPool(S);
  if (!id) {
    // Never the same one twice in a row; the first fireball comes early (it's the season for them).
    const last = S.lastEv;
    const opts = pool.filter(e => e !== last);
    id = !S.evCount.fireball && pool.includes('fireball') && S.evN >= 2 ? 'fireball' : opts[Math.floor(R() * opts.length)];
  }
  const mats = unlockedMats(S);
  const ev = { id, until: S.t + EVENTS[id].secs, mat: null };
  if (id === 'rumour' || id === 'glut') {
    ev.mat = mats[Math.floor(R() * mats.length)];
    S.mk[ev.mat].shock = id === 'rumour' ? 1.8 : 0.55;
  }
  if (id === 'fireball') S.queue = Math.min(queueCap({ ...S, ev }), S.queue + 6);
  S.ev = ev; S.evN++; S.evCount[id] = (S.evCount[id] || 0) + 1; S.lastEv = id;
  return ev;
}
export function endEvent(S) {
  if (S.ev?.mat) S.mk[S.ev.mat].shock = 1;
  S.ev = null; S.nextEv = S.t + evGap(S);
}

// ---------- Buying ----------
export function shown(S, id) { return UP[id].need <= S.tier; }
export function items(S) { return UP_IDS.filter(id => !S.up[id] && shown(S, id)).map(id => ({ id, ...UP[id] })); }
export function bought(S) { return UP_IDS.filter(id => S.up[id]).map(id => ({ id, ...UP[id] })); }
export function buy(S, id) {
  const u = UP[id]; if (!u || S.up[id] || !shown(S, id) || S.cash < u.cost) return false;
  S.cash -= u.cost; S.up[id] = 1; return true;
}
export function buyLine(S, id) {
  if (lineMax(S, id)) return false;
  const c = lineCostOf(S, id); if (S.cash < c) return false;
  S.cash -= c;
  if (id === 'stalk') S.tier++; else S.lv[id]++;
  return true;
}
export function buyWorm(S) { const c = wormCost(S); if (S.cash < c) return false; S.cash -= c; S.wormN++; return true; }
export function buySnag(S) { const c = lineCost(S); if (S.cash < c) return false; S.cash -= c; S.lines++; return true; }
// What's in the shop (repeatables first). Worms show once you can nearly afford one.
export const wormsOpen = S => S.kites >= 4 || S.wormN > 0;
export const snagOpen = S => S.kites >= 2 || S.lines > 0;

// ---------- The showdown ----------
export const ready = S => S.earned >= GOAL && S.tier >= 4 && !S.show && !S.ended;
export const TREMENDOUS_AREA = KITE_AREA * 3.2;
export function startShowdown(S) { S.show = { clean: 0, grade: 1, tears: 0, t: 0 }; S.ev && endEvent(S); return S.show; }

// ---------- Time away ----------
// Worms keep cleaning, slowly (nobody waves the kites in), for up to two hours, and L.K.C. comes up
// the hill and buys what they clean: half the usual price, or three quarters through the magpie.
// It comes to about a thirtieth of what the hill makes while you're playing (what the market would take).
export const AWAY_CAP = 2 * 3600;
export function rates(S) {
  const w = kiteWeights(S), tot = w.reduce((a, [, v]) => a + v, 0);
  const area = w.reduce((a, [k, v]) => a + kiteArea({ type: k }) * v / tot, 0);
  const kps = Math.min((wormRate(S) + 2 * radius(S) * tearSpeed(S) * 0.25) / area, 1 / arriveEvery(S));
  const per = Object.fromEntries(MAT_IDS.map(m => [m, 0]));
  for (const [k, v] of w) for (const [m, q] of Object.entries(KITES[k].yield)) per[m] += kps * q * yieldMult(S, m) * v / tot;
  return { kps, per };
}
export function offline(S, secs) {
  secs = Math.min(secs, AWAY_CAP);
  if (secs < 60 || S.ended || S.show || !S.wormN) return null;
  const { kps, per } = rates(S);
  const cut = S.up.magpie ? 0.75 : 0.5;
  const sold = {};
  let cash = 0;
  for (const m of MAT_IDS) {
    sold[m] = Math.min(per[m], depth(S, m) * 0.4 / RECOVER) * secs * 0.03;
    cash += sold[m] * MATS[m].base * cut;
  }
  const n = Math.floor(kps * secs * 0.03);
  S.kites += n; S.cash += cash; S.earned += cash; S.sold += cash;
  S.queue = queueCap(S);
  for (const m of MAT_IDS) S.mk[m].sat = 1;
  return { secs, kites: n, cash, sold };
}

export function fmt(n) {
  if (n < 10) return n.toFixed(n < 1 && n > 0 ? 2 : (n % 1 ? 1 : 0)).replace(/\.0$/, '');
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n < 1e5 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') : Math.floor(n / 1e3)) + 'k';
  return (n / 1e6).toFixed(n < 1e7 ? 2 : 1) + 'M';
}
export const money = n => '$' + (n < 100 ? (n < 10 ? n.toFixed(2) : n.toFixed(1).replace(/\.0$/, '')) : n < 1e6 ? Math.floor(n).toLocaleString('en-US') : (n / 1e6).toFixed(2) + 'M');
