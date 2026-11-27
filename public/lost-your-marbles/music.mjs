// Phase arrangements of the Radio Rummage Gamelan (slopwave r-714ccdb4b40c), a soft synth gamelan in D minor
// pentatonic (D F G A C), the same notes as the game's sound effects (scale('minor pentatonic', 62)).
// The 48-bar form is 12 gongan of 16 beats (A A B B A2 A2 C C B2 B2 A3 A3): nibani balungan in A, a note every beat
// in B, the high ngelik in C, a gong closing every gongan. Phases change layers, tempo and filters, never notes.
// Pass-level masks on 3-, 4- and 5-pass cycles run against each other, so a phase's texture repeats exactly only
// after 60 passes. One pass is 131 s at 88 BPM.
//
// Synth voices only: the session's sine gongs, triangle saron, sine bonang, sine kendhang, noise tak and ticks.
// Game additions (not in the session render, checked with npm run music:check and in the game):
//   - a soft FM shimmer doubling the bonang in rush (metal, but filtered under 3 kHz)
//   - the Recorder: once the player buys it, the balungan an octave up on a breathy triangle with vibrato,
//     every other gongan, a recorder finally being played
// The game uses song = () => soundtrack(phaseKey, recorderBought). This module never starts playback.
import { createParts } from './song.mjs';

export const phases = {
  hand: { name: 'Hand sorting', bpm: 80 },  // spacious: gongs, balungan, sparse bonang on some passes
  run: { name: 'The run', bpm: 88 },        // the full gamelan: bonang interlock and kendhang
  rush: { name: 'The rush', bpm: 96 },      // faster, a shimmer on the bonang, busier ticks
  end: { name: 'On air for good', bpm: 66 }, // slow and warm: gongs and balungan with long room
};

const BARS = 48;
const span = ranges => Array.from({ length: BARS }, (_, i) => ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const passes = (...list) => '<' + list.map(span).flat().join(' ') + '>';
const ALL = [];
const NONE = [[1, BARS]];
// every other gongan (bars 5-8, 13-16, ...) rests
const ODD_GONGAN = Array.from({ length: 6 }, (_, k) => [k * 8 + 5, k * 8 + 8]);
const EVEN_GONGAN = Array.from({ length: 6 }, (_, k) => [k * 8 + 1, k * 8 + 4]);

export function createSoundtrack(S) {
  const [low, middle, high, kick, snare, hat] = createParts(S);
  const cache = new Map();
  const cyc = values => `<${values.join(' ')}>/${BARS}`;
  const octave = (p, semitones) => p.fmap(v => ({
    ...v, note: (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note)) + semitones,
  }));
  // Phase trims, balanced on the music bus.
  const G = { hand: 2.6, run: 2.4, rush: 2.25, end: 2.4 };

  const build = (key, rec) => {
    const gongs = (g = 1) => low.mul(S.gain(g));
    const saron = (f = 1, g = 1, mask = passes(ALL)) => middle.lpf(S.sine.range(1300, 1900).slow(16).mul(f)).mask(mask).mul(S.gain(g));
    const bonang = (f = 1, g = 1, mask = passes(ALL)) => high.lpf(S.sine.range(1900, 2600).slow(12).mul(f)).mask(mask).mul(S.gain(g)).color('bonang');
    const shimmer = (g = 1, mask = passes(ALL)) => octave(high, 12).s('sine').fm(1.4).fmh(3.01).fmdecay(0.12).fmsustain(0)
      .attack(0.001).decay(0.18).sustain(0).lpf(3000).pan(0.7).gain(0.05 * g).mask(mask).color('bonang');
    const dhung = (g = 1) => kick.lpf(200).mul(S.gain(g));
    const tak = (g = 1) => snare.lpf(3800).mul(S.gain(g));
    const ticks = (g = 1) => hat.mul(S.gain(g));
    const recorder = (g = 1, mask = passes(ODD_GONGAN)) => octave(middle, 12).s('triangle').attack(0.06).decay(0.4).sustain(0.55)
      .release(0.25).vib(5).vibmod(0.12).lpf(2200).pan(0.38).room(0.4).gain(0.11 * g).mask(mask).color('recorder');

    let layers;
    if (key === 'hand') {
      layers = [
        gongs(1), saron(cyc([0.9, 0.82, 0.95, 0.86]), 1),                                // 4
        bonang(0.85, 0.8, passes([[1, 16]], ALL, [[25, 48]])),                         // 3
        dhung(0.6), tak(0.5).mask(passes(NONE, ALL, NONE, ALL, [[1, 24]])),           // 5
        ticks(0.7),
      ];
    } else if (key === 'run') {
      layers = [
        gongs(1), saron(cyc([1, 0.92, 1.05, 0.95, 0.9]), 1),                            // 5
        bonang(1, 1, passes(ALL, ALL, [[17, 24]], ALL)),                                // 4
        dhung(0.6), tak(0.8), ticks(1),
        shimmer(0.7, passes(NONE, [[1, 24]], NONE)),                                    // 3
      ];
    } else if (key === 'rush') {
      layers = [
        gongs(1.05), saron(cyc([1.15, 1.05, 1.2, 1.1, 1]), 1.05),                        // 5
        bonang(1.1, 1.05), shimmer(1, passes(ALL, [[25, 48]], ALL, [[1, 16]])),          // 4
        dhung(0.65), tak(0.9), ticks(1.2),
      ];
    } else {
      // end: slow, gongs and balungan with long room; the bonang every other gongan, ticks on some passes
      layers = [
        gongs(1.2).room(0.5), saron(0.85, 1.05, passes(ALL)).room(0.5),
        bonang(0.8, 0.75, passes(EVEN_GONGAN, ODD_GONGAN, EVEN_GONGAN)),                 // 3
        dhung(0.5), ticks(0.5).mask(passes(NONE, ALL, NONE, [[1, 24]])),                  // 4
      ];
    }
    if (rec) layers.push(recorder(key === 'end' ? 1.2 : key === 'hand' ? 0.85 : 1, key === 'end' ? passes(ALL) : passes(ODD_GONGAN, EVEN_GONGAN, ODD_GONGAN, NONE, ODD_GONGAN)));
    return layers;
  };

  const soundtrack = (phaseKey, rec = false) => {
    const key = phases[phaseKey] ? phaseKey : 'hand';
    const id = rec ? `${key}+recorder` : key;
    if (cache.has(id)) return cache.get(id);
    const result = [id, S.stack(...build(key, rec)).mul(S.gain(G[key] ?? 1)), phases[key].bpm / 240];
    cache.set(id, result);
    return result;
  };
  soundtrack.layers = (key, rec) => build(phases[key] ? key : 'hand', rec);
  return soundtrack;
}
