// Phase arrangements of Castle Pardon's Polite Polka (slopwave r-d9a1d6777957), a village-band polka in
// D dorian (D E F G A B C), the same scale as the game's sound effects (scale('dorian', 62)).
// The 64-bar composition (A1 A2, B1 B2, a trio through G and F, ornamented A3 A4; bar 64 cadences on D and an
// eighth-note E pickup steps into bar 1) keeps its notes in every phase; phases change layers, tempo and tone.
// Oom-pah: tuba on beats 1 and 3, accordion stabs on 2 and 4; every percussion hit is on a quarter-note beat.
// The only note outside D dorian is F# in the end phase's Picardy D major chords on the D cadences (bars 16, 32, 64).
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, rests, drop-outs, hand-offs) run against each other, so
// the texture repeats exactly only after 60 (fields), 84 (end) or 420 (village, hall) passes of 2-2.8 minutes.
//
// Sampled voices: gm_accordion (stabs, counter-line, the tune in fields, held chords in end), gm_tuba,
// gm_clarinet (the tune from village on), gm_trombone (doubles the tune an octave down in hall and the last
// strain of end), gm_glockenspiel (sparing sparkle in the hall trio), VCSL woodblock, snare_modern, tambourine,
// bassdrum1. The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and @strudel/soundfonts in
// the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  fields: { name: 'The turnip fields', bpm: 104 },  // accordion alone with a soft tuba: the tune stated simply
  village: { name: 'Brumewick', bpm: 112 },         // the clarinet takes the tune, accordion counter, woodblock
  hall: { name: 'Brume Hall', bpm: 120 },           // fullest: trombone doubling, snare, tambourine, glockenspiel
  end: { name: 'Form T-1', bpm: 92 },               // slow processional, held chords, Picardy D major cadences
};

const BARS = 64;
// The score's chord per bar (.slopwave/work/with-compliments/plan.json).
const A = ['Dm', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'Am'];
const A_ = ['Dm', 'G', 'C', 'Am', 'Dm', 'G', 'Am', 'Dm'];
const PROG = [
  ...A, ...A_,                                                   // A1 A2
  'F', 'C', 'G', 'Dm', 'F', 'C', 'G', 'Am',                      // B1
  'F', 'C', 'G', 'Dm', 'F', 'C', 'Am', 'Dm',                     // B2
  'G', 'G', 'C', 'C', 'F', 'F', 'G', 'G', 'F', 'F', 'C', 'Am', 'Dm', 'G', 'C', 'Am', // trio
  ...A, ...A_,                                                   // A3 A4
];
const PICARDY = [16, 32, 64]; // 1-based bars that cadence on D: D major in the end phase
// Accordion counter-line, two half notes per bar (v2/counter.json, hand-written in write_score.py).
const COUNTER = [
  'f4 e4', 'd4 b3', 'c4 e4', 'e4 e4', 'd4 f4', 'b3 d4', 'e4 c4', 'c4 e4',
  'f4 e4', 'd4 b3', 'c4 e4', 'e4 e4', 'd4 f4', 'b3 d4', 'c4 e4', 'a3 d4',
  'a4 f4', 'g4 e4', 'g4 b3', 'f4 f4', 'a4 f4', 'g4 e4', 'b3 d4', 'c4 e4',
  'a4 f4', 'g4 e4', 'g4 b3', 'f4 f4', 'a4 f4', 'g4 e4', 'c4 c4', 'a3 d4',
  'd4 g4', 'd4 e4', 'e4 c4', 'c4 e4', 'f4 c4', 'c4 f4', 'b3 d4', 'd4 b3',
  'a3 c4', 'f4 a4', 'g4 e4', 'e4 c4', 'd4 a3', 'd4 g4', 'e4 c4', 'c4 e4',
  'f4 e4', 'd4 b3', 'c4 e4', 'e4 e4', 'd4 f4', 'b3 d4', 'e4 c4', 'c4 e4',
  'f4 e4', 'd4 b3', 'c4 e4', 'e4 e4', 'd4 f4', 'b3 d4', 'c4 e4', 'a3 d4',
];
// Held accordion chords for the processional (same voicings as the stabs); D is the Picardy chord.
const HELD = { Dm: '[f3,a3,d4]', G: '[g3,b3,d4]', C: '[e3,g3,c4]', Am: '[e3,a3,c4]', F: '[f3,a3,c4]', D: '[fs3,a3,d4]' };

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 64-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const WHOLE = [[1, BARS]];
const octaveDown = v => ({ ...v, note: typeof v.note === 'number' ? v.note - 12 : v.note.replace(/\d+$/, d => d - 1) });

export function createSoundtrack(S) {
  const [tuba, stabs, tune, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass ('/64').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Gain trims, measured on the music bus (.slopwave/work/with-compliments/integration/phase-check.mjs).
  const G = { tuba: 1, stabs: 1, tune: 1, counter: 1, chords: 1, brass: 1, glock: 1, wood: 1, snare: 1, tamb: 1, kick: 1,
    fields: 1.25, village: 1.06, hall: 1, end: 1.1 }; // phase trims even out the bus (see integration/notes.md)

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.004) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const tubaVoice = (g = 1, f = 1) => sf(tuba, 'gm_tuba', 0.12, 0.01)
    .lpf(cyc([700, 620, 780], f)).mul(S.gain(1.7 * g * G.tuba));                                 // 3
  const stabVoice = (g = 1, f = 1) => sf(stabs, 'gm_accordion', 0.06)
    .lpf(cyc([2200, 1900, 2400, 2000, 2100], f)).hpf(180).pan(0.4).room(0.15)                   // 5
    .mul(S.gain(4 * g * G.stabs));
  const reed = (name, g = 1, f = 1, room = 0.3, pan = 0.58) => sf(tune, name, 0.14, 0.008)
    .lpf(cyc([2800, 2500, 3000, 2600, 2700, 2400, 2900], f)).hpf(200).pan(pan).room(room)      // 7
    .mul(S.gain(cyc([1, 0.95, 1, 0.92], 2.2 * g * G.tune)));                                     // 4
  const counterVoice = (g = 1) => S.note(perBar(COUNTER.map(h => `[${h}]`))).s('gm_accordion')
    .attack(0.05).decay(0.01).sustain(1).release(0.2).legato(0.9).lpf(1500).hpf(200).pan(0.34).room(0.25)
    .mul(S.gain(0.18 * g * G.counter));
  const brass = (g = 1) => sf(tune.fmap(octaveDown), 'gm_trombone', 0.12, 0.01)
    .lpf(1600).pan(0.44).room(0.3).mul(S.gain(1.5 * g * G.brass));
  const glock = (g = 1) => sf(tune, 'gm_glockenspiel', 0.5, 0.002)
    .lpf(5000).pan(0.66).room(0.4).mul(S.gain(0.9 * g * G.glock));
  const heldChords = (g = 1, f = 1) => S.note(perBar(PROG.map((c, i) => HELD[PICARDY.includes(i + 1) ? 'D' : c])))
    .s('gm_accordion').attack(0.3).decay(0.01).sustain(1).release(0.6).legato(0.96)
    .lpf(cyc([1500, 1300, 1700, 1400], f)).hpf(150).pan(0.42).room(0.4)                          // 4
    .mul(S.gain(0.09 * g * G.chords));
  // The score's percussion onsets (all on quarter-note beats) on VCSL samples, keeping the score's accents
  // (each stem's gain divided by its loudest score hit, so 1 = the accented beat).
  const KICK = 0.3 * 0.6 * 0.36, SNARE = 0.26 * 0.36 * 0.32, HAT = 0.07 * 0.36 * 0.06; // score level x mix x drum_mix
  const kickVoice = (g = 1) => kick.fmap(({ gain }) => ({ s: 'bassdrum1', n: 2, gain: 0.5 * gain / KICK }))
    .lpf(900).mul(S.gain(g * G.kick));
  const woodVoice = (g = 1) => snare.fmap(({ gain }) => ({ s: 'woodblock', n: 6, gain: 0.35 * gain / SNARE }))
    .n('<6 0>*2').lpf(6000).pan(0.6).room(0.2).mul(S.gain(g * G.wood));
  const snareVoice = (g = 1) => snare.fmap(({ gain }) => ({ s: 'snare_modern', n: 14, gain: 0.3 * gain / SNARE }))
    .n('<14 15>*2').lpf(5000).pan(0.46).room(0.2).mul(S.gain(g * G.snare));
  const tambVoice = (g = 1) => hat.fmap(({ gain }) => ({ s: 'tambourine', n: 0, gain: 0.3 * gain / HAT }))
    .n('<0 1>*2').hpf(1500).lpf(9000).pan(0.66).room(0.2).mul(S.gain(g * G.tamb));

  const build = key => {
    if (key === 'village') {
      // Brumewick: the clarinet takes the tune; the accordion plays the counter-line and the stabs; a woodblock
      // (three passes in four) or a light snare (the fourth) on 2 and 4. The accordion takes the first half of the
      // trio from the clarinet every fifth pass; the counter-line rests in A1 or the trio on two passes of three.
      return [
        tubaVoice(1),
        stabVoice(1),
        reed('gm_clarinet', 1).mask(rests(ALL, ALL, ALL, ALL, [[33, 40]])),                       // 5
        reed('gm_accordion', 0.85, 0.9, 0.25, 0.52).mask(rests(WHOLE, WHOLE, WHOLE, WHOLE, [[1, 32], [41, 64]])),
        counterVoice(1).mask(rests([[1, 8]], [[33, 48]], ALL)),                                     // 3
        woodVoice(1).mask(rests(ALL, ALL, WHOLE, ALL)),                                             // 4
        snareVoice(0.6).mask(rests(WHOLE, WHOLE, ALL, WHOLE)),
      ];
    }
    if (key === 'hall') {
      // Brume Hall: everyone. Trombone doubles the tune an octave down in the A strains (and the B strains on
      // two passes of three); kick on 1 and 3, snare and tambourine on 2 and 4; a glockenspiel doubles the trio
      // on one pass in three; the tambourine sits out the trio every fourth pass.
      return [
        tubaVoice(1.1, 1.08),
        stabVoice(1.05, 1.08),
        reed('gm_clarinet', 1.05, 1.08),
        counterVoice(1),
        brass(1).mask(rests([[33, 48]], [[17, 48]], [[33, 48]])),                                 // 3
        glock(1).mask(rests(WHOLE, [[1, 32], [49, 64]], WHOLE)),                                   // 3
        kickVoice(1),
        snareVoice(1),
        tambVoice(1).mask(rests(ALL, ALL, ALL, [[33, 48]])),                                        // 4
      ];
    }
    if (key === 'end') {
      // Form T-1: a slow processional. The tuba on beat 1 only, held accordion chords (D major on the D
      // cadences), the clarinet with more room, the trombone joining for the last strain, a soft bass drum on 1.
      // The clarinet rests through B1 every third pass (chords alone).
      return [
        tubaVoice(0.75, 0.85).mask('1 0 0 0').legato(3.6),
        heldChords(1),
        reed('gm_clarinet', 1, 0.85, 0.5).mask(rests(ALL, ALL, [[17, 24]])),                      // 3
        brass(0.8).mask(rests([[1, 56]])),
        kickVoice(0.7).mask('1 0 0 0'),
      ];
    }
    // fields: the turnip fields. Accordion alone with a soft tuba, no percussion: the tune on the accordion
    // (resting through B1 every third pass), the stabs resting under the first phrase every fifth pass, the tuba
    // only on beat 1 through the trio every fourth pass.
    return [
      tubaVoice(0.8, 0.9).mask(rests(ALL, ALL, ALL, [[33, 48]])),                                  // 4
      tubaVoice(0.8, 0.9).mask('1 0 0 0').mask(rests(WHOLE, WHOLE, WHOLE, [[1, 32], [49, 64]])),
      stabVoice(0.85, 0.9).mask(rests(ALL, ALL, ALL, ALL, [[1, 4]])),                                // 5
      reed('gm_accordion', 1, 0.9, 0.25, 0.54).mask(rests(ALL, ALL, [[17, 24]])),                     // 3
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'fields';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'fields');
  return soundtrack;
}
