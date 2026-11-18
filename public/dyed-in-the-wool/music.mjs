// Phase arrangements of Vine Street Road March (slopwave revision noted in song.mjs), a steel-pan
// calypso in A hirajoshi (A B C E F), the same notes as the game's sound effects. The composition is
// two different 40-bar passes (80 bars, 188 s at 102 BPM; A1 A2 B C A3, the second pass the pan
// player's varied second chorus; bar 80's Esus(b9) falls to bar 1's Am). Phases change layers,
// tempo and tone, never key. Pass-level cycles of 3, 4 and 5 passes (filters, gains, the melody
// resting in some passes, comping masks) run against each other, so the combined texture takes
// 60 passes (about three hours) to repeat exactly.
//
// Sampled voices: the GM steel drums soundfont (gm_steel_drums) for the melody, gm_acoustic_bass
// (doubled softly by the session's triangle) for the bass, gm_acoustic_guitar_nylon for the comping;
// VCSL shaker_small, clave, tambourine and marimba (the late counter-line). The session's soft sine
// kick is kept. The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  early: { name: 'Early', bpm: 98 },   // summers 1-2, the lemon alone: pan, soft bass, light shaker
  summer: { name: 'Summer', bpm: 102 }, // the normal summer: the full groove
  late: { name: 'Late', bpm: 106 },     // the town is wrapped: brighter, a marimba counter-line, tambourine
  fair: { name: 'Fair', bpm: 90 },      // the Vine Street Fair: no drums, held pads, the pan now and then
  end: { name: 'End', bpm: 84 },        // the world in a jumper: warm, the hook over held chords
};

// The score's chord per bar (see .slopwave/work/dyed-in-the-wool/plan.json); both passes share it.
const PASS = [
  'Am', 'F', 'Am', 'Esus', 'Am', 'F', 'C', 'Am',         // A1
  'Am', 'F', 'Am', 'Esus', 'F', 'C', 'Esus', 'Eb9',      // A2
  'F', 'C', 'F', 'Am', 'F', 'C', 'Esus', 'Eb9',          // B (chorus)
  'Am9', 'Am9', 'F11', 'F11', 'Am9', 'Am9', 'Esus', 'Eb9', // C (pan break)
  'Am', 'F', 'Am', 'Esus', 'Am', 'F', 'Esus', 'Eb9',     // A3
];
const PROG = [...PASS, ...PASS];
const BARS = PROG.length; // 80
const PAD = {
  Am: '[e3,a3,c4]', Am9: '[e3,a3,b3,c4]', F: '[f3,a3,c4,e4]', F11: '[f3,a3,b3,e4]',
  C: '[e3,b3,c4]', Esus: '[e3,a3,b3]', Eb9: '[e3,f3,a3,b3]',
};
// Late counter-line on the marimba: chord tones on 2, 3-and and 4-and, under the pan.
const COUNTER = {
  Am: ['e4', 'c4', 'e4'], Am9: ['b3', 'e4', 'c4'], F: ['a3', 'c4', 'e4'], F11: ['b3', 'e4', 'c4'],
  C: ['e4', 'b3', 'c4'], Esus: ['b3', 'a3', 'b3'], Eb9: ['a3', 'b3', 'f4'],
};

// Which bars of a pass a layer plays (1) or rests (0), one list per pass.
const span = (on, ranges) => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, BARS]]);
const MELODY = {
  early: [span(1, [[1, 16], [33, 48], [73, 80]]), ALL, span(0, [[17, 32], [57, 64]]),
          span(1, [[1, 8], [17, 24], [41, 56], [73, 80]])],                                     // 4
  summer: [ALL, ALL, span(0, [[25, 32]]), ALL, span(0, [[49, 56]])],                            // 5
  fair: [span(1, [[1, 4], [9, 12], [33, 36], [41, 44], [73, 76]]), span(1, [[17, 24], [57, 60]]),
         span(1, [[1, 8], [49, 52]]), span(1, [[25, 28], [65, 72]])],                           // 4
  end: [ALL, span(0, [[25, 32], [65, 72]]), span(0, [[57, 64]])],                               // 3
};
const COUNTER_ON = [span(1, [[17, 40], [57, 80]]), span(1, [[9, 24], [49, 64]]),
                    span(1, [[1, 8], [25, 40], [65, 80]]), ALL];                                // 4
const perBar = passes => '<' + passes.flat().join(' ') + '>';

export function createSoundtrack(S) {
  const [bass, comp, pan, kick, clave, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 80-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(3)).join(' ')}>/${BARS}`;
  // Eighth-note masks that change once per pass.
  const eighths = masks => '<' + masks.map(m => `[${m}]!${BARS}`).join(' ') + '>';

  // Layer and phase gain trims (balanced on the music bus with the phase check in
  // .slopwave/work/dyed-in-the-wool/integration/phase-check.mjs).
  const G = { pan: 1.8, bass: 0.45, comp: 2, perc: 1, early: 1.55, summer: 1.35, late: 1.3, fair: 2.1, end: 1.6 };

  // Soundfonts ring on their own; the envelope only sets the release.
  const sf = (p, name, release) => p.s(name).attack(0.001).decay(0.01).sustain(1).release(release);
  const panVoice = (f = 1, release = 0.35) => sf(pan, 'gm_steel_drums', release)
    .lpf(cyc([2500, 2300, 2700, 2400, 2200], f)).pan(0.6).room(0.28)                   // 5
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.88], G.pan)));                                    // 4
  const bassVoice = (f = 1) => S.stack(
    sf(bass, 'gm_acoustic_bass', 0.2).lpf(1100 * f).mul(S.gain(1.1 * G.bass)),
    bass.lpf(cyc([480, 430, 520], f)).mul(S.gain(0.5 * G.bass)),                         // 3
  );
  const compVoice = (f = 1) => sf(comp, 'gm_acoustic_guitar_nylon', 0.12)
    .lpf(cyc([1800, 1600, 2000], f)).pan(0.36).room(0.15)                                // 3
    .mul(S.gain(cyc([0.9, 0.8, 0.86, 0.75, 0.84], G.comp)));                             // 5
  // The session's noise shaker/clave onsets on VCSL samples, keeping the score's accents.
  const shaker = (g = 1) => hat.fmap(({ gain }) => ({ s: 'shaker_small', gain: gain * 110 }))
    .n('[0 2 1 3 0 2 1 3]').hpf(1200).lpf(4500).pan(0.7)
    .mul(S.gain(cyc([1, 0.82, 0.92, 0.74], g * G.perc)));                                // 4
  const claveVoice = (g = 1) => clave.fmap(({ gain }) => ({ s: 'clave', n: 1, gain: gain * 13 }))
    .lpf(3200).pan(0.3).room(0.15).mul(S.gain(g * G.perc));
  const kickVoice = (g = 1) => kick.lpf(300).mul(S.gain(0.5 * g * G.perc));
  const pad = (lpf, gains, release = 2) => S.note(perBar([PROG.map(c => PAD[c])])).s('triangle')
    .attack(0.6).decay(1).sustain(0.7).release(release).lpf(cyc(lpf)).pan(0.5).room(0.5)
    .mul(S.gain(cyc(gains)));

  const build = key => {
    if (key === 'early') {
      // The lemon alone with a saucepan: the tune, a soft bass on 1 and 3, a light shaker.
      return [
        bassVoice(0.85).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 1 1 0 0 0', '1 0 0 0 1 0 0 1'])) // 3
          .mul(S.gain(0.85)),
        panVoice(0.92).mask(perBar(MELODY.early)),
        shaker(0.9).mask(eighths(['0 1 0 1 0 1 0 1', '1 1 1 1 1 1 1 1', '0 1 0 1 0 1 0 1',       // 5
          '0 1 1 1 0 1 1 1', '1 1 1 1 1 1 1 1'])),
      ];
    }
    if (key === 'late') {
      // The town is wrapped: a little faster and brighter, a marimba counter-line and tambourine.
      const counter = S.note('<' + PROG.map(c => {
        const [a, b, d] = COUNTER[c];
        return `[~ ~ ${a} ~ ~ ${b} ~ ${d}]`;
      }).join(' ') + '>').s('marimba').gain(0.1).lpf(2400).pan(0.42).room(0.2)
        .mask(perBar(COUNTER_ON)).mul(S.gain(cyc([1, 0.86, 0.94], 1)));                          // 3
      const tamb = S.n('[~ 0 ~ 1]').s('tambourine').gain('[~ .1 ~ .08]').hpf(2000).lpf(6000).pan(0.25)
        .mul(S.gain(cyc([1, 0.7, 0.85, 0, 0.9], G.perc)));                                      // 5
      return [
        bassVoice(1.08),
        compVoice(1.12).mask(eighths(['1 1 1 1 1 1 1 1', '1 1 1 0 1 1 1 1', '1 1 1 1 1 1 1 0'])), // 3
        panVoice(1.1),
        counter,
        kickVoice(), claveVoice(), shaker(1.05), tamb,
      ];
    }
    if (key === 'fair') {
      // The Vine Street Fair: slower, no percussion, held pads, the pan only now and then.
      return [
        bassVoice(0.8).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 0 0 0 0', '1 0 0 0 1 0 0 0'])) // 3
          .mul(S.gain(0.8)),
        pad([680, 600, 760, 640], [0.045, 0.038, 0.042, 0.036, 0.04]),                        // 4, 5
        compVoice(0.8).mask(eighths(['0 0 1 0 0 0 0 0', '0 0 0 0 0 1 0 0', '0 0 1 0 0 0 0 1',  // 4
          '0 0 0 0 0 0 0 0'])).room(0.35).mul(S.gain(0.75)),
        panVoice(0.6, 0.7).mask(perBar(MELODY.fair)).room(0.45).mul(S.gain(0.8)),
      ];
    }
    if (key === 'end') {
      // The world in a jumper: warm and held, the hook on the pan ringing longer over the chords.
      return [
        bassVoice(0.85).mask(eighths(['1 0 0 0 1 0 0 0', '1 0 0 0 1 0 0 1', '1 0 0 0 1 0 0 0', // 5
          '1 0 0 0 0 0 0 0', '1 0 0 1 1 0 0 0'])).mul(S.gain(0.85)),
        pad([780, 700, 840, 740], [0.05, 0.044, 0.048, 0.042], 2.2),                           // 4
        compVoice(0.85).mask(eighths(['0 0 1 0 0 0 0 1', '0 0 1 1 0 0 0 1', '0 0 0 0 0 1 0 1'])) // 3
          .room(0.35).mul(S.gain(0.8)),
        panVoice(0.88, 0.9).mask(perBar(MELODY.end)).room(0.45),
      ];
    }
    // summer: the full groove.
    return [
      bassVoice(),
      compVoice().mask(eighths(['1 1 1 1 1 1 1 1', '1 1 1 1 1 0 1 1', '1 1 0 1 1 1 1 1'])),      // 3
      panVoice().mask(perBar(MELODY.summer)),
      kickVoice(), claveVoice(), shaker(),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'summer';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'summer');
  return soundtrack;
}
