// Rain Stops Play: the rules. The page and the pacing sim (sim.mjs) both import this.
// Reg, the pavilion loudspeaker, has a raw throat. The 1703 almanac's cure is egg oil: hard yolks rubbed
// in a mortar until the oil sweats out. Hens lay into a copper still, broody hens hatch hens, roosters set
// hens broody (producers making producers). Doses of oil fill Reg's Comfort. Sun and rain take turns:
// rain doubles the coop's hatching and stops play. At Comfort 4 the season opens beside the hen run: rub
// the ball shiny, the bowler bowls, Reg calls it, the crowd cheers. Comfort 10 and the last fixture make
// the Final.

// ---------- Weather ----------
// One cycle of sun then rain. Rain is shorter, and it is the coop's favourite part.
export const CYCLE = 150, RAIN_AT = 105;
export const raining = S => !S.finale && (S.wt % CYCLE) >= RAIN_AT;
export const untilChange = S => { const p = S.wt % CYCLE; return p < RAIN_AT ? RAIN_AT - p : CYCLE - p; };

// ---------- The coop ----------
export const LAY = 0.35;          // drops a second from one hen's eggs, through the still
export const HATCH = 1 / 50;      // hens a second hatched by one broody
export const BROOD = 1 / 160;      // broodies a second set sitting by one rooster
export const RAIN_COOP = 2;       // rain keeps everyone in the coop: hatching and brooding double

// ---------- The doses ----------
// Comfort 1..10: what each dose costs, in drops, and what Reg says when it goes down.
export const DOSES = [
  { cost: 40, line: 'First dose. Reg clears its throat. It sounds like a goose that has been told some good news.' },
  { cost: 300, line: 'Second dose. The crackle on the high notes is down to a light drizzle.' },
  { cost: 2500, line: 'Third dose. Reg can say “leg before wicket” all the way through without a cough.' },
  { cost: 35000, line: 'Fourth dose. Reg is fit to call again. The club pins up the fixture list. THE SEASON IS ON.' },
  { cost: 90000, line: 'Fifth dose. A butterfly landed on Reg’s horn during an announcement and stayed.' },
  { cost: 250000, line: 'Sixth dose. The groundsman says Reg sounds “almost reasonable”, which from him is a sonnet.' },
  { cost: 700000, line: 'Seventh dose. Reg can whisper now. It has not tried. It is thinking about it.' },
  { cost: 1800000, line: 'Eighth dose. Nearly two million drops of oil in one go. Reg’s horn is so smooth a moth slipped off it.' },
  { cost: 4000000, line: 'Ninth dose. Reg called a dropped catch so gently that the fielder thanked it.' },
  { cost: 8000000, line: 'Tenth dose. Comfort, at last, in full. Reg has never felt better. Reg would like to say so, at length.' },
];
export const SEASON_AT = 4;       // the dose that opens the season

// ---------- The match ----------
export const FIXTURES = [
  { name: 'Lower Pocking', need: 50 },
  { name: 'Much Wenlow', need: 140 },
  { name: 'the Vicarage XI', need: 340 },
  { name: 'Great Ormsby', need: 800 },
  { name: 'the Mothers’ Union', need: 2500 },
  { name: 'Mudlow Town', need: 6000 },
];
export const SHINE_PER_RUB = 0.25;    // four good rubs and the ball is shiny
export const DELIVERY = 5;            // seconds between balls

// ---------- The shop ----------
// cur: 'drops' or 'cheers'. kind: 'make' (producers, buy many), 'lv' (levels), 'one' (once), 'odd' (silly).
export const ITEMS = [
  // The coop and the still room (drops)
  { id: 'hen', cur: 'drops', kind: 'make', name: 'A Hen', base: 10, grow: 1.14,
    desc: 'A laying hen for the run behind the pavilion. Her eggs go into the copper still and come out as oil, on their own.',
    joke: 'AND IT’S A NEW SIGNING FOR THE COOP. She’s a big unit. She has already laid one on the scorer’s chair.' },
  { id: 'pestle', cur: 'drops', kind: 'lv', max: 5, name: 'A Heavier Pestle', costs: [30, 500, 6000, 70000, 700000],
    desc: 'More weight on every turn of the mortar: more oil out of every rub.',
    joke: 'Reg: “A heavier pestle, from the pavilion end. He’s really leaning into it now.”' },
  { id: 'pompom', cur: 'drops', kind: 'odd', name: 'A Pom-Pom', cost: 90,
    desc: 'A woolly pom-pom for the top of Reg’s tiny knitted hat. Nobody remembers who knitted the hat.',
    joke: 'Reg: “And a pom-pom for the commentary box. Reg is looking very sharp this morning, if Reg says so itself.”' },
  { id: 'broody', cur: 'drops', kind: 'make', name: 'A Broody Hen', base: 300, grow: 1.2,
    desc: 'A hen who would rather sit. She hatches chicks, and chicks grow into laying hens. Twice as fast in the rain.',
    joke: 'She has not left the nest since Tuesday. A tremendous piece of concentration from the broody.' },
  { id: 'still', cur: 'drops', kind: 'lv', max: 4, name: 'A Bigger Still', costs: [900, 9000, 120000, 1500000],
    desc: 'More copper, more coil. Every egg the hens lay comes out as twice the oil.',
    joke: 'The still now has more pipework than the pavilion. The pavilion has asked for a word.' },
  { id: 'deckchair', cur: 'drops', kind: 'odd', name: 'Maud’s Deckchair', cost: 2500,
    desc: 'A striped deckchair by the press box for Maud of the Gazette, who reviews Reg every week and has never given more than one star.',
    joke: 'Maud sat in it, wrote “One star. Too loud. I could hear him from the car park,” and stayed in it all afternoon.' },
  { id: 'bale', cur: 'drops', kind: 'one', name: 'A Straw Bale', cost: 4000,
    desc: 'Fresh straw for the nesting boxes. The broodies sit tighter: they hatch half as fast again.',
    joke: 'A STRAW BALE, and the broodies are all over it. Absolute scenes in the coop.' },
  { id: 'rooster', cur: 'drops', kind: 'make', name: 'A Rooster', base: 12000, grow: 1.35,
    desc: 'A rooster for the run: he keeps the eggs fertile and the hens broody. Twice as keen in the rain. He also crows over Reg’s commentary.',
    joke: 'The rooster has crowed over Reg four times this morning. Reg would like the rooster to know there is only one voice of this ground.' },
  { id: 'roohat', cur: 'drops', kind: 'odd', name: 'A Tiny Hat (Rooster)', cost: 25000,
    desc: 'A tiny knitted hat for the rooster, so that Reg is not the only one who looks ridiculous.',
    joke: 'The rooster wore it for ten seconds, then crowed in it. Reg called it a draw.' },
  { id: 'funnel', cur: 'drops', kind: 'one', name: 'A Funnel', cost: 15000,
    desc: 'A tin funnel that sits in Reg’s horn, so less of each dose ends up on the pavilion roof. Doses cost a fifth less.',
    joke: 'Reg now looks like a loudspeaker wearing a hat, wearing a funnel. Reg says it is a look.' },
  { id: 'cups', cur: 'drops', kind: 'odd', name: 'A Second Cup', cost: 200000,
    desc: 'Maud brings a flask of tea to every match, with one cup. This is a second cup, left on her bench. In case.',
    joke: 'Maud looked at the second cup for some time, then wrote something in her notebook and crossed it out.' },
  // The match (cheers)
  { id: 'twelfth', cur: 'cheers', kind: 'lv', max: 5, name: 'Twelfth Man', costs: [25, 120, 450, 1500, 4500],
    desc: 'A lad on the boundary who shines the ball on his trousers between deliveries, so you don’t have to.',
    joke: 'AND THE TWELFTH MAN IS ON. Look at him go. Those trousers will never be white again.' },
  { id: 'bunting', cur: 'cheers', kind: 'lv', max: 3, name: 'Bunting', costs: [40, 400, 3000],
    desc: 'Flags along the boundary rope. The crowd cheers louder under bunting; everyone does.',
    joke: 'Bunting from the pavilion to the sightscreen. The atmosphere here is ELECTRIC. It is also quite breezy.' },
  { id: 'pigeon', cur: 'cheers', kind: 'odd', name: 'A Pigeon', cost: 60,
    desc: 'A pigeon on top of the sightscreen. Every ground has one. This one is ours.',
    joke: 'The pigeon has been on the sightscreen since the first over. A magnificent innings from the pigeon.' },
  { id: 'board', cur: 'cheers', kind: 'one', name: 'The Scoreboard', cost: 220,
    desc: 'Tin numbers for the old scoreboard. Between balls, Reg reads out the score, and the crowd claps along.',
    joke: 'Reg: “The score, for those of you just joining us, is: lots. Lots to some.”' },
  { id: 'roller', cur: 'cheers', kind: 'one', name: 'The Heavy Roller', cost: 900,
    desc: 'Roll the pitch flat: the ball comes through quicker, and the bowler gets through his overs faster.',
    joke: 'The heavy roller has gone out, and so has the groundsman, flat on his back on the outfield, very happy.' },
  { id: 'umpire', cur: 'cheers', kind: 'odd', name: 'A Tiny Hat (Umpire)', cost: 1100,
    desc: 'The umpire has asked, through the proper channels, why only Reg and the rooster get tiny hats.',
    joke: 'Umpire’s call: the hat stays on. The umpire has signalled FOUR, which is how many hats there now are.' },
];
export const BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// When each one turns up.
const REVEAL = {
  hen: S => S.total >= 5,
  pestle: S => S.total >= 20,
  pompom: S => S.total >= 60,
  broody: S => S.comfort >= 1,
  still: S => S.comfort >= 2 || S.hens >= 6,
  deckchair: S => S.comfort >= 2,
  bale: S => S.broodies >= 2,
  rooster: S => S.comfort >= 3,
  roohat: S => S.roosters >= 1,
  funnel: S => S.comfort >= 5,
  cups: S => S.comfort >= 7,
  twelfth: S => season(S),
  bunting: S => season(S),
  pigeon: S => season(S) && S.cheersTotal >= 15,
  board: S => S.fixture >= 1,
  roller: S => S.fixture >= 2,
  umpire: S => S.fixture >= 3,
};

export function defaults() {
  return {
    drops: 0, total: 0, rubs: 0,
    hens: 0, broodies: 0, roosters: 0, hatched: 0,
    comfort: 0,
    cheers: 0, cheersTotal: 0, fixture: 0, fixProg: 0, shine: 0, ballT: 0, balls: 0, runs: 0,
    wt: 0, t: 0,
    lv: Object.fromEntries(ITEMS.filter(i => i.kind === 'lv').map(i => [i.id, 0])),
    one: {}, n: { hen: 0, broody: 0, rooster: 0 },
    seen: {}, tab: 'drops', boughtOpen: false,
    finale: false, ended: false, how: null, savedAt: 0,
  };
}
export function load(raw) {
  const S = defaults();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(S)) if (raw[k] !== undefined) S[k] = (typeof S[k] === 'object' && S[k] && !Array.isArray(S[k])) ? { ...S[k], ...raw[k] } : raw[k];
  }
  // A finished save opens on the finished world: the whole coop, the full season, every prop.
  if (S.ended) {
    S.comfort = DOSES.length; S.fixture = FIXTURES.length;
    S.hens = Math.max(S.hens, 60); S.broodies = Math.max(S.broodies, 12); S.roosters = Math.max(S.roosters, 4);
    for (const it of ITEMS) { if (it.kind === 'lv') S.lv[it.id] = Math.max(S.lv[it.id], it.max); else if (it.kind !== 'make') S.one[it.id] = true; }
  }
  return S;
}

// ---------- Rates ----------
export const season = S => S.comfort >= SEASON_AT;
export const playing = S => season(S) && !raining(S) && S.fixture < FIXTURES.length && !S.ended;
export const rubYield = S => [1, 3, 8, 20, 50, 120][S.lv.pestle];
export const stillMult = S => Math.pow(2, S.lv.still);
export const layRate = S => Math.floor(S.hens) * LAY * stillMult(S);            // drops a second
export const coopMult = S => raining(S) ? RAIN_COOP : 1;
export const hatchRate = S => S.broodies * HATCH * (S.one.bale ? 1.5 : 1) * coopMult(S);   // hens a second
export const broodRate = S => S.roosters * BROOD * coopMult(S);                     // broodies a second
export const doseCost = S => S.comfort >= DOSES.length ? Infinity : Math.round(DOSES[S.comfort].cost * (S.one.funnel ? 0.8 : 1));
// The match
export const voice = S => 1 + 0.25 * Math.max(0, S.comfort - SEASON_AT);            // a better voice, bigger cheers
export const buntMult = S => [1, 1.5, 2.2, 3.2][S.lv.bunting];
export const cheersPer = (S, shine = S.shine) => 4 * (0.25 + shine) * voice(S) * buntMult(S);
export const autoShine = S => 0.06 * S.lv.twelfth;                                   // shine a second
export const deliveryEvery = S => S.one.roller ? 3.5 : DELIVERY;
export const boardRate = S => S.one.board ? 0.3 * voice(S) * buntMult(S) : 0;       // cheers a second, play on
export const fixtureNeed = S => S.fixture < FIXTURES.length ? FIXTURES[S.fixture].need : 0;
export const finalReady = S => S.comfort >= DOSES.length && S.fixture >= FIXTURES.length;
export const phase = S => S.ended ? (S.how === 'rain' ? 'secret' : 'end') : S.finale ? 'final' : !season(S) ? 'yard' : raining(S) ? 'rain' : 'season';

export const fmt = n => {
  n = Math.floor(n);
  if (n < 1e4) return n.toLocaleString('en-GB');
  if (n < 1e6) return Math.floor(n / 1e3).toLocaleString('en-GB') + ',' + String(n % 1e3).padStart(3, '0');
  const u = n < 1e9 ? [1e6, ' million'] : [1e9, ' billion'];
  const v = n / u[0];
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + u[1];
};
export const fmtRate = r => r >= 100 ? fmt(r) : r >= 10 ? r.toFixed(1) : r.toFixed(2).replace(/0$/, '');

// ---------- Actions ----------
function gain(S, d) { S.drops += d; S.total += d; }
// One stroke of the pestle round the mortar.
export function rub(S) {
  const d = rubYield(S);
  gain(S, d); S.rubs++;
  return d;
}
// One rub of the ball on the bowler's trousers.
export function shine(S) {
  if (!playing(S)) return false;
  S.shine = Math.min(1, S.shine + SHINE_PER_RUB);
  return true;
}
export function dose(S) {
  const c = doseCost(S);
  if (S.drops < c) return false;
  S.drops -= c; S.comfort++;
  return true;
}

function cheer(S, c, ev) {
  S.cheers += c; S.cheersTotal += c;
  if (S.fixture < FIXTURES.length) {
    S.fixProg += c;
    if (S.fixProg >= FIXTURES[S.fixture].need) { S.fixProg = 0; S.fixture++; ev.push({ type: 'fixture', n: S.fixture }); }
  }
}

export function tick(S, dt) {
  const ev = [];
  if (S.ended) return ev;
  S.t += dt;
  const wasRain = raining(S);
  S.wt += dt;
  if (raining(S) !== wasRain) ev.push({ type: 'weather', rain: raining(S) });
  if (S.finale) return ev;
  // The coop: roosters set broodies, broodies hatch hens, hens lay into the still.
  const b0 = Math.floor(S.broodies), h0 = Math.floor(S.hens);
  S.broodies += broodRate(S) * dt;
  S.hens += hatchRate(S) * dt;
  if (Math.floor(S.broodies) > b0) ev.push({ type: 'brood' });
  if (Math.floor(S.hens) > h0) ev.push({ type: 'hatch' });
  gain(S, layRate(S) * dt);
  // The match.
  if (playing(S)) {
    S.shine = Math.min(1, S.shine + autoShine(S) * dt);
    if (S.one.board) cheer(S, boardRate(S) * dt, ev);
    S.ballT += dt;
    if (S.ballT >= deliveryEvery(S)) {
      S.ballT = 0;
      const c = cheersPer(S);
      ev.push({ type: 'ball', cheers: c, shine: S.shine });
      S.balls++;
      cheer(S, c, ev);
      S.shine = 0;
    }
  }
  return ev;
}

// ---------- Time away ----------
// The coop keeps laying and the twelfth man keeps bowling, at a twenty-fifth of the pace, for up to two hours. Nobody
// hatches anything without someone to watch.
export const OFFLINE_CAP = 2 * 3600, OFFLINE_RATE = 0.04;
export function offline(S, secs) {
  if (S.ended || S.finale || secs < 60) return null;
  const s = Math.min(secs, OFFLINE_CAP) * OFFLINE_RATE;
  const drops = layRate(S) * s;
  let cheers = 0;
  if (season(S) && S.fixture < FIXTURES.length && S.lv.twelfth) {
    const sunny = RAIN_AT / CYCLE;
    const sh = Math.min(1, autoShine(S) * deliveryEvery(S));
    cheers = (cheersPer(S, sh) / deliveryEvery(S) + boardRate(S)) * s * sunny;
  }
  if (drops < 1 && cheers < 1) return null;
  gain(S, drops);
  const fx0 = S.fixture;
  if (cheers) { const ev = []; cheer(S, cheers, ev); while (S.fixture < FIXTURES.length && S.fixProg >= FIXTURES[S.fixture].need) { S.fixProg -= FIXTURES[S.fixture].need; S.fixture++; } }
  S.wt += secs % CYCLE;
  return { secs: Math.min(secs, OFFLINE_CAP), drops, cheers, fixtures: S.fixture - fx0 };
}

// ---------- Shop ----------
export const lv = (S, id) => { const it = BY_ID[id]; return it.kind === 'make' ? S.n[id] : it.kind === 'lv' ? S.lv[id] : (S.one[id] ? 1 : 0); };
export const maxed = (S, id) => { const it = BY_ID[id]; return it.kind === 'make' ? false : it.kind === 'lv' ? S.lv[id] >= it.max : !!S.one[id]; };
export function cost(S, id) {
  const it = BY_ID[id];
  if (it.kind === 'make') return Math.round(it.base * Math.pow(it.grow, S.n[id]));
  if (it.kind === 'lv') return S.lv[id] < it.max ? it.costs[S.lv[id]] : Infinity;
  return it.cost;
}
export const have = (S, cur) => cur === 'cheers' ? S.cheers : S.drops;
export function reveal(S) {
  const fresh = [];
  for (const it of ITEMS) if (!S.seen[it.id] && REVEAL[it.id](S)) { S.seen[it.id] = 1; fresh.push(it.id); }
  return fresh;
}
export const items = S => ITEMS.filter(it => S.seen[it.id] && !maxed(S, it.id));
export const bought = S => ITEMS.filter(it => (it.kind === 'one' || it.kind === 'odd') && S.one[it.id]);
export const canBuy = (S, id) => !maxed(S, id) && have(S, BY_ID[id].cur) >= cost(S, id);
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = BY_ID[id], c = cost(S, id);
  if (it.cur === 'cheers') S.cheers -= c; else S.drops -= c;
  if (it.kind === 'make') {
    S.n[id]++;
    if (id === 'hen') S.hens++;
    if (id === 'broody') S.broodies++;
    if (id === 'rooster') S.roosters++;
  } else if (it.kind === 'lv') S.lv[id]++;
  else S.one[id] = true;
  return true;
}
