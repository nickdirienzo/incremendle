// Al Dente Encounters: the rules. index.html draws them; sim.mjs plays them headless.
//
// Wibble, a jittery flying saucer, hosts a cooking show from a borrowed Earth kitchen. The shrink ray is stuck on
// GROW at the pot, so noodles boil over in waves and slither along the counter toward the sink. Steer the saucer:
// its beam shrinks whatever is under it to bite size. Noodles left out go soggy and swell (decay). Sous-saucers zap
// on their own (auto-battle). Each day is one episode; wrapping it resets the counter for Fan Mail (the reset loop).
// On Sunday the Big One comes out and the inspector arrives on the dot.

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const QUOTA = [8, 15, 22, 30, 38, 45, 52];       // the wave a day's running order asks for
export const BIG_WAVE = QUOTA[6];                         // Sunday: the Big One comes out instead of this wave

// The kitchen, in canvas units (the counter the noodles cross).
export const FIELD = { x0: 112, x1: 664, y0: 288, y1: 448, w: 760, h: 470 };

const DEF = () => ({
  day: 0, wave: 1, best: 1, bites: 0, fan: 0, fanTotal: 0,
  lv: {}, perm: {}, odd: {}, seen: [], newSeen: [],
  time: 0, started: false, ended: false, big: 0, shrunk: 0, noodles: 0, splashes: 0, wraps: 0, bestEver: 1,
  bps: 0, savedAt: 0, lastLog: null, tab: 'bites', boughtOpen: false, hint: 0,
});
export function load(raw) {
  const S = Object.assign(DEF(), raw || {});
  for (const k of ['lv', 'perm', 'odd']) S[k] = Object.assign({}, S[k]);
  if (!Array.isArray(S.seen)) S.seen = [];
  return S;
}

// ---------- Items ----------
// kind: 'lv' (levels, reset each episode), 'odd' (silly, stays all week), 'fan' (Fan Mail, permanent).
export const ITEMS = [
  { id: 'ray', kind: 'lv', cur: 'bites', name: 'Ray Power', max: 200, base: 8, mult: 1.55, at: s => s.noodles > 0 || s.day > 0,
    desc: 'Turns the shrink ray up a notch. Every noodle under the beam shrinks faster.',
    joke: 'Turn it up to "simmer". The dial is a bit of tape now, but it turns.' },
  { id: 'drone', kind: 'lv', cur: 'bites', name: 'Sous-saucer', max: 6, base: 30, mult: 7, at: s => s.best >= 3 || s.lv.ray >= 3 || s.day > 0,
    desc: 'A little saucer that hovers over the counter and zaps passing noodles on its own.',
    joke: 'Hired from the planet\'s top culinary school. It has no hands and a diploma.' },
  { id: 'lens', kind: 'lv', cur: 'bites', name: 'Drone Lenses', max: 200, base: 40, mult: 1.6, at: s => (s.lv.drone || 0) >= 1,
    desc: 'Polishes every sous-saucer\'s lens. Their beams shrink faster.',
    joke: 'Polished with a tea towel. The tea towel is now very small.' },
  { id: 'beam', kind: 'lv', cur: 'bites', name: 'Wider Beam', max: 5, base: 90, mult: 4.2, at: s => s.best >= 5 || s.day > 0,
    desc: 'Widens the beam, so it catches more noodles at once.',
    joke: 'The secret to a good beam is the same as a good sauce: coverage.' },
  { id: 'chop', kind: 'lv', cur: 'bites', name: 'Chop Finer', max: 200, base: 60, mult: 2.3, at: s => s.best >= 6 || s.day > 0,
    desc: 'Every shrunk noodle is chopped into more bites before it goes in the bowl.',
    joke: 'One regulation bite feeds a stagehand for a week. Two feeds the stagehand\'s cousin.' },
  { id: 'rinse', kind: 'lv', cur: 'bites', name: 'Cold Rinse', max: 3, base: 150, mult: 9, at: s => s.best >= 8 || s.day > 0,
    levels: ['Cold Rinse', 'Colander', 'Ice Bath'],
    desc: 'Noodles left on the counter go soggy and swell. Keeping them cold slows it down.',
    jokes: ['A cold tap over the counter. Chefs call it "shocking" the pasta. The pasta calls it worse.',
      'A colander on the counter drains them as they pass. Fewer puddles, firmer noodles.',
      'A bucket of ice by the pot. Noodles come out stiff, startled and al dente.'] },
  { id: 'nerve', kind: 'lv', cur: 'bites', name: 'Steady Nerves', max: 3, base: 120, mult: 12, at: s => s.best >= 7 || s.day > 0,
    levels: ['Chamomile', 'Deep Breaths', 'A Saucer to Sit On'],
    desc: 'Calms Wibble down: the saucer steers faster and the beam jitters less.',
    jokes: ['A thimble of chamomile on the dashboard. Wibble only shakes a little now.',
      'In for four, hold for four, out for four. Wibble does not have lungs but is trying anyway.',
      'A china saucer to rest on between takes. A saucer on a saucer. Wibble finds it very grounding.'] },
  { id: 'auto', kind: 'lv', cur: 'bites', name: 'Autopilot', max: 1, base: 400, mult: 1, at: s => s.best >= 9 || s.day > 0,
    desc: 'When you let go for a moment, the saucer flies itself to the fattest noodle.',
    joke: 'The autopilot was trained on four hundred cooking shows. It keeps saying "and here\'s one I made earlier".' },
  // Silly one-offs. They stay all week: set dressing isn't mopped up.
  { id: 'hat', kind: 'odd', cur: 'bites', name: 'Chef\'s Hat', base: 25, at: s => s.best >= 4 || s.day > 0,
    desc: 'A proper toque, for the dome. Does nothing. Looks the part.',
    joke: 'A tiny toque on Wibble\'s dome. It jitters along with the saucer, slightly out of time.' },
  { id: 'sign', kind: 'odd', cur: 'bites', name: 'APPLAUSE Sign', base: 200, at: s => s.best >= 8 || s.day > 0,
    desc: 'A studio sign that lights up to cue the audience back home. Does nothing for the noodles.',
    joke: 'It\'s wired to the wrong switch. It lights up whenever a noodle lands in the sink.' },
  { id: 'water', kind: 'odd', cur: 'bites', name: 'Change the Turkey\'s Water', base: 900, at: s => s.best >= 12 || s.day > 0,
    desc: 'The family left their turkey thawing in the sink. The packet says change the cold water every 30 minutes.',
    joke: 'Fresh cold water for the turkey, and a sticky note with the time on it. Wibble takes the packet very seriously.' },
  { id: 'ruler', kind: 'odd', cur: 'bites', name: 'A Ruler', base: 5000, at: s => s.day >= 1 && s.best >= 8,
    desc: 'A 30 cm ruler for the counter, to check every noodle is back to peppercorn-plate size.',
    joke: 'A wooden ruler, propped against the backsplash. Wibble has never seen a noodle shorter than it. Wibble has also never seen one as long as the ones in this kitchen.' },
  { id: 'frame', kind: 'odd', cur: 'bites', name: 'Frame the Letter', base: 40000, at: s => s.day >= 2 && s.best >= 10,
    desc: 'Puts the inspector\'s letter in a frame on the wall, for motivation.',
    joke: 'Framed, the crest at the top is easier to see. It\'s a little trophy. Odd, for a health inspector.' },
  // Fan Mail: permanent, bought between (or during) episodes.
  { id: 'club', kind: 'fan', cur: 'fan', name: 'Fan Club', max: 30, base: 1, mult: 2, at: s => s.fanTotal > 0,
    desc: 'Fans back home are watching. Every ray, the saucer\'s and the drones\', shrinks harder, for the rest of the week.',
    joke: 'They have badges. The badges are the size of a full stop.' },
  { id: 'tips', kind: 'fan', cur: 'fan', name: 'Tip Jar', max: 20, base: 2, mult: 1.8, at: s => s.fanTotal > 0,
    desc: 'Viewers send tips. Every noodle is worth more bites, for the rest of the week.',
    joke: 'A thimble by the stove. Fans post crumbs of cracker. It adds up.' },
  { id: 'order', kind: 'fan', cur: 'fan', name: 'Running Order', max: 3, base: 3, mult: 4, at: s => s.fanTotal > 0,
    levels: ['Running Order', 'Skip the Intro', 'Cold Open'],
    desc: 'Each new episode starts further in, past the easy early waves.',
    jokes: ['A clipboard with the day\'s plan. Episodes start a few boil-overs in.',
      'Nobody needs to watch Wibble wash its hands again. (It has no hands.)',
      'The episode opens mid-boil, already chaotic. Viewers love it.'] },
  { id: 'crew', kind: 'fan', cur: 'fan', name: 'Standing Crew', max: 3, base: 4, mult: 4, at: s => s.fanTotal >= 3,
    desc: 'Sous-saucers that stay on between episodes: every episode starts with this many already hovering.',
    joke: 'They\'ve signed for the week. Their contract says "hover".' },
  { id: 'night', kind: 'fan', cur: 'fan', name: 'Night Shift', max: 3, base: 3, mult: 3, at: s => s.fanTotal >= 3,
    desc: 'While you\'re away, the crew keeps zapping at a better rate.',
    joke: 'A thermos and a night light for the drones. They hum the theme to keep awake.' },
  { id: 'crayon', kind: 'odd', cur: 'fan', name: 'Fan Drawing', base: 2, at: s => s.fanTotal > 0,
    desc: 'A drawing from a young viewer, for the fridge. Does nothing. Means a lot.',
    joke: 'It\'s Wibble next to a noodle that goes right off the edge of the page. "THE BIG ONES ARE THE BEST", it says.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const lv = (S, id) => (BY_ID[id].kind === 'fan' ? S.perm[id] : BY_ID[id].kind === 'odd' ? (S.odd[id] ? 1 : 0) : S.lv[id]) || 0;
export const max = it => it.kind === 'odd' ? 1 : it.max;
export function cost(S, id) {
  const it = BY_ID[id], n = lv(S, id);
  if (it.kind === 'odd') return it.base;
  let c = it.base * Math.pow(it.mult, n);
  if (id === 'drone') c = it.base * Math.pow(it.mult, Math.max(0, n - standingCrew(S)));
  return Math.ceil(c);
}
export const wallet = (S, cur) => cur === 'fan' ? S.fan : S.bites;
export const done = (S, id) => lv(S, id) >= max(BY_ID[id]);
export const canBuy = (S, id) => !S.ended && !done(S, id) && wallet(S, BY_ID[id].cur) >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id], c = cost(S, id);
  if (it.cur === 'fan') S.fan -= c; else S.bites -= c;
  if (it.kind === 'odd') S.odd[id] = 1;
  else if (it.kind === 'fan') S.perm[id] = (S.perm[id] || 0) + 1;
  else S.lv[id] = (S.lv[id] || 0) + 1;
  if (id === 'crew') S.lv.drone = Math.max(S.lv.drone || 0, standingCrew(S));
  return true;
}
// Revealing: once seen, an item stays listed until it's bought out (CLAUDE.md).
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) if (!S.seen.includes(it.id) && it.at(S)) { S.seen.push(it.id); fresh.push(it.id); }
  return fresh;
}
export const visible = S => ITEMS.filter(it => S.seen.includes(it.id) && !done(S, it.id));
export const bought = S => ITEMS.filter(it => done(S, it.id) && S.seen.includes(it.id));

// ---------- The numbers ----------
const P = (S, id) => lv(S, id);
export const fanMult = S => Math.pow(1.5, P(S, 'club'));
export const rayDps = S => 6 * Math.pow(1.25, P(S, 'ray')) * fanMult(S);            // cm a second, per noodle under the beam
export const radius = S => 36 + 10 * P(S, 'beam');
export const standingCrew = S => P(S, 'crew');
export const drones = S => Math.max(P(S, 'drone'), standingCrew(S));
export const droneDps = S => 2.5 * Math.pow(1.25, P(S, 'lens')) * fanMult(S);
export const DRONE_RANGE = 96;
export const swell = S => 0.022 * [1, 0.7, 0.45, 0.25][P(S, 'rinse')];               // fraction of its length a second
export const SWELL_CAP = 3;
export const speed = S => [190, 260, 330, 420][P(S, 'nerve')];
export const jitter = S => [16, 10, 6, 2.5][P(S, 'nerve')];
export const biteMult = S => Math.pow(1.22, P(S, 'chop')) * Math.pow(1.3, P(S, 'tips'));
export const offlineRate = S => [0.1, 0.15, 0.2, 0.25][P(S, 'night')];
export const OFFLINE_CAP = 6 * 3600;

export function waveSpec(w) {
  return {
    n: Math.min(14, 3 + Math.floor(w / 3)),
    L: 20 * Math.pow(1.2, w - 1),                     // cm, fresh out of the pot
    v: 24 + Math.min(16, w * 0.4),                    // px a second along the counter
    gap: Math.max(0.9, 1.8 - w * 0.02),               // seconds between noodles
    bites: 2 + 1.2 * Math.pow(1.13, w - 1),             // bites a noodle pays, before Chop Finer and tips
  };
}
export const quota = S => QUOTA[S.day];
export const canWrap = S => !S.ended && S.day < 6 && S.best >= quota(S);
// Fan Mail for wrapping now: from the furthest wave this episode.
export const fanFor = S => Math.floor(Math.pow(Math.max(0, S.best - 4) / 3, 1.45));
export function startWave(S) {
  const f = [0, 0.25, 0.35, 0.45][P(S, 'order')];
  return Math.max(1, Math.floor(S.bestPrev * f || 0));
}
// Starting past the early waves comes with the bites those waves would have paid.
export function headStart(S, w) {
  let b = 0;
  for (let i = 1; i < w; i++) { const sp = waveSpec(i); b += sp.n * sp.bites; }
  return b * biteMult(S);
}
export function wrap(S) {
  if (!canWrap(S)) return 0;
  const f = fanFor(S);
  S.fan += f; S.fanTotal += f; S.wraps += 1;
  S.bestPrev = S.best;
  S.day += 1;
  S.bites = 0; S.lv = {};
  if (standingCrew(S)) S.lv.drone = standingCrew(S);
  S.wave = startWave(S); S.best = S.wave;
  S.bites = headStart(S, S.wave);
  return f;
}

// ---------- The battle ----------
// Live noodles aren't saved: a reload starts the current wave over.
export function battle() { return { noodles: [], spawned: 0, spawnT: 0.6, pause: 0, escaped: 0, next: 1, bigOne: null, droneT: [] }; }
export function dronePos(i, t = 0) {
  const xs = [250, 520, 385, 180, 600, 315, 455];
  return [xs[i] + Math.sin(t * 0.9 + i * 2) * 14, 236 + (i % 2) * 14 + Math.sin(t * 1.7 + i) * 4];
}
// spot: where the beam lands on the counter, [x, y], already jittered. Returns what happened.
export function step(S, B, dt, spot, t = 0) {
  const ev = { pops: [], escapes: 0, cleared: null, failed: null, zaps: [] };
  if (S.ended) return ev;
  const spec = waveSpec(S.wave);
  const big = S.day === 6 && S.wave >= BIG_WAVE;
  if (B.pause > 0) { B.pause -= dt; return ev; }
  // Spawning: a boil-over pushes the wave's noodles out of the pot one at a time.
  if (big) {
    if (!B.bigOne) B.bigOne = { id: B.next++, x: FIELD.x0, y: (FIELD.y0 + FIELD.y1) / 2, L: spec.L * 8, L0: spec.L * 8, age: 0, ph: 0, big: true };
    if (!B.noodles.length) B.noodles.push(B.bigOne);
  } else if (B.spawned < spec.n) {
    B.spawnT -= dt;
    if (B.spawnT <= 0) {
      B.spawnT = spec.gap;
      B.spawned++;
      B.noodles.push({ id: B.next++, x: FIELD.x0, y: FIELD.y0 + 12 + Math.random() * (FIELD.y1 - FIELD.y0 - 24), L: spec.L, L0: spec.L, age: 0, ph: Math.random() * 6, vy: (Math.random() - 0.5) * 16 });
    }
  }
  const sw = swell(S), R = radius(S), dps = rayDps(S), nd = drones(S), ddps = droneDps(S);
  const minL = n => n.L0 * 0.04;
  for (const n of B.noodles) {
    n.age += dt;
    if (n.big) { n.x = Math.min(FIELD.x0 + 200, n.x + 6 * dt); }
    else {
      n.x += spec.v * dt;
      n.y += (n.vy + Math.sin(n.age * 1.3 + n.ph) * 10) * dt;
      if (n.y < FIELD.y0 + 10) { n.y = FIELD.y0 + 10; n.vy = Math.abs(n.vy); }
      if (n.y > FIELD.y1 - 10) { n.y = FIELD.y1 - 10; n.vy = -Math.abs(n.vy); }
    }
    // Soggy: a noodle out of the pot keeps drinking and swells, up to three times its length.
    n.L = Math.min(n.L0 * SWELL_CAP, n.L * (1 + sw * dt));
    // The beam.
    if (spot && Math.hypot((n.x - spot[0]) * 0.8, n.y - spot[1]) < R + 12) { n.L -= dps * dt; n.hit = 0.15; }
    n.hit = Math.max(0, (n.hit || 0) - dt);
  }
  // Sous-saucers: each zaps the fattest noodle in its range.
  for (let i = 0; i < nd; i++) {
    const [dx] = dronePos(i, t);
    let best = null;
    for (const n of B.noodles) if (Math.abs(n.x - dx) < DRONE_RANGE && n.L > minL(n) && (!best || n.L > best.L)) best = n;
    if (best) { best.L -= ddps * dt; ev.zaps.push([i, best.id]); }
  }
  // Pops (shrunk to bite size) and escapes (into the sink).
  const keep = [];
  for (const n of B.noodles) {
    if (n.big) { keep.push(n); continue; }
    if (n.L <= minL(n)) {
      const b = spec.bites * biteMult(S);
      S.bites += b; S.shrunk += n.L0; S.noodles += 1;
      ev.pops.push({ x: n.x, y: n.y, b, L: n.L0 });
    } else if (n.x >= FIELD.x1) { B.escaped++; ev.escapes++; S.splashes++; }
    else keep.push(n);
  }
  B.noodles = keep;
  if (!big && B.spawned >= spec.n && !B.noodles.length) {
    if (B.escaped) { ev.failed = S.wave; }
    else { ev.cleared = S.wave; S.wave++; S.best = Math.max(S.best, S.wave); S.bestEver = Math.max(S.bestEver, S.wave); }
    B.spawned = 0; B.escaped = 0; B.spawnT = 0.8; B.pause = 1.4;
  }
  return ev;
}

// The saucer's own flight: toward a target at the saucer's speed.
export function fly(S, pos, target, dt) {
  const [x, y] = pos, dx = target[0] - x, dy = target[1] - y, d = Math.hypot(dx, dy), m = speed(S) * dt;
  if (d <= m) return [target[0], target[1]];
  return [x + dx / d * m, y + dy / d * m];
}
export const clampSpot = ([x, y]) => [Math.max(FIELD.x0 - 10, Math.min(FIELD.x1 + 10, x)), Math.max(FIELD.y0, Math.min(FIELD.y1, y))];
// The autopilot's (and the sim's) choice: the fattest noodle that hasn't reached the far end.
export function fattest(B) {
  let best = null;
  for (const n of B.noodles) if (!best || n.L - n.x * 0.001 > best.L) best = n;
  return best;
}

// ---------- Away ----------
export function away(S, secs) {
  if (!(secs > 60) || S.ended) return null;
  const s = Math.min(OFFLINE_CAP, secs);
  // The crew farms the current wave: a share of the recent rate, and never more than 30 waves' worth.
  const sp = waveSpec(S.wave);
  const b = Math.min(S.bps * s * offlineRate(S) * (drones(S) ? 1 : 0.3), 12 * sp.n * sp.bites * biteMult(S));
  S.bites += b;
  return { secs: s, bites: b };
}

export const short = n => {
  if (n < 1000) return String(Math.floor(n));
  const u = [['B', 1e9], ['M', 1e6], ['K', 1e3]].find(([, v]) => n >= v);
  const v = n / u[1];
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v)) + u[0];
};
