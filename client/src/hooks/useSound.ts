// Cyberpunk-themed synthetic sound effects using the Web Audio API.
// No audio files required — all sounds are synthesised on the fly.
// AudioContext is created lazily on first sound play to avoid browser
// autoplay policy issues.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new AudioContext();
    }
    // Resume suspended context (browser policy may suspend it)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

// ── Sound helpers ────────────────────────────────────────────────

function playOscillator(
  ac: AudioContext,
  type: OscillatorType,
  frequency: number,
  startTime: number,
  duration: number,
  gainPeak: number,
): OscillatorNode {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + duration * 0.1);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
  return osc;
}

// ── Public API ───────────────────────────────────────────────────

/** Short digital click/beep when a card is played. */
export function playCardSound(): void {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (getMuted()) return;

    const t = ac.currentTime;

    // High-pitched click
    playOscillator(ac, 'square', 1200, t, 0.06, 0.15);
    // Subtle sub-click
    playOscillator(ac, 'triangle', 600, t, 0.04, 0.08);
  } catch {
    // AudioContext may be unavailable — fail silently
  }
}

/** Noise burst + low rumble when the pile burns. */
export function playBurnSound(): void {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (getMuted()) return;

    const t = ac.currentTime;

    // White-noise burst
    const bufferSize = ac.sampleRate * 0.4;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ac.createBufferSource();
    noise.buffer = buffer;

    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    // Band-pass to give it a crackle quality
    const bpf = ac.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1800;
    bpf.Q.value = 0.7;

    noise.connect(bpf);
    bpf.connect(noiseGain);
    noiseGain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.4);

    // Low rumble
    playOscillator(ac, 'sawtooth', 60, t, 0.5, 0.3);
    playOscillator(ac, 'sine', 40, t + 0.05, 0.4, 0.25);
  } catch {
    // fail silently
  }
}

/** Descending tone when picking up the pile. */
export function playPickupSound(): void {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (getMuted()) return;

    const t = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.5);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.start(t);
    osc.stop(t + 0.5);

    // Second, slightly detuned voice for thickness
    const osc2 = ac.createOscillator();
    const gain2 = ac.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(810, t);
    osc2.frequency.exponentialRampToValueAtTime(155, t + 0.5);
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.linearRampToValueAtTime(0, t + 0.5);
    osc2.connect(gain2);
    gain2.connect(ac.destination);
    osc2.start(t);
    osc2.stop(t + 0.5);
  } catch {
    // fail silently
  }
}

/** Electronic zap for special cards (Queen / 10 / red 6). */
export function playSpecialSound(): void {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (getMuted()) return;

    const t = ac.currentTime;

    // Rising sweep — zap
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.3);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.35);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.35);

    // Glitchy pulse
    playOscillator(ac, 'square', 3200, t + 0.1, 0.05, 0.1);
    playOscillator(ac, 'square', 2800, t + 0.17, 0.05, 0.08);
  } catch {
    // fail silently
  }
}

// ── Mute state ───────────────────────────────────────────────────

const STORAGE_KEY = 'shithead-muted';

function getMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Current muted state (read from localStorage). */
export const muted = getMuted();

/**
 * Toggle mute on/off.  Persists to localStorage.
 * Returns the **new** muted state.
 */
export function toggleMute(): boolean {
  try {
    const next = !getMuted();
    localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  } catch {
    return false;
  }
}
