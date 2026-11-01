// Phase arrangements of Regulation Eighteen (slopwave r-06169761167d), a kalimba-folk piece in
// D harmonic minor (D E F G A Bb C#), the same scale as the game's sound effects. The 32-bar
// composition (83.5 s at 92 BPM) stays intact in every phase; phases change layers, tempo and
// tone. Only 'clear' changes harmony, on purpose: F becomes F# in the D minor bars (a Picardy
// third), so the ending resolves to D major. Pass-level cycles of 3, 4 and 5 passes (gain, filter,
// ostinato masks, the melody resting in some passes) run against each other, so the combined
// texture takes 60 passes (about 80 minutes) to repeat exactly. No random note deletion.
//
// Sampled voices: VCSL 'kalimba' (lead, canon, ostinato) and 'shaker_small' (thick's tick); the
// bass stays the session's synth. The game must call
//   createMusic(A, { packs: ['vcsl'], song })
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  fog:       { name: 'Fog',       bpm: 92 }, // the lighthouse alone: sparse, the melody hesitant
  eastpoint: { name: 'Eastpoint', bpm: 92 }, // the rival light: a second kalimba copies the lead a bar late
  thick:     { name: 'Thick',     bpm: 97 }, // the busy final third: fullest, shaker, brighter
  clear:     { name: 'Clear',     bpm: 78 }, // the fog lifts: slower, warm, resolves to D major
};

// The score's chord per bar (see .slopwave/work/eighteen-pleats/plan.json).
const PROG = [
  'Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'A', 'Dm',   // A1
  'Dm', 'Dm', 'Gm', 'A', 'Bb', 'Gm', 'A', 'A',    // A2
  'Bb', 'Gm', 'Dm', 'A', 'Bb', 'Gm', 'F+', 'A',   // B
  'Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'Gm', 'A',   // A3
];
// Warm held chords for 'clear' (already with the Picardy F# in the D bars).
const PAD = { Dm: '[d3,fs3,a3]', Gm: '[d3,g3,as3]', A: '[cs3,e3,a3]', Bb: '[d3,f3,as3]', 'F+': '[cs3,f3,a3]' };

// The canon: the lead copied one bar late and an octave down, as Eastpoint copies Skerry Light
// (bar 1 copies bar 32, so it runs straight through the loop seam). Where a copied quarter or
// longer note would clash with the new bar's chord or the lead, it moves a step to a chord tone;
// see .slopwave/work/eighteen-pleats/v2/canon.json. [start beat, beats, note, level]
const CANON = [
  [0,0.9,"f4",0.216], [1,0.45,"d4",0.189], [1.5,0.45,"cs4",0.189], [2,0.9,"d4",0.198], [3,0.9,"cs4",0.189], [4,0.45,"a3",0.198],
  [4.5,0.45,"d4",0.216], [5,0.9,"f4",0.234], [6,0.45,"e4",0.198], [6.5,0.45,"d4",0.189], [7,0.9,"a3",0.198], [9,0.45,"f4",0.207],
  [9.5,0.45,"e4",0.189], [10,0.45,"d4",0.198], [10.5,0.45,"cs4",0.189], [11,0.95,"d4",0.207], [12,0.45,"as3",0.198], [12.5,0.45,"d4",0.216],
  [13,0.9,"g4",0.234], [14,0.45,"d4",0.198], [14.5,0.45,"as3",0.189], [15,0.9,"d4",0.198], [16,0.9,"f4",0.225], [17,0.45,"d4",0.198],
  [17.5,0.45,"cs4",0.189], [18,0.45,"as3",0.198], [18.5,0.45,"cs4",0.198], [19,0.95,"a3",0.198], [20,0.45,"a3",0.198], [20.5,0.45,"d4",0.216],
  [21,0.9,"f4",0.234], [22,0.45,"e4",0.198], [22.5,0.45,"d4",0.189], [23,0.9,"a3",0.198], [24,0.9,"e4",0.225], [25,0.45,"d4",0.198],
  [25.5,0.45,"f4",0.198], [26,0.9,"g4",0.216], [27,0.9,"e4",0.198], [28,0.45,"e4",0.207], [28.5,0.45,"cs4",0.189], [29,0.9,"a3",0.198],
  [30,0.45,"as3",0.189], [30.5,0.45,"cs4",0.198], [31,0.9,"e4",0.207], [32,2.5,"d4",0.216], [38,0.45,"a3",0.189], [38.5,0.45,"d4",0.198],
  [39,0.9,"f4",0.216], [40,0.45,"e4",0.198], [40.5,0.45,"d4",0.189], [41,0.45,"cs4",0.189], [41.5,0.45,"d4",0.189], [42,1.9,"as3",0.198],
  [44,0.45,"as3",0.198], [44.5,0.45,"d4",0.216], [45,0.9,"g4",0.234], [46,0.45,"d4",0.198], [46.5,0.45,"as3",0.189], [47,0.9,"d4",0.198],
  [48,0.9,"f4",0.225], [49,0.45,"d4",0.198], [49.5,0.45,"cs4",0.189], [50,0.45,"as3",0.198], [50.5,0.45,"cs4",0.198], [51,0.95,"a3",0.198],
  [52,0.45,"d4",0.198], [52.5,0.45,"f4",0.207], [53,0.9,"g4",0.225], [54,0.45,"f4",0.198], [54.5,0.45,"d4",0.189], [55,0.9,"f4",0.207],
  [56,0.9,"g4",0.225], [57,0.45,"f4",0.189], [57.5,0.45,"d4",0.189], [58,0.9,"a3",0.198], [59,0.9,"cs4",0.198], [60,0.45,"cs4",0.198],
  [60.5,0.45,"e4",0.207], [61,0.9,"a4",0.234], [62,0.45,"g4",0.198], [62.5,0.45,"e4",0.189], [63,0.9,"cs4",0.198], [64,2.4,"f4",0.216],
  [67,0.45,"cs4",0.171], [67.5,0.45,"d4",0.18], [68,1.4,"g4",0.216], [69.5,0.45,"d4",0.18], [70,1.9,"as3",0.198], [72,1.4,"d4",0.207],
  [73.5,0.45,"as3",0.18], [74,0.9,"f3",0.189], [75,0.9,"as3",0.189], [76,1.4,"a3",0.198], [77.5,0.45,"d4",0.189], [78,1.9,"e4",0.216],
  [80,1.4,"f4",0.207], [81.5,0.45,"cs4",0.18], [82,0.9,"as3",0.189], [83,0.45,"as3",0.18], [83.5,0.45,"cs4",0.189], [84,1.4,"d4",0.207],
  [85.5,0.45,"f4",0.198], [86,0.9,"g4",0.216], [87,0.9,"f4",0.198], [88,1.4,"f4",0.216], [89.5,0.45,"d4",0.18], [90,1.9,"a3",0.198],
  [92,0.9,"cs4",0.198], [93,0.45,"a3",0.18], [93.5,0.45,"cs4",0.189], [94,1.9,"e4",0.207], [96,0.9,"f4",0.207], [97,0.45,"cs4",0.189],
  [97.5,0.45,"as3",0.18], [98,1.9,"a3",0.189], [100,0.45,"a3",0.198], [100.5,0.45,"d4",0.216], [101,0.9,"f4",0.234], [102,0.45,"e4",0.198],
  [102.5,0.45,"d4",0.189], [103,0.9,"a3",0.198], [105,0.45,"f4",0.207], [105.5,0.45,"e4",0.189], [106,0.45,"d4",0.198], [106.5,0.45,"cs4",0.189],
  [107,0.95,"d4",0.207], [108,0.45,"as3",0.198], [108.5,0.45,"d4",0.216], [109,0.9,"g4",0.234], [110,0.45,"d4",0.198], [110.5,0.45,"as3",0.189],
  [111,0.9,"d4",0.198], [112,0.9,"f4",0.225], [113,0.45,"d4",0.198], [113.5,0.45,"cs4",0.189], [114,0.45,"as3",0.198], [114.5,0.45,"cs4",0.198],
  [115,0.95,"a3",0.198], [116,0.9,"f4",0.225], [117,0.45,"e4",0.198], [117.5,0.45,"d4",0.189], [118,0.9,"as3",0.198], [119,0.9,"d4",0.207],
  [120,1.9,"g4",0.216], [122,0.9,"d4",0.198], [123,0.9,"as3",0.189], [124,0.45,"as3",0.189], [124.5,0.45,"d4",0.198], [125,1.9,"g4",0.216],
];

// Which bars of a pass the lead plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const LEAD_PASSES = {
  fog: [span(1, [[1, 8], [25, 32]]), span(1, [[9, 24]]), span(1, [[1, 4], [25, 32]]), ALL],  // 4
  eastpoint: [ALL, span(0, [[17, 24]]), ALL, span(0, [[1, 8]])],                             // 4
  thick: [ALL, ALL, span(0, [[17, 20]])],                                                    // 3
};
// One entry per cycle (bar) across the passes, e.g. '<1 1 0 ...>'.
const perBar = passes => '<' + passes.flat().join(' ') + '>';
// The canon rests a bar after the lead does: the same mask, one bar later.
const lagged = passes => { const f = passes.flat(); return [f[f.length - 1], ...f.slice(0, -1)]; };
const DM = PROG.map(c => (c === 'Dm' ? 1 : 0));

export function createSoundtrack(S) {
  const [bass, ostinato, lead, kick, , tick] = createParts(S);
  const cache = new Map();
  const midi = v => (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note));
  const shift = (p, semitones) => p.fmap(v => ({ ...v, note: midi(v) + semitones }));
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;
  // Eighth-note masks that change once per pass.
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
  const canonNotes = phrase(CANON);

  // The tine: VCSL kalimba with its own ring (the session's synth envelope is replaced).
  const tine = (p, release = 0.5) => p.s('kalimba').attack(0.002).decay(0.01).sustain(1).release(release);
  const bassBreath = (p, f = 1) => p.lpf(cyc([600, 540, 660], f));                          // 3
  const ostBreath = (p, f = 1) => tine(p, 0.35).lpf(cyc([1600, 1450, 1750, 1500, 1350], f)) // 5
    .pan(0.4).mul(S.gain(cyc([1, 0.86, 0.95, 0.8])));                                       // 4
  const leadVoice = (p, f = 1) => tine(p).lpf(2300 * f).pan(0.62).room(0.3)
    .mul(S.gain(cyc([1, 0.9, 0.97, 0.84, 0.93])));                                          // 5
  const canonVoice = (f = 1) => tine(canonNotes, 0.45).lpf(1900 * f).pan(0.3).room(0.35)
    .mul(S.gain(cyc([0.28, 0.25, 0.3, 0.22, 0.27])));                                        // 5 (offset)
  // The tick's off-beat onsets on a VCSL small shaker (the session's white-noise tick is far quieter
  // and above 6.5 kHz); its own sample, keeping the tick's accent ratio, band-limited to 1.2-4.5 kHz and kept low.
  const shaker = (g = 1) => tick.fmap(({ gain }) => ({ s: 'shaker_small', n: 0, gain: gain * 700 }))
    .hpf(1200).lpf(4500).mul(S.gain(cyc([1, 0.75, 0.9, 0.6], g)));                             // 4
  // The Picardy third: F -> F# in the D minor bars only (Bb and Gm keep their F/Bb, borrowed and warm).
  const picardy = p => S.stack(
    p.mask(perBar([DM])).fmap(v => { const m = midi(v); return { ...v, note: m % 12 === 5 ? m + 1 : m }; }),
    p.mask(perBar([DM.map(x => 1 - x)])),
  );

  // Phase gain trims, measured on the music bus (phase-check.mjs) so phases sit close together.
  const G = { kal: 1.24, bass: 1, ost: 0.68 };

  // The layers of one phase (also used by the integration checks to solo a voice).
  const build = key => {
    let layers;
    if (key === 'fog') {
      // Alone in the fog: bass, a sparse ostinato (the 3+3+2 accents, filled in on some passes),
      // and the melody only now and then.
      layers = [
        bassBreath(bass, 0.92).mul(S.gain(G.bass * 0.88)),
        ostBreath(ostinato, 0.9).mask(eighths(['1 0 0 1 0 0 1 0', '1 0 1 1 0 0 1 0', '1 0 0 1 0 1 1 0'])) // 3
          .mul(S.gain(G.ost * 1.25)),
        leadVoice(lead, 0.95).mask(perBar(LEAD_PASSES.fog)).mul(S.gain(G.kal * 0.92)),
      ];
    } else if (key === 'eastpoint') {
      // Eastpoint copies everything: the canon, a bar late on the other side. Fuller ostinato.
      layers = [
        bassBreath(bass).mul(S.gain(G.bass)),
        ostBreath(ostinato).mask(eighths(['1 1 1 1 1 1 1 1', '1 0 1 1 0 1 1 0', '1 1 1 1 1 1 1 1'])) // 3
          .mul(S.gain(G.ost)),
        leadVoice(lead).mask(perBar(LEAD_PASSES.eastpoint)).mul(S.gain(G.kal)),
        canonVoice().mask(perBar([lagged(LEAD_PASSES.eastpoint)])).mul(S.gain(G.kal)),
        kick.mul(S.gain(0.55)),
      ];
    } else if (key === 'thick') {
      // The busy final third: everything, brighter, a soft shaker on the off-beats.
      layers = [
        bassBreath(bass, 1.12).mul(S.gain(G.bass)),
        ostBreath(ostinato, 1.15).mul(S.gain(G.ost * 1.05)),
        leadVoice(lead, 1.12).mask(perBar(LEAD_PASSES.thick)).mul(S.gain(G.kal)),
        canonVoice(1.12).mask(perBar([lagged(LEAD_PASSES.thick)])).mul(S.gain(G.kal * 1.05)),
        kick.mul(S.gain(0.7)),
        shaker(),
      ];
    } else {
      // The fog lifts and the rule is struck: slower, warm held chords, D major. No percussion.
      // Eastpoint plays along softly on two passes of three.
      const pad = S.note(perBar([PROG.map(c => PAD[c])])).s('triangle')
        .attack(0.6).decay(1).sustain(0.7).release(2).lpf(cyc([700, 620, 780, 660], 1)).pan(0.5).room(0.5)
        .mul(S.gain(cyc([0.036, 0.03, 0.034, 0.028])));                                       // 4
      layers = [
        picardy(bass).release(0.4).mul(S.gain(G.bass * 0.85)),
        pad,
        picardy(ostBreath(ostinato, 0.85)).mul(S.gain(G.ost * 0.9)).room(0.4),
        picardy(leadVoice(lead, 0.95)).release(0.8).room(0.5).mul(S.gain(G.kal * 0.95)),
        picardy(canonVoice(0.9)).mask(perBar([[...ALL.map(() => 0)], ALL, span(1, [[2, 17]])])) // 3
          .mul(S.gain(G.kal * 0.8)),
      ];
    }
    return layers;
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'fog';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'fog');
  return soundtrack;
}
