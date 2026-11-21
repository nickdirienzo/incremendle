// Burning Ambition: the rules. The page and the pacing sim (sim.mjs) both import this.
// Purl, a nervous ball of wool, prints one Big Candle, ring by ring, as a decoy for Gordon the moth (moths go to a
// flame, not to wool), and pays for it by selling the rings: customers pay to have their words printed into the
// next ring. Every word ever typed is a ring of the candle. The top ring is always the one everybody wants, so each
// ring is worth a little more than the last. At a billion dollars, the first order on the spike gets filled.

export const GOAL = 1e9;
export const HEIGHT_POW = 1.18;          // a letter's worth grows with the candle's height
export const RING_CM = 5;             // each printed ring is 5 cm of candle
export const BREAK_SECS = 20;         // a Breakthrough (after typing Gordon's affirmation)
export const CUT_SECS = 20;           // a power cut
export const CUT_MULT = 3;

// ---------- The build: sections of the blueprint ----------
// at: rings. Each section brings a new kind of order (and a new music phase).
export const SECTIONS = [
  { id: 'plinth', at: 0, name: 'Plinth', where: 'on the workshop floor', music: 'workshop' },
  { id: 'shaft', at: 50, name: 'Shaft', where: 'through the ceiling', music: 'workshop' },
  { id: 'roof', at: 150, name: 'Through the Roof', where: 'out through the roof', music: 'roof' },
  { id: 'town', at: 350, name: 'Above the Town', where: 'over the chimneys', music: 'roof' },
  { id: 'spire', at: 700, name: 'Spire Height', where: 'level with the church spire', music: 'sky' },
  { id: 'crown', at: 1300, name: 'Crown', where: 'above everything', music: 'sky' },
];
export const section = S => { let i = 0; SECTIONS.forEach((s, k) => { if (S.rings >= s.at) i = k; }); return i; };
export const heightM = S => S.rings * RING_CM / 100;

// ---------- Orders, by section ----------
export const ORDERS = [
  ['GRETA', 'NANA', 'OTTO', 'MAVIS', 'KEITH', 'DOREEN', 'SID', 'IVY', 'BEV AND ROY', 'HI MUM', 'TOM', 'PENNY', 'LEN', 'MARGOT', 'WALLY', 'JUNE'],
  ['GET WELL SOON', 'WELL DONE KEV', 'MARRY ME JO', 'BON VOYAGE', 'CONGRATS TWINS', 'HAPPY RETIREMENT', 'NEW HOUSE', 'GOOD LUCK DEBS', 'HAPPY BIRTHDAY NAN', 'THANK YOU NURSES'],
  ['SORRY ABOUT THE GERBIL', 'I WANT MY LADDER BACK', 'IT WAS ME', 'YOU KNOW WHAT YOU DID', 'NOT THE FACE', 'I STILL HAVE YOUR DVD', 'THE HEDGE IS MINE', 'I ATE THE LAST ONE'],
  ['BARRY WAS HERE', 'FIRST', 'THE PASSWORD IS SWORDFISH', 'TO MY CAT I LEAVE EVERYTHING', 'VOTE FOR PAM', 'WE SELL SHEDS', 'CALL ME MAYBE DAVE', 'VISIBLE FROM SPACE'],
  ['I AM ENOUGH', 'WE ARE ALL CANDLES', 'MANIFEST THIS', 'BE THE WICK', 'GROWTH MINDSET', 'LIVE LAUGH LEVITATE', 'THINK TALLER', 'DREAM BIG BURN BRIGHT'],
  ['HELLO FROM THE PLANE', 'TALLER THAN THE SPIRE', 'GREETINGS FROM MARS', 'IS THIS THE TOP', 'SAY HI TO GORDON', 'THE MOTH KNOWS', 'NEARLY THERE PURL', 'WORTH EVERY PENNY'],
];
export const AFFIRMATIONS = ['I AM NOT A SNACK', 'MOTHS LIKE LIGHT', 'BREATHE IN BREATHE OUT', 'I AM WOOL NOT LUNCH', 'GORDON MEANS WELL', 'I AM A CALM BALL'];
export const FINAL = 'BIG LIGHT';
export const pickOrder = (S, r = Math.random) => { const L = ORDERS[section(S)]; if (typeof r === 'function') r = r(); return L[Math.floor(r * L.length)]; };
export const letters = w => w.replace(/[^A-Z]/g, '').length;

// ---------- The shop ----------
// kind: 'lv' (levels), 'one' (once, real), 'odd' (silly, for the picture). at: candle value ($) when it shows up.
export const FINISHES = ['Plain', 'Scented', 'Glitter', 'Marbled', 'Gilt-edged', 'Gold Leaf', 'Starlight', 'Moonbeam'];
export const ITEMS = [
  { id: 'needles', kind: 'lv', max: 12, at: 150, name: 'The Needles', base: 250, mult: 1.7,
    desc: 'A pair of knitting needles who peck at the second keyboard. Slow, steady, never typo. Every pair types orders on its own.',
    joke: 'The Needles are in. They click when they type. They clicked when they knitted. They are just like that.' },
  { id: 'spec', kind: 'one', at: 40, name: 'Spellcheck Spectacles', base: 90,
    desc: 'Half-moon glasses. When Purl fumbles a key, the first fumble on each ring is caught before the wax sets.',
    joke: 'Purl can see the keys now. It can also see Gordon, more clearly than it would like.' },
  { id: 'finish', kind: 'lv', max: 7, at: 250, name: 'Ring Finish', base: 500, mult: 10,
    desc: 'A fancier wax for every ring from now on. Each finish doubles what a letter is worth.',
    joke: 'A better finish. "You are not paying for wax," Purl tells customers. "You are paying for a feeling."' },
  { id: 'tape2', kind: 'one', at: 4e3, name: 'Tape 2: Think Taller', base: 9e3,
    desc: 'Side B of The First Billion. Purl learns to describe each ring as an "elevated opportunity". Letters pay triple.',
    joke: '"Nobody buys a ring," says the tape. "They buy a view." Purl has started saying it to the kettle.' },
  { id: 'wheel', kind: 'lv', max: 10, at: 5e3, name: 'Spinning Wheel', base: 8000, mult: 2.3,
    desc: 'An old spinning wheel, rewired to a keyboard. It spins out orders far faster than the Needles.',
    joke: 'The wheel spins. The orders come out the other side. Purl tries not to look too closely at the wheel.' },
  { id: 'tape3', kind: 'one', at: 8e4, name: 'Tape 3: Affirm Harder', base: 2.5e5,
    desc: 'The guru says to really mean it. Breakthroughs (after you type one of Gordon\'s affirmations) pay ×5 instead of ×3, for 30 s instead of 20.',
    joke: '"Say it like the moth can hear you," says the tape. Purl does. The moth can.' },
  { id: 'loom', kind: 'lv', max: 10, at: 600000.0, name: 'Jacquard Loom', base: 1200000.0, mult: 2.3,
    desc: 'A punch-card loom: the first machine anyone ever programmed. Feed it the order cards and it types them by the hundred.',
    joke: 'The loom reads the punch cards. Somewhere in there is a card that says GORDON. Purl did not punch it.' },
  { id: 'telegraph', kind: 'lv', max: 8, at: 1.5e7, name: 'Telegraph Office', base: 30000000.0, mult: 2.0,
    desc: 'The candle can be seen for miles now, and miles of people want a ring. A telegraph key types their orders straight in, dot by dash.',
    joke: 'The telegraph clatters all night. STOP. Purl has learned Morse. STOP. Most of it is Gordon\'s name. STOP.' },
  { id: 'tape4', kind: 'one', at: 60000000.0, name: 'Tape 4: Let Others Type', base: 150000000.0,
    desc: 'Delegate. Visualise. Delegate again. Everything that types on its own types twice as fast.',
    joke: '"You are the vision," says the tape. "The Needles are the hands." The Needles click, offended.' },
  // Silly ones: they do nothing but go in the picture.
  { id: 'board', kind: 'odd', at: 150, name: 'Vision Board', base: 200,
    desc: 'A corkboard for the wall, as recommended on Tape 1. Purl pins up a drawing of the Big Candle, finished.',
    joke: 'Purl pins up the Big Candle, finished and lit. Somebody has added a tiny moth in the corner, in pencil. It wasn\'t Purl.' },
  { id: 'poster', kind: 'odd', at: 2e3, name: 'Motivational Poster', base: 4e3,
    desc: 'A framed poster: HANG IN THERE. Purl ordered it by phone without asking what was on it.',
    joke: 'It\'s a kitten. Dangling from a ball of yarn. Purl has turned it to face the wall, twice. It keeps getting turned back.' },
  { id: 'trap', kind: 'odd', at: 1.2e5, name: 'Moth Trap', base: 3e5,
    desc: 'An elaborate moth trap, with a lavender lure and a sign: NOT FOR GORDON (IT IS FOR GORDON).',
    joke: 'Gordon has found the moth trap. Gordon sits on it like a bench, to watch the candle go up.' },
  { id: 'hat', kind: 'odd', at: 1e7, name: 'Tiny Hard Hat', base: 2.5e7,
    desc: 'A hard hat, yellow, Purl-sized. A building site needs one. The building site is a candle.',
    joke: 'Purl wears the hard hat everywhere. It has a little torch on the front. Gordon follows the torch.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const max = it => it.kind === 'lv' ? it.max : 1;
export const lv = (S, id) => S.lv[id] || 0;
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind !== 'lv') return it.base;
  return Math.round(it.base * Math.pow(it.mult, lv(S, id)));
}

// ---------- Rates ----------
// What one letter on the next ring is worth, before events.
export const finishMult = S => Math.pow(1.8, lv(S, 'finish'));
export const heightMult = (S, R = S.rings) => Math.pow(1 + R / 20, HEIGHT_POW);
export const letterPrice = S => heightMult(S) * finishMult(S) * (lv(S, 'tape2') ? 3 : 1);
export const breakMult = S => lv(S, 'tape3') ? 5 : 3;
export const breakSecs = S => lv(S, 'tape3') ? 30 : BREAK_SECS;
// Letters a second from everything that types on its own.
export const NEEDLE_RATE = 0.25, WHEEL_RATE = 1, LOOM_RATE = 4, TELEGRAPH_RATE = 6;
export const helperRate = S => (lv(S, 'needles') * NEEDLE_RATE + lv(S, 'wheel') * WHEEL_RATE + lv(S, 'loom') * LOOM_RATE + lv(S, 'telegraph') * TELEGRAPH_RATE) * (lv(S, 'tape4') ? 2 : 1);
export const HELPER_WORD = 12;          // the helpers' rings average twelve letters

// ---------- State ----------
export function fresh() {
  return {
    tin: 0, value: 0, rings: 0, typed: 0, fumbles: 0, wonky: 0, helperRings: 0, helperAcc: 0,
    lv: {}, seen: {}, time: 0, started: false, ended: false, final: false,
    order: null, pos: 0, miss: 0, caught: false, affirm: false, nextAff: 0,
    breakT: 0, cutT: 0, nextGordon: 75, nextCut: 260, gordons: 0, cuts: 0,
    log: [], recent: [], boughtOpen: false,
  };
}
export function load(raw) {
  const S = fresh();
  if (raw && typeof raw === 'object') Object.assign(S, raw, { lv: { ...(raw.lv || {}) }, seen: { ...(raw.seen || {}) } });
  if (!Array.isArray(S.recent)) S.recent = [];
  return S;
}

// ---------- Printing a ring ----------
// Pays the ring and grows the candle. who: 'you' | 'help'. wonky: a fumble set in the wax (pays half).
export const SIGNED = 5;              // a ring typed by Purl personally is signed, and worth five times a helper's
export function ringPay(S, word, { wonky = false, mult = 1 } = {}) {
  return letters(word) * letterPrice(S) * SIGNED * mult * (wonky ? 0.5 : 1);
}
export function printRing(S, word, { who = 'you', wonky = false, mult = 1 } = {}) {
  const pay = ringPay(S, word, { wonky, mult });
  S.tin += pay; S.value += pay; S.rings += 1;
  if (who === 'help') S.helperRings += 1; else S.typed += 1;
  if (wonky) S.wonky += 1;
  S.recent.push({ w: word, who, wonky, mult: mult > 1 ? mult : undefined, n: S.rings });
  if (S.recent.length > 14) S.recent.shift();
  return pay;
}
// The helpers type for dt seconds; returns the words they finished (rings are printed here).
export function helpersTick(S, dt, mult = 1, rnd = Math.random) {
  const out = [];
  S.helperAcc += helperRate(S) * dt;
  let guard = 0;
  while (S.helperAcc >= HELPER_WORD && guard++ < 400) {
    S.helperAcc -= HELPER_WORD;
    const w = pickOrder(S, rnd);
    // A helper's ring is billed at twelve letters whatever the order, so the rate readout is exact.
    const pay = HELPER_WORD * letterPrice(S) * mult;
    S.tin += pay; S.value += pay; S.rings += 1; S.helperRings += 1;
    S.recent.push({ w, who: 'help', n: S.rings });
    if (S.recent.length > 14) S.recent.shift();
    out.push({ w, pay });
  }
  return out;
}

// ---------- Shop ----------
export const visible = S => ITEMS.filter(it => S.seen[it.id] && lv(S, it.id) < max(it));
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) if (!S.seen[it.id] && S.value >= it.at && lv(S, it.id) < max(it)) { S.seen[it.id] = true; fresh.push(it.id); }
  return fresh;
}
export function buy(S, id) {
  const it = BY_ID[id];
  if (!it || lv(S, id) >= max(it)) return false;
  const c = cost(S, id);
  if (S.tin < c) return false;
  S.tin -= c; S.lv[id] = lv(S, id) + 1;
  return true;
}
export const bought = S => ITEMS.filter(it => it.kind !== 'lv' && lv(S, it.id) >= 1);

// ---------- Numbers ----------
const UNITS = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million']];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  for (const [v, u] of UNITS) if (n >= v) return `${(n / v).toFixed(n / v >= 100 ? 0 : n / v >= 10 ? 1 : 2)}${u}`;
  if (n >= 1e4) return Math.round(n).toLocaleString('en-US');
  if (n >= 100) return Math.round(n).toLocaleString('en-US');
  if (n >= 10) return n.toFixed(1).replace(/\.0$/, '');
  return n.toFixed(2).replace(/\.00$/, '');
}
export const money = n => '$' + fmt(n);
export function short(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return '$' + Math.round(n);
}
