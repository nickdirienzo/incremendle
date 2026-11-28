// Phase arrangements of The Cobwell Service (slopwave r-4c6c77b7a450), marimba minimalism in E harmonic minor
// (E F# G A B C D#), the same scale as the game's sound effects (scale('harmonic minor', 64)).
// The 64-bar composition (A: the first marimba's figure grows note by note; B: regrouped 3+3+2 with the second
// marimba an eighth behind; C: a slow melody on the second marimba; A': the figure sheds notes back to bar 1)
// keeps its notes in every phase. Phases change tempo, layers and colour, never key, so the knock markers stay on
// the beat the player hears. Pass-level cycles of 3, 4 and 5 complete 64-bar passes (filters, gain breathing, rests,
// where vibes and glints fall) run against each other, so the texture takes 60 passes (about 2.6-3.4 minutes each)
// to repeat exactly.
//
// Sampled VCSL voices (already in public/shared/samples): marimba (both marimbas and the bass), vibraphone_soft
// (drone and colour), glockenspiel (glints: teacups), shaker_small (the offbeat pulse). No soundfonts.
// The game calls createMusic(A, { packs: ['vcsl'], song }) with
// song = () => (soundtrack ??= createSoundtrack(music.strudel))(E.phaseOf(S)), and music.update() on a phase change.
// Unknown keys fall back to 'down'. This module never starts playback, hushes, or changes global tempo; each result
// is [key, pattern, cps] and is cached per key.
import { createParts } from './song.mjs';

export const phases = {
  down: { name: 'Downstairs', bpm: 88 },            // the first marimba's figure over bass roots, vibes now and then
  up: { name: 'Upstairs', bpm: 94 },                // the second marimba interlocks, vibes colour, the shaker
  top: { name: 'The top of the house', bpm: 100 },  // fullest: brighter marimbas, glockenspiel glints, the drone
  end: { name: 'The Cellar', bpm: 76 },             // slow and warm: the figure, the melody, vibes on the roots
};

const BARS = 64;
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
// Which bars of a pass play: one 64-bar list per pass, given as the bar ranges that rest. One step per bar.
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const passes = (...lists) => '<' + lists.flat().join(' ') + '>';
const bars = fn => Array.from({ length: BARS }, (_, i) => (fn(i) ? 1 : 0));
const NONE = bars(() => false);
// Bars that start a chord (every other bar) whose index mod 4 is in the set.
const chords = set => bars(i => i % 2 === 0 && set.includes((i / 2) % 4));

export function createSoundtrack(S) {
  const [low, mid, high, , , hat] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;
  // Voice trims and per-phase trims, measured on the music bus (npm run mix -- knock-on-wood --music-only).
  const G = { high: 1.5, mid: 1.35, bass: 1.6, vibes: 1.5, glock: 0.45, shaker: 0.9, down: 1, up: 1, top: 0.95, end: 1.2 };
  // Samples ring on their own; the envelope only sets the attack and the release after the gate.
  const smp = (p, name, release, attack = 0.002) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);

  const marimbaHigh = (f = 1, g = 1) => smp(high, 'marimba', 0.4)
    .lpf(cyc([3200, 2700, 3500, 2900], f)).pan(0.6).room(0.2)                                   // 4
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.9, 0.95], G.high * g)));                                    // 5
  const marimbaMid = (f = 1, g = 1) => smp(mid, 'marimba', 0.6)
    .lpf(cyc([2600, 2200, 2900], f)).pan(0.38).room(0.24)                                         // 3
    .mul(S.gain(G.mid * g));
  const bass = (g = 1) => smp(low, 'marimba', 1.1).lpf(1000).room(0.18).mul(S.gain(G.bass * g));
  // The bass pulse: the bar's root re-struck on quarters (the top of the house).
  const bassPulse = (g = 1) => smp(low.mask('1 0 0 0').segment(4), 'marimba', 0.3).legato(0.9).lpf(950).room(0.15)
    .mul(S.gain('1 .6 .75 .6')).mul(S.gain(G.bass * 0.8 * g));
  const roots = low.mask('1 0 0 0');
  const vibesDrone = (g = 1) => smp(roots, 'vibraphone_soft', 2.2, 0.03).legato(1.1)
    .lpf(1800).pan(0.5).room(0.45).mul(S.gain(G.vibes * g));
  // Vibes colour: the first marimba's downbeat note, rung long on selected chord starts.
  const vibesColour = (mask, g = 1) => smp(high.mask('1 0 0 0 0 0 0 0'), 'vibraphone_soft', 1.8, 0.01).legato(3)
    .mask(mask).lpf(2600).pan(0.56).room(0.45).mul(S.gain(G.vibes * 0.8 * g));
  // Glints: teacups. The first marimba an octave up on a few downbeats, very quiet.
  const glints = (mask, g = 1) => smp(high.mask('1 0 0 0 0 0 0 0'), 'glockenspiel', 1.2)
    .fmap(v => ({ ...v, note: (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note)) + 12 }))
    .mask(mask).lpf(5000).pan(0.66).room(0.45).mul(S.gain(G.glock * g));
  // Shaker: the score's offbeat eighths, exactly on the 'and's, keeping its accents.
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', n: gain > 0.0045 ? 0 : 2, gain: gain / 0.042 * 4 }))
    .hpf(2500).lpf(cyc([7000, 6200, 7600, 6600])).pan(0.55)                                       // 4
    .mul(S.gain(G.shaker * g));

  const build = key => {
    if (key === 'up') {
      // Upstairs: the second marimba joins (resting through the melody every fifth pass), vibes colour on
      // chord starts that move with the pass (a 4-cycle), the shaker on the offbeats.
      const colour = passes(chords([0, 2]), chords([1, 3]), chords([0, 3]), chords([1, 2]));
      return [
        marimbaHigh(1),
        marimbaMid(1).mask(rests(ALL, ALL, ALL, ALL, [[33, 48]])),                                 // 5
        bass(1),
        vibesColour(colour, 1),                                                                     // 4
        shaker(0.85).mask(rests(ALL, ALL, [[17, 24]])),                                             // 3
      ];
    }
    if (key === 'top') {
      // The top of the house: brighter, the bass pulse on quarters, the drone, glints on chord starts.
      const glint = passes(chords([0, 2]), chords([1, 3]), NONE);
      return [
        marimbaHigh(1.1, 1.05),
        marimbaMid(1.1, 1.05),
        bassPulse(1),
        vibesDrone(0.55).mask(rests(ALL, ALL, ALL, ALL, [[49, 64]])),                                // 5
        shaker(1),
        glints(glint),                                                                              // 3
      ];
    }
    if (key === 'end') {
      // The Cellar, every cup home: the figure unhurried, the melody every pass, vibes on the roots.
      return [
        marimbaHigh(0.85, 0.9),
        marimbaMid(0.85, 0.95),
        vibesDrone(0.9),
        bass(0.7),
        glints(passes(chords([0]), NONE, NONE), 0.7),                                               // 3
      ];
    }
    // Downstairs: the first marimba's figure over the bass roots. The second marimba only joins for the melody
    // every third pass; a soft vibes drone every other pass.
    return [
      marimbaHigh(0.95),
      bass(0.9),
      marimbaMid(0.9, 0.8).mask(passes(NONE, NONE, bars(i => i >= 32 && i < 48))),                 // 3
      vibesDrone(0.5).mask(rests([[1, 64]], ALL)),                                                 // 2
    ];
  };

  const soundtrack = phaseKey => {
    const key = Object.hasOwn(phases, phaseKey) ? phaseKey : 'down';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(Object.hasOwn(phases, key) ? key : 'down');
  return soundtrack;
}
