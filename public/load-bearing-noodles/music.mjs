// Phase arrangements of Pettibone's Invention (slopwave r-fdcb17a6bd08), a baroque harpsichord piece
// in D in-sen (D Eb G A C), the same scale as the game's sound effects. The 32-bar composition
// (91 s at 84 BPM) keeps its notes in every phase; phases change layers, tempo and tone, never key.
// Pass-level cycles of 3, 4 and 5 passes (filters, gains, the subject resting in some passes) run
// against each other, so the combined texture takes 60 passes (about 90 minutes) to repeat exactly.
//
// Sampled voice: the GM harpsichord soundfont (gm_harpsichord) for the subject, the figuration and
// the imitation; the continuo bass is the harpsichord doubled softly by the session's low synth.
// The game must call createMusic(A, { soundfonts: true, song }).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  walls:     { name: 'Walls',     bpm: 84 }, // Mona alone: subject and bass, figuration sparse
  grapevine: { name: 'Grapevine', bpm: 84 }, // the gossip is passed along: the subject imitated a bar late
  deep:      { name: 'Deep',      bpm: 88 }, // salt swept to the basement: fullest, a little brighter
  epilogue:  { name: 'Epilogue',  bpm: 70 }, // the garden and the credits: slower, held, soft
};

// The imitation (the "grapevine" voice): the subject one bar late and an octave down, with
// clashing strong-beat notes moved to chord tones. See .slopwave/work/load-bearing-noodles/v1/imitation.json.
// [start beat, beats, note, level]
const IMIT = [
  [0, 0.92, "g4", 0.212], [1, 0.46, "ds4", 0.187], [1.5, 0.46, "d4", 0.178], [2, 0.46, "d4", 0.178], [2.5, 0.46, "g3", 0.17], [3, 0.92, "ds4", 0.204],
  [4, 0.23, "d4", 0.212], [4.25, 0.23, "ds4", 0.178], [4.5, 0.23, "d4", 0.178], [4.75, 0.23, "c4", 0.17], [5, 0.46, "a3", 0.196], [5.5, 0.46, "d4", 0.196],
  [6, 0.92, "g4", 0.23], [7, 0.46, "a4", 0.204], [7.5, 0.46, "g4", 0.187], [8, 0.6900000000000001, "d4", 0.221], [8.75, 0.23, "d4", 0.178], [9, 0.46, "c4", 0.187],
  [9.5, 0.46, "a3", 0.178], [10, 0.23, "c4", 0.178], [10.25, 0.23, "a3", 0.17], [10.5, 0.23, "g3", 0.17], [10.75, 0.23, "a3", 0.17], [11, 0.92, "d4", 0.204],
  [12, 0.23, "g3", 0.204], [12.25, 0.23, "a3", 0.17], [12.5, 0.23, "g3", 0.17], [12.75, 0.23, "ds3", 0.162], [13, 0.46, "d3", 0.187], [13.5, 0.46, "g3", 0.187],
  [14, 0.92, "c4", 0.221], [15, 0.46, "d4", 0.204], [15.5, 0.46, "c4", 0.187], [16, 0.6900000000000001, "ds4", 0.212], [16.75, 0.23, "c4", 0.178], [17, 0.46, "a3", 0.178],
  [17.5, 0.46, "g3", 0.178], [18, 0.23, "a3", 0.17], [18.25, 0.23, "g3", 0.17], [18.5, 0.23, "ds3", 0.162], [18.75, 0.23, "g3", 0.17], [19, 0.92, "c4", 0.204],
  [20, 0.23, "g4", 0.212], [20.25, 0.23, "ds4", 0.178], [20.5, 0.23, "d4", 0.17], [20.75, 0.23, "c4", 0.17], [21, 0.23, "ds4", 0.187], [21.25, 0.23, "d4", 0.17],
  [21.5, 0.23, "c4", 0.17], [21.75, 0.23, "a3", 0.17], [22, 0.46, "c4", 0.187], [22.5, 0.46, "g3", 0.178], [23, 0.92, "ds4", 0.212], [24, 0.46, "c4", 0.196],
  [24.5, 0.46, "ds4", 0.196], [25, 0.92, "g4", 0.23], [26, 0.23, "ds4", 0.178], [26.25, 0.23, "d4", 0.17], [26.5, 0.23, "c4", 0.17], [26.75, 0.23, "d4", 0.17],
  [27, 0.92, "ds4", 0.204], [28, 0.46, "d4", 0.187], [28.5, 0.46, "a3", 0.178], [29, 0.46, "d4", 0.204], [29.5, 0.46, "c4", 0.178], [30, 0.23, "a3", 0.17],
  [30.25, 0.23, "c4", 0.17], [30.5, 0.23, "ds4", 0.178], [30.75, 0.23, "g4", 0.187], [31, 0.92, "ds4", 0.212], [32, 1.84, "d4", 0.221], [34, 0.46, "a3", 0.178],
  [34.5, 0.46, "g3", 0.17], [35, 0.92, "a3", 0.187], [37, 0.23, "a3", 0.17], [37.25, 0.23, "c4", 0.178], [37.5, 0.23, "d4", 0.187], [37.75, 0.23, "ds4", 0.187],
  [38, 0.92, "d4", 0.212], [39, 0.46, "a4", 0.204], [39.5, 0.46, "g4", 0.187], [40, 0.6900000000000001, "d4", 0.221], [40.75, 0.23, "d4", 0.178], [41, 0.46, "c4", 0.187],
  [41.5, 0.46, "a3", 0.178], [42, 0.23, "c4", 0.178], [42.25, 0.23, "a3", 0.17], [42.5, 0.23, "g3", 0.17], [42.75, 0.23, "a3", 0.17], [43, 0.92, "d4", 0.204],
  [44, 0.23, "g3", 0.204], [44.25, 0.23, "a3", 0.17], [44.5, 0.23, "g3", 0.17], [44.75, 0.23, "ds3", 0.162], [45, 0.46, "d3", 0.187], [45.5, 0.46, "g3", 0.187],
  [46, 0.92, "c4", 0.221], [47, 0.46, "d4", 0.204], [47.5, 0.46, "c4", 0.187], [48, 0.46, "g3", 0.178], [48.5, 0.46, "c4", 0.187], [49, 0.46, "ds4", 0.196],
  [49.5, 0.46, "g4", 0.212], [50, 0.23, "a4", 0.204], [50.25, 0.23, "g4", 0.187], [50.5, 0.23, "d4", 0.178], [50.75, 0.23, "c4", 0.17], [51, 0.92, "ds4", 0.196],
  [52, 0.23, "g4", 0.212], [52.25, 0.23, "ds4", 0.178], [52.5, 0.23, "d4", 0.17], [52.75, 0.23, "c4", 0.17], [53, 0.23, "ds4", 0.187], [53.25, 0.23, "d4", 0.17],
  [53.5, 0.23, "c4", 0.17], [53.75, 0.23, "a3", 0.17], [54, 0.46, "c4", 0.187], [54.5, 0.46, "g3", 0.178], [55, 0.92, "ds4", 0.212], [56, 0.46, "c4", 0.187],
  [56.5, 0.46, "d4", 0.187], [57, 0.92, "g4", 0.221], [58, 0.46, "d4", 0.187], [58.5, 0.46, "d4", 0.178], [59, 0.92, "c4", 0.196], [60, 0.23, "d4", 0.187],
  [60.25, 0.23, "c4", 0.17], [60.5, 0.23, "a3", 0.17], [60.75, 0.23, "g3", 0.17], [61, 0.46, "a3", 0.178], [61.5, 0.46, "c4", 0.187], [62, 0.92, "ds4", 0.212],
  [63, 0.46, "c4", 0.178], [63.5, 0.46, "a3", 0.17], [64, 1.84, "d4", 0.212], [66, 0.46, "c4", 0.178], [66.5, 0.46, "a3", 0.17], [67, 0.46, "c4", 0.178],
  [67.5, 0.46, "ds4", 0.187], [68, 1.3800000000000001, "d4", 0.204], [69.5, 0.46, "c4", 0.17], [70, 0.92, "g3", 0.178], [71, 0.46, "a3", 0.17], [71.5, 0.46, "c4", 0.178],
  [72, 1.3800000000000001, "d4", 0.204], [73.5, 0.46, "c4", 0.187], [74, 1.84, "d4", 0.196], [76, 1.3800000000000001, "g4", 0.212], [77.5, 0.46, "d4", 0.17], [78, 0.92, "c4", 0.187],
  [79, 0.46, "d4", 0.178], [79.5, 0.46, "ds4", 0.178], [80, 1.3800000000000001, "ds4", 0.196], [81.5, 0.46, "c4", 0.17], [82, 1.84, "g3", 0.178], [84, 0.92, "g3", 0.178],
  [85, 0.46, "ds4", 0.196], [85.5, 0.46, "ds4", 0.178], [86, 0.92, "c4", 0.187], [87, 0.46, "ds4", 0.187], [87.5, 0.46, "g4", 0.196], [88, 1.3800000000000001, "a4", 0.212],
  [89.5, 0.46, "ds4", 0.178], [90, 1.84, "c4", 0.187], [92, 0.46, "a3", 0.17], [92.5, 0.46, "c4", 0.178], [93, 0.46, "ds4", 0.187], [93.5, 0.46, "a4", 0.204],
  [94, 0.92, "ds4", 0.196], [95, 0.46, "c4", 0.178], [95.5, 0.46, "ds4", 0.178], [96, 0.23, "ds4", 0.187], [96.25, 0.23, "d4", 0.17], [96.5, 0.23, "c4", 0.17],
  [96.75, 0.23, "a3", 0.17], [97, 0.23, "c4", 0.17], [97.25, 0.23, "a3", 0.162], [97.5, 0.23, "g3", 0.162], [97.75, 0.23, "ds3", 0.162], [98, 1.3800000000000001, "a3", 0.187],
  [99.5, 0.46, "c4", 0.178], [100, 0.23, "d4", 0.212], [100.25, 0.23, "ds4", 0.178], [100.5, 0.23, "d4", 0.178], [100.75, 0.23, "c4", 0.17], [101, 0.46, "a3", 0.196],
  [101.5, 0.46, "d4", 0.196], [102, 0.92, "g4", 0.23], [103, 0.46, "a4", 0.204], [103.5, 0.46, "g4", 0.187], [104, 0.6900000000000001, "d4", 0.221], [104.75, 0.23, "d4", 0.178],
  [105, 0.46, "c4", 0.187], [105.5, 0.46, "a3", 0.178], [106, 0.23, "c4", 0.178], [106.25, 0.23, "a3", 0.17], [106.5, 0.23, "g3", 0.17], [106.75, 0.23, "a3", 0.17],
  [107, 0.92, "d4", 0.204], [108, 0.23, "g3", 0.204], [108.25, 0.23, "a3", 0.17], [108.5, 0.23, "g3", 0.17], [108.75, 0.23, "ds3", 0.162], [109, 0.46, "d3", 0.187],
  [109.5, 0.46, "g3", 0.187], [110, 0.92, "c4", 0.221], [111, 0.46, "d4", 0.204], [111.5, 0.46, "c4", 0.187], [112, 0.6900000000000001, "ds4", 0.212], [112.75, 0.23, "c4", 0.178],
  [113, 0.46, "a3", 0.178], [113.5, 0.46, "g3", 0.178], [114, 0.23, "a3", 0.17], [114.25, 0.23, "g3", 0.17], [114.5, 0.23, "ds3", 0.162], [114.75, 0.23, "g3", 0.17],
  [115, 0.92, "c4", 0.204], [116, 0.23, "g4", 0.212], [116.25, 0.23, "ds4", 0.178], [116.5, 0.23, "d4", 0.17], [116.75, 0.23, "c4", 0.17], [117, 0.23, "ds4", 0.187],
  [117.25, 0.23, "d4", 0.17], [117.5, 0.23, "c4", 0.17], [117.75, 0.23, "a3", 0.17], [118, 0.46, "c4", 0.187], [118.5, 0.46, "g3", 0.178], [119, 0.92, "ds4", 0.212],
  [120, 0.46, "c4", 0.196], [120.5, 0.46, "ds4", 0.196], [121, 0.92, "g4", 0.23], [122, 0.23, "ds4", 0.178], [122.25, 0.23, "d4", 0.17], [122.5, 0.23, "c4", 0.17],
  [122.75, 0.23, "d4", 0.17], [123, 0.92, "ds4", 0.204], [124, 0.46, "c4", 0.187], [124.5, 0.46, "a3", 0.178], [125, 0.46, "ds4", 0.204], [125.5, 0.46, "c4", 0.178],
  [126, 0.23, "a3", 0.17], [126.25, 0.23, "c4", 0.17], [126.5, 0.23, "ds4", 0.178], [126.75, 0.23, "g4", 0.187], [127, 0.92, "ds4", 0.212],
];

// The bar-level harmony (plan.json), for the epilogue's held chords.
const PROG = [
  'D', 'D', 'G', 'C', 'Eb', 'Cm', 'Adim', 'D',
  'D', 'D', 'G', 'C', 'Eb', 'Cm', 'G', 'Adim',
  'G', 'G', 'C', 'C', 'Eb', 'Eb', 'Adim', 'Adim',
  'D', 'D', 'G', 'C', 'Eb', 'Cm', 'Adim', 'Eb',
];
const HELD = { D: '[d3,a3]', G: '[d3,g3]', C: '[c3,g3]', Eb: '[ds3,g3]', Cm: '[c3,ds3,g3]', Adim: '[a2,ds3]' };

const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const NONE = ALL.map(() => 0);
const SUBJECT = {
  walls: [ALL, span(0, [[9, 16]]), ALL, span(0, [[17, 24]])],               // 4
  grapevine: [ALL, ALL, span(0, [[17, 22]])],                               // 3
  deep: [ALL, ALL, ALL, span(0, [[9, 12]])],                                // 4
  epilogue: [ALL, span(0, [[1, 8]]), ALL, span(0, [[17, 24]]), ALL],        // 5
};
const IMIT_PASSES = {
  grapevine: [ALL, span(1, [[1, 16]]), span(1, [[9, 32]]), ALL, NONE],       // 5
  deep: [ALL, ALL, span(1, [[17, 32]])],                                    // 3
  epilogue: [NONE, ALL, span(1, [[25, 32]])],                               // 3
};
const perBar = passes => '<' + passes.flat().join(' ') + '>';
const lagged = passes => { const f = passes.flat(); return [f[f.length - 1], ...f.slice(0, -1)]; };

export function createSoundtrack(S) {
  const [bass, fig, subject] = createParts(S);
  const cache = new Map();
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;
  const eighths = masks => '<' + masks.map(m => `[${m}]!32`).join(' ') + '>';
  const phrase = events => {
    const T = 100000, bars = Array.from({ length: 32 }, () => []);
    for (const [at, len, pitch, level] of events) {
      const bar = Math.floor(at / 4), start = Math.round((at - bar * 4) * T);
      const dur = Math.round(len * T), span = Math.min(dur, 4 * T - start);
      bars[bar].push(S.timecat(...[[start, S.silence],
        [span, S.note(pitch).gain(level).legato(dur / span)],
        [4 * T - start - span, S.silence]].filter(([l]) => l > 0)));
    }
    return S.cat(...bars.map(b => (b.length ? S.stack(...b) : S.silence)));
  };
  const imitNotes = phrase(IMIT);

  // The harpsichord: the soundfont plucks and rings on its own; a short release keeps it detached.
  const harp = (p, release = 0.25) => p.s('gm_harpsichord').attack(0.001).decay(0.01).sustain(1).release(release);
  const G = { harp: 1, bass: 1, fig: 1, synth: 1 };
  const subjectVoice = (f = 1) => harp(subject, 0.3).lpf(cyc([3000, 2700, 3200, 2850, 2600], f)).pan(0.62).room(0.25) // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.88], G.harp)));                                                          // 4
  const figVoice = (f = 1) => harp(fig, 0.2).lpf(cyc([2000, 1800, 2200], f)).pan(0.38).room(0.2)              // 3
    .mul(S.gain(cyc([0.62, 0.55, 0.6, 0.5, 0.58], G.fig)));                                                    // 5
  const bassVoice = (f = 1) => S.stack(
    harp(bass, 0.3).lpf(1400 * f).mul(S.gain(0.75 * G.bass)),
    bass.lpf(cyc([520, 470, 560], f)).mul(S.gain(0.55 * G.synth)),                                            // 3
  );
  const imitVoice = (f = 1) => harp(imitNotes, 0.3).lpf(2200 * f).pan(0.3).room(0.3)
    .mul(S.gain(cyc([0.5, 0.45, 0.52, 0.42], G.harp)));                                                        // 4

  const build = key => {
    if (key === 'walls') return [
      bassVoice(0.95),
      figVoice(0.9).mask(eighths(['1 0 1 0 1 0 1 0', '1 1 1 1 1 1 1 1', '1 0 1 1 1 0 1 1'])),                 // 3
      subjectVoice(0.95).mask(perBar(SUBJECT.walls)),
    ];
    if (key === 'grapevine') return [
      bassVoice(),
      figVoice().mask(eighths(['1 1 1 1 1 1 1 1', '1 0 1 1 1 0 1 1', '1 1 1 1 1 1 1 1', '1 0 1 0 1 0 1 0'])), // 4
      subjectVoice().mask(perBar(SUBJECT.grapevine)),
      imitVoice().mask(perBar([lagged(IMIT_PASSES.grapevine)])),
    ];
    if (key === 'deep') return [
      bassVoice(1.1),
      figVoice(1.12).mul(S.gain(1.05)),
      subjectVoice(1.08).mask(perBar(SUBJECT.deep)),
      imitVoice(1.1).mask(perBar([lagged(IMIT_PASSES.deep)])).mul(S.gain(1.1)),
    ];
    // The garden: slower, the subject ringing longer over soft held fifths; the imitation now and then.
    const held = S.note(perBar([PROG.map(c => HELD[c])])).s('triangle')
      .attack(0.5).decay(1).sustain(0.7).release(1.8).lpf(cyc([700, 620, 760, 660], 1)).pan(0.5).room(0.5)
      .mul(S.gain(cyc([0.05, 0.042, 0.048, 0.04])));                                                            // 4
    return [
      bassVoice(0.85).mul(S.gain(0.85)),
      held,
      figVoice(0.8).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 1 0 1 0 1 0', '1 0 0 0 1 0 1 0'])).room(0.4),       // 3
      harp(subject, 0.7).lpf(2400).pan(0.6).room(0.5).mask(perBar(SUBJECT.epilogue)).mul(S.gain(0.9)),
      imitVoice(0.85).mask(perBar([lagged(IMIT_PASSES.epilogue)])).mul(S.gain(0.8)),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'walls';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'walls');
  return soundtrack;
}
