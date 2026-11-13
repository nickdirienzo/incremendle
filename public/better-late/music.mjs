// Phase arrangements of Minute Wheel (slopwave r-f00c3e6a26d3), marimba minimalism in A minor pentatonic
// (A C D E G), the same scale as the game's sound effects (scale('minor pentatonic', 57)).
// The 64-bar composition (eight 8-bar sections: the first marimba builds its figure note by note, the second
// enters a sixteenth behind and rotates one eighth per section against it, both thin back to bar 1's two notes)
// keeps its notes in every phase. Phases change tempo, layers and colour, never key: the gear speeding up is
// the music speeding up and filling in. Pass-level cycles of 3, 4, 5 and 7 complete 64-bar passes (filters,
// gain breathing, rests, where vibes and glints fall) run against each other, so the combined texture takes
// 420 passes to repeat exactly (one pass is about 2.5-3.5 minutes).
//
// Sampled VCSL voices (already in public/shared/samples): marimba (both ostinati and the bass roots),
// balafon_soft (bass doubling and drone), vibraphone_soft (drone and colour), glockenspiel (glints, c3/c4 only),
// shaker_small (the soft offbeat pulse). No soundfonts.
// The game must call
//   createMusic(A, { packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(E.phaseKey(S)), and call music.update()
// when the phase key changes. Unknown keys fall back to 'c0'. This module never starts playback,
// hushes, or changes global tempo; each result is [key, pattern, cps] and is cached per key.
import { createParts } from './song.mjs';

export const phases = {
  c0: { name: '60 teeth', bpm: 84 },     // sparse: the first marimba alone over a low drone
  c1: { name: '48 teeth', bpm: 90 },     // the second marimba interlocks, bass marimba roots
  c2: { name: '36 teeth', bpm: 96 },     // bass marimba pulse, balafon, vibes colour, soft shaker
  c3: { name: '24 teeth', bpm: 104 },    // fullest: everything, glockenspiel glints
  c4: { name: '12 teeth', bpm: 112 },    // driving and bright, the last stretch
  slack: { name: 'One minute late', bpm: 72 }, // the pulse thins: held drone and a slow tick
  end: { name: 'Seconds is faster', bpm: 80 }, // warm and settled: the opening ostinato with vibes
};

const BARS = 64;
// Which bars of a pass play (1) or rest (0): one 64-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
// Per-pass bar lists: one 64-bar list of 1/0 per pass; the pattern steps one bar per cycle.
const passes = (...lists) => '<' + lists.flat().join(' ') + '>';
const bars = fn => Array.from({ length: BARS }, (_, i) => (fn(i) ? 1 : 0));
const NONE = bars(() => false);
// Block starts (bars 1, 5, 9, ...) whose block index mod 4 is in the set.
const blocks = set => bars(i => i % 4 === 0 && set.includes((i / 4) % 4));

export function createSoundtrack(S) {
  const [low, mid, high, , , hat] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Voice trims and per-phase trims, measured on the music bus
  // (.slopwave/work/better-late/integration/phase-check.mjs).
  const G = { high: 1.4, mid: 1.3, bass: 1.5, bala: 0.9, vibes: 1.6, glock: 0.5, shaker: 1,
    c0: 1, c1: 1, c2: 1, c3: 1, c4: 1, slack: 1, end: 1 };

  // Samples ring on their own; the envelope only sets the attack and the release after the gate.
  const smp = (p, name, release, attack = 0.002) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);

  const marimbaHigh = (f = 1, g = 1) => smp(high, 'marimba', 0.45)
    .lpf(cyc([3000, 2600, 3400, 2800], f)).pan(0.6).room(0.22)                               // 4
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.9, 0.95], G.high * g)));                                // 5
  const marimbaMid = (f = 1, g = 1) => smp(mid, 'marimba', 0.4)
    .lpf(cyc([2400, 2100, 2700], f)).pan(0.38).room(0.22)                                     // 3
    .mul(S.gain(G.mid * g));
  // Bass marimba: the held roots (with the 'and of 4' pickup), or re-struck on eighths as a pulse.
  const bassRoots = (g = 1) => smp(low, 'marimba', 1.2).lpf(1100).room(0.2).mul(S.gain(G.bass * g));
  const bassPulse = (g = 1, f = 1) => smp(low.segment(8), 'marimba', 0.25).legato(0.9)
    .lpf(cyc([1100, 950, 1250], f)).room(0.15)                                                  // 3
    .mul(S.gain('[1 .62 .78 .62]*2')).mul(S.gain(G.bass * 0.85 * g));
  const balafon = (p, g = 1, release = 0.6) => smp(p, 'balafon_soft', release)
    .lpf(900).pan(0.46).room(0.2).mul(S.gain(G.bala * g));
  // Drone: the bar's root only (the pickup is masked out), held and let ring.
  const roots = low.mask('1 0 0 0');
  const vibesDrone = (g = 1) => smp(roots, 'vibraphone_soft', 2.2, 0.03).legato(1.1)
    .lpf(1800).pan(0.5).room(0.45).mul(S.gain(G.vibes * g));
  // Vibes colour: the first marimba's downbeat note, rung long on selected block starts.
  const vibesColour = (mask, g = 1) => smp(high.mask('1 0 0 0'), 'vibraphone_soft', 1.8, 0.01).legato(3)
    .mask(mask).lpf(2600).pan(0.56).room(0.45).mul(S.gain(G.vibes * 0.8 * g));
  // Glints: the first marimba an octave up on a few downbeats, very quiet.
  const glints = (mask, g = 1) => smp(high.mask('1 0 0 0 0 0 0 0'), 'glockenspiel', 1.2)
    .fmap(v => ({ ...v, note: (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note)) + 12 }))
    .mask(mask).lpf(5000).pan(0.66).room(0.45).mul(S.gain(G.glock * g));
  // Shaker: the score's offbeat 'and's (a soft quarter-offbeat pulse), keeping the score's accents
  // (score levels .06 on the 'and' of 1 and 3, .045 on 2 and 4, scaled by the song's drum bus 0.4 * 0.12).
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', n: gain > 0.0025 ? 0 : 2, gain: gain / 0.048 * 5 }))
    .hpf(2500).lpf(cyc([7000, 6200, 7600, 6600, 7200, 6000, 6800])).pan(0.55)                // 7
    .mul(S.gain(G.shaker * g));

  const build = key => {
    if (key === 'c1') {
      // 48 teeth: the second marimba interlocks; bass marimba holds the roots. Every fifth pass the second
      // marimba sits out S4 (bars 25-32); every third pass a soft vibes drone joins.
      return [
        marimbaHigh(0.95),
        marimbaMid(0.95).mask(rests(ALL, ALL, ALL, ALL, [[25, 32]])),                              // 5
        bassRoots(0.9),
        vibesDrone(0.55).mask(rests([[1, 64]], [[1, 64]], ALL)),                                   // 3
      ];
    }
    if (key === 'c2') {
      // 36 teeth: the bass marimba pulse arrives (eighths) with balafon on the roots, vibes colour on block
      // starts (which blocks depends on the pass, a 4-cycle), the soft shaker on the offbeats.
      const colour = passes(blocks([1, 3]), blocks([0, 2]), blocks([1, 2]), blocks([0, 3]));
      return [
        marimbaHigh(1),
        marimbaMid(1),
        bassPulse(0.85),
        balafon(roots, 0.7, 0.9),
        vibesColour(colour, 1),                                                                     // 4
        shaker(0.8).mask(rests(ALL, ALL, ALL, ALL, ALL, ALL, [[9, 24]])),                          // 7
      ];
    }
    if (key === 'c3') {
      // 24 teeth: fullest. Both ostinati brighter, the bass pulse with balafon doubling, the shaker throughout,
      // vibes drone, glockenspiel glints on the downbeat of every other bar (odd bars or even bars by pass).
      const glint = passes(bars(i => i % 2 === 0), bars(i => i % 2 === 1 && i % 8 !== 7), NONE);
      return [
        marimbaHigh(1.1),
        marimbaMid(1.1, 1.05),
        bassPulse(1),
        balafon(low.segment(4), 0.6, 0.4),
        vibesDrone(0.6).mask(rests(ALL, ALL, ALL, ALL, [[49, 64]])),                                // 5
        shaker(1),
        glints(glint),                                                                              // 3
      ];
    }
    if (key === 'c4') {
      // 12 teeth, the last stretch: fast, bright, driving. The bass pulse leads, balafon on every beat,
      // the shaker throughout, sparse glints on block starts every other pass.
      return [
        marimbaHigh(1.2, 1.05),
        marimbaMid(1.2, 1.05),
        bassPulse(1.1, 1.15),
        balafon(low.segment(4), 0.7, 0.3),
        shaker(1.1),
        glints(passes(blocks([0, 1, 2, 3]), NONE, blocks([0, 2]), NONE, NONE), 0.8),               // 5
      ];
    }
    if (key === 'slack') {
      // One minute late, being talked out of the last cut: the pulse thins to a held drone (vibes and balafon
      // on the roots) and a slow tick of the first marimba's moving line on each beat. The second marimba
      // drifts in with its group starts every third pass.
      return [
        vibesDrone(1),
        balafon(roots, 0.8, 1.6).legato(1.1),
        smp(high.mask('1 0 1 0 1 0 1 0'), 'marimba', 0.5).lpf(cyc([2000, 1700, 2200, 1850])).pan(0.58)   // 4
          .room(0.35).mul(S.gain(G.high * 0.85)),
        smp(mid.mask('1 0 0 1 0 0 1 0'), 'marimba', 0.5).lpf(1600).pan(0.4).room(0.35)
          .mul(S.gain(G.mid * 0.5)).mask(rests([[1, 64]], [[1, 64]], ALL)),                         // 3
      ];
    }
    if (key === 'end') {
      // They lose the dare and don't mind: the opening ostinato, warm and unhurried, with vibes on the roots and
      // on the first marimba's downbeats, balafon roots; the second marimba only in passing, every fifth pass.
      return [
        marimbaHigh(0.85, 1),
        vibesDrone(0.9),
        vibesColour('1', 0.7).mask(rests(ALL, [[1, 8], [57, 64]], ALL, ALL)),                      // 4
        balafon(roots, 0.6, 1.4),
        marimbaMid(0.8, 0.6).mask(rests([[1, 64]], [[1, 64]], [[1, 64]], [[1, 64]], [[1, 24], [49, 64]])), // 5
      ];
    }
    // c0, 60 teeth: one marimba ostinato over a low drone (bass marimba roots, balafon held under them).
    // The balafon rests through S1 every third pass, so some passes open on the marimba alone.
    return [
      marimbaHigh(0.9),
      bassRoots(0.8),
      balafon(roots, 0.6, 1.4).legato(1.1).mask(rests(ALL, ALL, [[1, 8]])),                          // 3
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = Object.hasOwn(phases, phaseKey) ? phaseKey : 'c0';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(Object.hasOwn(phases, key) ? key : 'c0');
  return soundtrack;
}
