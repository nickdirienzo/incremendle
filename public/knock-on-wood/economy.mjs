// Knock on Wood: the rules. Pure logic, shared by the game (index.html) and the pacing sim (sim.mjs).
//
// The ledger of Cobwell House can't say no, so over 140 years it lent all 99 cups of the house service to whoever
// asked, mostly the dead. Cornelius (the house map) dared it to get every one back on the dresser.
//   Knocks  the ledger knocks on doors with its cover, in time with the music (rhythm taps), and wallpaper hands help.
//   Ghosts  a ghost answers a knock: Call one for knocks. Ghosts walk Cornelius's map to fetch cups.
//   Cups    a trip only finds its room if the map is right; every wrong turn is written down: Cornelius owes 1.
// Correcting the map (red pencil, in the play area) reveals the next room and its cups. Lending ("Say yes") sends half
// the cups home back out to the rooms, for credit that speeds up everything. Every 25 ghosts or hands doubles them.
// Once every room on the map is empty, 11 cups are still out: all lent to "C.". Balance the Books costs everything.

export const TOTAL = 99;              // a ledger column is two digits wide
export const CELLAR = 11;             // lent to "C." on eleven different dates
export const BASE_TRIP = 600;         // seconds for one ghost to walk to the Scullery and back
export const TRIP_STEP = 0.32;        // each room further along the map adds this much again
export const BALANCE_KNOCKS = 99;     // a full column of knocks
export const BALANCE_GHOSTS = 99;     // and a full column of ghosts: one for every cup
export const OFFLINE_RATE = 0.5, OFFLINE_CAP = 8 * 3600, OFFLINE_KNOCKS = 99;

// The rooms on Cornelius's map, in the order the corrections find them: 88 cups, + the Cellar's 11 = 99.
// pattern: 16 eighth-note slots over two bars; x = knock. The map's wrong label is what the correction fixes.
export const ROOMS = [
  { id: 'scullery', name: 'Scullery', cups: 6, wrong: 'BALLROOM', cost: 0, fix: '', pattern: 'x...x...x...x...',
    joke: 'Cornelius has it down as the Ballroom. It has a mangle in it.' },
  { id: 'parlour', name: 'Parlour', cups: 6, wrong: 'Broom Cupboard', cost: 5, fix: 'The Parlour is not a broom cupboard',
    pattern: 'x...x...x...x.x.', joke: 'There is a broom in it. Cornelius says that proves his point.' },
  { id: 'library', name: 'Library', cups: 7, wrong: '(nothing)', cost: 9, fix: 'The Library is behind the bookcase',
    pattern: 'x.x.....x.x.....', joke: 'Obviously. Every house this old has one. Cornelius had drawn a wall.' },
  { id: 'conservatory', name: 'Conservatory', cups: 7, wrong: 'Duck Pond', cost: 14, fix: 'The Conservatory is the glass one',
    pattern: 'x...x.x.x...x...', joke: 'He insists it is a pond. It is a room made of windows full of dead ferns.' },
  { id: 'music', name: 'Music Room', cups: 7, wrong: 'Quiet Room', cost: 20, fix: 'The Music Room is where the noise is',
    pattern: 'x..x..x.x..x..x.', joke: 'The piano plays itself at four. Cornelius calls that "settling".' },
  { id: 'dining', name: 'Dining Room', cups: 7, wrong: 'Garden', cost: 27, fix: 'The Dining Room is indoors',
    pattern: 'x.x.x.x.x.......', joke: 'Cornelius had it as a lawn. The ghosts have been eating off the floor since 1890.' },
  { id: 'nursery', name: 'Nursery', cups: 8, wrong: '(moved)', cost: 35, fix: 'The Nursery has moved (again)',
    pattern: 'x...xx..x...xx..', joke: 'It moves every Tuesday. The rocking horse is the only one who knows where.' },
  { id: 'billiard', name: 'Billiard Room', cups: 8, wrong: 'Lake', cost: 44, fix: 'The Billiard Room is not a lake',
    pattern: 'x.x.x...x.x.x...', joke: 'It is green and flat. That is where the resemblance ends.' },
  { id: 'chapel', name: 'Chapel', cups: 8, wrong: 'Second Staircase', cost: 54, fix: 'There is no second staircase',
    pattern: 'x..x..x...x..x..', joke: 'Ghosts who took the second staircase are still on it. Stop drawing it.' },
  { id: 'attic', name: 'Attic', cups: 8, wrong: 'Basement', cost: 65, fix: 'Up is up',
    pattern: 'xx..x...xx..x...', joke: 'He drew the whole top floor upside down. The ghosts went to the cellar steps and stopped.' },
  { id: 'tower', name: 'Bell Tower', cups: 8, wrong: 'Chimney', cost: 80, fix: 'The Bell Tower is the tall bit',
    pattern: 'x...x...xxx.x...', joke: 'The bell is still up there. So is a ghost who has been ringing it since 1902.' },
  { id: 'ballroom', name: 'Ballroom', cups: 8, wrong: 'Scullery', cost: 99, fix: 'The Ballroom is not the Scullery',
    pattern: 'x..xx.x.....x.x.', joke: 'Shave and a haircut. The Ballroom ghosts won\'t answer anything else.' },
];
// Music and look move with the house: downstairs, upstairs, the top of the house, the ending.
export const phaseOf = S => S.ended ? 'end' : S.open >= 10 ? 'top' : S.open >= 5 ? 'up' : 'down';
export const PHASE_NAMES = { down: 'Downstairs', up: 'Upstairs', top: 'The top of the house', end: 'The Cellar' };

// ---------- the shop ----------
// kind: up (one-time real upgrade), odd (silly, for the picture). at: rooms open before it shows.
export const ITEMS = [
  { id: 'cosy', kind: 'odd', name: 'Tea Cosy', at: 1, base: 6,
    desc: 'A knitted tea cosy. The ledger wears it as a hat.',
    joke: 'It has been asked to take it off indoors. It can\'t say no, so it says "in a minute".' },
  { id: 'brass', kind: 'up', name: 'Brass Corners', at: 1, base: 14,
    desc: 'Brass corners on the ledger\'s cover, for a louder knock. +1 knock per knock in time.',
    joke: 'Very nearly a weapon. The doors take it seriously now.' },
  { id: 'mat', kind: 'odd', name: 'WELCOME Mat', at: 2, base: 12,
    desc: 'A doormat for the ledger to stand on while it knocks.',
    joke: 'From outside it says WELCOME. From inside it says LEAVE.' },
  { id: 'chalk', kind: 'up', name: 'Chalk Arrows', at: 2, base: 20,
    desc: 'Chalk arrows on the skirting boards, wherever Cornelius points the wrong way. Map right +10%.',
    joke: 'Cornelius says they\'re lovely, and very wrong, and points the other way.' },
  { id: 'clock', kind: 'up', name: 'Grandfather Clock', at: 3, base: 26,
    desc: 'A clock in the hall that ticks the beat out loud. Knocks count in time from further off the beat.',
    joke: 'Nobody wound it. It started on its own the day the dare began.' },
  { id: 'specs', kind: 'odd', name: 'Spectacles for Cornelius', at: 3, base: 22,
    desc: 'A tiny pair of reading glasses for the map, balanced on his cartouche.',
    joke: 'He still reads himself upside down. He says the view is better.' },
  { id: 'lantern', kind: 'up', name: 'Lanterns', at: 4, base: 38,
    desc: 'A lantern for every ghost, so they stop feeling along the walls. Trips take a quarter less time.',
    joke: 'Ghosts can see in the dark. They just don\'t like what they see.' },
  { id: 'cards', kind: 'up', name: 'Calling Cards', at: 4, base: 34,
    desc: 'Proper calling cards, slipped under the doors before you knock. Ghosts cost a quarter fewer knocks to call.',
    joke: 'THE LEDGER, COBWELL HOUSE. Says Yes. They have very good manners, the dead.' },
  { id: 'tags', kind: 'odd', name: 'Name Tags', at: 5, base: 30,
    desc: 'A sticky name tag for every ghost who answers.',
    joke: 'HELLO, I OWE: 1 CUP. They wear them with pride.' },
  { id: 'string', kind: 'up', name: 'Ball of String', at: 5, base: 48,
    desc: 'A string tied to the dresser, so ghosts can find their way back. Map right +10%.',
    joke: 'It worked for the Minotaur\'s visitors. Mostly.' },
  { id: 'lion', kind: 'up', name: 'Lion\'s-Head Clasp', at: 6, base: 58,
    desc: 'A brass lion\'s head on the ledger\'s clasp, a proper knocker. +1 more knock per knock in time.',
    joke: 'It roars a little when you knock. Doors open just to make it stop.' },
  { id: 'milk', kind: 'odd', name: 'A Saucer of Milk', at: 6, base: 40,
    desc: 'A saucer of milk by the skirting board, for whatever lives in the walls.',
    joke: 'There is no cat. The saucer is empty every time you look.' },
  { id: 'trolley', kind: 'up', name: 'Tea Trolley', at: 7, base: 68,
    desc: 'A squeaky tea trolley for the ghosts to push. A trip that finds its room brings back two cups.',
    joke: 'You can hear it coming three rooms away. That\'s the trolley. Probably.' },
  { id: 'ink', kind: 'up', name: 'Red Ink', at: 7, base: 64,
    desc: 'The ledger writes its loans in red. Every cup you lend from now on counts half again towards credit.',
    joke: 'In the red, at last. It feels very grown up.' },
  { id: 'portrait', kind: 'odd', name: 'Portrait of Cornelius', at: 8, base: 55,
    desc: 'A portrait of Cornelius Cobwell, architect, for the hall.',
    joke: 'The eyes don\'t follow you. They follow the floor.' },
  { id: 'compass', kind: 'up', name: 'A Compass That Works', at: 9, base: 88,
    desc: 'A compass from the Bell Tower that points north, unlike some people. Map right +15%.',
    joke: 'Cornelius says it\'s broken. It points at him and he looks away.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

export function fresh() {
  return {
    knocks: 0, ghosts: 0, stationed: 0, hands: 0, home: 0, owed: 0, lentTotal: 0, lends: 0, open: 1,
    rooms: ROOMS.map((r, i) => i === 0 ? r.cups : 0),
    up: {}, seen: {}, earned: 0, trips: 0, trip: 0, tapped: 0, perfect: 0,
    time: 0, started: false, ended: false, balanced: false, cellar: 0, best: 0,
  };
}
export function load(raw) {
  const S = Object.assign(fresh(), raw || {});
  if (!Array.isArray(S.rooms) || S.rooms.length !== ROOMS.length) S.rooms = fresh().rooms;
  if (S.ended) finishWorld(S);
  return S;
}
// A save of just { ended: true } opens into the finished world: every room open, every cup home.
export function finishWorld(S) {
  S.open = ROOMS.length; S.rooms = ROOMS.map(() => 0); S.home = TOTAL; S.cellar = CELLAR; S.balanced = true;
  for (const it of ITEMS) S.up[it.id] = true;
  if (!S.hands) S.hands = 50;
}

// ---------- the numbers ----------
export const milestone = n => 2 ** Math.floor(n / 25);         // the twist: every 25 owned doubles it
export const nextMilestone = n => (Math.floor(n / 25) + 1) * 25;
export const power = S => 1 + (S.up.brass ? 1 : 0) + (S.up.lion ? 1 : 0);
export const creditOf = lent => 1 + Math.sqrt(lent) / 8;
export const credit = S => creditOf(S.lentTotal);
export const lendWeight = S => S.up.ink ? 1.5 : 1;
export const hitWindow = S => S.up.clock ? 0.17 : 0.11;          // seconds either side of the beat that count
export const perfectWindow = S => S.up.clock ? 0.07 : 0.05;   // in this close, the knock counts double
export const accuracy = S => Math.min(0.9, 0.25 + 0.025 * (S.open - 1) + (S.up.chalk ? 0.1 : 0) + (S.up.string ? 0.1 : 0)
  + (S.up.compass ? 0.15 : 0));
export const HAND_RATE = 0.45;  // knocks a minute, each
export const handRate = S => S.hands * HAND_RATE / 60 * milestone(S.hands) * credit(S);  // knocks a second
export const tripSpeed = S => milestone(S.ghosts) * (S.up.lantern ? 4 / 3 : 1) * credit(S);
export const tripTime = i => BASE_TRIP * (1 + TRIP_STEP * i);
export const cupsPerTrip = S => S.up.trolley ? 2 : 1;
export const ghostCost = S => Math.ceil((5 + 0.95 * S.ghosts) * (S.up.cards ? 0.75 : 1));
export const handCost = S => Math.ceil(9 + 1.75 * S.hands);
export const MAX_GHOSTS = 99, MAX_HANDS = 52;
export const out = S => S.rooms.reduce((a, b) => a + b, 0);    // cups still in the rooms on the map
// The nearest open room that still has cups: where the ghosts go next.
export const target = S => { for (let i = 0; i < S.open; i++) if (S.rooms[i] > 0) return i; return -1; };
// Knocks for a knock in time: perfect counts double.
export const knockValue = (S, perfect) => power(S) + (perfect ? 1 : 0);
export const cupsPerMin = S => {
  const t = target(S); if (t < 0 || !S.ghosts) return 0;
  return S.ghosts * tripSpeed(S) / tripTime(t) * 60 * accuracy(S) * cupsPerTrip(S);
};

// ---------- actions ----------
export function knock(S, perfect) {
  const v = knockValue(S, perfect);
  S.knocks += v; S.earned += v; S.tapped++; if (perfect) S.perfect++;
  return v;
}
export function cost(S, id) {
  if (id === 'ghost') return ghostCost(S);
  if (id === 'hand') return handCost(S);
  if (id === 'fix') return S.open < ROOMS.length ? ROOMS[S.open].cost : Infinity;   // in ghosts
  return BY_ID[id].base;
}
export function canBuy(S, id) {
  if (S.ended) return false;
  if (id === 'ghost' && S.ghosts >= MAX_GHOSTS) return false;
  if (id === 'hand' && S.hands >= MAX_HANDS) return false;
  if (id === 'fix' && S.open >= ROOMS.length) return false;
  if (BY_ID[id] && S.up[id]) return false;
  if (id === 'fix') return S.ghosts >= cost(S, id);
  return S.knocks >= cost(S, id);
}
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  if (id === 'fix') { S.ghosts -= cost(S, id); S.stationed += cost(S, id); S.rooms[S.open] = ROOMS[S.open].cups; S.open++; return true; }
  S.knocks -= cost(S, id);
  if (id === 'ghost') S.ghosts++;
  else if (id === 'hand') S.hands++;
  else S.up[id] = true;
  return true;
}
// Items the player can see: revealed by rooms open, and once seen they stay until bought.
export function visible(S) {
  return ITEMS.filter(it => !S.up[it.id] && (S.seen[it.id] || S.open >= it.at));
}
export const handsUnlocked = S => S.open >= 2 || S.hands > 0;
// The ghosts ask to borrow cups. The ledger can't say no; it can only make them wait.
export const LEND_MIN = 6;
export const lendAmount = S => S.home >= LEND_MIN ? Math.floor(S.home / 2) : 0;
export const canLend = S => !S.ended && !S.balanced && lendAmount(S) > 0;
export const creditAfterLend = S => creditOf(S.lentTotal + lendAmount(S) * lendWeight(S));
export function lend(S, rng = Math.random) {
  const n = lendAmount(S); if (!n || S.ended) return 0;
  S.home -= n; S.lentTotal += n * lendWeight(S); S.lends++;
  // The borrowers take them back to whichever open rooms they live in.
  for (let k = 0; k < n; k++) S.rooms[Math.floor(rng() * S.open)]++;
  return n;
}
// Balance the Books: once every room on the map is empty. Costs everything: a full column of knocks and of ghosts.
export const balanceShown = S => !S.ended && S.open >= ROOMS.length && out(S) === 0;
export const canBalance = S => balanceShown(S) && S.knocks >= BALANCE_KNOCKS && S.ghosts >= BALANCE_GHOSTS;
export function balance(S) {
  if (!canBalance(S)) return false;
  S.paid = { knocks: Math.floor(S.knocks), ghosts: S.ghosts };
  S.knocks = 0; S.ghosts = 0; S.lentTotal = 0; S.balanced = true;
  return true;
}

// ---------- time ----------
// Returns what happened, so the game can play sounds and write the log.
export function step(S, dt, rng = Math.random, rate = 1) {
  const ev = { cups: 0, wrong: 0, knocks: 0 };
  if (S.ended || S.balanced) return ev;
  const hk = handRate(S) * dt * rate;
  S.knocks += hk; S.earned += hk; ev.knocks = hk;
  let t = target(S);
  if (S.ghosts && t >= 0) {
    S.trip += dt * rate * S.ghosts * tripSpeed(S) / tripTime(t);
    let guard = 0;
    while (S.trip >= 1 && guard++ < 10000) {
      S.trip -= 1; S.trips++;
      if (rng() < accuracy(S)) {
        const n = Math.min(cupsPerTrip(S), S.rooms[t]);
        S.rooms[t] -= n; S.home += n; ev.cups += n;
      } else { S.owed++; ev.wrong++; }
      t = target(S); if (t < 0) { S.trip = 0; break; }
    }
  } else S.trip = 0;
  S.best = Math.max(S.best, S.home);
  return ev;
}
// Offline: the hands and the ghosts carry on at half pace, up to eight hours.
export function offline(S, seconds, rng = Math.random) {
  const secs = Math.min(OFFLINE_CAP, Math.max(0, seconds));
  const sum = { cups: 0, wrong: 0, knocks: 0, secs };
  const k0 = S.knocks;
  for (let t = 0; t < secs; t += 5) {
    const e = step(S, Math.min(5, secs - t), rng, OFFLINE_RATE);
    sum.cups += e.cups; sum.wrong += e.wrong;
  }
  // Nobody is holding the pen while you're away: the column only fills to 99.
  S.knocks = Math.max(k0, Math.min(S.knocks, Math.max(k0, OFFLINE_KNOCKS)));
  sum.knocks = S.knocks - k0;
  return sum;
}
