// Phase arrangements of Paper Umbrella Bossa (slopwave r-ac798f341c3e), a bossa nova in E phrygian
// (E F G A B C D), the same scale as the game's sound effects (scale('phrygian', 64)). The 32-bar
// composition (69 s at 112 BPM; A1 A2 B A3, home chord Em7, bar 32's Fmaj7 falls to bar 1's Em7, the
// phrygian cadence) keeps its notes in every phase; phases change layers, tempo and tone, never key.
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, gains, the flute resting in some passes, comping
// masks) run against each other, so the combined texture takes 420 passes to repeat exactly.
//
// Sampled voices: gm_flute (melody), gm_acoustic_guitar_nylon (comping), gm_acoustic_bass (doubled
// softly by the session's triangle), gm_pad_warm (held chords in space, moon and ending); VCSL
// snare_rim sidestick (the bossa clave) and shaker_small (sixteenths); the session's soft sine kick.
// The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with @strudel/soundfonts in the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  ground: { name: 'Ground', bpm: 112 }, // rooftops to the rain cloud: light, the flute resting now and then
  sky: { name: 'Sky', bpm: 116 },       // above the cloud: the full band, flute every pass, brighter
  space: { name: 'Space', bpm: 100 },   // past 100 km: dreamy, held pad, no shaker or kick, sparse flute
  moon: { name: 'Moon', bpm: 108 },     // the Moon's pull and landing: full and warm, the hook up front
  ending: { name: 'Ending', bpm: 88 },  // the reveal: slow, the flute over held chords, no percussion
};

// The score's chord per bar (see .slopwave/work/over-the-moon/plan.json).
const PROG = [
  'Em7', 'Em7', 'Fmaj7', 'Fmaj7', 'Dm7', 'G6', 'Cmaj7', 'Fmaj7',    // A1
  'Em7', 'Em7', 'Fmaj7', 'Fmaj7', 'Dm7', 'G6', 'Am7', 'G6',         // A2
  'Cmaj7', 'Cmaj7', 'Am7', 'Am7', 'Dm7', 'G6', 'Bm7b5', 'Fmaj7',    // B
  'Em7', 'Em7', 'Fmaj7', 'Fmaj7', 'Dm7', 'G6', 'Cmaj7', 'Fmaj7',    // A3
];
const PAD = {
  Em7: '[e3,g3,b3,d4]', Fmaj7: '[f3,a3,c4,e4]', Dm7: '[d3,f3,a3,c4]', G6: '[d3,g3,b3,e4]',
  Cmaj7: '[e3,g3,b3,c4]', Am7: '[e3,g3,a3,c4]', Bm7b5: '[d3,f3,a3,b3]',
};

// Which bars of a pass the flute plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const NONE = span(0, [[1, 32]]);
const MELODY = {
  ground: [ALL, span(1, [[17, 32]]), ALL, span(0, [[17, 24]]), NONE],                      // 5
  space: [span(1, [[1, 4], [9, 12], [25, 28]]), span(1, [[17, 24]]), span(1, [[1, 8], [25, 32]])], // 3
  ending: [ALL, ALL, span(0, [[17, 24]])],                                                  // 3
};
const perBar = passes => '<' + passes.flat().join(' ') + '>';

export function createSoundtrack(S) {
  const [bass, comp, flute, kick, rim, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/32`;
  // Sixteenth-note masks that change once per pass.
  const sixteenths = masks => '<' + masks.map(m => `[${m}]!32`).join(' ') + '>';

  // Gain trims, measured on the music bus (.slopwave/work/over-the-moon/integration/phase-check.mjs).
  const G = { flute: 1.6, bass: 0.5, comp: 3, perc: 1, pad: 1, ground: 1, sky: 1, space: 1.2, moon: 1, ending: 1 };

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.001) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const fluteVoice = (f = 1, release = 0.3) => sf(flute, 'gm_flute', release, 0.02)
    .lpf(cyc([2400, 2200, 2600, 2300, 2100], f)).pan(0.58).room(0.3)                    // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.9], G.flute)));                                   // 4
  const bassVoice = (f = 1) => S.stack(
    sf(bass, 'gm_acoustic_bass', 0.2).lpf(1100 * f).mul(S.gain(1.1 * G.bass)),
    bass.lpf(cyc([480, 430, 520], f)).mul(S.gain(0.45 * G.bass)),                       // 3
  );
  const compVoice = (f = 1) => sf(comp, 'gm_acoustic_guitar_nylon', 0.15)
    .lpf(cyc([1800, 1600, 2000], f)).pan(0.38).room(0.18)                               // 3
    .mul(S.gain(cyc([0.9, 0.8, 0.86, 0.76, 0.84], G.comp)));                            // 5
  // The session's noise shaker/rim onsets on VCSL samples, keeping the score's accents:
  // shaker down-strokes on the beats, up-strokes between; band-limited to 1.2-4.5 kHz and kept low.
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', gain: gain * 400 }))
    .n('[0 2 1 3]!4').hpf(1200).lpf(4500).pan(0.68)
    .mul(S.gain(cyc([1, 0.8, 0.9, 0.7, 0.95, 0.75, 0.85], g * G.perc)));               // 7
  const rimVoice = (g = 1) => rim.fmap(({ gain }) => ({ s: 'snare_rim', n: 0, gain: gain * 16 }))
    .lpf(3000).pan(0.34).room(0.15).mul(S.gain(g * G.perc));
  const kickVoice = (g = 1) => kick.lpf(260).mul(S.gain(0.45 * g * G.perc));
  const pad = (gains, f = 1, room = 0.5) => S.note(perBar([PROG.map(c => PAD[c])])).s('gm_pad_warm')
    .attack(0.4).decay(0.01).sustain(1).release(1.6).lpf(cyc([900, 800, 1000, 850], f)).pan(0.5).room(room) // 4
    .mul(S.gain(cyc(gains, G.pad)));

  const build = key => {
    if (key === 'sky') {
      // Above the cloud: everyone plays, a little brighter; on some passes the guitar is answered
      // a sixteenth late, like a second player catching the groove.
      return [
        bassVoice(1.05),
        compVoice(1.12),
        compVoice(1.12).late(1 / 16).mask(sixteenths(['0 1 0 0 0 0 0 1 0 0 1 0 0 0 1 0'])).mul(S.gain(cyc([0.4, 0, 0.32, 0]))), // 4
        fluteVoice(1.08),
        kickVoice(1), rimVoice(0.95), shaker(1.1),
      ];
    }
    if (key === 'space') {
      // Past 100 km: slower and roomy, a held warm pad, no shaker or kick, the rim only on the clave's
      // downbeats, the flute now and then.
      return [
        pad([0.12, 0.1, 0.11, 0.09, 0.1], 0.9, 0.6),                                    // 5
        bassVoice(0.85).mask(sixteenths(['1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0',              // 3
          '1 0 0 0 0 0 1 0 0 0 0 0 0 0 1 0', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'])).mul(S.gain(0.9)),
        compVoice(0.8).mask(sixteenths(['1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0', '0 0 1 0 0 0 0 0 0 0 1 0 0 0 0 0', // 4
          '1 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0', '0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0'])).room(0.45).mul(S.gain(0.8)),
        rimVoice(0.5).mask(sixteenths(['1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0'])).room(0.4),
        fluteVoice(0.85, 0.6).mask(perBar(MELODY.space)).room(0.55),
      ];
    }
    if (key === 'moon') {
      // The Moon's pull: the full band, warm, the hook up front over a soft pad on some passes.
      return [
        pad([0, 0.07, 0.05, 0.08, 0, 0.06, 0.04]),                                          // 7
        bassVoice(1),
        compVoice(1).mask(sixteenths(['1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1', '1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1', // 3
          '1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1'])).mul(S.gain(0.9)),
        fluteVoice(1.04).mul(S.gain(1.15)).room(0.35),
        kickVoice(1), rimVoice(0.9), shaker(0.85),
      ];
    }
    if (key === 'ending') {
      // The reveal: slow and held, the flute over the pad, guitar only now and then, no percussion.
      return [
        pad([0.13, 0.11, 0.12, 0.1], 0.95, 0.55),
        bassVoice(0.85).mask(sixteenths(['1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',              // 5
          '1 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
          '1 0 0 0 0 0 1 0 0 0 0 0 0 0 1 0', '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0'])).mul(S.gain(0.85)),
        compVoice(0.85).mask(sixteenths(['1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0', '0 0 1 0 0 0 0 0 0 0 0 0 1 0 0 0', // 3
          '1 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0'])).room(0.4).mul(S.gain(0.8)),
        fluteVoice(0.9, 0.8).mask(perBar(MELODY.ending)).room(0.5),
      ];
    }
    // ground: light; the flute sits out some passes and the guitar thins now and then.
    return [
      bassVoice(),
      compVoice(0.95).mask(sixteenths(['1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1', '1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1', // 3
        '1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 1'])),
      fluteVoice(0.95).mask(perBar(MELODY.ground)),
      kickVoice(0.85), rimVoice(0.85), shaker(0.7),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'ground';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'ground');
  return soundtrack;
}
