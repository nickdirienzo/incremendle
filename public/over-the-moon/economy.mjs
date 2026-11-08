// Over the Moon: the rules. The page and the pacing sim (sim.mjs) both import this.
// Clover, a dramatic rabbit, follows Great-Aunt Kiki's folded recipe card ("FERMENT … UMBRELLAS …
// LET RISE"). Umbrellas proof in crocks until they puff up like dough; a puffed umbrella, flicked,
// floats up and ties onto the bouquet over the kitchen, and the kitchen rises by its lift. The higher
// the kitchen, the more people can see it; onlookers tip into a basket on a very long string.
// Gravity: an umbrella flicked before it's puffed flops back into its crock. Near the end the Moon's
// own gravity takes over and pulls the kitchen in.

export const CLOUD = 2000;            // m: the rain cloud, and the choice
export const SPACE = 100000;          // m: the edge of space
export const PULL = 326000000;        // m: where the Moon's pull beats the Earth's
export const GOAL = 384400000;        // m: the Moon
export const SATS = 35786000;         // m: the geostationary satellites
// Sights along the way. Time away never carries the kitchen past the next one: Clover
// wouldn't miss a sight with nobody watching.
export const LANDMARKS = [CLOUD, SPACE, SATS, PULL];
export const PER_SHELF = 8;           // crocks per shelf; one sous-chef per shelf
export const MAX_CROCKS = 64;
export const OFFLINE_CAP = 4 * 3600;  // seconds of time away that count
export const OFFLINE_RATE = 0.1;      // sous-chefs work at a tenth of the speed with nobody watching
export const EVERYONE = 8.1e9;
export const EARTH_R = 6371000;       // m

// Gravity falls off with distance from the middle of the Earth, so up high every umbrella lifts
// the kitchen further: an umbrella's lift is in metres at ground gravity.
export const gravity = alt => 1 / Math.pow(1 + alt / EARTH_R, 2);

// Onlookers: everyone within sight. Roughly twenty more for every metre up, and from the Moon,
// the whole planet.
export function onlookers(alt) {
  if (alt >= GOAL) return EVERYONE;
  return Math.min(EVERYONE, Math.floor(12 + 21 * alt));
}

// The straight line: one recipe step after another. The next two always show.
// lift: multiplies each umbrella's lift (a bigger umbrella). proof: multiplies proofing time.
// chef: multiplies a sous-chef's sweep time. odd: does very little (a prop, a joke, a clue).
export const LINE = [
  { id: 'golf', name: 'Golf Umbrella', cost: 16, lift: 2, kind: 'umbrella',
    desc: 'A bigger canopy traps more bubbles. Each umbrella lifts twice as much.',
    joke: '“Fore! That’s a golfing term. I’m told it means duck.”' },
  { id: 'plums', name: 'A Bowl of Plums', cost: 180, odd: true,
    desc: 'The bit of the card that sticks out under the magnet says “plums”. Clover has no idea why. They make a nice paperweight.',
    joke: '“Plums. Mysterious. Purple. Not umbrellas. We’ll come back to them.”' },
  { id: 'sour', name: 'Sourdough Starter', cost: 1000, proof: 0.8, kind: 'culture', label: 'DORIS',
    desc: 'A jar of lively starter, fed twice a day. Umbrellas puff up faster.',
    joke: '“Her name is Doris. Doris is older than me. Doris has opinions.”' },
  { id: 'doorman', name: 'Doorman’s Umbrella', cost: 3800, lift: 2, kind: 'umbrella',
    desc: 'The enormous kind a hotel doorman holds over you from the taxi to the door. Each umbrella lifts twice as much again.',
    joke: '“The doorman wanted it back. I tipped him. He’s still waiting by the door.”' },
  { id: 'cape', name: 'A Dramatic Cape', cost: 12000, odd: true,
    desc: 'For twirling at the onlookers. It does nothing for the umbrellas.',
    joke: '“A host must be seen from the cheap seats. All of the seats are the cheap seats.”' },
  { id: 'kefir', name: 'Kefir Grains', cost: 27000, proof: 0.8, kind: 'culture', label: 'KEFIR',
    desc: 'Little cauliflower-looking lumps that turn milk fizzy overnight. Umbrellas puff up faster.',
    joke: '“They are not grains. They are not cauliflower. They are a mystery, like me.”' },
  { id: 'beach', name: 'Beach Umbrella', cost: 56000, lift: 2, kind: 'umbrella',
    desc: 'Striped, enormous, slightly sandy. Each umbrella lifts twice as much again.',
    joke: '“Out of season. Picked up for a song. I sang it.”' },
  { id: 'kombu', name: 'Kombucha Mother', cost: 110000, proof: 0.8, kind: 'culture', label: 'MOTHER',
    desc: 'A rubbery disc of bacteria and yeast that lives in a jar. Umbrellas puff up faster still.',
    joke: '“Every kitchen needs a mother. This one is a pancake that breathes.”' },
  { id: 'spoons', name: 'Long Wooden Spoons', cost: 230000, chef: 0.75, kind: 'chef',
    desc: 'Sous-chefs can reach the back of the shelf. They sweep their shelves faster.',
    joke: '“A spoon is just a flick you can hold.”' },
  { id: 'mini', name: 'One Very Small Umbrella', cost: 410000, odd: true,
    desc: 'A paper cocktail umbrella, fermented for three whole days. It lifted nothing at all. Clover keeps it on the windowsill anyway.',
    joke: '“Too small to matter, darling. But look at it. Look at its little face.”' },
  { id: 'cafe', name: 'Café Umbrella', cost: 800000, lift: 2, kind: 'umbrella',
    desc: 'From a pavement café, with the name of a fizzy drink on the flaps. Each umbrella lifts twice as much again.',
    joke: '“The café called. I said I’d bring it back from the Moon.”' },
  { id: 'koji', name: 'A Pinch of Koji', cost: 1.5e6, proof: 0.8, kind: 'culture', label: 'KOJI',
    desc: 'Rice dusted with the friendly mould that makes miso and soy sauce. Umbrellas puff up faster.',
    joke: '“A mould. In my kitchen. On purpose. Television is a strange business.”' },
  { id: 'patio', name: 'Patio Umbrella', cost: 2.8e6, lift: 2, kind: 'umbrella',
    desc: 'Comes with a hole for a table. Each umbrella lifts twice as much again.',
    joke: '“The table did not come with it. The table is downstairs. The table is very far downstairs.”' },
  { id: 'onggi', name: 'Onggi from Next Door', cost: 3.5e7, proof: 0.8, kind: 'culture',
    desc: 'The neighbours’ big clay kimchi jars, back from their kimjang weekend and lent with a smile. The clay breathes, so umbrellas puff up faster.',
    joke: '“They made two hundred heads of kimchi in one weekend. I made a sandwich. We all have gifts.”' },
  { id: 'glass', name: 'An Empty Little Glass', cost: 3.7e7, odd: true,
    desc: 'A tiny coupe from Kiki’s box of kitchen things. Clover is saving it for a toast at the top.',
    joke: '“A glass this small is for something very good, or something very strong. Kiki was both.”' },
  { id: 'parasol', name: 'Market Parasol', cost: 3.8e7, lift: 2, kind: 'umbrella',
    desc: 'The big square ones from the fruit market. Each umbrella lifts twice as much again.',
    joke: '“Still smells of oranges. The onlookers can smell it from here. Probably.”' },
  { id: 'skates', name: 'Roller Skates', cost: 5.4e7, chef: 0.75, kind: 'chef',
    desc: 'For the sous-chefs, who glide along their shelves. They sweep faster.',
    joke: '“Paper dolls on wheels. Health and safety would have notes, if they could get up here.”' },
  { id: 'ginger', name: 'A Ginger Bug', cost: 7.1e7, proof: 0.8, kind: 'culture', label: 'GINGER',
    desc: 'Ginger, sugar and water, left to bubble: the old starter for homemade soda. Umbrellas puff up faster.',
    joke: '“It’s called a bug. It is not a bug. Please stop calling the hotline.”' },
  { id: 'bandstand', name: 'Bandstand Canopy', cost: 9.6e7, lift: 2, kind: 'umbrella',
    desc: 'The roof off the park bandstand, scalloped edges and all. Each one lifts twice as much again.',
    joke: '“The brass band is still underneath it. They seem fine. They’re playing requests.”' },
  { id: 'song', name: 'A Theme Song', cost: 1.4e8, odd: true,
    desc: 'A little radio on the shelf plays Clover’s theme, which Clover wrote, which is about Clover.',
    joke: '“Da-da-DA, she rises! Da-da-DA, it’s her! There’s a second verse. There are six.”' },
  { id: 'brine', name: 'Last Year’s Brine', cost: 2e8, proof: 0.8, kind: 'culture', label: 'BRINE',
    desc: 'A bottle of Kiki’s brine, kept going since before Clover was born. Umbrellas puff up faster.',
    joke: '“Vintage. Cloudy. Smells like a family argument.”' },
  { id: 'marquee', name: 'Wedding Marquee', cost: 2.9e8, lift: 2, kind: 'umbrella',
    desc: 'A tent is an umbrella that took itself seriously. Each one lifts twice as much again.',
    joke: '“Something borrowed. Something fermented.”' },
  { id: 'whistle', name: 'A Kitchen Whistle', cost: 4.1e8, chef: 0.75, kind: 'chef',
    desc: 'Clover blows it; the sous-chefs sweep faster. Nobody asked for the whistle.',
    joke: '“Yes, chef! Thank you, chef! I am the chef.”' },
  { id: 'boots', name: 'Moon Boots', cost: 5.1e8, odd: true,
    desc: 'Fluffy, silver and two sizes too big. For the landing, Clover says, and for the look.',
    joke: '“One small step. Then a twirl. Then the cape.”' },
  { id: 'stadium', name: 'Stadium Roof', cost: 9.2e8, lift: 3, kind: 'umbrella',
    desc: 'The retractable kind, an umbrella for forty thousand people. Each one lifts three times as much again.',
    joke: '“Rain stopped play. Then umbrella started it.”' },
  { id: 'card', name: 'Squint at the Card', cost: 7.4e9, odd: true,
    desc: 'A magnifying glass for Kiki’s card. Under the fold, near the bottom, a word peeks out: “little”.',
    joke: '“Little… umbrellas? No. LET RISE. It clearly says LET RISE. Onward.”' },
  { id: 'bigtop', name: 'Circus Big Top', cost: 1.3e10, lift: 3, kind: 'umbrella',
    desc: 'The biggest umbrella there is, with flags on. Each one lifts three times as much again.',
    joke: '“Ladies and gentlemen, and everyone in low Earth orbit…”' },
];
export const LINE_BY_ID = Object.fromEntries(LINE.map((u, i) => [u.id, { ...u, i }]));
export const SHOW_NEXT = 2;
const NEAR = 0.4;   // things show up once you have this much of their price

// Leveled things, bought many times.
export const LEVELS = {
  crock:  { name: 'Crock', base: 6, grow: 1.5, max: MAX_CROCKS,
            desc: 'Another crock on the shelves, proofing one umbrella at a time. Eight to a shelf.' },
  chef:   { name: 'Sous-chef', base: 17000, grow: 13, max: MAX_CROCKS / PER_SHELF, need: alt => alt >= 80,
            desc: 'A paper-doll sous-chef who tends one shelf: every few seconds they sweep it and flick every puffed umbrella on it.' },
  basket: { name: 'Bigger Basket', base: 40, grow: 1.95, max: 40, need: alt => alt >= 6,
            desc: 'The tip basket on the end of the string. A bigger one catches more: tips +20%.' },
};

// The cloud: the choice you can't take back.
export const CHOICES = {
  rain:   { name: 'Rain It on the Town', lift: 2,
            desc: 'Stir the starter into the rain cloud. It rains on the town below, every umbrella in town starts to ferment, and they all float up to join yours. Each umbrella you send brings one from town: lift ×2.',
            after: 'The town stays soaked for the rest of the trip. Its umbrellas keep floating up past the window.' },
  bottle: { name: 'Bottle the Cloud', proof: 0.5,
            desc: 'Bag the cloud and hang it under the kitchen: a brine tank the size of a cloud. Umbrellas puff up twice as fast.',
            after: 'The town below gets clear skies for the rest of the trip. The cloud comes with you.' },
};

export function newState() {
  return {
    t: 0, tips: 0, alt: 0, pent: 0, sent: 0, flicked: 0, flops: 0, chefSent: 0, tipsAll: 0,
    lv: { crock: 1, chef: 0, basket: 0 }, line: 0, choice: null,
    cr: [0], chefT: [], pullT: 0, landed: false, toasted: false, ended: false,
    seen: [], boughtOpen: false, savedAt: 0,
  };
}
export function load(raw) {
  const S = newState();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(S)) if (raw[k] !== undefined) S[k] = raw[k];
    S.lv = { ...newState().lv, ...(raw.lv || {}) };
  }
  // A finished save opens on the finished world: everything built.
  if (S.ended) {
    S.line = LINE.length; S.lv.crock = MAX_CROCKS; S.lv.chef = LEVELS.chef.max; S.lv.basket = Math.max(S.lv.basket, 12);
    S.alt = GOAL; S.landed = true; S.toasted = true; S.choice = S.choice || 'rain';
  }
  if (S.landed) S.alt = GOAL;
  fixCrocks(S);
  return S;
}
export function fixCrocks(S) {
  const n = S.lv.crock;
  if (!Array.isArray(S.cr)) S.cr = [];
  while (S.cr.length < n) S.cr.push(0);
  S.cr.length = n;
  const shelves = Math.ceil(n / PER_SHELF);
  if (!Array.isArray(S.chefT)) S.chefT = [];
  while (S.chefT.length < shelves) S.chefT.push(Math.random() * 2);
}

export const has = (S, id) => S.line > LINE_BY_ID[id].i;
export const TUNE = { lift0: 0.08 };     // a plain brolly lifts the kitchen 8 cm
export function liftEach(S) {
  let l = TUNE.lift0;
  for (let i = 0; i < S.line; i++) if (LINE[i].lift) l *= LINE[i].lift;
  if (S.choice === 'rain') l *= CHOICES.rain.lift;
  return l;
}
export function proofTime(S) {
  let p = 3;
  for (let i = 0; i < S.line; i++) if (LINE[i].proof) p *= LINE[i].proof;
  if (S.choice === 'bottle') p *= CHOICES.bottle.proof;
  return p;
}
export function chefTime(S) {
  let c = 3.2;
  for (let i = 0; i < S.line; i++) if (LINE[i].chef) c *= LINE[i].chef;
  return c;
}
export const tipEach = S => 0.01 * Math.pow(1.2, S.lv.basket);   // $ per onlooker per second
export const tipRate = S => onlookers(S.alt) * tipEach(S);
export const umbrellaTier = S => LINE.slice(0, S.line).filter(u => u.kind === 'umbrella').length; // 0..10
export const stuck = S => !S.choice && S.alt >= CLOUD;
export const choiceDue = S => stuck(S);
export const pulled = S => S.alt >= PULL && !S.landed;
export function phase(S) {
  if (S.ended || S.landed) return 'ending';
  if (S.alt >= PULL) return 'moon';
  if (S.alt >= SPACE) return 'space';
  if (S.choice) return 'sky';
  return 'ground';
}
// The meter climbs by powers of ten: a metre, a kilometre, a thousand kilometres, the Moon.
export const progress = S => S.landed ? 1 : Math.min(1, Math.log10(1 + S.alt) / Math.log10(1 + GOAL));

// Prices
export const levelCost = (S, id) => {
  const L = LEVELS[id], n = id === 'crock' ? S.lv.crock - 1 : S.lv[id];
  return Math.ceil(L.base * Math.pow(L.grow, n));
};
export const lineCost = i => LINE[i].cost;

// What's on sale. Things that have shown up stay until bought (S.seen remembers them).
export function items(S) {
  const out = [];
  if (S.landed || S.ended) return out;
  for (const id of Object.keys(LEVELS)) {
    const L = LEVELS[id];
    const max = id === 'chef' ? Math.min(L.max, Math.ceil(S.lv.crock / PER_SHELF)) : L.max;
    const atMax = (id === 'crock' ? S.lv.crock : S.lv[id]) >= L.max;
    const open = S.seen.includes(id) || ((!L.need || L.need(S.alt)) && S.tips >= levelCost(S, id) * NEAR);
    if (!open || atMax) continue;
    out.push({ id, kind: 'level', name: L.name, price: levelCost(S, id), level: id === 'crock' ? S.lv.crock : S.lv[id], max: L.max,
               capped: (id === 'chef' && S.lv.chef >= max) });
  }
  for (let i = S.line; i < Math.min(LINE.length, S.line + SHOW_NEXT); i++) {
    const u = LINE[i];
    // The next step shows when it's nearly affordable; the one after shows with it.
    if (!S.seen.includes(u.id) && !(i === S.line ? S.tips >= u.cost * NEAR : S.seen.includes(LINE[S.line].id))) break;
    out.push({ id: u.id, kind: 'line', name: u.name, price: u.cost, odd: !!u.odd, next: i === S.line });
  }
  return out;
}
// Newly revealed ids (for the "new" tag and the unlock chime).
export function reveal(S) {
  const fresh = [];
  for (const it of items(S)) if (!S.seen.includes(it.id)) { S.seen.push(it.id); fresh.push(it.id); }
  return fresh;
}
// Can it be bought right now? Line steps go in order: only the next one.
export function canBuy(S, id) {
  const it = items(S).find(i => i.id === id);
  if (!it || it.capped) return false;
  if (it.kind === 'line' && !it.next) return false;
  return S.tips >= it.price;
}
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = items(S).find(i => i.id === id);
  S.tips -= it.price;
  if (it.kind === 'line') S.line++;
  else if (id === 'crock') { S.lv.crock++; fixCrocks(S); }
  else S.lv[id]++;
  return true;
}
export function choose(S, which) {
  if (S.choice || !CHOICES[which]) return false;
  S.choice = which;
  return true;
}
export const bought = S => LINE.slice(0, S.line);

// Flicking. Returns 'up' (sent), 'flop' (not puffed yet: gravity wins) or null (empty).
export function flick(S, i, byChef = false) {
  if (S.landed || i < 0 || i >= S.cr.length) return null;
  const p = S.cr[i];
  if (p >= 1) {
    S.cr[i] = 0;
    send(S, 1);
    if (byChef) S.chefSent++; else S.flicked++;
    return 'up';
  }
  if (p > 0.6 && !byChef) { S.flops++; return 'flop'; }
  return null;
}
function send(S, n) {
  S.sent += n;
  if (S.alt >= PULL) return;              // the Moon has us now
  const lift = liftEach(S) * n / gravity(S.alt);
  if (!S.choice && S.alt + lift >= CLOUD) { S.pent += S.alt + lift - CLOUD; S.alt = CLOUD; return; }
  S.alt = Math.min(PULL, S.alt + lift);
}
export function release(S) {   // after the choice, what piled up under the cloud goes up
  const p = S.pent * (S.choice === 'rain' ? CHOICES.rain.lift : 1);
  S.pent = 0;
  S.alt = Math.min(PULL, S.alt + p / gravity(S.alt));
}

// Time passes: crocks proof, sous-chefs sweep, onlookers tip, and near the end the Moon pulls.
// Returns the crock indexes the sous-chefs flicked (for the picture).
export function tick(S, dt) {
  if (S.ended) return [];
  S.t += dt;
  const pt = proofTime(S);
  for (let i = 0; i < S.cr.length; i++) if (S.cr[i] < 1) S.cr[i] = Math.min(1, S.cr[i] + dt / pt);
  const swept = [];
  const ct = chefTime(S);
  for (let s = 0; s < S.lv.chef; s++) {
    S.chefT[s] = (S.chefT[s] || 0) + dt;
    if (S.chefT[s] >= ct) {
      S.chefT[s] -= ct;
      if (S.chefT[s] > ct) S.chefT[s] = 0;
      for (let i = s * PER_SHELF; i < Math.min(S.cr.length, (s + 1) * PER_SHELF); i++) if (flick(S, i, true) === 'up') swept.push(i);
    }
  }
  const tips = tipRate(S) * dt;
  S.tips += tips; S.tipsAll += tips;
  if (S.alt >= PULL && !S.landed) {
    S.pullT += dt;
    S.alt = Math.min(GOAL, S.alt + dt * (1e6 + (S.alt - PULL) * 0.06));
    if (S.alt >= GOAL) S.landed = true;
  }
  return swept;
}

// Umbrellas a second with nobody flicking: only the sous-chefs' shelves.
export function idleRate(S) {
  const covered = Math.min(S.cr.length, S.lv.chef * PER_SHELF);
  return covered / (proofTime(S) + chefTime(S) / 2);
}
// Time away: sous-chefs keep sweeping at a tenth of the speed, onlookers keep tipping. Stops short of
// the next landmark (nobody's there to choose at the cloud, or to see the satellites or the Moon).
export function offline(S, secs) {
  const away = Math.min(OFFLINE_CAP, Math.max(0, secs)) * OFFLINE_RATE;
  const before = { alt: S.alt, tips: S.tips, sent: S.sent };
  if (S.landed || S.ended || away < 30) return null;
  const lim = LANDMARKS.find(m => m > S.alt + 1) ?? PULL;
  let left = away;
  while (left > 0) {
    const dt = Math.min(10, left); left -= dt;
    const n = idleRate(S) * dt;
    S.sent += n; S.chefSent += n;
    S.alt = Math.min(lim - 1, S.alt + n * liftEach(S) / gravity(S.alt));
    const tips = tipRate(S) * dt;
    S.tips += tips; S.tipsAll += tips;
  }
  return { secs, alt: S.alt - before.alt, tips: S.tips - before.tips, sent: S.sent - before.sent };
}

// Numbers, the cooking-show way.
const NAMES = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million']];
export function fmt(n, short = false) {
  n = Math.floor(n);
  if (n < 1e6) return n.toLocaleString('en-US');
  for (const [v, w] of NAMES) if (n >= v) {
    const x = n / v;
    return (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2)).replace(/\.?0+$/, '') + (short ? w.trim()[0].toUpperCase() : w);
  }
  return String(n);
}
export function money(n, short = false) {
  if (n < 100) return '$' + (Math.floor(n * 100) / 100).toFixed(n < 10 ? 2 : 1).replace(/\.0$/, '');
  if (n < 1e6) return '$' + Math.floor(n).toLocaleString('en-US');
  return '$' + fmt(n, short);
}
export function height(m) {
  if (m < 1000) return `${Math.floor(m)} m`;
  const km = m / 1000;
  if (km < 10) return `${km.toFixed(2)} km`;
  if (km < 1e6) return `${Math.floor(km).toLocaleString('en-US')} km`;
  return `${fmt(km)} km`;
}
