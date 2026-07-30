import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AlertTriangle, BrainCircuit, Check, Clock3, LoaderCircle, Play, ShieldCheck, Sparkles, Square, Target } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { ToolSession } from "../types";

type TrackedTool = {
  name: string;
  examples: string;
  bestFor: string;
  caution: string;
};

type AiToolRecommendation = {
  toolName: string;
  toolType: string;
  why: string;
  setupSteps: string[];
  examplePrompt: string;
  verification: string;
};

type AiToolAdvice = {
  model: string;
  title: string;
  taskSummary: string;
  recommendedTools: AiToolRecommendation[];
  workflow: string[];
  dataProtection: string;
  timebox: string;
  wellbeingNote: string;
  safetyNote: string;
};

function isAiToolAdvice(value: unknown): value is AiToolAdvice {
  if (!value || typeof value !== "object") return false;
  const advice = value as Partial<AiToolAdvice>;
  const validTools = Array.isArray(advice.recommendedTools)
    && advice.recommendedTools.length > 0
    && advice.recommendedTools.every((tool) => (
      tool
      && typeof tool === "object"
      && typeof tool.toolName === "string"
      && typeof tool.toolType === "string"
      && typeof tool.why === "string"
      && Array.isArray(tool.setupSteps)
      && tool.setupSteps.every((step) => typeof step === "string")
      && typeof tool.examplePrompt === "string"
      && typeof tool.verification === "string"
    ));
  return typeof advice.title === "string"
    && typeof advice.taskSummary === "string"
    && typeof advice.model === "string"
    && validTools
    && Array.isArray(advice.workflow)
    && advice.workflow.every((step) => typeof step === "string")
    && typeof advice.dataProtection === "string"
    && typeof advice.timebox === "string"
    && typeof advice.wellbeingNote === "string"
    && typeof advice.safetyNote === "string";
}

async function functionErrorMessage(error: unknown) {
  const fallback = "Die KI-Tool-Vorschläge konnten nicht erstellt werden. Bitte versuche es später erneut.";
  if (!error || typeof error !== "object") return fallback;
  const context = (error as { context?: unknown }).context;
  if (!(context instanceof Response)) return fallback;
  try {
    const payload = await context.clone().json() as { error?: unknown; code?: unknown };
    if (payload.code === "OPENAI_NOT_CONFIGURED") {
      return "Der OpenAI-Schlüssel ist in Supabase noch nicht eingerichtet. Die App-Verantwortliche muss ihn einmalig hinterlegen.";
    }
    if (payload.code === "OPENAI_AUTH_FAILED") {
      return "Der hinterlegte OpenAI-Schlüssel wurde abgelehnt. Bitte die OpenAI-Einrichtung prüfen.";
    }
    if (payload.code === "OPENAI_RATE_LIMIT") {
      return "Das OpenAI-Nutzungslimit ist gerade erreicht. Bitte versuche es in einigen Minuten erneut.";
    }
    if (typeof payload.error === "string") return payload.error;
  } catch {
    return fallback;
  }
  return fallback;
}

function formatElapsed(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function mightContainSensitiveData(text: string) {
  return /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text)
    || /(?:\+?\d[\s()./-]*){8,}/.test(text)
    || /\b(?:iban|passwort|kennwort|api[- ]?key|zugangscode|personalnummer|kundennummer|patientenname|geburtsdatum|kontonummer|adresse\s*:)\b/i.test(text);
}

export function ToolNavigator({ demoMode, session, onSaved }: { demoMode: boolean; session: Session | null; onSaved: (item: ToolSession) => void }) {
  const [problem, setProblem] = useState("");
  const [selectedTool, setSelectedTool] = useState<TrackedTool | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [effectiveness, setEffectiveness] = useState(3);
  const [burden, setBurden] = useState(2);
  const [notes, setNotes] = useState("");
  const [aiConsent, setAiConsent] = useState(false);
 const [aiAdvice, setAiAdvice] = useState<AiToolAdvice | null>(() => {
  const savedAdvice = localStorage.getItem("toolNavigatorLastResult");

  if (!savedAdvice) {
    return null;
  }

  try {
    const parsedAdvice: unknown = JSON.parse(savedAdvice);
    return isAiToolAdvice(parsedAdvice) ? parsedAdvice : null;
  } catch {
    localStorage.removeItem("toolNavigatorLastResult");
    return null;
  }
});
  useEffect(() => {
  if (aiAdvice) {
    localStorage.setItem(
      "toolNavigatorLastResult",
      JSON.stringify(aiAdvice)
    );
  }
}, [aiAdvice]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const startedAt = useRef<string | null>(null);
  const sensitive = mightContainSensitiveData(problem);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active]);
  function startTracking(tool: TrackedTool) {
    setSelectedTool(tool);
    setElapsed(0);
    setRatingOpen(false);
    setActive(true);
    startedAt.current = new Date().toISOString();
  }

  function stopTracking() {
    setActive(false);
    setRatingOpen(true);
  }

  async function createAiAdvice() {
    if (!supabase || !session || demoMode || !aiConsent || sensitive) return;
    setAiLoading(true);
    setAiError("");
    setAiAdvice(null);
    try {
      const { data, error } = await supabase.functions.invoke("tool-navigator-advice", {
        body: { task: problem.trim() },
      });
      if (error) {
        setAiError(await functionErrorMessage(error));
      } else if (!isAiToolAdvice(data)) {
        setAiError("Das Sprachmodell hat kein gültiges Ergebnis geliefert. Bitte formuliere die Aufgabe etwas konkreter und versuche es erneut.");
      } else {
        setAiAdvice(data);
      }
    } catch {
      setAiError("Die Verbindung zur KI-Beratung ist fehlgeschlagen. Bitte prüfe deine Internetverbindung und versuche es erneut.");
    } finally {
      setAiLoading(false);
    }
  }

  function startAiToolTracking(tool: AiToolRecommendation) {
    startTracking({
      name: tool.toolName,
      examples: tool.toolType,
      bestFor: tool.why,
      caution: aiAdvice?.dataProtection ?? "Unternehmensfreigabe und Datenschutz prüfen.",
    });
  }

  async function saveSession() {
    if (!selectedTool || !startedAt.current) return;
    const endedAt = new Date().toISOString();
    const item: ToolSession = {
      id: crypto.randomUUID(), user_id: session?.user.id ?? "demo", tool_name: selectedTool.name,
      task: problem.slice(0, 500), started_at: startedAt.current, ended_at: endedAt,
      duration_minutes: Math.max(1, Math.round(elapsed / 60)), effectiveness, burden,
      notes: notes.trim() || null, created_at: endedAt,
    };
    if (demoMode) onSaved(item);
    else if (supabase && session) {
      const { data, error } = await supabase.from("tool_sessions").insert({
        user_id: session.user.id, tool_name: item.tool_name, task: item.task,
        started_at: item.started_at, ended_at: item.ended_at, duration_minutes: item.duration_minutes,
        effectiveness, burden, notes: item.notes,
      }).select().single();
      if (!error && data) onSaved(data as ToolSession);
    }
    setRatingOpen(false);
    setSelectedTool(null);
    setElapsed(0);
    setNotes("");
  }

  return (
    <div className="page-container navigator-page">
      <header className="page-heading">
        <span className="eyebrow">KI-Navigator</span>
        <h1>Erst das Problem. Dann das passende KI-Tool.</h1>
        <p>Beschreibe dein Arbeitsziel ohne Namen, personenbezogene Daten oder Geschäftsgeheimnisse. Die KI-Auswertung erstellt daraus konkrete Tool-Empfehlungen und einen passenden Arbeitsablauf.</p>
      </header>

      <section className="navigator-layout">
        <article className="card problem-card">
          <span className="soft-icon"><Target size={22}/></span><h2>Was möchtest du erreichen?</h2>
          <label className="input-group">Aufgabe oder Problem
            <textarea rows={7} maxLength={1000} value={problem} onChange={(event) => { setProblem(event.target.value);setAiConsent(false); setAiError(""); }} placeholder="Zum Beispiel: Ich möchte aus meinen eigenen Stichpunkten eine verständliche Präsentationsgliederung für mein Team entwickeln …"/>
            <small>{problem.length}/1000 Zeichen</small>
          </label>
          {sensitive && <div className="warning-inline"><AlertTriangle size={18}/><span>Der Text sieht nach Kontaktdaten, Zugangsdaten oder anderen sensiblen Angaben aus. Bitte anonymisiere ihn vor einer KI-Übertragung.</span></div>}

          <div className="ai-navigator-start">
            <div className="ai-output-label"><Sparkles size={16}/><strong>KI-Tools vorschlagen lassen</strong><span>OpenAI · strukturiertes Ergebnis</span></div>
            <p>Das Sprachmodell erstellt konkrete Arbeitsschritte, Tool-Kategorien, Beispiel-Prompts und Prüfschritte. Es führt keine Aufgabe aus und trifft keine Entscheidung für dich.</p>
            {!demoMode && session ? (
              <>
                <label className="consent-check ai-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)}/><span>Ich möchte diese Aufgabenbeschreibung einmalig zur KI-Auswertung übertragen. Ich habe Namen, personenbezogene Daten und Geschäftsgeheimnisse entfernt.</span></label>
                <button className="primary-button ai-suggestion-button" disabled={problem.trim().length < 15 || !aiConsent || sensitive || aiLoading} onClick={createAiAdvice}>
                  {aiLoading ? <LoaderCircle className="spin" size={18}/> : <Sparkles size={18}/>} {aiLoading ? "KI-Tools werden gesucht …" : "KI-Tools vorschlagen lassen"}
                </button>
              </>
            ) : (
              <p className="form-message">Die KI-Auswertung ist nach Anmeldung und Supabase-Einrichtung verfügbar.</p>
            )}
            {aiError && <div className="form-message error">{aiError}</div>}
          </div>
        </article>

        <aside className="card workflow-card">
          <span className="eyebrow">Gesunder KI-Workflow</span><h2>Vier klare Handlungsschritte</h2>
          <ol className="numbered-steps">
            <li><span>1</span><div><strong>Ziel definieren</strong><p>Ein Satz beschreibt das gewünschte Ergebnis.</p></div></li>
            <li><span>2</span><div><strong>Daten prüfen</strong><p>Nur freigegebene und notwendige Informationen verwenden.</p></div></li>
            <li><span>3</span><div><strong>Zeit begrenzen</strong><p>25 Minuten arbeiten, dann Ergebnis und Belastung prüfen.</p></div></li>
            <li><span>4</span><div><strong>Menschlich entscheiden</strong><p>Fakten prüfen und Verantwortung selbst übernehmen.</p></div></li>
          </ol>
        </aside>
      </section>

      {aiAdvice && (
        <section className="card ai-tool-advice">
          <div className="ai-card-header"><span className="ai-icon"><Sparkles size={23}/></span><div><span className="eyebrow">KI-generierte Tool-Anleitung · {aiAdvice.model} · menschlich prüfen</span><h2>{aiAdvice.title}</h2></div></div>
          <p className="ai-task-summary">{aiAdvice.taskSummary}</p>
          <div className="ai-workflow">
            <h3>Empfohlener Ablauf</h3>
            <ol>{aiAdvice.workflow.map((step) => <li key={step}>{step}</li>)}</ol>
          </div>
          <div className="ai-tool-grid">{aiAdvice.recommendedTools.map((tool) => (
            <article key={`${tool.toolName}-${tool.toolType}`}>
              <span className="tool-tag">{tool.toolType}</span>
              <h3>{tool.toolName}</h3>
              <p>{tool.why}</p>
              <h4>So gehst du vor</h4>
              <ol>{tool.setupSteps.map((step) => <li key={step}>{step}</li>)}</ol>
              <h4>Beispiel-Prompt</h4>
              <blockquote>{tool.examplePrompt}</blockquote>
              <p className="caution"><strong>Ergebnis prüfen:</strong> {tool.verification}</p>
              <button className="secondary-button" onClick={() => startAiToolTracking(tool)} disabled={active}><Play size={17}/> Nutzung starten</button>
            </article>
          ))}</div>
          <div className="ai-advice-guardrails">
            <p><ShieldCheck size={18}/><span><strong>Datenschutz:</strong> {aiAdvice.dataProtection}</span></p>
            <p><Clock3 size={18}/><span><strong>Zeitplan:</strong> {aiAdvice.timebox}</span></p>
            <p><BrainCircuit size={18}/><span><strong>Gesund arbeiten:</strong> {aiAdvice.wellbeingNote}</span></p>
          </div>
          <p className="caveat">{aiAdvice.safetyNote}</p>
        </section>
      )}

      {selectedTool && (
        <section className={active ? "active-session active" : "active-session"}>
          <Clock3 size={25}/><div><small>Zeiterfassung</small><strong>{selectedTool.name}</strong></div><span className="session-time">{formatElapsed(elapsed)}</span>
          {active && <button className="danger-button" onClick={stopTracking}><Square size={17}/> Nutzung beenden</button>}
        </section>
      )}

      {ratingOpen && (
        <section className="card effectiveness-check">
          <span className="eyebrow">Effektivitätscheck</span><h2>Was hat dir diese Nutzung gebracht?</h2>
          <div className="rating-grid">
            <Rating label="Nutzen / Effektivität" value={effectiveness} onChange={setEffectiveness}/>
            <Rating label="Mentale Belastung" value={burden} onChange={setBurden}/>
          </div>
          <label className="input-group">Kurze Notiz, optional<textarea rows={3} maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Was hat geholfen – und was würdest du beim nächsten Mal ändern?"/></label>
          <button className="primary-button" onClick={saveSession}><Check size={18}/> Nutzung speichern</button>
        </section>
      )}
    </div>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <fieldset className="rating-field"><legend>{label}</legend><div>{[1,2,3,4,5].map((number) => <button type="button" className={value === number ? "selected" : ""} onClick={() => onChange(number)} key={number}>{number}</button>)}</div><small>1 = sehr niedrig · 5 = sehr hoch</small></fieldset>;
}
