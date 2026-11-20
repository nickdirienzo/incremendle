// Phase arrangements of Houston, We Have a View (slopwave r-cfd6b7f217d3), night-sky ambient pads in D phrygian
// (D Eb F G A Bb C; Eb is the colour, never E natural), the same scale as the game's sound effects
// (scale('phrygian', 62)). The 40-bar form (A1 open on Ebmaj7 | A2 closing Ebmaj7 -> Dm7 | B, the motif inverted |
// C, a Dm7 / Eb-over-D sway on a D pedal | A3, the return landing bII-i) keeps its notes in sky, mission and end;
// hold is built from the C drift's material. Phases change layers, tempo and tone, never key.
// Pass-level cycles of 3, 5 and 7 passes (pad filter, bell rests, the bell's octave shimmer, arpeggio rests) run
// against each other, so the sky texture repeats exactly only after 105 passes (about 4.4 hours).
//
// Synth voices only (sine, sawtooth, triangle): no samples, no soundfonts. The game calls
//   createMusic(A, { song }) with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  sky: { name: 'Painting and scratching clouds', bpm: 64 },  // pads, sub, the bell motif on some passes
  mission: { name: 'A one-minute mission', bpm: 72 },         // + telemetry-blip arpeggio and a gentle low pulse
  hold: { name: 'Hold back: the Big One', bpm: 56 },          // a suspended drone, a slow two-chord sway, far bells
  end: { name: 'We have a view', bpm: 60 },                   // open and luminous: the motif in full, widest pad
};

const BARS = 40;
// Pad voicing and sub root per bar (v2/harmony.json).
const VOICING = ['a3,c4,d4,f4', 'a3,c4,d4,f4', 'g3,bb3,d4,g4', 'g3,bb3,d4,g4', 'bb3,d4,f4,a4', 'bb3,d4,f4,a4',
  'a3,bb3,d4,f4', 'g3,bb3,d4,g4', 'a3,c4,d4,f4', 'a3,c4,d4,f4', 'g3,bb3,d4,g4', 'g3,bb3,d4,g4', 'bb3,d4,f4,a4',
  'bb3,d4,eb4,g4', 'g3,bb3,d4,g4', 'a3,c4,d4,f4', 'a3,bb3,d4,f4', 'a3,bb3,d4,f4', 'bb3,d4,f4,a4', 'bb3,d4,f4,a4',
  'bb3,d4,eb4,g4', 'bb3,d4,eb4,g4', 'g3,bb3,d4,g4', 'g3,bb3,d4,g4', 'a3,c4,d4,f4', 'g3,bb3,eb4,g4', 'a3,c4,d4,f4',
  'g3,bb3,eb4,g4', 'a3,c4,d4,f4', 'g3,bb3,eb4,g4', 'bb3,d4,f4,a4', 'g3,bb3,d4,g4', 'a3,c4,d4,f4', 'a3,c4,d4,f4',
  'g3,bb3,d4,g4', 'g3,bb3,d4,g4', 'bb3,d4,f4,a4', 'bb3,d4,eb4,g4', 'g3,bb3,d4,g4', 'a3,c4,d4,f4'];
const ROOT = ('d2 d2 eb2 eb2 g2 g2 bb1 eb2 d2 d2 eb2 eb2 g2 c2 eb2 d2 bb1 bb1 g2 g2 c2 c2 eb2 eb2 ' +
  'd2 d2 d2 d2 d2 d2 d2 eb2 d2 d2 eb2 eb2 g2 c2 eb2 d2').split(' ');
// Sections (1-based bars): A1 1-8, A2 9-16, B 17-24, C drift 25-32, A3 33-40.
const A1 = [[1, 8]], A2 = [[9, 16]], B = [[17, 24]], C = [[25, 32]], A3 = [[33, 40]];

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 40-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const WHOLE = [[1, BARS]];

export function createSoundtrack(S) {
  const [sub, padStem, bells] = createParts(S);
  const cache = new Map();
  const midi = n => (typeof n === 'number' ? n : S.noteToMidi(n));
  const shift = (p, by) => p.fmap(v => ({ ...v, note: midi(v.note) + by }));
  // One step per complete 40-bar pass ('/40').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;

  // Gain trims, measured on the music bus (.slopwave/work/every-cloud/integration/phase-check.mjs).
  const G = { pad: 1, sub: 1, bell: 1, arp: 1, pulse: 1, sky: 1, mission: 1, hold: 0.32, end: 1 };

  // The pad: two sawtooths detuned +-7 cents, spread left and right, over a triangle; long attack, low-passed.
  const pad = (g = 1, lpf = 900) => S.stack(
    shift(padStem, 0.07).lpf(lpf).pan(0.32),
    shift(padStem, -0.07).lpf(lpf).pan(0.68),
    padStem.s('triangle').lpf(lpf * 1.6).pan(0.5).mul(S.gain(0.9)),
  ).room(0.6).roomsize(6).mul(S.gain(0.75 * g * G.pad));
  const subVoice = (g = 1) => sub.lpf(260).mul(S.gain(g * G.sub));
  // Glassy bells: the sine motif with a faint FM shimmer and a wide room.
  const bell = (g = 1) => bells.fm(0.6).fmh(3.5).room(0.75).roomsize(8).mul(S.gain(g * G.bell));
  // The bells an octave up, much softer, a little late: stars answering.
  const shimmer = (g = 1) => shift(bells, 12).late(0.09).pan(0.35).room(0.8).roomsize(8)
    .mul(S.gain(0.22 * g * G.bell));

  // Mission extras (music.mjs only), built from the per-bar harmony.
  // Telemetry blips: each bar's pad voicing an octave up as a soft sine eighth-note arpeggio with rests.
  const ARP_CELLS = [[0, 1, 2, 3, 2, 1, 2, 3], [0, 2, 1, 3, 1, 2, 3, 2]];
  const RHYTHM = ['x ~ x x ~ x x ~', 'x x ~ x ~ x ~ x'];
  const arpBar = (c, i) => {
    const ns = c.split(',').map(n => midi(n) + 12);
    const cell = ARP_CELLS[i % 2], hits = RHYTHM[(i >> 1) % 2].split(' ');
    return '[' + hits.map((h, k) => (h === 'x' ? ns[cell[k]] : '~')).join(' ') + ']';
  };
  const arp = (g = 1, lpf = 2600) => S.note(perBar(VOICING.map(arpBar))).s('sine')
    .attack(0.004).decay(0.16).sustain(0).release(0.12).lpf(lpf).pan('<0.3 0.7 0.45 0.6>').room(0.5).roomsize(5)
    .mul(S.gain(0.09 * g * G.arp));
  // A gentle low pulse: the bar's root (an octave over the sub) on beats 1 and 3, soft and round.
  const pulse = (g = 1) => S.note(perBar(ROOT.map(r => `[${midi(r) + 12} ~ ${midi(r) + 12} ~]`))).s('triangle')
    .attack(0.02).decay(0.35).sustain(0).release(0.2).lpf(320).mul(S.gain(0.2 * g * G.pulse));
  // The widest pad for the ending: the voicing again an octave up, quiet and bright.
  const crown = (g = 1, lpf = 1800) => S.note(perBar(VOICING.map(c => `[${c.split(',').map(n => midi(n) + 12).join(',')}]`)))
    .s('triangle').attack(2).decay(0.5).sustain(0.8).release(3).legato(1).lpf(lpf).pan(0.5).room(0.7).roomsize(8)
    .mul(S.gain(0.035 * g * G.pad));

  const build = key => {
    if (key === 'mission') {
      // Same harmony, a little faster: blips join (resting through the C drift one pass in five, A1's first
      // half another), a low pulse on 1 and 3 (out in the C drift two passes of three), bells by pass (3):
      // full, A strains only, full.
      return [
        pad(0.9, cyc([1000, 900, 1100, 950, 1050, 880, 1020])),                                    // 7
        subVoice(0.85),
        bell(1).mask(rests(ALL, [...B, ...C], ALL)),                                               // 3
        arp(1, cyc([2600, 2300, 2900, 2450, 2750])).mask(rests(C, ALL, [[1, 4]], ALL, [[17, 20]])), // 5
        pulse(1).mask(rests(C, ALL, C)),                                                           // 3
      ];
    }
    if (key === 'hold') {
      // Stillness: a held D-A drone (one event every four bars, slow attack and release), the Dm7 / Eb-over-D
      // sway two bars each, a bell every few bars on a 13-bar cycle against the sway, the filter drifting on 3
      // and 5 sway periods. No motif, no pulse.
      const drone = S.note('[d2,a2]').s('sine').slow(4).attack(3).decay(0.5).sustain(1).release(4).legato(1)
        .lpf(300).mul(S.gain(0.3 * G.sub));
      const swayNotes = S.note('<[a3,c4,d4,f4] [g3,bb3,eb4,g4]>/2');
      const sway = S.stack(
        shift(swayNotes.s('sawtooth'), 0.07).pan(0.32),
        shift(swayNotes.s('sawtooth'), -0.07).pan(0.68),
        swayNotes.s('triangle').pan(0.5),
      ).attack(2.5).decay(0.5).sustain(0.85).release(3.5).legato(1).lpf('<700 620 780>/4')
        .room(0.65).roomsize(8).mul(S.gain('<1 0.85 0.95 0.8 0.9>/2')).mul(S.gain(0.055 * G.pad));
      const far = S.note('<[~ ~ a5 ~] ~ ~ [eb6 ~ ~ ~] ~ ~ ~ [~ ~ d6 ~] ~ ~ ~ ~ [bb5 ~ ~ ~]>').s('sine')
        .attack(0.005).decay(2.2).sustain(0.04).release(2.5).fm(0.5).fmh(3.5).pan(0.62).room(0.8).roomsize(8)
        .mul(S.gain(0.11 * G.bell));
      return [drone, sway, far];
    }
    if (key === 'end') {
      // Moonlight: the motif in full every pass with its octave shimmer, the pad brighter and widest with the
      // crown voicing above, the sub. The bII-i landing in A3 every pass.
      return [
        pad(1, cyc([1300, 1200, 1400])),                                                           // 3
        crown(1, cyc([1800, 1600, 2000, 1700, 1900])),                                             // 5
        subVoice(0.9),
        bell(1.1),
        shimmer(1).mask(rests(ALL, ALL, ALL, ALL, ALL, ALL, B)),                                   // 7
      ];
    }
    // sky: the pad on a slow filter drift by pass (7), the sub, the bell motif by pass (5): full; resting in A1 and
    // B; full; only the C drift and A3; only A3 (the return). The octave shimmer one pass in three.
    return [
      pad(1, cyc([900, 800, 1050, 850, 980, 760, 920])),                                           // 7
      subVoice(1),
      bell(1).mask(rests(ALL, [...A1, ...B], ALL, [[1, 24]], [[1, 32]])),                         // 5
      shimmer(1).mask(rests(WHOLE, ALL, WHOLE)),                                                   // 3
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'sky';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'sky');
  return soundtrack;
}
