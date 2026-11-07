// Phase arrangements of Operators Standing By (slopwave r-d54ad49e509f), a gamelan piece in
// G mixolydian (G A B C D E F), the same scale as the game's sound effects. The 32-bar composition
// (eight 16-beat gongan, 80 s at 96 BPM) stays intact in every phase; phases change layers and tone.
// Tempo is 96 BPM in every phase but the ending, because the player taps to the beat.
//
// Re-voicing (an adaptation, verified in the game, not by the session's synth render): the saron
// and peking are FM metallophones, each doubled a fraction of a semitone sharp so the pair beats
// (the "ombak" shimmer of paired gamelan tuning); the gong and kempul are low FM bells with a slow
// decay. Pass-level cycles of 3, 4 and 5 passes (peking resting, kendhang patterns, filters) run
// against each other, so the texture takes 60 passes (80 minutes) to repeat exactly.
// The game must call createMusic(A, { song }) with no packs. This module never starts playback or
// changes global tempo.
import { createParts, bpm } from './song.mjs';

export const phases = {
  show:    { name: 'Show',    bpm },      // Pinchworth alone: saron, gongs, tick; peking now and then
  machine: { name: 'Machine', bpm },      // Wanda fixes the Fold-O-Matic: peking full, kendhang joins
  late:    { name: 'Late',    bpm },      // the last third: the peking doubles on some gongan
  demo:    { name: 'Demo',    bpm },      // a Live Demo: saron, gong and the tick, so the beat is clear
  final:   { name: 'Final',   bpm },      // hands off: the band drops out to the gong and a soft saron
  ending:  { name: 'Ending',  bpm: 80 },  // the van, the road, the sea: slower, warm, full
};

// One entry per gongan (4 bars), per pass: '<...>' over 32 bars.
const perGongan = passes => '<' + passes.flat().map(v => `${v}!4`).join(' ') + '>';

export function createSoundtrack(S) {
  const [gong, saron, peking, kendhang, , tick] = createParts(S);
  const cache = new Map();
  const midi = v => (typeof v.note === 'number' ? v.note : S.noteToMidi(v.note));
  const sharp = (p, cents) => p.fmap(v => ({ ...v, note: midi(v) + cents / 100 }));
  // One step per complete 32-bar pass ('/32').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/32`;

  // A metallophone: FM with an inharmonic ratio and a fast index decay (the bright strike),
  // played as a beating pair.
  const metal = (p, { ratio = 3.5, index = 1.6, decay = 0.5, lpf = 3000, cents = 14, pan = 0.5 } = {}) => {
    const voice = q => q.s('sine').fm(index).fmh(ratio).fmdecay(0.08).fmsustain(0.15)
      .attack(0.001).decay(decay).sustain(0).release(decay * 0.6).lpf(lpf).pan(pan).room(0.35);
    return S.stack(voice(p), voice(sharp(p, cents)).mul(S.gain(0.55)));
  };
  const saronV = (f = 1) => metal(saron, { ratio: 3.5, index: 1.3, decay: 0.55, lpf: 2600 * f, pan: 0.45 })
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.88])));                                                  // 4
  const pekingV = (f = 1) => metal(peking, { ratio: 2.76, index: 1.1, decay: 0.28, lpf: 3400 * f, cents: 18, pan: 0.62 })
    .mul(S.gain(cyc([0.9, 1, 0.84, 0.95, 0.88])));                                             // 5
  const gongV = (f = 1) => gong.s('sine').fm(0.6).fmh(1.41).fmdecay(1.2).fmsustain(0.1)
    .attack(0.006).decay(3).sustain(0).release(1.6).lpf(900 * f).room(0.45).vib(3.5).vibmod(0.06);
  const kendhangV = (g = 1) => kendhang.mul(S.gain(cyc([1, 0.8, 0.95], g)));                 // 3
  const tickV = (g = 1) => tick.mul(S.gain(g));

  const G = { saron: 1, peking: 0.8, gong: 1.1 };

  const build = key => {
    if (key === 'show') return [
      gongV(0.9).mul(S.gain(G.gong)),
      saronV(0.95).mul(S.gain(G.saron)),
      // The peking rests for whole gongan, a different set each pass (3).
      pekingV(0.9).mask(perGongan([[0, 1, 0, 1, 1, 0, 0, 1], [1, 0, 0, 1, 0, 1, 1, 0], [0, 0, 1, 1, 0, 1, 0, 1]]))
        .mul(S.gain(G.peking * 0.85)),
      tickV(1.2),
    ];
    if (key === 'machine') return [
      gongV().mul(S.gain(G.gong)),
      saronV().mul(S.gain(G.saron)),
      pekingV().mul(S.gain(G.peking)),
      kendhangV(),
      tickV(1),
    ];
    if (key === 'late') return [
      gongV(1.1).mul(S.gain(G.gong)),
      saronV(1.08).mul(S.gain(G.saron)),
      // Doubled peking (sixteenths) on some gongan (4), the plain one elsewhere.
      S.stack(
        pekingV(1.1).ply(2).mask(perGongan([[0, 1, 0, 0, 1, 1, 0, 1], [0, 0, 1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 0, 1, 0, 0], [0, 1, 1, 0, 1, 0, 1, 1]]))
          .mul(S.gain(G.peking * 0.75)),
        pekingV(1.1).mask(perGongan([[1, 0, 1, 1, 0, 0, 1, 0], [1, 1, 0, 0, 1, 1, 0, 0], [0, 1, 1, 0, 1, 0, 1, 1], [1, 0, 0, 1, 0, 1, 0, 0]]))
          .mul(S.gain(G.peking)),
      ),
      kendhangV(1.15),
      tickV(1),
    ];
    if (key === 'demo') return [
      gongV(0.9).mul(S.gain(G.gong * 0.9)),
      saronV(0.9).mul(S.gain(G.saron * 0.9)),
      tickV(1.8),
    ];
    if (key === 'final') return [
      gongV(0.8).mul(S.gain(G.gong)),
      saronV(0.7).mul(S.gain(G.saron * 0.45)),
    ];
    // The ending: the whole band, slower and warmer, the peking soft, no tick (nobody taps now).
    return [
      gongV(0.85).release(2.4).mul(S.gain(G.gong)),
      saronV(0.85).room(0.5).mul(S.gain(G.saron * 0.95)),
      pekingV(0.8).room(0.5).mul(S.gain(G.peking * 0.7)),
      kendhangV(0.7),
    ];
  };

  const soundtrack = phaseKey => {
    const key = phases[phaseKey] ? phaseKey : 'show';
    if (cache.has(key)) return cache.get(key);
    const result = [key, S.stack(...build(key)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'show');
  return soundtrack;
}
