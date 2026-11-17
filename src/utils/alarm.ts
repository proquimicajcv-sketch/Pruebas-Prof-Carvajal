export function playLoudAlarm(): () => void {
  let audioCtx: AudioContext | null = null;
  let osc: OscillatorNode | null = null;

  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return () => {};
    }

    audioCtx = new AudioContextCtor();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }

    osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(880, now);
    for (let t = 0; t <= 5; t += 0.5) {
      osc.frequency.exponentialRampToValueAtTime(t % 1 === 0 ? 440 : 880, now + t);
    }

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 5.0);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 5.0);
  } catch (err) {
    console.error('Audio playback error:', err);
  }

  return () => {
    try {
      if (osc) {
        osc.stop();
        osc.disconnect();
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        void audioCtx.close();
      }
    } catch {
      // Ignore cleanup errors if already stopped/closed
    }
  };
}
