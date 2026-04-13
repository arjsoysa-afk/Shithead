// Dark Synthwave Music Engine — Web Audio API, no audio files.
// 4-bar loop: Dm → Bb → Gm → Am
// Layers: 4-on-the-floor kick · snare · hi-hats · walking bass ·
//         gated arpeggio (with dotted-8th delay) · sparse lead stabs ·
//         detuned pad (sidechain-pumped by kick)

// ── Module state ─────────────────────────────────────────────────
let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;   // master output
let _padG: GainNode | null = null;     // pad gain — sidechain target
let _reverb: ConvolverNode | null = null;
let _delayNode: DelayNode | null = null;
let _delayFb: GainNode | null = null;
let _delayOut: GainNode | null = null;
let _arpSend: GainNode | null = null;  // arp → delay input
let _padOscs: OscillatorNode[] = [];
let _padLfos: OscillatorNode[] = [];
let _timer: ReturnType<typeof setInterval> | null = null;
let _nextTime = 0;
let _step = 0;

// ── Timing ───────────────────────────────────────────────────────
const BPM = 120;
const STEPS = 64;          // 4 bars × 16 steps
const S = 60 / BPM / 4;   // 0.125 s per 16th note
const LOOK = 0.15;
const TICK = 50;

// ── Note frequencies ─────────────────────────────────────────────
const D2=73.42, G2=98.00, A2=110.00, Bb2=116.54, C3=130.81;
const D3=146.83, E3=164.81, F3=174.61, G3=196.00, A3=220.00, Bb3=233.08;
const C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16;
const D5=587.33;

// ── Patterns ─────────────────────────────────────────────────────

// Kick: 4-on-the-floor
const KICK  = Array.from({length:64},(_,i)=>i%8===0);
// Snare: beats 2 & 4 (steps 8, 24, 40, 56)
const SNARE = Array.from({length:64},(_,i)=>i%16===8);
// Open hi-hat: 8th-note offbeats (steps 4,12,20,…)
const HH_O  = Array.from({length:64},(_,i)=>i%8===4);
// Closed hi-hat: remaining 8th notes
const HH_C  = Array.from({length:64},(_,i)=>i%4===0&&!KICK[i]&&!HH_O[i]);

// Bass: Dm → Bb → Gm → Am, syncopated
const BASS:number[] = [
  // Dm
  D2, 0, 0, D2,  0, 0, A2, 0,  D3, 0, 0, D2,  A2, 0, 0, 0,
  // Bb
  Bb2,0, 0, Bb2, 0, 0, F3, 0,  Bb2,0, C3,0,   D3, 0, 0, 0,
  // Gm
  G2, 0, 0, G2,  0, 0, D3, 0,  G3, 0, 0, G2,  D3, 0, 0, 0,
  // Am
  A2, 0, 0, A2,  0, 0, E3, 0,  A2, 0, C3,0,   D3, 0, A2,0,
];

// Arp: ascending chord tones with inversion variation
const ARP:number[] = [
  // Dm
  D4,F4,A4,D5, A4,F4,D4,F4, D4,A4,D5,A4, F4,D4,F4,A4,
  // Bb
  Bb3,D4,F4,Bb4, F4,D4,Bb3,D4, Bb3,F4,Bb4,F4, D4,Bb3,D4,F4,
  // Gm
  G3,Bb3,D4,G4, D4,Bb3,G3,Bb3, G3,D4,G4,D4, Bb3,G3,Bb3,D4,
  // Am → back to D
  A3,C4,E4,A4, E4,C4,A3,C4, A3,E4,A4,E4, C4,A3,C4,E4,
];

// Lead: sparse melody on chord accents
const LEAD:number[] = Array(64).fill(0);
([
  [0, D5],[10, A4],[12, F4],
  [16,Bb4],[26, F4],[28,D4],
  [32, G4],[42, D4],[44,Bb3],
  [48, A4],[58, E4],[60,C4],
] as [number,number][]).forEach(([step,freq])=>{ LEAD[step]=freq; });

// Pad chords: Dm7 → BbMaj7 → Gm7 → Am7 (each 16 steps)
const PAD_CHORDS: number[][] = [
  [D3, F3, A3, C4, D4],          // Dm7
  [Bb2, D3, F3, A3, Bb3],        // BbMaj7
  [G2, Bb2, D3, F3, G3],         // Gm7
  [A2, C3, E3, G3, A3],          // Am7
];

// ── Audio context helper ─────────────────────────────────────────

function ac(): AudioContext | null {
  try {
    if (!_ctx || _ctx.state === 'closed') _ctx = new AudioContext();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch { return null; }
}

// ── Build reverb (synthesised impulse response) ──────────────────

function buildReverb(a: AudioContext): ConvolverNode {
  const secs = 2.2;
  const len = Math.floor(a.sampleRate * secs);
  const buf = a.createBuffer(2, len, a.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      // Exponentially decaying noise
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
  }
  const conv = a.createConvolver();
  conv.buffer = buf;
  return conv;
}

// ── Build delay (dotted-8th, classic synthwave shimmer) ──────────

function buildDelay(a: AudioContext, dest: AudioNode): GainNode {
  const d = a.createDelay(1.0);
  d.delayTime.value = S * 3;     // dotted 8th = 3 sixteenth notes
  const fb = a.createGain();
  fb.gain.value = 0.30;
  const out = a.createGain();
  out.gain.value = 0.28;
  d.connect(fb); fb.connect(d); // feedback loop
  d.connect(out); out.connect(dest);
  const send = a.createGain();
  send.gain.value = 1;
  send.connect(d);
  _delayNode = d; _delayFb = fb; _delayOut = out;
  return send;
}

// ── Synthesisers ─────────────────────────────────────────────────

function synthKick(a: AudioContext, dest: AudioNode, t: number) {
  // Body: sine sweep
  const body = a.createOscillator();
  const bodyG = a.createGain();
  body.frequency.setValueAtTime(150, t);
  body.frequency.exponentialRampToValueAtTime(0.001, t + 0.45);
  bodyG.gain.setValueAtTime(0.70, t);
  bodyG.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  body.connect(bodyG); bodyG.connect(dest);
  body.start(t); body.stop(t + 0.45);

  // Click transient
  const click = a.createOscillator();
  const clickG = a.createGain();
  click.frequency.value = 1200;
  clickG.gain.setValueAtTime(0.30, t);
  clickG.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
  click.connect(clickG); clickG.connect(dest);
  click.start(t); click.stop(t + 0.02);

  // Sidechain: duck the pad
  if (_padG && _ctx) {
    _padG.gain.cancelScheduledValues(t);
    _padG.gain.setValueAtTime(0.025, t + 0.002);
    _padG.gain.setTargetAtTime(getMusicMuted() ? 0 : PAD_VOL, t + 0.01, 0.12);
  }
}

function synthSnare(a: AudioContext, dest: AudioNode, t: number) {
  // Tone component
  const tone = a.createOscillator();
  const toneG = a.createGain();
  tone.type = 'triangle';
  tone.frequency.setValueAtTime(220, t);
  tone.frequency.exponentialRampToValueAtTime(0.001, t + 0.12);
  toneG.gain.setValueAtTime(0.25, t);
  toneG.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  tone.connect(toneG); toneG.connect(dest);
  tone.start(t); tone.stop(t + 0.12);

  // Noise component
  const bufLen = Math.ceil(a.sampleRate * 0.18);
  const buf = a.createBuffer(1, bufLen, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const hp = a.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 1500;
  const noiseG = a.createGain();
  noiseG.gain.setValueAtTime(0.40, t);
  noiseG.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  src.connect(hp); hp.connect(noiseG); noiseG.connect(dest);
  src.start(t); src.stop(t + 0.18);
}

function synthHihat(a: AudioContext, dest: AudioNode, t: number, open: boolean) {
  const dur = open ? 0.20 : 0.04;
  const bufLen = Math.ceil(a.sampleRate * (open ? 0.25 : 0.06));
  const buf = a.createBuffer(1, bufLen, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const hp = a.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 7000;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 10000; bp.Q.value = 0.5;
  const g = a.createGain();
  g.gain.setValueAtTime(open ? 0.18 : 0.13, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(dest);
  src.start(t); src.stop(t + dur + 0.01);
}

function synthBass(a: AudioContext, dest: AudioNode, t: number, freq: number) {
  const dur = S * 3.2;

  // Sub sine
  const sub = a.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = freq;
  const subG = a.createGain();
  subG.gain.setValueAtTime(0.40, t);
  subG.gain.exponentialRampToValueAtTime(0.001, t + dur);
  sub.connect(subG); subG.connect(dest);
  sub.start(t); sub.stop(t + dur);

  // Sawtooth body with filter sweep
  const saw = a.createOscillator();
  saw.type = 'sawtooth';
  saw.frequency.value = freq * 2; // octave up for presence
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(800, t);
  lp.frequency.exponentialRampToValueAtTime(100, t + dur * 0.6);
  lp.Q.value = 3.0;
  const sawG = a.createGain();
  sawG.gain.setValueAtTime(0.30, t);
  sawG.gain.exponentialRampToValueAtTime(0.001, t + dur);
  saw.connect(lp); lp.connect(sawG); sawG.connect(dest);
  saw.start(t); saw.stop(t + dur);
}

function synthArp(a: AudioContext, dest: AudioNode, t: number, freq: number) {
  const gate = S * 0.65; // gated — 65% of step

  // Square wave (Juno-ish)
  const osc = a.createOscillator();
  osc.type = 'square';
  osc.frequency.value = freq;

  // Bandpass to tame harsh harmonics
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq * 1.5;
  bp.Q.value = 1.2;

  // Amplitude envelope
  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.28, t + 0.004);
  g.gain.setValueAtTime(0.22, t + gate * 0.4);
  g.gain.linearRampToValueAtTime(0, t + gate);

  osc.connect(bp); bp.connect(g); g.connect(dest);
  osc.start(t); osc.stop(t + gate + 0.01);
}

function synthLead(a: AudioContext, dest: AudioNode, t: number, freq: number) {
  const dur = S * 1.8;

  const osc = a.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  // Slight detune for thickness
  const osc2 = a.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.value = freq * 1.005;

  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(4000, t);
  lp.frequency.exponentialRampToValueAtTime(1200, t + dur);
  lp.Q.value = 4;

  const g = a.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.22, t + 0.008);
  g.gain.setValueAtTime(0.18, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);

  osc.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(dest);
  osc.start(t); osc2.start(t); osc.stop(t + dur); osc2.stop(t + dur);
}

// ── Pad (detuned Juno-style saws, chord follows progression) ─────

const PAD_VOL = 0.18;

function startPad(a: AudioContext, dest: AudioNode) {
  stopPad();
  const chord = PAD_CHORDS[0]; // start on Dm7

  chord.forEach((freq, idx) => {
    // Two slightly detuned oscillators per voice
    [-8, 6].forEach(detuneCents => {
      const osc = a.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = detuneCents + (idx % 3) * 2; // spread

      const lp = a.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      lp.Q.value = 1.8;

      // Slow filter LFO for movement
      const lfo = a.createOscillator();
      const lfoG = a.createGain();
      lfo.frequency.value = 0.08 + idx * 0.03;
      lfoG.gain.value = 180;
      lfo.connect(lfoG); lfoG.connect(lp.frequency);
      lfo.start();
      _padLfos.push(lfo);

      const g = a.createGain();
      g.gain.value = PAD_VOL / (chord.length * 2);

      osc.connect(lp); lp.connect(g);
      if (_padG) g.connect(_padG);
      osc.start();
      _padOscs.push(osc);
    });
  });
}

function stopPad() {
  [..._padOscs, ..._padLfos].forEach(o => { try { o.stop(); } catch { /* ok */ } });
  _padOscs = []; _padLfos = [];
}

// ── Step scheduler ───────────────────────────────────────────────

function scheduleStep(a: AudioContext, dry: AudioNode, wet: AudioNode, t: number, s: number) {
  const step = s % STEPS;

  if (KICK[step])  synthKick(a, dry, t);
  if (SNARE[step]) synthSnare(a, dry, t);
  if (HH_O[step])  synthHihat(a, dry, t, true);
  else if (HH_C[step]) synthHihat(a, dry, t, false);
  if (BASS[step])  synthBass(a, dry, t, BASS[step]);
  if (ARP[step] && _arpSend)  synthArp(a, _arpSend, t, ARP[step]);
  if (LEAD[step])  synthLead(a, wet, t, LEAD[step]);
}

// ── Public API ───────────────────────────────────────────────────

export function startMusic(): void {
  const a = ac();
  if (!a || _timer !== null) return;

  // Master output
  _master = a.createGain();
  _master.gain.value = getMusicMuted() ? 0 : 0.80;
  _master.connect(a.destination);

  // Pad gain (sidechain target)
  _padG = a.createGain();
  _padG.gain.value = getMusicMuted() ? 0 : PAD_VOL;
  _padG.connect(_master);

  // Reverb
  _reverb = buildReverb(a);
  const reverbOut = a.createGain();
  reverbOut.gain.value = 0.45;
  _reverb.connect(reverbOut);
  reverbOut.connect(_master);

  // Delay → reverb for arp (wet bus)
  _arpSend = buildDelay(a, _reverb);

  // Dry bus (kick, snare, bass go here)
  const dry = _master;
  // Wet bus (lead stabs go through reverb)
  const wet = _reverb;

  // Start pad
  startPad(a, _master);

  // Scheduler
  _nextTime = a.currentTime + 0.05;
  _step = 0;
  _timer = setInterval(() => {
    const c = ac();
    if (!c || !_master) return;
    while (_nextTime < c.currentTime + LOOK) {
      scheduleStep(c, dry, wet, _nextTime, _step);
      _nextTime += S;
      _step = (_step + 1) % STEPS;
    }
  }, TICK);
}

export function stopMusic(): void {
  if (_timer !== null) { clearInterval(_timer); _timer = null; }
  stopPad();
  if (_master && _ctx) {
    _master.gain.setTargetAtTime(0, _ctx.currentTime, 0.4);
    setTimeout(() => { _master = null; _padG = null; _reverb = null; _arpSend = null; _delayNode = null; }, 2000);
  }
}

// ── Mute ─────────────────────────────────────────────────────────

const MUSIC_KEY = 'shithead-music-muted';

function getMusicMuted(): boolean {
  try { return localStorage.getItem(MUSIC_KEY) === 'true'; } catch { return false; }
}

export let musicMuted = getMusicMuted();

export function toggleMusicMute(): boolean {
  musicMuted = !musicMuted;
  try { localStorage.setItem(MUSIC_KEY, String(musicMuted)); } catch { /* ignore */ }
  if (_master && _ctx) {
    _master.gain.setTargetAtTime(musicMuted ? 0 : 0.80, _ctx.currentTime, 0.15);
  }
  return musicMuted;
}
