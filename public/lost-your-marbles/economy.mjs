// Lost Your Marbles: the rules. Pure logic, shared by the game (index.html) and the pacing sim (sim.mjs).
//
// Kids post every marble they find through the Lost Property hatch. Each one drops into the top-left square of a
// 5×4 cloakroom floor and rolls down unless a piece says otherwise:
//   Ruler  pushes it one square left or right
//   Comb   lets one kind fall through and pushes every other kind right
//   Desk   catches three of its kind and swaps them on air for one better marble, which rolls out to the right;
//          the Claim Form flies left to Mrs. Pettigrew's In Tray. While Gamp reads a swap out, the desk is busy
//          and marbles fall past it.
// Under the floor: the doormat (column 0, under the hatch), then the jars: clearies, cat's eyes, swirls, steelies.
// A marble in its own jar is read out on air (listeners); anything else ends up on the mat to sort by hand.
// Listeners are fame and money at once: every piece costs listeners (dead air). The record never drops.

export const COLS = 5, ROWS = 4;
export const TICK = 0.28;              // seconds for a marble to roll one square
export const GOAL = 360;               // the whole school
export const MAT_MAX = 10;
export const KINDS = [
  { id: 'clearie', name: 'clearie', many: 'clearies' },
  { id: 'catseye', name: "cat's eye", many: "cat's eyes" },
  { id: 'swirl', name: 'swirl', many: 'swirls' },
  { id: 'steelie', name: 'steelie', many: 'steelies' },
];
export const LIST = [0.3, 1.1, 3, 8];  // listeners for a marble read out into its own jar
export const SWAP = [1.2, 3.6, 10];       // listeners for an on-air swap at a desk of that kind
export const OPEN_AT = [0, 0, 60, 150]; // record needed before kids start finding each kind (and its jar opens)
export const TRAY_CAP = 5;              // unstamped forms before Mrs. Pettigrew suspends swaps
export const MAX = { ruler: 6, comb: 4, desk: 8 };

// ---------- the shop ----------
// kind: piece (goes on the floor), up (one-time real upgrade), odd (silly, for the picture)
export const ITEMS = [
  { id: 'ruler', kind: 'piece', name: 'Ruler', one: 'ruler', at: 1, base: 4, grow: 1.5,
    desc: 'A 30 cm ruler, laid flat on the floor. Pushes marbles one square left or right. Tap it to turn it round.',
    joke: 'Property of DANNY W. 4C. Danny has not been in for it since 2019.' },
  { id: 'sign', kind: 'odd', name: '"Lost Your Marbles?" Sign', at: 2, base: 3,
    desc: 'A sign over the hatch, in letters cut out of the school newsletter.',
    joke: 'Mrs. Pettigrew says it is rude. Gamp says it is a slogan.' },
  { id: 'comb', kind: 'piece', name: 'Comb Gate', one: 'comb gate', at: 6, base: 8, grow: 1.65,
    desc: 'A lost comb, standing on its spine. One kind of marble falls through its teeth; every other kind is pushed right. Tap it to choose the kind.',
    joke: 'Nobody has ever claimed a lost comb. Nobody ever will. It knows.' },
  { id: 'patch', kind: 'odd', name: 'Eyepatch', at: 10, base: 9,
    desc: 'An eyepatch from the dressing-up box, for Gamp.',
    joke: "It's a pirate station. There are standards." },
  { id: 'desk', kind: 'piece', name: 'Swap Desk', one: 'swap desk', at: 16, base: 14, grow: 1.42,
    desc: 'A pencil case on its side. Catches three marbles of its kind and swaps them on air for one better one, which rolls out to the right. The Claim Form flies left to the In Tray. Tap it to choose the kind.',
    joke: '"Three clearies for a cat\'s eye, live on Radio Rummage, and Jordan in 3B is a happy customer."' },
  { id: 'hatch1', kind: 'up', name: 'Letterbox Brush', at: 22, base: 20,
    desc: 'A brush flap on the hatch, so kids can post marbles without knocking.', joke: 'Knocking was the bottleneck. Kids are shy.' },
  { id: 'stamp1', kind: 'up', name: 'Rubber Stamp', at: 26, base: 24, needs: 'desk',
    desc: 'A proper rubber stamp for Mrs. Pettigrew, who was signing every form by hand.', joke: 'APPROVED, it says. She has never been so happy.' },
  { id: 'star', kind: 'odd', name: 'Gold Star', at: 32, base: 28, needs: 'desk',
    desc: 'Mrs. Pettigrew sticks a gold star on the In Tray.', joke: '"For tidy paperwork." Gamp has never been prouder of anything.' },
  { id: 'aerial1', kind: 'up', name: 'Coat Hanger Aerial', at: 40, base: 36,
    desc: 'A wire coat hanger from the lost coats, bent round Gamp\'s tip. Every listener mention reaches further.', joke: 'Radio Rummage can now be picked up in the staff room. Do not tell the staff room.' },
  { id: 'request', kind: 'up', name: 'Request Line', at: 58, base: 50,
    desc: 'A toy telephone for callers. Kids say what they are after, and post in fancier marbles to swap for it.', joke: '"Caller, you\'re on Radio Rummage." "Is this the umbrella?" "This is the umbrella."' },
  { id: 'patter1', kind: 'up', name: 'Quicker Patter', at: 70, base: 60, needs: 'desk',
    desc: 'Gamp learns to read out a swap in one breath. Desks are busy for less time.', joke: 'Practised on the wellies. The wellies are a tough crowd.' },
  { id: 'fanmail', kind: 'odd', name: 'Fan Mail Peg', at: 85, base: 70,
    desc: 'A clothes peg on the coat rail for Gamp\'s fan mail.', joke: 'Most of it is from the other lost things. The PE shorts have written four times. They want a slot.' },
  { id: 'hatch2', kind: 'up', name: 'Cat Flap', at: 95, base: 85, needs: 'hatch1',
    desc: 'The hatch gets a cat flap. Bigger handfuls, more often.', joke: 'There is no cat. There was briefly a cat.' },
  { id: 'recorder', kind: 'odd', name: 'Play the Recorder', at: 110, base: 90,
    desc: 'The Recorder becomes the station jingle. Gamp plays it (by leaning on it).', joke: 'It has been in Lost Property for nine years and has never once been played. It is overwhelmed. It plays along with the music from now on.' },
  { id: 'aerial2', kind: 'up', name: 'Tinfoil Tip', at: 150, base: 150, needs: 'aerial1',
    desc: 'Sandwich foil, crimped round the coat hanger.', joke: 'Radio Rummage can now be picked up by the dinner ladies\' fillings.' },
  { id: 'stamp2', kind: 'up', name: 'Self-Inking Stamp', at: 165, base: 140, needs: 'stamp1',
    desc: 'It inks itself. Mrs. Pettigrew stamps twice as fast.', joke: 'She has started stamping things that are not forms. Gamp is APPROVED.' },
  { id: 'patter2', kind: 'up', name: 'Station Jingle Patter', at: 190, base: 175, needs: 'patter1',
    desc: 'Gamp stops saying "um". Desks are busy for even less time.', joke: 'It now does the voices. All of them.' },
  { id: 'hatch3', kind: 'up', name: 'Double Doors', at: 215, base: 200, needs: 'hatch2',
    desc: 'The caretaker takes the hatch off. Marbles pour in.', joke: 'He says he did it to get at a pipe. He has the show on in his shed.' },
  { id: 'aerial3', kind: 'up', name: 'Kite on a String', at: 245, base: 235, needs: 'aerial2',
    desc: 'A lost kite, tied to Gamp\'s tip and flown out of the cupboard window.', joke: 'Radio Rummage can now be heard at the bus stop. A man at the bus stop has opinions about cat\'s eyes.' },
  { id: 'stamp3', kind: 'up', name: 'Stamp on a Stick', at: 270, base: 220, needs: 'stamp2',
    desc: 'A stamp taped to a metre ruler. Mrs. Pettigrew can reach the In Tray without getting up.', joke: 'She has not got up since. Her tea is brought to her. This is how it should always have been.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const PIECES = ITEMS.filter(i => i.kind === 'piece');

export function fresh() {
  return {
    v: 1, started: false, ended: false, time: 0,
    now: 0, record: 0, earned: 0, spent: 0,
    grid: Array(COLS * ROWS).fill(null),
    own: { ruler: 0, comb: 0, desk: 0 }, up: {},
    items: [], mat: [], jars: [0, 0, 0, 0], tray: 0, stamped: 0, swaps: [0, 0, 0],
    arrAcc: 0, tickAcc: 0, stampAcc: 0, nextId: 1, lost: 0, handSorted: 0,
    seen: [], told: [], talk: 0, lastLog: null, boughtOpen: false,
  };
}
export function load(raw) {
  const S = Object.assign(fresh(), raw && typeof raw === 'object' ? raw : {});
  const F = fresh();
  for (const k of ['own', 'up']) S[k] = Object.assign({}, F[k], S[k] || {});
  if (!Array.isArray(S.grid) || S.grid.length !== COLS * ROWS) S.grid = F.grid;
  for (const k of ['items', 'mat', 'seen', 'told']) if (!Array.isArray(S[k])) S[k] = [];
  if (!Array.isArray(S.jars) || S.jars.length !== 4) S.jars = F.jars;
  if (!Array.isArray(S.swaps) || S.swaps.length !== 3) S.swaps = F.swaps;
  S.items = S.items.filter(it => it && typeof it === 'object' && Number.isFinite(it.c));
  S.mat = S.mat.filter(k => Number.isInteger(k) && k >= 0 && k < 4).slice(0, MAT_MAX);
  if (S.ended) { S.record = Math.max(S.record, GOAL); }
  return S;
}

// ---------- numbers ----------
export const placed = (S, t) => S.grid.filter(g => g && g.t === t).length;
export const spare = (S, t) => S.own[t] - placed(S, t);
export const fameMult = S => S.up.aerial3 ? 2.4 : S.up.aerial2 ? 1.85 : S.up.aerial1 ? 1.4 : 1;
export const hatchMult = S => S.up.hatch3 ? 2 : S.up.hatch2 ? 1.65 : S.up.hatch1 ? 1.3 : 1;
export const arrivalRate = S => (0.6 + Math.min(S.now, GOAL) * 0.0022) * hatchMult(S);   // marbles a second
export const stampSecs = S => S.up.stamp3 ? 0.5 : S.up.stamp2 ? 1 : S.up.stamp1 ? 2 : 4;  // Mrs. Pettigrew, per form
export const busySecs = S => S.up.patter2 ? 0.8 : S.up.patter1 ? 1.5 : 2.6;              // a desk reading out a swap
export const kindOpen = (S, k) => S.record >= OPEN_AT[k];
export const suspended = S => S.tray >= TRAY_CAP;
export function mix(S) {
  const w = [72, 28, 0, 0];
  if (kindOpen(S, 2)) w[2] = 9;
  if (kindOpen(S, 3)) w[3] = 4;
  if (S.up.request) { w[1] += 10; if (w[2]) w[2] += 6; if (w[3]) w[3] += 3; }
  const t = w.reduce((a, b) => a + b, 0);
  return w.map(x => x / t);
}

export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'piece') return Math.ceil(it.base * Math.pow(it.grow, S.own[id]));
  return it.base;
}
export function revealed(S, id) {
  const it = BY_ID[id];
  if (S.seen.includes(id)) return true;
  return S.record >= it.at && (!it.needs || (BY_ID[it.needs].kind === 'piece' ? S.own[it.needs] > 0 : S.up[it.needs]));
}
export const owned = (S, id) => BY_ID[id].kind === 'piece' ? S.own[id] >= MAX[id] : !!S.up[id];
export const visible = S => ITEMS.filter(it => revealed(S, it.id) && !owned(S, it.id));
export const bought = S => ITEMS.filter(it => it.kind !== 'piece' && S.up[it.id]);
export const canBuy = (S, id) => !owned(S, id) && revealed(S, id) && S.now >= cost(S, id);
// Newly revealed items (mark them seen so they never hide again).
export function reveal(S) {
  const out = [];
  for (const it of ITEMS) if (!S.seen.includes(it.id) && revealed(S, it.id)) { S.seen.push(it.id); out.push(it.id); }
  return out;
}
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const c = cost(S, id);
  S.now -= c; S.spent += c;
  if (BY_ID[id].kind === 'piece') S.own[id]++;
  else S.up[id] = true;
  return true;
}

// ---------- the floor ----------
export const cell = (c, r) => r * COLS + c;
export function place(S, t, c, r, setting) {
  const i = cell(c, r);
  if (S.grid[i] || spare(S, t) <= 0) return false;
  S.grid[i] = t === 'ruler' ? { t, d: setting ?? 1 } : t === 'comb' ? { t, k: setting ?? 0 } : { t, k: setting ?? 0, n: 0, busy: 0 };
  return true;
}
export function remove(S, c, r) { const i = cell(c, r); if (!S.grid[i]) return false; S.grid[i] = null; return true; }
export function move(S, c, r, c2, r2) {
  const a = cell(c, r), b = cell(c2, r2);
  if (!S.grid[a] || S.grid[b]) return false;
  S.grid[b] = S.grid[a]; S.grid[a] = null; return true;
}
// Tap: turn a ruler round, or step a comb or desk to the next kind (only kinds kids are finding).
export function turn(S, c, r) {
  const g = S.grid[cell(c, r)];
  if (!g) return false;
  if (g.t === 'ruler') g.d = -g.d;
  else {
    const top = g.t === 'desk' ? 3 : 4;
    let k = g.k;
    do { k = (k + 1) % top; } while (!kindOpen(S, k) && k !== g.k);
    g.k = k;
    if (g.t === 'desk') g.n = 0;
  }
  return true;
}

function toMat(S, k, ev, why, c = 0, r = ROWS) {
  if (S.mat.length >= MAT_MAX) { S.lost++; ev.push({ type: 'lost', k, c, r }); return; }
  S.mat.push(k); ev.push({ type: 'mat', k, why, c, r, slot: S.mat.length - 1 });
}
function gain(S, n) { S.now += n; S.earned += n; if (S.now > S.record) S.record = S.now; }
// A marble reaches a jar on its own, or by hand.
export function jar(S, k, col, ev) {
  const jk = col - 1;
  if (jk === k && kindOpen(S, k)) {
    S.jars[k]++; const g = LIST[k] * fameMult(S); gain(S, g);
    ev.push({ type: 'jar', k, col, g });
    return true;
  }
  return false;
}
// Drag a marble from the mat into a jar.
export function sortHand(S, idx, col) {
  const k = S.mat[idx];
  if (k === undefined) return null;
  const ev = [];
  if (!jar(S, k, col, ev)) return false;
  S.mat.splice(idx, 1); S.handSorted++;
  return ev[0];
}
// Tap the In Tray: Gamp stamps one form itself (by falling on it).
export function stampHand(S) { if (S.tray <= 0) return false; S.tray--; S.stamped++; return true; }

function stepItems(S, ev) {
  const busy = busySecs(S), mult = fameMult(S), sus = suspended(S);
  const next = [];
  for (const it of S.items) {
    it.pc = it.c; it.pr = it.r; it.steps = (it.steps || 0) + 1;
    if (it.c < 0 || it.c >= COLS) { toMat(S, it.k, ev, 'edge', it.c, it.r); continue; }
    let c = it.c, r = it.r;
    const g = r >= 0 ? S.grid[cell(c, r)] : null;
    if (!g) r++;
    else if (g.t === 'ruler') c += g.d;
    else if (g.t === 'comb') { if (g.k === it.k) r++; else c++; }
    else if (g.t === 'desk') {
      if (g.k === it.k && !sus && g.busy <= 0) {
        g.n++;
        ev.push({ type: 'catch', c, r, n: g.n, k: it.k });
        if (g.n >= 3) {
          g.n = 0; g.busy = busy;
          S.swaps[it.k]++; S.tray++;
          const add = SWAP[it.k] * mult; gain(S, add);
          ev.push({ type: 'swap', k: it.k, c, r, g: add });
          next.push({ id: S.nextId++, k: it.k + 1, c: c + 1, r, pc: c, pr: r, steps: 0 });
        }
        continue; // absorbed
      }
      r++;
    }
    it.c = c; it.r = r;
    if (c < 0 || c >= COLS) { toMat(S, it.k, ev, 'edge', c, r); continue; }
    if (r >= ROWS) { if (!jar(S, it.k, c, ev)) toMat(S, it.k, ev, c === 0 ? 'door' : 'jar', c, r); continue; }
    if (it.steps > 24) { toMat(S, it.k, ev, 'loop', c, r); continue; }
    next.push(it);
  }
  S.items = next;
}

// Advance the world by dt seconds. Returns events for sound, pictures and the log.
export function step(S, dt, rng = Math.random) {
  const ev = [];
  if (S.ended) return ev;
  S.time += dt;
  for (const g of S.grid) if (g && g.t === 'desk' && g.busy > 0) g.busy = Math.max(0, g.busy - dt);
  // Mrs. Pettigrew stamps the forms in her tray, one at a time.
  if (S.tray > 0) {
    S.stampAcc += dt;
    while (S.tray > 0 && S.stampAcc >= stampSecs(S)) { S.stampAcc -= stampSecs(S); S.tray--; S.stamped++; ev.push({ type: 'stamp' }); }
  } else S.stampAcc = 0;
  // Kids post marbles through the hatch.
  S.arrAcc += arrivalRate(S) * dt;
  while (S.arrAcc >= 1) {
    S.arrAcc -= 1;
    const m = mix(S); let x = rng(), k = 0;
    while (k < 3 && x >= m[k]) { x -= m[k]; k++; }
    S.items.push({ id: S.nextId++, k, c: 0, r: -1, pc: 0, pr: -1, steps: 0 });
    ev.push({ type: 'arrive', k });
  }
  S.tickAcc += dt;
  while (S.tickAcc >= TICK) { S.tickAcc -= TICK; stepItems(S, ev); ev.push({ type: 'tick' }); }
  return ev;
}
export const done = S => S.now >= GOAL;

// Expected listeners a second from the floor as laid out (for the readouts): measured, not modelled, by the game.
export const fmt = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n >= 100 ? Math.floor(n).toString() : n >= 10 ? Math.floor(n).toString() : (Math.floor(n * 10) / 10).toString();
