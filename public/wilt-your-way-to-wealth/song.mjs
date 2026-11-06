// Tumble Hill Air (Wilt Your Way to Wealth). Adapted from slopwave r-00ef7345a5ea; exposes the six stems
// [bass, pad, melody, kick, snare, hat] via createParts(S) (the three drum stems are empty: no drums) without
// changing notes or envelopes. createPattern(S) stacks them exactly as the revision did.
// slopwave score SHA-256: c951537ef2c1535d2cbc00eaa01a7637f1b3883a533128a61a14a2c04c74e34f
export const bpm = 72;
export const beats = 128;
export const cps = bpm / 240;
export function createParts(S) {
const {stack, cat, timecat, silence, note, gain} = S;
const BPM = 72.000000;
const BEATS = 128.00000000; // full recording; repeats from the beginning

// Mix controls: set a part to 0 to mute it.
const mix = { low: 0.5, middle: 0.42, high: 0.8, drums: 0 };

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
  [0,3.6,"f2",0.5], [4,1.8,"f2",0.44], [6,1.8,"c3",0.38], [8,3.6,"f2",0.5],
  [12,1.8,"f2",0.44], [14,1.8,"c3",0.38], [16,3.6,"a2",0.5], [20,1.8,"a2",0.44],
  [22,1.8,"e2",0.38], [24,3.6,"d2",0.5], [28,3.6,"g2",0.5], [32,3.6,"f2",0.5],
  [36,1.8,"f2",0.44], [38,1.8,"c3",0.38], [40,3.6,"f2",0.5], [44,1.8,"f2",0.44],
  [46,1.8,"c3",0.38], [48,3.6,"e2",0.5], [52,1.8,"e2",0.44], [54,1.8,"b2",0.38],
  [56,3.6,"c3",0.5], [60,1.8,"c3",0.44], [62,1.8,"g2",0.38], [64,3.6,"d2",0.5],
  [68,1.8,"d2",0.44], [70,1.8,"a2",0.38], [72,3.6,"e2",0.5], [76,1.8,"e2",0.44],
  [78,1.8,"b2",0.38], [80,3.6,"f2",0.5], [84,1.8,"f2",0.44], [86,1.8,"c3",0.38],
  [88,3.6,"a2",0.5], [92,3.6,"g2",0.5], [96,3.6,"f2",0.5], [100,1.8,"f2",0.44],
  [102,1.8,"c3",0.38], [104,3.6,"f2",0.5], [108,1.8,"f2",0.44], [110,1.8,"c3",0.38],
  [112,3.6,"a2",0.5], [116,3.6,"d2",0.5], [120,3.6,"f2",0.5], [124,1.8,"f2",0.44],
  [126,1.8,"c3",0.38]
];

const middle = [
  [0,7.75,"a3",0.18], [0,7.75,"c4",0.17], [0,7.75,"e4",0.15], [0,7.75,"f3",0.2],
  [8,7.75,"b3",0.17], [8,7.75,"d4",0.15], [8,7.75,"f3",0.2], [8,7.75,"g3",0.18],
  [16,7.75,"a3",0.17], [16,7.75,"c4",0.15], [16,7.75,"e3",0.2], [16,7.75,"g3",0.18],
  [24,3.75,"a3",0.18], [24,3.75,"c4",0.17], [24,3.75,"d3",0.2], [24,3.75,"e4",0.15],
  [28,3.75,"b3",0.17], [28,3.75,"d3",0.2], [28,3.75,"e4",0.15], [28,3.75,"g3",0.18],
  [32,7.75,"a3",0.18], [32,7.75,"c4",0.17], [32,7.75,"e4",0.15], [32,7.75,"f3",0.2],
  [40,7.75,"b3",0.17], [40,7.75,"d4",0.15], [40,7.75,"f3",0.2], [40,7.75,"g3",0.18],
  [48,7.75,"b3",0.17], [48,7.75,"d4",0.15], [48,7.75,"e3",0.2], [48,7.75,"g3",0.18],
  [56,7.75,"b3",0.17], [56,7.75,"c3",0.2], [56,7.75,"e4",0.15], [56,7.75,"g3",0.18],
  [64,7.75,"a3",0.18], [64,7.75,"c4",0.17], [64,7.75,"d3",0.2], [64,7.75,"e4",0.15],
  [72,7.75,"b3",0.17], [72,7.75,"d4",0.15], [72,7.75,"e3",0.2], [72,7.75,"g3",0.18],
  [80,7.75,"a3",0.18], [80,7.75,"b3",0.17], [80,7.75,"e4",0.15], [80,7.75,"f3",0.2],
  [88,3.75,"a3",0.17], [88,3.75,"c4",0.15], [88,3.75,"e3",0.2], [88,3.75,"g3",0.18],
  [92,3.75,"b3",0.17], [92,3.75,"d3",0.2], [92,3.75,"e4",0.15], [92,3.75,"g3",0.18],
  [96,7.75,"a3",0.18], [96,7.75,"c4",0.17], [96,7.75,"e4",0.15], [96,7.75,"f3",0.2],
  [104,7.75,"b3",0.17], [104,7.75,"d4",0.15], [104,7.75,"f3",0.2], [104,7.75,"g3",0.18],
  [112,3.75,"a3",0.17], [112,3.75,"c4",0.15], [112,3.75,"e3",0.2], [112,3.75,"g3",0.18],
  [116,3.75,"a3",0.18], [116,3.75,"c4",0.17], [116,3.75,"d3",0.2], [116,3.75,"e4",0.15],
  [120,7.75,"b3",0.17], [120,7.75,"d4",0.15], [120,7.75,"f3",0.2], [120,7.75,"g3",0.18]
];

const high = [
  [0,1.38,"c5",0.27], [1.5,0.46,"a4",0.22], [2,1.84,"b4",0.27], [4,2.76,"c5",0.26],
  [8,1.38,"d5",0.27], [9.5,0.46,"b4",0.22], [10,1.84,"a4",0.24], [12,2.76,"g4",0.23],
  [15,0.46,"a4",0.2], [15.5,0.46,"b4",0.22], [16,1.38,"c5",0.25], [17.5,0.46,"e5",0.24],
  [18,1.84,"d5",0.26], [20,1.84,"c5",0.24], [22,0.92,"a4",0.22], [23,0.92,"g4",0.21],
  [24,1.38,"a4",0.23], [25.5,0.46,"c5",0.22], [26,1.84,"e5",0.26], [28,2.76,"d5",0.25],
  [32,1.38,"c5",0.27], [33.5,0.46,"a4",0.22], [34,1.84,"b4",0.27], [36,2.76,"c5",0.26],
  [40,1.38,"d5",0.27], [41.5,0.46,"b4",0.22], [42,1.84,"a4",0.24], [44,1.84,"g4",0.22],
  [46,0.92,"b4",0.23], [47,0.92,"d5",0.24], [48,1.38,"e5",0.27], [49.5,0.46,"d5",0.22],
  [50,1.84,"b4",0.25], [52,2.76,"g4",0.22], [55,0.92,"a4",0.21], [56,1.84,"b4",0.24],
  [58,0.92,"c5",0.23], [59,0.92,"d5",0.24], [60,2.76,"e5",0.26], [64,1.84,"f5",0.26],
  [66,1.84,"e5",0.24], [68,2.76,"a4",0.22], [71,0.92,"c5",0.22], [72,1.84,"g5",0.25],
  [74,0.92,"e5",0.23], [75,0.92,"d5",0.22], [76,2.76,"b4",0.24], [79,0.92,"d5",0.22],
  [80,1.84,"e5",0.26], [82,1.84,"b4",0.27], [84,1.84,"c5",0.24], [86,1.38,"a4",0.22],
  [88,1.38,"c5",0.24], [89.5,0.46,"d5",0.22], [90,1.84,"e5",0.26], [92,1.84,"d5",0.25],
  [94,0.92,"b4",0.23], [95,0.92,"a4",0.22], [96,1.38,"c5",0.27], [97.5,0.46,"a4",0.22],
  [98,1.84,"b4",0.27], [100,2.76,"c5",0.26], [104,1.38,"d5",0.27], [105.5,0.46,"b4",0.22],
  [106,1.84,"a4",0.24], [108,2.76,"g4",0.23], [111,0.46,"a4",0.2], [111.5,0.46,"b4",0.22],
  [112,1.38,"c5",0.25], [113.5,0.46,"e5",0.24], [114,1.84,"d5",0.26], [116,1.84,"c5",0.24],
  [118,1.84,"a4",0.22], [120,1.38,"b4",0.25], [121.5,0.46,"a4",0.21], [122,1.84,"g4",0.23],
  [124,2.3,"g4",0.22], [127,0.46,"a4",0.2], [127.5,0.46,"b4",0.22]
];

const kick = [

];

const snare = [

];

const hat = [

];

return [
  phrase(low).s("triangle").lpf(380).attack(0.08).decay(0.6).sustain(0.6).release(0.8).mul(gain(mix.low)),
  phrase(middle).s("sawtooth").lpf(760).attack(1.2).decay(1.0).sustain(0.7).release(2.5).pan(0.5).room(0.5).mul(gain(mix.middle)),
  phrase(high).s("triangle").lpf(2200).vib(4.5).vibmod(0.08).attack(0.03).decay(0.6).sustain(0.4).release(0.9).pan(0.56).room(0.45).mul(gain(mix.high)),
  phrase(kick).s("sine").freq(65).penv(18).pdecay(0.045)
    .decay(0.12).sustain(0).mul(gain(mix.drums)),
  phrase(snare).s("white").hpf(900).lpf(5500)
    .decay(0.085).sustain(0).mul(gain(mix.drums * 0)),
  phrase(hat).s("white").hpf(6500)
    .decay(0.025).sustain(0).mul(gain(mix.drums * 0))
];
}
export function createPattern(S) { return S.stack(...createParts(S)); }
