// Hold It Up to the Light: the rules. index.html draws them, sim.mjs plays them headless.
//
// The gift steers a trolley; its lens throws a focused spot of moonlight. Crystals under the spot
// charge to the lens's full charge (polish overcharges them); every charge fades over its afterglow.
// Revolving lamps sweep the hall and top every crystal up to LAMP_CHARGE. Glow pours into the jars
// (capped). A Peek spends a flash of stored glow to see one layer deeper; the eighth is the target.

export const W = 320, H = 180;          // the hall, in pixels
export const CX = 160, CY = 98;         // the plinth
export const FILL_TIME = 0.45;          // seconds under the spot from empty to full
export const LAMP_CHARGE = 0.4;         // lamps are weaker than focused moonlight
export const LAMP_PERIOD = 14;          // seconds per revolution
export const OFFLINE_RATE = 0.5, OFFLINE_CAP = 8 * 3600;

// The layers of the gift and the flash each needs to see through it.
export const LAYERS = [
  { name: 'the ribbon', flash: 3e+02 },
  { name: 'the wrapping paper', flash: 3.6e+03 },
  { name: 'the sticky tape', flash: 4.2e+04 },
  { name: 'the cardboard box', flash: 5e+05 },
  { name: 'the tissue paper', flash: 6e+06 },
  { name: 'the second box', flash: 5.5e+07 },
  { name: 'the bubble wrap', flash: 4.5e+08 },
  { name: 'the velvet pouch', flash: 1e+10 },
];

// The 24 cases, four rows of six. tool: not a crystal. base: acquired, not mixed.
// rate: glow per second at full charge. mix: the recipe and what it costs.
export const SPECIES = [
  // Case A: the Quartz Room
  { id: 'quartz', name: 'Quartz', case: 0, color: ['#fff7e4', '#d9c8bf', '#6c5671'], start: true,
    note: 'Clear, honest, see-through. Everything the gift is not.' },
  { id: 'amethyst', name: 'Amethyst', case: 0, color: ['#feaae4', '#b0a9e4', '#6c5671'], mix: ['quartz', 'pyrite'],
    hint: 'A quartz that has met iron, and is purple about it.',
    note: 'Quartz with a little iron in it. The Greeks thought it stopped you getting drunk. It does not.' },
  { id: 'smoky', name: 'Smoky Quartz', case: 0, color: ['#dea38b', '#6c5671', '#28282e'], mix: ['quartz', 'moonbeam'],
    hint: 'A quartz left out in the radiation. Moonlight counts, for our purposes.',
    note: 'Quartz darkened by natural radiation. The museum has decided moonlight is radiation. It is, a bit.' },
  { id: 'citrine', name: 'Citrine', case: 0, color: ['#fff7a0', '#ffc384', '#dea38b'], mix: ['amethyst', 'radiator'],
    hint: 'An amethyst, warmed until it forgets it was purple.',
    note: 'Most citrine is heated amethyst. Ours was heated on a 1911 radiator, which clanked throughout.' },
  { id: 'rose', name: 'Rose Quartz', case: 0, color: ['#feaae4', '#f98284', '#6c5671'], mix: ['quartz', 'rhodo'],
    hint: 'Quartz, blushing. Something pink and full of manganese is responsible.',
    note: 'Pink. Cloudy. Cannot be seen through, which the gift finds relatable.' },
  { id: 'rutilated', name: 'Rutilated Quartz', case: 0, color: ['#fff7e4', '#ffc384', '#6c5671'], mix: ['quartz', 'rutile'],
    hint: 'Quartz with golden needles of titanium trapped inside it.',
    note: 'Quartz that grew around needles of rutile. It knows exactly what is inside it. Lucky.' },
  // Case B: the Corundum Room
  { id: 'rutile', name: 'Rutile', case: 1, color: ['#ffc384', '#dea38b', '#28282e'], base: 2,
    note: 'Titanium dioxide. Puts the gold needles in quartz and the blue in sapphire. Busy.' },
  { id: 'corundum', name: 'Corundum', case: 1, color: ['#d9c8bf', '#accce4', '#6c5671'], base: 3,
    note: 'Aluminium oxide. Harder than almost anything. Plain until something gets into it.' },
  { id: 'chromite', name: 'Chromite', case: 1, color: ['#87a889', '#6c5671', '#28282e'], base: 3,
    note: 'A black ore full of chromium. Turns things red or green, depending on who they are.' },
  { id: 'ruby', name: 'Ruby', case: 1, color: ['#f98284', '#feaae4', '#6c5671'], mix: ['corundum', 'chromite'],
    hint: 'Corundum with chromium in it. Glows red under the right light; this is the right light.',
    note: 'Corundum plus chromium. Rubies really do glow red in strong light. Please enjoy responsibly.' },
  { id: 'sapphire', name: 'Sapphire', case: 1, color: ['#accce4', '#b0a9e4', '#28282e'], mix: ['corundum', 'rutile'],
    hint: 'Corundum with titanium in it, feeling blue.',
    note: 'Corundum plus titanium and a little iron. A ruby that went the other way.' },
  { id: 'padparadscha', name: 'Padparadscha', case: 1, color: ['#ffc384', '#f98284', '#feaae4'], mix: ['ruby', 'sapphire'],
    hint: 'Half ruby, half sapphire: the colour of a lotus at sunset.',
    note: 'A pink-orange sapphire named after a lotus. The audio guide is not allowed to say how much it is worth.' },
  // Case C: the Beryl Room
  { id: 'rhodo', name: 'Rhodochrosite', case: 2, color: ['#f98284', '#feaae4', '#dea38b'], base: 2,
    note: 'Manganese carbonate, in raspberry stripes. Lends its pink to anything that asks.' },
  { id: 'beryl', name: 'Beryl', case: 2, color: ['#b3e3da', '#d9c8bf', '#6c5671'], base: 4,
    note: 'Plain beryl, called goshenite. Like the gift: pale, patient, waiting for something to get in.' },
  { id: 'emerald', name: 'Emerald', case: 2, color: ['#b0eb93', '#87a889', '#28282e'], mix: ['beryl', 'chromite'],
    hint: 'Beryl and chromium. Green with it.',
    note: 'Beryl plus chromium. Almost always full of tiny flaws, which jewellers call its garden.' },
  { id: 'aquamarine', name: 'Aquamarine', case: 2, color: ['#accce4', '#b3e3da', '#6c5671'], mix: ['beryl', 'pyrite'],
    hint: 'Beryl with iron in it, the colour of sea water.',
    note: 'Beryl plus a little iron. Sailors carried it so as not to drown. Results vary.' },
  { id: 'morganite', name: 'Morganite', case: 2, color: ['#feaae4', '#ffe6c6', '#dea38b'], mix: ['beryl', 'rhodo'],
    hint: 'Beryl with manganese in it, blushing peach.',
    note: 'Beryl plus manganese. Peach-pink, and very calm about it.' },
  { id: 'heliodor', name: 'Heliodor', case: 2, color: ['#e9f59d', '#fff7a0', '#87a889'], mix: ['beryl', 'moonbeam'],
    hint: 'Beryl, irradiated golden. Gifted of the sun; we only had the moon.',
    note: 'Yellow beryl. Its name means gift of the sun. Our one is a gift of the moon and a lens.' },
  // Case D: the Glow Room (case 24 is missing)
  { id: 'pyrite', name: 'Pyrite', case: 3, color: ['#fff7a0', '#ffc384', '#6c5671'], start: true,
    note: 'Iron sulphide. Fool\'s gold. Included out of pity, and for the iron.' },
  { id: 'calcite', name: 'Calcite', case: 3, color: ['#ffe6c6', '#d9c8bf', '#dea38b'], base: 1,
    note: 'Calcium carbonate. Some calcite glows for hours after the light goes. This is that calcite.' },
  { id: 'fluorite', name: 'Fluorite', case: 3, color: ['#b0a9e4', '#b3e3da', '#6c5671'], base: 1,
    note: 'The word fluorescence was named after it. It has never let anyone forget it.' },
  { id: 'bluejohn', name: 'Blue John', case: 3, color: ['#b0a9e4', '#feaae4', '#6c5671'], mix: ['fluorite', 'moonbeam'],
    hint: 'Fluorite, striped purple by radiation, the way the moon would do it.',
    note: 'Banded fluorite from one hill in Derbyshire, coloured by radiation over a very long time.' },
  { id: 'hackmanite', name: 'Hackmanite', case: 3, color: ['#feaae4', '#fff7e4', '#b0a9e4'], mix: ['calcite', 'moonbeam'],
    hint: 'A calcite that has been in the moonlight so long it changes colour when nobody is looking.',
    note: 'Changes colour in the light and fades back in the dark. The gift does not trust it.' },
  { id: 'celestine', name: 'Celestine', case: 3, color: ['#accce4', '#fff7e4', '#b0a9e4'], missing: true,
    hint: 'Missing since 1911. It was due by post. The post came. The crystal never turned up.',
    note: 'Strontium sulphate, sky blue. Missing since 1911. Found: inside the gift, the whole time.' },
];
export const BY_ID = Object.fromEntries(SPECIES.map(s => [s.id, s]));
// Order of arrival sets each crystal's glow (each one about RATE_STEP times the last). Its price is a
// share of the flash for the chapter it belongs to (the Peek you are working toward when it arrives).
export const ORDER = ['quartz', 'pyrite', 'amethyst', 'smoky', 'calcite', 'fluorite', 'citrine', 'bluejohn',
  'rhodo', 'rose', 'hackmanite', 'rutile', 'rutilated', 'corundum', 'chromite', 'ruby', 'sapphire',
  'beryl', 'emerald', 'aquamarine', 'morganite', 'heliodor', 'padparadscha'];
export const RATE_BASE = 5, RATE_STEP = 1.47;
const PRICE = {
  amethyst: [0, 0.4],
  smoky: [1, 0.3], calcite: [1, 0.5], fluorite: [1, 0.8],
  citrine: [2, 0.3], bluejohn: [2, 0.6], rhodo: [2, 0.9],
  rose: [3, 0.3], hackmanite: [3, 0.6], rutile: [3, 0.9],
  rutilated: [4, 0.3], corundum: [4, 0.5], chromite: [4, 0.8],
  ruby: [5, 0.3], sapphire: [5, 0.6], beryl: [5, 0.9],
  emerald: [6, 0.2], aquamarine: [6, 0.4], morganite: [6, 0.6], heliodor: [6, 0.8],
  padparadscha: [7, 0.25],
};
const nice = x => { const p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; };
ORDER.forEach((id, i) => {
  const sp = BY_ID[id];
  sp.order = i;
  sp.rate = nice(RATE_BASE * Math.pow(RATE_STEP, i));
  if (PRICE[id]) { sp.chapter = PRICE[id][0]; sp.cost = nice(LAYERS[PRICE[id][0]].flash * PRICE[id][1]); }
});
BY_ID.celestine.rate = 0;
export const TOOLS = {
  moonbeam: { id: 'moonbeam', name: 'Moonbeam', note: 'What comes in through the skylight. The lens makes it a spot.' },
  radiator: { id: 'radiator', name: 'Radiator', note: 'Cast iron, 1911. Clanks. Gets things hot.' },
};
export const CASES = ['Quartz Room', 'Corundum Room', 'Beryl Room', 'Glow Room'];
export const CASE_BONUS = 2;

// Floor slots: three rings of display stands around the plinth, filled in order of arrival.
export const SLOTS = (() => {
  const rings = [[56, 30, 6, 0.3], [102, 54, 8, 0.1], [142, 70, 10, 0.25]];
  const out = [];
  for (const [rx, ry, n, off] of rings) for (let i = 0; i < n; i++) {
    const a = off + (i / n) * Math.PI * 2;
    out.push({ x: Math.round(CX + Math.cos(a) * rx), y: Math.round(CY + 4 + Math.sin(a) * ry), a });
  }
  return out;
})();

// Shop. kind: 'rep' (count, cost grows) or 'one'. need: peeks seen before it shows.
export const UPGRADES = [
  { id: 'jam', name: 'Jam Jar', kind: 'rep', cost: 62.5, grow: 1.15, cap: 250, max: 24, need: 0,
    desc: 'A jar of glow-in-the-dark paint, open, to soak up the hall\'s glow.', joke: 'Labelled STRAWBERRY. It is not strawberry.' },
  { id: 'lens', name: 'Wider Lens', kind: 'rep', cost: 40, grow: 2.5, max: 8, need: 0,
    desc: 'The moonlight spot gets wider, so it charges more at once.', joke: 'A bigger magnifying glass, borrowed from the Insects gallery.' },
  { id: 'coat', name: 'Phosphor Coat', kind: 'rep', cost: 90, grow: 1.22, max: 60, need: 0,
    desc: 'Crystals keep their glow longer after charging.', joke: 'Applied with a very small brush, at night, by a parcel.' },
  { id: 'shake', name: 'Gentle Shake', kind: 'one', cost: 120, need: 0, silly: true,
    desc: 'The gift shakes itself. Just once. Gently.', joke: 'Something inside goes tink. The gift did not enjoy that.' },
  { id: 'oil', name: 'Oil the Wheels', kind: 'rep', cost: 70, grow: 3.4, max: 4, need: 0,
    desc: 'The trolley rolls faster and squeaks less.', joke: 'The trolley has carried the gift since 1911. It has opinions about oil.' },
  { id: 'tag', name: 'Read the Tag', kind: 'one', cost: 500, need: 1, silly: true,
    desc: 'Tilt a lens at the gift tag, which has been face-down for over a century.', joke: 'It says "For C." Not "For the Museum". The gift is now thinking about who C. is.' },
  { id: 'polish', name: 'Lens Polish', kind: 'rep', cost: 150, grow: 1.2, max: 80, need: 1,
    desc: 'The lens charges crystals past full, so they glow brighter and for longer.', joke: 'Polished with the corner of the ribbon. It is a very useful ribbon.' },
  { id: 'bell', name: 'Bell Jar', kind: 'rep', cost: 719, grow: 1.15, cap: 2.88e+03, max: 24, need: 1,
    desc: 'A glass dome from the Clocks gallery, filled with glowing paint.', joke: 'The clock that lived under it now lives under a tea towel.' },
  { id: 'radiator', name: 'The Radiator', kind: 'one', cost: 3e3, need: 1, tool: 'radiator',
    desc: 'Wheel the old cast-iron radiator to the bench, for recipes that need heat.', joke: 'It clanks the whole way. The night guard sleeps through it, as always.' },
  { id: 'calcite', name: 'Acquire Calcite', kind: 'one', cost: 900, need: 1, species: 'calcite',
    desc: 'Borrow Calcite from the basement stores for the Glow Room.', joke: 'Signed out in the ledger as "the gift (on loan)".' },
  { id: 'fluorite', name: 'Acquire Fluorite', kind: 'one', cost: 2e3, need: 1, species: 'fluorite',
    desc: 'Borrow Fluorite from the basement stores for the Glow Room.', joke: 'It came up in the lift, which the gift cannot operate, and yet.' },
  { id: 'postcard', name: '1911 Postcard', kind: 'one', cost: 4e3, need: 2, silly: true,
    desc: 'Pin up the delivery postcard: "Arrived 5 November 1911."', joke: 'The same day the first aeroplane to cross America landed in Pasadena. The gift came by train. It would like that noted.' },
  { id: 'lamp', name: 'Revolving Lamp', kind: 'rep', cost: 1.5e4, grow: 4, max: 6, need: 2,
    desc: 'A lamp on the plinth that sweeps the hall and tops every crystal up a little, even while you are away.', joke: 'Off a decommissioned carousel. It still plays a little tune in its head.' },
  { id: 'carboy', name: 'Carboy', kind: 'rep', cost: 8.27e+03, grow: 1.15, cap: 3.31e+04, max: 24, need: 2,
    desc: 'A big glass bottle in a wicker basket, full of glow.', joke: 'From the Chemistry gallery. Previously full of something they no longer discuss.' },
  { id: 'rhodo', name: 'Acquire Rhodochrosite', kind: 'one', cost: 2e4, need: 2, species: 'rhodo',
    desc: 'Borrow Rhodochrosite, the pink one, from the basement stores.', joke: 'Raspberry-striped. Smells faintly of nothing, which is a relief.' },
  { id: 'rutile', name: 'Acquire Rutile', kind: 'one', cost: 4e4, need: 2, species: 'rutile',
    desc: 'Borrow Rutile, golden needles of titanium, from the basement stores.', joke: 'Handle with care. Or at all, if you have hands.' },
  { id: 'twin', name: 'Twinning', kind: 'rep', cost: 1500, grow: 18, max: 10, need: 2,
    desc: 'Every crystal grows a twin: twice the glow from every stand.', joke: 'Crystals really do twin. These ones do it when the lens isn\'t looking.' },
  { id: 'sign', name: 'Do Not Peek Sign', kind: 'one', cost: 3e5, need: 3, silly: true,
    desc: 'Hang the museum\'s own sign on the gift, facing inwards.', joke: 'The gift reads it every night. It does not help.' },
  { id: 'cistern', name: 'Cistern', kind: 'rep', cost: 9.51e+04, grow: 1.15, cap: 3.8e+05, max: 24, need: 3,
    desc: 'The old rainwater cistern under the hall, painted inside with phosphor.', joke: 'Echoes. Every glow you pour in comes back as a slightly smaller glow.' },
  { id: 'corundum', name: 'Acquire Corundum', kind: 'one', cost: 1e6, need: 3, species: 'corundum',
    desc: 'Borrow Corundum, plain and very hard, from the basement stores.', joke: 'It scratched the lift. Everything scratches the lift.' },
  { id: 'chromite', name: 'Acquire Chromite', kind: 'one', cost: 2e6, need: 3, species: 'chromite',
    desc: 'Borrow Chromite, a black ore full of chromium, from the basement stores.', joke: 'Looks like a lump of coal. Is a lump of potential.' },
  { id: 'guide', name: 'Audio Guide Stop 0', kind: 'one', cost: 3e7, need: 4, silly: true,
    desc: 'Record an extra audio guide stop, about the gift, from the gift\'s point of view.', joke: '"Stop 0. You are inside a box, inside paper, inside a museum. Please do not tell anyone what is in here, if you find out first."' },
  { id: 'gasometer', name: 'Gasometer', kind: 'rep', cost: 1.09e+06, grow: 1.15, cap: 4.37e+06, max: 24, need: 4,
    desc: 'The museum\'s retired gas holder, rolled in, filled with glow.', joke: 'It had to come in through the loading bay, sideways, at 3am.' },
  { id: 'beryl', name: 'Acquire Beryl', kind: 'one', cost: 3e7, need: 4, species: 'beryl',
    desc: 'Borrow Beryl, pale and patient, from the basement stores.', joke: 'The last specimen in the basement. The basement is now just a basement.' },
  { id: 'dome', name: 'Planetarium Dome', kind: 'rep', cost: 1.26e+07, grow: 1.15, cap: 5.03e+07, max: 24, need: 5,
    desc: 'Coat the inside of the planetarium dome with phosphor and fill it with glow.', joke: 'The stars on the ceiling are now real enough to read by.' },
  { id: 'wing', name: 'The East Wing', kind: 'rep', cost: 1.45e+08, grow: 1.08, max: 60, cap: 5.78e+08, need: 6,
    desc: 'Close the East Wing "for refurbishment", paint every wall with phosphor and fill it with glow.', joke: 'The refurbishment sign was already up. It has been up since 1974.' },
  { id: 'ears', name: 'Earmuffs', kind: 'one', cost: 8e8, need: 6, silly: true,
    desc: 'Earmuffs for the gift, for when it finally finds out. It does not want to hear itself gasp.', joke: 'They are on the ribbon, roughly where ears would be.' },
];
for (const u of UPGRADES) if (u.species) { u.cost = BY_ID[u.species].cost; u.need = BY_ID[u.species].chapter; }
export const UP = Object.fromEntries(UPGRADES.map(u => [u.id, u]));
// Storage: tier t arrives with Peek t and holds a share of that layer's flash per unit, so twelve
// of them never quite reach the next layer: you build the next tier past the cap.
export const STORE = ['jam', 'bell', 'carboy', 'cistern', 'gasometer', 'dome', 'wing'];
export const STORE_SHARE = 0.4, STORE_PRICE = 0.15;
STORE.forEach((id, t) => { const u = UP[id]; u.need = t; u.cap = nice(LAYERS[t].flash * STORE_SHARE); u.cost = nice(u.cap * STORE_PRICE); });

export function defaults() {
  return {
    glow: 0, total: 0, time: 0, peeks: 0, ended: false,
    own: ['quartz', 'pyrite'], tools: ['moonbeam'],
    up: {},                       // upgrade id -> count (1 for one-offs)
    charge: {},                   // species id -> 0..1
    seen: [], tab: 'shop', boughtOpen: false, last: 0,
  };
}

export const lvl = (S, id) => S.up[id] || 0;
export const upCost = (S, u) => u.kind === 'rep' ? Math.round(u.cost * Math.pow(u.grow, lvl(S, u.id))) : u.cost;
export const maxed = (S, u) => u.kind === 'one' ? lvl(S, u.id) > 0 : (u.max != null && lvl(S, u.id) >= u.max);
export const unlocked = (S, u) => S.peeks >= u.need;

export const capacity = S => 200 + UPGRADES.filter(u => u.cap).reduce((a, u) => a + u.cap * lvl(S, u.id), 0);
export const spotRadius = S => 9 + 3 * lvl(S, 'lens');
export const lensCharge = S => 1 + 0.045 * lvl(S, 'polish');
export const afterglow = S => 14 * Math.pow(1.045, lvl(S, 'coat'));
export const speed = S => 70 + 22 * lvl(S, 'oil');
export const lamps = S => lvl(S, 'lamp');
export const twinMult = S => Math.pow(2, lvl(S, 'twin'));
export const caseDone = (S, c) => SPECIES.filter(s => s.case === c).every(s => S.own.includes(s.id));
export const caseMult = (S, sp) => caseDone(S, sp.case) ? CASE_BONUS : 1;
export const speciesRate = (S, sp) => sp.rate * twinMult(S) * caseMult(S, sp);
export const slotOf = (S, id) => SLOTS[S.own.indexOf(id)];

// The recipe for a pair (order-free), or null.
export function recipe(a, b) {
  return SPECIES.find(s => s.mix && ((s.mix[0] === a && s.mix[1] === b) || (s.mix[0] === b && s.mix[1] === a))) || null;
}
export const has = (S, id) => S.own.includes(id) || S.tools.includes(id);

// Advance the hall by dt seconds. spot = { x, y } of the lens focus, or null. Returns glow made and
// which crystals are focused (for drawing), and which just became full (for chimes).
export function tick(S, dt, spot, lampAngle) {
  const T = afterglow(S), r = spotRadius(S), r2 = r * r, n = lamps(S), full = lensCharge(S);
  let made = 0;
  const focused = [], filled = [];
  for (const id of S.own) {
    const sp = BY_ID[id], slot = slotOf(S, id);
    if (!slot) continue;
    let c = S.charge[id] || 0;
    let f = false;
    if (spot) {
      const dx = slot.x - spot.x, dy = slot.y - spot.y;
      if (dx * dx + dy * dy <= r2) {
        f = true;
        const was = c;
        if (c < full) c = Math.min(full, c + full * dt / FILL_TIME);
        if (was < full && c >= full) filled.push(id);
      }
    }
    if (!f) c = Math.max(0, c - full * dt / T);
    // Lamps: n rays, evenly spaced, sweeping. A crystal the ray crosses is topped up to LAMP_CHARGE.
    if (n && lampAngle != null) {
      const step = Math.PI * 2 / n, w = (Math.PI * 2 / LAMP_PERIOD) * dt;
      let d = ((lampAngle - slot.a) % step + step) % step;
      if (d < w + 1e-9) c = Math.max(c, LAMP_CHARGE);
    }
    S.charge[id] = c;
    made += speciesRate(S, sp) * c * dt;
    if (f) focused.push(id);
  }
  return { made, focused, filled };
}

export function addGlow(S, g) {
  const cap = capacity(S);
  const before = S.glow;
  S.glow = Math.min(cap, S.glow + g);
  S.total += S.glow - before;
  return S.glow - before;
}

// Glow per second the lamps alone keep up: a crystal topped up to LAMP_CHARGE every gap seconds,
// fading at full/T per second, averaged over the gap.
export function lampMean(S) {
  const n = lamps(S);
  if (!n) return 0;
  const gap = LAMP_PERIOD / n, k = lensCharge(S) / afterglow(S), L = LAMP_CHARGE;
  return k * gap <= L ? L - k * gap / 2 : (L * L) / (2 * k * gap);
}
export const lampRate = S => S.own.reduce((a, id) => a + speciesRate(S, BY_ID[id]), 0) * lampMean(S);

// The trolley turns toward the target and rolls there; the lens spot sits just ahead of it.
export function steer(t, target, dt, vmax) {
  if (target) {
    const dx = target.x - t.x, dy = target.y - t.y, d = Math.hypot(dx, dy);
    const want = Math.atan2(dy, dx);
    let da = ((want - t.h + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    t.h += Math.max(-6 * dt, Math.min(6 * dt, da));
    const goal = d < 4 ? 0 : Math.min(vmax, d * 3) * Math.max(0.25, Math.cos(da));
    t.v += (goal - t.v) * Math.min(1, dt * 5);
  } else t.v *= Math.max(0, 1 - dt * 4);
  t.x = Math.max(8, Math.min(W - 8, t.x + Math.cos(t.h) * t.v * dt));
  t.y = Math.max(20, Math.min(H - 8, t.y + Math.sin(t.h) * t.v * dt));
  return { x: t.x, y: t.y };
}

// Offline: lamps only, at a reduced rate, capped in time and by the jars.
export function offline(S, seconds) {
  const t = Math.min(OFFLINE_CAP, Math.max(0, seconds));
  const g = lampRate(S) * OFFLINE_RATE * t;
  return { seconds: t, gained: addGlow(S, g) };
}

export const peekCost = S => LAYERS[S.peeks] ? LAYERS[S.peeks].flash : Infinity;
export const found = S => S.own.length;                      // of the 23 that can be found
export const FINDABLE = ORDER.length;
// The velvet only lets a full spectrum through: the last Peek needs every crystal in the hall.
export const needsAll = S => S.peeks === LAYERS.length - 1 && found(S) < FINDABLE;
export const canPeek = S => S.peeks < LAYERS.length && !needsAll(S) && S.glow >= peekCost(S);

export function buy(S, u) {
  if (!unlocked(S, u) || maxed(S, u)) return false;
  const c = upCost(S, u);
  if (S.glow < c) return false;
  S.glow -= c;
  S.up[u.id] = lvl(S, u.id) + 1;
  if (u.species && !S.own.includes(u.species)) S.own.push(u.species);
  if (u.tool && !S.tools.includes(u.tool)) S.tools.push(u.tool);
  return true;
}

export function mix(S, a, b) {
  const sp = recipe(a, b);
  if (!sp) return { ok: false, why: 'none' };
  if (S.own.includes(sp.id)) return { ok: false, why: 'have', sp };
  if (!has(S, a) || !has(S, b)) return { ok: false, why: 'missing', sp };
  if (S.glow < sp.cost) return { ok: false, why: 'poor', sp };
  S.glow -= sp.cost;
  S.own.push(sp.id);
  return { ok: true, sp };
}

export function peek(S) {
  if (!canPeek(S)) return false;
  S.glow -= peekCost(S);
  S.peeks++;
  if (S.peeks >= LAYERS.length) S.ended = true;
  return true;
}

// Short numbers: 1.2K, 3.4M, 5.6B.
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
  const u = ['K', 'M', 'B', 'T'];
  let i = -1;
  while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + u[i];
}
