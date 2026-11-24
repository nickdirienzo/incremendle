// But Wait, There's Moon: the rules. The page and the pacing sim (sim.mjs) both import this.
// Dudley, a firework who reads every manual, orders Moon-in-a-Box from a 3 a.m. infomercial to out-light Astrid at
// the Rooftop Gala (Rule 14(b): moons count). The moons come tangled on their string. Every flick on the box tugs
// knots loose; a freed moon flies up and shines. Gravity: moons pull on each other and clump; a clump left alone
// drops back into the box, re-tangled. Three boxes, three little economies (Glow, Oohs, Pull). At 99 moons, the
// cap in the small print, the sky crunches.

export const CAP = 99;
export const TEST_MULT = 1.15;          // each testimonial multiplies all income
export const CLUMP_HOLD = 14;           // seconds a clump hangs on before it drops (Sky Hooks: ×2)

// ---------- The boxes (phases) ----------
// n: moons in the box. knots(i): tangles on the i-th moon. astrid: her sky-light, the mark to match.
export const BOXES = [
  { id: 'box1', n: 12, name: 'Box One', sub: 'The Classic', cur: 'Glow', sym: '✦', astrid: 12,
    knots: i => Math.round(4 + 9 * i + 1.4 * i * i) },
  { id: 'box2', n: 24, name: 'Box Two', sub: 'But Wait, There\'s More!', cur: 'Oohs', sym: '❝', astrid: 36,
    knots: i => Math.round(50 + 7 * i + 0.18 * i * i) },
  { id: 'box3', n: 63, name: 'Box Three', sub: 'Call Now!', cur: 'Pull', sym: '◉', astrid: 99,
    knots: i => Math.round(84 + 3.5 * i + 0.015 * i * i) },
];
export const totalMoons = p => BOXES.slice(0, p + 1).reduce((a, b) => a + b.n, 0);

// ---------- The shop ----------
// kind: 'lv' (levels), 'one' (once, real), 'odd' (silly, for the picture). phase: which box sells it (and its
// currency). at: currency earned this box before it shows up.
export const ITEMS = [
  // Box One: Glow
  { id: 'comb', phase: 0, kind: 'lv', max: 6, at: 3, base: 6, mult: 1.55, name: 'Detangling Comb',
    desc: 'A wide-tooth comb, as seen on TV. Each one in the box tugs one more knot loose with every flick.',
    joke: 'It glides through moons like butter! Dudley read the comb\'s manual. It was one page. It said COMB.' },
  { id: 'combo', phase: 0, kind: 'lv', max: 5, at: 14, base: 18, mult: 1.75, name: 'Comb-o-Matic',
    desc: 'A wind-up chrome arm that combs the box by itself, all night, while you do literally anything else.',
    joke: 'Set it and forget it! Dudley set it, then read the warranty, then the warranty\'s warranty.' },
  { id: 'hooks', phase: 0, kind: 'one', at: 25, base: 40, name: 'Sky Hooks',
    desc: 'Little brass hooks for the sky. A clump snags on one and hangs on twice as long before it drops.',
    joke: 'Hooks. In the sky. On nothing. "Do not ask what they hang from," says page 2. Dudley asks anyway, politely.' },
  { id: 'glasses', phase: 0, kind: 'odd', at: 5, base: 10, name: 'Reading Glasses',
    desc: 'Half-moon reading glasses, two for one. For the small print.',
    joke: 'Now Dudley reads the manual 40% faster! He has already read it eleven times. Now he can read it fifteen.' },
  { id: 'plate', phase: 0, kind: 'odd', at: 30, base: 45, name: 'Commemorative Plate',
    desc: 'FREE GIFT with every box: a collector\'s plate, The Grand Finale, hand-painted by machine.',
    joke: 'It shows every moon falling into one, and a firework going off in the middle. "Artist\'s impression," says the back.' },
  // Box Two: Oohs
  { id: 'bleachers', phase: 1, kind: 'lv', max: 8, at: 4, base: 12, mult: 1.9, name: 'Bleachers',
    desc: 'Another row of folding seats on the roof. More people, more oohs for every flick, every moon and every split.',
    joke: 'Act now and the seats are free! The people are extra. The people came anyway.' },
  { id: 'flick', phase: 1, kind: 'lv', max: 6, at: 12, base: 25, mult: 2.05, name: 'Flick-Master 5000',
    desc: 'A spring-loaded flicking glove. Every flick on the box tugs two more knots loose.',
    joke: 'Patented spring-loaded technology! The patent is for a different glove. This one is "inspired by" it.' },
  { id: 'rings', phase: 1, kind: 'lv', max: 3, at: 30, base: 45, mult: 2.6, name: 'Personal Space Rings',
    desc: 'A hoop for every moon, like a hula hoop with boundaries. Moons clump less often.',
    joke: 'Give your moons the space they deserve! The moons look relieved. Moons can look relieved.' },
  { id: 'sign', phase: 1, kind: 'one', at: 50, base: 80, name: 'APPLAUSE Sign',
    desc: 'A neon sign that says APPLAUSE. The crowd oohs at every moon up there, all the time, without being flicked at.',
    joke: 'Studio-audience quality! The crowd is not a studio audience. They do not know that. Nobody tells them.' },
  { id: 'finger', phase: 1, kind: 'odd', at: 20, base: 30, name: 'Foam Finger',
    desc: 'A giant foam finger for the crowd. It says DUDLEY #1.',
    joke: 'Somebody in the back row is holding it the wrong way round. It says 1# YELDUD. Astrid laughs. Dudley lets her.' },
  { id: 'magnifier', phase: 1, kind: 'odd', at: 60, base: 70, name: 'Small Print Magnifier',
    desc: 'A big brass magnifying glass for the very bottom of the very last page of the manual.',
    joke: 'The small print says: DO NOT EXCEED 99 MOONS PER SKY. MOONS MAY COLLAPSE (BEAUTIFULLY). RECOMMENDED USE: FINALE.' },
  // Box Three: Pull
  { id: 'sideways', phase: 2, kind: 'one', at: 4, base: 12, name: 'Sideways™',
    desc: 'Gravity can\'t catch what keeps missing it. Moons drift sideways round the sky, and clump half as often.',
    joke: 'Fall around it! That\'s what an orbit is, Dudley explains to the crowd. The crowd says ooh. It\'s not their phase any more.' },
  { id: 'lift', phase: 2, kind: 'lv', max: 15, at: 10, base: 16, mult: 1.27, name: 'Upsy-Daisy™ Lift Kit',
    desc: 'A brass beam that lets the sky\'s pull reach into the box. The more moons are up, the faster knots come loose on their own.',
    joke: 'It uses gravity, so it\'s free! Gravity has not been told. Gravity seems fine with it.' },
  { id: 'turbo', phase: 2, kind: 'one', at: 40, base: 70, name: 'Turbo Comb-o-Matic',
    desc: 'A second spring for the Comb-o-Matic. It combs twice as fast.',
    joke: 'Now with TWO springs! Dudley read the safety notice aloud to it. The Comb-o-Matic did not listen. It never listens.' },
  { id: 'warranty', phase: 2, kind: 'odd', at: 250, base: 160, name: 'Extended Warranty',
    desc: 'Ninety-nine years of peace of mind, framed, on the roof.',
    joke: 'It covers everything! Except acts of gravity. "That\'s fine," says Dudley, who has read the last page.' },
  { id: 'phone', phase: 2, kind: 'odd', at: 700, base: 300, name: 'Hotline Phone',
    desc: 'A red telephone on the parapet, straight to the operators who are standing by.',
    joke: 'It rings. They\'re offering Box Four. Dudley has read the small print. He says no thank you, and means it.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const lv = (S, id) => S.lv[id] || 0;
export const max = it => it.kind === 'lv' ? it.max : 1;
export const cost = (S, id) => {
  const it = BY_ID[id];
  return it.kind === 'lv' ? Math.round(it.base * Math.pow(it.mult, lv(S, id))) : it.base;
};
export const owned = (S, id) => lv(S, id) >= max(BY_ID[id]);
// Shown: revealed and not maxed. Left over from an earlier box: same price, in today's currency.
export const visible = S => ITEMS.filter(it => S.seen.includes(it.id) && !owned(S, it.id));
export const bought = S => ITEMS.filter(it => it.kind !== 'lv' && owned(S, it.id));
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) {
    if (S.seen.includes(it.id) || it.phase > S.phase) continue;
    if (it.phase < S.phase || S.earned >= it.at) { S.seen.push(it.id); fresh.push(it.id); }
  }
  return fresh;
}
export function buy(S, id) {
  const it = BY_ID[id];
  if (!it || owned(S, id) || !S.seen.includes(id)) return false;
  const c = cost(S, id);
  if (S.cur < c) return false;
  S.cur -= c;
  S.lv[id] = lv(S, id) + 1;
  return true;
}

// ---------- Rules ----------
export const mult = S => Math.pow(TEST_MULT, S.ach.length);
export const power = S => 1 + lv(S, 'comb') + 2 * lv(S, 'flick');                 // knots per flick
export const autoRate = S => [0, 0.25, 0.45, 0.7, 1.0, 1.4][lv(S, 'combo')] * (lv(S, 'turbo') ? 2 : 1)
  + 0.006 * up(S) * lv(S, 'lift');                                                 // knots per second
export const crowd = S => 1 + lv(S, 'bleachers');
export const up = S => S.sky.length;
export const shining = S => S.sky.filter(m => !m.c).length;
export const holdSecs = S => CLUMP_HOLD * (lv(S, 'hooks') ? 2 : 1);
export const clumpRate = S => {
  const n = up(S);
  if (n < 4) return 0;
  return 0.003 * Math.pow(n - 3, 1.35) * [1, 0.6, 0.4, 0.28][lv(S, 'rings')] * (lv(S, 'sideways') ? 0.5 : 1);
};
// Passive income per second, in the current box's currency.
export function income(S) {
  const m = mult(S);
  if (S.phase === 0) return 0.3 * shining(S) * m;
  if (S.phase === 1) return (lv(S, 'sign') ? 0.015 * shining(S) : 0) * crowd(S) * m;
  return 0.0024 * Math.pow(shining(S), 1.5) * m;
}
// Oohs for things you do (Box Two only; the crowd arrives with it).
export const OOH = { flick: 0.5, moon: 3, split: 5 };
export const oohFor = (S, what, k = 1) => S.phase === 1 ? OOH[what] * k * crowd(S) * mult(S) : 0;

// ---------- State ----------
export function fresh() {
  return { phase: 0, box: knotsFor(0), sky: [], cur: 0, earned: 0, lv: {}, seen: [], ach: [], nextId: 1,
    time: 0, started: false, ended: false, crunch: false, read: [], auto: 0,
    stats: { flicks: 0, freed: 0, splits: 0, drops: 0, clumps: 0 }, boughtOpen: false, lastLog: null };
}
export const knotsFor = p => Array.from({ length: BOXES[p].n }, (_, i) => BOXES[p].knots(i));
export function load(raw) {
  const S = Object.assign(fresh(), raw || {});
  S.stats = Object.assign(fresh().stats, S.stats || {});
  S.lv = S.lv || {}; S.seen = S.seen || []; S.ach = S.ach || []; S.read = S.read || [];
  if (S.ended) { S.phase = 2; S.box = []; S.crunch = true; }
  return S;
}
export const totalKnots = S => S.box.reduce((a, b) => a + b, 0);

function earn(S, v) { S.cur += v; S.earned += v; }
function moon(S, h, x) { const m = { id: S.nextId++, x, h, c: 0 }; S.sky.push(m); return m; }

// Tug knots loose from the top of the box. Returns the freed moons.
function untangle(S, k, pick, auto) {
  const out = [];
  while (k > 1e-9 && S.box.length) {
    const take = Math.min(k, S.box[0]);
    S.box[0] -= take; k -= take;
    if (S.box[0] <= 1e-9) {
      S.box.shift();
      const p = pick ? pick() : { h: 0.4 + Math.random() * 0.5, x: 0.1 + Math.random() * 0.8 };
      const m = moon(S, p.h, p.x);
      S.stats.freed++;
      earn(S, oohFor(S, 'moon'));
      out.push({ m, auto });
      if (auto) break;     // helpers free one moon at a time
    }
  }
  return out;
}

// The player's flick on the box. strength 0..1 (how hard). Returns { knots, freed: [...] }.
export function flickBox(S, strength = 0.6, pick = null) {
  if (S.crunch || !S.box.length) return { knots: 0, freed: [] };
  S.stats.flicks++;
  const k = power(S);
  const before = S.box[0];
  const freed = untangle(S, k, pick, false);
  earn(S, oohFor(S, 'flick'));
  return { knots: Math.min(k, before), freed, clean: freed.length > 0 && before >= 3 && before <= k };
}

// The player's flick on a moon in the sky: splits a clump. Returns the partner ids split, or null.
export function flickMoon(S, id) {
  const m = S.sky.find(o => o.id === id);
  if (!m || !m.c) return null;
  const pair = S.sky.filter(o => o.c === m.c);
  const left = pair[0]?.t ?? 0;
  for (const o of pair) { o.c = 0; delete o.t; }
  S.stats.splits++;
  earn(S, oohFor(S, 'split'));
  return { ids: pair.map(o => o.id), left };
}

// Time passes. rnd: random source. Returns events for the page (sounds, log lines).
export function tick(S, dt, rnd = Math.random) {
  const ev = [];
  if (S.ended || S.crunch) return ev;
  earn(S, income(S) * dt);
  // helpers
  S.auto += autoRate(S) * dt;
  if (S.auto >= 1) {
    const k = Math.floor(S.auto); S.auto -= k;
    for (const f of untangle(S, k, null, true)) ev.push({ type: 'free', ...f });
  }
  // gravity: clumps form, and drop if nobody splits them
  if (rnd() < clumpRate(S) * dt) {
    const free = S.sky.filter(m => !m.c);
    if (free.length >= 2) {
      const a = free[Math.floor(rnd() * free.length)];
      let b = null, best = 9;
      for (const o of free) if (o !== a) { const d = Math.hypot(o.x - a.x, (o.h - a.h) * 0.7); if (d < best) { best = d; b = o; } }
      const cid = S.nextId++;
      a.c = b.c = cid; a.t = b.t = holdSecs(S);
      S.stats.clumps++;
      ev.push({ type: 'clump', ids: [a.id, b.id] });
    }
  }
  const dropped = new Set();
  for (const m of S.sky) if (m.c) { m.t -= dt; if (m.t <= 0) dropped.add(m.c); }
  if (dropped.size) {
    const gone = S.sky.filter(m => dropped.has(m.c));
    S.sky = S.sky.filter(m => !dropped.has(m.c));
    for (let i = 0; i < gone.length; i++) S.box.unshift(2 + S.phase * 2);
    S.stats.drops += gone.length;
    ev.push({ type: 'drop', ids: gone.map(m => m.id) });
  }
  // the box is empty: the next box (or the crunch)
  if (!S.box.length && !S.sky.some(m => m.c)) {
    if (S.phase < 2) {
      S.phase++; S.box = knotsFor(S.phase); S.cur = 0; S.earned = 0;
      ev.push({ type: 'phase', phase: S.phase });
    } else if (up(S) >= CAP) {
      S.crunch = true;
      ev.push({ type: 'crunch' });
    }
  }
  return ev;
}

// ---------- Testimonials (achievements): each one ×1.15 on all income ----------
export const TESTIMONIALS = [
  { id: 'first', name: 'First Moon Up', how: 'Hang your first moon.', quote: 'I was in a box. Now I\'m in the sky. Ask me how!', who: 'Moon #1' },
  { id: 'clean', name: 'One-Flick Wonder', how: 'Free a moon with a single flick.', quote: 'One flick and I was free. I have never felt so untangled.', who: 'a moon, untangled' },
  { id: 'top', name: 'Top Shelf', how: 'Flick a moon right to the top of the sky.', quote: 'I can see my house from here. My house is a box.', who: 'a moon, very high up' },
  { id: 'split', name: 'Personal Space', how: 'Split a clump.', quote: 'We were close. Too close. Thank you, Dudley.', who: 'two moons' },
  { id: 'close', name: 'Just in Time', how: 'Split a clump with under three seconds to spare.', quote: 'I was falling. Then I wasn\'t. I didn\'t even spill my tea.', who: 'a moon, unflappable' },
  { id: 'hat', name: 'Hat Trick', how: 'Free three moons in six seconds.', quote: 'Three moons in six seconds? I had to sit down. I was already sitting down.', who: 'a Gala judge' },
  { id: 'dozen', name: 'A Full Dozen', how: 'Match Astrid\'s first mark: 12 moons up.', quote: 'Twelve moons for the price of one. Even I\'m impressed, and I\'m the box.', who: 'the box' },
  { id: 'read', name: 'Read Every Manual', how: 'Read the label on eight different things in the shop.', quote: 'He read the manual for the manual. Then he read me the manual.', who: 'Astrid' },
  { id: 'two', name: 'Two Dozen', how: 'Have 24 moons up at once.', quote: 'Twenty-four moons and not one tide went wrong.', who: 'the sea, probably' },
  { id: 'fifty', name: 'Half a Hundred', how: 'Have 50 moons up at once.', quote: 'Fifty moons! My cheese has never been so lit.', who: 'a mouse' },
];
export const T_BY_ID = Object.fromEntries(TESTIMONIALS.map(t => [t.id, t]));
// Award a testimonial; returns true if it is new.
export function award(S, id) {
  if (S.ach.includes(id) || !T_BY_ID[id]) return false;
  S.ach.push(id);
  return true;
}
// The ones that follow from the state alone.
export function checkCounts(S) {
  const out = [];
  if (up(S) >= 1 && award(S, 'first')) out.push('first');
  if (up(S) >= 12 && award(S, 'dozen')) out.push('dozen');
  if (up(S) >= 24 && award(S, 'two')) out.push('two');
  if (up(S) >= 50 && award(S, 'fifty')) out.push('fifty');
  if (S.read.length >= 8 && award(S, 'read')) out.push('read');
  return out;
}

export const short = v => v < 10 ? (Math.floor(v * 10) / 10).toFixed(1).replace(/\.0$/, '') : String(Math.floor(v));
