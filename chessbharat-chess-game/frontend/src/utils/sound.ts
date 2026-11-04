/**
 * Tiny synthesized sound effects via the Web Audio API - no asset files, no
 * network. Used for move / capture / check / game-end cues. All calls are
 * no-ops when sound is disabled or the browser blocks audio.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 0.05) {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ac.destination);
    const now = ac.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000);
  } catch {
    /* ignore */
  }
}

export type SoundCue = 'move' | 'capture' | 'check' | 'end';

export function playCue(cue: SoundCue, enabled: boolean): void {
  if (!enabled) return;
  switch (cue) {
    case 'move': blip(320, 70, 'triangle', 0.04); break;
    case 'capture': blip(180, 110, 'square', 0.05); break;
    case 'check': blip(520, 120, 'sine', 0.05); break;
    case 'end': blip(300, 160, 'sine', 0.05); setTimeout(() => blip(400, 220, 'sine', 0.05), 120); break;
  }
}
