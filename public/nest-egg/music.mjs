// Phase arrangements of Gutter Lullaby (slopwave r-505fc4307bc4), an 8-bit lullaby in A harmonic minor
// (A B C D E F G#), the same scale as the game's sound effects (scale('harmonic minor', 57)).
// The 64-bar composition (theme, embellished answer over a lament bass, inverted sequence, the theme handed to
// the counter-line under a descant, a C+ mystery climb, a harmonised duet, an augmented breakdown, and a return
// that ends on E so bar 64 leads back into bar 1) keeps its notes in every phase. Phases change tempo, layers
// and colour: room by room the house fills in. The last feast turns its cadences to A major (Picardy thirds) and
// the flown-south ending raises every A minor bar to A major (C to C#, the only notes outside the scale).
// Pass-level cycles of 3, 4, 5 and 7 complete 64-bar passes (filters, gain breathing, rests, where the echo
// and sparkle fall) run against each other, so the combined texture repeats only after 420 passes
// (one pass is 2.7-3.4 minutes).
//
// Synth voices only (Strudel built-ins): a 25% pulse lead, a square counter-line, a triangle bass, a white-noise
// tick. No samples, no soundfonts. The game calls
//   createMusic(A, { song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and calls music.update() when
// the phase key changes. Keys: p0 p1 p2 p3 feast end; unknown keys fall back to 'p0'. This module never starts
// playback, hushes, or changes global tempo; each result is [key, pattern, cps] and is cached per key.
import { createParts } from './song.mjs';

export const phases = {
  p0: { name: 'the living room', bpm: 78 },    // pulse lead over a soft triangle bass; sparse
  p1: { name: 'the hallway', bpm: 82 },        // the square counter-line joins, a soft tick on some passes
  p2: { name: 'the garage', bpm: 86 },         // bass octave bounce, steady tick, a chiptune echo
  p3: { name: 'the driveway', bpm: 90 },       // fullest but calm: brighter, a sparkle an octave up
  feast: { name: 'the last feast', bpm: 94 },  // brightest, wings, A major cadences
  end: { name: 'flown south', bpm: 76 },       // warm and sparse, resolved to A major
};

const BARS = 64;
// Per-pass bar lists: one 64-bar list of 1/0 per pass; the pattern steps one bar per cycle.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const bars = fn => '<' + Array.from({ length: BARS }, (_, i) => (fn(i) ? 1 : 0)).join(' ') + '>';
// Bars (0-based) whose chord is A minor in the score, and the section-closing cadences among them.
const A_MINOR = [0, 1, 4, 7, 8, 15, 22, 24, 25, 28, 31, 32, 36, 38, 40, 41, 44, 47, 50, 51, 56, 57, 60];
const CADENCES = [7, 15, 31, 47];

export function createSoundtrack(S) {
  const [low, mid, high, , , hat] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;
  const midiOf = n => (typeof n === 'number' ? n : S.noteToMidi(n));
  const shift = (p, by) => p.fmap(v => ({ ...v, note: midiOf(v.note) + by }));
  // Picardy: in the listed bars, every C becomes C# (A minor to A major).
  const picardy = (p, list) => {
    const on = bars(i => list.includes(i)), off = bars(i => !list.includes(i));
    return S.stack(p.mask(off), p.fmap(v => {
      const m = midiOf(v.note);
      return { ...v, note: m % 12 === 0 ? m + 1 : m };
    }).mask(on));
  };

  // Voice trims and per-phase trims, measured on the music bus
  // (.slopwave/work/nest-egg/integration/phase-check.mjs).
  const G = { all: 5.6, lead: 1.6, counter: 3.5, bass: 0.75, tick: 40, sparkle: 2.5,
    p0: 1, p1: 1, p2: 1, p3: 1, feast: 1, end: 1 };

  const lead = (p = high, f = 1, g = 1) => p.s('pulse').pw(0.25)
    .lpf(cyc([1700, 1500, 1900, 1600], f))                                                  // 4
    .attack(0.012).decay(0.3).sustain(0.4).release(0.25).pan(0.56).room(0.3)
    .mul(S.gain(cyc([1, 0.93, 0.98, 0.9, 0.96], G.lead * g)));                              // 5
  const counter = (p = mid, f = 1, g = 1) => p.s('square')
    .lpf(cyc([1100, 950, 1250], f))                                                         // 3
    .attack(0.003).decay(0.14).sustain(0).release(0.1).pan(0.42).room(0.25)
    .mul(S.gain(G.counter * g));
  const bass = (p = low, f = 1, g = 1) => p.s('triangle').lpf(900 * f)
    .attack(0.012).decay(0.3).sustain(0.7).release(0.15).mul(S.gain(G.bass * g));
  // Octave bounce: the bass re-struck on the beats, an octave up on the 'and's, chiptune style.
  const bounce = (g = 1) => S.stack(
    low.segment(4).s('triangle').legato(0.8).lpf(900).attack(0.008).decay(0.2).sustain(0.5).release(0.08)
      .mul(S.gain(G.bass * g)),
    shift(low.segment(4), 12).late(1 / 8).s('triangle').legato(0.6).lpf(1200)
      .attack(0.006).decay(0.12).sustain(0.2).release(0.06).mul(S.gain(G.bass * 0.45 * g)),
  );
  // The score's offbeat noise tick, with its accents.
  const tick = (g = 1) => hat.s('white').hpf(cyc([6500, 7200, 6000, 6800, 7600, 6200, 7000]))  // 7
    .decay(0.025).sustain(0).pan(0.6).mul(S.gain(G.tick * g));
  // Chiptune echo: the counter-line again a dotted eighth later, darker and quieter.
  const echo = (g = 1) => counter(mid.late(3 / 16), 0.75, 0.38 * g).pan(0.7);
  // Sparkle / wings: the counter-line an octave up on a soft triangle, a sixteenth late.
  const sparkle = (g = 1, f = 1) => shift(mid, 12).late(1 / 16).s('triangle').lpf(2600 * f)
    .attack(0.002).decay(0.09).sustain(0).release(0.08).pan(0.66).room(0.4).mul(S.gain(G.sparkle * 0.32 * g));

  const build = key => {
    if (key === 'p1') {
      // The hallway: the counter-line joins; the tick plays every third pass only, and every fifth pass the
      // counter-line sits out S7 (bars 49-56) so the breakdown is the lead alone.
      return [
        lead(high, 1),
        counter(mid, 0.95, 0.85).mask(rests(ALL, ALL, ALL, ALL, [[49, 56]])),                        // 5
        bass(low, 1),
        tick(0.6).mask(rests([[1, 64]], [[1, 64]], ALL)),                                             // 3
      ];
    }
    if (key === 'p2') {
      // The garage: the bass bounces in octaves, the tick is steady, and a dotted-eighth echo of the
      // counter-line comes and goes (which sections depends on the pass, a 4-cycle).
      return [
        lead(high, 1.03),
        counter(mid, 1),
        bounce(0.95),
        tick(0.85),
        echo().mask(rests([[1, 16], [33, 48]], [[17, 32], [49, 64]], [[1, 8], [25, 40]], [[9, 24], [41, 56]])), // 4
      ];
    }
    if (key === 'p3') {
      // The driveway, first frost: fullest but calm. Brighter filters, the echo throughout, the sparkle an
      // octave up on two of every three passes (different sections), the bass bounce.
      return [
        lead(high, 1.1),
        counter(mid, 1.1),
        bounce(1),
        tick(1),
        echo(1),
        sparkle(0.9).mask(rests([[1, 16], [49, 64]], [[17, 40]], [[1, 64]])),                        // 3
      ];
    }
    if (key === 'feast') {
      // The last feast and takeoff: brightest, A major at the section cadences, wings (the sparkle all the
      // way through), the lead doubled an octave down on a quiet square every other pass.
      return [
        lead(picardy(high, CADENCES), 1.2),
        counter(picardy(mid, CADENCES), 1.2),
        bounce(1.05),
        tick(1.05),
        echo(1.1),
        sparkle(1.1, 1.15),
        counter(shift(picardy(high, CADENCES), -12), 0.9, 0.35).sustain(0.3).decay(0.2)
          .mask(rests(ALL, [[1, 64]])),                                                                // 2 (x3,4,5,7)
      ];
    }
    if (key === 'end') {
      // Flown south: warm and slow. Every A minor bar is A major. The lead, held triangle roots, the
      // counter-line on the beats only, no tick; every fourth pass the counter-line rests through S1.
      return [
        lead(picardy(high, A_MINOR), 0.85, 0.95).room(0.45),
        counter(picardy(mid, A_MINOR).mask('1 0 1 0 1 0 1 0'), 0.8, 0.6).room(0.45)
          .mask(rests(ALL, ALL, ALL, [[1, 8]])),                                                      // 4
        bass(low, 0.9),
      ];
    }
    // p0, the living room: the pulse lead over the triangle bass. The counter-line only plays the theme it
    // takes over in S4 (bars 25-32), so the tune never disappears; every third pass the bass rests in S1.
    return [
      lead(high, 0.95),
      bass(low, 0.95).mask(rests(ALL, ALL, [[1, 8]])),                                                 // 3
      counter(mid, 0.9, 0.85).mask(bars(i => i >= 24 && i < 32)),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = Object.hasOwn(phases, phaseKey) ? phaseKey : 'p0';
    if (cache.has(key)) return cache.get(key);
    const trim = G.all * (G[key] ?? 1);
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(Object.hasOwn(phases, key) ? key : 'p0');
  return soundtrack;
}
