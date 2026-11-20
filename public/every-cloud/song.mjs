// Houston, We Have a View (Every Cloud). Adapted from slopwave r-cfd6b7f217d3; exposes the stems
// [sub, pad, bells, kick, snare, hat] via createParts(S) without changing notes, timing or envelopes (the three
// drum stems are empty and silent: the score has no drums); createPattern(S) stacks them exactly as the revision did.
// D phrygian (D Eb F G A Bb C), 64 BPM reference, 40 bars (A1 A2 B C-drift A3).
// slopwave score SHA-256: 13b44c0424280a2be4c332ab8d22debe9261682f0f344e2558ae9b4b692b5445
export const bpm = 64;
export const beats = 160;
export const cps = bpm / 240;
export function createParts(S) {
const {stack, cat, timecat, silence, note, gain} = S;
const BPM = 64.000000;
const BEATS = 160.00000000; // full recording; repeats from the beginning

// Mix controls: set a part to 0 to mute it.
const mix = { low: 0.3, middle: 0.3, high: 0.46, drums: 0 };

// Events: [start beat, duration in beats, note name/MIDI, relative level].
// Unequal spacing preserves the detected timing instead of forcing a grid.
// Schedule only the current bar so fast phrases do not lose note attacks.
const phrase = events => {
  const ticks = 100000;
  const bars = Array.from({ length: Math.ceil(BEATS / 4) }, () => []);
  const widths = bars.map((_, bar) => Math.round(Math.min(4, BEATS - bar * 4) * ticks));
  for (const [at, len, pitch, level] of events) {
    const bar = Math.floor(at / 4);
    const start = Math.round((at - bar * 4) * ticks);
    const duration = Math.round(Math.min(len, BEATS - at) * ticks);
    const span = Math.min(duration, widths[bar] - start);
    if (span <= 0) continue;
    bars[bar].push(timecat(...[
      [start, silence],
      [span, note(pitch).gain(level).legato(duration / span)],
      [widths[bar] - start - span, silence]
    ].filter(([length]) => length > 0)));
  }
  const patterns = bars.map(events => events.length ? stack(...events) : silence);
  if (BEATS % 4 === 0) return cat(...patterns);
  const padded = patterns.map((pattern, bar) => widths[bar] === 4 * ticks
    ? pattern : pattern.compress(0, widths[bar] / (4 * ticks)));
  return cat(...padded).fast(padded.length)
    .zoom(0, BEATS / (4 * padded.length)).slow(BEATS / 4);
};

const low = [
  [0,7.85,"d2",0.42], [8,7.85,"ds2",0.42], [16,7.85,"g2",0.42], [24,3.85,"as1",0.42],
  [28,3.85,"ds2",0.42], [32,7.85,"d2",0.42], [40,7.85,"ds2",0.42], [48,3.85,"g2",0.42],
  [52,3.85,"c2",0.42], [56,3.85,"ds2",0.42], [60,3.85,"d2",0.42], [64,7.85,"as1",0.42],
  [72,7.85,"g2",0.42], [80,7.85,"c2",0.42], [88,7.85,"ds2",0.42], [96,3.85,"d2",0.36],
  [100,3.85,"d2",0.36], [104,3.85,"d2",0.36], [108,3.85,"d2",0.36], [112,3.85,"d2",0.36],
  [116,3.85,"d2",0.36], [120,3.85,"d2",0.36], [124,3.85,"ds2",0.36], [128,7.85,"d2",0.42],
  [136,7.85,"ds2",0.42], [144,3.85,"g2",0.42], [148,3.85,"c2",0.42], [152,3.85,"ds2",0.42],
  [156,3.0,"d2",0.42]
];

const middle = [
  [0,7.85,"a3",0.3], [0,7.85,"c4",0.3], [0,7.85,"d4",0.3], [0,7.85,"f4",0.33],
  [8,7.85,"as3",0.3], [8,7.85,"d4",0.3], [8,7.85,"g3",0.3], [8,7.85,"g4",0.33],
  [16,7.85,"a4",0.33], [16,7.85,"as3",0.3], [16,7.85,"d4",0.3], [16,7.85,"f4",0.3],
  [24,3.85,"a3",0.3], [24,3.85,"as3",0.3], [24,3.85,"d4",0.3], [24,3.85,"f4",0.33],
  [28,3.85,"as3",0.3], [28,3.85,"d4",0.3], [28,3.85,"g3",0.3], [28,3.85,"g4",0.33],
  [32,7.85,"a3",0.32], [32,7.85,"c4",0.32], [32,7.85,"d4",0.32], [32,7.85,"f4",0.352],
  [40,7.85,"as3",0.32], [40,7.85,"d4",0.32], [40,7.85,"g3",0.32], [40,7.85,"g4",0.352],
  [48,3.85,"a4",0.352], [48,3.85,"as3",0.32], [48,3.85,"d4",0.32], [48,3.85,"f4",0.32],
  [52,3.85,"as3",0.32], [52,3.85,"d4",0.32], [52,3.85,"ds4",0.32], [52,3.85,"g4",0.352],
  [56,3.85,"as3",0.32], [56,3.85,"d4",0.32], [56,3.85,"g3",0.32], [56,3.85,"g4",0.352],
  [60,3.85,"a3",0.32], [60,3.85,"c4",0.32], [60,3.85,"d4",0.32], [60,3.85,"f4",0.352],
  [64,7.85,"a3",0.34], [64,7.85,"as3",0.34], [64,7.85,"d4",0.34], [64,7.85,"f4",0.374],
  [72,7.85,"a4",0.374], [72,7.85,"as3",0.34], [72,7.85,"d4",0.34], [72,7.85,"f4",0.34],
  [80,7.85,"as3",0.34], [80,7.85,"d4",0.34], [80,7.85,"ds4",0.34], [80,7.85,"g4",0.374],
  [88,7.85,"as3",0.34], [88,7.85,"d4",0.34], [88,7.85,"g3",0.34], [88,7.85,"g4",0.374],
  [96,3.85,"a3",0.26], [96,3.85,"c4",0.26], [96,3.85,"d4",0.26], [96,3.85,"f4",0.286],
  [100,3.85,"as3",0.26], [100,3.85,"ds4",0.26], [100,3.85,"g3",0.26], [100,3.85,"g4",0.286],
  [104,3.85,"a3",0.26], [104,3.85,"c4",0.26], [104,3.85,"d4",0.26], [104,3.85,"f4",0.286],
  [108,3.85,"as3",0.26], [108,3.85,"ds4",0.26], [108,3.85,"g3",0.26], [108,3.85,"g4",0.286],
  [112,3.85,"a3",0.26], [112,3.85,"c4",0.26], [112,3.85,"d4",0.26], [112,3.85,"f4",0.286],
  [116,3.85,"as3",0.26], [116,3.85,"ds4",0.26], [116,3.85,"g3",0.26], [116,3.85,"g4",0.286],
  [120,3.85,"a4",0.286], [120,3.85,"as3",0.26], [120,3.85,"d4",0.26], [120,3.85,"f4",0.26],
  [124,3.85,"as3",0.26], [124,3.85,"d4",0.26], [124,3.85,"g3",0.26], [124,3.85,"g4",0.286],
  [128,7.85,"a3",0.32], [128,7.85,"c4",0.32], [128,7.85,"d4",0.32], [128,7.85,"f4",0.352],
  [136,7.85,"as3",0.32], [136,7.85,"d4",0.32], [136,7.85,"g3",0.32], [136,7.85,"g4",0.352],
  [144,3.85,"a4",0.352], [144,3.85,"as3",0.32], [144,3.85,"d4",0.32], [144,3.85,"f4",0.32],
  [148,3.85,"as3",0.32], [148,3.85,"d4",0.32], [148,3.85,"ds4",0.32], [148,3.85,"g4",0.352],
  [152,3.85,"as3",0.32], [152,3.85,"d4",0.32], [152,3.85,"g3",0.32], [152,3.85,"g4",0.352],
  [156,3.0,"a3",0.32], [156,3.0,"c4",0.32], [156,3.0,"d4",0.32], [156,3.0,"f4",0.352]
];

const high = [
  [1,0.5,"d5",0.22], [1.5,2.5,"a5",0.3], [6,1,"g5",0.3], [7,1,"f5",0.3],
  [8,1,"as5",0.3], [9,0.5,"d6",0.22], [9.5,2.5,"ds6",0.3], [12,3,"d6",0.3],
  [17,0.5,"d5",0.22], [17.5,2.5,"as5",0.3], [22,1,"a5",0.3], [23,1,"f5",0.3],
  [24,2,"f5",0.3], [26,2,"a5",0.3], [28,3,"g5",0.3], [33,0.5,"d5",0.22],
  [33.5,2.5,"a5",0.3], [38.5,0.5,"c6",0.22], [39,1,"a5",0.3], [40,1,"as5",0.3],
  [41,0.5,"d6",0.22], [41.5,2.5,"ds6",0.3], [44,3,"d6",0.3], [49,0.5,"d5",0.22],
  [49.5,2.5,"as5",0.3], [52,1,"g5",0.3], [53,1,"as5",0.3], [54,2,"ds6",0.3],
  [56,1,"g5",0.3], [57,0.5,"as5",0.22], [57.5,2.5,"ds6",0.3], [60,2.5,"d6",0.3],
  [65,0.5,"d6",0.22], [65.5,2.5,"a5",0.3], [70,2,"f5",0.3], [73,0.5,"d6",0.22],
  [73.5,1.5,"as5",0.3], [75,1,"a5",0.3], [81,0.5,"c6",0.22], [81.5,2.5,"g5",0.3],
  [86,1,"as5",0.3], [87,1,"d6",0.3], [88,3,"ds6",0.3], [93,2,"as5",0.3],
  [98,2,"a5",0.255], [101,3,"ds6",0.255], [114,2,"d6",0.255], [120,3,"as5",0.255],
  [129,0.5,"d5",0.22], [129.5,2.5,"a5",0.3], [134,1,"g5",0.3], [135,1,"f5",0.3],
  [136,1,"as5",0.3], [137,0.5,"d6",0.22], [137.5,2.5,"ds6",0.3], [140,3,"d6",0.3],
  [145,0.5,"d5",0.22], [145.5,2.5,"as5",0.3], [148,1,"as5",0.3], [149,1,"d6",0.3],
  [150,2,"ds6",0.3], [152,2,"d6",0.3], [154,0.5,"as5",0.22], [154.5,1.5,"g5",0.3],
  [156,2,"d6",0.3]
];

const kick = [

];

const snare = [

];

const hat = [

];

return [
  phrase(low).s("sine").lpf(300).attack(0.4).decay(0.1).sustain(1).release(1.5).pan(0.5).room(0.2).mul(gain(mix.low)),
  phrase(middle).s("sawtooth").lpf(900).attack(1.6).decay(0.6).sustain(0.85).release(2.5).pan(0.5).room(0.6).mul(gain(mix.middle)),
  phrase(high).s("sine").lpf(5000).attack(0.005).decay(1.8).sustain(0.05).release(2).pan(0.6).room(0.7).mul(gain(mix.high)),
  phrase(kick).s("sine").freq(65).penv(18).pdecay(0.045)
    .decay(0.12).sustain(0).mul(gain(mix.drums)),
  phrase(snare).s("white").hpf(900).lpf(5500)
    .decay(0.085).sustain(0).mul(gain(mix.drums * 0)),
  phrase(hat).s("white").hpf(6500)
    .decay(0.025).sustain(0).mul(gain(mix.drums * 0))
]
;
}
export function createPattern(S) { return S.stack(...createParts(S)); }
