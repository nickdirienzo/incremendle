// Phase arrangements of Ladrang Lathe (slopwave r-a52e12aeec4d), gamelan on synth voices in D major blues
// (D E F F# A B), the same scale as the game's sound effects (scale('major blues', 62)). The 32-bar
// composition (91 s at 84 BPM; four ladrang-like gongan A A' B A'', the big D gong on the last beat of
// each gongan, bar 32's gong and D5-E5 pickup lead back into bar 1's hook) keeps its notes in every
// phase. Phases add layers as the waves come and change density, tempo and tone, never key: the
// interlocking kotekan joins at the front, the bonang and kendang at the dome, the kotekan doubles to
// sixteenths for the race against Summer's thermometer. Pass-level cycles of 3, 4 and 5 passes
// (filters, gains, the melody resting in some passes, kotekan and bonang masks) run against each other,
// so the combined texture takes 60 passes to repeat exactly.
//
// Synth voices only (sine/triangle): no samples or soundfonts. The game calls
//   createMusic(A, { song })
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  works: { name: 'The Snow Works', bpm: 84 },   // waves 1-3: gongs, balungan, the melody, kethuk
  front: { name: 'The Front', bpm: 84 },        // waves 4-6: + the interlocking kotekan (eighths)
  dome: { name: 'The Dome', bpm: 88 },          // waves 7-8: + bonang, kendang, kotekan doubling to sixteenths
  race: { name: 'The Race', bpm: 112 },         // the finale race: kotekan in sixteenths throughout, urgent
  ending: { name: 'First Snow', bpm: 66 },      // the win: slower, the motif over gongs, open
};

// The score's balungan, one gatra (4 beats) per bar; the last note is the seleh
// (see .slopwave/work/no-two-alike/v1/write_score.py).
const A = ['e4 fs4 e4 a4', 'b4 a4 e4 fs4', 'a4 fs4 d4 e4', 'fs4 e4 fs4 a4',
  'd5 b4 a4 b4', 'd5 b4 fs4 a4', 'b4 a4 f4 fs4', 'e4 fs4 e4 d4'];
const A2 = [...A.slice(0, 4), 'd5 b4 a4 b4', 'fs4 a4 fs4 e4', 'd4 e4 f4 fs4', 'a4 fs4 a4 b4'];
const B = ['a4 d5 b4 a4', 'fs4 a4 b4 d5', 'd5 e5 d5 b4', 'a4 b4 a4 fs4',
  'e4 fs4 a4 b4', 'a4 fs4 f4 e4', 'fs4 a4 b4 a4', 'b4 a4 fs4 e4'];
const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const midi = n => PC[n[0]] + (n[1] === 's' ? 1 : 0) + 12 * (+n.at(-1) + 1);
const BAL = [...A, ...A2, ...B, ...A].map(g => g.split(' ').map(midi));
const fold = (m, lo) => lo + (((m - lo) % 12) + 12) % 12;
const PENT = [2, 4, 6, 9, 11];  // the kotekan's neighbours skip the blue F (it appears only where the balungan has it)
const up = m => { for (let k = 1; k < 12; k++) if (PENT.includes((m + k) % 12)) return m + k; };

// Kotekan: per beat, the composite line T U T X (T = the balungan note an octave and more up, U its upper
// neighbour, X the next beat's note, or U again when it repeats). Polos takes the on-beat halves, sangsih
// the off-beat halves, so the two parts alternate to make one line. 'eighths' keeps only T and X.
const kotekan = (part, sixteenths) => '<' + BAL.map((gatra, bar) => {
  const steps = [];
  gatra.forEach((n, i) => {
    const T = fold(n, 74), U = up(T);
    const N = fold(i < 3 ? gatra[i + 1] : BAL[(bar + 1) % 32][0], 74);
    const X = N === T ? U : N;
    const line = sixteenths ? [T, U, T, X] : [T, X];
    line.forEach((m, j) => steps.push((j % 2 === 0) === (part === 'polos') ? m : '~'));
  });
  return '[' + steps.join(' ') + ']';
}).join(' ') + '>';
// Bonang gembyang: the bar's seleh in octaves on the off-beats of beats 1-3, silent on the seleh itself.
const bonang = '<' + BAL.map(g => {
  const lo = fold(g[3], 57), d = `[${lo},${lo + 12}]`;
  return `[~ ${d} ~ ${d} ~ ${d} ~ ~]`;
}).join(' ') + '>';

// Which bars of a pass a layer plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const NONE = span(0, [[1, 32]]);
const MELODY = {
  works: [ALL, span(0, [[9, 16]]), span(0, [[17, 24]]), span(0, [[1, 8], [21, 24]])],               // 4
  wave: [ALL, ALL, span(0, [[17, 24]]), ALL, span(0, [[9, 16]])],                                     // 5
  ending: [ALL, ALL, span(0, [[9, 16]])],                                                             // 3
};
const KOTEKAN = {
  front: [span(1, [[9, 32]]), span(1, [[1, 8], [17, 32]]), span(1, [[1, 24]])],                       // 3
  // dome: sixteenths in these bars, eighths in the rest
  dome16: [span(1, [[17, 24]]), span(1, [[5, 8], [29, 32]]), span(1, [[13, 24]])],                     // 3
  ending: [span(1, [[17, 24]]), NONE, span(1, [[25, 32]]), NONE, span(1, [[9, 12], [17, 20]])],       // 5
};
const BONANG = {
  dome: [span(1, [[1, 16]]), span(1, [[9, 32]]), span(1, [[17, 32]]), span(1, [[1, 8], [25, 32]])],   // 4
};
const perBar = passes => '<' + passes.flat().join(' ') + '>';
const inverse = passes => passes.map(p => p.map(v => 1 - v));

export function createSoundtrack(S) {
  const [gongs, balungan, melody, kendang] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;

  // Layer and phase gain trims, measured on the music bus
  // (.slopwave/work/no-two-alike/integration/phase-check.mjs).
  const G = { gong: 1, bal: 1, mel: 1, kot: 1, bon: 1, ken: 1, works: 1, front: 1, dome: 1, race: 0.8, ending: 1 };

  const gongVoice = (g = 1) => gongs.mul(S.gain(cyc([1, 0.94, 0.98], g * G.gong)));               // 3
  const balVoice = (f = 1) => balungan.lpf(cyc([1800, 1650, 1900, 1700, 1750], f))                // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.9], G.bal)));                                               // 4
  const melVoice = (f = 1, release = 1) => melody.lpf(cyc([2400, 2200, 2500, 2300], f)).release(release) // 4
    .mul(S.gain(cyc([1, 0.94, 0.98], G.mel)));                                                    // 3
  const kotVoice = (sixteenths, mask, f = 1, g = 1) => S.stack(
    S.note(kotekan('polos', sixteenths)).pan(0.32),
    S.note(kotekan('sangsih', sixteenths)).pan(0.68),
  ).s('sine').attack(0.002).decay(sixteenths ? 0.28 : 0.45).sustain(0).release(0.25)
    .lpf(2600 * f).room(0.4).mask(perBar(mask))
    .gain(sixteenths ? 0.085 : 0.1).mul(S.gain(cyc([1, 0.86, 0.94, 0.8, 0.9], g * G.kot)));      // 5
  const bonVoice = (mask, f = 1) => S.note(bonang).s('triangle')
    .attack(0.003).decay(0.5).sustain(0).release(0.4).lpf(cyc([1100, 1000, 1200], f)).pan(0.44).room(0.35) // 3
    .mask(perBar(mask)).gain(0.075).mul(S.gain(G.bon));
  const kethuk = (g = 1) => S.note('~ d3 ~ ~').s('sine').attack(0.002).decay(0.16).sustain(0).release(0.1)
    .lpf(700).pan(0.52).gain(0.13 * g);
  const kendangVoice = (g = 1) => kendang.mul(S.gain(g * G.ken));
  // The race's extra kendang: a soft eighth-note pattern firmly on the grid, accented on 1 and 3.
  const kendangRace = () => S.note('38 ~ 38 38 38 ~ 38 38').s('sine').freq(70).penv(12).pdecay(0.04)
    .decay(0.1).sustain(0).gain('.32 0 .16 .12 .26 0 .16 .12').mul(S.gain(0.22 * G.ken));

  const build = key => {
    if (key === 'race') {
      // Summer's thermometer: the same notes faster, the kotekan doubled to sixteenths throughout,
      // the bonang every bar, the kendang driving eighths; the melody plays every pass.
      return [
        gongVoice(1.05),
        balVoice(1.05),
        melVoice(1.05).mul(S.gain(1.1)),
        kotVoice(true, [ALL], 1.05),
        bonVoice([ALL], 1.05),
        kendangVoice(1),
        kendangRace(),
        kethuk(0.9),
      ];
    }
    if (key === 'ending') {
      // First snow: slower, the balungan thinned to beats 2 and 4, the motif ringing longer over the gongs,
      // a little kotekan glitter now and then.
      return [
        gongVoice(1.15),
        balVoice(0.85).mask('0 1 0 1').mul(S.gain(0.85)),
        melVoice(1, 1.8).room(0.6).mask(perBar(MELODY.ending)),
        kotVoice(false, KOTEKAN.ending, 0.9, 0.7),
      ];
    }
    const tier = { works: 0, front: 1, dome: 2 }[key];
    const bright = [1, 1.04, 1.1][tier];
    const layers = [
      gongVoice(),
      balVoice(bright),
      melVoice(bright).mask(perBar(tier === 0 ? MELODY.works : MELODY.wave)),
      kethuk(),
    ];
    if (tier === 1) layers.push(kotVoice(false, KOTEKAN.front, bright));
    if (tier === 2) layers.push(
      kotVoice(true, KOTEKAN.dome16, bright),
      kotVoice(false, inverse(KOTEKAN.dome16), bright),
      bonVoice(BONANG.dome, bright),
      kendangVoice(0.9),
    );
    return layers;
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'works';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'works');
  return soundtrack;
}
