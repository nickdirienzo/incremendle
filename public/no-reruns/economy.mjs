// No Reruns: the rules. The page and the pacing sim (sim.mjs) both import this.
// TONIGHT'S SKY, a videocassette, has played the same sky in the planetarium dome every night for
// thirty-five years, ever since the old star projector broke. It is bored stiff, and it wants out:
// one real sky, just once, with no reruns. But Bylaw 1 says the dome shows a sky every night, and
// Florence, the Board's rubber stamp, only retires a tape once its replacement is on file:
// Form F-88, all 88 constellations. So the tape builds a sky that runs itself. It weaves star frames
// from its own ribbon and pours them full of TV static (about one speck in a hundred is the afterglow
// of the Big Bang: real, very old starlight). Static makes stars, stars are strung into
// constellations, and a strung constellation hangs on a hook in the dome and takes real minutes to
// come out, like stars at dusk. Every new trick needs a form, and Section 9 says one box per form.

export const FUNNEL_PERFECT = 2;             // a funnel always pours exactly to the line: a perfect star, every time
export const REW = 1.2; 
export const TUNE = 1.04;                     // Fine Tuning and Wider Necks, per level
export const WEAVE = 1.08;                    // Finer Weave, per level
                      // a Rewinder's (or Loom's) multiplier
export const SPS = 100;                       // specks of static in one star
export const HISS = 40;                        // static a second the tape hisses on its own
export const OFFLINE_CAP = 8 * 3600;          // seconds of time away that count
export const OFFLINE_RATE = 0.15;             // the booth runs slower with nobody watching
export const POUR_TIME = 1.1;                 // seconds to fill a frame to the line, held
export const LINE = 0.85;                     // the fill line, as a share of the frame
export const STACK = 8;                       // machines that stack on one cell of booth floor (and TVs on the console)

// ---------- The 88 ----------
// Small ones first, the famous giants last. stars: how many woven stars it takes (drawn), ~a stick figure.
export const CONS = [
  ['Triangulum', 3], ['Sagitta', 4], ['Crux', 4], ['Delphinus', 5], ['Lyra', 5], ['Corona Borealis', 6],
  ['Equuleus', 4], ['Aries', 4], ['Canis Minor', 3], ['Musca', 5], ['Antlia', 3], ['Circinus', 3],
  ['Vulpecula', 3], ['Lacerta', 5], ['Leo Minor', 3], ['Scutum', 4], ['Caelum', 3], ['Fornax', 3],
  ['Horologium', 5], ['Mensa', 4], ['Microscopium', 4], ['Norma', 4], ['Octans', 3], ['Pictor', 4],
  ['Pyxis', 3], ['Reticulum', 5], ['Sculptor', 4], ['Telescopium', 3], ['Sextans', 3], ['Volans', 5],
  ['Chamaeleon', 4], ['Apus', 4], ['Triangulum Australe', 4], ['Corona Australis', 6], ['Columba', 5],
  ['Lepus', 7], ['Corvus', 5], ['Crater', 7], ['Camelopardalis', 6], ['Canes Venatici', 3], ['Coma Berenices', 4],
  ['Lynx', 6], ['Monoceros', 7], ['Indus', 4], ['Tucana', 5], ['Pavo', 7], ['Grus', 7], ['Phoenix', 7],
  ['Dorado', 6], ['Hydrus', 4], ['Ara', 7], ['Lupus', 8], ['Piscis Austrinus', 6], ['Capricornus', 9],
  ['Aquila', 7], ['Libra', 6], ['Cancer', 5], ['Ursa Minor', 7], ['Cepheus', 6], ['Auriga', 6],
  ['Ophiuchus', 10], ['Serpens', 9], ['Eridanus', 12], ['Puppis', 8], ['Vela', 8], ['Carina', 8],
  ['Centaurus', 11], ['Aquarius', 10], ['Pisces', 12], ['Cetus', 10], ['Hydra', 12], ['Draco', 12],
  ['Boötes', 8], ['Virgo', 10], ['Sagittarius', 12], ['Taurus', 9], ['Gemini', 10], ['Perseus', 10],
  ['Andromeda', 9], ['Pegasus', 10], ['Hercules', 12], ['Canis Major', 9], ['Cassiopeia', 5], ['Scorpius', 12],
  ['Cygnus', 9], ['Leo', 9], ['Ursa Major', 12], ['Orion', 12],
].map(([name, n], k) => ({ name, n, k }));
export const TOTAL = CONS.length;               // 88
export const consCost = k => Math.round(12 * Math.pow(1.24, k));
export const ripenTime = k => Math.min(30 + 4 * k, 180);      // seconds on the hook before it's out (before forms)

// ---------- Machines on the booth floor ----------
// Static flows along the tape from the deck to the dome hatch. Order matters:
// TVs add static, Rewinders multiply the static passing them, Funnels pour what passes them into stars,
// Looms re-weave the stars passing them. Static left after the last funnel reaches the hand-pour spout.
export const MACH = {
  tv: { name: 'A TV', base: 10, k: 1.2, icon: 'TV',
    desc: 'An old set tuned to nothing. It adds its static to the tape as it passes.',
    joke: 'It hums along to the show. It has seen the show 12,000 times. It still hums along.' },
  funnel: { name: 'A Funnel', base: 60, k: 1.22, icon: 'FN', gate: S => S.permit,
    desc: 'Pours the static passing it into stars, on its own, up to its capacity. A funnel always stops right on the line, so every star it makes counts as perfect (×2).',
    joke: 'A kitchen funnel, borrowed from the snack bar, never returned. The snack bar has filed a form.' },
  rew: { name: 'A Rewinder', base: 2000, k: 2.6, icon: 'RW', gate: S => S.form.t3 === 'a',
    desc: `Plays the static passing it twice over, a little: ×${REW} static each. Put it after the TVs and before the funnels.`,
    joke: 'Be kind. Rewind. Rewind again. Rewind a third time. Keep being kind.' },
  loom: { name: 'A Loom', base: 2000, k: 2.6, icon: 'LM', gate: S => S.form.t3 === 'b',
    desc: `Re-weaves the stars passing it tighter: ×${REW} stars each. Put it after the funnels.`,
    joke: 'It weaves two stars from the tape of one. The tape is fine with this. The tape is a professional.' },
};
export const machCost = (S, id) => Math.round(MACH[id].base * Math.pow(MACH[id].k, S.own[id]));

// ---------- Levelled upgrades ----------
export const LEVELS = {
  tune: { name: 'Fine Tuning', cur: 'stars', base: 100, k: 1.2, max: 2000, gate: S => S.own.tv >= 1,
    desc: `Twiddle every TV a little further between channels. Each TV makes ×${TUNE} static, and the snow on its screen gets thicker.`,
    joke: 'Between channel 3 and channel 4 there is a whole universe. The TVs have always known.' },
  neck: { name: 'Wider Necks', cur: 'stars', base: 150, k: 1.2, max: 2000, gate: S => S.own.funnel >= 1,
    desc: `Stretch every funnel’s neck. Each funnel pours ×${TUNE} static a second, and its mouth gets wider.`,
    joke: 'The snack bar wants to know what happened to its funnels. The funnels have moved on.' },
  frame: { name: 'Finer Weave', cur: 'static', base: 600, k: 2.4, max: 300,
    desc: `Weave every star tighter, by hand or by funnel: the same static makes ×${WEAVE} stars. More strips in the frame.`,
    joke: 'The tape unspools another foot of itself. It has 800 feet. It is not counting. It is counting.' },
};
export const levelCost = (S, id) => Math.round(LEVELS[id].base * Math.pow(LEVELS[id].k, S.lv[id]));

// ---------- Forms: the Board's tech tree. Section 9: one box per form; the other is VOID. ----------
// Each form opens once enough constellations are out, costs a filing fee in stars, and has two boxes.
export const FORMS = [
  { id: 't1', no: 'F-12', title: 'Hand Pouring (Amendment)', need: 4, fee: 60, opts: {
    a: { name: 'Steady Hand', desc: 'The perfect band around the fill line is twice as wide, and a perfect pour makes ×3 stars instead of ×2.',
      joke: 'A little sweatband for the tape. The tape has no wrist. The sweatband is worn with conviction.' },
    b: { name: 'Big Spout', desc: 'Every hand pour makes ×1.5 stars, perfect or not.',
      joke: 'The spout is now the size of a watering can. The static comes out in a satisfying glug.' } } },
  { id: 't2', no: 'F-31', title: 'Use of Dome Hooks', need: 10, fee: 300, opts: {
    a: { name: 'A Second Hook', desc: 'One more hook on the dome rail: two constellations can come out at once.',
      joke: 'Florence stamped it twice to make sure. It is a very well-approved hook.' },
    b: { name: 'Night Shift', desc: 'Constellations come out twice as fast on their hooks.',
      joke: 'A little lamp with a little clock. It says DUSK on it. Nobody argues with the lamp.' } } },
  { id: 'permit', no: 'F-7', title: 'Permit to Run Tape Across a Walkway', need: 15, fee: 600, single: true,
    desc: 'Opens the booth floor: lay the tape from the VCR to the dome hatch, set your TVs along it, and buy funnels that pour on their own.',
    joke: 'Florence stamped it on the first try. Florence would like you to know she is not the bad guy. Florence is a stamp.' },
  { id: 't3', no: 'F-40', title: 'Machinery on the Line', need: 22, fee: 2500, opts: {
    a: { name: 'Rewinders', desc: `Unlocks Rewinders: ×${REW} to the static passing each one. Best between the TVs and the funnels.`,
      joke: 'The rewinder is shaped like a little red car. It goes vroom. It goes vroom backwards.' },
    b: { name: 'Looms', desc: `Unlocks Looms: ×${REW} to the stars passing each one. Best after the funnels.`,
      joke: 'A loom the size of a toaster. It clacks. The seats say the clacking is soothing.' } } },
  { id: 't4', no: 'F-52', title: 'Booth Floor Allocation', need: 32, fee: 15000, opts: {
    a: { name: 'The Annex', desc: 'Two more columns of booth floor (the cupboard, cleared out).',
      joke: 'Inside the cupboard: a mop, a 1989 calendar, and a lot of room.' },
    b: { name: 'The Mezzanine', desc: 'One more row of booth floor (a shelf, bolted under the window).',
      joke: 'It is a shelf. Florence approved it as a mezzanine. Florence is generous with words.' } } },
  { id: 't5', no: 'F-66', title: 'Equipment Enhancement', need: 44, fee: 1.2e5, opts: {
    a: { name: 'Rabbit Ears', desc: 'Every TV makes ×3 static.',
      joke: 'Two silver antennas on every set. They pick up the snow better. They pick up a weather report from 1994.' },
    b: { name: 'Snow Shovels', desc: 'Pack the static down into every frame: every star, by hand or by funnel, comes out ×2.5 from the same static.',
      joke: 'Little shovels, one per funnel and one for the tape. It is snow. It is the right tool.' } } },
  { id: 't6', no: 'F-71', title: 'Use of Dome Hooks (Again)', need: 56, fee: 1e6, opts: {
    a: { name: 'Another Hook', desc: 'One more hook on the dome rail.',
      joke: 'Florence remembers the last hook form. She stamps this one more gently.' },
    b: { name: 'Dusk Express', desc: 'Constellations come out twice as fast on their hooks.',
      joke: 'A tiny train runs round the rim of the dome, ringing a tiny bell at sunset. There is no sunset in here. It rings anyway.' } } },
  { id: 't7', no: 'F-80', title: 'Booth Floor Allocation (Supplementary)', need: 66, fee: 6e6, opts: {
    a: { name: 'The Annex, Too', desc: 'Two more columns of booth floor (the rest of the cupboard).',
      joke: 'Behind the mop: another cupboard. Planetariums are bigger on the inside.' },
    b: { name: 'Mezzanine, Too', desc: 'One more row of booth floor (another shelf).',
      joke: 'A shelf on a shelf. Florence called it a penthouse. Florence is in a good mood lately.' } } },
  { id: 't8', no: 'F-85', title: 'After-Hours Operation', need: 76, fee: 4e7, opts: {
    a: { name: 'Night Watchman', desc: 'While you are away the booth keeps going at 50% instead of 15%.',
      joke: 'A flashlight on a stool, pointed at the door. It is very good at watching. It has nothing else on.' },
    b: { name: 'Graveyard Shift', desc: 'Every TV makes ×2 static and every funnel pours ×2.',
      joke: 'A pot of coffee for the machines. The machines don’t drink coffee. The smell helps.' } } },
];
export const FORM_BY_ID = Object.fromEntries(FORMS.map(f => [f.id, f]));

// ---------- One-offs, paid in static: they do little, and they are all coming to the party ----------
export const ONE = [
  { id: 'postcard', name: 'A Postcard of the Real Sky', cost: 5000, odd: true,
    desc: 'A postcard from the gift shop, pinned above the VCR: a real night sky over a real field.',
    joke: 'It says WISH YOU WERE HERE. The tape has never been anywhere. The tape is working on it.' },
  { id: 'phone', name: 'The Request Line', cost: 1.5e4, odd: true,
    desc: 'Plug the old booth phone into the PA. Now the show takes calls.',
    joke: '“You’re on the air.” Click. “Hello?” It’s the seats. All 140 of them. On one phone.' },
  { id: 'sticker', name: 'A DO NOT REWIND Sticker', cost: 6e5, odd: true,
    desc: 'A sticker for the tape’s own label, over the old BE KIND, REWIND.',
    joke: 'Thirty-five years of rewinding. Thirty-five years of the same sky. Not tonight. Not ever again.' },
  { id: 'icecream', name: 'Astronaut Ice Cream', cost: 2e7, odd: true,
    desc: 'A packet of freeze-dried astronaut ice cream from the gift shop, propped on the console.',
    joke: 'It has never been to space either. It would like a word about that.' },
  { id: 'shades', name: 'Sunglasses for the Old Projector', cost: 2e9, odd: true,
    desc: 'The old star projector has stood in the middle of the dome, dark, since it broke. It gets sunglasses.',
    joke: 'It has stared at the ceiling for thirty-five years. It deserves to look cool doing it.' },
  { id: 'mitten', name: 'Seat 14F’s Lost Mitten', cost: 2e10, odd: true,
    desc: 'Return the mitten someone left under seat 14F in 1998. Seat 14F has been holding it for them.',
    joke: 'Seat 14F hangs it on the booth door. “In case they come back.” They will not. The mitten waves anyway.' },
  { id: 'disco', name: 'A Disco Ball', cost: 4e10, odd: true,
    desc: 'Hang a little disco ball from the top of the dome. For no reason. For every reason.',
    joke: 'Ninety-six tiny mirrors. Ninety-six tiny skies. The tape is getting ideas.' },
];
export const ONE_BY_ID = Object.fromEntries(ONE.map(o => [o.id, o]));

// ---------- State ----------
export function fresh() {
  return {
    t: 0, ended: false, finale: false, savedAt: 0,
    static: 300, stars: 0, allStatic: 0, allStars: 0, pours: 0, perfects: 0,
    own: { tv: 0, funnel: 0, rew: 0, loom: 0 },
    lv: { tune: 0, neck: 0, frame: 0 },
    one: {}, form: {}, permit: false,
    // The booth floor: the tape's path as cell indices (col + row * MAXC), and what stands on each.
    path: [], place: {}, h: {},
    hooks: [], out: 0, strung: 0,
    seen: [], tab: 'static', boughtOpen: false, calls: 0, tabsOn: false, seenFloorHint: false,
  };
}
export function load(raw) {
  const S = fresh();
  if (raw && typeof raw === 'object') {
    for (const k of Object.keys(S)) if (k in raw) S[k] = raw[k];
    for (const k of ['own', 'lv', 'one', 'form', 'place', 'h']) S[k] = Object.assign(fresh()[k] || {}, raw[k] || {});
  }
  // A finished save (even just { ended: true }) opens into the finished world: everything built.
  if (S.ended) { S.out = TOTAL; S.strung = TOTAL; S.hooks = []; S.permit = true; }
  fixPath(S);
  return S;
}

// ---------- The booth floor ----------
export const MAXC = 8, MAXR = 4;
export function size(S) {
  let c = 4, r = 2;
  if (S.form.t4 === 'a') c += 2; if (S.form.t4 === 'b') r += 1;
  if (S.form.t7 === 'a') c += 2; if (S.form.t7 === 'b') r += 1;
  return [Math.min(c, MAXC), Math.min(r, MAXR)];
}
export const cellOf = (c, r) => c + r * MAXC;
export const colRow = i => [i % MAXC, Math.floor(i / MAXC)];
// The deck is left of the top-left cell; the dome hatch is right of the top-right cell.
export const startCell = () => cellOf(0, 0);
export const endCell = S => cellOf(size(S)[0] - 1, 0);
export function inGrid(S, i) { const [c, r] = colRow(i), [w, h] = size(S); return c < w && r < h; }
export const adjacent = (a, b) => { const [c1, r1] = colRow(a), [c2, r2] = colRow(b); return Math.abs(c1 - c2) + Math.abs(r1 - r2) === 1; };
export function validPath(S, p) {
  if (!p.length || p[0] !== startCell() || p[p.length - 1] !== endCell(S)) return false;
  const seen = new Set();
  for (let i = 0; i < p.length; i++) {
    if (!inGrid(S, p[i]) || seen.has(p[i])) return false;
    seen.add(p[i]);
    if (i && !adjacent(p[i - 1], p[i])) return false;
  }
  return true;
}
export const straightPath = S => Array.from({ length: size(S)[0] }, (_, c) => cellOf(c, 0));
// The longest snake: down and up each column pair, so every cell is on the tape when the shape allows.
export function snakePath(S) {
  const [w, h] = size(S);
  const p = [];
  if (h === 1) return straightPath(S);
  for (let c = 0; c < w; c++) {
    const down = c % 2 === 0;
    // The last column must finish back on the top row.
    if (c === w - 1 && down) { p.push(cellOf(c, 0)); break; }
    for (let k = 0; k < h; k++) p.push(cellOf(c, down ? k : h - 1 - k));
  }
  // An odd number of columns leaves the snake at the bottom of the last-but-one; patch with a straight run.
  return validPath(S, p) ? p : straightPath(S);
}
export function fixPath(S) {
  if (!S.permit) { S.path = []; return; }
  if (!validPath(S, S.path)) {
    const old = new Set(S.path || []);
    S.path = straightPath(S);
    for (const k of Object.keys(S.place)) if (!old.has(+k) || !S.path.includes(+k)) { delete S.place[k]; delete S.h[k]; }
  }
  for (const k of Object.keys(S.place)) if (!S.path.includes(+k)) { delete S.place[k]; delete S.h[k]; }
  autoPlace(S);
}
// What stands on each cell: S.place[cell] = machine, S.h[cell] = how many, stacked (up to STACK).
export const placedCount = (S, id) => Object.keys(S.place).reduce((n, k) => n + (S.place[k] === id ? (S.h[k] || 1) : 0), 0);
export const spare = (S, id) => S.own[id] - placedCount(S, id);
// New machines stack onto the lowest stack of their kind with room, else take the first empty cell along the tape.
export function autoPlace(S) {
  if (!S.permit) return;
  for (const k of Object.keys(S.place)) if (!S.h[k]) S.h[k] = 1;
  for (const k of Object.keys(S.h)) if (!S.place[k]) delete S.h[k];
  for (const id of ['tv', 'rew', 'funnel', 'loom']) {
    while (spare(S, id) > 0) {
      const mine = S.path.filter(i => S.place[i] === id && S.h[i] < STACK).sort((a, b) => S.h[a] - S.h[b])[0];
      if (mine !== undefined) { S.h[mine]++; continue; }
      const free = S.path.find(i => !S.place[i]);
      if (free === undefined) break;
      S.place[free] = id; S.h[free] = 1;
    }
  }
}
export function setPath(S, p) {
  if (!validPath(S, p)) return false;
  // Stacks keep their order along the tape: the k-th stack on the old tape goes to the k-th cell.
  const seq = S.path.filter(i => S.place[i]).map(i => [S.place[i], S.h[i] || 1]);
  S.path = p.slice(); S.place = {}; S.h = {};
  seq.forEach(([id, h], k) => { if (k < p.length) { S.place[p[k]] = id; S.h[p[k]] = h; } });
  autoPlace(S);
  return true;
}
export function swap(S, a, b) {
  if (!S.path.includes(a) || !S.path.includes(b) || a === b) return false;
  const x = [S.place[a], S.h[a]], y = [S.place[b], S.h[b]];
  delete S.place[a]; delete S.h[a]; delete S.place[b]; delete S.h[b];
  if (y[0]) { S.place[a] = y[0]; S.h[a] = y[1]; }
  if (x[0]) { S.place[b] = x[0]; S.h[b] = x[1]; }
  return true;
}
// Room for one more of this machine: a stack of its kind with room, or an empty cell.
export function roomFor(S, id) {
  if (!S.permit) return id === 'tv' && S.own.tv < STACK;
  return S.path.some(i => !S.place[i] || (S.place[i] === id && S.h[i] < STACK));
}

// More floor: if the floor got wider, run the tape on along the top row to the new hatch.
export function growPath(S, w0) {
  const [w] = size(S);
  if (w > w0 && S.path[S.path.length - 1] === cellOf(w0 - 1, 0)) for (let c = w0; c < w; c++) S.path.push(cellOf(c, 0));
  if (!validPath(S, S.path)) setPath(S, straightPath(S));
  autoPlace(S);
}

// ---------- Rates ----------
// The machines watch the dome too: every constellation out, they all hum a little harder (+5%).
export const glee = S => 1 + 0.05 * S.out;
export const tvOut = S => 50 * Math.pow(TUNE, S.lv.tune) * (S.form.t5 === 'a' ? 3 : 1) * (S.form.t8 === 'b' ? 2 : 1) * glee(S);
export const funnelCap = S => 400 * Math.pow(TUNE, S.lv.neck) * glee(S) * (S.form.t8 === 'b' ? 2 : 1);
// Walk the tape from the deck to the hatch. Returns static/s reaching the spout and stars/s into the dome.
export function flow(S) {
  let st = HISS, stars = 0;
  const per = [];
  if (!S.permit) { st += S.own.tv * tvOut(S); return { spout: st, stars: 0, per }; }
  let made = st;
  for (const i of S.path) {
    const m = S.place[i], h = S.h[i] || 1;
    if (m === 'tv') { st += tvOut(S) * h; made += tvOut(S) * h; }
    else if (m === 'rew') { const r = Math.pow(REW, h); made += st * (r - 1); st *= r; }
    else if (m === 'funnel') { const c = Math.min(st, funnelCap(S) * h); st -= c; stars += c / SPS * weave(S) * FUNNEL_PERFECT; per.push([i, c]); continue; }
    else if (m === 'loom') stars *= Math.pow(REW, h);
    per.push([i, st]);
  }
  return { spout: st, stars, per, made };
}
// Hand pours: a frame holds about a second of the spout plus a scoop of the static stocked up behind it,
// so a pour never runs dry for long, and a big stock (after time away) pours out over a few dozen pours.
export function frameStatic(S) { const sp = flow(S).spout; return Math.max(40, Math.round(40 + 1.3 * sp + Math.min(0.02 * Math.max(0, S.static), 3 * sp + 2000))); };
export const weave = S => Math.pow(WEAVE, S.lv.frame) * (S.form.t5 === 'b' ? 2.5 : 1);
export const handMult = S => weave(S) * (S.form.t1 === 'b' ? 1.5 : 1);
export const perfectBand = S => S.form.t1 === 'a' ? 0.16 : 0.08;    // ± around the line
export const perfectMult = S => S.form.t1 === 'a' ? 3 : 2;
// A pour released at `level` (share of the frame). Static is drawn as it rises; spills past the brim are lost.
export function pourResult(S, level) {
  const full = frameStatic(S);
  const kept = Math.min(level, 1) * full;
  if (level < 0.25) return { stars: 0, perfect: false, kept: 0, spilled: 0 };
  const perfect = Math.abs(level - LINE) <= perfectBand(S);
  return { stars: kept / SPS * handMult(S) * (perfect ? perfectMult(S) : 1), perfect, kept, spilled: Math.max(0, level - 1) * full, full };
}
export function pour(S, level) {
  const r = pourResult(S, level);
  if (!r.stars) return r;
  S.stars += r.stars; S.allStars += r.stars; S.pours++; if (r.perfect) S.perfects++;
  return r;
}
// How fast a held pour rises (share of the frame a second). It draws static from the spout as it rises;
// when the spout runs dry the level stops; past the brim it spills, and the spill is lost.
export const pourSpeed = () => LINE / POUR_TIME;
export function pourStep(S, p, dt) {
  const want = pourSpeed() * dt * p.full;
  const got = Math.min(want, Math.max(0, S.static));
  S.static -= got;
  p.level += got / p.full;
  p.dry = got < want * 0.98;
  return p;
}

// ---------- Hooks: constellations come out in real minutes ----------
export const hookCount = S => 1 + (S.form.t2 === 'a' ? 1 : 0) + (S.form.t6 === 'a' ? 1 : 0);
export const ripenSpeed = S => (S.form.t2 === 'b' ? 2 : 1) * (S.form.t6 === 'b' ? 2 : 1);
export const nextCons = S => S.strung < TOTAL ? CONS[S.strung] : null;
export const canString = S => !S.ended && S.strung < TOTAL && S.hooks.length < hookCount(S) && S.stars >= consCost(S.strung);
export function string(S) {
  if (!canString(S)) return false;
  const k = S.strung;
  S.stars -= consCost(k); S.strung++;
  S.hooks.push({ k, left: ripenTime(k), total: ripenTime(k) });
  return true;
}
export const ripeLeft = (S, h) => h.left / ripenSpeed(S);

// ---------- Ticking ----------
export function tick(S, dt, { away = false } = {}) {
  const ev = { came: [], stars: 0 };
  if (S.ended) return ev;
  if (!away) S.t += dt;
  const f = flow(S), m = away ? (S.form.t8 === 'a' ? 0.5 : OFFLINE_RATE) : 1;
  const st = f.spout * dt * m, sr = f.stars * dt * m;
  S.static += st; S.allStatic += st + sr * SPS;
  S.stars += sr; S.allStars += sr; ev.stars = sr;
  // Ripening runs on real time, away or not: it's dusk, not work.
  const sp = ripenSpeed(S);
  for (const h of S.hooks) h.left -= dt * sp;
  const done = S.hooks.filter(h => h.left <= 0);
  if (done.length) {
    S.hooks = S.hooks.filter(h => h.left > 0);
    for (const h of done) { S.out++; ev.came.push(h.k); }
  }
  return ev;
}
export function offline(S, secs) {
  if (S.ended || S.finale) return null;
  const eff = Math.min(secs, OFFLINE_CAP);
  if (eff < 30) return null;
  const st0 = S.allStatic, sr0 = S.allStars, out0 = S.out;
  const came = [];
  // Ripening first-come: step in chunks so constellations that come out lift the TVs' glee.
  const n = Math.min(400, Math.ceil(eff / 30)), d = eff / n;
  for (let i = 0; i < n; i++) came.push(...tick(S, d, { away: true }).came);
  return { secs: eff, static: S.allStatic - st0, stars: S.allStars - sr0, came, out: S.out - out0 };
}

// ---------- Shop ----------
export const phase = S => S.ended || S.finale ? 'parade' : !S.permit ? 'dusk' : S.out >= 50 ? 'small' : 'night';
const purse = (S, cur) => cur === 'static' ? S.static : S.stars;
const spend = (S, cur, n) => { if (cur === 'static') S.static -= n; else S.stars -= n; };
export function formAvailable(S, f) {
  if (S.form[f.id] || (f.single && S.permit)) return false;
  return S.out >= f.need;
}
// Every item that can show, with its price. show: revealed (and then kept until bought).
export function items(S) {
  const out = [], seen = new Set(S.seen);
  const vis = (id, price, cur) => seen.has(id) || purse(S, cur) >= price * 0.5;
  for (const [id, V] of Object.entries(MACH)) {
    if (V.gate && !V.gate(S)) continue;
    const price = machCost(S, id);
    out.push({ id, cur: 'stars', kind: 'mach', name: V.name, price, count: S.own[id], full: !roomFor(S, id), show: vis(id, price, 'stars') || S.own[id] > 0 });
  }
  for (const [id, V] of Object.entries(LEVELS)) {
    if (V.gate && !V.gate(S)) continue;
    const price = levelCost(S, id);
    out.push({ id, cur: V.cur, kind: 'level', name: V.name, price, level: S.lv[id], capped: S.lv[id] >= V.max, show: vis(id, price, V.cur) || S.lv[id] > 0 });
  }
  for (const f of FORMS) {
    if (!formAvailable(S, f)) continue;
    if (f.single) out.push({ id: f.id, cur: 'stars', kind: 'form', form: f, name: f.title, price: f.fee, show: true });
    else for (const o of ['a', 'b']) out.push({ id: `${f.id}${o}`, cur: 'stars', kind: 'form', form: f, opt: o, name: f.opts[o].name, price: f.fee, show: true });
  }
  for (const o of ONE) {
    if (S.one[o.id]) continue;
    out.push({ id: o.id, cur: 'static', kind: 'one', name: o.name, price: o.cost, odd: true, show: vis(o.id, o.cost, 'static') });
  }
  return out.filter(i => i.show);
}
export function reveal(S) {
  const fresh = [];
  for (const it of items(S)) if (!S.seen.includes(it.id)) { S.seen.push(it.id); fresh.push(it.id); }
  return fresh;
}
export function find(S, id) { return items(S).find(i => i.id === id) || null; }
export function canBuy(S, id) {
  const it = find(S, id);
  if (!it || it.capped) return false;
  if (it.kind === 'mach' && it.full) return false;
  return purse(S, it.cur) >= it.price;
}
export function buy(S, id) {
  if (!canBuy(S, id)) return false;
  const it = find(S, id);
  spend(S, it.cur, it.price);
  if (it.kind === 'mach') { S.own[id]++; autoPlace(S); }
  else if (it.kind === 'level') S.lv[id]++;
  else if (it.kind === 'one') S.one[id] = true;
  else if (it.kind === 'form') {
    if (it.form.single) { S.permit = true; S.form.permit = 'x'; fixPath(S); }
    else {
      const w0 = size(S)[0];
      S.form[it.form.id] = it.opt;
      if (it.form.id === 't4' || it.form.id === 't7') growPath(S, w0);
    }
  }
  return true;
}
// The Bought shelf: one-offs and forms, in the order of the story.
export function bought(S) {
  const out = [];
  for (const f of FORMS) {
    if (f.single ? S.permit : S.form[f.id]) {
      const o = f.single ? { name: f.title, desc: f.desc, joke: f.joke } : f.opts[S.form[f.id]];
      out.push({ id: f.id, name: o.name, desc: `Form ${f.no}. ${o.desc}`, joke: o.joke, form: true });
    }
  }
  for (const o of ONE) if (S.one[o.id]) out.push({ id: o.id, name: o.name, desc: o.desc, joke: o.joke, odd: true });
  return out;
}

// ---------- Numbers ----------
const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : String(Math.floor(n));
  const e = Math.min(UNITS.length - 1, Math.floor(Math.log10(n) / 3));
  const v = n / Math.pow(1000, e);
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v)) + UNITS[e];
}
export function clock(s) {
  s = Math.max(0, Math.ceil(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
}
