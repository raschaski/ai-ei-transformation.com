import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { BellRing, Droplets, Footprints, Pause, Play, RotateCcw, Volume2, Wind } from "lucide-react";
import { supabase } from "../lib/supabase";
import { secondsRemainingUntil, type FocusTimerPhase } from "../lib/focusTimer";
import type { FocusSession } from "../types";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const TIMER_STORAGE_KEY = "mindful-ai-focus-timer";
let chimeAudioContext: AudioContext | null = null;

const breakIdeas = [
  { title: "Wasser trinken", text: "Steh auf, trink ein Glas Wasser und schau dabei kurz in die Ferne.", icon: Droplets },
  { title: "4–6-Atmung", text: "Atme 4 Sekunden ein und 6 Sekunden aus – sechs ruhige Runden lang.", icon: Wind },
  { title: "Bewegung aktivieren", text: "Kreise Schultern und Handgelenke, dann gehe 60 Sekunden durch den Raum.", icon: Footprints },
  { title: "Augen entlasten", text: "Blicke für 20 Sekunden auf einen weit entfernten Punkt und blinzle bewusst.", icon: BellRing },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

async function prepareDreamChime() {
  chimeAudioContext ??= new AudioContext();
  if (chimeAudioContext.state === "suspended") await chimeAudioContext.resume();
  return chimeAudioContext;
}

async function playDreamChime() {
  try {
    const context = await prepareDreamChime();
    const now = context.currentTime + 0.04;
    const master = context.createGain();
    master.gain.setValueAtTime(0.42, now);
    master.connect(context.destination);

    const notes = [
      { frequency: 523.25, delay: 0, duration: 3.4, pan: -0.18 },
      { frequency: 659.25, delay: 0.48, duration: 3.7, pan: 0.14 },
      { frequency: 783.99, delay: 1.02, duration: 4, pan: -0.08 },
      { frequency: 1046.5, delay: 1.72, duration: 4.6, pan: 0.1 },
    ];

    for (const note of notes) {
      const start = now + note.delay;
      const stop = start + note.duration;
      const noteGain = context.createGain();
      const panner = context.createStereoPanner();
      panner.pan.setValueAtTime(note.pan, start);
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.exponentialRampToValueAtTime(0.24, start + 0.045);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, stop);
      noteGain.connect(panner);
      panner.connect(master);

      const fundamental = context.createOscillator();
      fundamental.type = "sine";
      fundamental.frequency.setValueAtTime(note.frequency, start);
      fundamental.connect(noteGain);
      fundamental.start(start);
      fundamental.stop(stop);

      const shimmer = context.createOscillator();
      const shimmerGain = context.createGain();
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(note.frequency * 2.01, start);
      shimmerGain.gain.setValueAtTime(0.0001, start);
      shimmerGain.gain.exponentialRampToValueAtTime(0.055, start + 0.025);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration * 0.72);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(panner);
      shimmer.start(start);
      shimmer.stop(stop);
    }
  } catch {
    // Manche Geräte blockieren Ton im Hintergrund. Die sichtbare Erinnerung
    // und die optionale Vibration bleiben in diesem Fall weiterhin aktiv.
  }
}

type StoredTimer = {
  phase: FocusTimerPhase;
  remaining: number;
  running: boolean;
  endAt: number | null;
  startedAt: string | null;
  finished: boolean;
  ideaIndex: number;
};

function initialTimer(): StoredTimer {
  const fallback: StoredTimer = {
    phase: "focus",
    remaining: FOCUS_SECONDS,
    running: false,
    endAt: null,
    startedAt: null,
    finished: false,
    ideaIndex: 0,
  };

  try {
    const stored = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY) ?? "null") as Partial<StoredTimer> | null;
    if (!stored || (stored.phase !== "focus" && stored.phase !== "break")) return fallback;
    const total = stored.phase === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
    const running = stored.running === true && typeof stored.endAt === "number";
    const storedRemaining = typeof stored.remaining === "number" ? stored.remaining : total;
    const remaining = running
      ? secondsRemainingUntil(stored.endAt!)
      : Math.min(total, Math.max(0, storedRemaining));
    return {
      phase: stored.phase,
      remaining,
      running,
      endAt: running ? stored.endAt! : null,
      startedAt: typeof stored.startedAt === "string" ? stored.startedAt : null,
      finished: remaining === 0 ? true : stored.finished === true,
      ideaIndex: Number.isInteger(stored.ideaIndex) ? Math.max(0, stored.ideaIndex!) : 0,
    };
  } catch {
    return fallback;
  }
}

export function FocusTimer({ demoMode, session, onSaved }: { demoMode: boolean; session: Session | null; onSaved: (item: FocusSession) => void }) {
  const restored = useMemo(initialTimer, []);
  const [phase, setPhase] = useState<FocusTimerPhase>(restored.phase);
  const [remaining, setRemaining] = useState(restored.remaining);
  const [running, setRunning] = useState(restored.running);
  const [endAt, setEndAt] = useState<number | null>(restored.endAt);
  const [finished, setFinished] = useState(restored.finished);
  const [ideaIndex, setIdeaIndex] = useState(restored.ideaIndex);
  const [startedAt, setStartedAt] = useState<string | null>(restored.startedAt);
  const completionHandled = useRef(false);
  const idea = breakIdeas[ideaIndex % breakIdeas.length];
  const circumference = 2 * Math.PI * 116;
  const total = phase === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const offset = circumference * (1 - remaining / total);

  useEffect(() => {
    if (!running || !endAt) return;
    const syncTime = () => setRemaining(secondsRemainingUntil(endAt));
    syncTime();
    const timer = window.setInterval(syncTime, 500);
    document.addEventListener("visibilitychange", syncTime);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncTime);
    };
  }, [running, endAt]);

  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      phase, remaining, running, endAt, startedAt, finished, ideaIndex,
    } satisfies StoredTimer));
  }, [phase, remaining, running, endAt, startedAt, finished, ideaIndex]);

  useEffect(() => {
    document.title = running ? `${formatTime(remaining)} · ${phase === "focus" ? "Fokus" : "Pause"}` : "Mindful AI";
    if (remaining !== 0 || !running) return;
    if (completionHandled.current) return;
    completionHandled.current = true;
    setRunning(false);
    setEndAt(null);
    setFinished(true);
    if ("vibrate" in navigator) navigator.vibrate([180, 80, 180]);
    void playDreamChime();
    if (phase === "focus") {
      void saveFocusSession();
    }
  }, [remaining, running, phase]);

  useEffect(() => () => { document.title = "Mindful AI"; }, []);

  async function saveFocusSession() {
    const end = new Date().toISOString();
    const item: FocusSession = {
      id: crypto.randomUUID(), user_id: session?.user.id ?? "demo", started_at: startedAt ?? end,
      ended_at: end, duration_minutes: 25, break_activity: idea.title, completed: true, created_at: end,
    };
    if (demoMode) {
      onSaved(item);
      return;
    }
    if (!supabase || !session) return;
    const { data, error } = await supabase.from("focus_sessions").insert({
      user_id: session.user.id, started_at: item.started_at, ended_at: item.ended_at,
      duration_minutes: 25, break_activity: idea.title, completed: true,
    }).select().single();
    if (!error && data) onSaved(data as FocusSession);
  }

  function toggle() {
    if (running) {
      setRemaining(endAt ? secondsRemainingUntil(endAt) : remaining);
      setEndAt(null);
      setRunning(false);
      return;
    }

    const nextRemaining = remaining === 0 ? total : remaining;
    if (phase === "focus" && (!startedAt || remaining === 0)) setStartedAt(new Date().toISOString());
    void prepareDreamChime();
    completionHandled.current = false;
    setFinished(false);
    setRemaining(nextRemaining);
    setEndAt(Date.now() + nextRemaining * 1000);
    setRunning(true);
  }

  function reset(nextPhase = phase) {
    setRunning(false);
    setEndAt(null);
    setFinished(false);
    completionHandled.current = false;
    setPhase(nextPhase);
    setRemaining(nextPhase === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
    if (nextPhase === "focus") setStartedAt(null);
  }

  function switchPhase(nextPhase: FocusTimerPhase) {
    if (nextPhase === "break") setIdeaIndex((value) => value + 1);
    reset(nextPhase);
  }

  const status = useMemo(() => phase === "focus" ? "Eine Aufgabe. Ein KI-Tool. Keine Nebenfenster." : idea.text, [phase, idea.text]);

  return (
    <div className="page-container focus-page">
      <header className="page-heading">
        <span className="eyebrow">25 Minuten, die dir gehören</span>
        <h1>Fokus mit gesunder Pause</h1>
        <p>Der Timer strukturiert deine KI-Arbeit. Nach 25 Minuten Fokus und nach 5 Minuten Pause erinnert er dich mit einem sanften, traumhaften Klang, sichtbar und – sofern dein Gerät das unterstützt – per Vibration an den nächsten Schritt.</p>
      </header>

      <section className="timer-layout">
        <article className="card timer-card">
          <div className="timer-tabs" role="tablist" aria-label="Timerphase">
            <button className={phase === "focus" ? "active" : ""} onClick={() => switchPhase("focus")}>25 Min. Fokus</button>
            <button className={phase === "break" ? "active" : ""} onClick={() => switchPhase("break")}>5 Min. Pause</button>
          </div>
          <div className="timer-ring">
            <svg viewBox="0 0 260 260" aria-hidden="true"><circle className="timer-track" cx="130" cy="130" r="116"/><circle className="timer-progress" cx="130" cy="130" r="116" strokeDasharray={circumference} strokeDashoffset={offset}/></svg>
            <div><span>{phase === "focus" ? "Fokus" : "Pause"}</span><strong>{formatTime(remaining)}</strong><small>{running ? "läuft" : finished ? "beendet" : "bereit"}</small></div>
          </div>
          <p className="timer-status">{status}</p>
          <div className="timer-actions">
            <button className="primary-button" onClick={toggle}>{running ? <Pause size={19}/> : <Play size={19}/>} {running ? "Pausieren" : "Starten"}</button>
            <button className="secondary-button" onClick={() => reset()}><RotateCcw size={18}/> Zurücksetzen</button>
            <button className="secondary-button" onClick={() => void playDreamChime()}><Volume2 size={18}/> Klang testen</button>
          </div>
        </article>

        <aside className="card break-card">
          <span className="soft-icon"><idea.icon size={22}/></span>
          <span className="eyebrow">Nächste Mikro-Pause</span>
          <h2>{idea.title}</h2>
          <p>{idea.text}</p>
          <button className="text-link" onClick={() => setIdeaIndex((value) => value + 1)}>Anderen Pausenimpuls wählen</button>
          <div className="pause-rule"><strong>Gesunde Arbeitsregel</strong><p>Nach vier Fokusphasen: 15–30 Minuten ohne Bildschirm einplanen.</p></div>
        </aside>
      </section>

      {finished && (
        <section className="completion-banner" role="alert">
          <BellRing size={28}/><div><strong>{phase === "focus" ? "Fokuseinheit geschafft – jetzt bewusst unterbrechen." : "Pause beendet – starte ruhig in die nächste Aufgabe."}</strong><p>{phase === "focus" ? idea.text : "Formuliere vor dem Start in einem Satz, was am Ende fertig sein soll."}</p></div>
          <button className="primary-button" onClick={() => switchPhase(phase === "focus" ? "break" : "focus")}>{phase === "focus" ? "Pause starten" : "Fokus starten"}</button>
        </section>
      )}
    </div>
  );
}
