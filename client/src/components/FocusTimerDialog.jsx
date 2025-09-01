import { useEffect, useMemo, useRef, useState } from "react";
import CssDialog from "./ui/CssDialog";

import alarmMp3 from "../assets/sounds/focus-alarm.mp3"; // adjust relative path
const AUDIO_SRC = alarmMp3;
export default function FocusTimerDialog({ open, onOpenChange }) {
  const [mins, setMins] = useState(25);
  const [secs, setSecs] = useState(0);

  const [total, setTotal] = useState(0); // total seconds
  const [left, setLeft] = useState(0); // remaining seconds
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);

  const canStart = useMemo(() => {
    const t = (Number(mins) || 0) * 60 + (Number(secs) || 0);
    return t > 0 && !running;
  }, [mins, secs, running]);

  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(100, Math.max(0, ((total - left) / total) * 100));
  }, [total, left]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // If dialog closes, also silence any audio
  useEffect(() => {
    if (!open) silence();
  }, [open]);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const tick = () => {
    setLeft((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        setPaused(false);
        fireAlarm();
        return 0;
      }
      return next;
    });
  };

  async function ensureAudioUnlocked() {
    try {
      // Prepare WebAudio fallback
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioCtxRef.current = new Ctx();
      }
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }

      // Prime HTMLAudio by a muted play/pause after a user gesture
      const a = audioRef.current;
      if (a) {
        a.muted = true;
        a.currentTime = 0;
        await a.play();
        a.pause();
        a.muted = false;
        a.currentTime = 0;
      }
      setAudioUnlocked(true);
      return true;
    } catch {
      return false;
    }
  }

  function beepFallback() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + 1.05);
    } catch {}
  }

  function fireAlarm() {
    const a = audioRef.current;
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {
        beepFallback();
      });
    } else {
      beepFallback();
    }
  }

  // NEW: clean stop for the audio element
  function silence() {
    try {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    } catch {}
  }

  const start = async () => {
    const t = (Number(mins) || 0) * 60 + (Number(secs) || 0);
    if (t <= 0 || running) return;

    // Unlock audio on user gesture
    await ensureAudioUnlocked();

    setTotal(t);
    setLeft(t);
    setRunning(true);
    setPaused(false);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 1000);
  };

  const pause = () => {
    if (!running || paused) return;
    setPaused(true);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const resume = () => {
    if (!running || !paused) return;
    setPaused(false);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 1000);
  };

  // UPDATED: Stop also silences any playing alarm
  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setPaused(false);
    setLeft(0);
    setTotal(0);
    silence();
  };

  // NEW: Reset puts remaining time back to current input (mins/secs) and silences alarm
  const reset = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    const base = (Number(mins) || 0) * 60 + (Number(secs) || 0);
    setTotal(base || 0);
    setLeft(base || 0);
    setRunning(false);
    setPaused(false);
    silence();
  };

  const presets = [
    { label: "25m", m: 25, s: 0 },
    { label: "15m", m: 15, s: 0 },
    { label: "50m", m: 50, s: 0 },
    { label: "5m", m: 5, s: 0 },
  ];

  return (
    <>
      <CssDialog
        open={!!open}
        onOpenChange={onOpenChange}
        title="Focus Timer"
        footer={
          <div className="flex flex-wrap gap-2">
            {!running && (
              <button
                className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium px-4 py-2.5
                           shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                           hover:brightness-110 active:scale-[.99] transition disabled:opacity-60"
                disabled={!canStart}
                onClick={start}
              >
                Start{audioUnlocked ? "" : " ▶︎"}
              </button>
            )}
            {running && !paused && (
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
                onClick={pause}
              >
                Pause
              </button>
            )}
            {running && paused && (
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
                onClick={resume}
              >
                Resume
              </button>
            )}
            {(running || paused) && (
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-red-300 hover:bg-white/10 transition"
                onClick={stop}
              >
                Stop
              </button>
            )}
            {/* Always available: Reset (silences alarm & resets remaining) */}
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Big time display */}
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-semibold tracking-widest">
              {format(
                left > 0 ? left : (Number(mins) || 0) * 60 + (Number(secs) || 0)
              )}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {running ? (paused ? "Paused" : "Running") : "Ready"}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-400 to-cyan-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Inputs + presets */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Minutes</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                           placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20
                           disabled:opacity-60"
                value={mins}
                onChange={(e) => setMins(e.target.value)}
                disabled={running}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Seconds</label>
              <input
                type="number"
                min={0}
                max={59}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                           placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20
                           disabled:opacity-60"
                value={secs}
                onChange={(e) => setSecs(e.target.value)}
                disabled={running}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 transition
                           disabled:opacity-60"
                onClick={() => {
                  setMins(p.m);
                  setSecs(p.s);
                }}
                disabled={running}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </CssDialog>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        onError={(e) =>
          console.error("Alarm audio failed to load", { src: AUDIO_SRC, e })
        }
      />
    </>
  );
}
