// Hoo's Belfry: the rules. index.html draws them; sim.mjs plays them headless.
//
// Nurse Hoo tunes little brass bells on a tongue-depressor slingshot and hides them in pranks around
// Bramble Ward. A bell is tuned by how far its band is stretched: pitch is a number of semitones
// above C (0..11). The six whole-tone lines (C D E F# G# A#) are the notes; exactly between two
// lines a bell clonks one of the other six (the hidden mechanic). Each prank (a blueprint sheet)
// needs bells on given notes; the last bell sets the prank off. The first half runs on pennies and
// Hoo's clipboard (a priority list of chores); Matron's Budget Review stops the money, and the
// night staff volunteer for favours.

export const NIGHT = 150;                 // seconds per night shift (for the count and the Toy Fund)
export const TOY_FUND = 3;                // pence a night, until the Budget Review
export const OFFLINE_CAP = 3 * 3600, OFFLINE_RATE = 0.1;
export const MAX_STAFF = 12;
export const GIVE_FAVOURS = 40;           // the last purchase also needs this many favours (it takes them all)
// Tunables (the sim can override them with --T='{...}').
export const T = {
  chair: [24, 20, 16.5, 14, 12, 10], cover: 55, lost: 65, tune: [10, 8, 6.5, 5.5],
  scrounge: 600, staffTune: 100, staffCover: 280, smile: 360, favBell: 3,
  recruit: 4, recruitStep: 3, grow: 1, fgrow: 1,
};
export const BUY_KEEP = 2;                // the buy chore keeps this many untuned bells on the bench
export const NOTE = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const isClonk = n => n % 2 === 1;

// The pranks, in order. Odd notes are clonks: the hidden half of the gauge.
export const PLANS = [
  { id: 'door', name: 'The Ward Door', notes: [0, 4], gag: 'The ward door now goes “shh-boop” when it opens. The night porter has opened it nine times.' },
  { id: 'trolley', name: 'The Tea Trolley', notes: [0, 4, 8], gag: 'The tea trolley plays a chord, but only when it is carrying biscuits. Everyone now knows when there are biscuits.' },
  { id: 'lift', name: 'The Lift', notes: [0, 2, 4, 6, 8], gag: 'The lift politely plays “going up” all the way down to the basement.' },
  { id: 'chute', name: 'The Linen Chute', notes: [10, 8, 6, 4, 2, 0, 2], gag: 'Every sheet that goes down the linen chute slides down a scale and lands on a little “ta-da”.' },
  { id: 'chair', name: "Matron's Chair", notes: [0, 4, 8, 10, 8, 4, 0, 6, 2], gag: 'Six o’clock handover. Matron Bramble sits down. Her chair plays a polka, all of it, in front of the entire day shift.' },
  { id: 'clock', name: "The Porters' Clock", notes: [0, 4, 7, 4, 0, 7, 2, 4], gag: 'The porters’ clock strikes the hour with a ting, a clonk and a sort of bow.' },
  { id: 'hatch', name: 'The Pharmacy Hatch', notes: [2, 6, 9, 6, 2, 9, 5, 2, 6, 10], gag: 'The pharmacy hatch sings “one moment please” in a voice like a small brass band.' },
  { id: 'barrier', name: 'The Car Park Barrier', notes: [0, 2, 4, 5, 7, 9, 11, 10, 8, 6, 4, 0], gag: 'The car park barrier lifts with a fanfare and comes down with a sigh. Ambulance drivers wave at it.' },
  { id: 'stairs', name: 'The Fire Stairs', notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 2], gag: 'Every step of the fire stairs is a note. The fire drill becomes a scale. Nobody walks; everyone hops.' },
  { id: 'office', name: "Matron's Office", notes: [0, 4, 8, 4, 0, 3, 7, 11, 7, 3, 2, 6, 10, 6, 2, 0], gag: 'Matron Bramble opens her office door and the whole room plays the polka, from the filing cabinet to the kettle. She stands there for a long time. Then she shuts the door, very quietly, and hums it.' },
  { id: 'pool', name: 'The Dawn Polka', notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], gag: 'At dawn, the hydrotherapy pool plays the polka on its own, every note on the gauge, both scales at once. Bramble Ward wakes up laughing.' },
];
export const TOTAL_BELLS = PLANS.reduce((n, p) => n + p.notes.length, 0); // 98
export const REVIEW_AT = 5;               // the Budget Review follows plan 5 (Matron's chair)

// Hoo's clipboard: chores she does by herself, first ticked one that can be done wins.
export const TASKS = {
  chairs: { name: 'Return wheelchairs', icon: '♿' },
  buy:    { name: 'Buy bells (keeps 2)', icon: '🔔' },
  tune:   { name: 'Tune bells by feel', icon: '🎚' },
  lost:   { name: 'Check lost property', icon: '🧺' },
  cover:  { name: 'Cover a break', icon: '☕' },
};
export const JOBS = {
  scrounge: { name: 'Scrounge', icon: '🔔', desc: 'find bells in cupboards, slipper toes and drains' },
  tune:     { name: 'Tune', icon: '🎚', desc: 'tune bells by ear for the current sheet' },
  cover:    { name: 'Cover', icon: '☕', desc: 'cover each other’s breaks for favours' },
};

export function newState() {
  return {
    t: 0, night: 1, nightT: 0,
    pence: 3, favours: 0, raw: 2, rack: Array(12).fill(0),
    plan: 0, slots: [], stars: 0, installed: 0, perfect: 0, tuned: 0, clonks: 0, wheels: 0,
    lv: {},
    queue: [{ id: 'buy', on: true }, { id: 'chairs', on: true }],
    qTask: null, qProg: 0,
    review: false, staff: 0, jobs: { scrounge: 0, tune: 0, cover: 0 }, jobProg: { scrounge: 0, tune: 0, cover: 0 },
    clonk: false, clonkWait: 0,
    ended: false, given: null, seen: [], shopTab: 'p', lastSeen: Date.now(),
  };
}
// Saves from the first morning, when the bells were rubber ducks and the ward had call bells.
// Saves from before the game was simplified still carry call lights, flats and the fitting step.
const GONE = ['calls', 'callT', 'callsAnswered', 'hush', 'hushT', 'matron', 'rounds', 'pipAsked', 'ready', 'fitting', 'flats', 'flatT', 'repaired'];
const RENAMED = { bells: 'calls', bellT: 'callT', bellsAnswered: 'callsAnswered', honk: 'clonk', honks: 'clonks', honkWait: 'clonkWait', honkHinted: 'clonkHinted' };
export function load(raw) {
  raw = { ...(raw || {}) };
  for (const [a, b] of Object.entries(RENAMED)) if (a in raw) { if (!(b in raw)) raw[b] = raw[a]; delete raw[a]; }
  if (Array.isArray(raw.queue)) raw.queue = raw.queue.map(q => q && q.id === 'bell' ? { ...q, id: 'call' } : q);
  if (raw.qTask === 'bell') raw.qTask = 'call';
  if (raw.given && raw.given.bells == null && raw.given.ducks != null) raw.given = { ...raw.given, bells: raw.given.ducks };
  for (const k of GONE) delete raw[k];
  const S = Object.assign(newState(), raw);
  S.rack = Array.from({ length: 12 }, (_, i) => (raw && raw.rack && raw.rack[i]) || 0);
  S.lv = S.lv || {};
  const J = S.jobs || {};
  S.jobs = { scrounge: J.scrounge || 0, tune: J.tune || 0, cover: (J.cover || 0) + (J.hush || 0) };
  S.jobProg = { scrounge: 0, tune: 0, cover: 0 };
  if (!Array.isArray(S.queue)) S.queue = newState().queue;
  S.queue = S.queue.filter(q => q && TASKS[q.id]).map(q => ({ id: q.id, on: !!q.on }));
  for (const id of knownTasks(S)) if (!S.queue.some(q => q.id === id)) S.queue.push({ id, on: false });
  if (S.qTask && !TASKS[S.qTask]) S.qTask = null;
  if (S.ended) { S.plan = PLANS.length; S.installed = TOTAL_BELLS; S.review = true; }
  if (S.plan >= REVIEW_AT) S.review = true;
  if (S.plan < PLANS.length && S.slots.length !== PLANS[S.plan].notes.length) S.slots = PLANS[S.plan].notes.map(() => 0);
  return S;
}

export const L = (S, id) => S.lv[id] || 0;
export function phase(S) { return S.ended ? 4 : S.plan >= PLANS.length - 1 ? 3 : S.review ? 2 : 1; }
export const plan = S => PLANS[S.plan] || null;

// ---------- Derived numbers ----------
export function stats(S) {
  const fork = L(S, 'fork');
  return {
    chairTime: T.chair[L(S, 'oil')],
    deposit: 1,
    fund: TOY_FUND + L(S, 'memo'),
    smile: T.smile / (1 + 0.3 * L(S, 'polish')),
    price: S.review ? T.favBell : L(S, 'card') ? 2 : 3,
    tuneTime: T.tune[L(S, 'ear')],
    ear: Math.min(0.92, 0.5 + 0.14 * L(S, 'ear')),
    lostTime: T.lost, coverTime: T.cover / Math.pow(1.25, L(S, 'biscuits')),
    noteTol: [0.3, 0.37, 0.42, 0.46][fork],
    perfectTol: 0.1 + 0.035 * fork,
    clonkTol: L(S, 'whistle') ? 0.24 : 0.13,
    // Night staff
    scroungeRate: (1 / T.scrounge) * Math.pow(1.5, L(S, 'bags')),
    staffTune: (1 / T.staffTune) * Math.pow(1.3, L(S, 'sonar')),
    staffEar: Math.min(0.95, 0.6 + 0.08 * L(S, 'sonar')),
    coverRate: (1 / T.staffCover) * Math.pow(1.35, L(S, 'biscuits')),
    staffClonk: L(S, 'lessons') > 0,
  };
}
// Steady income per minute, by source. Hoo's chores (wheelchairs, covering breaks) come in as she
// does them, so index.html counts those as they happen instead.
export function rates(S) {
  const st = stats(S), J = S.jobs || {};
  return {
    smile: smilers(S) * 60 / st.smile,
    fund: S.review ? 0 : st.fund * 60 / NIGHT,
    cover: S.review ? (J.cover || 0) * st.coverRate * 60 : 0,
    scrounge: S.review ? (J.scrounge || 0) * st.scroungeRate * 60 : 0,
    tune: S.review ? (J.tune || 0) * st.staffTune * st.staffEar * 60 : 0,
  };
}
export const knownTasks = S => ['buy', 'chairs', ...(L(S, 'feel') ? ['tune'] : []), ...(L(S, 'lostkey') ? ['lost'] : []), ...(S.review ? ['cover'] : [])];
export function taskTime(S, id) {
  const st = stats(S);
  return { chairs: st.chairTime, buy: 2, tune: st.tuneTime, lost: st.lostTime, cover: st.coverTime }[id];
}
// Why a ticked chore can't run right now (null when it can).
export function taskBlock(S, q) {
  const st = stats(S);
  switch (q.id) {
    case 'chairs': return S.review ? 'no coin locks' : null;
    case 'buy': return S.plan >= PLANS.length ? 'all done' : S.raw >= BUY_KEEP ? `have ${BUY_KEEP}` : have(S, bellCur(S)) < st.price ? (S.review ? 'no favours' : 'no pennies') : null;
    case 'tune': return S.raw < 1 ? 'no bells' : autoNote(S, false) == null ? 'nothing to tune' : null;
    case 'lost': return null;
    case 'cover': return S.review ? null : 'no favours yet';
  }
  return 'unknown';
}
// Notes still wanted: open slots on this sheet and the next, minus bells already on the rack.
export function wanted(S) {
  const want = Array(12).fill(0);
  for (let k = S.plan; k < Math.min(PLANS.length, S.plan + 2); k++) {
    PLANS[k].notes.forEach((n, i) => { if (!(k === S.plan && S.slots[i])) want[n]++; });
  }
  for (let n = 0; n < 12; n++) want[n] = Math.max(0, want[n] - S.rack[n]);
  return want;
}
// The note an automatic tuner goes for: the most wanted one it can make.
export function autoNote(S, canClonk) {
  const want = wanted(S);
  let best = null;
  for (let n = 0; n < 12; n++) if ((canClonk || !isClonk(n)) && want[n] > 0 && (best == null || want[n] > want[best])) best = n;
  return best;
}

// ---------- Bells ----------
// Where a tuned bell goes: into an open slot on the sheet if one wants that note, else the rack.
function place(S, note, perfect, out) {
  S.tuned++; if (isClonk(note)) S.clonks++;
  const p = plan(S);
  const i = p ? p.notes.findIndex((n, k) => n === note && !S.slots[k]) : -1;
  if (i >= 0) {
    S.slots[i] = perfect ? 2 : 1; S.installed++; if (perfect) S.stars++;
    out.push({ type: 'slot', note, i, perfect });
    checkPlan(S, out);
  } else { S.rack[note]++; out.push({ type: 'rack', note, perfect }); }
}
// Fitted pranks make somebody smile every stats(S).smile seconds each.
export const smilers = S => Math.min(S.plan, PLANS.length);
function fillFromRack(S, out) {
  const p = plan(S); if (!p) return;
  p.notes.forEach((n, i) => { if (!S.slots[i] && S.rack[n] > 0) { S.rack[n]--; S.slots[i] = 1; S.installed++; out.push({ type: 'slot', note: n, i, fromRack: true }); } });
  checkPlan(S, out);
}
function checkPlan(S, out) {
  const p = plan(S);
  if (!p || S.slots.some(x => !x)) return;
  const k = S.plan, stars = S.stars;
  const bonus = S.review || k + 1 >= REVIEW_AT ? 0 : 3 + stars;
  const fav = S.review ? 4 + stars : 0;
  S.pence += bonus; S.favours += fav;
  S.plan++; S.stars = 0;
  out.push({ type: 'prank', plan: k, stars, pence: bonus, favours: fav });
  if (S.plan === REVIEW_AT && !S.review) budgetReview(S, out);
  if (S.plan < PLANS.length) { S.slots = PLANS[S.plan].notes.map(() => 0); fillFromRack(S, out); }
  else S.slots = [];
}
// A save whose sheet is already full (from before fitting was free) goes off on load.
export function settle(S, out = []) { const p = plan(S); if (!S.ended && p && S.slots.length === p.notes.length) checkPlan(S, out); return out; }
// The rule change: no more money. The staff were at handover too.
function budgetReview(S, out) {
  S.review = true; S.staff = 3; S.jobs = { scrounge: 1, tune: 1, cover: 1 }; S.favours += 15;
  // The wheelchair line is no use now; covering breaks takes its place on the clipboard.
  const ch = S.queue.find(q => q.id === 'chairs'); if (ch) ch.on = false;
  if (!S.queue.some(q => q.id === 'cover')) S.queue.splice(Math.max(0, S.queue.indexOf(ch)), 0, { id: 'cover', on: true });
  S.shopTab = 'f';
  out.push({ type: 'review' });
}

// Manual tuning: the slingshot lets go at `pitch` semitones above C.
export function judge(S, pitch) {
  const st = stats(S);
  const n = Math.round(pitch), d = Math.abs(pitch - n), note = ((n % 12) + 12) % 12;
  if (!isClonk(note)) {
    if (d <= st.noteTol) return { kind: 'note', note, perfect: d <= st.perfectTol, d };
    return { kind: 'off', note, d };
  }
  if (d <= st.clonkTol) return { kind: 'clonk', note, perfect: d <= st.clonkTol * 0.5, d };
  return { kind: 'off', note, d };
}
export function tune(S, pitch, out = []) {
  if (S.raw < 1 || S.ended) return null;
  const r = judge(S, pitch);
  if (r.kind === 'off') { out.push({ type: 'off', ...r }); return r; }
  S.raw--;
  if (r.perfect) S.perfect++;
  if (r.kind === 'clonk' && !S.clonk) { S.clonk = true; out.push({ type: 'discover' }); }
  place(S, r.note, r.perfect, out);
  return r;
}
export const bellCur = S => S.review ? 'f' : 'p';
export function buyBell(S, out = []) {
  const st = stats(S);
  if (have(S, bellCur(S)) < st.price) return false;
  if (S.review) S.favours -= st.price; else S.pence -= st.price;
  S.raw++; out.push({ type: 'buybell' });
  return true;
}

// ---------- The shop ----------
// cur 'p' pence, 'f' favours. After the Budget Review, anything still unbought for pence costs
// favours instead (the porters chip in), so nothing that has shown up ever disappears.
const ITEMS = [
  { id: 'glasses', name: 'Reading Glasses', cur: 'p', cost: 4, at: 1, kind: 'odd', desc: 'Half-moon reading glasses for Hoo. Owls can see in the dark. Hoo just thinks they look professional.' },
  { id: 'oil', name: 'Wheel Oil', cur: 'p', cost: 5, grow: 1.6, max: 5, at: 1, desc: 'Oiled wheelchairs roll back to the bay quicker, so Hoo returns them faster.' },
  { id: 'feel', name: 'Tune by Feel', cur: 'p', cost: 10, at: 3, kind: 'one', desc: 'Adds “Tune bells by feel” to the clipboard: Hoo tunes bells by herself for the current sheet. Slower than your hands, and she misses.' },
  { id: 'lostkey', name: 'Lost Property Key', cur: 'p', cost: 9, at: 3, kind: 'one', desc: 'Adds “Check lost property” to the clipboard. A free bell every time, if you don’t mind the wait.' },
  { id: 'fork', name: 'Tuning Fork', cur: 'p', cost: 9, grow: 1.8, max: 3, at: 2, desc: 'Each level widens the lines on the gauge, so near enough counts more often, and dead-on (★) is easier.' },
  { id: 'tag', name: 'Name-Tag Gun', cur: 'p', cost: 8, at: 2, kind: 'odd', desc: 'Prints tiny name tags. Hoo labels every bell with a child’s name. For inventory, she says.' },
  { id: 'ear', name: 'A Good Ear', cur: 'p', cost: 12, grow: 1.7, max: 3, at: 3, req: 'feel', desc: 'Hoo’s tuning by feel gets quicker and hits the note more often.' },
  { id: 'chart', name: 'Bed Chart of Notes', cur: 'p', cost: 12, at: 4, kind: 'odd', desc: 'Hoo writes each child’s favourite note at the foot of their bed, beside their temperature. Nobody asked her to.' },
  { id: 'card', name: 'Gift Shop Loyalty Card', cur: 'p', cost: 20, at: 4, kind: 'one', desc: 'Bells cost 2p instead of 3p. The tenth stamp is a free stamp.' },
  { id: 'memo', name: 'A Strongly Worded Memo', cur: 'p', cost: 10, grow: 2.2, max: 3, at: 2, desc: 'Hoo writes to Matron Bramble asking for a bigger Toy Fund. Each memo gets one more penny a night. Matron underlines things.' },
  { id: 'polish', name: 'Brass Polish', cur: 'p', cost: 15, grow: 1.8, max: 4, at: 4, desc: 'Shiny bells catch the eye. Every fitted prank makes people smile more often, and smiles pay.' },
  { id: 'wrap', name: 'Gift Wrap, Just in Case', cur: 'p', cost: 16, at: 4, kind: 'odd', desc: 'A roll of paper with bells on it. Hoo is not planning anything. It was on offer.' },

  { id: 'recruit', name: 'Recruit a Volunteer', cur: 'f', cost: 5, at: REVIEW_AT, kind: 'staff', desc: 'Another night-shift volunteer joins the plan. Assign them a job under the clipboard.' },
  { id: 'bags', name: 'Laundry Bags', cur: 'f', cost: 6, grow: 1.5, max: 5, at: REVIEW_AT, desc: 'Scroungers carry more: each level finds bells half as fast again.' },
  { id: 'sonar', name: 'Bat Sonar', cur: 'f', cost: 8, grow: 1.5, max: 5, at: REVIEW_AT, desc: 'Staff on Tune work faster and miss less. Bats hear overtones you can’t.' },
  { id: 'biscuits', name: 'Staff Room Biscuits', cur: 'f', cost: 6, grow: 1.5, max: 5, at: REVIEW_AT, desc: 'Breaks are longer and better, so everyone on Cover (Hoo too) earns favours faster.' },
  { id: 'whistle', name: 'Clonk Mallet', cur: 'f', cost: 7, at: REVIEW_AT, kind: 'one', reqClonk: true, desc: 'Widens the gap between the lines where a bell clonks, so clonks are easier to hit.' },
  { id: 'lessons', name: 'Clonking Lessons', cur: 'f', cost: 14, at: REVIEW_AT + 1, kind: 'one', reqClonk: true, desc: 'Staff on Tune learn to clonk, so they can fill the “?” slots too.' },
  { id: 'hat', name: "The Night Porter's Hat", cur: 'f', cost: 4, at: REVIEW_AT + 1, kind: 'odd', desc: 'He lends it to Hoo for luck. It is much too big. It has a small bell sewn inside the brim, from a previous night shift, long ago.' },
  { id: 'drawing', name: "Pip's Drawing", cur: 'f', cost: 3, at: REVIEW_AT + 2, kind: 'odd', desc: 'Pip in Bed 4 drew a bell and wrote “PIP’S” on it. Hoo pins it to the clipboard.' },
  { id: 'ribbon', name: 'A Lot of Ribbon', cur: 'f', cost: 18, at: REVIEW_AT + 4, kind: 'odd', desc: 'Ninety-eight lengths of ribbon, all the same, all curled. Hoo says it’s for the pool.' },
];
export const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
export const staffCost = S => T.recruit + T.recruitStep * Math.max(0, S.staff - 3);

function itemView(S, it) {
  const l = L(S, it.id);
  let cost = it.id === 'recruit' ? staffCost(S) : Math.round(it.cost * (it.cur === 'p' ? T.grow : T.fgrow) * Math.pow(it.grow || 1, l));
  let cur = it.cur;
  if (cur === 'p' && S.review) { cur = 'f'; cost = Math.max(2, Math.ceil(cost / 3)); }
  return { ...it, l, cost, cur };
}
export function items(S) {
  if (S.ended) return [];
  return ITEMS.filter(it => {
    if (it.at > S.plan && !S.seen.includes(it.id)) return false;
    if (it.req && !L(S, it.req) && !S.seen.includes(it.id)) return false;
    if (it.reqClonk && !S.clonk && !S.seen.includes(it.id)) return false;
    if (it.kind === 'staff') return S.staff < MAX_STAFF;
    return L(S, it.id) < (it.max || 1);
  }).map(it => itemView(S, it));
}
export function bought(S) {
  return ITEMS.filter(it => it.kind !== 'staff' && L(S, it.id) >= (it.max || 1)).map(it => itemView(S, it));
}
export const have = (S, cur) => cur === 'p' ? S.pence : S.favours;
export function buy(S, id, out = []) {
  const it = items(S).find(i => i.id === id);
  if (!it || have(S, it.cur) < it.cost) return false;
  if (it.cur === 'p') S.pence -= it.cost; else S.favours -= it.cost;
  if (it.kind === 'staff') { S.staff++; S.jobs.scrounge++; }
  else S.lv[id] = L(S, id) + 1;
  if (id === 'feel' && !S.queue.some(q => q.id === 'tune')) S.queue.push({ id: 'tune', on: false });
  if (id === 'lostkey' && !S.queue.some(q => q.id === 'lost')) S.queue.push({ id: 'lost', on: false });
  out.push({ type: 'buy', id, name: it.name, kind: it.kind });
  return true;
}

// ---------- The last purchase ----------
export const canGive = S => !S.ended && S.plan >= PLANS.length && S.favours >= GIVE_FAVOURS;
export function giveAway(S) {
  if (!canGive(S)) return null;
  const g = { bells: TOTAL_BELLS + S.raw + S.rack.reduce((a, b) => a + b, 0), favours: S.favours, pence: S.pence };
  S.given = g; S.favours = 0; S.pence = 0; S.raw = 0; S.rack = Array(12).fill(0); S.ended = true;
  return g;
}

// ---------- Time ----------
const ticked = S => S.queue.filter(q => q.on);
function startTask(S) {
  for (const q of ticked(S)) if (!taskBlock(S, q)) { S.qTask = q.id; S.qProg = 0; return; }
  S.qTask = null;
}
function finishTask(S, id, out) {
  const st = stats(S);
  switch (id) {
    case 'chairs': if (!S.review) { S.pence += st.deposit; S.wheels++; out.push({ type: 'wheel', pence: st.deposit }); } break;
    case 'buy': if (S.raw < BUY_KEEP) buyBell(S, out); break;
    case 'tune': if (S.raw > 0) {
      const n = autoNote(S, false);
      if (n != null) {
        if (Math.random() < st.ear) { S.raw--; place(S, n, false, out); out.push({ type: 'autotune', who: 'hoo', note: n }); }
        else out.push({ type: 'automiss', who: 'hoo' });
      }
      break;
    }
    case 'lost': S.raw++; out.push({ type: 'lost' }); break;
    case 'cover': if (S.review) { S.favours++; out.push({ type: 'cover', who: 'hoo' }); } break;
  }
}
export function step(S, dt, out = []) {
  if (S.ended) return out;
  const st = stats(S);
  S.t += dt;
  S.nightT += dt;
  if (S.nightT >= NIGHT) {
    S.nightT -= NIGHT; S.night++;
    if (!S.review) S.pence += st.fund;
    out.push({ type: 'night', n: S.night, fund: !S.review, pence: S.review ? 0 : st.fund });
  }
  // Fitted pranks make people smile: pennies in the lift, later favours.
  const fitted = smilers(S);
  if (fitted > 0) {
    S.smileT = (S.smileT || 0) + dt * fitted / st.smile;
    while (S.smileT >= 1) { S.smileT--; if (S.review) S.favours++; else S.pence++; out.push({ type: 'smile' }); }
  }
  // Hoo's clipboard.
  if (S.qTask && taskBlock(S, S.queue.find(q => q.id === S.qTask) || { id: S.qTask })) S.qTask = null;
  if (!S.qTask) startTask(S);
  if (S.qTask) {
    S.qProg += dt / taskTime(S, S.qTask);
    if (S.qProg >= 1) { const id = S.qTask; S.qTask = null; S.qProg = 0; finishTask(S, id, out); startTask(S); }
  }
  // The night staff.
  if (S.review) {
    const J = S.jobs, P = S.jobProg;
    P.scrounge += J.scrounge * st.scroungeRate * dt;
    while (P.scrounge >= 1) { P.scrounge--; S.raw++; out.push({ type: 'scrounge' }); }
    P.cover += J.cover * st.coverRate * dt;
    while (P.cover >= 1) { P.cover--; S.favours++; out.push({ type: 'cover', who: 'staff' }); }
    P.tune += J.tune * st.staffTune * dt;
    while (P.tune >= 1) {
      const n = autoNote(S, st.staffClonk);
      if (S.raw < 1 || n == null) { P.tune = Math.min(P.tune, 1); break; }
      P.tune--;
      if (Math.random() < st.staffEar) { S.raw--; place(S, n, false, out); out.push({ type: 'autotune', who: 'staff', note: n }); }
      else out.push({ type: 'automiss', who: 'staff' });
    }
  }
  // The hidden mechanic, if nobody's found it: the “?” slots sit between the lines.
  const p = plan(S);
  if (!S.clonk && p && p.notes.some((n, i) => isClonk(n) && !S.slots[i])) {
    S.clonkWait += dt;
    if (S.clonkWait > 90 && !S.clonkHinted) { S.clonkHinted = true; out.push({ type: 'clonkhint' }); }
  }
  return out;
}
// Assign one staff member to a job (+1) or take one off (-1); spare staff sit in the staff room.
export const idle = S => S.staff - Object.values(S.jobs).reduce((a, b) => a + b, 0);
export function assign(S, job, d) {
  if (d > 0 && idle(S) < 1) return false;
  if (d < 0 && S.jobs[job] < 1) return false;
  S.jobs[job] += d; return true;
}

// While you were away: the clipboard and the staff keep going, at a gentler pace.
export function offline(S, secs) {
  if (S.ended || secs < 60) return null;
  const credit = Math.min(secs, OFFLINE_CAP) * OFFLINE_RATE;
  const before = { pence: S.pence, favours: S.favours, raw: S.raw, installed: S.installed, plan: S.plan };
  const out = [];
  for (let t = 0; t < credit; t += 1) step(S, 1, out);
  return {
    secs: credit, pence: S.pence - before.pence, favours: S.favours - before.favours, raw: S.raw - before.raw,
    installed: S.installed - before.installed, pranks: S.plan - before.plan, review: out.some(e => e.type === 'review'),
  };
}
