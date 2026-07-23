import { useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, ChevronDown, Compass, HeartPulse, Leaf, LoaderCircle, RotateCcw, ShieldCheck, Sparkles, Wind } from "lucide-react";
import { isCompassResult, type CompassResult, type InnerPart } from "../lib/compassResult";
import { supabase } from "../lib/supabase";
import type { SelfCheckAnswers, SelfCheckResult } from "../types";

type Question =
  | { id: string; type: "textarea"; title: string; label: string; placeholder: string; minLength: number }
  | { id: string; type: "scale"; title: string; label: string; left: string; right: string }
  | { id: string; type: "choice"; title: string; label: string; options: string[] };

const questions: Question[] = [
  {
    id: "overwhelm", type: "textarea", title: "Was überfordert dich gerade?",
    label: "Beschreibe die Situation so ehrlich und konkret, wie es gerade möglich ist.",
    placeholder: "Zum Beispiel: Ich verliere den Überblick über Tools, fühle mich abgehängt, vergleiche mich mit anderen oder weiß nicht, wo ich anfangen soll.", minLength: 18,
  },
  {
    id: "control", type: "scale", title: "Wie stark ist dein Bedürfnis, alles zu verstehen, bevor du losgehst?",
    label: "1 bedeutet entspannt ausprobieren, 5 bedeutet sehr hoher Anspruch an Kontrolle.", left: "Ausprobieren", right: "Kontrolle",
  },
  {
    id: "comparison", type: "scale", title: "Wie stark vergleichst du dich aktuell mit anderen?",
    label: "Bewerte, wie laut der innere Vergleich gerade ist.", left: "Kaum", right: "Sehr stark",
  },
  {
    id: "identity", type: "choice", title: "Was trifft innerlich am ehesten zu?",
    label: "Wähle den Satz, der sich am vertrautesten anfühlt.", options: [
      "Ich frage mich, ob meine eigene Stimme in der KI-Welt noch zählt.",
      "Ich habe Angst, fachlich oder beruflich den Anschluss zu verlieren.",
      "Ich möchte KI nutzen, ohne mich selbst zu optimieren oder zu verbiegen.",
      "Ich brauche vor allem eine klare Struktur, damit ich wieder handeln kann.",
    ],
  },
  {
    id: "body", type: "choice", title: "Wie zeigt sich die Überforderung im Körper oder Alltag?",
    label: "Wähle das stärkste Signal.", options: [
      "Unruhe, Druck oder Gedankenkreisen.", "Aufschieben, Müdigkeit oder Rückzug.",
      "Reizbarkeit, Ungeduld oder innere Härte.", "Zerstreuung durch zu viele Tabs, Tools und Impulse.",
    ],
  },
  {
    id: "values", type: "textarea", title: "Was möchtest du trotz KI auf keinen Fall verlieren?",
    label: "Nenne Werte, Qualitäten oder Arbeitsweisen, die dir wichtig sind.",
    placeholder: "Zum Beispiel: Ruhe, Tiefe, Kreativität, Menschlichkeit, Humor, eigene Entscheidungen.", minLength: 8,
  },
  {
    id: "support", type: "choice", title: "Welche Art von Unterstützung würde dir jetzt am meisten helfen?",
    label: "Dein Ergebnis leitet daraus einen konkreten nächsten Schritt ab.", options: [
      "Ein einfacher Plan mit kleinen nächsten Schritten.",
      "Eine emotionale Einordnung, warum mich das so trifft.",
      "Ein gesunder Umgang mit Tools, Tempo und Erwartungen.",
      "Mehr Mut, meine eigene Art in der digitalen Welt sichtbar zu halten.",
    ],
  },
];

function buildLocalResult(answers: SelfCheckAnswers): CompassResult {
  const control = Number(answers.control || 3);
  const comparison = Number(answers.comparison || 3);
  const identity = String(answers.identity || "");
  const support = String(answers.support || "");

  const parts: InnerPart[] = [
    {
      name: control >= 4 ? "Der Sicherheits-Anteil" : "Der Orientierungs-Anteil",
      score: Math.min(96, 48 + control * 10),
      need: control >= 4 ? "Er braucht überschaubare Grenzen und die Erlaubnis, nicht alles sofort zu verstehen." : "Er braucht eine einfache Reihenfolge statt noch mehr Optionen.",
      risk: "Ohne Struktur wird aus Interesse schnell Druck, und der Einstieg fühlt sich größer an, als er ist.",
      microAction: "Wähle für 20 Minuten nur ein KI-Tool und eine einzige Frage.",
    },
    {
      name: comparison >= 4 ? "Der Vergleichs-Anteil" : "Der Selbstvertrauens-Anteil",
      score: Math.min(94, 44 + comparison * 10),
      need: "Er braucht den Blick zurück auf deine eigene Lernkurve, nicht auf die Geschwindigkeit anderer.",
      risk: "Wenn er übergangen wird, kann KI wie ein permanenter Leistungstest wirken.",
      microAction: "Notiere drei Dinge, die du ohne KI gut kannst und mit KI nicht verlieren willst.",
    },
    {
      name: identity.includes("Stimme") || identity.includes("verbiegen") ? "Der Authentizitäts-Anteil" : "Der Handlungs-Anteil",
      score: 78,
      need: "Er braucht eine persönliche Nutzungsregel, die zu deinen Werten passt.",
      risk: "Sonst bestimmt nicht dein Ziel das Tempo, sondern die nächste Tool-Neuigkeit.",
      microAction: "Formuliere einen Satz: Ich nutze KI, um …, aber nicht, um …",
    },
  ];

  const supportOpening = support.startsWith("Eine emotionale")
    ? "Dein Erleben verdient zuerst Einordnung und Entlastung, bevor du den nächsten technischen Schritt gehst."
    : support.startsWith("Mehr Mut")
      ? "Deine eigene Art ist keine Schwäche im digitalen Wandel, sondern dein Orientierungspunkt."
      : "Ein kleiner, überprüfbarer Schritt ist jetzt hilfreicher als noch mehr Information.";

  return {
    title: "Dein innerer Kompass braucht Klarheit vor Tempo",
    summary: `Deine Antworten zeigen, dass die Überforderung weniger an fehlender Fähigkeit liegt als an vielen gleichzeitigen Erwartungen. ${supportOpening}`,
    parts,
    solution: "Reduziere KI für eine Woche auf einen klaren Anwendungsfall, der dir wirklich dient. Lege vorher fest, woran du merkst, dass du noch bei dir bist: ruhiger Körper, eigene Sprache und eine klare Entscheidung. Nutze KI nicht als Richter über deine Kompetenz, sondern als Werkzeug für Entlastung. Halte nach jeder Nutzung in einem Satz fest, was von dir kam und was die Maschine beigetragen hat.",
    plan: [
      "Tag 1: Einen einzigen KI-Bereich auswählen, der dich entlasten soll.",
      "Tag 2: Eine persönliche Nutzungsgrenze formulieren.",
      "Tag 3: 20 Minuten mit einem Tool testen, danach stoppen.",
      "Tag 4: Drei eigene Stärken notieren, die unabhängig von KI bleiben.",
      "Tag 5: Einen Prompt schreiben, der deine Werte ausdrücklich berücksichtigt.",
      "Tag 6: Eine digitale Pause einplanen und körperlich herunterregulieren.",
      "Tag 7: Prüfen, was geholfen hat und was du weglässt.",
    ],
    authenticity: "Authentisch bleibst du, wenn KI deine Handlungsfähigkeit erweitert, aber nicht deine innere Autorität ersetzt. Du darfst langsam, wählerisch und trotzdem modern sein.",
    safetyNote: "Diese regelbasierte Reflexion ist keine Diagnose und ersetzt keine medizinische oder psychologische Beratung.",
  };
}

export function SelfCheck({ demoMode, session, onSaved }: { demoMode: boolean; session: Session | null; onSaved: (item: SelfCheckResult) => void }) {
  const [stage, setStage] = useState<"intro" | "test" | "loading" | "result">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SelfCheckAnswers>({});
  const [result, setResult] = useState<CompassResult | null>(null);
  const [useAi, setUseAi] = useState(false);
  const [resultSource, setResultSource] = useState<"local" | "ai">("local");
  const [resultNotice, setResultNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const question = questions[step];
  const progress = Math.round(((step + 1) / questions.length) * 100);
  const currentValue = answers[question.id] ?? "";
  const valid = useMemo(() => {
    if (question.type === "textarea") return String(currentValue).trim().length >= question.minLength;
    return currentValue !== "";
  }, [currentValue, question]);

  function update(value: string | number) {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  }

  async function next() {
    if (!valid) return;
    if (step < questions.length - 1) {
      setStep((value) => value + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    let compass = buildLocalResult(answers);
    setStage("loading");
    setSaving(true);
    setResultNotice("");
    if (useAi && !demoMode && supabase && session) {
      const { data, error } = await supabase.functions.invoke("overwhelm-compass", { body: { answers } });
      if (!error && isCompassResult(data)) {
        compass = data;
        setResultSource("ai");
      } else {
        setResultSource("local");
        setResultNotice("Die optionale KI-Vertiefung war nicht erreichbar oder nicht verlässlich formatiert. Deshalb siehst du die geprüfte lokale Auswertung.");
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setResultSource("local");
      if (useAi && demoMode) setResultNotice("Im Demo-Modus wird keine externe KI aufgerufen. Du siehst die lokale Originalauswertung.");
    }
    const control = Number(answers.control || 3);
    const comparison = Number(answers.comparison || 3);
    const score = Math.round(((control + comparison - 2) / 8) * 30);
    const now = new Date().toISOString();
    const item: SelfCheckResult = { id: crypto.randomUUID(), user_id: session?.user.id ?? "demo", score, answers, created_at: now };
    if (demoMode) onSaved(item);
    else if (supabase && session) {
      const { data, error } = await supabase.from("self_checks").insert({ user_id: session.user.id, score, answers }).select().single();
      if (!error && data) onSaved(data as SelfCheckResult);
    }
    setResult(compass);
    setSaving(false);
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setStep(0); setAnswers({}); setResult(null); setUseAi(false); setResultNotice(""); setStage("intro");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page-container selfcheck-page">
      {stage === "intro" && (
        <section className="compass-intro">
          <div className="compass-intro-copy">
            <span className="eyebrow">Persönlichkeits-Test für digitale Überforderung</span>
            <h1>Finde heraus, welcher innere Anteil gerade von KI überfordert ist.</h1>
            <p>Beschreibe kurz, was dich aktuell belastet. Danach führt dich der Kompass durch einen ruhigen, mehrstufigen Test und erstellt eine klare Reflexion mit konkreten nächsten Schritten.</p>
            <div className="intro-trust"><span><ShieldCheck size={17}/> Ohne Diagnose</span><span><Compass size={17}/> 7 ruhige Schritte</span><span><Leaf size={17}/> Lokale Auswertung möglich</span></div>
            <button className="primary-button" onClick={() => setStage("test")}>Test starten <ArrowRight size={18}/></button>
          </div>
          <div className="signal-board" aria-label="Auswertungsbereiche">
            <div><span className="signal-dot focus"/><strong>Orientierung</strong><p>Was gerade unklar wirkt.</p></div>
            <div><span className="signal-dot self"/><strong>Selbstkontakt</strong><p>Was dich innerlich stabilisiert.</p></div>
            <div><span className="signal-dot action"/><strong>Handlung</strong><p>Was als nächster Schritt passt.</p></div>
          </div>
        </section>
      )}

      {stage === "test" && (
        <>
          <header className="page-heading">
            <span className="eyebrow">Originaltest · Persönlichkeits-Test für digitale Überforderung</span>
            <h1>Dein KI-Kompass</h1>
            <p>Ein geführter Selbstcheck zu Kontrolle, Vergleich, Identität, Körpersignalen und persönlichen Werten. Die Auswertung arbeitet lokal nach festen Regeln – ohne Emotionserkennung und ohne Diagnose.</p>
          </header>
          <section className="card compass-test">
            <div className="compass-progress"><div><span>Schritt {step + 1} von {questions.length}</span><strong>{progress}%</strong></div><div><span style={{ width: `${progress}%` }}/></div></div>
            <div className="compass-question">
              <span className="soft-icon"><Brain size={22}/></span><h2>{question.title}</h2><p>{question.label}</p>
              {question.type === "textarea" && <label className="input-group"><span className="sr-only">{question.title}</span><textarea rows={6} value={String(currentValue)} onChange={(event) => update(event.target.value)} placeholder={question.placeholder} maxLength={1200}/><small>{String(currentValue).length}/1200 Zeichen · mindestens {question.minLength}</small></label>}
              {question.type === "scale" && <div className="compass-scale" role="radiogroup" aria-label={question.title}>{[1,2,3,4,5].map((value) => <button type="button" key={value} className={Number(currentValue) === value ? "selected" : ""} onClick={() => update(value)} aria-pressed={Number(currentValue) === value}><strong>{value}</strong><small>{value === 1 ? question.left : value === 5 ? question.right : ""}</small></button>)}</div>}
              {question.type === "choice" && <div className="compass-choices" role="radiogroup" aria-label={question.title}>{question.options.map((option) => <button type="button" key={option} className={currentValue === option ? "selected" : ""} onClick={() => update(option)} aria-pressed={currentValue === option}><span>{currentValue === option ? <CheckCircle2 size={19}/> : <span className="empty-radio"/>}</span>{option}</button>)}</div>}
              {step === questions.length - 1 && <label className="consent-check compass-ai-choice"><input type="checkbox" checked={useAi} onChange={(event) => setUseAi(event.target.checked)}/><span><strong>Optionale KI-Vertiefung</strong> Nach deiner ausdrücklichen Auswahl werden deine sieben Antworten – einschließlich der beiden Freitexte – einmalig über die geschützte Supabase-Funktion an das Sprachmodell übertragen. Ohne Häkchen bleibt die Auswertung vollständig lokal.</span></label>}
            </div>
            <div className="compass-navigation"><button className="secondary-button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}><ArrowLeft size={18}/> Zurück</button><button className="primary-button" disabled={!valid || saving} onClick={next}>{step === questions.length - 1 ? "Auswertung erstellen" : "Weiter"}<ArrowRight size={18}/></button></div>
          </section>
          <p className="test-disclaimer">Dieser Selbstcheck dient der persönlichen Reflexion. Er ist kein wissenschaftlich validiertes Testverfahren und ersetzt keine medizinische oder psychologische Beratung.</p>
        </>
      )}

      {stage === "loading" && (
        <section className="card compass-loading" role="status" aria-live="polite">
          <div className="compass-pulse"><LoaderCircle className="spin" size={28}/></div><span className="eyebrow">Auswertung läuft</span><h1>Dein KI-Kompass sortiert gerade die Signale.</h1><p>Die Auswertung verbindet deine Antworten mit konkreten Lösungsimpulsen für mehr innere Klarheit in der digitalen Welt.</p>
        </section>
      )}

      {stage === "result" && result && (
        <>
          <header className="page-heading"><span className="eyebrow">Dein Reflexionsprofil · {resultSource === "ai" ? "KI-generiert" : "lokal regelbasiert"}</span><h1>{result.title}</h1><p>{result.summary}</p></header>
          {resultNotice && <div className="form-message">{resultNotice}</div>}
          {resultSource === "ai" && <div className="ai-output-label"><Sparkles size={16}/><strong>KI-generierte Vertiefung</strong><span>Automatisch erstellt · von dir zu prüfen</span></div>}
          <section className="compass-parts">{result.parts.map((part) => <article className="card compass-part" key={part.name}><div className="part-score"><span>{part.score}</span><small>Orientierungswert</small></div><h2>{part.name}</h2><p><strong>Was dieser Anteil braucht:</strong> {part.need}</p><p><strong>Worauf du achten kannst:</strong> {part.risk}</p><div className="micro-action"><Sparkles size={17}/><span><strong>Dein Mikroschritt</strong>{part.microAction}</span></div></article>)}</section>
          <section className="card compass-solution"><span className="eyebrow">Konkreter Lösungsweg</span><h2>Weniger Tempo, mehr eigene Führung</h2><p>{result.solution}</p><div className="values-anchor"><strong>Dein persönlicher Werteanker</strong><p>„{String(answers.values)}“</p></div></section>
          <section className="card seven-day-plan"><div><span className="eyebrow">7-Tage-Plan</span><h2>Vom Druck zurück in die Handlung</h2></div><ol>{result.plan.map((item) => <li key={item}>{item}</li>)}</ol></section>
          <section className="authenticity-card"><Leaf size={25}/><div><h2>Deine Authentizitäts-Regel</h2><p>{result.authenticity}</p></div></section>
          <p className="test-disclaimer">{result.safetyNote}</p>
          <button className="secondary-button restart-test" onClick={restart}><RotateCcw size={18}/> Test erneut durchführen</button>
        </>
      )}

      {(stage === "intro" || stage === "result") && <section className="support-grid">
        <Exercise icon={HeartPulse} title="90-Sekunden-Emotionscheck" steps={["Was spüre ich gerade im Körper?", "Welche Emotion ist am stärksten?", "Was brauche ich für den nächsten kleinen Schritt?"]}/>
        <Exercise icon={Wind} title="Zwei Minuten 4–6-Atmung" steps={["Beide Füße aufstellen.", "Vier Sekunden ruhig einatmen.", "Sechs Sekunden ausatmen – sechs Runden."]}/>
        <Exercise icon={Leaf} title="Drei Minuten Mini-Meditation" steps={["Blick senken und Geräusche wahrnehmen.", "Drei Atemzüge nur beobachten.", "Aufmerksamkeit freundlich zur Aufgabe zurückbringen."]}/>
      </section>}
    </div>
  );
}

function Exercise({ icon: Icon, title, steps }: { icon: typeof Leaf; title: string; steps: string[] }) {
  return <details className="card exercise-card"><summary><span className="soft-icon"><Icon size={21}/></span><strong>{title}</strong><ChevronDown size={18}/></summary><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol></details>;
}
