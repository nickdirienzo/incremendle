// Phase arrangements of Memo re: Lunch (slopwave r-c439ea3792c2), a jazzy walking-bass quartet in D natural minor
// (D E F G A Bb C), the same notes as the game's sound effects (scale('minor', 62)): no C#, no B natural anywhere.
// The 48-bar form (A1 open on Am7 | A2 closing on Dm7 | B, the bridge | A3, the return | C, a 16-bar solo chorus)
// keeps its notes in every phase; phases change layers, tempo and tone, never key.
// Pass-level cycles of 3, 4, 5 and 7 passes (melody rests, comping masks and fills, the piano's answers, the bass
// and piano filters, the ride) run against each other, so a phase's texture repeats exactly only after 420 passes
// (about 11 hours at 120 BPM).
//
// Sampled voices: gm_acoustic_bass walks the session's bass line (doubled softly by its triangle), gm_piano plays the
// session's shell voicings, VCSL vibraphone_soft the melody. Brushes are the session's brush stem twice over: a soft
// filtered-noise swish and VCSL snare_modern taps; VCSL hihat (closed) is the pedal chick on 2 and 4; the session's
// feathered sine kick is kept; VCSL sus_cymbal stick hits ride in the rush. The game calls
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  lunch: { name: 'The small canteen', bpm: 112 },    // walking bass, brushes, sparse piano, the vibes some passes
  service: { name: 'Annexes open', bpm: 120 },        // + the vibes most passes, fuller comping
  rush: { name: 'The lunch rush', bpm: 128 },         // + the ride cymbal, the piano's answers, a bit brighter
  end: { name: 'Something light', bpm: 84 },          // the ballad: bass in half notes, vibes over held piano chords
};

const BARS = 48;
// Per-bar chords, piano voicings, comping rhythm names and the walking line's roots (v1/harmony.json).
const PROG = ['Dm7', 'Gm7', 'C7', 'Fmaj7', 'Bbmaj7', 'Em7b5', 'Am7', 'Am7', 'Dm7', 'Gm7', 'C7', 'Fmaj7', 'Bbmaj7', 'Em7b5', 'Am7', 'Dm7',
  'Bbmaj7', 'Bbmaj7', 'Am7', 'Dm7', 'Gm7', 'C7', 'Fmaj7', 'Am7', 'Dm7', 'Gm7', 'C7', 'Fmaj7', 'Bbmaj7', 'Em7b5', 'Am7', 'Dm7',
  'Dm7', 'Dm7', 'Gm7', 'Gm7', 'Em7b5', 'Am7', 'Dm7', 'Dm7', 'Bbmaj7', 'Bbmaj7', 'Gm7', 'C7', 'Fmaj7', 'Em7b5', 'Am7', 'Am7'];
const V = { D: 'c4,f4,a4', G: 'bb3,f4,a4', C: 'bb3,e4,g4', F: 'a3,e4,g4', B: 'a3,d4,f4', b: 'd4,a4,c5', E: 'g3,d4,bb4', A: 'c4,e4,g4' };
const VOICING = 'DGCFBEAA DGCFBEAD bbADGCFA DGCFBEAD DDGGEADD bbGCFEAA'.replace(/ /g, '').split('').map(k => V[k]);
const COMP = ('one rest ch rest one late rest hold ch rest 24 one push rest ch hold hold late one ch hold push 24 one ' +
  'ch rest push one ch late ch hold rest one rest ch late rest and4 ch hold push 24 ch one late ch rest').split(' ');
const ROOTS = ['d2', 'g2', 'c2', 'f2', 'bb2', 'e2', 'a2', 'a2', 'd2', 'g2', 'c3', 'f2', 'bb2', 'e2', 'a1', 'd2',
  'bb1', 'bb2', 'a2', 'd2', 'g2', 'c2', 'f2', 'a2', 'd2', 'g2', 'c3', 'f2', 'bb2', 'e2', 'a1', 'd2',
  'd3', 'd3', 'g2', 'g2', 'e2', 'a2', 'd2', 'd3', 'bb2', 'bb2', 'g2', 'c3', 'f2', 'e2', 'a2', 'a2'];
// The ballad's half-note bass: the root, then the fifth below (or above, for the low roots). Every fifth is in the scale.
const FIFTH = { d: 'a', g: 'd', c: 'g', f: 'c', bb: 'f', e: 'bb', a: 'e' };
const halfBass = r => {
  const [, pc, oct] = r.match(/^([a-g]b?)(\d)$/);
  const low = ['a1', 'bb1', 'c2', 'd2', 'e2'].includes(r);
  const fifthOct = low ? +oct + (['a', 'bb'].includes(pc) ? 1 : 0) : +oct - (['e', 'f', 'g', 'a', 'bb'].includes(pc) ? 0 : 1);
  return `[${r} ${FIFTH[pc]}${fifthOct}]`;
};
// The piano's answers in the rush: two notes on the swung and-of-3 and on 4, in bars where the vibes hold or rest.
const ANSWER = { Dm7: ['a5', 'f5'], Gm7: ['bb5', 'a5'], C7: ['g5', 'e5'], Fmaj7: ['a5', 'g5'], Bbmaj7: ['f5', 'd5'],
  Em7b5: ['bb5', 'g5'], Am7: ['g5', 'e5'] };
const ANSWER_BARS = [4, 8, 12, 16, 18, 19, 20, 22, 24, 28, 32, 33, 35, 36, 37, 38, 39, 42, 44, 45, 46, 48];

const perBar = list => '<' + list.join(' ') + '>';
// Twelve swung triplet slots per bar: beats at 0 3 6 9, the swung "and" at 2 5 8 11.
const slots = (marks) => '[' + Array.from({ length: 12 }, (_, i) => marks[i] ?? '~').join(' ') + ']';
// Which bars of a pass play (1) or rest (0): one 48-bar list per pass, given as bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
const ALL = [];

export function createSoundtrack(S) {
  const [low, middle, high, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 48-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Layer and phase trims, balanced on the music bus (.slopwave/work/light-lunch/integration/phase-check.mjs).
  const G = { bass: 1, piano: 1, vibes: 1, brush: 1, hat: 0.7, ride: 1.6, lunch: 1, service: 1, rush: 1, end: 1.4 };

  // Samples ring on their own; the envelope only sets the release.
  const smp = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const bass = (f = 1) => S.stack(
    smp(low, 'gm_acoustic_bass', 0.12).lpf(cyc([1300, 1150, 1450, 1200, 1050, 1350, 1250], f)).pan(0.48)   // 7
      .mul(S.gain(3.3 * G.bass)),
    low.lpf(420 * f).mul(S.gain(0.5 * G.bass)),
  );
  const piano = (f = 1, mask = passes(ALL)) => smp(middle, 'gm_piano', 0.35)
    .lpf(cyc([2600, 2300, 2900, 2450, 2200], f)).pan(0.36).room(0.25)                                       // 5
    .mask(mask).mul(S.gain(5.7 * G.piano));
  // Soft extra comping in the bars the written comping rests (beat 2 and the swung and-of-4).
  const fill = (f = 1, mask = passes(ALL)) => S.note(perBar(COMP.map((c, i) => c === 'rest'
    ? slots({ 3: `[${VOICING[i]}]`, 11: `[${VOICING[i]}]` }) : '~')))
    .s('gm_piano').attack(0.001).decay(0.01).sustain(1).release(0.3).gain(0.2)
    .lpf(2400 * f).pan(0.36).room(0.25).mask(mask).mul(S.gain(G.piano));
  const vibes = (f = 1, rests = passes(ALL)) => smp(high, 'vibraphone_soft', 1.2).lpf(5200 * f).pan(0.62).room(0.38)
    .mask(rests).mul(S.gain(1.45 * G.vibes));
  const brushes = (g = 1) => S.stack(
    snare.attack(0.02).decay(0.16).sustain(0).hpf(1800).lpf(6500).pan(0.55).mul(S.gain(14 * g * G.brush)),
    snare.fmap(({ gain }) => ({ s: 'snare_modern', gain: gain * 80 })).n('<[27 28 51 52]>')
      .lpf(3200).hpf(250).pan(0.45).room(0.15).mul(S.gain(g * G.brush)),
  );
  const chick = (g = 1) => hat.fmap(({ gain }) => ({ s: 'hihat', gain: gain * 110 })).n('[0 1]')
    .hpf(2500).lpf(9000).pan(0.66).mul(S.gain(g * G.hat));
  const feather = (g = 1) => kick.lpf(180).mul(S.gain(4 * g));
  const ride = (g = 1) => S.n(slots({ 0: 16, 3: 16, 5: 16, 6: 16, 9: 16, 11: 16 })).s('sus_cymbal')
    .gain(slots({ 0: 0.8, 3: 0.95, 5: 0.5, 6: 0.8, 9: 0.95, 11: 0.5 }))
    .attack(0.001).decay(0.01).sustain(1).release(0.5).hpf(2800).lpf(9000).pan(0.7).room(0.2)
    .mul(S.gain(cyc([1, 0.85, 0.95, 0.7, 0.9], g * G.ride)));                                               // 5
  const answers = (f = 1, mask = passes(ALL)) => S.note(perBar(PROG.map((c, i) => ANSWER_BARS.includes(i + 1)
    ? slots({ 8: ANSWER[c][0], 9: ANSWER[c][1] }) : '~')))
    .s('gm_piano').attack(0.001).decay(0.01).sustain(1).release(0.4).gain(0.2).lpf(3600 * f).pan(0.3).room(0.3)
    .mask(mask).mul(S.gain(G.piano));

  const build = key => {
    if (key === 'lunch') {
      // A quiet canteen: the bass walks, brushes, a little piano; the vibes on two passes of three.
      return [
        bass(0.95),
        piano(0.9, passes(ALL, [[17, 24], [41, 48]], ALL, [[33, 48]])),                                     // 4
        vibes(0.92, passes(ALL, [[1, 48]], [[17, 48]])),                                                    // 3
        brushes(0.9), chick(0.85), feather(0.8),
      ];
    }
    if (key === 'service') {
      return [
        bass(1),
        piano(1),
        fill(1, passes(ALL, [[1, 32]], ALL, [[33, 48]], ALL)),                                                // 5
        vibes(1, passes(ALL, ALL, [[33, 40]])),                                                               // 3
        brushes(1), chick(1), feather(1),
      ];
    }
    if (key === 'rush') {
      return [
        bass(1.08),
        piano(1.1),
        fill(1.1, passes(ALL, ALL, [[17, 32]], ALL, [[1, 16]])),                                              // 5
        vibes(1.08, passes(ALL, ALL, [[17, 24]])),                                                            // 3
        answers(1, passes(ALL, [[1, 32]], ALL, [[33, 48]])),                                                  // 4
        brushes(0.85), chick(1.05), feather(1.05), ride(1),
      ];
    }
    // end: something light. The theme every pass over held piano chords; the bass in half notes; brushes barely there.
    return [
      S.note(perBar(ROOTS.map(halfBass))).s('gm_acoustic_bass').attack(0.001).decay(0.01).sustain(1).release(0.3)
        .gain(0.42).lpf(1000).pan(0.48).mul(S.gain(G.bass)),
      S.note(perBar(VOICING.map(v => `[${v}]`))).s('gm_piano').attack(0.001).decay(0.01).sustain(1).release(1)
        .gain(0.25).lpf(cyc([2000, 1800, 2200, 1900], 1)).pan(0.36).room(0.4).mul(S.gain(G.piano)),         // 4
      vibes(0.95).room(0.5),
      brushes(0.55),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'lunch';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'lunch');
  return soundtrack;
}
