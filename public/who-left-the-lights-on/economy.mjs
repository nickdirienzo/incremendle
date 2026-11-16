// Who Left the Lights On? The rules. Imported by index.html and by sim.mjs, so the pacing sim plays the real game.
//
// Dobbin's Hollow caravan park, after lights-out. Mr Dobbin screwed his LIGHTS OUT AT 10 sign to the wastebasket
// by the taps. Fireflies sleep in the bin's damp, dark bottom, so the bin flips them out with its lid, along
// paths the player draws, into dark windows. A firefly in a window looks just like a light left on: Dobbin
// storms over to shout LIGHTS OUT at it, and the campers gossip. Gossip is swapped at the taps for upgrades.
// Every flight lights up the dark park as it goes. It ends when all eight billion people have heard.

export const W = 1000, H = 640;                 // the park, in world units
export const BIN = { x: 120, y: 336 };
export const HOME = { x: 926, y: 524 };          // Dobbin's bungalow door
export const CELL = 20, GW = W / CELL, GH = H / CELL;
export const WORLD = 8e9;                         // everyone on Earth

// Zones of the park, from the bin outwards. base: gossip a second from one lit window there.
export const ZONES = [
  { id: 'block', name: 'the shower block', base: 1 },
  { id: 'meadow', name: 'the tent meadow', base: 3 },
  { id: 'row', name: 'caravan row', base: 20 },
  { id: 'woods', name: 'the yurts in the woods', base: 150 },
  { id: 'club', name: 'the clubhouse', base: 1000 },
];

// Every window in the park. kind draws it; open: occupied from the start (the rest are free pitches that
// fill as word gets round and campers book them).
const T = (id, zone, kind, x, y, name, open = true) => ({ id, zone, kind, x, y, name, open });
export const TARGETS = [
  T('s1', 0, 'block', 72, 248, 'the ladies’ showers'),
  T('s2', 0, 'block', 150, 248, 'the gents’ showers'),
  T('t1', 1, 'tent', 252, 222, 'the Pargeters’ tent'),
  T('t2', 1, 'tent', 258, 452, 'the scout leader’s tent'),
  T('t3', 1, 'tent', 340, 322, 'the honeymooners’ tent'),
  T('t4', 1, 'tent', 336, 140, 'pitch 4', false),
  T('t5', 1, 'tent', 330, 536, 'pitch 5', false),
  T('t6', 1, 'tent', 410, 222, 'pitch 6', false),
  T('t7', 1, 'tent', 414, 424, 'pitch 7', false),
  T('t8', 1, 'tent', 262, 66, 'pitch 8', false),
  T('t9', 1, 'tent', 420, 592, 'pitch 9', false),
  T('c1', 2, 'caravan', 494, 254, 'the Okonkwos’ caravan'),
  T('c2', 2, 'caravan', 494, 394, 'Nana Vee’s caravan'),
  T('c3', 2, 'caravan', 604, 112, 'caravan 3', false),
  T('c4', 2, 'caravan', 604, 254, 'caravan 4', false),
  T('c5', 2, 'caravan', 604, 394, 'caravan 5', false),
  T('c6', 2, 'caravan', 494, 112, 'caravan 6', false),
  T('c7', 2, 'caravan', 494, 534, 'caravan 7', false),
  T('c8', 2, 'caravan', 604, 534, 'caravan 8', false),
  T('y1', 3, 'yurt', 704, 300, 'the yoga yurt'),
  T('y2', 3, 'yurt', 786, 184, 'the birdwatchers’ yurt'),
  T('y3', 3, 'yurt', 790, 412, 'yurt 3', false),
  T('y4', 3, 'yurt', 702, 86, 'yurt 4', false),
  T('y5', 3, 'yurt', 704, 540, 'yurt 5', false),
  T('y6', 3, 'yurt', 798, 574, 'yurt 6', false),
  T('y7', 3, 'yurt', 796, 50, 'yurt 7', false),
  T('k1', 4, 'club', 856, 122, 'the clubhouse bar'),
  T('k2', 4, 'club', 906, 122, 'the clubhouse kitchen'),
  T('k3', 4, 'club', 956, 122, 'the function room', false),
  T('k4', 4, 'club', 856, 206, 'the snooker room', false),
  T('k5', 4, 'club', 906, 206, 'the bingo hall', false),
  T('k6', 4, 'club', 956, 206, 'the games room', false),
  T('b1', 4, 'home', 880, 452, 'Dobbin’s front room'),
  T('b2', 4, 'home', 950, 452, 'Dobbin’s bedroom'),
];
export const TG = Object.fromEntries(TARGETS.map(t => [t.id, t]));

// Things in the dark, found by flying over them. Each one gets the whole park talking: gossip ×1.25 for good.
export const FINDS = [
  { id: 'sock', x: 196, y: 560, name: 'A single walking sock', text: 'A walking sock, damp, on its own in the long grass. Whose? WHOSE? Nobody will admit to it. Three tents have already fallen out over it.' },
  { id: 'letter', x: 446, y: 30, name: 'A letter signed “D.”', text: '“Mavis, the lights by your caravan were the prettiest thing I’ve seen in forty years. D.” Mavis left in 1987. The paper is very, very old. Everybody has read it twice.' },
  { id: 'notebook', x: 552, y: 604, name: 'A boy’s notebook', text: 'A school exercise book, swollen with dew. On the last page, in pencil: “If you make them go round in a ring they all blink at the SAME TIME.” A drawing of a loop. Signed D.D., age 9.' },
  { id: 'photo', x: 748, y: 30, name: 'An old photo', text: 'A photo in a tin: a boy with a jam jar full of fireflies, grinning outside a caravan, and behind him a man in a dressing gown, shouting, absolutely furious. On the back: “Dad and me. Lights out!!”' },
  { id: 'catapult', x: 846, y: 330, name: 'A catapult carved “D.D.”', text: 'A catapult under the clubhouse steps, the elastic long gone, carved with two letters: D.D. The scout leader says it stands for Dobbin the Dreadful. She says her mum told her. She says it like it’s nothing.' },
  { id: 'sign', x: 978, y: 300, name: 'The first LIGHTS OUT sign', text: 'Behind the bungalow, face down in the nettles: a much older sign. “LIGHTS OUT AT 10. THAT MEANS YOU, DOBBIN.” In a different handwriting. His dad’s.' },
];
export const FIND = Object.fromEntries(FINDS.map(f => [f.id, f]));

// Who's heard, as the meter fills. Labels on the meter.
export const REACH = [
  { at: 0, name: 'pitch 7' },
  { at: 2e3, name: 'the whole park' },
  { at: 2e5, name: 'the village' },
  { at: 2e7, name: 'the county' },
  { at: 7e8, name: 'the country' },
  { at: WORLD, name: 'the whole world' },
];

// ---------- Upgrades ----------
// kind: lv (levelled), one (one-time), odd (silly one-off), pitch (a camper books a free pitch in a zone).
const U = o => ({ kind: 'lv', ...o });
export const ITEMS = [
  U({ id: 'bait', name: 'Overripe Peach', base: 12, grow: 1.5, cap: 36, z: 0,
    desc: 'A soft peach for the bottom of the bin. Fireflies come for the damp and stay for the fruit: one more firefly lives in the bin.',
    joke: 'Nobody else wants a peach that soft. That is exactly the point.' }),
  U({ id: 'range', name: 'Sugar Water', base: 30, grow: 2.05, cap: 14, z: 0,
    desc: 'A bottle cap of sugar water in the bin. Fed fireflies fly further before they want to turn back: a longer thread.',
    joke: 'The bin took it from a toddler’s juice box, which is not a crime if you are a bin.' }),
  U({ id: 'fan', name: 'Paper Fan', base: 160, grow: 2.6, cap: 10, z: 1,
    desc: 'A fan folded from a crisp packet, taped to the lid. Every flick sends them off faster.',
    joke: 'Salt and vinegar. The fireflies have opinions about the smell.' }),
  U({ id: 'mega', name: 'Megaphone for Dobbin', base: 60, grow: 1.3, cap: 120, z: 0,
    desc: 'Swap Dobbin’s megaphone for a slightly louder one while he isn’t looking. Every LIGHTS OUT wakes more campers: more gossip per shout.',
    joke: 'He hasn’t noticed it’s a different colour. He has noticed he’s hoarse.' }),
  U({ id: 'coffee', name: 'Dobbin’s Coffee', base: 400, grow: 2.1, cap: 16, z: 1,
    desc: 'Leave a flask of strong coffee on his porch. Dobbin storms about faster: he gets to every light sooner, and shouts more often.',
    joke: 'He drinks the lot. He says it’s from the Residents’ Committee. There is no Residents’ Committee.' }),
  U({ id: 'dim', name: 'Flat Batteries', base: 900, grow: 3.1, cap: 6, z: 1,
    desc: 'Swap the batteries in Dobbin’s torch for some from the bottom of the bin. His beam is shorter, so fewer fireflies get caught in it.',
    joke: 'He shakes the torch. He hits the torch. The torch, like the bin, keeps its own counsel.' }),
  U({ id: 'lid', kind: 'one', name: 'Clockwork Lid', base: 700, z: 1,
    desc: 'A wind-up spring for the lid: pin paths you’ve flown as standing orders, and the lid flicks them again by itself, top order first, whenever the window is dark and the way is clear.',
    joke: 'It ticks. Dobbin has put his ear to the bin twice. The bin has held its breath twice.' }),
  U({ id: 'wind', name: 'Wind the Key', base: 1500, grow: 2.2, cap: 8, z: 1, need: 'lid',
    desc: 'Another turn of the clockwork key: the lid flicks its orders more often.',
    joke: 'Righty-tighty. The bin does not have hands. Nobody asks how.' }),
  U({ id: 'notes', name: 'Sticky Note', base: 2200, grow: 3.4, cap: 5, z: 1, need: 'lid',
    desc: 'One more sticky note on the side of the bin: room to pin one more standing order.',
    joke: 'Yellow. The bin thinks it looks organised. The bin thinks a lot of things.' }),
  // Word gets round: campers who hear about the lights come and book the free pitches. More windows.
  { id: 'pitch1', kind: 'pitch', zone: 1, name: 'Book a Tent Pitch', base: 40, grow: 1.46, z: 1,
    desc: 'Word gets round, and another family books a pitch in the tent meadow to see the famous lights. One more tent, one more window.',
    joke: 'They’ve brought a gazebo. Nobody in the history of camping has brought a gazebo and been quiet.' },
  { id: 'pitch2', kind: 'pitch', zone: 2, name: 'Book a Caravan', base: 3000, grow: 1.46, z: 2,
    desc: 'Another caravan tows in to caravan row, because somebody’s cousin said the lights were something else. One more window.',
    joke: 'It takes forty minutes to reverse in. Everybody watches. Nobody helps. This is caravanning.' },
  { id: 'pitch3', kind: 'pitch', zone: 3, name: 'Book a Yurt', base: 1.5e5, grow: 1.5, z: 3,
    desc: 'Somebody books one of the yurts in the woods for a whole week, “for the lights”. One more window.',
    joke: 'They have a sound bowl. They will be playing the sound bowl.' },
  { id: 'pitch4', kind: 'pitch', zone: 4, name: 'Book the Clubhouse', base: 6e6, grow: 1.55, z: 4,
    desc: 'Somebody books a room at the clubhouse for a do (a fortieth, a quiz night, a wake), so they can watch the lights from inside. One more window.',
    joke: 'The quiz has a round on the lights now. Nobody gets any of it right. Dobbin wrote it.' },
  // Further and further: the gossip leaves the park. Everything earns more.
  { id: 'fire', kind: 'one', name: 'A Campfire', base: 250, z: 1, mult: 2,
    desc: 'Drag a few sticks into a ring in the meadow. Campers gather round it to swap stories about the lights: all gossip ×2.',
    joke: 'Somebody has a guitar. Somebody always has a guitar.' },
  { id: 'post', kind: 'one', name: 'Postcards', base: 9000, z: 2, mult: 2,
    desc: 'A rack of postcards of the park at night by the taps. Campers send them home: all gossip ×2.',
    joke: '“Wish you were here. Dobbin shouted at us again. The lights were on, but they also weren’t.”' },
  { id: 'paper', kind: 'one', name: 'The Local Paper', base: 2.5e6, z: 3, mult: 3,
    desc: 'Leave the park’s newsletter where the local reporter can find it. MYSTERY LIGHTS BAFFLE LANDLORD: all gossip ×3.',
    joke: 'Page seven, under a marrow. A very large marrow. It has been a big week for the marrow.' },
  { id: 'radio', kind: 'one', name: 'Late-Night Radio', base: 2e8, z: 4, mult: 3,
    desc: 'Tune the clubhouse radio to the phone-in and leave the phone off the hook. The whole country listens in: all gossip ×3.',
    joke: 'The host asks Dobbin if he has tried turning it off and on again. Dobbin says some words.' },
  // Silly one-offs: for Dobbin, mostly. They do nothing. You can see them.
  { id: 'hat', kind: 'odd', name: 'Captain’s Hat', base: 25, z: 0,
    desc: 'A tiny captain’s hat from a cracker, for the bin.',
    joke: 'The bin is now captain of the park. Nobody appointed it. That has never stopped a captain.' },
  { id: 'cap', kind: 'odd', name: 'Nightcap with a Bell', base: 350, z: 1,
    desc: 'Swap Dobbin’s nightcap for one with a little bell on the end.',
    joke: 'Now you can hear him coming. Ting. Ting. LIGHTS OUT. Ting. The meadow has never had so much fun.' },
  { id: 'hike', kind: 'odd', name: 'Take a Hike Day', base: 1800, z: 1,
    desc: 'A leaflet from the noticeboard for Take a Hike Day (17 November, every year), stuck to the back of Dobbin’s dressing gown.',
    joke: 'He has worn it for three nights. Everyone he shouts at reads it as he walks away. TAKE A HIKE, it says, with a little boot.' },
  { id: 'cushion', kind: 'odd', name: 'Whoopee Cushion', base: 16000, z: 2,
    desc: 'A whoopee cushion, under the cushion on Dobbin’s porch chair.',
    joke: 'He sits down after every round. Caravan row has started waiting up for it.' },
  { id: 'gnome', kind: 'odd', name: 'Gnome in a Dressing Gown', base: 6e5, z: 3,
    desc: 'A garden gnome in a little tartan dressing gown, by the woods, holding a tiny torch.',
    joke: 'Dobbin has told it LIGHTS OUT twice. The second time he apologised.' },
  { id: 'onsign', kind: 'odd', name: 'LIGHTS ON AT 10', base: 4e7, z: 4,
    desc: 'A second sign, hung on the bin under Dobbin’s: LIGHTS ON AT 10.',
    joke: 'Dobbin read it for a long time. Then he laughed. Just once, and short, like a cough. Caravan row is still talking about it.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// ---------- State ----------
export function fresh() {
  const fog = Array(GW * GH).fill(0);
  const S = {
    g: 0, life: 0, t: 0, lv: {}, one: {}, seen: [], fog: '', n: 3, flights: [], lit: {}, open: {},
    dob: { x: 300, y: 336, a: Math.PI, shout: 0, target: null, idle: 0 },
    crowd: {}, jar: [], orders: [], lidT: 0, finds: [], syncFound: false, avg: 0, launches: 0, shouts: 0, caught: 0,
    finale: false, ended: false, choice: null, endT: 0, savedAt: 0, told: {}, boughtOpen: false,
  };
  for (const t of TARGETS) if (t.open) S.open[t.id] = 1;
  S.fog = fog.join('');
  reveal(S, BIN.x, BIN.y, 130);
  reveal(S, 110, 240, 90);
  return S;
}
export function load(raw) {
  const S = fresh();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(raw)) if (k in S) S[k] = raw[k];
    S.dob = { ...fresh().dob, ...(raw.dob || {}) };
    S.lv = { ...(raw.lv || {}) }; S.one = { ...(raw.one || {}) };
    if (typeof S.fog !== 'string' || S.fog.length !== GW * GH) S.fog = fresh().fog;
    if (S.ended) finishedWorld(S);
  }
  return S;
}
// A save that is only { ended: true } opens on the finished park: everything built, all of it lit.
function finishedWorld(S) {
  S.fog = '1'.repeat(GW * GH);
  for (const t of TARGETS) S.open[t.id] = 1;
  for (const f of FINDS) if (!S.finds.includes(f.id)) S.finds.push(f.id);
  for (const it of ITEMS) {
    if (it.kind === 'one' || it.kind === 'odd') S.one[it.id] = 1;
    else if (it.kind === 'lv' && !S.lv[it.id]) S.lv[it.id] = Math.min(it.cap, 6);
  }
  if (S.life < WORLD) S.life = WORLD;
  S.n = 0; S.flights = []; S.jar = [];
  S.lit = Object.fromEntries(TARGETS.map(t => [t.id, { sync: 1 }]));
  if (!S.choice) S.choice = 'keys';
  S.syncFound = true;
}

// ---------- Fog ----------
export const fogAt = (S, cx, cy) => cx >= 0 && cy >= 0 && cx < GW && cy < GH && S.fog[cy * GW + cx] === '1';
export const seenAt = (S, x, y) => fogAt(S, Math.floor(x / CELL), Math.floor(y / CELL));
export function reveal(S, x, y, r) {
  let f = null, any = false;
  const c0 = Math.max(0, Math.floor((x - r) / CELL)), c1 = Math.min(GW - 1, Math.floor((x + r) / CELL));
  const r0 = Math.max(0, Math.floor((y - r) / CELL)), r1 = Math.min(GH - 1, Math.floor((y + r) / CELL));
  for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) {
    const i = cy * GW + cx;
    if (S.fog[i] === '1') continue;
    const dx = (cx + 0.5) * CELL - x, dy = (cy + 0.5) * CELL - y;
    if (dx * dx + dy * dy > r * r) continue;
    f ??= S.fog.split(''); f[i] = '1'; any = true;
  }
  if (any) S.fog = f.join('');
  return any;
}
export const revealed = S => { let n = 0; for (const c of S.fog) if (c === '1') n++; return n / (GW * GH); };
export const known = (S, id) => seenAt(S, TG[id].x, TG[id].y);
export const zone = S => {
  let z = 0;
  for (const t of TARGETS) if (t.zone > z && known(S, t.id)) z = t.zone;
  return z;
};
export const phaseKey = S => S.ended ? (S.choice === 'lid' ? 'lid' : 'keys') : `p${zone(S) + 1}`;

// ---------- Numbers ----------
export const lv = (S, id) => S.lv[id] || 0;
export const fireflies = S => 3 + lv(S, 'bait');
export const range = S => 210 + 60 * lv(S, 'range');
// Each sip of sugar water costs what it costs: the thread's length is what opens the park, zone by zone.
export const RANGE_COST = [60, 700, 50000, 1.5e5, 4e5, 1e6, 6e6, 1.8e7, 4.5e7, 1.8e8, 4.5e8, 1e9, 2e9, 3.5e9];
export const speed = S => 150 * (1 + 0.16 * lv(S, 'fan'));
export const dobSpeed = S => 62 * (1 + 0.12 * lv(S, 'coffee'));
export const beamLen = S => 130 * Math.pow(0.85, lv(S, 'dim'));
export const BEAM_HALF = 0.42;
export const lidEvery = S => 6 * Math.pow(0.8, lv(S, 'wind'));
export const slots = S => (S.one.lid ? 2 + lv(S, 'notes') : 0);
export const megaMul = S => Math.pow(1.06, lv(S, 'mega'));
export const SHOUT_SECS = 18;   // a shout is worth this many seconds of the window's gossip (before the megaphone)
export const reachMul = S => ITEMS.filter(i => i.mult && S.one[i.id]).reduce((m, i) => m * i.mult, 1);
export const findMul = S => Math.pow(1.25, S.finds.length);
export const SYNC = 2;
export const allMul = S => reachMul(S) * findMul(S);
// Campers per window: once a zone's pitches are all booked, more families squeeze in (each one ×1.07 gossip there).
export const crowd = (S, z) => (S.crowd && S.crowd[z]) || 0;
export const crowdMul = (S, z) => Math.pow(1.08, crowd(S, z));
export const rate = (S, id, sync = S.lit[id]?.sync) => ZONES[TG[id].zone].base * crowdMul(S, TG[id].zone) * allMul(S) * (sync ? SYNC : 1);
export const burst = (S, id) => rate(S, id) * SHOUT_SECS * megaMul(S);
export const litRate = S => Object.keys(S.lit).reduce((a, id) => a + rate(S, id), 0);
export const free = (S, z) => TARGETS.filter(t => t.zone === z && !S.open[t.id]);
export const booked = (S, z) => TARGETS.filter(t => t.zone === z && !t.open && S.open[t.id]).length;
export const CROWD_CAP = 40;
export const reachName = S => { let r = REACH[0]; for (const x of REACH) if (S.life >= x.at) r = x; return r.name; };

export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'pitch') return Math.round(it.base * Math.pow(it.grow, booked(S, it.zone) + crowd(S, it.zone)));
  if (id === 'range') return RANGE_COST[lv(S, id)];
  if (it.kind === 'lv') return Math.round(it.base * Math.pow(it.grow, lv(S, id)));
  return it.base;
}
export function maxed(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'lv') return lv(S, id) >= it.cap;
  if (it.kind === 'pitch') return crowd(S, it.zone) >= CROWD_CAP;
  return !!S.one[id];
}
// Which upgrades have turned up. Once seen, an upgrade stays until it's bought.
function available(S, it) {
  const z = zone(S);
  if (it.z > z) return false;
  if (it.need && !S.one[it.need]) return false;
  if (it.id === 'bait') return S.launches >= 2 || S.life >= 5;
  if (it.id === 'mega') return S.shouts >= 1;
  if (it.id === 'hat') return S.shouts >= 3;
  if (it.id === 'range') return S.launches >= 3;
  if (it.kind === 'pitch') return S.life >= it.base * 0.4;
  return true;
}
export function reveals(S) {
  const fresh = [];
  for (const it of ITEMS) if (!S.seen.includes(it.id) && available(S, it)) { S.seen.push(it.id); fresh.push(it.id); }
  return fresh;
}
export const items = S => ITEMS.filter(i => S.seen.includes(i.id) && !(i.kind !== 'lv' && i.kind !== 'pitch' && S.one[i.id]) && !(i.kind === 'pitch' && maxed(S, i.id)));
export const bought = S => ITEMS.filter(i => (i.kind === 'one' || i.kind === 'odd') && S.one[i.id]);
export const canBuy = (S, id) => !maxed(S, id) && S.g >= cost(S, id) && S.seen.includes(id);
export function buy(S, id) {
  if (!canBuy(S, id)) return null;
  const it = BY_ID[id], c = cost(S, id);
  S.g -= c;
  if (it.kind === 'lv') { S.lv[id] = lv(S, id) + 1; if (id === 'bait') S.n++; }
  else if (it.kind === 'pitch') {
    const t = free(S, it.zone)[0];
    if (!t) { S.crowd = { ...(S.crowd || {}), [it.zone]: crowd(S, it.zone) + 1 }; return id; }
    S.open[t.id] = 1; reveal(S, t.x, t.y, 40); return t.id;
  }
  else S.one[id] = 1;
  return id;
}

// ---------- Paths ----------
export function pathLen(p) { let L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
function cross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}
// A path that crosses itself makes a ring: the firefly goes round it, and blinks in time with the others.
export function loops(p) {
  for (let i = 0; i + 1 < p.length; i++) for (let j = i + 2; j + 1 < p.length; j++) if (cross(p[i], p[i + 1], p[j], p[j + 1])) return true;
  return false;
}
export function targetAt(S, x, y, r = 26) {
  let best = null, bd = r;
  for (const t of TARGETS) {
    if (!S.open[t.id]) continue;
    const d = Math.hypot(t.x - x, t.y - y);
    if (d < bd) { bd = d; best = t.id; }
  }
  return best;
}
export function inBeam(S, x, y, pad = 0) {
  const d = S.dob, dx = x - d.x, dy = y - d.y, L = Math.hypot(dx, dy);
  if (L > beamLen(S) + pad) return false;
  if (L < 14 + pad) return true;
  let da = Math.atan2(dy, dx) - d.a;
  da = Math.atan2(Math.sin(da), Math.cos(da));
  return Math.abs(da) < BEAM_HALF + pad / Math.max(L, 1);
}
export const pathClear = (S, p, pad = 12) => {
  for (let i = 1; i < p.length; i++) {
    const [ax, ay] = p[i - 1], [bx, by] = p[i], n = Math.ceil(Math.hypot(bx - ax, by - ay) / 12);
    for (let k = 0; k <= n; k++) if (inBeam(S, ax + (bx - ax) * k / n, ay + (by - ay) * k / n, pad)) return false;
  }
  return true;
};
const inbound = (S, id) => S.flights.some(f => f.kind === 'out' && f.target === id);

// Launch one firefly along a path that starts at the bin. Returns the flight, or null.
export function launch(S, path, { auto = false } = {}) {
  if (S.n <= 0 || S.ended || S.finale || path.length < 2) return null;
  const end = path[path.length - 1];
  const target = targetAt(S, end[0], end[1]);
  const f = { kind: 'out', path: path.map(p => [Math.round(p[0]), Math.round(p[1])]), d: 0, target, sync: loops(path), auto };
  if (target) f.path[f.path.length - 1] = [TG[target].x, TG[target].y];
  f.len = pathLen(f.path);
  S.n--; S.launches++;
  S.flights.push(f);
  return f;
}
export function pin(S, path, target) {
  if (!target || S.orders.length >= slots(S)) return false;
  if (S.orders.some(o => o.target === target)) return false;
  S.orders.push({ path: path.map(p => [Math.round(p[0]), Math.round(p[1])]), target, sync: loops(path) });
  return true;
}
export function posAt(f) {
  let d = f.d;
  for (let i = 1; i < f.path.length; i++) {
    const [ax, ay] = f.path[i - 1], [bx, by] = f.path[i], L = Math.hypot(bx - ax, by - ay);
    if (d <= L) { const u = L ? d / L : 1; return [ax + (bx - ax) * u, ay + (by - ay) * u]; }
    d -= L;
  }
  return f.path[f.path.length - 1];
}
const home = (S, x, y) => ({ kind: 'back', path: [[x, y], [BIN.x, BIN.y]], d: 0, len: Math.hypot(BIN.x - x, BIN.y - y) });

// ---------- A path for the keyboard (and the pacing sim) ----------
// The best path a careful player would draw to a window: straight if the torch allows, else bent round it,
// with a loop before the window once the trick is known.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const norm = a => { const L = Math.hypot(a[0], a[1]) || 1; return [a[0] / L, a[1] / L]; };

// A loop just before the window: forward, up and round, back down across the line, then on in.
function withLoop(path) {
  const T = path[path.length - 1], P = path[path.length - 2];
  const dir = norm(sub(T, P)), perp = [-dir[1], dir[0]];
  const C = sub(T, mul(dir, 70));
  const pts = [sub(C, mul(dir, 30)), add(C, mul(dir, 20)), add(add(C, mul(dir, 20)), mul(perp, 34)), add(sub(C, mul(dir, 10)), mul(perp, 34)), sub(sub(C, mul(dir, 10)), mul(perp, 20)), T];
  return [...path.slice(0, -1), ...pts];
}
export function autoPath(S, id, { loop = S.syncFound } = {}) {
  const B = [BIN.x, BIN.y], T = [TG[id].x, TG[id].y];
  const R = range(S);
  const tries = [[B, T]];
  const dir = norm(sub(T, B)), perp = [-dir[1], dir[0]], M = mul(add(B, T), 0.5);
  for (const k of [70, -70, 130, -130, 200, -200]) tries.push([B, add(M, mul(perp, k)), T]);
  for (const base of tries) {
    for (const p of loop ? [withLoop(base), base] : [base]) {
      if (pathLen(p) <= R && pathClear(S, p, 14)) return p;
    }
  }
  return null;
}

// ---------- Tick ----------
// Returns what happened, for sounds and log lines.
export function tick(S, dt) {
  const ev = { lit: [], shout: [], caught: 0, home: 0, finds: [], sync: [], gain: 0, auto: 0, explored: 0, zone: null, finale: false };
  if (S.ended) return ev;
  S.t += dt;
  const z0 = zone(S);
  // Flights.
  const sp = speed(S);
  for (let i = S.flights.length - 1; i >= 0; i--) {
    const f = S.flights[i];
    f.d += sp * dt * (f.kind === 'out' ? 1 : 1.3);
    const [x, y] = posAt(f);
    f.x = x; f.y = y;
    if (f.kind === 'out') {
      if (reveal(S, x, y, 46)) {
        ev.explored++;
        for (const fd of FINDS) if (!S.finds.includes(fd.id) && seenAt(S, fd.x, fd.y)) {
          S.finds.push(fd.id); ev.finds.push(fd.id);
          if (fd.id === 'notebook') S.syncFound = true;
        }
      }
      if (inBeam(S, x, y)) { S.flights.splice(i, 1); S.jar.push({ t: 5 }); S.caught++; ev.caught++; continue; }
    }
    if (f.d >= f.len) {
      S.flights.splice(i, 1);
      if (f.kind === 'out' && f.target && !S.lit[f.target]) {
        S.lit[f.target] = f.sync ? { sync: 1 } : {};
        ev.lit.push(f.target);
        if (f.sync) { ev.sync.push(f.target); if (!S.syncFound) S.syncFound = true; }
      } else if (f.kind === 'out') S.flights.push(home(S, x, y));
      else { S.n = Math.min(fireflies(S), S.n + 1); ev.home++; }
    }
  }
  // Caught fireflies: Dobbin looks at the jar, sighs, and lets them go. He always does.
  for (let i = S.jar.length - 1; i >= 0; i--) {
    S.jar[i].t -= dt;
    if (S.jar[i].t <= 0) { S.jar.splice(i, 1); S.flights.push(home(S, S.dob.x, S.dob.y)); }
  }
  // Gossip from every lit window.
  const lr = litRate(S);
  if (lr) { S.g += lr * dt; S.life += lr * dt; ev.gain += lr * dt; }
  // Dobbin.
  const d = S.dob, ds = dobSpeed(S);
  if (S.finale) {
    // He walks to the bin. He knows.
    const dx = BIN.x + 34 - d.x, dy = BIN.y + 6 - d.y, L = Math.hypot(dx, dy);
    if (L > 2) { const s = Math.min(L, ds * 0.5 * dt); d.x += dx / L * s; d.y += dy / L * s; d.a = Math.atan2(dy, dx); }
    else d.a = Math.PI;
    return ev;
  }
  if (d.shout > 0) {
    d.shout -= dt;
    if (d.shout <= 0) {
      const id = d.target;
      if (id && S.lit[id]) { delete S.lit[id]; S.flights.push(home(S, TG[id].x, TG[id].y - 8)); }
      d.target = null;
    }
  } else {
    let best = null, bd = Infinity;
    for (const id of Object.keys(S.lit)) { const t = TG[id], dd = Math.hypot(t.x - d.x, t.y + 16 - d.y); if (dd < bd) { bd = dd; best = id; } }
    if (best) {
      d.target = best; d.idle = 0;
      const t = TG[best], tx = t.x, ty = t.y + 18, dx = tx - d.x, dy = ty - d.y, L = Math.hypot(dx, dy);
      if (L <= 4) {
        d.shout = 1.3; d.a = Math.atan2(t.y - d.y, t.x - d.x);
        const b = burst(S, best);
        S.g += b; S.life += b; ev.gain += b; S.shouts++;
        ev.shout.push({ id: best, b });
      } else {
        const s = Math.min(L, ds * dt); d.x += dx / L * s; d.y += dy / L * s;
        turn(d, Math.atan2(dy, dx), dt * 5);
      }
    } else {
      d.idle += dt;
      if (d.idle > 4) {
        const dx = HOME.x - d.x, dy = HOME.y - d.y, L = Math.hypot(dx, dy);
        if (L > 3) { const s = Math.min(L, ds * 0.45 * dt); d.x += dx / L * s; d.y += dy / L * s; turn(d, Math.atan2(dy, dx), dt * 3); }
      }
    }
  }
  // The clockwork lid.
  if (S.one.lid && S.orders.length) {
    S.lidT += dt;
    if (S.lidT >= lidEvery(S)) {
      const o = S.n > 0 && S.orders.find(o => !S.lit[o.target] && !inbound(S, o.target) && pathClear(S, o.path));
      if (o) { launch(S, o.path, { auto: true }); S.lidT = 0; ev.auto++; }
      else S.lidT = lidEvery(S);   // keeps checking until one can go
    }
  }
  S.avg += (ev.gain / Math.max(dt, 1e-3) - S.avg) * Math.min(1, dt / 60);
  const z1 = zone(S);
  if (z1 !== z0) ev.zone = z1;
  if (S.life >= WORLD && !S.finale) { S.finale = true; ev.finale = true; S.flights = []; S.jar = []; }
  return ev;
}
function turn(d, to, k) {
  let da = to - d.a; da = Math.atan2(Math.sin(da), Math.cos(da));
  d.a += da * Math.min(1, k);
}

// ---------- Away ----------
// Time away: Dobbin's asleep (mostly), the lit windows keep the campers talking, a quarter as much.
export const AWAY_CAP = 6 * 3600, AWAY_RATE = 0.1;
export function away(S, sec) {
  if (S.ended || S.finale || !(sec > 30)) return null;
  sec = Math.min(sec, AWAY_CAP);
  const per = Math.max(S.avg, litRate(S));
  let g = per * sec * AWAY_RATE;
  // Never past the end: the ending is something you see.
  g = Math.min(g, Math.max(0, WORLD * 0.999 - S.life));
  S.g += g; S.life += g;
  // Everyone who was out comes home to the bin.
  S.flights = S.flights.filter(f => f.kind === 'out'); S.jar = [];
  S.n = Math.max(0, fireflies(S) - Object.keys(S.lit).length - S.flights.length);
  return { sec, g };
}
