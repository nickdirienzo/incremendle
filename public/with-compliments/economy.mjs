// With Compliments: the rules. The page and the pacing sim (sim.mjs) both import this.
// Castle Pardon plants a rainbow on every grey acre of Baron Brume's estate, region by region, as far as
// its light reaches. The grey only goes down. Crowns come from the tenants' orders (Estate Regulation 1
// forbids paint; rainbows are not paint), each pinned to a plot with a deadline. Spout, the gargoyle,
// stamps every order APPROVED or DECLINED; once hired he throws the approved ones himself, and when
// there's nothing he approves of he files rainbows on whatever grey is furthest away.

// ---------- The estate ----------
// World units: the page draws an 800 × 460 scene; the ground is at y = GROUND, and every rainbow leaves
// the castle's tower window at LAUNCH.
export const W = 800, H = 460, GROUND = 404;
export const LAUNCH = { x: 106, y: 168 };
export const GRAV = 300;

export const REGIONS = [
  { id: 'fields', name: 'the Turnip Fields', short: 'Turnip Fields', pay: 4 },
  { id: 'orchard', name: 'the Orchard', short: 'Orchard', pay: 10, cost: 50,
    reach: 'A Taller Tower', desc: 'Two more storeys on the east tower. The light leaves from higher up and lands further off.',
    joke: 'Planning permission was sought, from the castle, by the castle. It was granted, with thanks.' },
  { id: 'village', name: 'Brumewick', short: 'Brumewick', pay: 24, cost: 260,
    reach: 'The Rose Window', desc: 'A round window of twelve petals at the top of the tower. More light, further: the rainbows reach the village.',
    joke: 'Twelve petals, each a different shade of apology.' },
  { id: 'moor', name: 'the Moor', short: 'the Moor', pay: 55, cost: 1000,
    reach: 'A Trebuchet (Decorative)', desc: 'Castles have trebuchets. This one is purely ornamental, and also reaches the moor.',
    joke: 'It has never thrown anything unkind. It is not sure it would know how.' },
  { id: 'hall', name: 'Brume Hall', short: 'Brume Hall', pay: 110, cost: 9000,
    reach: 'The Great East Window', desc: 'The east wall, entirely glass. Light enough to reach the Baron’s own front door.',
    joke: 'The wall was load-bearing. The castle has decided to bear it some other way.' },
];
// x ranges in world units, left to right; acres of grey on each.
export const PLOTS = [
  { r: 0, x0: 196, x1: 246, acres: 80, name: 'Turnip Field No. 1' },
  { r: 0, x0: 246, x1: 296, acres: 100, name: 'Turnip Field No. 2' },
  { r: 0, x0: 296, x1: 346, acres: 120, name: 'Turnip Field No. 3' },
  { r: 1, x0: 346, x1: 389, acres: 500, name: 'The Sour Orchard' },
  { r: 1, x0: 389, x1: 432, acres: 550, name: 'The Pig Paddock' },
  { r: 1, x0: 432, x1: 476, acres: 650, name: 'The Other Orchard' },
  { r: 2, x0: 476, x1: 507, acres: 1100, name: 'Brumewick Green' },
  { r: 2, x0: 507, x1: 538, acres: 1200, name: 'The Duck Pond' },
  { r: 2, x0: 538, x1: 569, acres: 1300, name: 'Mrs Dabb’s' },
  { r: 2, x0: 569, x1: 600, acres: 1400, name: 'The Pound' },
  { r: 3, x0: 600, x1: 633, acres: 8500, name: 'The Moor' },
  { r: 3, x0: 633, x1: 666, acres: 9800, name: 'More Moor' },
  { r: 3, x0: 666, x1: 700, acres: 10700, name: 'The Bog' },
  { r: 4, x0: 700, x1: 742, acres: 25000, name: 'The Grounds' },
  { r: 4, x0: 742, x1: 790, acres: 39000, name: 'Brume Hall' },
];
export const TOTAL = PLOTS.reduce((a, p) => a + p.acres, 0); // 100,000
export const reachX = S => REGIONS[S.reach + 1] ? PLOTS.filter(p => p.r <= S.reach).at(-1).x1 : PLOTS.at(-1).x1;
export const plotAt = x => PLOTS.findIndex(p => x >= p.x0 && x < p.x1);
export const reachable = (S, i) => PLOTS[i].r <= S.reach;

// ---------- Orders ----------
// Spout approves of the dutiful and declines the festive. The festive ones carry a surcharge.
export const OCCASIONS = [
  { what: 'over the sad pig', ok: true, why: 'The pig’s sadness is on file.' },
  { what: 'for the tax assessor’s retirement', ok: true, why: 'Proper.' },
  { what: 'in memory of a well-liked hen', ok: true, why: 'Fitting.' },
  { what: 'over the turnips, for morale', ok: true, why: 'The turnips have earned it.' },
  { what: 'for the parish council’s 400th meeting', ok: true, why: 'Long overdue.' },
  { what: 'to mark the new drainage ditch', ok: true, why: 'At last, an occasion.' },
  { what: 'for Mrs Dabb, who is sorry', ok: true, why: 'Apologies are always in order.' },
  { what: 'for the opening of a filing cabinet', ok: true, why: 'Splendid.' },
  { what: 'for a wedding', ok: false, why: 'Vulgar.' },
  { what: 'for Gran’s 90th birthday', ok: false, why: 'Birthdays only encourage further birthdays.' },
  { what: 'for no reason at all', ok: false, why: 'Irregular.' },
  { what: 'for a picnic', ok: false, why: 'Picnics invite ants.' },
  { what: 'for a goat’s naming day', ok: false, why: 'The goat has not applied in writing.' },
  { what: 'to cheer up the scarecrow', ok: false, why: 'The scarecrow knew the job.' },
  { what: 'for a surprise party', ok: false, why: 'Surprises are not on the schedule.' },
  { what: 'for the village fête', ok: false, why: 'Fêtes are frivolous.' },
];
export const SURCHARGE = 2;           // festive orders pay double
export const DEADLINE = [30, 45];     // seconds to land it
export const ORDER_GAP = [2.5, 5];    // seconds before an empty slot fills again

// ---------- Upgrades ----------
// kind: win (more acres per rainbow), fee, board (order slots), spout, tray (Spout's speed), aim, odd.
export const ITEMS = [
  { id: 'window', kind: 'win', max: 72, base: 8, grow: 1.115, name: 'A New Window',
    desc: 'Another stained-glass window in the castle wall. More light through the glass, a wider rainbow, more acres to a rainbow.',
    joke: 'Spout: “Another one.” He did not say it as a question.' },
  { id: 'plumb', kind: 'aim', base: 24, name: 'A Plumb Line', show: 6,
    desc: 'A weighted string from the tower window. You can see the whole arc of a rainbow before you let it go, not just the start.',
    joke: 'Spout has a plumb line of his own. It hangs perfectly straight, out of principle.' },
  { id: 'board', kind: 'board', max: 3, base: 36, grow: 5, name: 'A Notice Board',
    desc: 'A notice board by the drawbridge, where the tenants pin their orders. One more order can be open at a time.',
    joke: 'Pinned to it, in the castle’s hand: “Orders taken. No order too small. Some orders too festive (see Spout).”' },
  { id: 'flag', kind: 'odd', base: 15, name: 'A Flag Saying SORRY', show: 4,
    desc: 'A small pennant for the east tower, facing the Baron’s estate.',
    joke: 'It doesn’t say what for. It doesn’t need to. Spout: “Too large.” It is four inches across.' },
  { id: 'spout', kind: 'spout', base: 260, name: 'Hire Spout', after: 1,
    desc: 'Put Spout on the payroll (one bucket of rainwater a week). He throws the orders he approves of himself, and files rainbows on the furthest grey when there are none.',
    joke: 'Spout accepts the post. He has a list of conditions. All of them are about weddings.' },
  { id: 'fee', kind: 'fee', max: 8, base: 45, grow: 2.1, name: 'A Fee Schedule',
    desc: 'A printed scale of charges, nailed to the west tower. Every order pays a quarter more, per edition.',
    joke: 'Item 14: rainbow, standard. Item 15: rainbow, with sincere regret (no extra charge).' },
  { id: 'mat', kind: 'odd', base: 40, name: 'A Doormat (WELCOME)', show: 2,
    desc: 'For the drawbridge. It says WELCOME. That’s all it says.',
    joke: 'Spout: “Welcome to whom?” The castle didn’t answer. The castle had someone in mind.' },
  { id: 'tray', kind: 'tray', max: 12, base: 160, grow: 1.6, name: 'Spout’s In-Tray', needs: 'spout',
    desc: 'A wire tray for Spout’s paperwork. He gets through the approved orders faster.',
    joke: 'He stamps a thing, then puts it in the tray, then takes it out, then stamps it again. That is the system.' },
  { id: 'pot', kind: 'odd', base: 110, name: 'A Pot of Gold (Empty)', after: 1,
    desc: 'Rainbows are supposed to end in one. The budget runs to the pot.',
    joke: 'The gold will follow when the grant is restored. Spout: “It won’t be.” The pot sits at the end of a rainbow anyway, for form’s sake.' },
  { id: 'monocle', kind: 'odd', base: 380, name: 'Spout’s Monocle', needs: 'spout',
    desc: 'For reading the small print on orders. He doesn’t need it. He wanted it.',
    joke: 'His opinions are now considered opinions. They are the same opinions.' },
  { id: 'prism', kind: 'win', base: 900, name: 'The Chapel Prism', after: 2, mult: 1.5,
    desc: 'The glass drop from the chapel chandelier, hung in the tower. Every rainbow comes out half again as wide.',
    joke: 'The chapel has been asked. The chapel said yes, but quietly, the way chapels do.' },
  { id: 'key', kind: 'odd', base: 1200, name: 'A Spare Key (Under the Mat)', after: 2,
    desc: 'A spare key to the castle, under the WELCOME mat, where anyone would look.',
    joke: 'In case anyone ever needs to let themselves in. Anyone at all. Spout: “Anyone?” The castle: “Anyone.”' },
  { id: 'double', kind: 'win', base: 4000, name: 'A Double Rainbow', after: 3,
    desc: 'A second, fainter rainbow over the first. Half the acres again, on the plot beyond the one you hit.',
    joke: 'The second one is the first one saying it again, in case it wasn’t clear the first time.' },
  { id: 'spoutbow', kind: 'odd', base: 8000, name: 'A Rainbow for Spout', after: 4, needs: 'spout',
    desc: 'A very small rainbow of his own, planted over his head on the battlement.',
    joke: 'Spout: “Declined.” The rainbow stays where it is. Spout stays where he is. Neither of them mentions it again.' },
  { id: 'basket', kind: 'odd', base: 6000, name: 'A Fruit Basket for the Baron', after: 4,
    desc: 'Pears, a pineapple and a card. Left on the step of Brume Hall.',
    joke: 'The card reads: “With compliments.” Nothing else. It is the most threatening thing the castle has ever written.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export function defaults() {
  return {
    v: 1, t: 0, crowns: 0, grey: PLOTS.map(p => p.acres), reach: 0,
    lv: { window: 0, board: 0, fee: 0, tray: 0 }, one: {},
    orders: [], orderT: 3, nextId: 1, spoutT: 0, shown: false,
    seen: {}, thrown: 0, filled: 0, missed: 0, spoutN: 0, earned: 0,
    finale: false, ended: false, boughtOpen: false, savedAt: 0, letters: 0, occ: 0,
  };
}
export function load(raw) {
  const S = defaults();
  if (raw && typeof raw === 'object') {
    Object.assign(S, raw);
    S.lv = Object.assign(defaults().lv, raw.lv || {});
    S.one = Object.assign({}, raw.one || {});
    if (!Array.isArray(S.grey) || S.grey.length !== PLOTS.length) S.grey = PLOTS.map(p => p.acres);
    if (!Array.isArray(S.orders)) S.orders = [];
    S.seen = Object.assign({}, raw.seen || {});
  }
  // A finished save is the finished world: every acre in colour, everything bought.
  if (S.ended) {
    S.grey = PLOTS.map(() => 0); S.reach = REGIONS.length - 1; S.orders = []; S.shown = true;
    for (const it of ITEMS) { if (it.max) S.lv[it.id] = Math.max(S.lv[it.id] || 0, it.max); else S.one[it.id] = true; }
  }
  return S;
}

// ---------- Numbers ----------
export const greyLeft = S => S.grey.reduce((a, g) => a + g, 0);
export const regionGrey = (S, r) => PLOTS.reduce((a, p, i) => a + (p.r === r ? S.grey[i] : 0), 0);
export const regionAcres = r => PLOTS.reduce((a, p) => a + (p.r === r ? p.acres : 0), 0);
// Acres of colour one rainbow plants.
export function size(S) {
  let s = 1 + 0.2 * S.lv.window;
  if (S.one.prism) s *= BY_ID.prism.mult;
  return s;
}
export const feeMult = S => 1 + 0.25 * S.lv.fee;
export const slots = S => 2 + S.lv.board;
export const spoutEvery = S => 9 / (1 + 0.4 * S.lv.tray);   // seconds between Spout's throws
export const orderPay = (S, o) => Math.round(REGIONS[PLOTS[o.plot].r].pay * (o.festive ? SURCHARGE : 1) * feeMult(S));
export const phase = S => S.ended || S.finale ? 'end' : S.reach >= 4 ? 'hall' : S.reach >= 2 ? 'village' : 'fields';
export const done = S => greyLeft(S) <= 0;
export const fmt = n => {
  n = Math.max(0, n);
  if (n < 10 && n % 1) return n.toFixed(1).replace(/\.0$/, '');
  return Math.round(n).toLocaleString('en-GB');
};

// ---------- Landing a rainbow ----------
// i: the plot it landed on (or -1 for the moat). Returns what happened, for the page to draw and say.
export function land(S, i, who = 'you') {
  const r = { acres: 0, order: null, pay: 0, extra: 0 };
  if (who === 'you') S.thrown++;
  if (i < 0 || !reachable(S, i)) return r;
  const s = size(S);
  r.acres = Math.min(S.grey[i], s); S.grey[i] -= r.acres;
  if (S.grey[i] < 1e-6) S.grey[i] = 0;
  // The double rainbow lands its second foot on the plot beyond (or the nearest grey one reachable).
  if (S.one.double) {
    let j = i + 1;
    if (!(j < PLOTS.length && reachable(S, j) && S.grey[j] > 0)) j = nearestGrey(S, i);
    if (j >= 0) { r.extra = Math.min(S.grey[j], s * 0.5); S.grey[j] -= r.extra; if (S.grey[j] < 1e-6) S.grey[j] = 0; r.extraPlot = j; }
  }
  // An order on this plot: the soonest-due one (by hand you can land any; Spout only lands his).
  const mine = S.orders.filter(o => o.plot === i && (who === 'you' || o.ok)).sort((a, b) => a.due - b.due)[0];
  if (mine) {
    r.order = mine; r.pay = orderPay(S, mine);
    S.crowns += r.pay; S.earned += r.pay; S.filled++;
    S.orders = S.orders.filter(o => o !== mine);
  }
  return r;
}
function nearestGrey(S, i) {
  let best = -1, bd = 1e9;
  PLOTS.forEach((p, j) => { if (j !== i && reachable(S, j) && S.grey[j] > 0 && Math.abs(j - i) < bd) { bd = Math.abs(j - i); best = j; } });
  return best;
}
// Where Spout aims: the soonest approved order; failing that, the furthest grey within reach.
export function spoutTarget(S) {
  const o = S.orders.filter(o => o.ok).sort((a, b) => a.due - b.due)[0];
  if (o) return o.plot;
  for (let i = PLOTS.length - 1; i >= 0; i--) if (reachable(S, i) && S.grey[i] > 0) return i;
  return -1;
}

// ---------- Time ----------
// rnd: a 0..1 random source. Returns a list of events: { type: 'order' | 'lapse' | 'spout', ... }.
export function tick(S, dt, rnd = Math.random) {
  const ev = [];
  if (S.ended || S.finale) return ev;
  S.t += dt;
  if (S.shown) {
    for (const o of S.orders) o.due -= dt;
    for (const o of S.orders.filter(o => o.due <= 0)) { S.missed++; ev.push({ type: 'lapse', order: o }); }
    S.orders = S.orders.filter(o => o.due > 0);
    if (S.orders.length < slots(S) && !done(S)) {
      S.orderT -= dt;
      if (S.orderT <= 0) { S.orderT = ORDER_GAP[0] + rnd() * (ORDER_GAP[1] - ORDER_GAP[0]); ev.push({ type: 'order', order: newOrder(S, rnd) }); }
    }
  }
  if (S.one.spout) {
    S.spoutT += dt;
    if (S.spoutT >= spoutEvery(S)) {
      S.spoutT = 0;
      const i = spoutTarget(S);
      if (i >= 0) ev.push({ type: 'spout', plot: i });
    }
  }
  return ev;
}
export function newOrder(S, rnd = Math.random) {
  // Mostly the newest region (the tenants there have just seen what a rainbow is), some anywhere in reach.
  const open = PLOTS.map((p, i) => i).filter(i => reachable(S, i));
  const fresh = open.filter(i => PLOTS[i].r === S.reach);
  const busy = new Set(S.orders.map(o => o.plot));
  let pool = (rnd() < 0.6 ? fresh : open).filter(i => !busy.has(i));
  if (!pool.length) pool = open.filter(i => !busy.has(i));
  if (!pool.length) pool = open;
  const plot = pool[Math.floor(rnd() * pool.length)];
  // Occasions in a shuffled-ish rotation so the same one doesn't come twice running.
  S.occ = (S.occ + 1 + Math.floor(rnd() * 5)) % OCCASIONS.length;
  const oc = OCCASIONS[S.occ];
  const due = DEADLINE[0] + rnd() * (DEADLINE[1] - DEADLINE[0]);
  const o = { id: S.nextId++, plot, occ: S.occ, ok: oc.ok, festive: !oc.ok, due, total: due };
  S.orders.push(o);
  return o;
}

// ---------- Offline ----------
// Away time is credited at 15% for up to two hours: Spout keeps throwing. Half his rainbows go to
// approved orders (paid at the newest region's rate, as many as turn up), the rest to the furthest grey.
export const OFFLINE_CAP = 2 * 3600, OFFLINE_RATE = 0.15;
export function offline(S, secs) {
  if (!S.one.spout || S.ended || secs < 60) return null;
  const s = Math.min(secs, OFFLINE_CAP) * OFFLINE_RATE;
  const n = Math.floor(s / spoutEvery(S));
  if (!n) return null;
  // Approved orders turn up about one every sixteen seconds.
  const paid = Math.min(Math.floor(n / 2), Math.floor(s / 16));
  const pay = Math.round(REGIONS[S.reach].pay * feeMult(S)) * paid;
  S.crowns += pay; S.earned += pay; S.spoutN += n;
  let acres = 0, left = (n - paid) * size(S);
  for (let i = PLOTS.length - 1; i >= 0 && left > 0; i--) {
    if (!reachable(S, i)) continue;
    const a = Math.min(S.grey[i], left); S.grey[i] -= a; left -= a; acres += a;
  }
  S.t += 0; // time away isn't time played
  return { secs: Math.min(secs, OFFLINE_CAP), n, pay, acres };
}

// ---------- Reach ----------
export const nextReach = S => REGIONS[S.reach + 1] || null;
export function extend(S) {
  const R = nextReach(S);
  if (!R || S.crowns < R.cost) return false;
  S.crowns -= R.cost; S.reach++;
  return true;
}

// ---------- Shop ----------
export const lv = (S, id) => BY_ID[id].max ? S.lv[id] : (S.one[id] ? 1 : 0);
export const maxed = (S, id) => BY_ID[id].max ? S.lv[id] >= BY_ID[id].max : !!S.one[id];
export function cost(S, id) {
  const it = BY_ID[id];
  return it.max ? Math.round(it.base * Math.pow(it.grow, S.lv[id])) : it.base;
}
function available(S, it) {
  if (maxed(S, it.id)) return false;
  if (it.after != null && S.reach < it.after) return false;
  if (it.needs && !S.one[it.needs]) return false;
  return true;
}
// Reveal upgrades as they come within reach (a third of the price in hand, or a few rainbows thrown);
// once seen they stay. Returns the newly revealed ids.
export function reveal(S) {
  const out = [];
  if (!S.shown) return out;
  for (const it of ITEMS) {
    if (S.seen[it.id] || !available(S, it)) continue;
    if (S.crowns >= cost(S, it.id) * 0.35 || (it.show != null && S.thrown >= it.show && S.filled >= 1)) { S.seen[it.id] = true; out.push(it.id); }
  }
  return out;
}
export const items = S => ITEMS.filter(it => S.seen[it.id] && !maxed(S, it.id) && (!it.needs || S.one[it.needs]));
export const bought = S => ITEMS.filter(it => !it.max && S.one[it.id]);
export const canBuy = (S, id) => !maxed(S, id) && S.crowns >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id];
  S.crowns -= cost(S, id);
  if (it.max) S.lv[id]++; else S.one[id] = true;
  if (id === 'spout') S.spoutT = spoutEvery(S) * 0.6;
  return true;
}

// ---------- Brume's letters: one as each region turns to colour ----------
export const LETTERS = [
  'Sir, the turnip fields are now a colour. Turnips are not supposed to be a colour. I object in the strongest terms. B. Brume.',
  'Sir, the orchard. I object. The pig appears to be enjoying itself, which is not its role. B. Brume.',
  'Sir, the village is unrecognisable. Mrs Dabb has taken up singing. I object, in strong terms. B.',
  'Sir, the moor. I went out to look at it, purely to object to it more accurately. I was out there some time. B.',
  'Sir. I have nothing left to object to except the Hall, and I am in it. B.',
];
