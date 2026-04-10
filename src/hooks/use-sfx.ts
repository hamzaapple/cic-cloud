import { useCallback, useEffect, useState } from "react";

const SFX_KEY = "cic_sfx_muted";

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

const createClickSound = (ctx: AudioContext) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.type = "sine";
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
};

const createWhooshSound = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
  filter.Q.value = 2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
};

export const useSfx = () => {
  const [muted, setMuted] = useState(() => localStorage.getItem(SFX_KEY) === "true");

  useEffect(() => {
    localStorage.setItem(SFX_KEY, String(muted));
  }, [muted]);

  const playClick = useCallback(() => {
    if (muted) return;
    try { createClickSound(getCtx()); } catch {}
  }, [muted]);

  const playWhoosh = useCallback(() => {
    if (muted) return;
    try { createWhooshSound(getCtx()); } catch {}
  }, [muted]);

  const toggleMute = useCallback(() => setMuted(p => !p), []);

  return { muted, toggleMute, playClick, playWhoosh };
};

// Standalone function for use outside React (e.g. Button component)
// Reuses the shared AudioContext
export const playClickSfx = () => {
  try {
    if (localStorage.getItem(SFX_KEY) === "true") return;
    createClickSound(getCtx());
  } catch {}
};
