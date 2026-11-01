// Eighteen Pleats: the rules. Shared by index.html and the pacing sim (sim.mjs).
//
// Skerry Light folds dumplings with its lamp clockwork (one turn, one pleat; Regulation 18 wants
// eighteen per dumpling) into a steamer basket swinging on the winch. Tap to drop the basket onto
// the stack. Boats wait in the fog as contract slips; accept one and the stack is lowered to its
// deck as soon as it holds enough dumplings. Eastpoint, across the bay, copies everything.
//
// Positions are in basket widths; 0 is the middle of the tray.

export const PLEATS = 18;
export const QUOTA = 720;

// Tuning knobs (the sim can override them).
export const T = {
  pleat0: 5,          // pleats per second at the start
  gearP: 0.17,        // pleats per second per gear level
  gullP: 0.3,         // pleats per second per gull
  cap0: 2,            // dumplings per basket at the start
  period: 2.6,        // seconds per full swing
  amp: 0.95,          // swing amplitude
  perfect: 0.075,     // |dx| under this snaps to centre
  miss: 0.68,         // |dx| over this and the basket falls off
  topple: 0.5,        // |centre of mass| over this and the stack goes over
  rate: { pork: 3, prawn: 4.5, soup: 6.5, lifeboat: 6 },
  epAt: 70,           // served dumplings before Eastpoint opens
  epLag: 40,          // seconds before Eastpoint copies an upgrade
  thickAt: 430,       // served dumplings before the busy final stretch
};

// ---------- Upgrades ----------
// max: repeatable with levels. silly: does very little. need: revealed when this is true.
export const UPGRADES = [
  { id: 'frame', name: 'Framed Regulation 18', price: 5, silly: true, need: S => S.served >= 2,
    desc: 'A framed copy of Regulation 18 for the lamp room wall. Does nothing.', joke: 'It hangs in the lamp room. It is slightly crooked. This has been noted.' },
  { id: 'gear', name: 'Gear the pleater', max: 40, price: l => Math.round(4 * Math.pow(1.11, l)),
    desc: 'One more gear between the lamp clockwork and the pleating wheel: +0.17 pleats per second. (Precisely.)', joke: 'The lamp turns faster. Nobody can see it in the fog, so nobody complains.' },
  { id: 'basket', name: 'Bigger baskets', max: 7, price: l => Math.round(15 * Math.pow(1.42, l)), need: S => S.served >= 8,
    desc: 'Each steamer basket holds one more dumpling. Fewer baskets per order, shorter stacks.', joke: 'Requisitioned from the Board catalogue, page 40: Baskets, Steamer, Bamboo, Somewhat Larger.' },
  { id: 'form18b', name: 'Form 18-B', price: 12, silly: true, need: S => S.served >= 12,
    desc: 'Request for Clarification of Regulation 18. Submitted to the Harbour Board. Does nothing yet.', joke: 'Form 18-B submitted. Expected response: end of season. Please do not resubmit.' },
  { id: 'chamomile', name: 'Chamomile', price: 22, need: S => S.served >= 15,
    desc: 'A thermos of chamomile on the gallery. Nerves settle twice as fast.', joke: 'A lighthouse cannot drink tea. It is the thought that counts.' },
  { id: 'horn', name: 'Fog horn', price: 30, need: S => S.served >= 22,
    desc: 'Room for a third boat on the board, and boats find you sooner.', joke: 'It goes BWAAARP. The lighthouse apologizes each time.' },
  { id: 'dowel', name: 'Bamboo dowel', price: 36, need: S => S.served >= 30,
    desc: 'A pole down the middle of the stack. It can lean much further before it goes over.', joke: 'Approved under Form 31 (Structural Support, Edible-Adjacent).' },
  { id: 'cardigan', name: 'Cardigan', price: 42, need: S => S.served >= 40,
    desc: 'A large knitted cardigan for the tower. Trembling down by a third.', joke: 'Hand-knitted by the Board’s Welfare Committee. One sleeve is longer. It helps anyway.' },
  { id: 'gull', name: 'Gull apprentice', max: 10, price: l => Math.round(24 * Math.pow(1.18, l)), need: S => S.served >= 55,
    desc: 'A gull on a stool at the pleating wheel: +0.3 pleats per second, even while you look away.', joke: 'Paid in rejected dumplings. Has been eating the rejected dumplings anyway.' },
  { id: 'badge', name: 'Name badge', price: 20, silly: true, need: S => S.ep,
    desc: 'HELLO MY NAME IS SKERRY. So the boats know which lighthouse is which.', joke: 'Pinned to the gallery rail. Does nothing.' },
  { id: 'latch', name: 'Drop latch', max: 3, price: l => [45, 100, 180][l], need: S => S.served >= 80,
    desc: 'Clockwork drops a full basket dead centre on its own, every few seconds. Faster each level.', joke: 'Form 41: Automatic Release of Baskets (Supervised). Nobody is supervising.' },
  { id: 'winch', name: 'Steady winch', price: 60, need: S => S.served >= 100,
    desc: 'Oiled and weighted: the basket swings a fifth slower.', joke: 'Three drops of oil, as per the manual. Four would be irresponsible.' },
  { id: 'radio', name: 'Shipping forecast', price: 75, need: S => S.served >= 130,
    desc: 'A little radio reading the shipping forecast. Trembling down by a fifth, and missed boats sting half as much.', joke: '"Skerry: fog, thick. Visibility: poor. Dumplings: adequate." Soothing.' },
  { id: 'prawn', name: 'Prawn licence', price: 65, need: S => S.served >= 100,
    desc: 'Form 22. Boats can order prawn dumplings, which pay half again.', joke: 'The prawns were consulted and did not object in writing.' },
  { id: 'tray', name: 'Wide tray', price: 80, need: S => S.served >= 180,
    desc: 'A wider landing tray: catches baskets further off-centre, and more drops count as perfect.', joke: 'Previously a door. The lamp room now has no door. This is fine.' },
  { id: 'hat', name: 'Little hat', price: 48, silly: true, need: S => S.served >= 240,
    desc: 'A small hat for the lamp. Does nothing.', joke: 'It is a very small hat on a very large lamp. Eastpoint will want one.' },
  { id: 'soup', name: 'Soup permit', price: 115, need: S => S.served >= 230,
    desc: 'Form 18-S: soup dumplings. Big orders that pay triple, but the stack must stand nearly straight or the soup sloshes and the pay is halved.', joke: 'Soup dumplings also have eighteen pleats. Regulation 18 was very clear about that.' },
  { id: 'fruit', name: 'Fruit basket', price: 90, silly: true, need: S => S.served >= 380,
    desc: 'A welcome basket for Eastpoint. Does nothing.', joke: 'Sent across the bay with a card. Eastpoint sent back an identical fruit basket, and the same card.' },
  { id: 'foreman', name: 'Gull foreman', price: 150, need: S => S.served >= 420,
    desc: 'A senior gull with a whistle. Every gull apprentice folds twice as fast.', joke: 'Promoted from apprentice after eleven years. Has a lanyard now.' },
  { id: 'kettle', name: 'Lamp-room kettle', price: 135, need: S => S.served >= 460 && has(S, 'soup'),
    desc: 'Topping up the soup from the top. Soup orders put up with a lean half again as big before they slosh.', joke: 'Approved under Form 18-S, subsection Kettle. There was always going to be a subsection Kettle.' },
  { id: 'towel', name: 'Tea towel', price: 120, silly: true, need: S => S.served >= 500,
    desc: 'A commemorative tea towel: SKERRY LIGHT, FOG SEASON. Does nothing.', joke: 'Printed in two colours, slightly out of register. Eastpoint has ordered one.' },
  { id: 'wheel', name: 'Second pleating wheel', price: 240, need: S => S.served >= 540,
    desc: 'A second wheel on the far side of the clockwork: +30% pleats per second.', joke: 'The lamp now turns two wheels and itself. It has never felt so useful in fog.' },
];
export const BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

export const lvl = (S, id) => S.lv[id] || 0;
export const has = (S, id) => !!S.lv[id];
export function priceOf(S, u) { return typeof u.price === 'function' ? u.price(lvl(S, u.id)) : u.price; }

// ---------- State ----------
export function newState() {
  return {
    t: 0, chits: 0, served: 0, earned: 0, lv: {}, seen: {}, nerves: 0.3, sw: 0,
    stack: [], hook: { n: 0, p: 0 }, board: [], active: null, lowering: 0, slipT: 2, nextId: 1,
    ep: false, epCopies: [], epHave: {}, epServed: 0, epSince: 0,
    latchT: 0, perfects: 0, streak: 0, bestStreak: 0, bestStack: 0, topples: 0, rejected: 0, missed: 0, delivered: 0,
    final: null, ended: false, seed: 18, shopTab: 'chits', boughtOpen: false,
  };
}
export function load(raw) {
  const S = newState();
  if (raw && typeof raw === 'object') Object.assign(S, raw);
  if (!S.hook) S.hook = { n: 0, p: 0 };
  return S;
}
const rnd = S => { S.seed = (S.seed * 1664525 + 1013904223) >>> 0; return S.seed / 4294967296; };

// ---------- Derived stats ----------
export function stats(S) {
  const pleats = (T.pleat0 + T.gearP * lvl(S, 'gear') + T.gullP * lvl(S, 'gull') * (has(S, 'foreman') ? 2 : 1)) * (has(S, 'wheel') ? 1.3 : 1);
  return {
    pleats,                                          // pleats per second
    perDumpling: PLEATS / pleats,                    // seconds per dumpling
    cap: T.cap0 + lvl(S, 'basket'),
    period: T.period * (has(S, 'winch') ? 1.25 : 1),
    tremble: (has(S, 'cardigan') ? 0.66 : 1) * (has(S, 'radio') ? 0.8 : 1),
    calm: has(S, 'chamomile') ? 0.024 : 0.012,       // nerves recovered per second
    sting: has(S, 'radio') ? 0.5 : 1,
    perfect: T.perfect + (has(S, 'tray') ? 0.045 : 0),
    miss: T.miss + (has(S, 'tray') ? 0.2 : 0),
    topple: T.topple + (has(S, 'dowel') ? 0.32 : 0),
    slots: has(S, 'horn') ? 3 : 2,
    latch: [0, 6, 3.6, 2.2][lvl(S, 'latch')],
  };
}
export const phase = S => S.ended || S.final ? 'clear' : !S.ep ? 'fog' : S.served >= T.thickAt ? 'thick' : 'eastpoint';

// The swing and the trembling are functions of time so the game and the sim agree.
export function shake(S, t) {
  const a = (0.025 + 0.2 * S.nerves) * stats(S).tremble;
  return a * (Math.sin(t * 13.1) * 0.5 + Math.sin(t * 7.7 + 1) * 0.35 + Math.sin(t * 21.3 + 2) * 0.15);
}
export function hookX(S, t = S.t) { return T.amp * Math.sin(S.sw * Math.PI * 2) + shake(S, t); }
// The stack sways with its height and the lighthouse's nerves.
export function sway(S, t = S.t) { return Math.min(1, S.stack.length / 10) * shake(S, t * 0.37 + 5) * 1.6; }
export const topX = S => (S.stack.length ? S.stack[S.stack.length - 1].x : 0);
export const com = S => (S.stack.length ? S.stack.reduce((a, b) => a + b.x, 0) / S.stack.length : 0);
export const stackN = S => S.stack.reduce((a, b) => a + b.n, 0);

// ---------- Contracts ----------
const NAMES = ['MV Adequate', 'Trawler Mildred', 'The Reasonable Doubt', 'Ferry No. 4', 'Sloop Unremarkable', 'HMS Pending',
  'Dredger Patience', 'The Second Thoughts', 'MV Form 6', 'Trawler Gwen', 'The Moderate Breeze', 'Tug Anyway', 'Coaster Eileen',
  'The Quiet Word', 'MV In Triplicate', 'Ketch Up', 'The Brief Pause', 'Trawler Doris', 'Ferry No. 9', 'The Fine Print'];
function newSlip(S) {
  const st = stats(S);
  let kind = 'pork';
  const r = rnd(S);
  if (has(S, 'soup') && r < 0.3) kind = 'soup';
  else if (has(S, 'prawn') && r < 0.62) kind = 'prawn';
  else if (S.served > 120 && r > 0.93) kind = 'lifeboat';
  // Orders come in baskets' worth: two to four early on, up to six by the end.
  const k = kind === 'lifeboat' ? 2 : 2 + rnd(S) * 2 + Math.min(2, S.served / 250) + (kind === 'soup' ? 1 : 0);
  const want = Math.max(2, Math.round(st.cap * k));
  const pay = Math.round(want * T.rate[kind]);
  const work = want * st.perDumpling + 3;
  const deadline = Math.round(kind === 'lifeboat' ? work * 1.5 + 6 : work * 1.9 + 12);
  return { id: S.nextId++, boat: kind === 'lifeboat' ? 'Lifeboat' : NAMES[(S.nextId * 7) % NAMES.length], kind, want, pay, deadline, patience: patienceOf(S), max: patienceOf(S) };
}
// Boats wait in the fog this long; once Eastpoint is copying you, it snaps them up sooner.
export function patienceOf(S) {
  if (!S.ep) return 75;
  const copied = Object.values(S.epHave).reduce((a, b) => a + b, 0);
  return Math.max(32, 68 - copied);
}
export function accept(S, id) {
  if (S.active || S.final) return false;
  const i = S.board.findIndex(b => b.id === id);
  if (i < 0) return false;
  const [slip] = S.board.splice(i, 1);
  S.active = { ...slip, left: slip.deadline };
  return true;
}

// ---------- The core action ----------
// Drop the basket. dx is where it lands relative to the top of the stack (the game measures it on
// screen, the sim rolls it). Returns what happened, for sounds and log lines.
export function drop(S, dx) {
  const st = stats(S), out = { rejected: 0, n: S.hook.n };
  if (S.lowering > 0 || S.final) return { empty: true };
  if (S.hook.n === 0) return { empty: true };
  // A half-folded dumpling on the wheel can't go: Regulation 18.
  if (S.hook.p >= 1) { out.rejected = Math.floor(S.hook.p); S.rejected++; }
  const n = S.hook.n;
  S.hook = { n: 0, p: 0 };
  const base = S.stack.length ? topX(S) : 0;
  const lim = S.stack.length ? st.miss : st.topple;
  if (Math.abs(dx) > lim) {
    out.missed = true; S.streak = 0;
    S.nerves = Math.min(1, S.nerves + 0.04);
    return out;
  }
  let x = base + dx;
  if (Math.abs(dx) < st.perfect) {
    x = base; out.perfect = true; S.perfects++; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
    S.nerves = Math.max(0, S.nerves - 0.035);
  } else S.streak = 0;
  S.stack.push({ x, n });
  S.bestStack = Math.max(S.bestStack, S.stack.length);
  if (Math.abs(com(S)) > st.topple) {
    out.toppled = S.stack.length; out.lost = stackN(S);
    S.stack = []; S.topples++; S.streak = 0;
    S.nerves = Math.min(1, S.nerves + 0.18);
    return out;
  }
  out.landed = true;
  checkDelivery(S, out);
  return out;
}
function checkDelivery(S, out) {
  const a = S.active;
  if (!a || S.lowering > 0) return;
  if (stackN(S) >= a.want) { S.lowering = 2.2; out.delivering = true; }
}
// Called when the lowering animation finishes.
function deliver(S) {
  const a = S.active, n = stackN(S);
  let pay = a.pay + Math.round((n - a.want) * T.rate[a.kind] * 0.5);
  let slosh = false;
  if (a.kind === 'soup' && Math.abs(com(S)) > (has(S, 'kettle') ? 0.33 : 0.22)) { pay = Math.round(pay / 2); slosh = true; }
  S.chits += pay; S.earned += pay; S.served += n; S.delivered++;
  S.stack = []; S.active = null;
  S.nerves = Math.max(0, S.nerves - 0.05);
  return { delivered: n, pay, boat: a.boat, kind: a.kind, slosh };
}

// ---------- Time ----------
// Advances dt seconds. Returns a list of events for the game to show.
export function tick(S, dt) {
  const ev = [];
  if (S.ended) return ev;
  S.t += dt;
  const st = stats(S);
  S.sw += dt / st.period;
  if (S.final) return ev;
  // Folding.
  if (S.hook.n < st.cap) {
    S.hook.p += st.pleats * dt;
    while (S.hook.p >= PLEATS && S.hook.n < st.cap) { S.hook.p -= PLEATS; S.hook.n++; ev.push({ folded: S.hook.n }); }
    if (S.hook.n >= st.cap) S.hook.p = 0;
  }
  S.nerves = Math.max(0.05, S.nerves - st.calm * dt);
  // The drop latch drops full baskets dead centre on its own.
  if (st.latch && S.hook.n >= st.cap && S.lowering <= 0) {
    S.latchT += dt;
    if (S.latchT >= st.latch) { S.latchT = 0; ev.push({ latch: drop(S, 0) }); }
  } else S.latchT = 0;
  // Lowering a finished stack to the boat.
  if (S.lowering > 0) {
    S.lowering -= dt;
    if (S.lowering <= 0) { S.lowering = 0; ev.push({ deliver: deliver(S) }); }
  }
  // The active boat's clock.
  if (S.active && S.lowering <= 0) {
    S.active.left -= dt;
    if (S.active.left <= 0) { ev.push({ expired: S.active }); lose(S, S.active, 0.12); S.active = null; }
  }
  // Boats waiting in the fog.
  for (const b of [...S.board]) {
    b.patience -= dt;
    if (b.patience <= 0) { S.board.splice(S.board.indexOf(b), 1); ev.push({ gone: b }); lose(S, b, S.ep ? 0 : 0.03); }
  }
  S.slipT -= dt * (has(S, 'horn') ? 1.5 : 1);
  if (S.board.length < st.slots && S.slipT <= 0) { S.board.push(newSlip(S)); S.slipT = 20 + rnd(S) * 12; ev.push({ slip: true }); }
  // Eastpoint.
  if (!S.ep && S.served >= T.epAt) { S.ep = true; S.epSince = S.t; ev.push({ eastpoint: true }); }
  for (const c of [...S.epCopies]) {
    if (S.t >= c.at) {
      S.epCopies.splice(S.epCopies.indexOf(c), 1);
      S.epHave[c.id] = (S.epHave[c.id] || 0) + 1;
      ev.push({ copied: c.id });
    }
  }
  if (S.served >= QUOTA && !S.quotaMet) { S.quotaMet = true; ev.push({ quota: true }); }
  return ev;
}
function lose(S, b, sting) {
  S.missed++;
  S.nerves = Math.min(1, S.nerves + sting * stats(S).sting);
  if (S.ep) S.epServed += b.want;
}

// ---------- Shop ----------
export function reveal(S) {
  const fresh = [];
  for (const u of UPGRADES) {
    if (S.seen[u.id]) continue;
    if (u.max && lvl(S, u.id) >= u.max) continue;
    const ok = u.need ? u.need(S) : true;
    if (ok && (S.chits >= priceOf(S, u) * 0.4 || S.earned >= priceOf(S, u))) { S.seen[u.id] = true; fresh.push(u.id); }
  }
  return fresh;
}
export function items(S) {
  return UPGRADES.filter(u => S.seen[u.id] && !(u.max ? lvl(S, u.id) >= u.max : has(S, u.id)))
    .map(u => ({ ...u, price: priceOf(S, u), level: lvl(S, u.id) }));
}
export function buy(S, id) {
  const u = BY_ID[id];
  if (!u || !S.seen[id] || S.final) return false;
  if (u.max ? lvl(S, id) >= u.max : has(S, id)) return false;
  const p = priceOf(S, u);
  if (S.chits < p) return false;
  S.chits -= p;
  S.lv[id] = lvl(S, id) + 1;
  if (S.ep) S.epCopies.push({ id, at: S.t + T.epLag });
  return true;
}
// Eastpoint copies everything, not quite right.
export const COPY_NAMES = {
  frame: 'a framed copy of Regulation 1B', gear: 'a gear (one tooth short)', basket: 'bigger baskests', form18b: 'Form 18-8',
  chamomile: 'camomille', horn: 'a fog hron', dowel: 'a bamboo dowl', cardigan: 'a cardigam', gull: 'a gul apprentice',
  badge: 'a name badge (HELLO MY NAME IS SKERRY)', latch: 'a drop lacth', winch: 'a steady wintch', radio: 'the shiping forecast',
  prawn: 'a pawn licence', tray: 'a wide tary', hat: 'a little hat (slightly smaller)', soup: 'a soop permit', fruit: 'an identical fruit basket',
};

// ---------- The finale: hand it all over ----------
// Every crate the kitchen packs into, in the order the winch brings them.
export function finalCrates(S) {
  const list = [{ id: 'clockwork', name: 'The pleating clockwork' }, { id: 'baskets', name: `${T.cap0 + lvl(S, 'basket')}-dumpling baskets` }];
  for (const id of ['cardigan', 'radio', 'chamomile', 'gull', 'frame', 'hat', 'badge', 'horn']) if (has(S, id)) list.push({ id, name: BY_ID[id].name });
  list.push({ id: 'reg18', name: 'Regulation 18 (framed)' });
  return list.slice(0, 9);
}
export function startFinal(S) {
  if (!S.quotaMet || S.final || S.ended) return false;
  S.final = { i: 0, stack: [], crates: finalCrates(S), done: false };
  S.board = []; S.active = null; S.lowering = 0; S.stack = []; S.hook = { n: 0, p: 0 };
  return true;
}
// Drop the next crate. Nothing can go wrong now: if one misses, Eastpoint's tender catches it.
export function dropCrate(S, dx) {
  const F = S.final;
  if (!F || F.done || F.i >= F.crates.length) return null;
  const crate = F.crates[F.i++];
  const base = F.stack.length ? F.stack[F.stack.length - 1].x : 0;
  const caught = Math.abs(dx) > 0.75;
  const x = caught ? base : Math.abs(dx) < 0.1 ? base : base + dx * 0.6;
  F.stack.push({ x, id: crate.id, name: crate.name });
  if (F.i >= F.crates.length) F.done = true;
  return { crate, caught, done: F.done };
}

export const fmt = n => Math.floor(n).toLocaleString('en-GB');
