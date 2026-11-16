// Phase arrangements of the Lights-Out Shanty (slopwave r-c82a48ddc06a), a hushed campfire sea shanty in
// D in-sen (D Eb G A C), the same scale as the game's sound effects (scale('in-sen', 62)).
// The 64-bar composition (verse, call-and-response chorus, varied verse with fills, ornamented chorus, an Eb
// bridge, the call handed to the counter-line under a descant, a half-time chorus, and a final chorus answered
// by everyone that ends on A-sus so bar 64 leads back to bar 1's D) keeps its notes in every phase. Phases
// change tempo, layers and colour: as the park lights up, more of the campfire joins in. Every pitch, endings
// included, is in D in-sen; the harmony is open fifths and quartal drones, never triads.
// Pass-level cycles of 3, 4, 5 and 7 complete 64-bar passes (filters, gain breathing, rests, octave colour) run
// against each other, so the combined texture repeats exactly only after 140 (p2, keys) or 420 passes (the
// other phases); one pass is 2.5-3 minutes.
//
// Synth voices only (Strudel built-ins): a low-passed square squeezebox (the lead; a hummed triangle in p1), a
// sawtooth squeezebox drone, a bowed sawtooth fiddle counter-line, a triangle bass, a sine stomp and a pink-noise
// clap. No samples, no soundfonts. The game calls
//   createMusic(A, { song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and calls music.update() when
// the phase key changes. Keys: p1 p2 p3 p4 p5 keys lid; unknown keys fall back to 'p1'. This module never
// starts playback, hushes, or changes global tempo; each result is [key, pattern, cps] and is cached per key.
import { createParts } from './song.mjs';

export const phases = {
  p1: { name: 'the shower block', bpm: 88 },     // drone and a hummed tune, the answers hummed too; stomp on 1
  p2: { name: 'the tent meadow', bpm: 92 },      // squeezebox tune, plucked bass, soft clap on the backbeat
  p3: { name: 'caravan row', bpm: 96 },          // full stomp-and-clap, the fiddle counter-line answering
  p4: { name: 'the yurts in the woods', bpm: 86 }, // half time, more drone, the fiddle high and distant
  p5: { name: 'the clubhouse', bpm: 100 },       // everyone in, every answer sung by the whole campfire
  keys: { name: 'the bin takes the keys', bpm: 84 }, // stately: squeezebox alone over a drone, doubled below
  lid: { name: 'Dobbin gets the lid', bpm: 104 },  // giddy: the tune lifted an octave, ends on the open D fifth
};

const BARS = 64;
// The score's harmony per bar (.slopwave/work/who-left-the-lights-on/plan.json) as squeezebox drone shapes:
// D5 [d3,a3], G5 [g2,d3], C5 [c3,g3], Eb [ds3,g3], A-sus [a2,d3,g3] (v2/arrangement.json).
const SHAPE = { D: '[d3,a3]', G: '[g2,d3]', C: '[c3,g3]', Eb: '[ds3,g3]', Asus: '[a2,d3,g3]' };
const PROG = [
  'D', 'D', 'D', 'D', 'C', 'C', 'D', 'D',            // S1 verse 1
  'G', 'G', 'D', 'D', 'C', 'C', 'D', 'D',            // S2 chorus 1
  'D', 'D', 'D', 'D', 'G', 'G', 'Asus', 'D',         // S3 verse 2
  'G', 'G', 'D', 'D', 'C', 'C', 'Asus', 'D',         // S4 chorus 2
  'C', 'C', 'Eb', 'Eb', 'C', 'C', 'Asus', 'Asus',    // S5 bridge
  'D', 'D', 'D', 'D', 'C', 'C', 'D', 'D',            // S6 verse 3 (the counter takes the call)
  'G', 'G', 'G', 'G', 'D', 'D', 'Eb', 'Asus',        // S7 half-time chorus
  'G', 'G', 'D', 'D', 'C', 'C', 'Asus', 'Asus',      // S8 final chorus
];
// Bars (0-based) where the counter-line carries the tune: the chorus answers and the S6 hand-off. Phases
// without the fiddle sing these on the lead voice so the call is always answered.
const TUNE_BARS = [9, 11, 13, 14, 15, 25, 27, 29, 30, 31, 40, 41, 42, 43, 44, 45, 46, 47, 50, 51, 54, 55,
  57, 59, 61, 62, 63];

const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
// Which bars play (1) or rest (0): one 64-bar list per pass, given as 1-based bar ranges that rest.
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const bars = fn => '<' + Array.from({ length: BARS }, (_, i) => (fn(i) ? 1 : 0)).join(' ') + '>';

export function createSoundtrack(S) {
  const [low, mid, high, kick, snare] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;
  const midiOf = n => (typeof n === 'number' ? n : S.noteToMidi(n));
  const shift = (p, by) => p.fmap(v => ({ ...v, note: midiOf(v.note) + by }));
  const droneNotes = (prog = PROG) => S.note('<' + prog.map(c => SHAPE[c]).join(' ') + '>');

  // Voice trims and per-phase trims, measured on the music bus
  // (.slopwave/work/who-left-the-lights-on/integration/phase-check.mjs).
  const G = { all: 4, lead: 1.5, hum: 2.4, counter: 2.1, bass: 0.8, drone: 0.11, stomp: 0.9, clap: 6,
    p1: 1.24, p2: 1.36, p3: 1.17, p4: 1.23, p5: 0.92, keys: 0.89, lid: 1.44 };

  // The squeezebox: a low-passed square with a bellows-slow attack.
  const lead = (p = high, f = 1, g = 1) => p.s('square')
    .lpf(cyc([950, 850, 1050, 900], f))                                                     // 4
    .attack(0.045).decay(0.3).sustain(0.55).release(0.22).pan(0.56).room(0.3)
    .mul(S.gain(cyc([1, 0.94, 0.98, 0.9, 0.96], G.lead * g)));                              // 5
  // The hummed tune of the first phase: a soft triangle, a little breath of low-pass.
  const hum = (p = high, f = 1, g = 1) => p.s('triangle').lpf(1100 * f)
    .attack(0.06).decay(0.4).sustain(0.6).release(0.3).pan(0.52).room(0.35)
    .mul(S.gain(cyc([1, 0.92, 0.97], G.hum * g)));                                          // 3
  // The fiddle: a bowed sawtooth, brighter than the squeezebox, slower attack.
  const counter = (p = mid, f = 1, g = 1) => p.s('sawtooth')
    .lpf(cyc([1500, 1300, 1700], f))                                                        // 3
    .attack(0.06).decay(0.25).sustain(0.4).release(0.2).pan(0.36).room(0.32)
    .mul(S.gain(G.counter * g));
  // The answers and the S6 hand-off on the lead's voice, for phases without the fiddle.
  const answers = mid.mask(bars(i => TUNE_BARS.includes(i)));
  // Bass: plucked on 1 and 3 (the score's roots and fifths, sampled on the half bar).
  const pluck = (g = 1, per = 2) => low.segment(per).s('triangle').legato(0.7).lpf(650)
    .attack(0.008).decay(0.32).sustain(0.15).release(0.12).mul(S.gain(G.bass * g));
  // The score's bass as written (held roots, verse lilt, chorus oom-pah).
  const bass = (g = 1, f = 1) => low.s('triangle').lpf(700 * f)
    .attack(0.012).decay(0.35).sustain(0.6).release(0.15).mul(S.gain(G.bass * g));
  // The squeezebox drone: one shape per bar, the bellows swelling at each bar line.
  const drone = (g = 1, f = 1, prog = PROG) => droneNotes(prog).s('sawtooth')
    .lpf(cyc([480, 420, 540, 450, 500, 400, 520], f))                                       // 7
    .attack(0.35).decay(0.4).sustain(0.85).release(0.5).legato(1).pan(0.45).room(0.25)
    .mul(S.gain(cyc([1, 0.9, 0.96, 0.86], G.drone * g)));                                   // 4
  // Stomp: a soft low sine thump. Clap: a short band of pink noise.
  const stomp = (p = kick, g = 1) => p.s('sine').freq(55).penv(10).pdecay(0.05).lpf(400)
    .decay(0.16).sustain(0).mul(S.gain(G.stomp * g));
  const clap = (p = snare, g = 1) => p.s('pink').hpf(cyc([900, 1100, 800, 1000, 950], 1)).lpf(3200) // 5
    .attack(0.002).decay(0.07).sustain(0).pan(0.62).room(0.2).mul(S.gain(G.clap * g));
  const onOne = kick.mask('1 0 0 0');

  const build = key => {
    if (key === 'p2') {
      // The tent meadow: the squeezebox takes the tune and the answers; the bass plucks on 1 and 3 (resting
      // through S1 every fourth pass); the stomp stays on 1 and a soft clap comes in on the backbeat.
      return [
        drone(1),
        lead(high, 1, 0.95),
        lead(answers, 0.95, 0.85),
        pluck(1).mask(rests(ALL, ALL, ALL, [[1, 8]])),                                         // 4
        stomp(onOne, 0.95),
        clap(snare, 0.75),
      ];
    }
    if (key === 'p3') {
      // Caravan row: the fiddle answers the call; the bass as written; full stomp and clap. Every fifth pass
      // the fiddle sits out the S3 fills, so verse 2 is the squeezebox alone over the stomp.
      return [
        drone(0.9),
        lead(high, 1.05),
        counter(mid, 1).mask(rests(ALL, ALL, ALL, ALL, [[17, 24]])),                           // 5
        bass(1),
        stomp(kick, 1),
        clap(snare, 1),
      ];
    }
    if (key === 'p4') {
      // The yurts in the woods: half time, darker. More drone (an octave up joins, quiet), the squeezebox
      // darker, the fiddle an octave up, distant and quiet in the room; the bass only on the bar line; stomp on
      // 1, clap on 3. Every third pass the fiddle rests through S1-S2 so the woods start nearly empty.
      return [
        drone(1.25, 0.9),
        shift(droneNotes(), 12).s('triangle').lpf(900).attack(0.5).sustain(0.8).release(0.6).legato(1)
          .room(0.5).pan(0.4).mul(S.gain(G.drone * 0.9)),
        lead(high, 0.85, 0.95),
        counter(shift(mid, 12), 1.15, 0.6).room(0.6).pan(0.25).mask(rests(ALL, ALL, [[1, 16]])), // 3
        pluck(1.05, 1).legato(1.6),
        stomp(onOne, 0.95),
        S.s('pink').struct('~ ~ x ~').hpf(1000).lpf(3000).decay(0.07).sustain(0).pan(0.62).room(0.3)
          .gain(0.3).mul(S.gain(G.clap * 0.75)),
      ];
    }
    if (key === 'p5') {
      // The clubhouse, Dobbin's own door: everything in, a touch faster and brighter. Every answer is sung by
      // the fiddle and the squeezebox an octave down; on two passes of every seven the hum joins the tune.
      return [
        drone(1, 1.1),
        lead(high, 1.12),
        counter(mid, 1.1),
        lead(shift(answers, -12), 0.9, 0.55),
        hum(high, 1, 0.45).mask(rests(ALL, [[1, 64]], [[1, 64]], ALL, [[1, 64]], [[1, 64]], [[1, 64]])), // 7
        bass(1.05, 1.1),
        stomp(kick, 1.05),
        clap(snare, 1.1),
      ];
    }
    if (key === 'keys') {
      // The bin takes the keys: slow and stately. The squeezebox alone (it sings the answers too) doubled an
      // octave down for pomp, over a drone with its roots an octave below. No drums.
      return [
        drone(1.15, 0.95),
        shift(droneNotes(), -12).s('triangle').lpf(500).attack(0.3).sustain(0.9).release(0.5).legato(1)
          .mul(S.gain(G.drone * 1.2)),
        lead(high, 0.95, 1.05).room(0.45),
        lead(answers, 0.9, 0.9).room(0.45),
        lead(shift(S.stack(high, answers), -12), 0.7, 0.5).pan(0.48),
      ];
    }
    if (key === 'lid') {
      // Dobbin gets the lid: warm, quick and giddy. The tune lifted an octave (soft, filtered), the fiddle in
      // its own register, plucked bass, stomp and clap. The last two bars sit on the open D fifth instead of
      // A-sus, bass included.
      const LID = [...PROG.slice(0, 62), 'D', 'D'];
      const lastTwo = bars(i => i >= 62);
      return [
        drone(1, 1.05, LID),
        lead(shift(high, 12), 1.6, 0.62),
        lead(high, 1.05, 0.4),
        counter(mid, 1.15, 0.9),
        pluck(1).mask(bars(i => i < 62)),
        S.note('<' + Array.from({ length: BARS }, (_, i) => (i >= 62 ? '[d2 a2]' : '~')).join(' ') + '>')
          .s('triangle').legato(0.7).lpf(650).attack(0.008).decay(0.32).sustain(0.15).release(0.12)
          .mul(S.gain(G.bass * 0.42)).mask(lastTwo),
        stomp(kick, 1),
        clap(snare, 1.05),
      ];
    }
    // p1, the shower block: the drone and a hummed tune, the hummer singing the answers too; a soft stomp on
    // 1 only. Every third pass the stomp rests through the bridge; every fifth pass the hum drops an octave
    // for the bridge (S5), as if someone turned over in their sleeping bag.
    const bridge = bars(i => i >= 32 && i < 40);
    const notBridge = bars(i => i < 32 || i >= 40);
    const plainPasses = rests(ALL, ALL, ALL, ALL, [[1, 64]]);                                 // 5
    const lowPasses = rests([[1, 64]], [[1, 64]], [[1, 64]], [[1, 64]], ALL);
    return [
      drone(1.1),
      hum(high).mask(notBridge),
      hum(high).mask(bridge).mask(plainPasses),
      hum(shift(high, -12), 1, 1.1).mask(bridge).mask(lowPasses),
      hum(answers, 0.95, 0.9),
      stomp(onOne, 0.85).mask(rests(ALL, ALL, [[33, 40]])),                                   // 3
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = Object.hasOwn(phases, phaseKey) ? phaseKey : 'p1';
    if (cache.has(key)) return cache.get(key);
    const trim = G.all * (G[key] ?? 1);
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(Object.hasOwn(phases, key) ? key : 'p1');
  return soundtrack;
}
