// Phase arrangements of Tumble Hill Air (slopwave r-00ef7345a5ea), ambient pads in F lydian
// (F G A B C D E), the same scale as the game's sound effects (scale('lydian', 65)). The 32-bar
// composition (107 s at 72 BPM; A1 A2 B A3, home vamp Fmaj7 - G/F, bar 32's G/F resolves to bar 1's
// Fmaj7) keeps its notes in every phase; phases add layers as the stalk grows and change tempo and
// tone, never key. Pass-level cycles of 3, 4 and 5 passes (filters, gains, the melody resting in some
// passes, bell masks) run against each other, so the combined texture takes 60 passes to repeat exactly.
//
// Synth voices only (sawtooth/triangle/sine): no samples or soundfonts. The game calls
//   createMusic(A, { song })
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  hill0: { name: 'Tumble Hill', bpm: 72 },     // stalk tier 0: pads and the sparse motif
  hill1: { name: 'A Little Taller', bpm: 72 }, // + the soft bass
  hill2: { name: 'Taller Still', bpm: 73 },    // + the high bell figure
  hill3: { name: 'Head in the Sky', bpm: 74 }, // fullest: octave shimmer, brighter, a gentle pulse
  gale: { name: 'The Tramontane', bpm: 86 },   // the showdown: pulsing pad, low swell, melody throughout
  ending: { name: 'Clear Sky', bpm: 62 },      // the finale: held chords, the motif, bright and open
};

// The score's chord per bar (see .slopwave/work/wilt-your-way-to-wealth/plan.json).
const PROG = [
  'F', 'F', 'G/F', 'G/F', 'Am7', 'Am7', 'Dm9', 'G6',         // A1
  'F', 'F', 'G/F', 'G/F', 'Em7', 'Em7', 'Cmaj7', 'Cmaj7',    // A2
  'Dm9', 'Dm9', 'Em7', 'Em7', 'F#11', 'F#11', 'Am7', 'G6',   // B
  'F', 'F', 'G/F', 'G/F', 'Am7', 'Dm9', 'G/F', 'G/F',        // A3
];
// The score's pad voicings, for the pulse layers.
const PAD = {
  F: '[f3,a3,c4,e4]', 'G/F': '[f3,g3,b3,d4]', Am7: '[e3,g3,a3,c4]', Dm9: '[d3,a3,c4,e4]',
  G6: '[d3,g3,b3,e4]', Em7: '[e3,g3,b3,d4]', Cmaj7: '[c3,g3,b3,e4]', 'F#11': '[f3,a3,b3,e4]',
};
// The bell: two chord tones (or the B) per bar, G5-D6, on the 2-and and the 4.
const BELL_NOTES = {
  F: ['c6', 'a5'], 'G/F': ['b5', 'd6'], Am7: ['a5', 'c6'], Dm9: ['d6', 'a5'],
  G6: ['b5', 'g5'], Em7: ['g5', 'b5'], Cmaj7: ['c6', 'g5'], 'F#11': ['b5', 'a5'],
};
const BELL = PROG.map((c, i) => {
  const [a, b] = BELL_NOTES[c];
  const second = i % 2 === 1 && PROG[i - 1] === c;  // second bar of a held chord: one note, later
  return second ? `[~ ~ ~ ~ ~ ${b} ~ ~]` : `[~ ~ ~ ${a} ~ ~ ${b} ~]`;
});

// Which bars of a pass a layer plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const MELODY = {
  hill0: [ALL, span(0, [[9, 16], [21, 24]]), span(0, [[1, 8]]), span(0, [[17, 24]])],          // 4
  hill: [ALL, ALL, span(0, [[17, 24]]), ALL, span(0, [[9, 16]])],                               // 5
  ending: [ALL, ALL, span(0, [[9, 16]])],                                                       // 3
};
const BELLS = {
  hill: [span(1, [[5, 8], [17, 24], [29, 32]]), span(1, [[13, 20]]), span(1, [[1, 4], [21, 28]])], // 3
  gale: [span(1, [[17, 24]]), span(1, [[29, 32]]), span(1, [[5, 8], [21, 24]]), span(0, [[1, 32]])], // 4
  ending: [span(1, [[1, 8], [17, 24]]), span(1, [[9, 16], [25, 32]]), span(1, [[17, 32]]),
           span(1, [[1, 4], [13, 20]]), ALL],                                                   // 5
};
const perBar = passes => '<' + passes.flat().join(' ') + '>';

export function createSoundtrack(S) {
  const [bass, pad, melody] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;
  // Eighth-note masks that change once per pass.
  const eighths = masks => '<' + masks.map(m => `[${m}]!32`).join(' ') + '>';
  const chords = () => S.note('<' + PROG.map(c => PAD[c]).join(' ') + '>');

  // Layer and phase gain trims, measured on the music bus
  // (.slopwave/work/wilt-your-way-to-wealth/integration/phase-check.mjs).
  const G = { pad: 1, mel: 1, bass: 0.45, bell: 1, hill0: 1, hill1: 1, hill2: 1, hill3: 1, gale: 0.8, ending: 1 };

  const padVoice = (f = 1) => pad.lpf(cyc([760, 700, 820, 680, 740], f))                      // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.9], G.pad)));                                          // 4
  // An octave above the pad on a softer triangle with an even slower attack: the warm shimmer.
  const shimmer = (f = 1) => pad.transpose(12).s('triangle').attack(2.2).release(3)
    .lpf(cyc([1500, 1700, 1400], f)).pan(0.42).room(0.6).mul(S.gain(cyc([0.4, 0.32, 0.36, 0.3], G.pad)));  // 3, 4
  const melVoice = (f = 1, release = 0.9) => melody.lpf(cyc([2200, 2000, 2300, 2100], f)).release(release) // 4
    .mul(S.gain(cyc([1, 0.94, 0.98], G.mel)));                                               // 3
  const bassVoice = (f = 1) => bass.lpf(cyc([380, 340, 420], f)).mul(S.gain(G.bass));          // 3
  const bellVoice = (mask, g = 1) => S.note('<' + BELL.join(' ') + '>').s('sine')
    .attack(0.004).decay(1.4).sustain(0).release(1.2).lpf(2800).pan(0.36).room(0.6)
    .mask(perBar(mask)).gain(0.09).mul(S.gain(cyc([1, 0.85, 0.95, 0.8, 0.9], g * G.bell)));   // 5
  // A gentle offbeat chord pulse an octave up, masked per pass.
  const pulse = (f = 1) => chords().transpose(12).s('triangle').struct('[~ x ~ x ~ x ~ x]')
    .attack(0.01).decay(0.25).sustain(0).release(0.2).lpf(1200 * f).pan(0.6).room(0.4)
    .gain(0.06).mask(eighths(['0 1 0 1 0 1 0 1', '0 1 0 0 0 1 0 0', '0 1 0 1 0 0 0 1', '0 0 0 1 0 1 0 0'])); // 4

  const build = key => {
    if (key === 'gale') {
      // The Tramontane: the same chords re-struck as a restless eighth-note pulse, a slow low swell on
      // the bass roots, the melody throughout, the pad held quietly underneath.
      const flutter = chords().s('sawtooth').struct('x*8')
        .attack(0.02).decay(0.18).sustain(0.25).release(0.15).lpf(cyc([950, 1050, 900], 1)).pan(0.45).room(0.35)
        .gain('[.11 .066 .088 .066 .105 .066 .088 .07]');
      const swell = bass.s('sawtooth').attack(1.6).decay(1).sustain(0.8).release(1.6)
        .lpf(cyc([240, 280, 260, 300], 1)).mul(S.gain(1.1 * G.bass));                          // 4
      return [
        padVoice(1.1).mul(S.gain(0.7)),
        flutter,
        swell,
        bassVoice(1.1).mul(S.gain(0.8)),
        melVoice(1.05).mul(S.gain(1.25)),
        bellVoice(BELLS.gale, 0.8),
      ];
    }
    if (key === 'ending') {
      // Clear sky: slower, the chords held and opened up, the motif ringing longer, bells now and then.
      return [
        padVoice(1.35),
        shimmer(1.15),
        bassVoice(0.9).mul(S.gain(0.8)),
        melVoice(1, 1.6).room(0.6).mask(perBar(MELODY.ending)),
        bellVoice(BELLS.ending, 0.9),
      ];
    }
    const tier = { hill0: 0, hill1: 1, hill2: 2, hill3: 3 }[key];
    const bright = [1, 1.03, 1.06, 1.15][tier];
    const layers = [
      padVoice(bright),
      melVoice(bright).mask(perBar(tier === 0 ? MELODY.hill0 : MELODY.hill)),
    ];
    if (tier >= 1) layers.push(bassVoice(bright));
    if (tier >= 2) layers.push(bellVoice(BELLS.hill));
    if (tier >= 3) layers.push(shimmer(bright), pulse(bright));
    return layers;
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'hill0';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'hill0');
  return soundtrack;
}
