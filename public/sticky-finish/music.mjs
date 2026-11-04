// Phase arrangements of Gannet Rock Calypso (slopwave r-84cb69a52015), a steel-pan calypso in
// D dorian (D E F G A B C), the same scale as the game's sound effects. The 32-bar composition
// (71 s at 108 BPM; A1 A2 B A3, home vamp Dm7-G7, bar 32's G7 falls to bar 1's Dm7) keeps its
// notes in every phase; phases change layers, tempo and tone, never key. Pass-level cycles of 3, 4
// and 5 passes (filters, gains, the melody resting in some passes, comping masks) run against each
// other, so the combined texture takes 60 passes (about 70 minutes) to repeat exactly.
//
// Sampled voices: the GM steel drums soundfont (gm_steel_drums) for the melody, gm_acoustic_bass
// (doubled softly by the session's triangle) for the bass, gm_acoustic_guitar_nylon for the comping;
// VCSL shaker_small, clave and bongo for percussion (the session's soft sine kick is kept).
// The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  summer: { name: 'Summer', bpm: 108 }, // the normal summer: full groove
  clutch: { name: 'Clutch', bpm: 114 }, // the last 30 s before the boat: doubled percussion, busier comping, brighter
  winter: { name: 'Winter', bpm: 96 },  // Ottoline's review: no percussion, sparse soft pan, held pads
  ending: { name: 'Ending', bpm: 90 },  // the last jar: slower, warm, the hook over held chords
};

// The score's chord per bar (see .slopwave/work/sticky-finish/plan.json).
const PROG = [
  'Dm7', 'G7', 'Dm7', 'G7', 'Fmaj7', 'C', 'Em7', 'Am7',   // A1
  'Dm7', 'G7', 'Dm7', 'G7', 'Fmaj7', 'C', 'G7', 'G7',     // A2
  'C', 'Fmaj7', 'C', 'Am7', 'Bm7b5', 'Em7', 'Am7', 'G7',  // B
  'Dm7', 'G7', 'Dm7', 'G7', 'Fmaj7', 'C', 'Em7', 'G7',    // A3
];
const PAD = {
  Dm7: '[d3,f3,a3,c4]', G7: '[d3,f3,g3,b3]', Fmaj7: '[f3,a3,c4,e4]', C: '[e3,g3,c4]',
  Em7: '[e3,g3,b3,d4]', Am7: '[e3,g3,a3,c4]', Bm7b5: '[d3,f3,a3,b3]',
};

// Which bars of a pass the melody plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const MELODY = {
  summer: [ALL, ALL, span(0, [[17, 24]]), ALL, span(0, [[9, 16]])],                         // 5
  winter: [span(1, [[1, 4], [9, 12], [25, 28]]), span(1, [[17, 24]]),
           span(1, [[1, 8]]), span(1, [[9, 12], [25, 32]])],                               // 4
  ending: [ALL, ALL, span(0, [[17, 24]])],                                                  // 3
};
const perBar = passes => '<' + passes.flat().join(' ') + '>';

export function createSoundtrack(S) {
  const [bass, comp, pan, kick, clave, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;
  // Eighth-note masks that change once per pass.
  const eighths = masks => '<' + masks.map(m => `[${m}]!32`).join(' ') + '>';

  // Phase gain trims, measured on the music bus (.slopwave/work/sticky-finish/integration/phase-check.mjs).
  const G = { pan: 1.8, bass: 0.45, comp: 1.4, perc: 1, winter: 1.4, ending: 1.2 };

  // Soundfonts ring on their own; the envelope only sets the release.
  const sf = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const panVoice = (f = 1, release = 0.35) => sf(pan, 'gm_steel_drums', release)
    .lpf(cyc([2600, 2400, 2800, 2500, 2300], f)).pan(0.6).room(0.25)                  // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.88], G.pan)));                                   // 4
  const bassVoice = (f = 1) => S.stack(
    sf(bass, 'gm_acoustic_bass', 0.2).lpf(1200 * f).mul(S.gain(1.1 * G.bass)),
    bass.lpf(cyc([500, 450, 540], f)).mul(S.gain(0.5 * G.bass)),                        // 3
  );
  const compVoice = (f = 1) => sf(comp, 'gm_acoustic_guitar_nylon', 0.12)
    .lpf(cyc([1900, 1700, 2100], f)).pan(0.38).room(0.15)                               // 3
    .mul(S.gain(cyc([0.9, 0.8, 0.86, 0.75, 0.84], G.comp)));                            // 5
  // The session's noise shaker/clave onsets on VCSL samples, keeping the score's accents:
  // shaker down-strokes on the beats, up-strokes between; band-limited to 1.2-4.5 kHz and kept low.
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', gain: gain * 120 }))
    .n('[0 2 1 3 0 2 1 3]').hpf(1200).lpf(4500).pan(0.7)
    .mul(S.gain(cyc([1, 0.8, 0.92, 0.7], g * G.perc)));                                 // 4
  const claveVoice = (g = 1) => clave.fmap(({ gain }) => ({ s: 'clave', n: 1, gain: gain * 15 }))
    .lpf(3200).pan(0.32).room(0.15).mul(S.gain(g * G.perc));
  const kickVoice = (g = 1) => kick.lpf(300).mul(S.gain(0.5 * g * G.perc));

  const build = key => {
    if (key === 'clutch') {
      // The boat is coming: the same notes a little faster, brighter, percussion doubled
      // (sixteenth shaker in-betweens and a bongo on the 3+3+2), the comping answered a sixteenth late.
      const between = S.n('[~ 3 ~ 2 ~ 3 ~ 2]').s('shaker_small').gain('[~ .5 ~ .36 ~ .45 ~ .36]')
        .hpf(1500).lpf(4500).pan(0.25).mul(S.gain(G.perc));
      const bongo = S.n('<[16 ~ ~ 8 ~ ~ 2 ~] [16 ~ ~ 8 ~ 9 2 8]>').s('bongo')
        .gain('<[.2 ~ ~ .14 ~ ~ .18 ~] [.2 ~ ~ .14 ~ .1 .18 .12]>').lpf(3000).pan(0.45).room(0.15)
        .mul(S.gain(G.perc));
      return [
        bassVoice(1.1),
        compVoice(1.15).mul(S.gain(0.9)),
        compVoice(1.15).late(1 / 16).mul(S.gain(0.45)),
        panVoice(1.12).mul(S.gain(0.95)),
        kickVoice(1), claveVoice(0.9), shaker(1), between, bongo,
      ];
    }
    if (key === 'winter') {
      // Ottoline reads the season: slower, no percussion, held pads, the pan only now and then.
      const pad = S.note(perBar([PROG.map(c => PAD[c])])).s('triangle')
        .attack(0.6).decay(1).sustain(0.7).release(2).lpf(cyc([700, 620, 780, 660], 1)).pan(0.5).room(0.5)
        .mul(S.gain(cyc([0.045, 0.038, 0.042, 0.036, 0.04])));                              // 5
      return [
        bassVoice(0.8).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 0 0 0 0', '1 0 0 0 1 0 0 0'])) // 3
          .mul(S.gain(0.8)),
        pad,
        compVoice(0.8).mask(eighths(['0 1 0 0 0 1 0 0', '0 0 0 0 0 1 0 0', '0 1 0 0 0 0 0 1',  // 4
          '0 0 0 1 0 0 0 0'])).room(0.35).mul(S.gain(0.75)),
        panVoice(0.62, 0.7).mask(perBar(MELODY.winter)).room(0.45).mul(S.gain(0.8)),
      ];
    }
    if (key === 'ending') {
      // The last jar: warm and held, the hook on the pan ringing longer over the chords.
      const pad = S.note(perBar([PROG.map(c => PAD[c])])).s('triangle')
        .attack(0.5).decay(1).sustain(0.75).release(2.2).lpf(cyc([800, 720, 860, 760], 1)).pan(0.5).room(0.5)
        .mul(S.gain(cyc([0.05, 0.044, 0.048, 0.042])));                                     // 4
      return [
        bassVoice(0.85).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 1 0 0 1', '1 0 0 0 1 0 0 0', // 5
          '1 0 0 0 0 0 0 0', '1 0 0 1 1 0 0 0'])).mul(S.gain(0.85)),
        pad,
        compVoice(0.85).mask(eighths(['0 1 0 0 0 0 0 1', '0 1 0 1 0 0 0 1', '0 0 0 1 0 0 0 1'])) // 3
          .room(0.35).mul(S.gain(0.8)),
        panVoice(0.9, 0.9).mask(perBar(MELODY.ending)).room(0.45),
      ];
    }
    // summer: the full groove.
    return [
      bassVoice(),
      compVoice().mask(eighths(['1 1 1 1 1 1 1 1', '1 1 1 0 1 1 1 1', '1 1 1 1 1 0 1 1'])),      // 3
      panVoice().mask(perBar(MELODY.summer)),
      kickVoice(), claveVoice(), shaker(),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'summer';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'summer');
  return soundtrack;
}
