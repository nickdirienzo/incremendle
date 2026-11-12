// Phase arrangements of Tonight's Sky (slopwave r-b0db5a8e23a8), whole-tone synthwave in C whole tone
// (C D E F# G# A#), the same scale as the game's sound effects (scale('whole tone', 60)).
// The 56-bar composition (140 s at 96 BPM: intro, A1, A2, bridge, A3; every chord an augmented triad, bass
// moving by whole steps, bar 56's A# stepping into the intro's C) keeps its notes in every phase; phases change
// layers, tempo, filters and tone, never key. The motif is three falling whole steps in 3+3+2 (G#4 F#4 E4).
// Pads (held 9(#5) clusters) and the counter-line come from the same authoring script as the score
// (.slopwave/work/no-reruns/v1/write_score.py -> extras.json) and are checked there.
// Pass-level cycles of 3, 4, 5 and 7 passes (filters, echo sends, drop-outs, lead rests) run against each
// other, so the combined texture takes 420 passes (about 16 hours) to repeat exactly.
//
// Synth voices only (Strudel built-ins: sine, triangle, square, sawtooth, supersaw, white noise). No samples,
// soundfonts or packs. One delay setup per phase, all echoes on orbit 1.
// The game calls createMusic(A, { song }) with
//   song = () => (soundtrack ??= createSoundtrack(music.strudel))(phaseKey).
// This module never starts playback or changes global tempo.
import { createParts } from './song.mjs';

export const phases = {
  dusk: { name: 'Dusk', bpm: 88 },             // hand-pouring: pads, arp, sub; soft hats some passes
  night: { name: 'Night', bpm: 96 },           // the belt grid runs: the full synthwave band
  small: { name: 'The small hours', bpm: 100 }, // past 50 of 88: fullest, counter-line and sparkle arp
  parade: { name: 'Parade', bpm: 104 },        // the send-off: four-on-the-floor, brighter lead, held pads
};

const BARS = 56;
// Sections (1-based bars): intro 1-4, A1 5-20, A2 21-36, bridge 37-44, A3 45-56.
// One 56-bar pass of held pads, re-attacked only on chord changes (S.note(PAD).slow(56)).
const PAD = '[' + [
  '[e3,gs3,c4,d4]@2 [fs3,as3,c4,d4]@2 [e3,gs3,c4,d4]@2 [fs3,as3,d4,e4]@2',
  '[e3,gs3,c4,fs4]@2 [fs3,as3,d4,e4]@2 [e3,gs3,c4,d4]@2 [fs3,as3,c4,d4]@2',
  '[e3,gs3,c4,as4]@2 [fs3,as3,c4,d4]@2 [e3,gs3,c4,d4]@2 [fs3,as3,d4,e4]@2',
  '[e3,gs3,c4,fs4]@2 [fs3,as3,d4,e4]@2 [e3,gs3,c4,d4]@2 [fs3,as3,c4,d4]@2',
  '[e3,gs3,c4,as4]@2 [fs3,as3,c4,d4]@2 [e3,gs3,c4,as4]@1 [fs3,as3,d4,gs4]@1',
  '[e3,gs3,c4,fs4]@1 [fs3,as3,d4,gs4]@1 [e3,gs3,c4,as4]@1 [fs3,as3,c4,d4]@1',
  '[e3,gs3,c4,as4]@1 [fs3,as3,c4,d4]@1 [e3,gs3,c4,d4]@2 [fs3,as3,d4,e4]@2',
  '[e3,gs3,c4,fs4]@2 [fs3,as3,d4,e4]@2 [e3,gs3,c4,d4]@2 [fs3,as3,c4,d4]@2',
].join(' ') + ']';
// The counter-line (small and parade): half notes on beat 2 plus quarter answers, F#3-E4.
const COUNTER = '[' + [
  '[~@16] [~@16] [~@16] [~@16]',
  '[~@4 c4@8 as3@4] [~@4 gs3@12] [~@4 as3@8 gs3@4] [~@4 fs3@12]',
  '[~@4 gs3@8 as3@4] [~@4 c4@12] [~@4 d4@8 c4@4] [~@4 as3@12]',
  '[~@4 e4@8 d4@4] [~@4 c4@12] [~@4 d4@8 c4@4] [~@4 as3@12]',
  '[~@4 c4@8 as3@4] [~@4 gs3@12] [~@4 as3@8 c4@4] [~@4 d4@12]',
  '[~@4 c4@8 as3@4] [~@4 gs3@12] [~@4 as3@8 gs3@4] [~@4 fs3@12]',
  '[~@4 gs3@8 as3@4] [~@4 c4@12] [~@4 d4@8 c4@4] [~@4 as3@12]',
  '[~@4 e4@8 d4@4] [~@4 c4@12] [~@4 d4@8 c4@4] [~@4 as3@12]',
  '[~@4 c4@8 as3@4] [~@4 gs3@12] [~@4 as3@8 c4@4] [~@4 d4@12]',
  '[~@4 gs3@12] [~@4 as3@12] [~@4 c4@12] [~@4 d4@12]',
  '[~@4 e4@12] [~@4 d4@12] [~@4 c4@12] [~@4 as3@12]',
  '[~@4 c4@8 as3@4] [~@4 gs3@12] [~@4 as3@8 gs3@4] [~@4 fs3@12]',
  '[~@4 gs3@8 as3@4] [~@4 c4@12] [~@4 d4@8 c4@4] [~@4 as3@12]',
  '[~@4 e4@8 d4@4] [~@4 c4@12] [~@4 d4@8 c4@4] [~@4 as3@12]',
].join(' ') + ']';

// Which bars of a pass play (1) or rest (0): one 56-bar list per pass, given as the bar ranges that rest.
const span = ranges => Array.from({ length: BARS }, (_, i) =>
  ranges.some(([a, b]) => i + 1 >= a && i + 1 <= b) ? 0 : 1);
const rests = (...passes) => '<' + passes.map(span).flat().join(' ') + '>';
const ALL = [];
const WHOLE = [[1, BARS]];
const NOT_A2_A3 = [[1, 20], [37, 44]];

export function createSoundtrack(S) {
  const [bass, arp, lead, kick, snare, hat] = createParts(S);
  const cache = new Map();
  // One step per complete 56-bar pass.
  const cyc = (values, f = 1) => `<${values.map(v => +(v * f).toFixed(4)).join(' ')}>/${BARS}`;
  // The phase's one delay line: orbit 1, a dotted eighth at the phase tempo.
  const echo = (p, bpm, send, feedback = 0.32) =>
    p.orbit(1).delay(send).delaytime(+(60 / bpm * 0.75).toFixed(4)).delayfeedback(feedback);

  // Gain trims, measured on the music bus (.slopwave/work/no-reruns/integration/phase-check.mjs).
  // Layer trims bring the night solo levels (musicTrim 1) near: lead -40, bass -42, pad -44, arp -47, kick -46,
  // snare -50, hats -60 dBFS RMS. The score's own drum levels are tiny (session mix), hence the large factors.
  const G = { pad: 0.164, bass: 0.54, arp: 7, lead: 1.78, counter: 4, kick: 2.3, snare: 22, hat: 300,
    dusk: 1.2, night: 1, small: 0.95, parade: 0.9 }; // phase trims even out the bus (about -35 dBFS at musicTrim 1)

  const bassVoice = (sub = 0.5, f = 1) => S.stack(
    bass.lpf(cyc([420, 380, 470], f)).mul(S.gain(G.bass)),                                   // 3
    bass.s('sine').lpf(220).attack(0.004).decay(0.2).sustain(0.8).release(0.06)
      .mul(S.gain(cyc([1, 0.9, 1.05, 0.95], sub * G.bass))),                                 // 4: the sub
  );
  const pad = (f = 1, g = 1) => S.note(PAD).slow(BARS).s('supersaw').unison(3).spread(0.5).detune(0.12)
    .attack(0.6).decay(0.2).sustain(0.85).release(1.4)
    .lpf(cyc([900, 800, 1000, 860, 760], f)).hpf(140).room(0.5).pan(0.5)                     // 5
    .mul(S.gain(cyc([1, 0.9, 0.96, 0.86], 0.5 * g * G.pad)));                                // 4
  const pluck = (f = 1, g = 1) => arp.s('square').attack(0.002).decay(0.14).sustain(0).release(0.1)
    .lpf(cyc([1300, 1150, 1450, 1200, 1050], f)).pan(0.4).room(0.3)                          // 5
    .mul(S.gain(0.75 * g * G.arp));
  // Sparkle: the arp again a sixteenth later, softer and opposite, so the eighths become running sixteenths.
  const sparkle = (f = 1, g = 1) => arp.late(1 / 16).s('triangle').attack(0.002).decay(0.1).sustain(0).release(0.08)
    .lpf(cyc([1800, 1600, 2000], f)).pan(0.66).mul(S.gain(0.5 * g * G.arp));                 // 3
  const leadVoice = (f = 1, g = 1, bright = false) => S.stack(
    lead.s(bright ? 'sawtooth' : 'square').attack(0.03).decay(0.4).sustain(0.6).release(0.4)
      .lpf(cyc(bright ? [2200, 2000, 2400] : [1300, 1150, 1450], f)).pan(0.58).room(0.45),   // 3
    lead.s('sawtooth').attack(0.03).decay(0.4).sustain(0.6).release(0.4)
      .lpf(cyc([900, 820, 980, 860, 940, 800, 1000], f)).pan(0.46).room(0.45).mul(S.gain(0.6)), // 7
  ).mul(S.gain(cyc([1, 0.92, 0.97, 0.9], 0.8 * g * G.lead)));                                // 4
  const counter = (f = 1, g = 1) => S.note(COUNTER).slow(BARS).s('triangle')
    .attack(0.05).decay(0.3).sustain(0.55).release(0.5).lpf(cyc([1500, 1350, 1650], f)).pan(0.34).room(0.45)
    .gain(0.05).mul(S.gain(g * G.counter));
  const kickVoice = (g = 1) => kick.lpf(900).mul(S.gain(1.1 * g * G.kick));
  // Soft gated snare: a short noise burst into a small room, cut off by the envelope.
  const snareVoice = (g = 1) => snare.hpf(700).lpf(4200).decay(0.16).sustain(0).room(0.35).roomsize(0.6)
    .pan(0.47).mul(S.gain(g * G.snare));
  const hatVoice = (g = 1, f = 1) => hat.hpf(6000).lpf(cyc([8500, 7600, 9200, 8000, 7200, 8800, 7800], f)) // 7
    .pan(0.62).mul(S.gain(0.8 * g * G.hat));
  const fourKick = (g = 1) => S.s('sine*4').freq(65).penv(18).pdecay(0.045).decay(0.14).sustain(0)
    .gain('[.15 .12 .135 .12]').lpf(900).mul(S.gain(1.1 * g * G.kick)); // the score kick's level
  // Parade roll: snare sixteenths on the last beat of every fourth bar.
  const roll = (g = 1) => S.s('<~ ~ ~ [~ ~ ~ [white white white white]]>').hpf(700).lpf(4200)
    .decay(0.07).sustain(0).gain('[.01 .013 .016 .02]').pan(0.5).room(0.3).mul(S.gain(g * G.snare));

  const build = key => {
    const bpm = phases[key].bpm;
    if (key === 'night') {
      // The belt grid runs: the whole band. The lead rests through A2 one pass in three; the drums sit out
      // the bridge one pass in four (pads, arp and lead alone under the dome).
      const dropDrums = rests(ALL, ALL, ALL, [[37, 44]]);                                       // 4
      return [
        bassVoice(0.5),
        pad(1, 0.9),
        echo(pluck(1), bpm, cyc([0.24, 0.3, 0.2, 0.27, 0.22])),                                 // 5
        echo(leadVoice(1), bpm, cyc([0.22, 0.28, 0.2]), 0.32).mask(rests(ALL, ALL, [[21, 36]])), // 3
        kickVoice().mask(dropDrums),
        snareVoice().mask(dropDrums),
        hatVoice().mask(dropDrums),
      ];
    }
    if (key === 'small') {
      // The small hours: everything plus the counter-line and the sixteenth sparkle in A2 and A3
      // (three passes in five); the counter rests through A1 one pass in four.
      return [
        bassVoice(0.55, 1.05),
        pad(1.15, 0.95),
        echo(pluck(1.08), bpm, cyc([0.26, 0.3, 0.22, 0.28])),                                   // 4
        sparkle(1).mask(rests(NOT_A2_A3, WHOLE, NOT_A2_A3, WHOLE, NOT_A2_A3)),                   // 5
        counter(1).mask(rests(ALL, ALL, ALL, [[5, 20]])),                                       // 4
        echo(leadVoice(1.08), bpm, cyc([0.24, 0.3, 0.22]), 0.34),                               // 3
        kickVoice(1.05),
        snareVoice(1.05),
        hatVoice(1.1),
      ];
    }
    if (key === 'parade') {
      // The send-off: a steady four-on-the-floor kick, the score's snare on 2 and 4 with a roll every
      // fourth bar, eighth hats, held pads up front and the lead brighter (sawtooth) with more echo.
      return [
        bassVoice(0.55, 1.1),
        pad(1.25, 1.25),
        echo(pluck(1.15), bpm, 0.22),
        counter(1.1, 0.9).mask(rests(ALL, WHOLE, ALL)),                                         // 3
        echo(leadVoice(1, 1.05, true), bpm, cyc([0.3, 0.34, 0.26, 0.32]), 0.38),                // 4
        fourKick(0.85),
        snareVoice(1.1),
        roll(),
        hatVoice(1.3, 1.1),
      ];
    }
    // dusk: hand-pouring. Pads, arp and the sub; soft hats on two passes in four (never in the intro);
    // the lead hums A1 quietly one pass in three.
    return [
      bassVoice(0.5, 0.9),
      pad(0.9, 1.05),
      echo(pluck(0.9, 0.95), bpm, cyc([0.28, 0.32, 0.24, 0.3, 0.26]), 0.36),                    // 5
      echo(leadVoice(0.85, 0.7), bpm, 0.3, 0.36).mask(rests(WHOLE, WHOLE, [[1, 4], [21, 56]])), // 3
      hatVoice(0.6, 0.85).mask(rests([[1, 4]], WHOLE, [[1, 4]], WHOLE)),                         // 4
    ];
  };

  const soundtrack = (phaseKey) => {
    const key = phases[phaseKey] ? phaseKey : 'dusk';
    if (cache.has(key)) return cache.get(key);
    const trim = G[key] ?? 1;
    const result = [key, S.stack(...build(key)).mul(S.gain(trim)), phases[key].bpm / 240];
    cache.set(key, result);
    return result;
  };
  soundtrack.layers = key => build(phases[key] ? key : 'dusk');
  return soundtrack;
}
