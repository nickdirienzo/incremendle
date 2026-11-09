// Phase arrangements of Tuppence's Lullaby (slopwave r-89f2fc2e658b), a music box lullaby in G major
// pentatonic (G A B D E), the same scale as the game's sound effects (scale('major pentatonic', 67)).
// The tune is 32 bars of 3/4 (96 beats = 24 four-beat cycles, 80 s at 72 BPM; A A' B A'', bar 32's held G5
// and A5 pickup step back into bar 1's B5 hook). It keeps its notes in every phase; phases change layers,
// tempo and tone, never key. Pass-level cycles of 3, 4, 5 and 7 passes (filters, gains, melody rests, an
// octave-low bridge, harp masks, the counter-line) run against each other, so the combined texture takes
// 420 passes (over nine hours) to repeat exactly.
//
// Sampled voices: gm_music_box (melody), gm_orchestral_harp (arpeggios), gm_acoustic_bass (doubled softly by
// the session's triangle), gm_celesta (counter-line, hoop on), gm_string_ensemble_1 and gm_pad_warm (held
// chords in sail and ending). No drums, no VCSL. The game must call
//   createMusic(A, { soundfonts: true, song })
// with @strudel/soundfonts in the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  deck: { name: 'Deck', bpm: 72 },     // first season: music box, soft bass, a few harp notes; sparse
  hoop: { name: 'Hoop', bpm: 74 },     // sewing the sail: full harp arpeggios, a celesta counter-line
  sail: { name: 'Sail', bpm: 78 },     // the last panels: strings and a warm pad join, a touch brighter
  ending: { name: 'Ending', bpm: 66 }, // the Wind switches sides: slow, the melody over held chords
};

const PASS = 24; // cycles per 32-bar pass (96 beats)

// The score's chord per 3/4 bar (see .slopwave/work/fair-weather/plan.json), voiced below G4.
const PROG = [
  'G', 'G', 'Em', 'Em', 'Asus', 'Asus', 'D', 'D',   // A
  'G', 'G', 'Em', 'Em', 'Asus', 'D', 'G', 'G',      // A'
  'Em', 'Em', 'Bm7', 'Bm7', 'Asus', 'Asus', 'D', 'D', // B
  'G', 'G', 'Em', 'Em', 'Asus', 'D', 'G', 'G',      // A''
];
const CHORD = { G: '[g3,b3,d4]', Em: '[e3,g3,b3]', Asus: '[a3,d4,e4]', D: '[d3,a3,d4]', Bm7: '[d3,a3,b3]' };

// Celesta counter-line, authored with the score (.slopwave/work/fair-weather/v1/counter.json):
// [start beat, gate in beats, note, level]; answers in the melody's held bars, long tones under the bridge.
const COUNTER = [
  [4,0.45,"g4",0.17], [4.5,0.45,"a4",0.17], [5,0.9,"b4",0.17], [10,0.9,"d5",0.17], [11,0.9,"b4",0.17], [21.5,0.45,"d5",0.17],
  [22,0.45,"b4",0.17], [22.5,1.35,"a4",0.2], [28,0.45,"g4",0.17], [28.5,0.45,"a4",0.17], [29,0.9,"b4",0.17], [34,0.9,"d5",0.17],
  [35,0.9,"b4",0.17], [45.5,0.45,"b4",0.17], [46,1.35,"d5",0.2], [48,2.7,"b4",0.2], [51.5,1.35,"b4",0.2], [54,2.7,"a4",0.2],
  [58,0.45,"d5",0.17], [58.5,0.45,"e5",0.17], [59,0.9,"d5",0.17], [60,2.7,"a4",0.2], [66,2.7,"d5",0.2], [69.5,0.45,"a4",0.17],
  [70,0.9,"b4",0.17], [76,0.45,"g4",0.17], [76.5,0.45,"a4",0.17], [77,0.9,"b4",0.17], [82,0.9,"d5",0.17], [83,0.9,"b4",0.17],
  [93.5,0.45,"b4",0.17], [94,0.9,"d5",0.17],
];

// Which bars of a pass play (1) or rest (0), one 32-bar list per pass.
const span = (on, ranges) => Array.from({ length: 32 }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? on : 1 - on);
const ALL = span(1, [[1, 32]]);
const NONE = span(0, [[1, 32]]);
const BRIDGE = span(1, [[17, 24]]);
const MELODY = {
  deck: [ALL, span(0, [[17, 24]]), ALL, ALL, span(0, [[9, 16]])],  // 5: the music box rests now and then
  hoop: [ALL, ALL, span(0, [[17, 24]]), ALL],                     // 4: the bridge an octave lower once
};
const LOW_BRIDGE = { hoop: [NONE, NONE, BRIDGE, NONE] };          // the complement of MELODY.hoop
// Each list item lasts one 3/4 bar (3/4 cycle): 32 per pass.
const perBar = passes => `[${passes.flat().join(' ')}]/${PASS * passes.length}`;
// Eighth-note masks (six per 3/4 bar), one per pass; harp notes sit on eighths 2-6 of each bar.
const eighths = masks => `[${masks.map(m => `${m} `.repeat(32)).join('')}]/${PASS * masks.length}`;

export function createSoundtrack(S) {
  const [bass, harp, box] = createParts(S);
  const cache = new Map();
  // One step per complete 32-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${PASS}`;

  // Gain trims, measured on the music bus (.slopwave/work/fair-weather/integration/phase-check.mjs).
  const G = { box: 1.5, bass: 0.6, harp: 2.2, counter: 1.4, strings: 1, pad: 1, deck: 1.12, hoop: 1, sail: 1, ending: 1 };

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.001) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const octaveDown = p => p.fmap(v => ({ ...v, note: S.noteToMidi(v.note) - 12 }));
  const boxVoice = (p, f = 1, release = 0.9, room = 0.35) => sf(p, 'gm_music_box', release)
    .lpf(cyc([2500, 2300, 2700, 2400], f)).pan(0.58).room(room)                          // 4
    .mul(S.gain(cyc([1, 0.92, 0.97, 0.88, 0.95, 0.9, 0.98], G.box)));                    // 7
  const bassVoice = (f = 1) => S.stack(
    sf(bass, 'gm_acoustic_bass', 0.5).lpf(700 * f).mul(S.gain(1 * G.bass)),
    bass.lpf(cyc([420, 380, 460], f)).mul(S.gain(0.5 * G.bass)),                         // 3
  );
  const harpVoice = (f = 1, release = 0.8) => sf(harp, 'gm_orchestral_harp', release)
    .lpf(cyc([1700, 1500, 1900], f)).pan(0.42).room(0.3)                                 // 3
    .mul(S.gain(cyc([0.9, 0.8, 0.86, 0.76, 0.84], G.harp)));                             // 5
  const counterVoice = (gains, f = 1, room = 0.4) => {
    const times = COUNTER.map(([at]) => at).concat(96);
    const lead = COUNTER[0][0];
    const line = S.timecat(...[[lead, S.silence]].concat(COUNTER.map(([at, gate, p, level], i) => {
      const slot = times[i + 1] - at;
      return [slot, S.note(p).gain(level).legato(gate / slot)];
    }))).slow(PASS);
    return sf(line, 'gm_celesta', 0.7).lpf(cyc([2000, 1800, 2200], f)).pan(0.36).room(room) // 3
      .mul(S.gain(cyc(gains, G.counter)));
  };
  const held = (name, gains, { f = 1, attack = 0.5, release = 1.6, lpf = [1300, 1150, 1450, 1250], room = 0.45 } = {}) =>
    S.note(perBar([PROG.map(c => CHORD[c])])).s(name)
      .attack(attack).decay(0.01).sustain(1).release(release).lpf(cyc(lpf, f)).pan(0.5).room(room)  // 4
      .mul(S.gain(cyc(gains, name === 'gm_pad_warm' ? G.pad : G.strings)));

  const build = key => {
    if (key === 'hoop') {
      // Sewing the sail: the harp rocks every eighth, the celesta answers on two passes of three,
      // the bridge drops an octave on one pass of four.
      return [
        bassVoice(),
        harpVoice(),
        boxVoice(box.mask(perBar(MELODY.hoop))),
        boxVoice(octaveDown(box).mask(perBar(LOW_BRIDGE.hoop)), 0.9).mul(S.gain(1.1)),
        counterVoice([1, 0, 0.75]),                                                       // 3
      ];
    }
    if (key === 'sail') {
      // The last panels: strings and a faint warm pad under everything, the counter every pass, brighter.
      return [
        held('gm_string_ensemble_1', [0.1, 0.085, 0.095, 0.08, 0.09], { f: 1.05 }),        // 5
        held('gm_pad_warm', [0.05, 0.04, 0.055], { attack: 0.8, release: 2, lpf: [900, 800, 1000, 850] }), // 3
        bassVoice(1.05),
        harpVoice(1.1),
        boxVoice(box, 1.1),
        counterVoice([1, 0.85, 0.95, 0.8], 1.1),                                         // 4
      ];
    }
    if (key === 'ending') {
      // The Wind switches sides: held strings and pad, one short harp roll a bar, the melody over the chords.
      return [
        held('gm_string_ensemble_1', [0.12, 0.1, 0.11, 0.095], { attack: 0.7, release: 2.2, room: 0.55 }),
        held('gm_pad_warm', [0.07, 0.06, 0.065], { attack: 1, release: 2.5, lpf: [950, 850, 1000, 900], room: 0.55 }), // 3
        bassVoice(0.9),
        harpVoice(0.95, 1.4).mask(eighths(['0 1 1 1 0 0', '0 1 1 0 0 0', '0 1 1 1 1 0'])).room(0.45), // 3
        boxVoice(box, 0.95, 1.4, 0.5).mul(S.gain(1.05)),
        counterVoice([0.9, 0, 0.8, 0.7, 0], 0.95, 0.55),                                   // 5
      ];
    }
    // deck: intimate; the music box over the softest bass and a few harp notes from rotating eighth masks.
    return [
      bassVoice(0.95).mul(S.gain(0.75)),
      harpVoice(0.9).mask(eighths(['0 1 0 1 0 0', '0 1 0 0 0 0', '0 0 0 1 0 1'])).mul(S.gain(0.85)), // 3
      boxVoice(box.mask(perBar(MELODY.deck)), 0.95),
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'deck';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'deck');
  return soundtrack;
}
