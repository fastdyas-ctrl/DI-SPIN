let AC: AudioContext | null = null;
let masterGain: GainNode | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!AC) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      AC = new AudioCtx();
      masterGain = AC.createGain();
      masterGain.connect(AC.destination);
    } catch {
      // AudioContext unavailable
    }
  }
  if (AC && AC.state === 'suspended') {
    AC.resume().catch(() => {});
  }
  return AC;
}

export function updateMasterGain(volume: number, muted: boolean) {
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : volume * 0.5;
  }
}

export function playTone(
  f: number,
  {
    type = 'sine',
    dur = 0.1,
    vol = 0.5,
    slide = 0,
    delay = 0,
    muted = false,
  }: {
    type?: OscillatorType;
    dur?: number;
    vol?: number;
    slide?: number;
    delay?: number;
    muted?: boolean;
  } = {}
) {
  const ctx = getAudioContext();
  if (!ctx || muted) return;

  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(f, t0);
  if (slide) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + dur);
  }

  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

  osc.connect(gain);
  if (masterGain) gain.connect(masterGain);
  else gain.connect(ctx.destination);

  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

let lastTickTime = 0;
export function playTick(ticksEnabled: boolean, muted: boolean) {
  const now = performance.now();
  if (now - lastTickTime < 28 || !ticksEnabled || muted) return;
  lastTickTime = now;
  playTone(1500 + Math.random() * 500, { type: 'square', dur: 0.03, vol: 0.14, muted });
}

export function playClick(muted: boolean) {
  playTone(260, { type: 'triangle', dur: 0.06, vol: 0.22, muted });
}

export function playAdd(muted: boolean) {
  playTone(520, { dur: 0.09, vol: 0.3, muted });
  playTone(780, { dur: 0.1, vol: 0.25, delay: 0.07, muted });
}

export function playDelete(muted: boolean) {
  playTone(300, { dur: 0.14, vol: 0.3, slide: -180, muted });
}

export function playWhoosh(muted: boolean) {
  const ctx = getAudioContext();
  if (!ctx || muted) return;

  const t0 = ctx.currentTime;
  const src = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.9), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  src.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300, t0);
  filter.frequency.exponentialRampToValueAtTime(2400, t0 + 0.7);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.9);

  src.connect(filter);
  filter.connect(gain);
  if (masterGain) gain.connect(masterGain);
  else gain.connect(ctx.destination);

  src.start();
}

export function playWin(muted: boolean) {
  const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  freqs.forEach((f, i) => {
    playTone(f, { type: 'triangle', dur: 0.34, vol: 0.35, delay: i * 0.09, muted });
  });
  playTone(2093, { type: 'sine', dur: 0.5, vol: 0.18, delay: 0.5, muted });
}
