// Phase arrangements of Gending Kertu Pungkasan (slopwave r-d78713c5856a), a slow gamelan-style
// piece in E hirajoshi (E F# G B C, numbered like pelog bem: 1=E 2=F# 3=G 5=B 6=C), the same scale
// as the game's sound effects. 32 bars = 8 gongan of 16 balungan beats (106.7 s at 72 BPM). The
// composition keeps its notes in every phase; phases change layers, density, tone and tempo, never
// key. Pass-level cycles of 3, 4 and 5 passes (gains, filters, layers resting, idiomatic balungan
// thinning) run against each other, so the combined texture repeats exactly only after 60 passes
// (about 107 minutes at 72 BPM). No random note deletion.
//
// All synth: the game calls createMusic(A, { song }) with no sample packs. The session rendered
// plain sine/triangle voices; here the same stems get a little FM for a struck-bronze shimmer
// (verified separately, .slopwave/work/gildas-last-card/integration/). 'mended' adds two layers
// derived from the balungan by the score's own rule (see v2/elaborations.json): the bonang doubled
// to sixteenths (the irama shift) and a peking playing each balungan note twice.
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  stall:  { name: 'Stall',  bpm: 72 }, // Gilda broken: balungan and gong, hesitant; the bonang mostly rests
  fair:   { name: 'Fair',   bpm: 72 }, // the fair wakes: kenong and kempul, the bonang on some passes
  mended: { name: 'Mended', bpm: 76 }, // she sees ahead: bonang in sixteenths, peking, brighter
  still:  { name: 'Still',  bpm: 58 }, // "be still": gong and a slow, soft, thinned balungan
  fool:   { name: 'Fool',   bpm: 64 }, // The Fool: warm, slow, the bonang returning gently, no drum
};

// The balungan, one gatra per bar (see .slopwave/work/gildas-last-card/plan.json).
const BALUNGAN = [
  "2 3 2 1 | 3 5 6 5 | 6 5 3 2 | 3 5 2 1", "2 3 2 1 | 5 6 1' 6 | 5 3 6 5 | 3 2 3 5",
  "2 3 2 1 | 3 5 6 5 | 1' 6 5 6 | 3 2 1 6l", "3 5 3 2 | 1 6l 5l 6l | 1 2 3 5 | 6 5 3 2",
  ". 6 . 5 | . 3 . 5 | . 6 . 1' | . 6 . 5", ". 3 . 2 | . 1 . 6l | 1 2 3 5 | 3 5 1' 6",
  "2 3 2 1 | 3 5 6 5 | 6 5 3 2 | 3 5 2 1", "2 3 2 1 | 5 6 1' 6 | 5 3 2 3 | 5 3 2 1",
].join(' | ').split(/[\s|]+/);
const TOKEN = { 1: 64, 2: 66, 3: 67, 5: 71, 6: 72, '5l': 59, '6l': 60, "1'": 76 }; // MIDI
export const SCALE_PCS = [4, 6, 7, 11, 0];

// The game-only elaborations, by the score's rule (rests hold the previous balungan note).
// [start beat, beats, MIDI, level]
export function elaborations() {
  const sounding = []; let last = TOKEN[BALUNGAN[127]];
  for (const t of BALUNGAN) { if (t !== '.') last = TOKEN[t]; sounding.push(last); }
  const up = (m, octaves, top) => { m += 12 * octaves; while (m > top) m -= 12; return m; };
  const wrap = t => +(((t % 128) + 128) % 128).toFixed(4);
  const bonang16 = [], peking = [];
  for (let p = 0; p < 64; p++) {
    const x = up(sounding[2 * p], 1, 84), y = up(sounding[2 * p + 1], 1, 84), t = 2 * p + 1;
    for (let k = 0; k < 8; k++) bonang16.push([wrap(t - 1.75 + 0.25 * k), 0.22, k % 2 ? y : x, k % 2 ? 0.15 : 0.13]);
  }
  for (let i = 0; i < 128; i++) {
    const n = up(sounding[i], 2, 91);
    peking.push([wrap(i - 0.5), 0.45, n, 0.1], [i, 0.45, n, 0.12]);
  }
  const byStart = (a, b) => a[0] - b[0];
  return { bonang16: bonang16.sort(byStart), peking: peking.sort(byStart) };
}

// Per-bar masks over several passes: '<...>' with one entry per cycle (bar).
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const perBar = passes => '<' + passes.flat().join(' ') + '>';
// Beat masks per bar over several passes: 'm' mlaku (all four), 'n' nibani (beats 2 and 4, the
// weighted ones), 'h' a hitch (the third beat missing, a stuck gear), 'g' only the seleh (beat 4).
const BEATS = { m: '1 1 1 1', n: '0 1 0 1', h: '1 1 0 1', g: '0 0 0 1' };
const beatMask = passes => '<' + passes.map(p => p.split('').map(c => `[${BEATS[c]}]`).join(' ')).join(' ') + '>';
// One letter per bar (32 per pass). The B section's first gongan (bars 17-20) is nibani already.
const STALL_BAL = [                                                        // 4 passes
  'mmhmnnnmmmhmnnnmmmmmmmmmmmhmnnnm',
  'nnnmnnnmmmhmnnnmmmmmnnhmnnnmnnnm',
  'mmhmmmmmnnhmnnnmmmmmmmhmmmhmmmmm',
  'nnhmnnnmmmmmmmhmmmmmnnnmnnhmnnnm',
];
const STILL_BAL = ['ngnnngnnngnnngnnngnnngnnngnnngnn']; // the final reading: thinned to its bones

export function createSoundtrack(S) {
  const [colo, balungan, bonang, kendhang] = createParts(S);
  const cache = new Map();
  const midi = v => (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note));
  // Gong ageng (E2) versus kenong (gatra end, beat 4) and kempul (beat 2) in the colotomic stem.
  const pos = h => { const b = h.whole.begin; return b.sub(b.floor()).valueOf(); };
  const gong = colo.filterValues(v => midi(v) === 40);
  const kenong = colo.filterHaps(h => midi(h.value) !== 40 && pos(h) === 0.75);
  const kempul = colo.filterHaps(h => pos(h) === 0.25);
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;

  const phrase = events => {
    const T = 100000, bars = Array.from({ length: 32 }, () => []);
    for (const [at, len, pitch, level] of events) {
      const bar = Math.floor(at / 4), start = Math.round((at - bar * 4) * T);
      const dur = Math.round(len * T), w = Math.min(dur, 4 * T - start);
      bars[bar].push(S.timecat(...[[start, S.silence],
        [w, S.note(pitch).gain(level).legato(dur / w)],
        [4 * T - start - w, S.silence]].filter(([l]) => l > 0)));
    }
    return S.cat(...bars.map(b => (b.length ? S.stack(...b) : S.silence)));
  };
  const E = elaborations();
  const bonang16 = phrase(E.bonang16), peking = phrase(E.peking);

  // Struck bronze: an instant attack, a bright FM partial that dies away fast, a long ring.
  const bronze = (p, { fm, fmh, fmdecay, decay, sustain = 0.05, release, lpf }) =>
    p.s('sine').fm(fm).fmh(fmh).fmdecay(fmdecay).fmsustain(0.05)
      .attack(0.002).decay(decay).sustain(sustain).release(release).lpf(lpf);
  const gongV = (f = 1, rel = 3.4) => bronze(gong, { fm: 0.9, fmh: 1.41, fmdecay: 1.2, decay: 2.4, sustain: 0.22, release: rel, lpf: 650 * f })
    .room(0.35);                                                                            // inharmonic shimmer
  const kenongV = (f = 1) => bronze(kenong, { fm: 0.7, fmh: 2, fmdecay: 0.5, decay: 1.6, sustain: 0.12, release: 2.2, lpf: cyc([900, 820, 980], f) }) // 3
    .pan(0.42).room(0.3);
  const kempulV = (f = 1) => bronze(kempul, { fm: 0.6, fmh: 1.41, fmdecay: 0.7, decay: 1.6, sustain: 0.1, release: 2, lpf: 800 * f })
    .pan(0.58).room(0.3);
  const saron = (f = 1, rel = 0.45) => bronze(balungan, { fm: 1.1, fmh: 3, fmdecay: 0.18, decay: 0.8, release: rel, lpf: cyc([1500, 1380, 1620, 1450, 1560], f) }) // 5
    .pan(0.46).room(0.25).mul(S.gain(cyc([1, 0.93, 0.97, 0.9, 0.96])));                     // 5
  const bonangV = (p, f = 1) => bronze(p, { fm: 0.8, fmh: 2, fmdecay: 0.12, decay: 0.5, release: 0.4, lpf: cyc([2200, 1950, 2350, 2050], f) }) // 4
    .pan(0.62).room(0.3).mul(S.gain(cyc([1, 0.88, 0.95])));                                  // 3
  const pekingV = (f = 1) => bronze(peking, { fm: 0.35, fmh: 2, fmdecay: 0.08, decay: 0.35, release: 0.3, lpf: 2600 * f })
    .pan(0.36).room(0.35).mul(S.gain(cyc([1, 0.85, 0.92, 0.8, 0.9])));                       // 5
  const drum = (g = 1) => kendhang.lpf(400).mul(S.gain(cyc([1, 0.8, 0, 0.9, 0.7], g)));        // 5 (rests a pass)

  // Layer gain trims, measured on the music bus (integration/phase-check.mjs).
  const G = { gong: 1, ken: 1.4, kem: 1.2, sar: 1, bon: 1.5, bon16: 0.9, pek: 1, drum: 2, phase: { stall: 1.15, fair: 0.9, mended: 0.92, still: 1.6, fool: 0.92 } };

  const build = key => {
    let layers;
    if (key === 'stall') {
      // Gilda broken: the balungan alone over the gong, thinned and hitching now and then; the
      // bonang wakes only for the last gongan of one pass in four.
      layers = [
        gongV(0.95).mul(S.gain(G.gong)),
        saron(0.92).mask(beatMask(STALL_BAL)).mul(S.gain(G.sar * 1.05)),
        bonangV(bonang, 0.9).mask(perBar([span(0, [[1, 32]]), span(0, [[1, 32]]), span(1, [[29, 32]]), span(0, [[1, 32]])]))
          .mul(S.gain(G.bon * 0.8)),
      ];
    } else if (key === 'fair') {
      // The fair wakes: kenong and kempul, the bonang on some passes, the kendhang very soft.
      layers = [
        gongV().mul(S.gain(G.gong)),
        kenongV().mul(S.gain(G.ken)),
        kempulV().mul(S.gain(cyc([1, 0.85, 0.95, 0.8], G.kem))),                           // 4
        saron().mul(S.gain(G.sar)),
        bonangV(bonang).mask(perBar([span(1, [[9, 32]]), span(1, [[25, 32]]), ALL])).mul(S.gain(G.bon)), // 3
        drum(0.8).mul(S.gain(G.drum)),
      ];
    } else if (key === 'mended') {
      // She sees further: the irama shift (bonang in sixteenths), a peking above, brighter.
      layers = [
        gongV(1.1).mul(S.gain(G.gong)),
        kenongV(1.1).mul(S.gain(G.ken)),
        kempulV(1.1).mul(S.gain(G.kem)),
        saron(1.12).mul(S.gain(G.sar)),
        bonangV(bonang16, 1.1).mask(perBar([ALL, span(0, [[17, 20]]), ALL])).mul(S.gain(G.bon16)),   // 3
        bonangV(bonang, 1.05).mask(perBar([span(0, [[1, 32]]), span(1, [[17, 20]]), span(0, [[1, 32]])])).mul(S.gain(G.bon)), // fills bars 17-20 when the sixteenths rest
        pekingV(1.05).mask(perBar([ALL, span(0, [[1, 8]]), ALL, span(0, [[17, 24]])])).mul(S.gain(G.pek)), // 4
        drum().mul(S.gain(G.drum)),
      ];
    } else if (key === 'still') {
      // "Name your card, and be still": the gong and the balungan's bones, slow, ringing long.
      layers = [
        gongV(0.85, 4.5).mul(S.gain(G.gong)),
        saron(0.8, 1.6).mask(beatMask(STILL_BAL)).room(0.45).mul(S.gain(G.sar * 0.9)),
      ];
    } else {
      // The Fool: warm and slow, everything ringing a little longer, the bonang back gently, no drum.
      layers = [
        gongV(0.9, 4).mul(S.gain(G.gong)),
        kenongV(0.9).mul(S.gain(G.ken)),
        kempulV(0.9).mul(S.gain(G.kem)),
        saron(0.85, 0.9).room(0.4).mul(S.gain(G.sar)),
        bonangV(bonang, 0.8).release(0.7).room(0.4).mask(perBar([span(1, [[9, 32]]), ALL, span(0, [[17, 24]])])) // 3
          .mul(S.gain(G.bon * 0.85)),
      ];
    }
    return layers.map(l => l.mul(S.gain(G.phase[key])));
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'stall';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'stall');
  return soundtrack;
}
