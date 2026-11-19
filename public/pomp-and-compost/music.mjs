// Phase arrangements of Rule One Beat (slopwave r-c2125d2a5c10), a lo-fi hip hop beat in G mixolydian
// (G A B C D E F: every note natural, F natural is the colour, never F#), the same scale as the game's sound
// effects (scale('mixolydian', 67)).
// The 64-bar form (A1 A2 | B1 | A3 | a breakdown on the F/G - G9 vamp | B2 | A4 | a coda whose bar 64 F/G resolves
// to bar 1's G9) keeps its notes in every phase; phases change layers, tempo and tone, never key. The swing is in
// the notes (off-beat sixteenths a little late, the backbeat laid back).
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, rests, Rhodes/trumpet hand-offs, drum drop-outs) run against
// each other, so the texture repeats exactly only after 60 to 420 passes of 3 to 3.7 minutes.
//
// Sampled voices: gm_epiano1 (the Rhodes: chords, and the tune in catalogue), gm_muted_trumpet (the motif: the
// trumpet is the monarch), gm_electric_bass_finger (bass, with a soft sine sub), gm_pad_warm (sparing), VCSL
// bassdrum1, snare_rim, snare_modern, hihat and shaker_small; Strudel's built-in crackle as vinyl dust.
// The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and @strudel/soundfonts in
// the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  catalogue: { name: 'The catalogue', bpm: 76 }, // laid back: Rhodes chords and tune, bass, soft dusty drums
  pairs: { name: 'Rule Two', bpm: 80 },          // reshaped: the muted trumpet takes the motif, shaker, darker Rhodes
  showdown: { name: "The King's trunk", bpm: 86 }, // fullest: trumpet every pass, sixteenth hats, pad, brighter
  end: { name: 'The garden blooms', bpm: 70 },   // sparse: held Rhodes, bass in halves, trumpet reprise, no beat
};

const BARS = 64;
// Rhodes voicing per bar (v2/harmony.json): the pad and the ending's held chords.
const VOICING = ['f3,a3,b3,d4', 'a3,c4,e4,g4', 'g3,b3,d4,e4', 'g3,b3,c4,e4', 'f3,a3,b3,d4', 'a3,c4,e4,g4',
  'f3,a3,c4,e4', 'g3,c4,e4', 'f3,a3,b3,d4', 'a3,c4,e4,g4', 'g3,b3,d4,e4', 'g3,b3,c4,e4', 'f3,a3,b3,d4', 'a3,c4,e4,g4',
  'f3,a3,c4,e4', 'f3,a3,b3,d4', 'e3,g3,b3,d4', 'g3,b3,d4,e4', 'g3,b3,c4,e4', 'f3,a3,c4,e4', 'e3,g3,b3,d4',
  'g3,b3,d4,e4', 'a3,c4,e4,g4', 'f3,a3,c4,d4', 'f3,a3,b3,d4', 'a3,c4,e4,g4', 'g3,b3,d4,e4', 'g3,b3,c4,e4',
  'f3,a3,b3,d4', 'a3,c4,e4,g4', 'f3,a3,c4,e4', 'f3,a3,b3,d4', 'f3,a3,c4,g4', 'f3,a3,b3,d4', 'f3,a3,c4,g4',
  'f3,a3,b3,d4', 'g3,b3,c4,e4', 'f3,a3,c4,e4', 'a3,c4,e4,g4', 'f3,a3,c4,d4', 'e3,g3,b3,d4', 'g3,b3,d4,e4',
  'g3,b3,c4,e4', 'f3,a3,c4,e4', 'e3,g3,b3,d4', 'g3,b3,d4,e4', 'a3,c4,e4,g4', 'f3,a3,c4,g4', 'f3,a3,b3,d4',
  'a3,c4,e4,g4', 'g3,b3,d4,e4', 'g3,b3,c4,e4', 'f3,a3,b3,d4', 'a3,c4,e4,g4', 'f3,a3,c4,e4', 'g3,c4,e4',
  'f3,a3,b3,d4', 'f3,a3,c4,g4', 'f3,a3,b3,d4', 'f3,a3,c4,g4', 'g3,b3,d4,e4', 'g3,b3,c4,e4', 'f3,a3,c4,e4',
  'f3,a3,c4,g4'];
// Bass root and fifth per bar (v2/harmony.json): the ending's half-note bass.
const ROOT = ('g2 f2 e2 a2 g2 f2 d2 d2 g2 f2 e2 a2 g2 f2 d2 g2 c2 e2 a2 d2 c2 e2 f2 g2 g2 f2 e2 a2 g2 f2 d2 g2 ' +
  'g2 g2 g2 g2 a2 d2 f2 g2 c2 e2 a2 d2 c2 e2 f2 g2 g2 f2 e2 a2 g2 f2 d2 d2 g2 g2 g2 g2 e2 a2 d2 g2').split(' ');
const FIFTH = ('d3 c3 b2 e2 d3 c3 a2 a2 d3 c3 b2 e2 d3 c3 a2 d3 g2 b2 e2 a2 g2 b2 c3 d3 d3 c3 b2 e2 d3 c3 a2 d3 ' +
  'd3 d3 d3 d3 e2 a2 c3 d3 g2 b2 e2 a2 g2 b2 c3 d3 d3 c3 b2 e2 d3 c3 a2 a2 d3 d3 d3 d3 b2 e2 a2 d3').split(' ');
// Sections (1-based bars): A1 1-8, A2 9-16, B1 17-24, A3 25-32, breakdown 33-40, B2 41-48, A4 49-56, coda 57-64.
const A_STRAINS = [[1, 16], [25, 32], [49, 56]];
const B_STRAINS = [[17, 24], [41, 48]];
const BREAKDOWN = [[33, 40]];
const CODA = [[57, 64]];

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 64-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
// The complement: the ranges that play, for one pass (everything else rests).
const only = ranges => {
  const on = span(ranges), out = []; let start = null;
  on.forEach((v, i) => { if (v === 1 && start === null) start = i + 1; if (v === 0 && start !== null) { out.push([start, i]); start = null; } });
  if (start !== null) out.push([start, BARS]);
  return out;
};
const ALL = [];
const WHOLE = [[1, BARS]];

export function createSoundtrack(S) {
  const [bass, comp, tune, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 64-bar pass ('/64').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Gain trims, measured on the music bus (.slopwave/work/pomp-and-compost/integration/phase-check.mjs).
  const G = { rhodes: 1, tune: 1, tpt: 1, bass: 1, drums: 1, pad: 1,
    catalogue: 1, pairs: 1, showdown: 1, end: 1 };

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.003) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const rhodes = (g = 1, lpf = 1900) => sf(comp, 'gm_epiano1', 0.5)
    .lpf(lpf).hpf(110).pan(0.42).room(0.3).mul(S.gain(1.6 * g * G.rhodes));
  const rhodesTune = (g = 1, lpf = 2400) => sf(tune, 'gm_epiano1', 0.45)
    .lpf(lpf).hpf(200).pan(0.6).room(0.35).mul(S.gain(1.7 * g * G.tune));
  const trumpet = (g = 1, lpf = 2600) => sf(tune, 'gm_muted_trumpet', 0.18, 0.02)
    .lpf(lpf).hpf(250).pan(0.58).room(0.35).mul(S.gain(2.4 * g * G.tpt));
  // The Rhodes doubling the tune an octave down (showdown B strains).
  const lowTune = (g = 1) => sf(tune.fmap(v => ({ ...v, note: S.noteToMidi(v.note) - 12 })), 'gm_epiano1', 0.4)
    .lpf(1800).hpf(150).pan(0.4).room(0.3).mul(S.gain(1.2 * g * G.tune));
  const bassVoice = (g = 1, lpf = 850) => S.stack(
    sf(bass, 'gm_electric_bass_finger', 0.12, 0.005).lpf(lpf).mul(S.gain(2.2 * g * G.bass)),
    bass.s('sine').attack(0.01).decay(0.3).sustain(0.6).release(0.12).lpf(220).mul(S.gain(0.5 * g * G.bass)), // the sub
  );
  // The session's kick / noise snare / noise hat onsets on VCSL samples, keeping the score's accents.
  const kickVoice = (g = 1) => kick.fmap(({ gain }) => ({ s: 'bassdrum1', n: 2, gain: gain * 4 }))
    .lpf(1100).mul(S.gain(g * G.drums));
  const rimVoice = (g = 1) => snare.fmap(({ gain }) => ({ s: 'snare_rim', n: gain > 0.05 ? 0 : 1, gain: gain * 11 }))
    .lpf(3500).pan(0.45).room(0.25).mul(S.gain(g * G.drums));
  const snareVoice = (g = 1, lpf = 3200) => snare.fmap(({ gain }) => ({ s: 'snare_modern', n: gain > 0.05 ? 14 : 15, gain: gain * 6.5 }))
    .lpf(lpf).hpf(180).pan(0.47).room(0.22).mul(S.gain(g * G.drums));
  const hatVoice = (g = 1, lpf = 7000) => hat.fmap(({ gain }) => ({ s: 'hihat', n: gain > 0.0125 ? 0 : 1, gain: gain * 50 }))
    .hpf(3000).lpf(lpf).pan(0.6)
    .mul(S.gain(cyc([1, 0.85, 0.95, 0.8, 0.9, 0.75, 0.88], g * G.drums)));                     // 7
  // Extra layers (music.mjs only): off-beat shaker, sixteenth ghost hats (swung like the score), vinyl crackle, pad.
  const shaker = (g = 1) => S.s('[~ shaker_small]*4').n('<0 1 2>').gain('[~ .9]*4').hpf(1500).lpf(5000).pan(0.66)
    .swingBy(0.16, 8).mul(S.gain(0.7 * g * G.drums));
  const ghostHats = (g = 1) => S.s('hihat*16').n(1).gain('[.6 .3 .45 .3]*4').hpf(4000).lpf(8000).pan(0.62)
    .swingBy(0.16, 8).mul(S.gain(0.14 * g * G.drums));
  const crackle = (g = 1) => S.s('crackle').hpf(1000).lpf(4500).mul(S.gain(0.9 * g));
  const pad = (g = 1, lpf = 1100) => S.note(perBar(VOICING.map(c => `[${c}]`))).s('gm_pad_warm')
    .attack(0.6).decay(0.01).sustain(1).release(1.2).legato(0.98).lpf(lpf).hpf(150).pan(0.5).room(0.45)
    .mul(S.gain(0.09 * g * G.pad));

  const build = key => {
    if (key === 'pairs') {
      // Rule Two: the same beat, reshaped. A darker Rhodes on a slow filter by pass (4). The motif is shared in
      // pairs by pass (3): the trumpet takes the A strains and coda while the Rhodes sings B and the breakdown;
      // the trumpet takes everything; the Rhodes takes A and the trumpet B. A shaker joins (off-beats, resting
      // in the breakdown); the warm pad holds the breakdown two passes of three. Snare on snare_modern, softened.
      return [
        rhodes(1, cyc([1500, 1350, 1700, 1450])),                                                     // 4
        trumpet(1, cyc([2400, 2200, 2600]))
          .mask(rests(only([...A_STRAINS, ...CODA]), ALL, only([...B_STRAINS, ...BREAKDOWN]))),       // 3
        rhodesTune(0.95, 2100)
          .mask(rests(only([...B_STRAINS, ...BREAKDOWN]), WHOLE, only([...A_STRAINS, ...CODA]))),     // 3
        bassVoice(1, cyc([800, 900, 750, 850, 950])),                                                 // 5
        kickVoice(1).mask(rests(ALL, ALL, ALL, ALL, [[29, 32]])),                                     // 5
        snareVoice(0.9, 2800).mask(rests(ALL, ALL, ALL, ALL, [[29, 32]])),
        hatVoice(1, 6500),
        shaker(1).mask(rests([[33, 40]], [[33, 40], [57, 64]], [[33, 40]], [[1, 8], [33, 40]], [[33, 40]], [[33, 40]], [[17, 24], [33, 40]])), // 7
        pad(1).mask(rests(only(BREAKDOWN), only(BREAKDOWN), WHOLE)),                                  // 3
        crackle(0.8),
      ];
    }
    if (key === 'showdown') {
      // The King's trunk: everyone. The trumpet leads every pass; the Rhodes doubles the tune an octave down in
      // the B strains (and the breakdown one pass in three); sixteenth ghost hats except in the breakdown (and,
      // one pass in four, the coda); the shaker throughout; the pad under the B strains and breakdown; brighter.
      return [
        rhodes(1.05, cyc([2300, 2100, 2600, 2400, 2200])),                                            // 5
        trumpet(1.1, cyc([2900, 2700, 3100])),                                                        // 3
        lowTune(1).mask(rests(only(B_STRAINS), only(B_STRAINS), only([...B_STRAINS, ...BREAKDOWN]))), // 3
        bassVoice(1.05, 1000),
        kickVoice(1.1),
        snareVoice(1.05, 3600),
        hatVoice(1.1, 7500),
        ghostHats(1).mask(rests(BREAKDOWN, BREAKDOWN, BREAKDOWN, [...BREAKDOWN, ...CODA])),          // 4
        shaker(1.1).mask(rests(ALL, ALL, ALL, ALL, ALL, ALL, [[33, 36]])),                            // 7
        pad(1.1, cyc([1200, 1000, 1400, 1100])).mask(rests(only([...B_STRAINS, ...BREAKDOWN]))),     // 4
        crackle(0.7),
      ];
    }
    if (key === 'end') {
      // The garden blooms: no beat. Held Rhodes chords (whole bars), the bass on root and fifth in halves, the
      // muted trumpet singing the A strains and the coda (by pass (3): one pass only A3 and the coda), a rim click
      // on beat 4 two passes of four, the crackle. A cadence-led reprise.
      const held = S.note(perBar(VOICING.map(c => `[${c}]`))).s('gm_epiano1')
        .attack(0.01).decay(0.01).sustain(1).release(1.4).legato(0.95).lpf(cyc([1500, 1300, 1700, 1400, 1600]))      // 5
        .hpf(110).pan(0.45).room(0.45).mul(S.gain(0.12 * G.rhodes));
      const halves = S.note(perBar(ROOT.map((r, i) => `[${r} ${FIFTH[i]}]`))).s('gm_electric_bass_finger')
        .attack(0.01).decay(0.01).sustain(1).release(0.3).legato(0.9).lpf(700).mul(S.gain(0.22 * G.bass));
      const click = S.s('snare_rim').n(1).struct('~ ~ ~ x').gain(0.18).lpf(3000).room(0.4).mul(S.gain(G.drums));
      return [
        held,
        halves,
        trumpet(1.05, cyc([2200, 2000, 2400, 2100])).room(0.45)                                       // 4
          .mask(rests(only([...A_STRAINS, ...CODA]), only([...A_STRAINS, ...CODA]), only([[25, 32], ...CODA]))), // 3
        click.mask(rests(WHOLE, ALL, WHOLE, ALL)),                                                    // 4
        crackle(1),
      ];
    }
    // catalogue: laid back. Rhodes chords on a slow filter by pass (5), the tune on a softer Rhodes (resting in
    // the B strains one pass in three, through the breakdown and coda another), finger bass, bassdrum, rim and
    // hats; the drums sit out bars 1-4 one pass in four (an intro feel) and the breakdown's kick one pass in seven.
    return [
      rhodes(1, cyc([1900, 1700, 2100, 1800, 2000])),                                                 // 5
      rhodesTune(1, cyc([2400, 2200, 2600])).mask(rests(ALL, B_STRAINS, [...BREAKDOWN, ...CODA])),  // 3
      bassVoice(1),
      kickVoice(1).mask(rests(ALL, ALL, ALL, [[1, 4]])).mask(rests(ALL, ALL, ALL, ALL, ALL, ALL, BREAKDOWN)), // 4, 7
      rimVoice(1).mask(rests(ALL, ALL, ALL, [[1, 4]])),
      hatVoice(0.9).mask(rests(ALL, ALL, ALL, [[1, 2]])),
      crackle(1),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'catalogue';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'catalogue');
  return soundtrack;
}
