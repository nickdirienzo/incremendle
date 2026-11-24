// Phase arrangements of the Moon-in-a-Box Lullaby (slopwave r-efb6d07b5a9a), a 3/4 music-box lullaby in F major
// pentatonic (F G A C D), the same notes as the game's sound effects (scale('major pentatonic', 77)). The 48-bar form
// (A | A' | B, the higher strain | A'', the sleepy echo | C, the box winding down | A3) keeps its notes in every phase;
// phases add layers and change tempo and tone, never key.
// Pass-level cycles of 3, 4, 5 and 7 passes (melody rests, the celesta's entries, filter brightness, the pad's swell)
// run against each other, so a phase's texture repeats exactly only after 420 passes (about 14 hours).
//
// Sampled voices: gm_music_box for the melody, gm_orchestral_harp for the oom-pah-pah (the session's triangle kept
// underneath, softly), the session's sine bass, gm_celesta for a counter-line (box2+), gm_pad_warm for held chords
// (box3, end). The game calls createMusic(A, { soundfonts: true, song }). This module never starts playback or
// changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  box1: { name: 'Box One: the Classic', bpm: 72 },          // music box, harp, soft bass; the melody rests some passes
  box2: { name: 'Box Two: But Wait, There\'s More!', bpm: 76 }, // + the celesta counter-line, a crowd on the roof
  box3: { name: 'Box Three: Call Now!', bpm: 80 },          // + a warm pad swelling under it, brighter
  end: { name: 'The crunch and the Gala results', bpm: 62 }, // slow: the melody over held pad chords, harp soft
};

const BARS = 48, BPB = 3, BEATS = BARS * BPB, CYCLES = BEATS / 4;
// Per-bar chords (v1/harmony.json).
const PROG = ['F', 'F', 'Dm7', 'Dm7', 'G7sus', 'G7sus', 'Csus2', 'Csus2',
  'F', 'F', 'Dm7', 'Dm7', 'G7sus', 'Csus2', 'F', 'F',
  'Dm7', 'Dm7', 'G7sus', 'G7sus', 'F', 'F', 'Csus2', 'Csus2',
  'F', 'Dm7', 'F', 'Dm7', 'G7sus', 'Csus2', 'F', 'F',
  'F', 'F', 'Dm7', 'Dm7', 'G7sus', 'G7sus', 'Csus2', 'Csus2',
  'F', 'F', 'Dm7', 'Dm7', 'G7sus', 'G7sus', 'Csus2', 'F'];
// Celesta: a chord tone on beat 2 and one on the "and" of 3, answering the melody's held notes.
const COUNTER = { F: ['a5', 'c6'], Dm7: ['f5', 'a5'], G7sus: ['d6', 'c6'], Csus2: ['g5', 'd6'] };
const PAD = { F: ['f3', 'a3', 'c4'], Dm7: ['d3', 'f3', 'a3', 'c4'], G7sus: ['g3', 'c4', 'd4', 'f4'], Csus2: ['c3', 'g3', 'd4'] };

export function createSoundtrack(S) {
  const { stack, cat, timecat, silence, note } = S;
  const [low, middle, high] = createParts(S);
  const cache = new Map();
  // Events [beat, beats, note, level] -> a pattern one pass long, cut at four-beat cycles (as in song.mjs).
  const phrase = events => {
    const ticks = 100000;
    const bars = Array.from({ length: CYCLES }, () => []);
    for (const [at, len, pitch, level] of events) {
      const bar = Math.floor(at / 4);
      const start = Math.round((at - bar * 4) * ticks);
      const duration = Math.round(Math.min(len, BEATS - at) * ticks);
      const span = Math.min(duration, 4 * ticks - start);
      bars[bar].push(timecat(...[[start, silence], [span, note(pitch).gain(level).legato(duration / span)],
        [4 * ticks - start - span, silence]].filter(([l]) => l > 0)));
    }
    return cat(...bars.map(e => e.length ? stack(...e) : silence));
  };
  // One value per complete 48-bar pass (36 cycles).
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${CYCLES}`;
  // Which cycles of each pass play (1) or rest (0): one list per pass, given as cycle ranges (1-based) that rest.
  const span = ranges => Array.from({ length: CYCLES }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
  const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
  const ALL = [];

  const counterEvents = PROG.flatMap((c, bar) => bar >= 32 && bar < 40 ? [] :
    [[bar * BPB + 1, 1, COUNTER[c][0], 0.22], [bar * BPB + 2.5, 0.5, COUNTER[c][1], 0.16]]);
  const padEvents = PROG.flatMap((c, bar) => PAD[c].map(p => [bar * BPB, BPB, p, 0.12]));
  const counterLine = phrase(counterEvents), padLine = phrase(padEvents);

  // Layer and phase trims, balanced on the music bus.
  const G = { box: 1.5, harp: 1.1, tri: 0.35, bass: 0.9, cel: 0.9, pad: 0.7, box1: 1, box2: 1, box3: 1, end: 1 };
  const smp = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const musicBox = (f = 1, rests = passes(ALL)) => smp(high, 'gm_music_box', 1.2)
    .lpf(cyc([5200, 4600, 5600, 4800, 5000, 4400, 5400], f)).pan(0.6).room(0.45)                         // 7
    .mask(rests).mul(S.gain(G.box));
  const harp = (f = 1) => S.stack(
    smp(middle, 'gm_orchestral_harp', 0.5).lpf(cyc([2600, 2300, 2800, 2400, 2500], f)).pan(0.4).room(0.3).mul(S.gain(G.harp)), // 5
    middle.lpf(1400 * f).mul(S.gain(G.tri)),
  );
  const bass = (f = 1) => low.lpf(500 * f).mul(S.gain(G.bass));
  const celesta = (g = 1, rests = passes(ALL)) => counterLine.s('gm_celesta').attack(0.001).decay(0.01).sustain(1).release(0.8)
    .lpf(5000).pan(0.75).room(0.5).mask(rests).mul(S.gain(cyc([1, 0.8, 0.95, 0.7], g * G.cel)));        // 4
  const pad = (g = 1) => padLine.s('gm_pad_warm').attack(0.4).decay(0.1).sustain(1).release(1.2)
    .lpf(1800).pan(0.5).room(0.4).mul(S.gain(cyc([1, 0.75, 0.9, 0.6, 0.85], g * G.pad)));                 // 5

  const build = key => {
    if (key === 'box1') {
      // One box on a dark roof: the music box, the harp, the bass; the melody rests in the middle of some passes.
      return [musicBox(0.92, passes(ALL, [[13, 24]], ALL)), harp(0.9), bass(0.9)];                       // 3
    }
    if (key === 'box2') {
      return [musicBox(1, passes(ALL, ALL, [[19, 27]])), harp(1), bass(1),                                  // 3
        celesta(1, passes(ALL, [[1, 12]], ALL, [[25, 36]], ALL, [[13, 24]], ALL))];                          // 7
    }
    if (key === 'box3') {
      return [musicBox(1.1, passes(ALL, ALL, [[25, 30]])), harp(1.08), bass(1.05),                          // 3
        celesta(1.05, passes(ALL, ALL, [[1, 12]], ALL, [[25, 36]], ALL, ALL)), pad(1)];                      // 7
    }
    // end: slow and warm, the melody every pass over the pad; the harp softer.
    return [musicBox(0.9).room(0.6), harp(0.8).mul(S.gain(0.7)), bass(0.85), pad(1.2)];
  };

  const soundtrack = phaseKey => {
    const key = phases[phaseKey] ? phaseKey : 'box1';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'box1');
  return soundtrack;
}
