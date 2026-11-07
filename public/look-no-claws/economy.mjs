// Look, No Claws!: the rules. The page and the pacing sim (sim.mjs) both import this.
// Pinchworth, a homesick crab, hosts the 3 a.m. infomercial on Channel 61. The Fold-O-Matic is
// "broken": its paper cranes burst out loose, and he herds them into the shipping boxes by clicking
// his claws on the beat of the gamelan band. Every crane sold is $19.99. The bet: a sky full of
// cranes (one quadrillion) and the station van is his, for the drive back to the sea.

export const BPM = 96;
export const BEAT = 60 / BPM;              // seconds per beat (0.625)
export const GOAL = 1e15;                  // a sky full of paper cranes
export const PRICE = 19.99;                // per crane, plus nothing, because shipping is free
export const PERFECT = 0.075;              // seconds either side of the beat
export const GOOD = 0.16;
export const STREAK_STEP = 0.25;           // each beat in a row adds a quarter
export const FINAL_SECS = 40;              // hands off, live on air

// The demos: the infomercial's "can your old herder do THIS?" bits. Each replays the show's opening
// from scratch (one crane a beat, no gadgets) under a handicap. `at` is the sky count that books it.
export const DEMOS = {
  oneclaw: { name: 'One Claw Behind My Back', at: 1e5, beats: 16, need: 12, pattern: 'half',
             desc: 'Only the gong beats count: tap on beats 1 and 3, and leave 2 and 4 alone.',
             gifts: ['goldclaws', 'thermos'] },
  lights:  { name: 'Lights Out', at: 1e7, beats: 16, need: 12, pattern: 'dark',
             desc: 'The beat marker shows you four beats, then the studio lights go out. Keep time yourself.',
             gifts: ['hat', 'overtime'] },
  double:  { name: 'Double Time', at: 4e8, beats: 32, need: 24, pattern: 'double',
             desc: 'Twice as many cranes, twice as fast: tap on every half beat.',
             gifts: ['bigstreak', 'conveyor'] },
  offbeat: { name: 'Off the Beat', at: 6e11, beats: 16, need: 12, pattern: 'off',
             desc: 'The band plays on the beat; you play between, the way the bonang interlocks. Tap on the "and".',
             gifts: ['spotlight', 'radio'] },
};
export const DEMO_IDS = Object.keys(DEMOS);

// Free gifts: one of two per demo, never both. side: 'claw' (your tapping) or 'machine' (idle).
export const GIFTS = {
  goldclaws: { name: 'Gold-Plated Claws', side: 'claw', claw: 2,
               desc: 'Every crane you herd counts twice. They shine on camera.' },
  thermos:   { name: 'Wanda’s Thermos', side: 'machine', machine: 2,
               desc: 'Hot soup for Maintenance. The Fold-O-Matic folds twice as many. Nobody asks why soup helps a machine.' },
  hat:       { name: 'Metronome Hat', side: 'claw', perfectGoods: true,
               desc: 'A tiny metronome on a tiny hat. Good taps count as perfect taps.' },
  overtime:  { name: 'Night Shift Overtime', side: 'machine', machine: 1.5,
               desc: 'Time and a half for Maintenance. The Fold-O-Matic folds half as many again. It also asks for a sandwich.' },
  bigstreak: { name: 'The Unbreakable Streak', side: 'claw', streakCap: 32,
               desc: 'The streak bonus keeps climbing to 32 in a row (×9) instead of stopping.' },
  conveyor:  { name: 'Conveyor Belt', side: 'machine', machine: 1.5,
               desc: 'Cranes go straight from the Fold-O-Matic into the boxes. It folds half as many again.' },
  spotlight: { name: 'The Big Spotlight', side: 'claw', claw: 2,
               desc: 'Every crane you herd counts twice. Pinchworth is radiant.' },
  radio:     { name: 'Wanda’s Radio', side: 'machine', machine: 2,
               desc: 'Something to listen to in there. The Fold-O-Matic folds twice as many.' },
};

// Leveled lines: one cell each, with a count. Prices end in .99 (see price()).
export const LINES = {
  polish: { name: 'Claw Polish', base: 40, grow: 5.3, max: 30, need: 15,
            desc: 'A buff and a shine. Every crane you herd counts double, again.' },
  wait:   { name: 'But Wait, There’s More!', base: 1e5, grow: 14, max: 20, need: 1e6,
            desc: 'Double every order. Your claws and the Fold-O-Matic both ship twice as many.' },
  parts:  { name: 'Spare Parts', base: 1e5, grow: 3, max: 8, needUp: 'maint',
            desc: 'A bag of gears from the parts shop. The Fold-O-Matic folds a quarter more on every beat. Some of the gears are biscuits.' },
};
export const LINE_IDS = Object.keys(LINES);

// One-time upgrades. odd: a silly one-off. need: sky count to show up; needUp: another upgrade first.
export const UP = {
  tollfree:  { name: 'Toll-Free Number', cost: 500, need: 50, claw: 3,
               desc: 'Every crane you herd counts three times.', joke: '1-800-CRAB-NOW. Lines are open. Lines are always open.' },
  kick:      { name: 'Kick the Machine', cost: 2e+08, need: 2e+07, odd: true, needUp: 'maint',
               desc: 'Give the Fold-O-Matic a good kick. Does nothing.', joke: 'Pinchworth kicks the Fold-O-Matic. Something inside says “ow.” He decides it was the gears.' },
  audience:  { name: 'Studio Audience', cost: 100000, need: 10000, perfect: 4,
               desc: 'A perfect tap herds four times as many cranes, not two.', joke: 'It’s 3 a.m., so the audience is the security guard and his mum, and a sign that says OOOH. They go “oooh.”' },
  maint:     { name: 'Call Maintenance', cost: 1e+07, need: 800000,
               desc: 'Someone to look at the Fold-O-Matic. It starts folding and shipping cranes on its own, beat or no beat.',
               joke: 'Wanda from Maintenance comes round with a toolbox and a thermos, says she’ll take a look from the inside, and draws the little curtain. The machine starts working at once.' },
  mug:       { name: 'Second Coffee Mug', cost: 3e+07, need: 3e+06, odd: true, needUp: 'maint',
               desc: 'A second mug, for by the Fold-O-Matic. Does nothing.', joke: 'Pinchworth doesn’t drink coffee. He leaves it by the Fold-O-Matic. When he looks back, it’s empty.' },
  laugh:     { name: 'Laugh Track', cost: 400000, need: 30000, streakCap: 16,
               desc: 'The streak bonus keeps climbing to 16 beats in a row (×5) instead of stopping at 8 (×3).',
               joke: 'Canned laughter on every beat. Pinchworth has never been this funny.' },
  actnow:    { name: 'Act Now!', cost: 6e+08, need: 6e+07, grace: true,
               desc: 'A missed beat only halves your streak instead of breaking it.', joke: 'A clock in the corner of the screen counts down from ten minutes. It has been counting down from ten minutes for three hours.' },
  testimony: { name: 'Testimonials', cost: 2e+09, need: 2e+08, claw: 10,
               desc: 'Every crane you herd counts ten times.', joke: '“I was a crab with no cranes,” says a crab, who is Pinchworth in a moustache.' },
  warranty:  { name: 'Warranty Card', cost: 6e+09, need: 6e+08, odd: true, needUp: 'maint',
               desc: 'Fill in the Fold-O-Matic’s warranty card. Does nothing.', joke: 'It’s already filled in, in very neat handwriting: “Fold-O-Matic. Serviced nightly. Signed, W.”' },
  operators: { name: 'Operators Standing By', cost: 5e+10, need: 5e+09, machine: 2, needUp: 'maint',
               desc: 'The Fold-O-Matic folds twice as many.', joke: 'One operator is standing by. She is also sitting inside the machine. Nobody does the maths.' },
  seashell:  { name: 'Seashell Phone', cost: 20000, need: 2000, odd: true,
               desc: 'Call home. Does nothing.', joke: 'Pinchworth holds a seashell to his ear and hears the sea. The sea says hi. The sea says the van is a nice idea.' },
  sticker:   { name: 'As Seen On TV', cost: 4e+12, need: 4e+11, all: 4,
               desc: 'Every order counts four times: your claws and the Fold-O-Matic.', joke: 'A gold sticker for the box. It is true. It is on TV right now.' },
  hum:       { name: 'Tune the Machine', cost: 1.5e+13, need: 1.5e+12, odd: true, needUp: 'maint',
               desc: 'The Fold-O-Matic hums along to the band, off-key. Tune it. Does nothing.', joke: 'Pinchworth tightens a bolt. The humming goes up a semitone, then stops. Then it starts again, in tune, and a little embarrassed.' },
  stores:    { name: 'Not Available in Stores', cost: 1.5e+14, need: 1.5e+13, all: 10,
               desc: 'Every order counts ten times. Exclusive.', joke: 'Not available in stores. Not available anywhere. Barely available here.' },
};
export const UP_IDS = Object.keys(UP);

export function newState() {
  return {
    cranes: 0, cash: 0, t: 0,                 // cranes shipped (the sky), dollars, seconds played
    clawCranes: 0, machineCranes: 0,           // where they came from (the ending counts)
    streak: 0, best: 0, hits: 0, perfects: 0, misses: 0,
    lv: { polish: 0, wait: 0, parts: 0 }, up: {}, gifts: {}, demos: {},
    seen: {}, final: null, ended: false, boughtOpen: false,
  };
}
export function load(raw) {
  const S = newState();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(S)) if (raw[k] !== undefined) S[k] = raw[k];
    S.lv = { ...newState().lv, ...(raw.lv || {}) };
  }
  if (S.ended) finishWorld(S);
  return S;
}
// A save of just { ended: true } is drawn as the finished world.
function finishWorld(S) {
  if (S.cranes < GOAL) S.cranes = GOAL;
  // Everything bought, so the finished set has every prop on it.
  for (const id of UP_IDS) S.up[id] = true;
  for (const id of LINE_IDS) S.lv[id] = Math.max(S.lv[id], LINES[id].max);
}

// ---------- Rates ----------
const prodUp = (S, key) => { let m = 1; for (const id of UP_IDS) if (S.up[id] && UP[id][key]) m *= UP[id][key]; return m; };
const prodGift = (S, key) => { let m = 1; for (const d of DEMO_IDS) { const g = GIFTS[S.gifts[d]]; if (g && g[key]) m *= g[key]; } return m; };
export const allMult = S => Math.pow(2, S.lv.wait) * prodUp(S, 'all');
// The shop's claws: what the Fold-O-Matic keeps pace with.
export const shopClaw = S => Math.pow(2, S.lv.polish) * prodUp(S, 'claw') * allMult(S);
// Cranes per on-beat tap, before the perfect and streak bonuses.
export const clawPer = S => shopClaw(S) * prodGift(S, 'claw');
export const perfectMult = S => prodUp(S, 'perfect') > 1 ? prodUp(S, 'perfect') : 2;
export const streakCap = S => Math.max(8, ...UP_IDS.filter(id => S.up[id]).map(id => UP[id].streakCap || 0),
  ...DEMO_IDS.map(d => GIFTS[S.gifts[d]]?.streakCap || 0));
export const streakMult = (S, n = S.streak) => 1 + STREAK_STEP * Math.min(n, streakCap(S));
export const perfectGoods = S => DEMO_IDS.some(d => GIFTS[S.gifts[d]]?.perfectGoods);
// The Fold-O-Matic folds on the beat too: a share of a plain tap's cranes, every beat, tapping or not.
export const MACHINE_SHARE = 0.25;
export const PARTS_STEP = 1.25;
export const machineShare = S => S.up.maint ? MACHINE_SHARE * Math.pow(PARTS_STEP, S.lv.parts) * prodUp(S, 'machine') * prodGift(S, 'machine') : 0;
export const machinePerBeat = S => machineShare(S) * shopClaw(S);
export const machineRate = S => machinePerBeat(S) / BEAT; // cranes per second

// ---------- The core action ----------
// Judge a tap `off` seconds from the nearest beat. Returns the herd (or a miss).
export function judge(S, off) {
  const a = Math.abs(off);
  let grade = a <= PERFECT ? 'perfect' : a <= GOOD ? 'good' : 'miss';
  if (grade === 'good' && perfectGoods(S)) grade = 'perfect';
  return grade;
}
export function herd(S, grade) {
  if (grade === 'miss') {
    S.misses++;
    S.streak = S.up.actnow ? Math.floor(S.streak / 2) : 0;
    return 0;
  }
  S.streak++; S.best = Math.max(S.best, S.streak); S.hits++;
  if (grade === 'perfect') S.perfects++;
  const n = clawPer(S) * (grade === 'perfect' ? perfectMult(S) : 1) * streakMult(S);
  ship(S, n, 'claw');
  return n;
}
export function ship(S, n, from) {
  S.cranes += n; S.cash += n * PRICE;
  if (from === 'claw') S.clawCranes += n; else S.machineCranes += n;
}
export function tick(S, dt) {
  if (S.ended) return 0;
  S.t += dt;
  const n = machineRate(S) * dt;
  if (n > 0) ship(S, n, 'machine');
  return n;
}

// ---------- The shop ----------
const nice = x => {
  // One significant figure, then shaved: 200 -> 199.99, 5e6 -> 4.99 million.
  const k = Math.floor(Math.log10(x)), d = Math.ceil(x / Math.pow(10, k) - 1e-9);
  const p = d * Math.pow(10, k);
  return p < 1e6 ? p - 0.01 : p - Math.pow(10, k - 2);
};
export const lineCost = (S, id) => nice(LINES[id].base * Math.pow(LINES[id].grow, S.lv[id]));
export const upCost = id => nice(UP[id].cost);
export const lineShown = (S, id) => S.lv[id] > 0 || ((LINES[id].need || 0) <= S.cranes && (!LINES[id].needUp || S.up[LINES[id].needUp]));
export const upShown = (S, id) => (UP[id].need || 0) <= S.cranes && (!UP[id].needUp || S.up[UP[id].needUp]);
// What the shop shows: revealed lines and unbought one-time upgrades. Once seen, always shown.
export function items(S) {
  const out = [];
  for (const id of LINE_IDS) if (S.lv[id] < LINES[id].max && (S.seen[id] || lineShown(S, id)))
    out.push({ id, kind: 'line', ...LINES[id], price: lineCost(S, id), level: S.lv[id] });
  for (const id of UP_IDS) if (!S.up[id] && (S.seen[id] || upShown(S, id)))
    out.push({ id, kind: 'up', ...UP[id], price: upCost(id) });
  return out;
}
export function reveal(S) {
  const fresh = [];
  for (const it of items(S)) if (!S.seen[it.id]) { S.seen[it.id] = true; fresh.push(it.id); }
  return fresh;
}
export function buy(S, id) {
  if (LINES[id]) {
    const c = lineCost(S, id);
    if (S.lv[id] >= LINES[id].max || S.cash < c) return false;
    S.cash -= c; S.lv[id]++; return true;
  }
  if (!UP[id] || S.up[id]) return false;
  const c = upCost(id);
  if (S.cash < c) return false;
  S.cash -= c; S.up[id] = true; return true;
}
export const bought = S => UP_IDS.filter(id => S.up[id]).map(id => ({ id, ...UP[id] }));

// ---------- Demos ----------
export const demoOpen = (S, id) => S.cranes >= DEMOS[id].at;
// The next demo booked and not yet done (one at a time, in order).
export function nextDemo(S) {
  for (const id of DEMO_IDS) if (!S.demos[id]) return demoOpen(S, id) ? id : null;
  return null;
}
// Beat targets for a demo, in beats from its first counted beat.
export function demoTargets(id) {
  const D = DEMOS[id];
  if (D.pattern === 'half') return Array.from({ length: D.beats }, (_, i) => i * 2).filter((_, i) => i < D.beats).map(b => b);
  if (D.pattern === 'double') return Array.from({ length: D.beats }, (_, i) => i * 0.5);
  if (D.pattern === 'off') return Array.from({ length: D.beats }, (_, i) => i + 0.5);
  return Array.from({ length: D.beats }, (_, i) => i);
}
export function passDemo(S, id) { S.demos[id] = 'passed'; }
export function pickGift(S, id, gift) {
  if (S.demos[id] !== 'passed' || S.gifts[id] || !DEMOS[id].gifts.includes(gift)) return false;
  S.gifts[id] = gift; S.demos[id] = 'done'; return true;
}
export const giftPending = S => DEMO_IDS.find(id => S.demos[id] === 'passed') || null;

// ---------- The finale ----------
export const skyFull = S => S.cranes >= GOAL;
export const progress = S => Math.min(1, Math.log10(1 + S.cranes) / Math.log10(GOAL));
export function startFinal(S) { if (!skyFull(S) || S.final || S.ended) return false; S.final = { left: FINAL_SECS, resets: 0 }; return true; }
export function finalTick(S, dt) {
  if (!S.final || S.final.done) return false;
  S.final.left = Math.max(0, S.final.left - dt);
  if (S.final.left <= 0) { S.final.done = true; return true; }
  return false;
}
export function finalTap(S) { if (!S.final || S.final.done) return; S.final.left = FINAL_SECS; S.final.resets++; }

// ---------- Formatting ----------
const WORDS = [[1e15, 'quadrillion'], [1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
const sig3 = x => { const s = x >= 100 ? Math.floor(x) : x >= 10 ? Math.floor(x * 10) / 10 : Math.floor(x * 100) / 100; return String(s); };
export function fmt(n) {
  if (n < 1e6) return Math.floor(n).toLocaleString('en-US');
  for (const [v, w] of WORDS) if (n >= v) return `${sig3(n / v)} ${w}`;
  return String(n);
}
// Short form for cells: 4.99M, 1.2T.
const SHORT = [[1e15, 'Q'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M']];
export function fmtShort(n) {
  for (const [v, w] of SHORT) if (n >= v) return `${sig3(n / v)}${w}`;
  return Math.floor(n).toLocaleString('en-US');
}
export function money(n, short = false) {
  if (n < 1e6) return '$' + (n < 1000 ? n.toFixed(2) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  return '$' + (short ? fmtShort(n) : fmt(n));
}
