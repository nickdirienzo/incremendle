// Phase arrangements of Saucer Sauce Dub (slopwave r-1bc309701441), a whole-tone dub riddim on D
// (D E F# G# A# C), the same notes as the game's sound effects (scale('whole tone', 62)). Every pitched note is in that set.
// The 48-bar form (A1 riddim | A2 + the melodica call | B dub section on A# and G# | A3 call up a whole step |
// C new roots, the call augmented and inverted | A4 outro) keeps its notes in every phase; phases change layers,
// tempo, filters and echo, never key.
// Pass-level cycles of 3, 4 and 5 passes (lead rests, echo throws, skank filter, siren runs) run against each other,
// so a phase's texture repeats exactly only after 60 passes (about two and a half hours at 76 BPM).
//
// Synth voices only (the game calls createMusic(A, { song }) with no soundfonts or packs): a sine sub under the
// session's triangle bass, triangle skank chops, the sawtooth melodica, a sine kick, white-noise rim and hats,
// a pink-noise shaker, a sine whole-tone siren run, held triangle chords in the ending. Dub echo is Strudel's delay
// on orbit 2 (delay time a dotted eighth at each phase's tempo); everything dry stays on orbit 1.
// The game uses song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  early: { name: 'Monday-Tuesday', bpm: 74 },     // sub bass, one-drop, sparse skank, no lead
  mid: { name: 'Wednesday-Thursday', bpm: 76 },   // + the melodica on some passes, echo throws on rim and skank
  late: { name: 'Friday-Saturday', bpm: 78 },     // fuller skank, + shaker, an occasional whole-tone siren run
  sunday: { name: 'Sunday: the Big One', bpm: 82 }, // busier hats and chops, the lead every pass, the siren more often
  end: { name: 'Certified', bpm: 64 },            // slow and warm: held chords, soft sub, the theme with long echoes
};

const BARS = 48;
// Per-bar roots and skank voicings (v2/harmony.json).
const PROG = 'D D D D C C E E D D D D C C E E A# A# G# G# A# A# C C D D D D C C E E D D F# F# E E C C D D D D C C E E'.split(' ');
const VOICING = { D: 'fs3,c4,e4', C: 'e3,as3,d4', E: 'gs3,d4,fs4', 'F#': 'as3,e4,gs4', 'G#': 'c4,fs4,as4', 'A#': 'd4,gs4,c5' };
const SUB = { D: 'd2', C: 'c2', E: 'e2', 'F#': 'fs2', 'G#': 'gs1', 'A#': 'as1' };
// Whole-tone siren runs (eighth-note triplet slots of the bar: 12 per bar), up or down from the root's octave.
const RUN_UP = 'd5 e5 fs5 gs5 as5 c6', RUN_DOWN = 'c6 as5 gs5 fs5 e5 d5';
const SIREN_BARS = { 8: RUN_UP, 20: RUN_DOWN, 24: RUN_UP, 32: RUN_UP, 40: RUN_DOWN, 48: RUN_UP };
// Echo throws: bars whose rim (beat 3) and last chop get a big delay send.
const THROW_BARS = [4, 8, 12, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48];

const perBar = list => '<' + list.join(' ') + '>';
const bars = f => Array.from({ length: BARS }, (_, i) => f(i + 1));
// Which bars of a pass play (1) or rest (0): one 48-bar list per pass, given as bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
const ALL = [];
const NONE = [[1, BARS]];

export function createSoundtrack(S) {
  const [low, middle, high, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 48-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Layer and phase trims, balanced on the music bus (.slopwave/work/al-dente-encounters/integration/phase-check.mjs).
  const G = { bass: 1, skank: 1, lead: 1, drums: 1, early: 1.4, mid: 1.4, late: 1.4, sunday: 1.5, end: 1.35 };

  const build = key => {
    const bpm = phases[key].bpm;
    // The echo bus: a dotted eighth at this tempo, the same on every event of orbit 2. send may be a pattern.
    const echo = (p, send, feedback = 0.45) => p.orbit(2).delay(send).delaytime(+(45 / bpm).toFixed(4)).delayfeedback(feedback);

    const bass = (f = 1) => S.stack(
      low.s('sine').lpf(220).attack(0.01).release(0.2).mul(S.gain(1.15 * G.bass)),                    // the round sub
      low.lpf(S.sine.range(520, 900).slow(16).mul(f)).mul(S.gain(0.7 * G.bass)),                          // the riff you hear
    );
    // Skank chops on 2 and 4, filter swept over 8 bars, a little echo on every chop and a big one on throw bars.
    const skank = (f = 1, send = 0.18, throwSend = 0.45, mask = passes(ALL)) =>
      echo(middle.lpf(S.sine.range(1100, 2600).slow(8).mul(f)).hpf(260).room(0.3),
        perBar(bars(b => THROW_BARS.includes(b) ? throwSend : send)))
        .mask(mask).mul(S.gain(4 * G.skank));
    // The bubble: soft extra chops on the and-of-2 and and-of-4, an octave of the shell's top two notes.
    const bubble = (g = 1, mask = passes(ALL)) => echo(S.note(perBar(PROG.map(c => {
      const v = VOICING[c].split(',').slice(1).join(',');
      return `[~ [${v}] ~ [${v}]]`;
    }))).s('triangle').attack(0.002).decay(0.1).sustain(0).release(0.08).gain(0.15 * g)
      .lpf(1800).hpf(300).pan(0.35), 0.12).mask(mask).mul(S.gain(G.skank));
    // The melodica: sparse in the score already; masks rest it on some passes.
    const lead = (f = 1, mask = passes(ALL), send = 0.3) =>
      echo(high.lpf(S.sine.range(1200, 2000).slow(12).mul(f)).room(0.35), send, 0.5)
        .mask(mask).mul(S.gain(3.8 * G.lead));
    const kicks = (g = 1) => kick.lpf(200).mul(S.gain(2 * g * G.drums));
    const rim = (g = 1, throwSend = 0) => S.stack(
      snare.hpf(1400).lpf(4800).decay(0.06).mul(S.gain(5 * g * G.drums)),
      // a tiny square click on top makes it a rim, not a snare
      snare.s('square').note('d6').attack(0.001).decay(0.018).sustain(0).lpf(3000).mul(S.gain(1.2 * g * G.drums)),
      ...(throwSend ? [echo(snare.hpf(1400).lpf(4000).decay(0.06)
        .mask(perBar(bars(b => THROW_BARS.includes(b) ? 1 : 0))), throwSend, 0.55).mul(S.gain(3.5 * g * G.drums))] : []),
    );
    const hats = (g = 1) => hat.hpf(7000).mul(S.gain(4.5 * g * G.drums));
    const ghostHats = (g = 1) => S.s('white*16').hpf(8500).decay(0.018).sustain(0)
      .gain('[0 .25 .4 .25]*4').mul(S.gain(0.15 * g * G.drums))
      .mask(perBar(bars(b => [20, 22].includes(b) ? 0 : 1)));
    const shaker = (g = 1) => S.s('pink*16').hpf(5200).lpf(11000).attack(0.004).decay(0.045).sustain(0)
      .gain('[.5 .2 .9 .25]*4').pan(0.7).mul(S.gain(0.2 * g * G.drums))
      .mask(perBar(bars(b => [20, 22].includes(b) ? 0 : 1)));
    // The siren: a whole-tone run on the last two beats of a few bars, swimming in echo.
    const siren = (g = 1, mask = passes(ALL)) => echo(S.note(perBar(bars(b => SIREN_BARS[b]
      ? `[~ ~ ~ ~ ~ ~ ${SIREN_BARS[b]}]` : '~'))).s('sine').vib(6).vibmod(0.2).attack(0.01).decay(0.12)
      .sustain(0.4).release(0.15).gain(0.2 * g).lpf(3000).pan(S.sine.range(0.25, 0.75).fast(2)), 0.55, 0.55)
      .mask(mask).mul(S.gain(G.lead));

    if (key === 'early') {
      // Monday: the riddim on its own. The skank sits back, every other pass a touch darker.
      return [
        bass(1),
        skank(1, 0.12, 0.3, passes(ALL, ALL, [[17, 24]], ALL)),                                                // 4
        kicks(0.95), rim(0.9), hats(0.8),
      ];
    }
    if (key === 'mid') {
      return [
        bass(1),
        skank(cyc([1, 0.85, 1.1, 0.95, 0.9]), 0.18, 0.5),                                                      // 5
        lead(1, passes(ALL, NONE, [[1, 24]])),                                                                 // 3
        kicks(1), rim(1, 0.4), hats(0.9),
      ];
    }
    if (key === 'late') {
      return [
        bass(1.05),
        skank(cyc([1.1, 0.95, 1.2, 1, 0.9], 1), 0.2, 0.55),                                                    // 5
        bubble(1, passes(ALL, [[1, 16]], ALL, [[33, 48]])),                                                     // 4
        lead(1.05, passes(ALL, ALL, [[25, 48]])),                                                              // 3
        siren(1, passes(ALL, [[1, 48]], [[1, 24]], ALL, [[1, 48]])),                                           // 5
        kicks(1), rim(1, 0.45), hats(1), shaker(1),
      ];
    }
    if (key === 'sunday') {
      // The Big One is out: everything in, a bit brighter and faster, hats doubled, chops bubbling.
      return [
        bass(1.1),
        skank(cyc([1.2, 1.05, 1.3, 1.1, 1], 1), 0.22, 0.6),                                                   // 5
        bubble(1.2, passes(ALL, ALL, ALL, [[17, 24]])),                                                         // 4
        lead(1.1, passes(ALL, ALL, [[17, 24]]), 0.35),                                                         // 3
        siren(1.1, passes(ALL, [[25, 48]], ALL, [[1, 24]], ALL)),                                              // 5
        kicks(1.05), rim(1.05, 0.5), hats(1.05), ghostHats(1), shaker(1.1),
      ];
    }
    // end: certified. Held whole-tone chords, a soft sub on each bar's root, the melodica every pass in long echoes,
    // the rim alone on beat 3.
    return [
      S.note(perBar(PROG.map(c => SUB[c]))).s('sine').attack(0.05).decay(0.6).sustain(0.6).release(0.8)
        .gain(0.3).lpf(240).mul(S.gain(G.bass)),
      S.note(perBar(PROG.map(c => SUB[c]))).s('triangle').attack(0.05).decay(0.8).sustain(0.3).release(0.8)
        .gain(0.12).lpf(500).mul(S.gain(G.bass)),
      echo(S.note(perBar(PROG.map(c => `[${VOICING[c]}]`))).s('triangle').attack(0.5).decay(1).sustain(0.6)
        .release(1.6).gain(0.12).lpf(S.sine.range(700, 1400).slow(16)).room(0.6).pan(0.42), 0.2, 0.5)
        .mul(S.gain(G.skank)),
      lead(0.9, passes(ALL), 0.45).room(0.6),
      rim(0.55),
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
