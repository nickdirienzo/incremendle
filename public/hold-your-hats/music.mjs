// Phase arrangements of Bossa for the Snow-Eater (slopwave r-e741ef5ec080), a bossa nova in F major (F G A Bb C D E),
// the same notes as the game's sound effects (scale('major', 65)): no F#, no C# anywhere.
// The 48-bar form (A1 open on C7 | A2 closing on Fmaj7 | B, the bridge | A3, the return | C, a 16-bar chorus) keeps
// its notes in every phase; phases change layers, tempo and tone, never key.
// Pass-level cycles of 3, 4, 5 and 7 passes (flute rests, guitar filter, celesta answers, bass filter, shaker swell)
// run against each other, so a phase's texture repeats exactly only after 420 passes (about 10 hours at 128 BPM).
//
// Sampled voices: gm_acoustic_bass plays the session's bass line (doubled softly by its triangle), gm_acoustic_guitar_nylon
// the session's comping voicings, gm_flute the melody, gm_celesta the answers in the bars where the flute rests or
// holds. VCSL shaker_small plays the session's shaker stem, VCSL snare_rim its cross-stick clave; the session's soft
// sine kick is kept. The game calls
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  dusk: { name: 'Dusk to eleven', bpm: 120 },          // guitar, bass, shaker; the flute two passes of three
  midnight: { name: 'Midnight', bpm: 126 },             // + the cross-stick clave, the flute most passes, a few answers
  small: { name: 'The small hours', bpm: 132 },         // + celesta answers every pass, the kick, a brighter guitar
  chinook: { name: 'The Snow-Eater', bpm: 136 },        // everything, over a low F pedal
  dawn: { name: 'Fresh snow', bpm: 96 },                // the ballad: bass in half notes, held guitar, the flute every pass
};

const BARS = 48;
// Per-bar chords, guitar voicings and bass roots (v1/harmony.json).
const PROG = ['Fmaj7', 'Fmaj7', 'Gm7', 'C7', 'Am7', 'Dm7', 'Gm7', 'C7', 'Fmaj7', 'Fmaj7', 'Gm7', 'C7', 'Am7', 'Dm7', 'C7', 'Fmaj7',
  'Bbmaj7', 'Bbmaj7', 'Am7', 'Dm7', 'Gm7', 'Gm7', 'C7', 'C7', 'Fmaj7', 'Fmaj7', 'Gm7', 'C7', 'Am7', 'Dm7', 'C7', 'Fmaj7',
  'Dm7', 'Gm7', 'C7', 'Fmaj7', 'Bbmaj7', 'Em7b5', 'Am7', 'Am7', 'Dm7', 'Gm7', 'C7', 'Fmaj7', 'Bbmaj7', 'Gm7', 'C7', 'C7'];
const VOICE = { Fmaj7: 'e3,a3,c4,g4', Gm7: 'f3,bb3,d4', C7: 'e3,bb3,d4,a4', Am7: 'g3,c4,e4', Dm7: 'f3,c4,e4,a4',
  Bbmaj7: 'a3,d4,f4,c5', Em7b5: 'g3,d4,bb4' };
const ROOTS = ['f2', 'f2', 'g2', 'c3', 'a2', 'd3', 'g2', 'c3', 'f2', 'f2', 'g2', 'c3', 'a2', 'd3', 'c3', 'f2',
  'bb2', 'bb2', 'a2', 'd3', 'g2', 'g2', 'c3', 'c3', 'f2', 'f2', 'g2', 'c3', 'a2', 'd3', 'c3', 'f2',
  'd2', 'g2', 'c3', 'f2', 'bb2', 'e2', 'a2', 'a2', 'd3', 'g2', 'c3', 'f2', 'bb2', 'g2', 'c3', 'c3'];
// The dawn ballad's half-note bass: the root, then the chord's own fifth below it (Bb under E for Em7b5).
const FIFTH_BELOW = { f2: 'c2', g2: 'd2', c3: 'g2', a2: 'e2', d3: 'a2', bb2: 'f2', d2: 'a1', e2: 'bb1' };
const halfBass = r => `[${r} ${FIFTH_BELOW[r]}]`;
// The celesta's answers: three chord tones on the and-of-2, 3 and the and-of-3, in bars where the flute rests or holds.
const ANSWER = { Fmaj7: ['c6', 'a5', 'g5'], Gm7: ['d6', 'bb5', 'a5'], C7: ['bb5', 'g5', 'e5'], Am7: ['e6', 'c6', 'a5'],
  Dm7: ['f5', 'a5', 'd6'], Bbmaj7: ['f6', 'd6', 'c6'], Em7b5: ['d6', 'bb5', 'g5'] };
const ANSWER_BARS = [2, 4, 8, 10, 12, 16, 18, 20, 24, 26, 28, 32, 33, 35, 39, 40, 44, 48];

const perBar = list => '<' + list.join(' ') + '>';
// Eight straight-eighth slots per bar.
const slots = marks => '[' + Array.from({ length: 8 }, (_, i) => marks[i] ?? '~').join(' ') + ']';
// Which bars of a pass play (1) or rest (0): one 48-bar list per pass, given as bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
const ALL = [];

export function createSoundtrack(S) {
  const [low, middle, high, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 48-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Layer and phase trims, balanced on the music bus with npm run mix (measured, then set).
  const G = { bass: 1, guitar: 1, flute: 1, cel: 1, shaker: 1, stick: 1, dusk: 1, midnight: 1, small: 1, chinook: 1, dawn: 1 };

  // Samples ring on their own; the envelope only sets the release.
  const smp = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const bass = (f = 1) => S.stack(
    smp(low, 'gm_acoustic_bass', 0.15).lpf(cyc([1200, 1050, 1350, 1100, 980, 1250, 1150], f)).pan(0.48)       // 7
      .mul(S.gain(3.2 * G.bass)),
    low.lpf(380 * f).mul(S.gain(0.45 * G.bass)),
  );
  const guitar = (f = 1) => smp(middle, 'gm_acoustic_guitar_nylon', 0.3)
    .lpf(cyc([2800, 2500, 3100, 2650, 2400], f)).pan(0.36).room(0.22)                                        // 5
    .mul(S.gain(4.2 * G.guitar));
  const flute = (f = 1, rests = passes(ALL)) => smp(high, 'gm_flute', 0.35).lpf(4800 * f).pan(0.6).room(0.35)
    .mask(rests).mul(S.gain(2.2 * G.flute));
  const answers = (f = 1, mask = passes(ALL)) => S.note(perBar(PROG.map((c, i) => ANSWER_BARS.includes(i + 1)
    ? slots({ 5: ANSWER[c][0], 6: ANSWER[c][1], 7: ANSWER[c][2] }) : '~')))
    .s('gm_celesta').attack(0.001).decay(0.01).sustain(1).release(0.6).gain(0.22).lpf(5000 * f).pan(0.7).room(0.4)
    .mask(mask).mul(S.gain(G.cel));
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', gain: gain * 4 })).n('<[0 1 2 3]>')
    .hpf(2500).lpf(9000).pan(0.66).mul(S.gain(cyc([1, 0.85, 0.95, 0.8], g * G.shaker)));                    // 4
  const stick = (g = 1) => snare.fmap(({ gain }) => ({ s: 'snare_rim', gain: gain * 4 })).n('[0 1]')
    .lpf(3800).hpf(300).pan(0.42).room(0.15).mul(S.gain(g * G.stick));
  const thump = (g = 1) => kick.lpf(170).mul(S.gain(3.2 * g));
  const pedal = (g = 1) => S.note('[f1,c2]').s('triangle').attack(0.4).decay(0.1).sustain(1).release(0.6).lpf(320)
    .gain(0.35).mul(S.gain(g * G.bass));

  const build = key => {
    if (key === 'dusk') {
      // Dusk: the bass and guitar sway, the shaker; the flute sits out a pass in three.
      return [
        bass(0.95), guitar(0.9),
        flute(0.92, passes(ALL, [[1, 48]], [[17, 48]])),                                                     // 3
        shaker(0.8), thump(0.6),
      ];
    }
    if (key === 'midnight') {
      return [
        bass(1), guitar(1),
        flute(1, passes(ALL, ALL, [[33, 48]])),                                                              // 3
        answers(0.95, passes([[1, 48]], [[1, 32]], ALL, [[1, 48]], [[17, 48]], [[1, 32]], ALL)),             // 7
        shaker(1), stick(0.85), thump(0.8),
      ];
    }
    if (key === 'small') {
      return [
        bass(1.08), guitar(1.12),
        flute(1.05, passes(ALL, ALL, [[17, 24]])),                                                           // 3
        answers(1.05, passes(ALL, [[1, 16]], ALL, [[33, 48]])),                                              // 4
        shaker(1.05), stick(1), thump(1),
      ];
    }
    if (key === 'chinook') {
      return [
        pedal(1), bass(1.1), guitar(1.15), flute(1.1), answers(1.1),
        shaker(1.1), stick(1.05), thump(1.1),
      ];
    }
    // dawn: fresh snow. The theme every pass over held guitar chords; the bass in half notes; the shaker barely there.
    return [
      S.note(perBar(ROOTS.map(halfBass))).s('gm_acoustic_bass').attack(0.001).decay(0.01).sustain(1).release(0.3)
        .gain(0.42).lpf(900).pan(0.48).mul(S.gain(G.bass)),
      S.note(perBar(PROG.map(c => `[${VOICE[c]}]`))).s('gm_acoustic_guitar_nylon').attack(0.001).decay(0.01).sustain(1)
        .release(1.2).gain(0.28).lpf(cyc([2200, 2000, 2400, 2100], 1)).pan(0.36).room(0.4).mul(S.gain(G.guitar)),  // 4
      flute(0.95).room(0.5),
      answers(0.9, passes(ALL, [[1, 32]], ALL, [[17, 48]], [[1, 48]])),                                      // 5
      shaker(0.4),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'dusk';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'dusk');
  return soundtrack;
}
