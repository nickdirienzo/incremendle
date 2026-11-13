// Better Late: the rules. The page and the pacing sim (sim.mjs) both import this.
// The minute wheel in the neon clock of the Sundown Motel sign is fifty-nine minutes late: over the years
// it lost its teeth, and a gear with gaps slips. Seconds, the second hand, dared it to be on time, once.
// Its lost teeth went feral in the dark at the bottom of the sign box (with some that were never gear
// teeth at all). Drag one back into a gap and it's tamed; a tamed tooth tells its huddle it was an
// accident, and the huddle follows it in (chain reactions). Catching up = grip (teeth in the rim) × speed
// (drive teeth ÷ gear teeth: a smaller gear turns faster). So you recut the gear smaller: the cutter
// knocks every tooth out, four go onto the drive, the rest scatter back into the dark, sure they were
// spat out again. Every toothed gear has a little slack: this one's comes to a minute.

export const SIZES = [60, 48, 36, 24, 12];
export const START_LATE = 59 * 60;     // seconds behind
export const SLACK = 60;               // nothing with teeth gets closer than this
export const DRIVE0 = 6;
export const DRIVE_TAKE = 4;           // teeth the drive keeps from each recut
export const BASE = 0.088;              // seconds caught up per second at full grip and speed 1
export const CHAIN_BURST = 0.9;          // each chained tooth catches up this many seconds of running
export const OFFLINE_CAP = 2 * 3600, OFFLINE_RATE = 0.2;
// The dark at the bottom of the sign box, in stage coordinates (the stage is 800 × 600).
export const DARK = { x0: 34, x1: 766, y0: 500, y1: 580 };
export const RECUT_COST = [75, 85, 92, 99];
export const GLASS_CAP = 120;           // a glass only holds so many; the rest hop back out into the dark

export const size = S => SIZES[S.cut];
export const driveMax = S => 14 + 26 * S.cut;
export const rimCount = S => S.rim.reduce((a, b) => a + b, 0);
export const grip = S => rimCount(S) / size(S);
export const speed = S => S.drive / size(S);
export const rate = S => BASE * grip(S) * speed(S);
export const reach = S => 54 + 16 * (S.lv.chatter || 0);
// Word gets round the dark that it was an accident: the more teeth come home, the more come out.
export const word = S => 1 + Math.sqrt(S.tamed) / 60;
export const spawnRate = S => (0.32 + 0.06 * (S.lv.light || 0)) * word(S);
export const darkCap = S => 10 + 3 * (S.lv.light || 0);
export const mothRate = S => (S.lv.moths || 0) / 12;
// Teeth shake loose more the faster the gear turns; the retainer holds them.
export const wearRate = S => rimCount(S) * 0.0011 * (0.6 + speed(S)) / (1 + 1.6 * (S.lv.retainer || 0));
// A chain of n followers catches up a burst of running time, more than n times as much for a big huddle.
export const chainBurst = (S, n) => n * (1 + n / 5) * CHAIN_BURST * Math.max(rate(S), 0.03);
export const finalReady = S => S.cut === SIZES.length - 1 && S.late <= SLACK + 1e-6;

export const fmtLate = s => {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const KINDS = ['gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'molar', 'comb', 'zip'];
function spawnOne(S, rnd, at) {
  const x = at ? at.x : DARK.x0 + rnd() * (DARK.x1 - DARK.x0);
  const y = at ? at.y : DARK.y0 + rnd() * (DARK.y1 - DARK.y0);
  // Mostly gear teeth; one in ten or so isn't, and nobody asks whose.
  S.dark.push({ x, y, k: at && at.k ? at.k : KINDS[Math.floor(rnd() * KINDS.length)], id: S.nid++ });
}

export function defaults() {
  const rim = new Array(SIZES[0]).fill(0);
  // Forty-four of sixty left, the gaps scattered round the rim.
  const gaps = [1, 4, 5, 9, 13, 18, 22, 23, 27, 31, 36, 40, 44, 49, 53, 57];
  for (let i = 0; i < rim.length; i++) rim[i] = gaps.includes(i) ? 0 : 1;
  const S = {
    t: 0, late: START_LATE, cut: 0, rim, drive: DRIVE0, glass: 0, dark: [], nid: 0,
    lv: {}, one: {}, seen: [], tamed: 0, best: 0, chains: 0, moth: 0, spawnAcc: 0,
    nextHuddle: 3, ended: false, slack: false, talk: 0, savedAt: 0, boughtOpen: false, hand: 0,
  };
  let seed = 3;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  // A huddle on the left and a few strays, so the first drag sets off a chain.
  for (let i = 0; i < 5; i++) spawnOne(S, rnd, { x: 150 + rnd() * 70, y: 520 + rnd() * 50, k: 'gear' });
  for (let i = 0; i < 6; i++) spawnOne(S, rnd);
  return S;
}

export function load(raw) {
  const S = defaults();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(raw)) S[k] = raw[k];
    S.lv = Object.assign({}, raw.lv || {});
    S.one = Object.assign({}, raw.one || {});
    if (!Array.isArray(S.seen)) S.seen = [];
    S.cut = Math.max(0, Math.min(SIZES.length - 1, S.cut | 0));
    if (!Array.isArray(S.rim) || S.rim.length !== size(S)) {
      const n = Array.isArray(S.rim) ? S.rim.reduce((a, b) => a + (b ? 1 : 0), 0) : size(S);
      S.rim = new Array(size(S)).fill(0).map((_, i) => (i < n ? 1 : 0));
    }
    if (!Array.isArray(S.dark)) S.dark = [];
    S.dark = S.dark.filter(d => d && isFinite(d.x) && isFinite(d.y));
    if (!S.nid) S.nid = S.dark.length + 1;
    // The finished world: a save of just { ended: true } opens on the ending with everything built.
    if (S.ended && !raw.cut) finishWorld(S);
  }
  return S;
}
export function finishWorld(S) {
  S.cut = SIZES.length - 1; S.rim = new Array(size(S)).fill(1); S.drive = driveMax(S);
  S.late = SLACK; S.dark = [];
  for (const it of ITEMS) if (it.kind === 'odd') S.one[it.id] = true;
  S.lv = Object.assign({ light: 8, chatter: 4, moths: 10, retainer: 2 }, S.lv);
}

// Seconds of lateness caught up; never past the slack.
function catchUp(S, s) {
  const before = S.late;
  S.late = Math.max(SLACK, S.late - s);
  return before - S.late;
}

// One step of the night. Returns what happened, for the page to draw and play.
export function tick(S, dt, rnd = Math.random) {
  const ev = { fell: [], moth: [], spawned: 0, caught: 0 };
  if (S.ended) return ev;
  S.t += dt;
  ev.caught = catchUp(S, rate(S) * dt);
  // Teeth come out of the dark.
  // They come out in huddles, two to five at a time, close together.
  S.spawnAcc += dt * spawnRate(S);
  if (S.spawnAcc >= (S.nextHuddle || 3)) {
    const k = S.nextHuddle || 3;
    S.spawnAcc -= k;
    S.nextHuddle = 2 + Math.floor(rnd() * 4);
    const cx = DARK.x0 + 30 + rnd() * (DARK.x1 - DARK.x0 - 60), cy = DARK.y0 + 15 + rnd() * (DARK.y1 - DARK.y0 - 30);
    for (let i = 0; i < k && S.dark.length < darkCap(S); i++) {
      spawnOne(S, rnd, { x: cx + (rnd() - 0.5) * 50, y: cy + (rnd() - 0.5) * 26 }); ev.spawned++;
    }
  }
  // Teeth shake loose and drop back into the dark.
  const w = wearRate(S) * dt;
  if (rnd() < w) {
    const full = []; S.rim.forEach((v, i) => v && full.push(i));
    if (full.length > 1) {
      const i = full[Math.floor(rnd() * full.length)];
      S.rim[i] = 0; ev.fell.push({ i, id: S.nid });
      spawnOne(S, rnd, { x: 330 + rnd() * 140, y: DARK.y0 + 6 + rnd() * 20 });
    }
  }
  // Moths carry teeth in, one each, no chain: the teeth trust you, not the moths.
  S.moth += dt * mothRate(S);
  while (S.moth >= 1) {
    S.moth -= 1;
    if (!S.dark.length) { S.moth = Math.min(S.moth, 0.5); break; }
    const d = S.dark.splice(Math.floor(rnd() * S.dark.length), 1)[0];
    ev.moth.push({ from: d, to: seat(S, null, rnd) });
    S.tamed++;
  }
  // Huddling: each feral tooth creeps toward its nearest neighbour, and jitters.
  const step = Math.min(dt, 0.25);
  for (const d of S.dark) {
    let best = null, bd = 1e9;
    for (const o of S.dark) { if (o === d) continue; const dd = (o.x - d.x) ** 2 + (o.y - d.y) ** 2; if (dd < bd) { bd = dd; best = o; } }
    if (best && bd > 22 * 22 && bd < 190 * 190) { const l = Math.sqrt(bd); d.x += (best.x - d.x) / l * 7 * step; d.y += (best.y - d.y) / l * 7 * step; }
    d.x += (rnd() - 0.5) * 16 * step; d.y += (rnd() - 0.5) * 10 * step;
    d.x = Math.max(DARK.x0, Math.min(DARK.x1, d.x)); d.y = Math.max(DARK.y0, Math.min(DARK.y1, d.y));
  }
  return ev;
}

// Put a tamed tooth somewhere: the gap nearest the socket asked for, any gap, or the glass (-1).
export function seat(S, want, rnd = Math.random) {
  const n = size(S);
  const gaps = []; S.rim.forEach((v, i) => !v && gaps.push(i));
  if (!gaps.length) {
    if (S.glass >= GLASS_CAP) { spawnOne(S, rnd, { x: 700 + rnd() * 50, y: DARK.y0 + rnd() * 30 }); return -2; }
    S.glass++; return -1;
  }
  let i;
  if (want == null) i = gaps[Math.floor(rnd() * gaps.length)];
  else {
    const dist = g => { const d = Math.abs(g - want) % n; return Math.min(d, n - d); };
    i = gaps.reduce((a, b) => (dist(b) < dist(a) ? b : a));
  }
  S.rim[i] = 1;
  return i;
}

// Who follows a tooth tamed from `origin`: every feral tooth within reach, and every one within reach
// of those, breadth first. Returns indices into S.dark in order, with their link depth.
export function huddle(S, origin, skip = -1) {
  const R2 = reach(S) ** 2, out = [], used = new Set([skip]);
  let frontier = [origin], depth = 0;
  while (frontier.length) {
    depth++;
    const next = [];
    for (const p of frontier) {
      S.dark.forEach((d, i) => {
        if (used.has(i)) return;
        if ((d.x - p.x) ** 2 + (d.y - p.y) ** 2 <= R2) { used.add(i); out.push({ i, depth }); next.push(d); }
      });
    }
    frontier = next;
  }
  return out;
}

// You drag dark tooth `idx` to socket `want` (or anywhere on the gear). It and its huddle are tamed.
// Returns [{ from, to, depth }] for the page to animate: to is a socket, or -1 for the glass.
export function tame(S, idx, want = null, rnd = Math.random) {
  const d = S.dark[idx];
  if (!d || S.ended) return [];
  const chain = huddle(S, d, idx);
  const moves = [{ from: d, to: seat(S, want, rnd), depth: 0 }];
  for (const c of chain) moves.push({ from: S.dark[c.i], to: seat(S, null, rnd), depth: c.depth });
  const gone = new Set([idx, ...chain.map(c => c.i)]);
  S.dark = S.dark.filter((_, i) => !gone.has(i));
  S.tamed += moves.length; S.hand++;
  if (chain.length) { S.chains++; S.best = Math.max(S.best, moves.length); }
  moves.burst = catchUp(S, chainBurst(S, chain.length));
  return moves;
}

// ---------- Upgrades ----------
// kind: drive (a tooth for the drive wheel, bought many times), gear (fitted to the gear: the recut takes
// it), box (fitted in the sign box: stays), odd (a silly one-off that only gets drawn).
export const ITEMS = [
  { id: 'drive', kind: 'drive', name: 'A Tooth for the Drive', short: 'Drive tooth',
    desc: 'Give the drive wheel one of your tamed teeth. A bigger driver turns the gear faster.',
    joke: 'The drive wheel takes the tooth without a word. Drive wheels never say thank you. They just go.' },
  { id: 'light', kind: 'box', name: 'Night-Light', max: 12, costs: [6, 9, 13, 17, 22, 28, 34, 41, 49, 58, 68, 79],
    desc: 'A little bulb at the bottom of the sign box. More teeth creep out of the dark to look at it.',
    joke: 'They come out to the light the way moths do. They are not moths. They chatter at it.' },
  { id: 'retainer', kind: 'gear', max: 3, costs: [8, 16, 26], name: 'Retainer',
    desc: 'A wire band round the rim. Fewer teeth shake loose when the gear spins. Fitted to this gear: a recut takes it with the outer ring.',
    joke: 'Every dentist says wear your retainer. Every gear says it’s not a dentist. Wear it anyway.' },
  { id: 'chatter', kind: 'box', name: 'Wind-Up Chatterbox', max: 5, costs: [12, 22, 35, 50, 68],
    desc: 'A pair of wind-up chattering teeth on the ledge. When a tooth comes home it chatters along, and the news carries further through the dark.',
    joke: 'It chatters all night whether anyone’s listening or not. Nobody wound it. It’s fine. It’s fine.' },
  { id: 'moths', kind: 'box', name: 'Moths', max: 14, costs: [15, 19, 24, 29, 35, 41, 48, 55, 62, 70, 78, 86, 94, 99],
    desc: 'Moths, drawn to the neon. Each one carries a tooth up out of the dark every few seconds, on its own (no chain: the teeth trust you, not the moths).',
    joke: 'They don’t know why they’re doing it either. Something about the light.' },
  { id: 'brush', kind: 'odd', name: 'A Toothbrush', cost: 7, need: S => S.tamed >= 20,
    desc: 'A toothbrush, standing in the glass with the spare teeth. Does nothing.',
    joke: 'Twice a day, says every dentist. Twice a day, says every stopped clock. The gear brushes once and gets on with it.' },
  { id: 'mat', kind: 'odd', name: 'A Welcome Mat', cost: 15, need: S => S.tamed >= 60,
    desc: 'A doormat for the dark, reading WELCOME BACK. Does nothing.',
    joke: 'It was never on purpose. Teeth fall out. That’s what teeth do. The mat says so, in capitals.' },
  { id: 'stripe', kind: 'odd', name: 'A Racing Stripe for Seconds', cost: 26, need: S => S.cut >= 1,
    desc: 'Seconds asked for one. Does nothing.',
    joke: '“It makes me faster,” says Seconds. It does not. Seconds goes round exactly once a minute, same as ever, now with a stripe.' },
  { id: 'fairy', kind: 'odd', name: 'A Tooth Fairy', cost: 38, need: S => S.cut >= 2 && (S.lv.moths || 0) >= 3,
    desc: 'One of the moths, in a tutu. Does nothing.',
    joke: 'She flutters down to the glass every so often and leaves a dime. Nobody knows where she gets the dimes. Nobody asks where the teeth go.' },
  { id: 'checkout', kind: 'odd', name: 'LATE CHECKOUT', cost: 56, need: S => S.cut >= 3,
    desc: 'A new neon tube for under the clock: LATE CHECKOUT. Does nothing.',
    joke: 'The Sundown has had late checkout for thirty years, by the sign. Nobody at the desk remembers deciding it. Nobody wants it changed.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(it => [it.id, it]));

export const lv = (S, id) => S.lv[id] || 0;
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'drive') { const n = S.drive - DRIVE0 - DRIVE_TAKE * S.cut; return Math.min(90, Math.round(2 + n * 0.7 + 4 * S.cut)); }
  if (it.kind === 'odd') return it.cost;
  return it.costs[Math.min(lv(S, id), it.costs.length - 1)];
}
export function maxed(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'drive') return S.drive >= driveMax(S);
  if (it.kind === 'odd') return !!S.one[id];
  return lv(S, id) >= it.max;
}
export const canBuy = (S, id) => !S.ended && !S.slack && !maxed(S, id) && S.glass >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id];
  S.glass -= cost(S, id);
  if (it.kind === 'drive') S.drive++;
  else if (it.kind === 'odd') S.one[id] = true;
  else S.lv[id] = lv(S, id) + 1;
  return true;
}
// When an upgrade first shows up. Once shown it stays until bought (CLAUDE.md).
const SHOW = {
  drive: S => S.glass >= 1 || S.drive > DRIVE0,
  light: S => S.tamed >= 14,
  retainer: S => S.tamed >= 40 || S.cut > 0,
  chatter: S => S.chains >= 3 || S.tamed >= 50,
  moths: S => S.cut > 0 && S.tamed >= 420,
};
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) {
    if (S.seen.includes(it.id)) continue;
    const ok = it.kind === 'odd' ? it.need(S) : SHOW[it.id](S);
    if (ok) { S.seen.push(it.id); fresh.push(it.id); }
  }
  return fresh;
}
// The shop: revealed and not yet bought out. Gear upgrades come back after a recut.
export const items = S => ITEMS.filter(it => S.seen.includes(it.id) && !maxed(S, it.id));
export const bought = S => ITEMS.filter(it => it.kind === 'odd' && S.one[it.id]);

// ---------- The recut ----------
export const nextSize = S => SIZES[S.cut + 1];
export const recutCost = S => RECUT_COST[S.cut];
export const canRecut = S => !S.ended && S.cut < SIZES.length - 1 && S.glass >= recutCost(S);
export const recutOpen = S => S.cut < SIZES.length - 1 && (S.cut > 0 || S.drive >= 10 || S.glass >= 20);
// Speed now → after (with the same drive, a full rim).
export const speedAfterRecut = S => (S.drive + DRIVE_TAKE) / nextSize(S);
export function recut(S, rnd = Math.random) {
  if (!canRecut(S)) return null;
  S.glass -= recutCost(S);
  const knocked = rimCount(S);
  S.cut++;
  S.drive += DRIVE_TAKE;
  S.rim = new Array(size(S)).fill(0);
  S.lv.retainer = 0;
  // Everything the drive didn't take scatters into the dark (past the cap, for once).
  const scatter = Math.max(0, knocked - DRIVE_TAKE), firstId = S.nid;
  for (let i = 0; i < scatter; i++) spawnOne(S, rnd, { x: 120 + rnd() * 560, y: DARK.y0 + rnd() * (DARK.y1 - DARK.y0) });
  return { knocked, scatter, firstId };
}

// ---------- Away ----------
// Moths keep working while the tab’s closed, at a fifth of the rate, for up to two hours.
export function away(S, sec) {
  if (S.ended || S.slack || sec < 60) return null;
  const t = Math.min(sec, OFFLINE_CAP) * OFFLINE_RATE;
  const before = { late: S.late, glass: S.glass, rim: rimCount(S) };
  const supply = spawnRate(S) + wearRate(S);
  const carried = Math.floor(Math.min(mothRate(S), supply) * t);
  let n = carried;
  for (let i = 0; i < S.rim.length && n > 0; i++) if (!S.rim[i]) { S.rim[i] = 1; n--; }
  S.glass = Math.min(Math.max(S.glass, GLASS_CAP), S.glass + Math.max(0, n - Math.floor(wearRate(S) * t)));
  S.tamed += carried;
  // At most five minutes caught up while away, and never the last few: the finish happens with you there.
  if (S.late > SLACK + 180) S.late = Math.max(SLACK + 180, S.late - Math.min(300, rate(S) * t));
  // The dark fills to its cap while nobody's looking.
  let seed = Math.floor(sec) || 1;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  while (S.dark.length < darkCap(S)) spawnOne(S, rnd);
  return { sec, carried, caught: before.late - S.late, glass: S.glass - before.glass };
}

export const phaseKey = S => (S.ended ? 'end' : S.slack ? 'slack' : `c${S.cut}`);
