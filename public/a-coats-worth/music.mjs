// Phase arrangements of Postage Due Dub (slopwave r-dbc7c90feef2), a roots-reggae one-drop under dub
// production in G major (G A B C D E F#), the same scale as the game's sound effects (scale('major', 67)).
// The 32-bar composition (104 s at 74 BPM; A1 A2 B A3, two-bar chords G C Em D Am, bar 32's D resolves to
// bar 1's G) keeps its notes in every phase; phases change layers, tempo, echo and tone, never key.
// The bassline is the hook; skank on 2 and 4; kick and rim together on 3. Dub craft lives here: echo
// throws on the last skank of each 8-bar section and on every fourth rim, spring-ish room on the rim,
// low-pass sweeps on the skank, and drop-outs where whole layers rest for 2-4 bars on some passes.
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, echo sends, drop-out masks, melodica rests) run
// against each other, so the combined texture takes 420 passes (about 12 hours) to repeat exactly.
//
// Sampled voices: gm_accordion (the melodica stand-in, low-passed), gm_electric_guitar_muted (skank),
// gm_electric_bass_finger (doubled by a soft session sine sub), gm_drawbar_organ (the bubble in peaks, held
// chords in the ending); VCSL bassdrum1 (one-drop kick), snare_rim (sidestick rim) and hihat (closed hats).
// Echo: the main echo on Strudel orbit 1 and the throws on orbit 2, each with one delay time and feedback
// per phase (superdough keeps one delay line per orbit).
// The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and @strudel/soundfonts in
// the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  hamlet: { name: 'Little Hobbling', bpm: 74 }, // the inn: sparse and cosy, the melodica resting some passes
  fen: { name: 'Murkmere', bpm: 70 },           // the witches' stills: the dubbiest, echoes and drop-outs
  peaks: { name: 'Mount Smoulder', bpm: 78 },   // the dragon's hoard: fullest, organ bubble, melodica every pass
  ending: { name: 'Ending', bpm: 64 },          // the crunch and Nettle's letter: no drums, held organ, long echoes
};

// The score's chord per bar (see .slopwave/work/a-coats-worth/plan.json).
const PROG = [
  'G', 'G', 'C', 'C', 'Em', 'Em', 'D', 'D',   // A1
  'G', 'G', 'C', 'C', 'Em', 'C', 'D', 'D',    // A2
  'Am', 'Am', 'Em', 'Em', 'C', 'C', 'D', 'D', // B
  'G', 'G', 'C', 'C', 'Em', 'Em', 'D', 'D',   // A3
];
const ORGAN = { G: '[g3,b3,d4]', C: '[g3,c4,e4]', Em: '[g3,b3,e4]', D: '[fs3,a3,d4]', Am: '[a3,c4,e4]' };
const HELD = { G: '[d3,g3,b3]', C: '[e3,g3,c4]', Em: '[e3,g3,b3]', D: '[d3,fs3,a3]', Am: '[e3,a3,c4]' };

// Which bars of a pass play (1) or rest (0): one 32-bar list per pass, given as the bar ranges that rest.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const perBar = passes => '<' + passes.flat().join(' ') + '>';
const rests = (...passes) => perBar(passes.map(r => span(0, r)));
const ALL = [];
const EVERY = [[1, 32]];
// The last skank of each 8-bar section (beat 4 of bars 8, 16, 24, 32) goes to the throw; every fourth rim too.
const THROW_SKANK = '<1 1 1 1 1 1 1 [1 1 1 0]>';
const ONLY_SKANK = '<0 0 0 0 0 0 0 [0 0 0 1]>';
const THROW_RIM = '<1 1 1 0>';
const ONLY_RIM = '<0 0 0 1>';

export function createSoundtrack(S) {
  const [bass, skank, mel, kick, rim, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/32`;
  // Echo on an orbit, timed in beats at the phase tempo.
  const echo = (p, bpm, send, beats, feedback, orbit) =>
    p.orbit(orbit).delay(send).delaytime(+(60 / bpm * beats).toFixed(4)).delayfeedback(feedback);

  // Gain trims, measured on the music bus (.slopwave/work/a-coats-worth/integration/phase-check.mjs).
  const G = { mel: 1.5, bass: 0.7, skank: 3.6, organ: 1, perc: 1, hamlet: 1, fen: 1, peaks: 1, ending: 1 };

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.001) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const melodica = (f = 1, release = 0.25) => sf(mel, 'gm_accordion', release, 0.04)
    .lpf(cyc([1700, 1550, 1850, 1600, 1450], f)).pan(0.6).room(0.25)                    // 5
    .mul(S.gain(cyc([1, 0.93, 0.97, 0.9], G.mel)));                                     // 4
  const bassVoice = (f = 1) => S.stack(
    sf(bass, 'gm_electric_bass_finger', 0.15).lpf(cyc([900, 800, 1000], f)).mul(S.gain(1.4 * G.bass)), // 3
    bass.s('sine').lpf(260).mul(S.gain(cyc([0.55, 0.5, 0.6, 0.5], G.bass))),           // 4: the sub
  );
  const skankVoice = (lpf, g = 1) => sf(skank, 'gm_electric_guitar_muted', 0.09)
    .lpf(lpf).hpf(220).pan(0.36).room(0.2).mul(S.gain(g * G.skank));
  // The session's kick / noise rim / noise hat onsets on VCSL samples, keeping the score's accents.
  const kickVoice = (g = 1) => kick.fmap(({ gain }) => ({ s: 'bassdrum1', n: 2, gain: gain * 5.5 }))
    .lpf(900).mul(S.gain(g * G.perc));
  const rimVoice = (g = 1, room = 0.3) => rim.fmap(({ gain }) => ({ s: 'snare_rim', n: 0, gain: gain * 22 }))
    .lpf(3200).pan(0.42).room(room).mul(S.gain(g * G.perc));
  const hatVoice = (g = 1) => hat.fmap(({ gain }) => ({ s: 'hihat', n: gain > 0.0025 ? 0 : 1, gain: gain * 160 }))
    .hpf(2500).lpf(7000).pan(0.66)
    .mul(S.gain(cyc([1, 0.85, 0.95, 0.8, 0.9, 0.75, 0.88], g * G.perc)));             // 7
  // Organ: the bubble (offbeat eighths) and held whole-bar chords.
  const bubble = (f = 1) => S.note(perBar([PROG.map(c => `[~ ${ORGAN[c]}]*4`)])).s('gm_drawbar_organ')
    .attack(0.003).decay(0.01).sustain(1).release(0.06).lpf(cyc([1300, 1150, 1450, 1200], f)).pan(0.3) // 4
    .mul(S.gain(0.11 * G.organ));
  const held = (f = 1) => S.note(perBar([PROG.map(c => HELD[c])])).s('gm_drawbar_organ')
    .attack(0.35).decay(0.01).sustain(1).release(1.4).lpf(cyc([900, 800, 1000, 850], f)).pan(0.45).room(0.45) // 4
    .mul(S.gain(0.045 * G.organ));

  const build = key => {
    const bpm = phases[key].bpm;
    if (key === 'fen') {
      // Murkmere: slower and the dubbiest. The skank sweeps through a low-pass over two passes and echoes;
      // whole layers drop out for 2-4 bars (drums, hats, skank, even the bass), the melodica's phrases echo.
      const dropDrums = rests([[7, 8]], [[15, 16], [23, 24]], ALL);                                 // 3
      const sweep = S.sine.range(650, 1500).slow(64);
      return [
        bassVoice(0.9).mask(rests(ALL, [[13, 14]], ALL, ALL, ALL, [[29, 30]], ALL)),                 // 7
        echo(skankVoice(sweep, 1.05).mask(THROW_SKANK), bpm, cyc([0.3, 0.38, 0.26, 0.34]), 0.75, 0.42, 1) // 4
          .mask(rests([[5, 6]], ALL, [[13, 16]], [[29, 30]], ALL)),                                   // 5
        echo(skankVoice(1100, 1.2).mask(ONLY_SKANK), bpm, cyc([0.75, 0.6, 0.85]), 0.75, 0.62, 2),     // 3
        echo(melodica(0.85, 0.35), bpm, cyc([0.28, 0.22, 0.34, 0.25, 0.3, 0.2, 0.32]), 0.75, 0.42, 1) // 7
          .mask(rests([[1, 8]], ALL, [[17, 24]], [[1, 16]], ALL)),                                    // 5
        kickVoice(0.95).mask(dropDrums),
        echo(rimVoice(0.9, 0.42).mask(THROW_RIM), bpm, 0.22, 0.75, 0.42, 1).mask(dropDrums),
        echo(rimVoice(0.95, 0.45).mask(ONLY_RIM), bpm, cyc([0.7, 0.55, 0.8, 0.6]), 0.75, 0.62, 2).mask(dropDrums),
        hatVoice(0.85).mask(rests([[1, 4]], ALL, [[17, 20]], ALL, [[25, 28]])),                     // 5
      ];
    }
    if (key === 'peaks') {
      // Mount Smoulder: everyone plays; the organ bubble joins on the offbeat eighths, the melodica every pass,
      // a short drum drop at the turnaround every fourth pass.
      const dropDrums = rests(ALL, ALL, ALL, [[31, 32]]);                                           // 4
      return [
        bassVoice(1.05),
        echo(skankVoice(cyc([1900, 1700, 2100], 1), 1).mask(THROW_SKANK), bpm, 0.14, 0.75, 0.32, 1),     // 3
        echo(skankVoice(1600, 1.1).mask(ONLY_SKANK), bpm, cyc([0.6, 0.5, 0.7, 0.55, 0.65]), 0.75, 0.55, 2), // 5
        bubble(1).mask(rests([[1, 4]], ALL, [[17, 20]], ALL, ALL, [[25, 26]], ALL)),                 // 7
        echo(melodica(1.06), bpm, 0.12, 0.75, 0.32, 1).mul(S.gain(1.08)),
        kickVoice(1).mask(dropDrums),
        echo(rimVoice(1, 0.28).mask(THROW_RIM), bpm, 0.1, 0.75, 0.32, 1).mask(dropDrums),
        echo(rimVoice(1, 0.32).mask(ONLY_RIM), bpm, cyc([0.5, 0.4, 0.55]), 0.75, 0.55, 2).mask(dropDrums), // 3
        hatVoice(1).mask(dropDrums),
      ];
    }
    if (key === 'ending') {
      // The crunch and the letter: slow, no drums; the bass and melodica over held organ chords, the last
      // skank of each section thrown into a long echo.
      return [
        held(1),
        bassVoice(0.85).mul(S.gain(0.9)),
        echo(skankVoice(1000, 1).mask(ONLY_SKANK), bpm, cyc([0.7, 0.55, 0.8, 0.6]), 1, 0.6, 2),     // 4
        echo(melodica(0.9, 0.6), bpm, cyc([0.3, 0.25, 0.34, 0.27, 0.32]), 1, 0.5, 1).room(0.4).mul(S.gain(1.5))     // 5
          .mask(rests(ALL, [[17, 24]], ALL)),                                                       // 3
      ];
    }
    // hamlet: sparse and cosy. Bass, one-drop and skank; the melodica rests some passes; a little echo.
    const dropDrums = rests(ALL, ALL, ALL, ALL, ALL, ALL, [[13, 14]]);                                // 7
    return [
      bassVoice(),
      echo(skankVoice(cyc([1500, 1350, 1650], 1), 1).mask(THROW_SKANK), bpm, 0.16, 0.75, 0.34, 1)    // 3
        .mask(rests(ALL, ALL, [[21, 22]], ALL)),                                                    // 4
      echo(skankVoice(1300, 1.1).mask(ONLY_SKANK), bpm, cyc([0.55, 0.45, 0.6, 0.5, 0.5]), 0.75, 0.52, 2), // 5
      echo(melodica(0.95), bpm, 0.1, 0.75, 0.34, 1).mask(rests(ALL, [[1, 8]], ALL, [[9, 16], [25, 32]], EVERY)), // 5
      kickVoice(0.9).mask(dropDrums),
      echo(rimVoice(0.9, 0.3).mask(THROW_RIM), bpm, 0.1, 0.75, 0.34, 1).mask(dropDrums),
      echo(rimVoice(0.9, 0.34).mask(ONLY_RIM), bpm, cyc([0.5, 0.4, 0.55, 0.45]), 0.75, 0.52, 2).mask(dropDrums), // 4
      hatVoice(0.8).mask(dropDrums),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'hamlet';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'hamlet');
  return soundtrack;
}
