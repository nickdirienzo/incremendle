// Sticky Wicket: the rules. Pure functions over one state object, so the pacing sim (sim.mjs)
// plays the same game the page does.
//
// Gannet Rock. Every jar of honey the keeper labels goes on the spiral stair. Frames of bees fill
// jars on their own; hives raise new frames; queens head new hives (producers that make producers).
// Jars are also what you trade to the boats for kit, so buying takes jars off the stair.
// Every summer ends on a clock: the supply boat takes the stair, Ottoline reviews the season on
// Sunday Sport, and her Notes buy later-blooming flowers (longer summers, longer labels) and know-how.
// The summer the stair reaches the lamp, there is one jar left to place, and a choice.

export const RECORD = 100000;               // a full stair: Ottoline's record, the lamp
export const STEPS = 100;                  // the stair's steps (RECORD / STEPS jars to a step)
export const BASE_SUMMER = 210;           // seconds in the first summer
export const OFFLINE_CAP = 10 * 60, OFFLINE_RATE = 0.05;
export const STAMP_SECS = 3;              // the Label Stamp: each label also stamps this much of the bees' output

// The label words. A jar's label is the flower its honey came from; every letter is a jar.
export const BASE_WORDS = ['CLOVER', 'GORSE', 'THYME', 'DAISY', 'BORAGE', 'MINT', 'SAGE', 'VETCH', 'LIME'];

// Producers: count is what you have (it grows on its own); bought sets the price.
export const PROD = {
  frame: { name: 'Frame of bees', base: 10, grow: 1.16, per: 0.25 },   // jars per second each
  hive:  { name: 'Hive',          base: 60, grow: 1.25, per: 0.04 },  // frames per second each
  queen: { name: 'Queen',         base: 3000, grow: 1.4, per: 0.006 }, // hives per second each
};

// One-time upgrades. cur 'j' is jars (kit from the boats, stays in the lighthouse between summers);
// cur 'n' is Ottoline's Notes (learned over winter). kind 'odd' does very little.
export const UPGRADES = [
  // kit
  { id: 'mic', cur: 'j', cost: 20, kind: 'odd', name: 'Brass Microphone',
    desc: 'Wire the lighthouse radio to a proper microphone. The fishing fleet can hear the commentary now.' },
  { id: 'bigjars', cur: 'j', cost: 60, name: 'Bigger Jars',
    desc: 'Every label goes on twice the honey: each word stacks twice the jars.' },
  { id: 'extractor', cur: 'j', cost: 400, name: 'Honey Extractor',
    desc: 'A hand-cranked spinner. Every frame of bees fills jars twice as fast.' },
  { id: 'pennant', cur: 'j', cost: 800, kind: 'odd', name: 'Fan Club Pennant',
    desc: 'The fleet sends a pennant: GANNET ROCK HONEY LEAGUE · MEMBERS: 31. Fly it from the gallery.' },
  { id: 'excluder', cur: 'j', cost: 2000, name: 'Queen Excluder',
    desc: 'A grille that keeps the queen laying where she should. Every hive raises frames twice as fast.' },
  { id: 'stamp', cur: 'j', cost: 6000, name: 'Label Stamp',
    desc: `A rubber stamp for the batch number. Every label also stacks ${STAMP_SECS} seconds of everything the bees fill.` },
  { id: 'duster', cur: 'j', cost: 3000, kind: 'odd', name: 'Lamp-Shelf Duster',
    desc: 'A feather duster for the little shelf beside the lamp. It is exactly one jar wide.' },
  { id: 'observation', cur: 'j', cost: 12000, need: 'rearing', name: 'Observation Hive',
    desc: 'A glass-sided hive by the lamp room window. Every queen heads new hives twice as fast.' },
  // Notes: flowers (longer summers, new label words)
  { id: 'thrift', cur: 'n', cost: 4, flower: true, name: 'Sea Thrift', secs: 30, words: ['THRIFT', 'SEA PINK'],
    desc: 'Pink cushions on the cliff edge. The bees work them into high summer.' },
  { id: 'bramble', cur: 'n', cost: 9, flower: true, name: 'Bramble', secs: 40, words: ['BRAMBLE', 'BLACKBERRY'],
    desc: 'Let the brambles have the old coal store. They flower right through August.' },
  { id: 'rosebay', cur: 'n', cost: 18, flower: true, name: 'Rosebay', secs: 45, words: ['ROSEBAY', 'WILLOWHERB', 'FIREWEED'],
    desc: 'Tall pink spires along the path to the boathouse. Late summer, and loud with bees.' },
  { id: 'heather', cur: 'n', cost: 40, flower: true, name: 'Heather', secs: 55, words: ['HEATHER', 'BELL HEATHER', 'LING'],
    desc: 'Purple from the boathouse to the foghorn, all of late summer. Judges go weak for heather honey.' },
  { id: 'ivy', cur: 'n', cost: 65, flower: true, name: 'Ivy', secs: 65, words: ['IVY', 'IVY BLOSSOM', 'HEDERA'],
    desc: 'Let it climb the tower. Ivy flowers in autumn, when nothing else does.' },
  { id: 'aster', cur: 'n', cost: 100, flower: true, name: 'Michaelmas Daisy', secs: 80, words: ['MICHAELMAS DAISY', 'SEA ASTER'],
    desc: 'Sea asters in the salt marsh below the rock. The very last flowers of the year.' },
  // Notes: know-how
  { id: 'rearing', cur: 'n', cost: 28, name: 'Queen Rearing',
    desc: 'Learn to raise queens. Queens head new hives, which raise frames, which fill jars.' },
  { id: 'mischief', cur: 'n', cost: 1, kind: 'odd', name: 'Mischief Night Sign',
    desc: 'Every 4 November the harbour kids row out, knock on the lighthouse door and row off. A sign for the door.' },
  { id: 'plate', cur: 'n', cost: 4, kind: 'odd', name: 'Ottoline’s Record Plate',
    desc: 'Her championship trophy turns up in a harbour jumble sale. It is a dinner plate with writing on.' },
];
export const UP = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
export const FLOWERS = UPGRADES.filter(u => u.flower);

export function newState() {
  return {
    t: 0, season: 1, clock: 0, winter: false,
    jars: 0, peak: 0, total: 0, labels: 0, best: 0,
    frame: 0, hive: 0, queen: 0, bought: { frame: 0, hive: 0, queen: 0 }, winterLv: 0,
    notes: 0, notesTotal: 0, lastNotes: 0, lastPeak: 0,
    up: {}, seen: [], shopTab: 'j', reviews: [],
    record: false, ended: false, ending: null, endedAt: null, lastSeen: 0, cheered: 0,
  };
}
export function load(o) {
  const S = Object.assign(newState(), o || {});
  S.up = { ...(o && o.up) }; S.bought = { frame: 0, hive: 0, queen: 0, ...(o && o.bought) };
  S.seen = Array.isArray(S.seen) ? S.seen : []; S.reviews = Array.isArray(S.reviews) ? S.reviews : [];
  if (S.ended) finishAll(S);
  return S;
}
// A finished save is drawn as the finished world: every flower, every hive, the stair full.
export function finishAll(S) {
  for (const u of UPGRADES) S.up[u.id] = 1;
  S.record = true; S.winter = false;
  S.jars = Math.max(S.jars, RECORD - 1); S.peak = Math.max(S.peak, S.jars); S.best = Math.max(S.best, S.jars);
  S.frame = Math.max(S.frame, 40); S.hive = Math.max(S.hive, 12); S.queen = Math.max(S.queen, 3);
  if (!S.ending) S.ending = 'clear';
}

// ---------- Rates ----------
export const summerLength = S => BASE_SUMMER + FLOWERS.reduce((a, f) => a + (S.up[f.id] ? f.secs : 0), 0);
export const timeLeft = S => Math.max(0, summerLength(S) - S.clock);
export const words = S => BASE_WORDS.concat(...FLOWERS.filter(f => S.up[f.id]).map(f => f.words));
export const letters = w => w.replace(/[^A-Z]/g, '').length;
export const avgLetters = S => { const w = words(S); return w.reduce((a, x) => a + letters(x), 0) / w.length; };
export const jarsPerLetter = S => (S.up.bigjars ? 2 : 1);
export const frameRate = S => PROD.frame.per * (S.up.extractor ? 2 : 1);   // jars/s per frame
export const hiveRate = S => PROD.hive.per * (S.up.excluder ? 2 : 1);      // frames/s per hive
export const queenRate = S => PROD.queen.per * (S.up.observation ? 2 : 1); // hives/s per queen
export const jarRate = S => Math.floor(S.frame) * frameRate(S);
export const frameGrowth = S => Math.floor(S.hive) * hiveRate(S);
export const hiveGrowth = S => Math.floor(S.queen) * queenRate(S);
export const stampJars = S => (S.up.stamp ? STAMP_SECS * jarRate(S) : 0);
export const labelJars = (S, w) => letters(w) * jarsPerLetter(S) + stampJars(S);
// The stair narrows toward the top and the jars stack higher on every step, so each step up takes a
// bigger stack: the first step is a handful of jars, the top one thousands.
export const STEP_K = 150;
export const stepFrac = j => Math.min(STEPS, STEPS * Math.log(1 + j / STEP_K) / Math.log(1 + RECORD / STEP_K));
export const stepsAt = j => Math.floor(stepFrac(j) + 1e-9);
export const jarsForStep = n => Math.ceil(STEP_K * (Math.pow(1 + RECORD / STEP_K, n / STEPS) - 1));
export const steps = S => stepsAt(S.jars);

export const unlocked = (S, k) => k !== 'queen' || !!S.up.rearing;
export const prodCost = (S, k) => Math.ceil(PROD[k].base * Math.pow(PROD[k].grow, S.bought[k]));

// ---------- Actions ----------
function addJars(S, n) {
  S.jars = Math.min(RECORD, S.jars + n); S.total += n;
  if (S.jars > S.peak) S.peak = S.jars;
  if (S.peak > S.best) S.best = S.peak;
  if (S.jars >= RECORD && !S.record) S.record = true;
}
// Label one jar: the word typed out in full.
export function label(S, w) {
  if (S.winter || S.ended || S.record) return 0;
  const n = labelJars(S, w);
  S.labels++; addJars(S, n);
  return n;
}
export const have = (S, cur) => (cur === 'n' ? S.notes : S.jars);
export function items(S) {
  return UPGRADES.filter(u => !S.up[u.id] && (!u.need || S.up[u.need]) && visible(S, u))
    .map(u => ({ ...u }));
}
// Kit shows up once you've had half its price on the stair; Notes upgrades once you've had a review.
function visible(S, u) {
  if (u.cur === 'n') return S.season > 1 || S.winter;
  return S.best >= u.cost * 0.5;
}
export function buy(S, id) {
  const u = UP[id];
  if (!u || S.up[id] || S.ended || (u.need && !S.up[u.need])) return false;
  if (u.cur === 'j' && S.winter) return false;
  if (have(S, u.cur) < u.cost) return false;
  if (u.cur === 'n') S.notes -= u.cost; else S.jars -= u.cost;
  S.up[id] = 1;
  return true;
}
export function buyProd(S, k) {
  if (S.winter || S.ended || S.record || !unlocked(S, k)) return false;
  const c = prodCost(S, k);
  if (S.jars < c) return false;
  S.jars -= c; S.bought[k]++; S[k] += 1;
  return true;
}
// Overwintering: a Notes purchase you can make again and again. Each level keeps more of the
// colony alive through the winter, so every summer starts further on.
export const WINTER_FRAMES = 3;
export const winterCost = S => Math.ceil(4 * Math.pow(1.75, S.winterLv));
export function buyWinter(S) {
  const c = winterCost(S);
  if (S.ended || S.notes < c) return false;
  S.notes -= c; S.winterLv++;
  return true;
}
export const bought = S => UPGRADES.filter(u => S.up[u.id]);

// ---------- Time ----------
export function step(S, dt, { clock = true } = {}) {
  if (S.ended) return;
  if (S.winter || S.record) { if (!S.winter) S.t += dt; return; }
  S.t += dt;
  S.hive += hiveGrowth(S) * dt;
  S.frame += frameGrowth(S) * dt;
  addJars(S, jarRate(S) * dt);
  // The first summer's clock starts with the first label, so nobody loses time reading.
  if (clock && !S.record && (S.labels > 0 || S.season > 1)) {
    S.clock += dt;
    if (S.clock >= summerLength(S)) endSummer(S);
  }
}
// Ottoline's Notes: how much there was to criticise.
export const notesFor = peak => Math.floor(Math.sqrt(peak / 5));
export function endSummer(S) {
  const peak = Math.floor(S.peak), n = notesFor(peak);
  S.winter = true; S.lastPeak = peak; S.lastNotes = n;
  S.notes += n; S.notesTotal += n;
  S.reviews.push(peak);
  S.jars = 0; S.peak = 0; S.frame = 0; S.hive = 0; S.queen = 0; S.bought = { frame: 0, hive: 0, queen: 0 };
}
export function startSummer(S) {
  if (!S.winter) return false;
  S.winter = false; S.season++; S.clock = 0;
  const w = S.winterLv;
  if (w) { S.frame = WINTER_FRAMES * w; S.hive = w; }
  return true;
}
// Time away: the bees keep at it, slowly, and the summer waits (the boat won't sail without the keeper).
export function offline(S, secs) {
  if (S.winter || S.ended || S.record || secs < 60) return null;
  const capped = secs > OFFLINE_CAP, use = Math.min(secs, OFFLINE_CAP) * OFFLINE_RATE;
  const before = S.total;
  addJars(S, jarRate(S) * use);
  return { jars: S.total - before, capped };
}
export const phase = S => (S.ended ? 'ending' : S.winter ? 'winter' : S.record || timeLeft(S) <= 30 ? 'clutch' : 'summer');
export function fmt(x) {
  x = Math.floor(x);
  return x < 10000 ? String(x) : x < 1e6 ? (x / 1000).toFixed(x < 1e5 ? 1 : 0) + 'k' : (x / 1e6).toFixed(2) + 'M';
}
