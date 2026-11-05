// Phase arrangements of Mineral Hall After Hours (slopwave r-e4a6faf684bb), a late-night museum jazz
// trio in A hirajoshi (A B C E F), the same scale as the game's sound effects (scale('hirajoshi', 57)).
// The 32-bar composition (80 s at 96 BPM; A1 A2 B A3, home Am9, bar 32's Esus falls to bar 1's Am9)
// keeps its notes in every phase; phases change layers, tempo and tone, never key. The walking bass
// plays every quarter in every phase but the ending. Swing is a fixed triplet offset in the score.
// Pass-level cycles of 3, 4 and 5 passes (melody rests, comping masks, filters and gains, ride
// versus brush texture) run against each other, so the combined texture repeats only after 60
// passes (80 minutes at 96 BPM).
//
// Sampled voices: gm_acoustic_bass (doubled softly by the session's triangle) for the walking bass,
// VCSL vibraphone_soft (soft mallets) for the melody, gm_epiano1 for comping and the late
// countermelody, a soft VCSL hihat for the ride; brushes are band-limited noise (taps on 2 and 4
// from the score, a quarter-note pink-noise swish) and the session's feathered sine kick.
// The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with these import-map entries:
//   "@strudel/web":        "/shared/lib/@strudel/web@1.3.0/index.mjs"
//   "@strudel/core":       "/shared/lib/@strudel/web@1.3.0/index.mjs"
//   "@strudel/webaudio":   "/shared/lib/@strudel/web@1.3.0/index.mjs"
//   "@strudel/soundfonts": "/shared/lib/@strudel/soundfonts@1.3.0/index.mjs"
// and a song callback such as
//   let soundtrack = null;
//   const song = () => (soundtrack ||= createSoundtrack(music.strudel))(phaseKey());
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  early: { name: 'Early', bpm: 96 },   // Peeks 0-2: bass, brushes or ride, the vibes now and then
  middle: { name: 'Middle', bpm: 96 }, // Peeks 3-5: + epiano comping, the vibes in most bars
  late: { name: 'Late', bpm: 100 },    // Peeks 6-7: full trio, brighter, a countermelody on the keys
  ending: { name: 'Ending', bpm: 80 }, // the final Peek: warm, the motif on vibes over held chords, no drums
};

// The score's chord per bar (see .slopwave/work/hold-it-up-to-the-light/plan.json).
const PROG = [
  'Am9', 'Fmaj7', 'Am9', 'Esus', 'Fmaj7', 'Cmaj7', 'Bo', 'Esus',     // A1
  'Am9', 'Fmaj7', 'Am9', 'Esus', 'Fmaj7', 'Cmaj7', 'Esus', 'Esus',   // A2
  'Fmaj7', 'Fmaj7', 'Cmaj7', 'Am9', 'Fmaj7', 'Bo', 'Esus', 'Esus',   // B
  'Am9', 'Fmaj7', 'Am9', 'Esus', 'Fmaj7', 'Cmaj7', 'Bo', 'Esus',     // A3
];
const PAD = {
  Am9: '[a2,e3,b3,c4]', Fmaj7: '[f2,c3,e3,a3]', Cmaj7: '[c3,e3,a3,b3]',
  Esus: '[e2,b2,f3,a3]', Bo: '[b2,f3,a3,e4]',
};
// The late countermelody: an authored guide-tone line, one bar per entry (quarter-note steps),
// moving where the tune holds or rests. Every note on A B C E F.
const A_COUNTER = ['c4@4', 'a3@3 c4', 'b3@4', 'a3@2 b3@2', 'c4@4', 'b3@2 e4@2', 'a3@4', '~@2 c4 b3'];
const COUNTER = [
  ...A_COUNTER,
  ...A_COUNTER.slice(0, 6), 'a3@4', 'b3@2 ~@2',
  'a3@2 c4@2', 'e4@4', 'b3@2 c4@2', 'c4@2 b3@2', 'a3@4', 'b3@2 a3@2', 'b3@2 c4 e4', 'e4@4',
  ...A_COUNTER.slice(0, 7), 'c4@2 b3@2',
];

// Which bars of a pass the melody plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const MELODY = {
  early: [span(1, [[1, 4], [25, 28]]), span(1, [[9, 12]]), span(1, [[1, 4], [17, 20]]),       // 5
          span(1, [[25, 28]]), span(1, [[1, 2], [9, 10], [25, 26]])],
  middle: [span(0, [[17, 24]]), ALL, span(0, [[5, 8], [13, 16]]), ALL, span(0, [[9, 16]])],    // 5
  late: [ALL, ALL, span(0, [[17, 20]]), ALL],                                                   // 4
  ending: [ALL, span(1, [[1, 8], [25, 32]]), ALL],                                              // 3
};
const perBar = passes => '<' + passes.flat().join(' ') + '>';

export function createSoundtrack(S) {
  const [bass, comp, vibes, kick, brush, ride] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass ('/32'; one bar is one cycle).
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;
  // Quarter-note masks that change once per pass.
  const quarters = masks => '<' + masks.map(m => `[${m}]!32`).join(' ') + '>';

  // Gain trims, measured on the music bus (.slopwave/work/hold-it-up-to-the-light/integration/phase-check.mjs).
  const G = { bass: 1.0, vibes: 0.95, comp: 1.25, counter: 0.9, perc: 1, early: 1.1, middle: 1, late: 0.95, ending: 1.25 };

  // Sampled instruments ring on their own; the envelope only sets the release.
  const sf = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const bassVoice = (f = 1) => S.stack(
    sf(bass, 'gm_acoustic_bass', 0.15).lpf(1100 * f).mul(S.gain(1.2 * G.bass)),
    bass.lpf(cyc([480, 440, 520], f)).mul(S.gain(0.35 * G.bass)),                            // 3
  );
  const vibesVoice = (f = 1, release = 0.7) => sf(vibes, 'vibraphone_soft', release)
    .lpf(cyc([2500, 2300, 2600, 2400, 2200], f)).pan(0.6).room(0.3)                         // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.88], G.vibes)));                                       // 4
  const compVoice = (f = 1) => sf(comp, 'gm_epiano1', 0.3)
    .lpf(cyc([1700, 1500, 1900], f)).pan(0.38).room(0.2)                                      // 3
    .mul(S.gain(cyc([0.9, 0.8, 0.86, 0.75, 0.84], G.comp)));                                 // 5
  const counterVoice = () => S.note('<' + COUNTER.map(b => `[${b}]`).join(' ') + '>')
    .s('gm_epiano1').attack(0.001).decay(0.01).sustain(1).release(0.4)
    .gain(0.16).lpf(cyc([1500, 1700, 1600, 1800])).pan(0.65).room(0.3)                       // 4
    .mul(S.gain(G.counter));
  // Ride: the score's ride onsets on a soft VCSL hi-hat (the swung skip on the second round robin),
  // band-limited and kept low. Brush taps: the score's 2 and 4 as soft band-limited noise.
  // Swish: a quarter-note pink-noise sweep. The ride and the swish trade places over 3 passes.
  const rideVoice = (g = 1, f = 1) => ride.fmap(({ gain }) => ({ s: 'hihat', n: gain < 0.003 ? 3 : 2, gain: gain * 950 }))
    .hpf(900).lpf(6000 * f).pan(0.68).room(0.15)
    .mul(S.gain(cyc([1, 0.15, 0.6], g * G.perc)));                                            // 3
  const tapVoice = (g = 1) => brush.hpf(700).lpf(2600).attack(0.004).decay(0.11).sustain(0)
    .pan(0.45).mul(S.gain(32 * g * G.perc));
  const swishVoice = (g = 1) => S.s('pink*4').gain('[.75 1 .75 1]')
    .attack(0.09).decay(0.22).sustain(0).release(0.08).hpf(600).lpf(2200).pan(0.4)
    .mul(S.gain(cyc([0.45, 1, 0.75], g * G.perc)));                                           // 3
  const kickVoice = (g = 1) => kick.lpf(250).mul(S.gain(1.9 * g * G.perc));
  const drums = (g = 1, f = 1) => [rideVoice(g, f), tapVoice(g), swishVoice(g), kickVoice(g)];

  const build = key => {
    if (key === 'middle') {
      // The keys join: Charleston comping (a hit or two masked out per pass), the vibes in most bars.
      return [
        bassVoice(),
        compVoice().mask(quarters(['1 1 1 1', '1 1 0 1', '1 0 1 1'])),                          // 3
        vibesVoice().mask(perBar(MELODY.middle)),
        ...drums(),
      ];
    }
    if (key === 'late') {
      // The whole trio, a little faster and brighter, with a guide-tone countermelody on the keys.
      return [
        bassVoice(1.15),
        compVoice(1.12).mask(quarters(['1 1 1 1', '1 0 1 1', '1 1 1 0'])).mul(S.gain(0.9)),    // 3
        counterVoice(),
        vibesVoice(1.1).mask(perBar(MELODY.late)),
        ...drums(1.05, 1.08),
      ];
    }
    if (key === 'ending') {
      // The town sees Celestine: slower, warm, held chords, the bass in half notes, the motif on vibes.
      const pad = S.note(perBar([PROG.map(c => PAD[c])])).s('triangle')
        .attack(0.5).decay(1).sustain(0.75).release(2.2).lpf(cyc([800, 720, 860, 760])).pan(0.5).room(0.5)
        .mul(S.gain(cyc([0.05, 0.044, 0.048, 0.042])));                                      // 4
      return [
        bassVoice(0.85).mask(quarters(['1 0 1 0', '1 0 1 0', '1 0 0 0', '1 0 1 0', '1 0 1 1'])) // 5
          .mul(S.gain(0.9)),
        pad,
        compVoice(0.85).mask(quarters(['1 0 0 0'])).room(0.4).mul(S.gain(0.8)),
        vibesVoice(0.9, 1.1).mask(perBar(MELODY.ending)).room(0.45),
      ];
    }
    // early: the trio barely awake. Bass and brushes or ride; the vibes only now and then.
    return [
      bassVoice(0.95),
      vibesVoice(0.92, 0.9).mask(perBar(MELODY.early)).room(0.4).mul(S.gain(0.9)),
      ...drums(0.9, 0.95),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'early';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'early');
  return soundtrack;
}
