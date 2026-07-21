import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  BarChart3,
  Brain,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  Heart,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircleHeart,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AiActView, CompanyView, ImprintView, PrivacyView } from "./components/CompanyAndLegal";
import { FocusTimer } from "./components/FocusTimer";
import { SelfCheck } from "./components/SelfCheck";
import { ToolNavigator } from "./components/ToolNavigator";
import { createLocalInsight } from "./lib/analytics";
import { getAuthRedirectUrl, isSupabaseConfigured, supabase } from "./lib/supabase";
import type { AiEffect, AiPurpose, AiReflection, CheckIn, CheckInInput, FocusSession, SelfCheckResult, ToolSession } from "./types";

type View = "overview" | "checkin" | "focus" | "selfcheck" | "navigator" | "trends" | "data" | "company" | "ai-act" | "imprint" | "privacy";

const today = new Date().toISOString().slice(0, 10);

const emptyCheckIn: CheckInInput = {
  entry_date: today,
  mood: 3,
  stress: 3,
  loneliness: 2,
  sleep: 3,
  ai_minutes: 30,
  ai_purpose: "lernen",
  ai_effect: "neutral",
  note: "",
};

const demoCheckIns: CheckIn[] = [
  ["2026-07-15", 4, 2, 2, 4, 35, "lernen", "hilfreich"],
  ["2026-07-16", 3, 3, 2, 3, 75, "arbeit", "neutral"],
  ["2026-07-17", 2, 4, 3, 2, 140, "unterhaltung", "belastend"],
  ["2026-07-18", 3, 3, 3, 3, 95, "emotionale_unterstuetzung", "neutral"],
  ["2026-07-19", 4, 2, 2, 4, 45, "lernen", "hilfreich"],
  ["2026-07-20", 3, 4, 2, 2, 120, "arbeit", "belastend"],
].map(([date, mood, stress, loneliness, sleep, minutes, purpose, effect], index) => ({
  id: `demo-${index}`,
  user_id: "demo",
  entry_date: date as string,
  created_at: `${date}T18:00:00.000Z`,
  mood: mood as number,
  stress: stress as number,
  loneliness: loneliness as number,
  sleep: sleep as number,
  ai_minutes: minutes as number,
  ai_purpose: purpose as AiPurpose,
  ai_effect: effect as AiEffect,
  note: null,
}));

const demoToolSessions: ToolSession[] = [
  { id: "tool-1", user_id: "demo", tool_name: "Schreib- und Dialogassistent", task: "Gliederung erstellen", started_at: "2026-07-18T09:00:00Z", ended_at: "2026-07-18T09:32:00Z", duration_minutes: 32, effectiveness: 4, burden: 2, notes: null, created_at: "2026-07-18T09:32:00Z" },
  { id: "tool-2", user_id: "demo", tool_name: "Rechercheassistent mit Quellen", task: "Marktüberblick", started_at: "2026-07-19T12:00:00Z", ended_at: "2026-07-19T12:48:00Z", duration_minutes: 48, effectiveness: 3, burden: 4, notes: null, created_at: "2026-07-19T12:48:00Z" },
  { id: "tool-3", user_id: "demo", tool_name: "Datenanalyse-Assistent", task: "Tabelle erklären", started_at: "2026-07-20T10:00:00Z", ended_at: "2026-07-20T10:24:00Z", duration_minutes: 24, effectiveness: 5, burden: 2, notes: null, created_at: "2026-07-20T10:24:00Z" },
];

const scaleLabels: Record<number, string> = {
  1: "sehr niedrig",
  2: "niedrig",
  3: "mittel",
  4: "hoch",
  5: "sehr hoch",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  const [view, setView] = useState<View>("overview");
  const [checkIns, setCheckIns] = useState<CheckIn[]>(demoMode ? demoCheckIns : []);
  const [toolSessions, setToolSessions] = useState<ToolSession[]>(demoMode ? demoToolSessions : []);
  const [selfChecks, setSelfChecks] = useState<SelfCheckResult[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (demoMode) {
      const saved = localStorage.getItem("mindful-ai-demo-checkins");
      const savedTools = localStorage.getItem("mindful-ai-demo-tools");
      const savedSelfChecks = localStorage.getItem("mindful-ai-demo-selfchecks");
      const savedFocus = localStorage.getItem("mindful-ai-demo-focus");
      setCheckIns(saved ? JSON.parse(saved) : demoCheckIns);
      setToolSessions(savedTools ? JSON.parse(savedTools) : demoToolSessions);
      setSelfChecks(savedSelfChecks ? JSON.parse(savedSelfChecks) : []);
      setFocusSessions(savedFocus ? JSON.parse(savedFocus) : []);
      return;
    }

    if (!session || !supabase) {
      setCheckIns([]);
      setToolSessions([]);
      setSelfChecks([]);
      setFocusSessions([]);
      return;
    }

    setLoadingData(true);
    Promise.all([
      supabase.from("check_ins").select("*").order("entry_date", { ascending: false }),
      supabase.from("tool_sessions").select("*").order("created_at", { ascending: false }),
      supabase.from("self_checks").select("*").order("created_at", { ascending: false }),
      supabase.from("focus_sessions").select("*").order("created_at", { ascending: false }),
    ]).then(([checkInResult, toolResult, selfCheckResult, focusResult]) => {
      if (checkInResult.error) console.error(checkInResult.error);
      if (toolResult.error) console.error(toolResult.error);
      if (selfCheckResult.error) console.error(selfCheckResult.error);
      if (focusResult.error) console.error(focusResult.error);
      setCheckIns((checkInResult.data as CheckIn[] | null) ?? []);
      setToolSessions((toolResult.data as ToolSession[] | null) ?? []);
      setSelfChecks((selfCheckResult.data as SelfCheckResult[] | null) ?? []);
      setFocusSessions((focusResult.data as FocusSession[] | null) ?? []);
      setLoadingData(false);
    });
  }, [demoMode, session]);

  if (!authReady) {
    return <FullPageLoader />;
  }

  if (!session && !demoMode) {
    return <Welcome onStartDemo={() => setDemoMode(true)} />;
  }

  async function signOut() {
    if (demoMode) {
      setDemoMode(false);
      setView("overview");
      return;
    }
    await supabase?.auth.signOut();
  }

  function navigate(nextView: View) {
    setView(nextView);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navigation = [
    { id: "overview" as const, label: "Übersicht", icon: Heart },
    { id: "focus" as const, label: "Fokus", icon: Timer },
    { id: "selfcheck" as const, label: "Selbstcheck", icon: Brain },
    { id: "navigator" as const, label: "KI-Navigator", icon: BrainCircuit },
    { id: "trends" as const, label: "Trends", icon: BarChart3 },
    { id: "company" as const, label: "Unternehmen", icon: Building2 },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("overview")} aria-label="Zur Übersicht">
          <img className="brand-logo" src={`${import.meta.env.BASE_URL}undercover-trainer-logo.png`} alt="The Undercover Trainer" />
          <span className="brand-product">Mindful AI</span>
        </button>
        <nav className="desktop-nav" aria-label="Hauptnavigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "nav-link active" : "nav-link"}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          {demoMode && <span className="demo-badge">Demo</span>}
          <button className="icon-button desktop-only" onClick={signOut} aria-label="Abmelden">
            <LogOut size={19} />
          </button>
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü öffnen">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile Navigation">
          {navigation.map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)}>
              <item.icon size={19} /> {item.label}
            </button>
          ))}
          <button onClick={signOut}><LogOut size={19} /> Abmelden</button>
        </nav>
      )}

      <main>
        {view === "overview" && (
          <Overview checkIns={checkIns} toolSessions={toolSessions} loading={loadingData} onNavigate={navigate} />
        )}
        {view === "checkin" && (
          <CheckInForm
            demoMode={demoMode}
            session={session}
            onSaved={(item) => {
              setCheckIns((current) => {
                const next = [item, ...current.filter((entry) => entry.entry_date !== item.entry_date)];
                if (demoMode) localStorage.setItem("mindful-ai-demo-checkins", JSON.stringify(next));
                return next;
              });
              navigate("overview");
            }}
          />
        )}
        {view === "focus" && <FocusTimer demoMode={demoMode} session={session} onSaved={(item) => setFocusSessions((current) => {
          const next = [item, ...current];
          if (demoMode) localStorage.setItem("mindful-ai-demo-focus", JSON.stringify(next));
          return next;
        })}/>}
        {view === "selfcheck" && <SelfCheck demoMode={demoMode} session={session} onSaved={(item) => setSelfChecks((current) => {
          const next = [item, ...current];
          if (demoMode) localStorage.setItem("mindful-ai-demo-selfchecks", JSON.stringify(next));
          return next;
        })}/>}
        {view === "navigator" && <ToolNavigator demoMode={demoMode} session={session} onSaved={(item) => setToolSessions((current) => {
          const next = [item, ...current];
          if (demoMode) localStorage.setItem("mindful-ai-demo-tools", JSON.stringify(next));
          return next;
        })}/>}
        {view === "trends" && <Trends checkIns={checkIns} toolSessions={toolSessions} selfChecks={selfChecks} focusSessions={focusSessions} demoMode={demoMode} />}
        {view === "data" && (
          <DataAndPrivacy
            checkIns={checkIns}
            toolSessions={toolSessions}
            selfChecks={selfChecks}
            focusSessions={focusSessions}
            demoMode={demoMode}
            onCleared={() => { setCheckIns([]); setToolSessions([]); setSelfChecks([]); setFocusSessions([]); }}
          />
        )}
        {view === "company" && <CompanyView/>}
        {view === "ai-act" && <AiActView/>}
        {view === "imprint" && <ImprintView/>}
        {view === "privacy" && <PrivacyView/>}
      </main>

      <footer>
        <div>
          <span className="footer-brand"><Leaf size={17} /> Mindful AI · The Undercover Trainer</span>
          <p>Ein Reflexionswerkzeug – keine medizinische Diagnose oder Therapie.</p>
        </div>
        <div className="footer-right"><div className="footer-links"><button onClick={() => navigate("data")}>Daten & Schutz</button><button onClick={() => navigate("ai-act")}><Scale size={14}/> EU AI Act</button><button onClick={() => navigate("imprint")}>Impressum</button><button onClick={() => navigate("privacy")}>Datenschutz</button></div><p>Bei akuter Gefahr: 112 · Telefonseelsorge: 0800 111 0 111</p></div>
      </footer>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="full-loader">
      <span className="brand-mark"><Leaf size={22} /></span>
      <LoaderCircle className="spin" />
      <span>Mindful AI wird vorbereitet …</span>
    </div>
  );
}

function Welcome({ onStartDemo }: { onStartDemo: () => void }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl() },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
      setMessage("Öffne den Anmeldelink, den wir dir per E-Mail geschickt haben.");
    }
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    if (!consent) {
      setStatus("error");
      setMessage("Bitte bestätige zuerst die freiwillige Verarbeitung deiner Gesundheitsangaben.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getAuthRedirectUrl() },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <div className="brand"><img className="brand-logo" src={`${import.meta.env.BASE_URL}undercover-trainer-logo.png`} alt="The Undercover Trainer"/><span className="brand-product">Mindful AI</span></div>
        <span className="privacy-chip"><LockKeyhole size={15} /> Datenschutz zuerst</span>
      </header>
      <main className="welcome-main">
        <section className="welcome-copy">
          <span className="eyebrow"><Sparkles size={15} /> Deine KI-Nutzung, bewusst betrachtet</span>
          <h1>Wie geht es dir<br />mit KI?</h1>
          <p className="lead">
            Erkenne behutsam, wie Chatbots und generative KI mit deiner Stimmung, deinem Stress und deinem Alltag zusammenhängen.
          </p>
          <div className="trust-list">
            <span><Check size={17} /> Nur deine eigenen Daten</span>
            <span><Check size={17} /> Keine Diagnosen</span>
            <span><Check size={17} /> Jederzeit löschbar</span>
          </div>
        </section>
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-icon"><MessageCircleHeart size={28} /></div>
          <h2 id="login-title">Schön, dass du da bist</h2>
          <p>Melde dich ohne Passwort an. Du erhältst einen sicheren Link per E-Mail.</p>
          <form onSubmit={sendMagicLink}>
            <label htmlFor="email">E-Mail-Adresse</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="du@beispiel.de"
              required
            />
            <label className="consent-check"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required/><span>Ich willige ausdrücklich und freiwillig ein, dass meine Angaben zum emotionalen Befinden als Gesundheitsdaten für die persönlichen App-Funktionen verarbeitet werden. Ich kann die Einwilligung jederzeit für die Zukunft widerrufen und meine Daten löschen.</span></label>
            <button className="primary-button full" disabled={status === "sending"}>
              {status === "sending" ? <LoaderCircle className="spin" size={18} /> : <ChevronRight size={18} />}
              Anmeldelink senden
            </button>
          </form>
          {message && <div className={status === "error" ? "form-message error" : "form-message"}>{message}</div>}
          <div className="divider"><span>oder</span></div>
          <button className="secondary-button full" onClick={signInWithGoogle} disabled={!consent}>Mit Google anmelden</button>
          <button className="text-button" onClick={onStartDemo}>App zuerst im Demo-Modus ansehen</button>
          <details className="auth-privacy"><summary>Kurzer Datenschutzhinweis</summary><p>GitHub Pages liefert die Oberfläche aus, Supabase verarbeitet Anmeldung und deine privaten App-Daten. Die optionale KI-Reflexion startet nur auf deinen Klick und überträgt keine freien Notizen. Dieses Angebot ersetzt keine medizinische Beratung.</p></details>
        </section>
      </main>
    </div>
  );
}

function Overview({ checkIns, toolSessions, loading, onNavigate }: { checkIns: CheckIn[]; toolSessions: ToolSession[]; loading: boolean; onNavigate: (view: View) => void }) {
  const latest = checkIns[0];
  const insight = createLocalInsight(checkIns);
  const trackedMinutes = toolSessions.reduce((sum, item) => sum + item.duration_minutes, 0);

  return (
    <div className="page-container">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Dein persönlicher Rückblick</span>
          <h1>Hallo, wie fühlst du dich heute?</h1>
          <p>Reflektiere deine KI-Nutzung, schütze deine Konzentration und finde den nächsten gesunden Arbeitsschritt.</p>
          <div className="hero-actions"><button className="primary-button" onClick={() => onNavigate("checkin")}><Plus size={18} /> Heutigen Check-in</button><button className="secondary-button" onClick={() => onNavigate("focus")}><Timer size={18}/> 25-Minuten-Fokus</button></div>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <span><Brain size={36} /></span>
        </div>
      </section>

      {loading ? (
        <div className="content-loader"><LoaderCircle className="spin" /> Deine Einträge werden geladen …</div>
      ) : (
        <>
          <section className="stat-grid" aria-label="Letzter Check-in">
            <MetricCard icon={<Heart />} label="Stimmung" value={latest ? `${latest.mood} / 5` : "–"} tone="coral" />
            <MetricCard icon={<Activity />} label="Stress" value={latest ? `${latest.stress} / 5` : "–"} tone="yellow" />
            <MetricCard icon={<MessageCircleHeart />} label="Erfasste Tool-Zeit" value={trackedMinutes ? `${trackedMinutes} Min.` : latest ? `${latest.ai_minutes} Min.` : "–"} tone="blue" />
          </section>

          <section className="quick-tools" aria-label="Direkte Werkzeuge">
            <button className="quick-tool" onClick={() => onNavigate("selfcheck")}><span><Brain size={22}/></span><div><strong>KI-Überforderung prüfen</strong><small>7 geführte Schritte · dein KI-Kompass</small></div><ChevronRight size={18}/></button>
            <button className="quick-tool" onClick={() => onNavigate("navigator")}><span><BrainCircuit size={22}/></span><div><strong>Passendes KI-Tool finden</strong><small>Problem klären · Nutzung erfassen</small></div><ChevronRight size={18}/></button>
            <button className="quick-tool" onClick={() => onNavigate("company")}><span><Building2 size={22}/></span><div><strong>Für Unternehmen</strong><small>Gesunde KI-Arbeit im Mittelstand</small></div><ChevronRight size={18}/></button>
          </section>

          <section className="two-column">
            <article className="card insight-card">
              <div className="card-heading">
                <span className="soft-icon"><Sparkles size={20} /></span>
                <div><span className="eyebrow">Lokale Auswertung</span><h2>Was gerade auffällt</h2></div>
              </div>
              <p className="large-copy">{insight}</p>
              <p className="caveat">Das ist eine Korrelation aus deinen Angaben, kein Beweis für Ursache und Wirkung.</p>
              <button className="text-link" onClick={() => onNavigate("trends")}>Alle Trends ansehen <ChevronRight size={17} /></button>
            </article>
            <article className="card recent-card">
              <div className="card-heading between"><div><span className="eyebrow">Zuletzt</span><h2>Deine Check-ins</h2></div><BarChart3 size={22} /></div>
              {checkIns.length ? (
                <div className="recent-list">
                  {checkIns.slice(0, 3).map((item) => (
                    <div key={item.id} className="recent-row">
                      <span className={`mood-dot mood-${item.mood}`}></span>
                      <div><strong>{formatDate(item.entry_date)}</strong><small>{item.ai_minutes} Min. KI · {item.ai_effect}</small></div>
                      <span>{item.mood}/5</span>
                    </div>
                  ))}
                </div>
              ) : <div className="empty-state">Noch keine Check-ins vorhanden.</div>}
            </article>
          </section>

          <section className="safety-banner">
            <ShieldCheck size={24} />
            <div><strong>Deine Angaben gehören dir.</strong><p>Sie werden verschlüsselt übertragen und nur deinem Konto zugeordnet.</p></div>
          </section>

          <BrandStory />
        </>
      )}
    </div>
  );
}

function BrandStory() {
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <section className="brand-story" aria-labelledby="brand-story-title">
      <div className="brand-story-copy">
        <span className="eyebrow"><Sparkles size={15} /> Über The Undercover Trainer</span>
        <h2 id="brand-story-title">Rascha Al-Nemer</h2>
        <p>
          Rascha Al-Nemer ist Mentalcoach, Kommunikationstrainerin und Speakerin mit dem Schwerpunkt
          emotionale Gesundheit. Seit der Gründung ihres Unternehmens im Jahr 2020 begleitet sie Menschen
          und Unternehmen mit Trainings, Vorträgen und Coachings.
        </p>
        <p>
          Im Mittelpunkt stehen emotionale Intelligenz, Stress- und Konfliktmanagement, Kommunikation,
          Selbstführung und mentale Klarheit. Mindful AI überträgt diesen Ansatz auf einen bewussten,
          menschlich gesunden Umgang mit KI im Arbeitsalltag.
        </p>
        <div className="brand-story-actions">
          <a className="secondary-button" href="https://the-undercover-trainer.com/ueber_uns.html" target="_blank" rel="noreferrer">Mehr über Rascha</a>
          <a className="text-link" href="mailto:trainer@the-undercover-trainer.com">Kontakt aufnehmen <ChevronRight size={17} /></a>
        </div>
      </div>
      <div className="brand-media-grid">
        <figure className="brand-media brand-artwork">
          <img
            src={`${baseUrl}undercover-trainer-ai-manager.jpg`}
            alt="The Undercover Trainer und AI Manager – visuelle Verbindung von KI, Training, Coaching und emotionaler Gesundheit"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Die Verbindung von KI-Kompetenz und emotionaler Gesundheit</figcaption>
        </figure>
        <figure className="brand-media brand-video">
          <video controls playsInline preload="metadata" aria-label="Video von The Undercover Trainer">
            <source src={`${baseUrl}undercover-trainer-intro.mp4`} type="video/mp4" />
            Dein Browser kann dieses Video nicht abspielen.
          </video>
          <figcaption>Ein kurzer Einblick – du entscheidest selbst, ob du das Video startest</figcaption>
        </figure>
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return <article className={`metric-card ${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>;
}

function ScaleField({ label, value, onChange, inverse = false }: { label: string; value: number; onChange: (value: number) => void; inverse?: boolean }) {
  return (
    <fieldset className="scale-field">
      <legend><span>{label}</span><strong>{scaleLabels[value]}</strong></legend>
      <div className={inverse ? "scale-options inverse" : "scale-options"}>
        {[1, 2, 3, 4, 5].map((number) => (
          <button key={number} type="button" className={value === number ? "selected" : ""} onClick={() => onChange(number)} aria-label={`${label}: ${scaleLabels[number]}`}>
            {number}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CheckInForm({ demoMode, session, onSaved }: { demoMode: boolean; session: Session | null; onSaved: (item: CheckIn) => void }) {
  const [form, setForm] = useState(emptyCheckIn);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof CheckInInput>(key: K, value: CheckInInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (demoMode) {
      onSaved({ ...form, id: crypto.randomUUID(), user_id: "demo", created_at: new Date().toISOString(), note: form.note || null });
      return;
    }

    if (!supabase || !session) return;
    const payload = { ...form, note: form.note.trim() || null, user_id: session.user.id };
    const { data, error: saveError } = await supabase
      .from("check_ins")
      .upsert(payload, { onConflict: "user_id,entry_date" })
      .select()
      .single();

    if (saveError) {
      setError("Der Check-in konnte nicht gespeichert werden. Bitte versuche es erneut.");
      setSaving(false);
      return;
    }
    onSaved(data as CheckIn);
  }

  return (
    <div className="page-container narrow-page">
      <header className="page-heading">
        <span className="eyebrow">Tägliche Reflexion</span>
        <h1>Wie war dein Tag mit KI?</h1>
        <p>Es gibt keine richtigen oder falschen Antworten. Wähle, was sich heute passend anfühlt.</p>
      </header>
      <form className="checkin-form" onSubmit={submit}>
        <section className="card form-section">
          <div className="section-number">01</div>
          <div className="section-title"><h2>Dein Wohlbefinden</h2><p>1 bedeutet sehr niedrig, 5 sehr hoch.</p></div>
          <ScaleField label="Stimmung" value={form.mood} onChange={(value) => update("mood", value)} />
          <ScaleField label="Stress" value={form.stress} onChange={(value) => update("stress", value)} inverse />
          <ScaleField label="Gefühl von Verbundenheit" value={6 - form.loneliness} onChange={(value) => update("loneliness", 6 - value)} />
          <ScaleField label="Schlafqualität" value={form.sleep} onChange={(value) => update("sleep", value)} />
        </section>

        <section className="card form-section">
          <div className="section-number">02</div>
          <div className="section-title"><h2>Deine KI-Nutzung</h2><p>Eine grobe Einschätzung reicht vollkommen aus.</p></div>
          <label className="input-group">Ungefähre Nutzungsdauer heute
            <div className="number-input"><input type="number" min="0" max="1440" value={form.ai_minutes} onChange={(event) => update("ai_minutes", Number(event.target.value))} /><span>Minuten</span></div>
          </label>
          <label className="input-group">Hauptsächlicher Zweck
            <select value={form.ai_purpose} onChange={(event) => update("ai_purpose", event.target.value as AiPurpose)}>
              <option value="lernen">Lernen</option><option value="arbeit">Arbeit</option><option value="unterhaltung">Unterhaltung</option><option value="emotionale_unterstuetzung">Emotionale Unterstützung</option>
            </select>
          </label>
          <fieldset className="effect-field"><legend>Wie hat sich die Nutzung angefühlt?</legend>
            <div>{(["hilfreich", "neutral", "belastend"] as AiEffect[]).map((effect) => <button key={effect} type="button" className={form.ai_effect === effect ? "selected" : ""} onClick={() => update("ai_effect", effect)}>{effect}</button>)}</div>
          </fieldset>
        </section>

        <section className="card form-section">
          <div className="section-number">03</div>
          <div className="section-title"><h2>Ein Gedanke dazu</h2><p>Optional und nur für dich sichtbar.</p></div>
          <label className="input-group">Was möchtest du festhalten?
            <textarea maxLength={1200} rows={4} value={form.note} onChange={(event) => update("note", event.target.value)} placeholder="Zum Beispiel: Der Chatbot hat mir beim Lernen geholfen, aber danach war ich erschöpft …" />
            <small>{form.note.length}/1200 Zeichen</small>
          </label>
        </section>
        {error && <div className="form-message error">{error}</div>}
        <button className="primary-button submit-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={19} /> : <Check size={19} />} Check-in sicher speichern</button>
      </form>
    </div>
  );
}

function Trends({ checkIns, toolSessions, selfChecks, focusSessions, demoMode }: { checkIns: CheckIn[]; toolSessions: ToolSession[]; selfChecks: SelfCheckResult[]; focusSessions: FocusSession[]; demoMode: boolean }) {
  const [reflection, setReflection] = useState<AiReflection | null>(null);
  const [aiConsent, setAiConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartData = useMemo(() => [...checkIns].reverse().map((item) => ({ ...item, date: formatDate(item.entry_date) })), [checkIns]);
  const toolChartData = useMemo(() => {
    const grouped = new Map<string, { name: string; minutes: number; effectiveness: number; burden: number; count: number }>();
    toolSessions.forEach((item) => {
      const shortName = item.tool_name.replace("assistent", "").replace("Assistent", "").trim();
      const current = grouped.get(shortName) ?? { name: shortName, minutes: 0, effectiveness: 0, burden: 0, count: 0 };
      current.minutes += item.duration_minutes; current.effectiveness += item.effectiveness; current.burden += item.burden; current.count += 1;
      grouped.set(shortName, current);
    });
    return [...grouped.values()].map((item) => ({ ...item, effectiveness: Number((item.effectiveness / item.count).toFixed(1)), burden: Number((item.burden / item.count).toFixed(1)) }));
  }, [toolSessions]);

  async function createReflection() {
    setLoading(true);
    setError("");
    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setReflection({
        headline: "Mehr KI-Zeit fällt bei dir oft mit mehr Stress zusammen",
        summary: "In deinen bisherigen Demo-Einträgen zeigt sich ein vorsichtiger zeitlicher Zusammenhang. Das bedeutet nicht, dass die KI-Nutzung den Stress verursacht.",
        observations: ["Lernbezogene Nutzung wurde häufiger als hilfreich bewertet.", "An Tagen über 90 Minuten lag dein Stresswert meist höher."],
        reflection_questions: ["Welche Aufgabe wolltest du an den längeren Tagen lösen?", "Welche kurze Pause würde dir nach der KI-Nutzung guttun?"],
        safety_note: "Diese Reflexion ist keine Diagnose und ersetzt keine professionelle Beratung.",
      });
      setLoading(false);
      return;
    }
    if (!supabase) return;
    const safeCheckIns = checkIns.slice(0, 14).map(({ entry_date, mood, stress, loneliness, sleep, ai_minutes, ai_purpose, ai_effect }) => ({ entry_date, mood, stress, loneliness, sleep, ai_minutes, ai_purpose, ai_effect }));
    const { data, error: functionError } = await supabase.functions.invoke("health-reflection", { body: { checkIns: safeCheckIns } });
    if (functionError) setError("Die KI-Reflexion ist noch nicht eingerichtet oder momentan nicht erreichbar.");
    else setReflection(data as AiReflection);
    setLoading(false);
  }

  return (
    <div className="page-container">
      <header className="page-heading split-heading">
        <div><span className="eyebrow">Deine Entwicklung</span><h1>Muster in Ruhe betrachten</h1><p>Aus deinen eigenen Angaben – ohne Vergleich mit anderen Menschen.</p></div>
        <span className="privacy-chip"><LockKeyhole size={15} /> Nur für dich</span>
      </header>
      <section className="card chart-card">
        <div className="card-heading between"><div><span className="eyebrow">Verlauf</span><h2>Wohlbefinden & KI-Zeit</h2></div><span className="chart-count">{checkIns.length} Einträge</span></div>
        {checkIns.length ? (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData} margin={{ top: 16, right: 14, left: -20, bottom: 0 }}>
                <defs><linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#25b7c0" stopOpacity={0.3}/><stop offset="95%" stopColor="#25b7c0" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#dfe3dc" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #dfe3dc" }} />
                <Legend />
                <Area type="monotone" name="Stimmung" dataKey="mood" stroke="#25b7c0" fill="url(#moodFill)" strokeWidth={3} />
                <Area type="monotone" name="Stress" dataKey="stress" stroke="#dd795e" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="empty-state tall">Noch keine Daten für ein Diagramm vorhanden.</div>}
      </section>

      <section className="trend-summary">
        <MetricCard icon={<Timer/>} label="Fokusphasen" value={`${focusSessions.filter((item) => item.completed).length}`} tone="blue"/>
        <MetricCard icon={<Brain/>} label="KI-Kompass" value={selfChecks[0] ? "abgeschlossen" : "–"} tone="yellow"/>
        <MetricCard icon={<BrainCircuit/>} label="Tool-Sitzungen" value={`${toolSessions.length}`} tone="coral"/>
      </section>

      <section className="card chart-card tool-chart-card">
        <div className="card-heading between"><div><span className="eyebrow">Nutzungsanalyse</span><h2>Zeit, Nutzen und Belastung</h2></div><span className="chart-count">{toolSessions.reduce((sum, item) => sum + item.duration_minutes, 0)} Minuten</span></div>
        {toolChartData.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height={320}><BarChart data={toolChartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}><CartesianGrid strokeDasharray="4 6" stroke="#d5e9ea"/><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickLine={false} axisLine={false} fontSize={12}/><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #d5e9ea" }}/><Legend/><Bar name="Minuten" dataKey="minutes" fill="#77cbd1" radius={[7,7,0,0]}/><Bar name="Effektivität (1–5)" dataKey="effectiveness" fill="#168d95" radius={[7,7,0,0]}/><Bar name="Belastung (1–5)" dataKey="burden" fill="#dd795e" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div> : <div className="empty-state">Starte eine Nutzung im KI-Navigator, um Zeit, Nutzen und Belastung zu vergleichen.</div>}
        <p className="caveat">Hoher Nutzen bei dauerhaft hoher Belastung ist kein nachhaltiger Gewinn. Suche nach kürzeren Sitzungen, klareren Zielen oder einem einfacheren Werkzeug.</p>
      </section>

      <section className="card ai-card">
        <div className="ai-card-header"><span className="ai-icon"><Sparkles size={24} /></span><div><span className="eyebrow">Optionale KI-Reflexion · KI klar gekennzeichnet</span><h2>Deine eigenen Angaben zusammengefasst</h2></div></div>
        <div className="ai-transparency"><Scale size={19}/><div><strong>Was die KI tut – und was nicht</strong><p>Ein Sprachmodell fasst höchstens 14 von dir selbst eingegebene Zahlenwerte und Kategorien zusammen. Es erkennt keine Emotionen, bewertet keine Arbeitsleistung, trifft keine Entscheidung und übermittelt keine freien Tagebuchtexte. Du prüfst selbst, ob die Ausgabe für dich passt.</p></div></div>
        {!reflection && <label className="consent-check ai-consent"><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)}/><span>Ich möchte diese einzelne KI-Auswertung jetzt starten und weiß, dass das Ergebnis fehlerhaft sein kann. Meine freie Notiz wird nicht übertragen.</span></label>}
        {!reflection && <button className="primary-button" onClick={createReflection} disabled={loading || checkIns.length < 3 || !aiConsent}>{loading ? <LoaderCircle className="spin" size={18} /> : <Brain size={18} />} Gekennzeichnete KI-Reflexion erstellen</button>}
        {checkIns.length < 3 && <small>Mindestens drei Check-ins sind erforderlich.</small>}
        {error && <div className="form-message error">{error}</div>}
        {reflection && (
          <div className="reflection-result">
            <div className="ai-output-label"><Sparkles size={16}/><strong>KI-generierte Reflexion</strong><span>Automatisch erstellt · von dir zu prüfen</span></div>
            <h3>{reflection.headline}</h3><p>{reflection.summary}</p>
            <div className="reflection-columns"><div><h4>Beobachtungen</h4><ul>{reflection.observations.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Fragen für dich</h4><ul>{reflection.reflection_questions.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
            <p className="caveat">{reflection.safety_note}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function DataAndPrivacy({ checkIns, toolSessions, selfChecks, focusSessions, demoMode, onCleared }: { checkIns: CheckIn[]; toolSessions: ToolSession[]; selfChecks: SelfCheckResult[]; focusSessions: FocusSession[]; demoMode: boolean; onCleared: () => void }) {
  const [status, setStatus] = useState("");

  function exportData() {
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), check_ins: checkIns, tool_sessions: toolSessions, self_checks: selfChecks, focus_sessions: focusSessions }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mindful-ai-export-${today}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function clearData() {
    if (!window.confirm("Möchtest du wirklich alle Check-ins, Selbstchecks, Tool- und Fokussitzungen unwiderruflich löschen?")) return;
    if (demoMode) {
      localStorage.removeItem("mindful-ai-demo-checkins");
      localStorage.removeItem("mindful-ai-demo-tools");
      localStorage.removeItem("mindful-ai-demo-selfchecks");
      localStorage.removeItem("mindful-ai-demo-focus");
      onCleared();
      setStatus("Die Demo-Daten wurden gelöscht.");
      return;
    }
    const results = await Promise.all(["check_ins", "tool_sessions", "self_checks", "focus_sessions"].map((table) => supabase!.from(table).delete().not("id", "is", null)));
    if (results.some((result) => result.error)) setStatus("Mindestens ein Datensatz konnte nicht gelöscht werden. Bitte prüfe die Supabase-Einrichtung.");
    else { onCleared(); setStatus("Deine persönlichen App-Daten wurden gelöscht."); }
  }

  return (
    <div className="page-container narrow-page">
      <header className="page-heading"><span className="eyebrow">Kontrolle behalten</span><h1>Deine Daten & dein Schutz</h1><p>Du entscheidest, was gespeichert, exportiert oder gelöscht wird.</p></header>
      <section className="privacy-grid">
        <article className="card privacy-card"><span><LockKeyhole /></span><h2>Geschützt übertragen</h2><p>Die Verbindung zu GitHub Pages und Supabase verwendet TLS. Die Einrichtung ist für eine europäische Supabase-Region vorgesehen.</p></article>
        <article className="card privacy-card"><span><ShieldCheck /></span><h2>Nur dein Zugriff</h2><p>Supabase Row-Level Security beschränkt jeden Eintrag auf dein angemeldetes Konto.</p></article>
        <article className="card privacy-card"><span><CircleHelp /></span><h2>Keine Diagnose</h2><p>Alle Hinweise sind Reflexionshilfen. Die App bewertet keine psychischen Erkrankungen.</p></article>
      </section>
      <section className="card data-actions">
        <div><h2>Deine App-Daten</h2><p>{checkIns.length + toolSessions.length + selfChecks.length + focusSessions.length} Einträge sind aktuell gespeichert.</p></div>
        <div><button className="secondary-button" onClick={exportData} disabled={!checkIns.length && !toolSessions.length && !selfChecks.length && !focusSessions.length}><Download size={18} /> Daten exportieren</button><button className="danger-button" onClick={clearData} disabled={!checkIns.length && !toolSessions.length && !selfChecks.length && !focusSessions.length}><Trash2 size={18} /> Alle Daten löschen</button></div>
        {status && <div className="form-message">{status}</div>}
      </section>
      <section className="help-card"><MessageCircleHeart size={25} /><div><h2>Wenn du Unterstützung brauchst</h2><p>Sprich mit einer vertrauten Person oder professionellen Beratungsstelle. Bei unmittelbarer Gefahr wähle 112. Die Telefonseelsorge erreichst du unter 0800 111 0 111.</p></div></section>
    </div>
  );
}

export default App;
