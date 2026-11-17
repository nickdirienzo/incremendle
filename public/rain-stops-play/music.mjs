// Phase arrangements of The Pavilion Invention (slopwave r-abfb52147f20), a baroque two-part invention for
// harpsichord in F lydian (F G A B C D E: every note natural, B natural is the colour, never Bb), the same scale as
// the game's sound effects (scale('lydian', 65)).
// The 64-bar rounded binary form (A1 A2 | B1 | A3 | B2 | A4 | an episode of G major over an F pedal | a coda that
// closes II-I with an A4 B4 pickup into bar 1's C5) keeps its notes in every phase; phases change layers, tempo
// and tone. 'season' and 'rain' share tempo and form, so the weather can flip them mid-bar without a jump.
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, rests, hand-offs) run against each other, so the texture
// repeats exactly only after 60 to 420 passes of 2.4-3 minutes.
//
// Sampled voices: gm_harpsichord (both hands), gm_cello (continuo), gm_recorder (doubles the tune or plays the
// counter-line), gm_string_ensemble_1 (a sparing held pad). The game must call
//   createMusic(A, { soundfonts: true, song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and @strudel/soundfonts in
// the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  yard: { name: 'The hen run', bpm: 96 },          // solo harpsichord: the two-part invention, nothing else
  season: { name: 'The season', bpm: 100 },        // + cello continuo, recorder doubling or countering by pass
  rain: { name: 'Rain stops play', bpm: 100 },     // season's form and tempo, thinned: harpsichord, a soft pad
  final: { name: 'The Final', bpm: 108 },          // fullest: harpsichord, cello, recorder, strings
  end: { name: 'Four stars, still loud', bpm: 88 }, // stately reprise: left hand in quarters, strings, recorder in A
  secret: { name: 'Five stars, silence', bpm: 84 }, // pianissimo right hand on beats 1 and 3, long gaps, F and B
};

const BARS = 64;
// Recorder counter-line, two half notes per bar (v2/counter.json, chosen by voice-leading in write_score.py).
const COUNTER = ['a4 c5', 'b4 d5', 'c5 a4', 'a4 c5', 'a4 d5', 'b4 d5', 'c5 e5', 'e5 c5', 'a4 c5', 'b4 d5', 'c5 a4',
  'a4 c5', 'a4 d5', 'e5 a4', 'b4 d5', 'e5 c5', 'c5 e5', 'e5 b4', 'a4 c5', 'd5 a4', 'b4 d5', 'b4 e5', 'e5 a4',
  'b4 d5', 'f5 a4', 'b4 d5', 'c5 a4', 'a4 c5', 'a4 d5', 'b4 d5', 'c5 e5', 'f5 c5', 'c5 e5', 'e5 b4', 'a4 c5',
  'd5 a4', 'b4 d5', 'b4 e5', 'd5 f5', 'd5 b4', 'a4 c5', 'b4 d5', 'c5 a4', 'a4 c5', 'a4 d5', 'b4 d5', 'c5 e5',
  'f5 c5', 'b4 d5', 'f5 c5', 'd5 b4', 'a4 c5', 'd5 a4', 'b4 e5', 'b4 d5', 'c5 a4', 'a4 c5', 'b4 d5', 'c5 a4',
  'a4 c5', 'a4 d5', 'c5 e5', 'd5 b4', 'c5 a4'];
// String-pad voicing per bar (v2/counter.json 'pad'); the episode's G major sits over the cello's F.
const PAD = ['a3,c4,f4', 'b3,d4,g4', 'a3,c4,e4', 'a3,c4,f4', 'a3,d4,f4', 'b3,d4,g4', 'g3,c4,e4', 'g3,c4,e4',
  'a3,c4,f4', 'b3,d4,g4', 'a3,c4,e4', 'a3,c4,f4', 'a3,d4,f4', 'a3,c4,e4', 'b3,d4,g4', 'g3,c4,e4', 'g3,c4,e4',
  'b3,e4,g4', 'a3,c4,e4', 'a3,d4,f4', 'b3,d4,g4', 'b3,e4,g4', 'a3,c4,e4', 'b3,d4,g4', 'a3,c4,f4', 'b3,d4,g4',
  'a3,c4,e4', 'a3,c4,f4', 'a3,d4,f4', 'b3,d4,g4', 'g3,c4,e4', 'a3,c4,f4', 'g3,c4,e4', 'b3,e4,g4', 'a3,c4,e4',
  'a3,d4,f4', 'b3,d4,g4', 'b3,e4,g4', 'a3,d4,f4', 'b3,d4,g4', 'a3,c4,f4', 'b3,d4,g4', 'a3,c4,e4', 'a3,c4,f4',
  'a3,d4,f4', 'b3,d4,g4', 'g3,c4,e4', 'a3,c4,f4', 'b3,d4,g4', 'a3,c4,f4', 'b3,d4,g4', 'a3,c4,f4', 'a3,d4,f4',
  'b3,e4,g4', 'b3,d4,g4', 'a3,c4,f4', 'a3,c4,f4', 'b3,d4,g4', 'a3,c4,e4', 'a3,c4,f4', 'a3,d4,f4', 'g3,c4,e4',
  'b3,d4,g4', 'a3,c4,f4'];
// Sections (1-based bars): A1 1-8, A2 9-16, B1 17-24, A3 25-32, B2 33-40, A4 41-48, episode 49-56, coda 57-64.
const A_STRAINS = [[1, 16], [25, 32], [41, 48], [57, 64]];
const B_STRAINS = [[17, 24], [33, 40]];

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 64-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
// Ranges that play (everything else rests), for one pass.
const only = ranges => {
  const on = span(ranges); // 0 inside ranges
  const out = []; let start = null;
  on.forEach((v, i) => { if (v === 1 && start === null) start = i + 1; if (v === 0 && start !== null) { out.push([start, i]); start = null; } });
  if (start !== null) out.push([start, BARS]);
  return out;
};
const ALL = [];
const WHOLE = [[1, BARS]];
// Eighth-note grid masks (one bar = 8 steps): beats 1 and 3 only; every beat.
const ON_1_3 = '1 0 0 0 1 0 0 0';
const ON_BEATS = '1 0 1 0 1 0 1 0';
const EIGHTHS_16 = '1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0'; // sixteenth grid: onsets on eighths only (drops ornaments' inner notes)
const DOWNBEATS_16 = '1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0'; // sixteenth grid: exactly beats 1 and 3

export function createSoundtrack(S) {
  const [continuo, leftHand, tune] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass ('/64').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Gain trims, measured on the music bus (.slopwave/work/rain-stops-play/integration/phase-check.mjs).
  const G = { rh: 1, lh: 1, cello: 1, rec: 1, counter: 1, pad: 1,
    yard: 1.78, season: 1.52, rain: 2.24, final: 1.0, end: 1.07, secret: 4.6 }; // secret raised from 3.6 in the game and final trimmed from 1.14, measured with npm run mix --music-only

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.003) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const rh = (g = 1, f = 1, room = 0.25) => sf(tune, 'gm_harpsichord', 0.3)
    .lpf(cyc([3600, 3200, 4000, 3000, 3400, 3800, 3100], f)).hpf(150).pan(0.58).room(room)       // 7
    .mul(S.gain(cyc([1, 0.94, 1, 0.9], 2.4 * g * G.rh)));                                        // 4
  const lh = (g = 1, f = 1, room = 0.2) => sf(leftHand, 'gm_harpsichord', 0.25)
    .lpf(cyc([2400, 2100, 2700, 2000, 2300], f)).hpf(90).pan(0.4).room(room)                    // 5
    .mul(S.gain(5 * g * G.lh));
  const cello = (g = 1, f = 1) => sf(continuo, 'gm_cello', 0.25, 0.03)
    .lpf(cyc([900, 800, 1000], f)).pan(0.47).room(0.25)                                          // 3
    .mul(S.gain(1.4 * g * G.cello));
  const recorder = (g = 1, f = 1) => sf(tune, 'gm_recorder', 0.15, 0.02)
    .lpf(cyc([3000, 2700, 3200, 2800, 2900], f)).hpf(300).pan(0.66).room(0.35)                  // 5
    .mul(S.gain(1.6 * g * G.rec));
  const counter = (g = 1) => S.note(perBar(COUNTER.map(h => `[${h}]`))).s('gm_recorder')
    .attack(0.06).decay(0.01).sustain(1).release(0.25).legato(0.92).lpf(2600).hpf(300).pan(0.66).room(0.35)
    .mul(S.gain(0.14 * g * G.counter));
  const pad = (g = 1, f = 1) => S.note(perBar(PAD.map(c => `[${c}]`))).s('gm_string_ensemble_1')
    .attack(0.5).decay(0.01).sustain(1).release(0.9).legato(0.98)
    .lpf(cyc([1400, 1200, 1600, 1300], f)).hpf(140).pan(0.45).room(0.45)                         // 4
    .mul(S.gain(0.07 * g * G.pad));

  const build = key => {
    if (key === 'season') {
      // The season: harpsichord with the cello continuo; the recorder by pass (3): doubles the tune in A2 and
      // A4; plays the counter-line through both B strains and the coda; rests but for the coda. The cello sits
      // out the episode one pass in four (the F pedal on the harpsichord alone).
      return [
        rh(1),
        lh(0.95),
        cello(1).mask(rests(ALL, ALL, ALL, [[49, 56]])),                                           // 4
        recorder(1).mask(rests(only([[9, 16], [41, 48]]), WHOLE, only([[57, 64]]))),               // 3
        counter(1).mask(rests(WHOLE, only([...B_STRAINS, [57, 64]]), WHOLE)),
      ];
    }
    if (key === 'rain') {
      // Rain stops play: season's form at season's tempo, thinned. The tune softened and without its sixteenth
      // ornaments, the left hand only on beats 1 and 3, a soft string pad on two passes of three. One pass in five
      // the tune rests through the B strains (pad and left hand alone, the rain).
      return [
        rh(0.9, 0.8, 0.35).mask(EIGHTHS_16).mask(rests(ALL, ALL, ALL, ALL, B_STRAINS)),                              // 5
        lh(1.15, 0.8, 0.3).mask(ON_1_3),
        pad(1, 0.9).mask(rests(ALL, ALL, WHOLE)),                                                  // 3
      ];
    }
    if (key === 'final') {
      // The Final: everyone. Recorder doubles the tune in the A strains and the coda (by pass (4) one A strain
      // rests), the counter-line in the B strains, the string pad through the B strains and the episode (and,
      // one pass in three, everywhere); the cello throughout.
      return [
        rh(1.05, 1.08),
        lh(1, 1.08),
        cello(1.05, 1.05),
        recorder(0.95, 1.05).mask(rests(only(A_STRAINS), only([[9, 16], [41, 48], [57, 64]]),
          only(A_STRAINS), only([[1, 16], [25, 32], [57, 64]]))),                                  // 4
        counter(1).mask(rests(only(B_STRAINS))),
        pad(1, 1.05).mask(rests(only([...B_STRAINS, [49, 56]]), only([...B_STRAINS, [49, 56]]), ALL)), // 3
      ];
    }
    if (key === 'end') {
      // Four stars, still loud: a stately reprise. The left hand in quarters, the cello, a held string pad, the
      // recorder doubling the tune in the A strains (resting in A1 one pass in three).
      return [
        rh(1, 0.9, 0.4),
        lh(1.05, 0.9, 0.35).mask(ON_BEATS),
        cello(0.9, 0.9),
        pad(0.8, 0.9),
        recorder(0.9, 0.9).mask(rests(only(A_STRAINS), only(A_STRAINS), only([[17, 64]]))),     // 3
      ];
    }
    if (key === 'secret') {
      // Five stars, silence: the right hand alone, pianissimo, only its notes on beats 1 and 3, in the first four
      // bars of each eight; the other four bars hold a low F and then a slow F major seventh with the lydian B
      // (F3 C4 E4 B4) under the rain. One pass in three the halves swap.
      const S8 = (a) => Array.from({ length: BARS }, (_, i) => ((i % 8) < 4) === a ? 1 : 0).join(' ');
      const half = (first, swapEvery = 3) => '<' + Array.from({ length: swapEvery }, (_, p) =>
        S8(p === swapEvery - 1 ? !first : first)).join(' ') + '>';
      const colour = S.note('<[f2 ~ ~ ~] [~ ~ ~ ~] [f3 c4 e4 b4] [~ ~ ~ ~]>').s('gm_harpsichord')
        .attack(0.003).decay(0.01).sustain(1).release(1.2).legato(1.6).lpf(2200).pan(0.5).room(0.55)
        .mul(S.gain(0.18));
      return [
        sf(tune, 'gm_harpsichord', 1.2).mask(DOWNBEATS_16).lpf(cyc([2600, 2300, 2800], 1)).hpf(150).pan(0.56).room(0.55)
          .mul(S.gain(2 * G.rh)).mask(half(true)),                       // 3
        colour.mask(half(false)),
      ];
    }
    // yard: the hen run. Solo harpsichord, both hands. The left hand plays only beats 1 and 3 through B1 every
    // fourth pass; the right hand rests through the episode every third pass (the left hand's F pedal alone).
    return [
      rh(1, 0.95).mask(rests(ALL, ALL, [[49, 56]])),                                               // 3
      lh(1, 0.95).mask(rests(ALL, ALL, ALL, [[17, 24]])),                                          // 4
      lh(1, 0.95).mask(ON_1_3).mask(rests(WHOLE, WHOLE, WHOLE, only([[17, 24]]))),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'yard';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'yard');
  return soundtrack;
}
