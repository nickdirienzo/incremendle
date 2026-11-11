// Phase arrangements of Dead Letter Twang (slopwave r-d19eda07a2d1), noir surf rock in E blues
// (E G A Bb B D), the same scale as the game's sound effects (scale('blues', 64)).
// The 48-bar composition (91 s at 126 BPM; intro vamp, A1 and A2 12-bar minor blues, an 8-bar bridge
// over G/Gm, A3; bar 48's Bm7 falls back into the intro's Em) keeps its notes in every phase; phases
// change layers, tempo, effects and tone, never key. The bass ostinato is the hook (E E G E A E Bb B);
// the lead is a clean twang guitar drenched in room with a slapback/dotted echo; in a rush it is
// tremolo-picked (each note re-struck on sixteenths) over a four-on-the-floor kick and a tom roll.
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, echo sends, drop-outs, lead rests) run against
// each other, so the combined texture takes 420 passes (about 10 hours) to repeat exactly.
//
// Sampled voices: gm_electric_guitar_clean (lead, tremolo, comp), gm_electric_bass_finger (+ a soft
// session sine sub), gm_drawbar_organ (combo-organ wash in frog and end), VCSL vibraphone_soft (desk
// comp), bassdrum1, snare_modern (snares-on hit; cross-stick in desk), hihat, tom_stick / tom2_stick
// (fills and the rush roll), tom2_mallet (soft parade toms in the ending), sus_cymbal (bowed swells).
// One delay line per orbit: every echo in a phase uses orbit 1 with one time and feedback per phase.
// The game must call
//   createMusic(A, { soundfonts: true, packs: ['vcsl'], song })
// with song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey), and @strudel/soundfonts in
// the import map. This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  desk: { name: 'The desk', bpm: 112 },     // hand-sorting: lone reverb guitar, walking bass, cross-stick
  floor: { name: 'The floor', bpm: 126 },   // cranes at work: the full surf band
  rush: { name: 'Rush', bpm: 140 },         // 30 s rush: tremolo lead, four-on-the-floor, tom roll
  frog: { name: 'The Great Frog', bpm: 132 }, // the last stretch: fullest, organ wash, cymbal swells
  end: { name: 'Parade', bpm: 96 },         // dawn and the ticker tape: no kit, held organ, long echoes
};

const BARS = 48;
// The score's chord per bar (see .slopwave/work/the-big-fold/plan.json).
const BLUES = ['Em', 'Em', 'Em', 'Em', 'A', 'A', 'Em', 'Em', 'Bm', 'A', 'Em', 'Bm'];
const PROG = [
  'Em', 'Em', 'Em', 'Em',                               // V: intro vamp
  ...BLUES,                                             // A1
  ...BLUES,                                             // A2
  'G', 'Gm', 'G', 'Gm', 'A', 'A', 'Bm', 'Bm',           // B: bridge
  ...BLUES,                                             // A3
];
// Scale-only voicings (no C, F or F#): Em, A7 without its third, Bm7 without its fifth, G, Gm.
const HELD = { Em: '[e3,g3,b3,d4]', A: '[e3,g3,a3,d4]', Bm: '[d3,a3,b3]', G: '[d3,g3,b3]', Gm: '[d3,g3,as3]' };
const SECTION_ENDS = [4, 16, 28, 36, 48]; // the bar before each section's downbeat (1-based)

const perBar = list => '<' + list.join(' ') + '>';
// Which bars of a pass play (1) or rest (0): one 48-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const bars = (fn) => perBar(Array.from({ length: BARS }, (_, i) => fn(i + 1)));

export function createSoundtrack(S) {
  const [bass, comp, lead, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 48-bar pass ('/48').
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;
  // Echo on orbit 1, timed in beats at the phase tempo.
  const echo = (p, bpm, send, beats, feedback) =>
    p.orbit(1).delay(send).delaytime(+(60 / bpm * beats).toFixed(4)).delayfeedback(feedback);

  // Gain trims, measured on the music bus (.slopwave/work/the-big-fold/integration/phase-check.mjs).
  const G = { lead: 1, trem: 1, bass: 0.7, comp: 0.7, vibes: 0.6, organ: 0.6, kick: 1, snare: 1, hat: 1, tom: 1, cym: 1,
    desk: 1, floor: 0.85, rush: 0.75, frog: 0.75, end: 1 }; // phase trims even out the bus (about -38 dBFS each at musicTrim 1)

  // Soundfonts ring on their own; the envelope only sets the attack and release.
  const sf = (p, name, release, attack = 0.002) => p.s(name).attack(attack).decay(0.01).sustain(1).release(release);
  const guitar = (f = 1, room = 0.45, release = 0.5) => sf(lead, 'gm_electric_guitar_clean', release)
    .lpf(cyc([2600, 2300, 2800, 2400, 2200], f)).hpf(160).pan(0.58).room(room)                  // 5
    .mul(S.gain(cyc([1, 0.94, 0.98, 0.92], 1.6 * G.lead)));                                    // 4
  // Tremolo picking: every lead note re-struck on sixteenths, accent on the beat.
  const tremolo = (f = 1, room = 0.4) => sf(lead.segment(16), 'gm_electric_guitar_clean', 0.06)
    .legato(0.85).lpf(cyc([2400, 2200, 2600], f)).hpf(180).pan(0.56).room(room)                // 3
    .mul(S.gain('[1 .72 .82 .72]*4')).mul(S.gain(1.35 * G.trem));
  const bassVoice = (sub = 0.5, f = 1) => S.stack(
    sf(bass, 'gm_electric_bass_finger', 0.08).lpf(cyc([1100, 950, 1250], f)).mul(S.gain(1.5 * G.bass)), // 3
    bass.s('sine').lpf(220).mul(S.gain(cyc([1, 0.9, 1.1, 0.95], sub * G.bass))),              // 4: the sub
  );
  const compVoice = (lpf = 1500, g = 1) => sf(comp, 'gm_electric_guitar_clean', 0.12)
    .lpf(lpf).hpf(220).pan(0.36).room(0.3).mul(S.gain(1.3 * g * G.comp));
  const vibes = (g = 1) => comp.mask('1 0 0 0').legato(2.5).s('vibraphone_soft')
    .lpf(2600).pan(0.4).room(0.5).mul(S.gain(2.2 * g * G.vibes));
  const organ = (f = 1, g = 1) => S.note(perBar(PROG.map(c => HELD[c]))).s('gm_drawbar_organ')
    .attack(0.25).decay(0.01).sustain(1).release(0.8).lpf(cyc([1000, 880, 1150, 940], f)).pan(0.44).room(0.4) // 4
    .mul(S.gain(0.05 * g * G.organ));
  // The score's kick / snare / hat onsets on VCSL samples, keeping the score's accents.
  const kickVoice = (g = 1) => kick.fmap(({ gain }) => ({ s: 'bassdrum1', n: 2, gain: gain * 4.5 }))
    .lpf(1000).mul(S.gain(g * G.kick));
  const snareVoice = (g = 1, room = 0.25) => snare.fmap(({ gain }) => ({ s: 'snare_modern', n: 14, gain: gain * 8 }))
    .n('<14 15>*2').lpf(5000).pan(0.46).room(room).mul(S.gain(g * G.snare));
  const crossStick = (g = 1) => snare.mask('0 0 0 1').fmap(({ gain }) => ({ s: 'snare_modern', n: 43, gain: gain * 2.6 }))
    .n('<43 44>').lpf(4000).pan(0.44).room(0.45).mul(S.gain(g * G.snare));
  const hatVoice = (g = 1, f = 1) => hat.fmap(({ gain }) => ({ s: 'hihat', n: gain > 0.06 ? 0 : 1, gain: gain * 300 }))
    .hpf(3000).lpf(cyc([7000, 6200, 7500, 6600, 7200, 6000, 6800], f)).pan(0.64)                  // 7
    .mul(S.gain(g * G.hat));
  // Tom fill on the last beat of each section's final bar; the rush roll; soft mallet toms for the parade.
  const fill = (g = 1) => S.s(bars(b => SECTION_ENDS.includes(b)
    ? '[~ ~ ~ [tom_stick:2 tom_stick:3 tom2_stick:2 tom2_stick:3]]' : '~'))
    .gain('[1 1 1 [.8 .7 .9 1]]').lpf(4000).pan(0.5).room(0.3).mul(S.gain(0.5 * g * G.tom));
  const roll = (g = 1) => S.s('[tom2_stick:2 tom_stick:3 tom_stick:2 tom_stick:3]*4')
    .gain('[1 .5 .62 .5]*4').lpf(3600).pan('[.4 .58 .58 .58]*4').room(0.25).mul(S.gain(0.17 * g * G.tom));
  const fourKick = (g = 1) => S.s('bassdrum1:2*4').gain('[.85 .7 .78 .7]').lpf(1000).mul(S.gain(g * G.kick));
  const malletToms = (g = 1) => S.s('tom2_mallet:2 ~ tom2_mallet:3 ~').gain('1 0 .7 0')
    .lpf(1800).room(0.45).mul(S.gain(0.45 * g * G.tom));
  // Bowed-cymbal crescendo (2 s) starting in the bar before each section, so it blooms into the downbeat
  // (on beat 1 of that bar at 112-140 BPM; on beat 2 in the slow ending).
  const swell = (g = 1, at = 'sus_cymbal:5') => S.s(bars(b => SECTION_ENDS.includes(b) ? at : '~'))
    .lpf(5000).hpf(400).pan(0.5).room(0.4).mul(S.gain(0.35 * g * G.cym));

  const build = key => {
    const bpm = phases[key].bpm;
    if (key === 'floor') {
      // Cranes at work: the whole surf band. The lead rests through A1 every third pass; the drums sit out
      // the intro vamp every fourth pass (bass and guitar comp alone).
      const dropDrums = rests(ALL, ALL, ALL, [[1, 4]]);                                            // 4
      return [
        bassVoice(0.45),
        compVoice(cyc([1500, 1300, 1700], 1)).mask(rests(ALL, ALL, ALL, ALL, [[29, 32]])),        // 3 / 5
        echo(guitar(1, 0.45), bpm, cyc([0.2, 0.26, 0.18, 0.24]), 0.75, 0.3)                       // 4
          .mask(rests(ALL, [[5, 16]], ALL)),                                                       // 3
        kickVoice().mask(dropDrums),
        snareVoice().mask(dropDrums),
        hatVoice(1).mask(dropDrums),
        fill(),
      ];
    }
    if (key === 'rush') {
      // A 30-second rush: same tune and key, faster. Tremolo lead throughout (also over the intro vamp's
      // rests the bass carries it), four-on-the-floor kick, the lo-hi-hi-hi tom roll, comp on the downbeats.
      return [
        bassVoice(0.5, 1.1),
        compVoice(1700, 0.9).mask('1 0 0 0'),
        echo(tremolo(1, 0.35), bpm, 0.14, 0.75, 0.25),
        fourKick(),
        snareVoice(1.1, 0.2),
        hatVoice(0.9),
        roll(),
      ];
    }
    if (key === 'frog') {
      // The Great Frog: everyone plays; the combo organ joins, the bridge goes to tremolo, the bowed cymbal
      // swells into every section; tom fills; the organ rests in the intro every fifth pass.
      const bridge = rests([[1, 28], [37, 48]]);
      const notBridge = rests([[29, 36]]);
      return [
        bassVoice(0.55, 1.05),
        compVoice(cyc([1700, 1500, 1900], 1), 1.05),                                                 // 3
        organ(1).mask(rests(ALL, ALL, ALL, ALL, [[1, 4]])),                                          // 5
        echo(guitar(1.08, 0.45), bpm, cyc([0.22, 0.28, 0.2, 0.26]), 0.75, 0.32).mask(notBridge),    // 4
        echo(tremolo(1.05, 0.4), bpm, 0.22, 0.75, 0.32).mask(bridge),
        kickVoice(1.05),
        snareVoice(1.05),
        hatVoice(1.05),
        fill(1.1),
        swell(1).mask(rests(ALL, ALL, ALL, ALL, ALL, ALL, [[45, 48]])),                              // 7
      ];
    }
    if (key === 'end') {
      // Dawn and the parade: slow, no kit. Held organ, half-note bass, the lead in a long quarter-note echo,
      // soft mallet toms on 1 and 3, a bowed cymbal blooming into each section.
      return [
        organ(0.95, 1.2),
        bassVoice(0.45, 0.85).mask('1 0 0 0 1 0 0 0').legato(3.6),
        vibes(0.9).mask(rests(ALL, [[29, 36]], ALL, [[5, 16]], ALL)),                                // 5
        echo(guitar(0.9, 0.55, 0.9), bpm, cyc([0.3, 0.24, 0.34, 0.27, 0.32]), 1, 0.42),            // 5
        malletToms(1),
        swell(0.9, '[~ sus_cymbal:5 ~ ~]'),
      ];
    }
    // desk: hand-sorting at night. A lone reverb guitar over a walking bass (the riff on the beats), a
    // cross-stick on 4 and soft quarter hats; vibes on the downbeats some passes; the guitar rests some passes.
    return [
      bassVoice(0, 0.85).mask('1 0 1 0 1 0 1 0').legato(1.8),
      vibes(1).mask(rests([[1, 48]], ALL, [[17, 28]])),                                              // 3
      echo(guitar(0.85, 0.6, 0.7), bpm, cyc([0.22, 0.18, 0.26, 0.2]), 0.1875, 0.18)                 // 4 (slapback)
        .mask(rests(ALL, [[5, 16]], ALL, ALL, [[29, 36]])),                                          // 5
      crossStick(0.9),
      hatVoice(0.55, 0.85).mask('1 0 1 0 1 0 1 0').mask(rests(ALL, ALL, ALL, ALL, ALL, ALL, [[1, 4]])), // 7
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'desk';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'desk');
  return soundtrack;
}
