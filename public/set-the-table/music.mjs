// Phase arrangements of Palm Grove Bossa (slopwave r-348fba4ecce4), a vaporwave-lounge bossa nova in C minor.
// The lead is strictly in C blues (C Eb F F# G Bb), the same notes as the game's sound effects (scale('blues', 60));
// the comping, pads and bass use bossa extended chords (Cm9 Fm9 Dm7b5 G7alt Abmaj7 Ebmaj7 Bb13), whose other tones
// (D, Ab, B) never reach the lead.
// The 48-bar form (A1 statement | A2 call extended, hangs on F | B bridge, long high tones | A3 call augmented,
// chromatic descent | C 8-bar minor blues with an AAB blue-note riff | A4 statement, new cadence) keeps its notes
// in every phase; phases change layers, tempo and filters, never key. One pass is 90 s at 128 BPM.
// Pass-level cycles of 3, 4 and 5 passes (lead rests, pads, comping filter, ghost rims, the low lead double) run
// against each other, so a phase's texture repeats exactly only after 60 passes (about an hour and a half).
//
// Synth voices only (the game calls createMusic(A, { song }) with no soundfonts or packs): the session's triangle
// bass, short triangle plucks for nylon-guitar comping in the bossa cell, a soft triangle lead with slight vibrato,
// a soft sine kick, a white-noise rim on the 3-2 bossa clave with a tiny square click, a noise shaker on the eighths
// (pink 16ths in the gale), sine electric-piano chords in beach and end. The lead's echo is Strudel's delay on
// orbit 2 (a dotted eighth at each phase's tempo); everything dry stays on orbit 1.
// The game uses song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  table: { name: 'The Table', bpm: 128 },    // intimate: comping, bass, rim and shaker, the lead on some passes only
  beach: { name: 'The Beach', bpm: 132 },    // the full groove: + soft kick, the lead more often, electric-piano chords
  gale: { name: 'The Gale', bpm: 138 },      // a touch of urgency: 16th shaker, ghost rims, brighter comping, lead doubled
  end: { name: 'Sundown', bpm: 116 },        // slower and warm: long chords, the whole theme every pass with long tails
};

const BARS = 48;
// Per-bar chords and voicings (.slopwave/work/set-the-table/v2/harmony.json).
const PROG = ('Cm9 Fm9 Dm7b5 G7alt Cm9 Fm9 Abmaj7 G7alt Cm9 Fm9 Dm7b5 G7alt Cm9 Fm9 Abmaj7 G7alt ' +
  'Fm9 Bb13 Ebmaj7 Abmaj7 Dm7b5 G7alt Cm9 G7alt Cm9 Fm9 Dm7b5 G7alt Cm9 Fm9 Abmaj7 G7alt ' +
  'Fm9 Fm9 Cm9 Cm9 Abmaj7 G7alt Cm9 G7alt Cm9 Fm9 Dm7b5 G7alt Cm9 Fm9 Abmaj7 G7alt').split(' ');
const VOICING = {
  Cm9: 'ds3,g3,as3,d4', Fm9: 'gs3,c4,ds4,g4', Dm7b5: 'd3,gs3,c4,f4', G7alt: 'f3,b3,ds4,gs4',
  Abmaj7: 'gs3,c4,ds4,g4', Ebmaj7: 'ds3,g3,as3,d4', Bb13: 'gs3,d4,g4',
};
const ROOT = { Cm9: 'c2', Fm9: 'f2', Dm7b5: 'd2', G7alt: 'g2', Abmaj7: 'gs1', Ebmaj7: 'ds2', Bb13: 'as1' };

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 48-bar list per pass, given as bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
const ALL = [];
const NONE = [[1, BARS]];

export function createSoundtrack(S) {
  const [low, middle, high, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 48-bar pass.
  const cyc = values => `<${values.join(' ')}>/${BARS}`;
  const octave = (p, semitones) => p.fmap(v => ({
    ...v, note: (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note)) + semitones,
  }));

  // Layer and phase trims, balanced on the music bus (.slopwave/work/set-the-table/integration/phase-check.mjs).
  const G = { table: 2.7, beach: 2.5, gale: 2.35, end: 2.1 };

  const build = key => {
    const bpm = phases[key].bpm;
    const echo = (p, send, feedback = 0.35) =>
      p.orbit(2).delay(send).delaytime(+(45 / bpm).toFixed(4)).delayfeedback(feedback);

    const bass = (g = 1) => low.mul(S.gain(1.1 * g));
    // Plucked comping, its filter breathing over 16 bars; f scales the filter (per pass when given a cycle).
    const comp = (f = 1, g = 1, mask = passes(ALL)) =>
      middle.lpf(S.sine.range(1000, 1700).slow(16).mul(f)).hpf(170).mask(mask).mul(S.gain(1.6 * g));
    // The lead, sparse in the score already; masks rest it on some passes. Tagged for the phase check.
    const lead = (f = 1, g = 1, mask = passes(ALL), send = 0.18) =>
      echo(high.lpf(S.sine.range(1500, 2100).slow(12).mul(f)), send).mask(mask).mul(S.gain(1.7 * g)).color('lead');
    // The same line an octave lower, softer and darker: the gale's insistence without crowding the effects.
    const leadLow = (g = 1, mask = passes(ALL)) =>
      octave(high, -12).s('triangle').lpf(900).attack(0.02).decay(0.3).sustain(0.5).release(0.2).pan(0.4)
        .mask(mask).mul(S.gain(0.75 * g)).color('lead');
    const kicks = (g = 1) => kick.lpf(180).mul(S.gain(1.6 * g));
    const rim = (g = 1) => S.stack(
      snare.hpf(1500).lpf(4800).decay(0.05).mul(S.gain(2.2 * g)),
      // a tiny square click on top makes it a rim click, not a snare
      snare.s('square').note('c6').attack(0.001).decay(0.015).sustain(0).lpf(2600).mul(S.gain(0.5 * g)),
    );
    // Ghost rims answering the clave (the gale's extra percussion).
    const ghosts = (g = 1, mask = passes(ALL)) =>
      S.s('<[~ ~ ~ white ~ ~ ~ white] [~ white ~ ~ ~ ~ white ~]>').hpf(1800).lpf(4500).decay(0.035).sustain(0)
        .gain(0.12 * g).pan(0.65).mask(mask);
    const shaker = (g = 1) => hat.hpf(7000).mul(S.gain(2 * g));
    const shaker16 = (g = 1) => S.s('pink*16').hpf(6000).lpf(11000).attack(0.004).decay(0.04).sustain(0)
      .gain('[.5 .2 .85 .25]*4').pan(0.7).mul(S.gain(0.14 * g));
    // Electric-piano chords: a soft sine bell on each bar's downbeat, voiced like the comping.
    const pads = (g = 1, mask = passes(ALL), lpf = 1300, release = 0.9) =>
      S.note(perBar(PROG.map(c => `[${VOICING[c]}]`))).s('sine').attack(0.012).decay(1.1).sustain(0.25)
        .release(release).gain(0.075 * g).lpf(lpf).pan(0.45).room(0.4).mask(mask);

    if (key === 'table') {
      // Intimate: the guitar and bass, the clave and shaker. The lead turns up on some passes only.
      return [
        bass(0.95),
        comp(cyc([0.9, 0.82, 0.95, 0.86]), 1),                                                       // 4
        lead(0.9, 0.9, passes([[9, 40]], NONE, [[1, 16], [41, 48]])),                                   // 3
        rim(0.85), shaker(0.85),
        kicks(0.5).mask(passes(NONE, NONE, ALL, NONE, [[1, 24]])),                                     // 5
      ];
    }
    if (key === 'beach') {
      return [
        bass(1),
        comp(cyc([1, 0.92, 1.08, 0.96, 0.9]), 1),                                                    // 5
        lead(1, 1, passes(ALL, [[17, 24]], ALL, [[1, 16]])),                                           // 4
        pads(1, passes([[1, 16], [41, 48]], ALL, [[25, 48]])),                                        // 3
        kicks(0.85), rim(1), shaker(1),
      ];
    }
    if (key === 'gale') {
      // Wilhelmina's gale: faster, brighter, busier percussion, the lead every pass and doubled below on some.
      return [
        bass(1.05),
        comp(cyc([1.3, 1.2, 1.4, 1.25, 1.15]), 1.05),                                                // 5
        lead(1.15, 1.1, passes(ALL), 0.22),
        leadLow(1, passes(ALL, [[1, 16]], [[25, 48]])),                                               // 3
        kicks(1), rim(1.1), shaker(0.9), shaker16(1),
        ghosts(1, passes(ALL, [[33, 48]], ALL, [[1, 16]])),                                           // 4
      ];
    }
    // end: sundown. Long chords with long tails, a held root per bar, the whole theme every pass in echo,
    // the comping and shaker on some passes, the rim softly on the clave.
    return [
      S.note(perBar(PROG.map(c => ROOT[c]))).s('triangle').attack(0.03).decay(1.2).sustain(0.4).release(1)
        .gain(0.32).lpf(500),
      pads(1.5, passes(ALL), cyc([1300, 1150, 1450, 1250, 1100]), 2.2),                               // 5
      lead(0.95, 1.05, passes(ALL), 0.32).room(0.5),
      comp(0.8, 0.7, passes(ALL, [[1, 24]], [[25, 48]])),                                             // 3
      rim(0.5),
      shaker(0.5).mask(passes(NONE, ALL, NONE, [[1, 24]])),                                           // 4
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'table';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'table');
  return soundtrack;
}
