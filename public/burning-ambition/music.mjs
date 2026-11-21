// Phase arrangements of Think and Grow Wick (slopwave r-d2cc2cd26b30), kalimba folk in G major blues
// (G A Bb B D E), the same notes as the game's sound effects (scale('major blues', 67)). The 40-bar form
// (A1 open on D | A2 closing on G | B, the higher strain | C, the kalimba break | A3, the return) keeps its notes in
// every phase; phases change layers, tempo and tone, never key.
// Pass-level cycles of 3, 4, 5 and 7 passes (melody rests, the counter-line, guitar strum masks, the kalimba's
// brightness) run against each other, so a phase's texture repeats exactly only after 420 passes (about 12 hours).
//
// Sampled voices: VCSL kalimba for the session's ostinato and melody, gm_acoustic_bass (doubled softly by the
// session's triangle), gm_acoustic_guitar_nylon strumming the per-bar chords, VCSL shaker_small on the session's
// off-beat hats, VCSL tambourine in the sky phase. The session's soft sine kick is kept. The game calls
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  workshop: { name: 'The workshop (plinth and shaft)', bpm: 88 },  // kalimba, soft bass, the melody some passes
  roof: { name: 'Through the roof, above the town', bpm: 92 },      // + nylon guitar and the shaker
  sky: { name: 'Spire height and the crown', bpm: 96 },             // + a high kalimba counter-line, tambourine
  dark: { name: 'A power cut', bpm: 84 },                          // ostinato and bass, low-passed, far away
  end: { name: 'Lit: the epilogue', bpm: 80 },                     // warm: the hook over held guitar chords
};

const BARS = 40;
// Per-bar chords (v1/harmony.json).
const PROG = ['G', 'G', 'C', 'G', 'Em', 'C', 'D', 'D', 'G', 'G', 'C', 'G', 'Em', 'C', 'D', 'G',
  'C', 'C', 'G', 'Em', 'C', 'C', 'D', 'D', 'G', 'G', 'C', 'C', 'Em', 'Em', 'D', 'D',
  'G', 'G', 'C', 'G', 'Em', 'C', 'D', 'G'];
// Guitar voicings; D is D11 without F# (D A C E G), so nothing clashes with the Bb/B of the melody.
const STRUM = { G: 'g2,d3,g3,b3,d4,g4', C: 'c3,g3,c4,e4,g4', Em: 'e2,b2,e3,g3,b3,e4', D: 'd3,a3,c4,e4,g4' };
// High counter-line (sky): chord tones from the scale on the "and" of 2 and on 4.
const COUNTER = { G: ['d6', 'b5'], C: ['e6', 'g5'], Em: ['g5', 'e6'], D: ['a5', 'd6'] };

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 40-bar list per pass, given as bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
const ALL = [];

export function createSoundtrack(S) {
  const [low, middle, high, kick, , hat] = createParts(S);
  const cache = new Map();
  // One step per complete 40-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;
  const eighths = masks => '<' + masks.map(m => `[${m}]!${BARS}`).join(' ') + '>';

  // Layer and phase trims, balanced on the music bus (.slopwave/work/burning-ambition/integration/phase-check.mjs).
  const G = { kal: 2.2, mel: 2, bass: 0.9, gtr: 0.5, perc: 1, workshop: 1, roof: 1, sky: 1, dark: 1, end: 1 };

  // Samples ring on their own; the envelope only sets the release.
  const smp = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const kalimba = (f = 1) => smp(middle, 'kalimba', 0.5).lpf(cyc([3600, 3200, 4000, 3400, 3000, 3800, 3300], f))   // 7
    .pan(0.42).room(0.3).mul(S.gain(G.kal));
  const melody = (f = 1, rests = passes(ALL)) => smp(high, 'kalimba', 0.8).lpf(5200 * f).pan(0.6).room(0.4)
    .mask(rests).mul(S.gain(G.mel));
  const bass = (f = 1) => S.stack(
    smp(low, 'gm_acoustic_bass', 0.2).lpf(1200 * f).mul(S.gain(1.2 * G.bass)),
    low.lpf(520 * f).mul(S.gain(0.5 * G.bass)),
  );
  const guitar = (f = 1, mask = '1') => S.note(perBar(PROG.map(c => `[${STRUM[c]}] ~ [${STRUM[c]}] ~`).map(b => `[${b}]`)))
    .s('gm_acoustic_guitar_nylon').attack(0.001).decay(0.01).sustain(1).release(0.3)
    .gain(0.16).lpf(cyc([2200, 1900, 2400, 2000, 2100], f)).pan(0.32).room(0.2)                           // 5
    .mask(mask).mul(S.gain(G.gtr));
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', gain: gain * 90 })).n('[0 1 2 1]')
    .hpf(1500).lpf(5000).pan(0.7).mul(S.gain(cyc([1, 0.8, 0.92, 0.75], g * G.perc)));                    // 4
  const kickVoice = (g = 1) => kick.lpf(260).mul(S.gain(0.6 * g * G.perc));
  const counter = (g = 1) => S.note(perBar(PROG.map(c => `[~ ~ ~ ${COUNTER[c][0]} ~ ~ ${COUNTER[c][1]} ~]`)))
    .s('kalimba').attack(0.001).decay(0.01).sustain(1).release(0.7).gain(0.09).lpf(5000).pan(0.75).room(0.45)
    .mask(passes([[25, 40]], ALL, [[1, 16]], [[17, 32]])).mul(S.gain(g));                                  // 4
  const tamb = (g = 1) => S.n('[~ 0 ~ 1]').s('tambourine').gain('[~ .08 ~ .06]').hpf(2200).lpf(6500).pan(0.25)
    .mul(S.gain(cyc([1, 0.7, 0.9, 0, 0.85], g * G.perc)));                                                // 5

  const build = key => {
    if (key === 'workshop') {
      // Purl alone in the workshop: the kalimba rolling, a soft bass, the hook on some passes.
      return [
        kalimba(0.9),
        melody(0.92, passes(ALL, [[9, 24]], ALL)),                                                         // 3
        bass(0.9).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 1 0 0 1', '1 0 0 0 1 0 0 0'])),             // 3
        kickVoice(0.6),
      ];
    }
    if (key === 'roof') {
      return [
        kalimba(1),
        melody(1, passes(ALL, ALL, [[25, 32]])),                                                           // 3
        bass(1),
        guitar(1, eighths(['1 1 1 1 1 1 1 1', '1 0 1 1 1 0 1 1', '1 1 1 0 1 1 1 1', '1 1 1 1 1 1 1 0', '0 1 1 1 1 1 1 1'])), // 5
        kickVoice(), shaker(),
      ];
    }
    if (key === 'sky') {
      return [
        kalimba(1.1),
        melody(1.08, passes(ALL, ALL, [[17, 24]])),                                                        // 3
        bass(1.05),
        guitar(1.1, eighths(['1 1 1 1 1 1 1 1', '1 1 1 0 1 1 1 1', '1 0 1 1 1 1 1 1', '1 1 1 1 1 0 1 1', '1 1 1 1 1 1 1 1'])), // 5
        counter(1),
        kickVoice(1.05), shaker(1.05), tamb(),
      ];
    }
    if (key === 'dark') {
      // The power's out: only the kalimba and the bass, low-passed, as if through the wall.
      return [
        kalimba(0.4).room(0.5).mul(S.gain(0.9)),
        bass(0.7).mask(eighths(['1 0 0 0 1 0 0 0'])),
      ];
    }
    // end: lit. Warm and slow: the hook every pass, guitar on the downbeats, the kalimba softer.
    return [
      kalimba(0.75).mul(S.gain(0.7)),
      melody(0.95).room(0.5),
      bass(0.85).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 0 0 0 0', '1 0 0 0 1 0 0 1'])),                // 3
      guitar(0.85, eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 0 0 1 0', '1 0 1 0 1 0 0 0', '1 0 0 0 1 0 0 0'])).room(0.35), // 4
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'workshop';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'workshop');
  return soundtrack;
}
