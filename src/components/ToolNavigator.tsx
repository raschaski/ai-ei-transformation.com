import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AlertTriangle, BrainCircuit, Check, Clock3, Play, ShieldCheck, Square, Target } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { ToolSession } from "../types";

type ToolCategory = {
  name: string;
  examples: string;
  bestFor: string;
  caution: string;
};

const catalog: Record<string, ToolCategory[]> = {
  research: [
    { name: "Rechercheassistent mit Quellen", examples: "z. B. Perplexity oder ChatGPT Search", bestFor: "Einstieg, Quellen finden und Positionen vergleichen", caution: "Originalquellen öffnen und Datum, Autor und Aussage prüfen." },
    { name: "Dokumentenassistent", examples: "z. B. NotebookLM", bestFor: "Eigene freigegebene Unterlagen zusammenfassen und befragen", caution: "Nur intern freigegebene Dokumente hochladen." },
  ],
  writing: [
    { name: "Schreib- und Dialogassistent", examples: "z. B. ChatGPT, Claude oder Gemini", bestFor: "Gliederungen, Varianten, verständliche Formulierungen", caution: "Fakten, Tonalität und sensible Inhalte selbst prüfen." },
    { name: "Office-Assistent", examples: "z. B. Microsoft 365 Copilot", bestFor: "Entwürfe direkt im freigegebenen Unternehmens-Workflow", caution: "Berechtigungen und Unternehmensrichtlinie beachten." },
  ],
  data: [
    { name: "Datenanalyse-Assistent", examples: "z. B. ChatGPT Datenanalyse oder Copilot in Excel", bestFor: "Tabellen erklären, Diagramme vorbereiten, Formeln entwerfen", caution: "Keine Personen- oder Geschäftsdaten ohne Freigabe hochladen." },
    { name: "Tabellenassistent", examples: "z. B. Gemini in Workspace oder Copilot in Excel", bestFor: "Formeln, Bereinigung und erste Muster", caution: "Ergebnisse mit Stichproben und Summen kontrollieren." },
  ],
  coding: [
    { name: "Programmierassistent", examples: "z. B. GitHub Copilot oder ChatGPT", bestFor: "Codevorschläge, Tests, Erklärungen und Fehlersuche", caution: "Keine Geheimnisse einfügen; Code reviewen und testen." },
    { name: "Code-Dialogassistent", examples: "z. B. Claude oder Gemini", bestFor: "Architektur vergleichen und komplexe Stellen erklären", caution: "Lizenz-, Sicherheits- und Abhängigkeitsfragen prüfen." },
  ],
  meeting: [
    { name: "Meetingassistent", examples: "z. B. Teams Copilot oder Zoom AI Companion", bestFor: "Zusammenfassungen und Aufgabenlisten", caution: "Teilnehmende informieren, Einwilligung und Betriebsrat klären." },
    { name: "Schreibassistent", examples: "z. B. ChatGPT oder Claude", bestFor: "Aus freigegebenen Stichpunkten ein Protokoll formulieren", caution: "Keine vertraulichen Gesprächsinhalte in private Konten kopieren." },
  ],
  creative: [
    { name: "Design- und Bildassistent", examples: "z. B. Canva Magic Studio oder Adobe Firefly", bestFor: "Ideen, Layoutvarianten und Bildentwürfe", caution: "Markenrechte, Bildrechte und Kennzeichnung prüfen." },
    { name: "Dialogassistent", examples: "z. B. ChatGPT, Claude oder Gemini", bestFor: "Briefings, Zielgruppen und kreative Richtungen", caution: "Markenstimme und Originalität menschlich verantworten." },
  ],
};

function classify(text: string) {
  const normalized = text.toLowerCase();
  if (/code|programm|software|fehler|bug|entwick/.test(normalized)) return "coding";
  if (/excel|tabelle|daten|zahlen|analyse|diagramm/.test(normalized)) return "data";
  if (/meeting|besprech|protokoll|interview|transkript/.test(normalized)) return "meeting";
  if (/bild|design|grafik|logo|video|kreativ/.test(normalized)) return "creative";
  if (/recherch|quelle|wissen|vergleich|finden/.test(normalized)) return "research";
  return "writing";
}

function formatElapsed(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function ToolNavigator({ demoMode, session, onSaved }: { demoMode: boolean; session: Session | null; onSaved: (item: ToolSession) => void }) {
  const [problem, setProblem] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolCategory | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [effectiveness, setEffectiveness] = useState(3);
  const [burden, setBurden] = useState(2);
  const [notes, setNotes] = useState("");
  const startedAt = useRef<string | null>(null);
  const category = useMemo(() => classify(problem), [problem]);
  const recommendations = catalog[category];
  const sensitive = /name|kund|patient|personal|geheim|vertraulich|adresse|telefon|mail|gesund|krank|diagnos|vertrag|umsatz/i.test(problem);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  function startTracking(tool: ToolCategory) {
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
        <h1>Erst das Problem. Dann das Tool.</h1>
        <p>Beschreibe dein Arbeitsziel ohne Namen, personenbezogene Daten oder Geschäftsgeheimnisse. Die Einordnung geschieht lokal nach festen Stichwortregeln – ohne Sprachmodell und ohne automatische Entscheidung.</p>
      </header>

      <section className="navigator-layout">
        <article className="card problem-card">
          <span className="soft-icon"><Target size={22}/></span><h2>Was möchtest du erreichen?</h2>
          <label className="input-group">Aufgabe oder Problem
            <textarea rows={7} maxLength={1000} value={problem} onChange={(event) => { setProblem(event.target.value); setAnalyzed(false); }} placeholder="Zum Beispiel: Ich möchte aus meinen eigenen Stichpunkten eine verständliche Präsentationsgliederung für mein Team entwickeln …"/>
            <small>{problem.length}/1000 Zeichen</small>
          </label>
          {sensitive && <div className="warning-inline"><AlertTriangle size={18}/><span>Dein Text könnte sensible Angaben enthalten. Bitte anonymisiere ihn, bevor du Inhalte in ein externes KI-Tool übernimmst.</span></div>}
          <button className="primary-button" disabled={problem.trim().length < 15} onClick={() => setAnalyzed(true)}><BrainCircuit size={19}/> Lokal einordnen</button>
          <p className="local-note"><ShieldCheck size={16}/> Regelbasiert, keine KI: Dieser Text wird nicht an ein Sprachmodell übertragen. Du wählst das Werkzeug selbst.</p>
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

      {analyzed && (
        <section className="recommendations-section">
          <div className="section-heading"><div><span className="eyebrow">Passende Werkzeugtypen</span><h2>Für diese Aufgabe sinnvoll</h2></div><p>Produktbeispiele sind Orientierung, keine Werbung oder automatische Freigabe für Unternehmensdaten.</p></div>
          <div className="recommendation-grid">{recommendations.map((tool) => (
            <article className="card recommendation-card" key={tool.name}>
              <span className="tool-tag">{tool.examples}</span><h3>{tool.name}</h3><p><strong>Geeignet:</strong> {tool.bestFor}</p><p className="caution"><strong>Prüfen:</strong> {tool.caution}</p>
              <button className="secondary-button" onClick={() => startTracking(tool)} disabled={active}><Play size={17}/> Nutzung starten</button>
            </article>
          ))}</div>
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
