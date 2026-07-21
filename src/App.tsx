import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Activity,
  BarChart3,
  Brain,
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
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createLocalInsight } from "./lib/analytics";
import { getAuthRedirectUrl, isSupabaseConfigured, supabase } from "./lib/supabase";
import type { AiEffect, AiPurpose, AiReflection, CheckIn, CheckInInput } from "./types";

type View = "overview" | "checkin" | "trends" | "data";

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
      setCheckIns(saved ? JSON.parse(saved) : demoCheckIns);
      return;
    }

    if (!session || !supabase) {
      setCheckIns([]);
      return;
    }

    setLoadingData(true);
    supabase
      .from("check_ins")
      .select("*")
      .order("entry_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setCheckIns((data as CheckIn[] | null) ?? []);
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
    { id: "checkin" as const, label: "Check-in", icon: Plus },
    { id: "trends" as const, label: "Meine Trends", icon: BarChart3 },
    { id: "data" as const, label: "Daten & Schutz", icon: ShieldCheck },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("overview")} aria-label="Zur Übersicht">
          <span className="brand-mark"><Leaf size={19} /></span>
          <span>Mindful AI</span>
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
          <Overview checkIns={checkIns} loading={loadingData} onNavigate={navigate} />
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
        {view === "trends" && <Trends checkIns={checkIns} demoMode={demoMode} />}
        {view === "data" && (
          <DataAndPrivacy
            checkIns={checkIns}
            demoMode={demoMode}
            onCleared={() => setCheckIns([])}
          />
        )}
      </main>

      <footer>
        <div>
          <span className="footer-brand"><Leaf size={17} /> Mindful AI</span>
          <p>Ein Reflexionswerkzeug – keine medizinische Diagnose oder Therapie.</p>
        </div>
        <p>Bei akuter Gefahr: 112 · Telefonseelsorge: 0800 111 0 111</p>
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
        <div className="brand"><span className="brand-mark"><Leaf size={19} /></span> Mindful AI</div>
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
            <button className="primary-button full" disabled={status === "sending"}>
              {status === "sending" ? <LoaderCircle className="spin" size={18} /> : <ChevronRight size={18} />}
              Anmeldelink senden
            </button>
          </form>
          {message && <div className={status === "error" ? "form-message error" : "form-message"}>{message}</div>}
          <div className="divider"><span>oder</span></div>
          <button className="secondary-button full" onClick={signInWithGoogle}>Mit Google anmelden</button>
          <button className="text-button" onClick={onStartDemo}>App zuerst im Demo-Modus ansehen</button>
          <small>Mit der Anmeldung bestätigst du, dass dieses Angebot keine medizinische Beratung ersetzt.</small>
        </section>
      </main>
    </div>
  );
}

function Overview({ checkIns, loading, onNavigate }: { checkIns: CheckIn[]; loading: boolean; onNavigate: (view: View) => void }) {
  const latest = checkIns[0];
  const insight = createLocalInsight(checkIns);

  return (
    <div className="page-container">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Dein persönlicher Rückblick</span>
          <h1>Hallo, wie fühlst du dich heute?</h1>
          <p>Ein kurzer Check-in dauert weniger als zwei Minuten und hilft dir, Muster bewusster wahrzunehmen.</p>
          <button className="primary-button" onClick={() => onNavigate("checkin")}><Plus size={18} /> Heutigen Check-in starten</button>
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
            <MetricCard icon={<MessageCircleHeart />} label="KI-Zeit" value={latest ? `${latest.ai_minutes} Min.` : "–"} tone="blue" />
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
        </>
      )}
    </div>
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

function Trends({ checkIns, demoMode }: { checkIns: CheckIn[]; demoMode: boolean }) {
  const [reflection, setReflection] = useState<AiReflection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartData = useMemo(() => [...checkIns].reverse().map((item) => ({ ...item, date: formatDate(item.entry_date) })), [checkIns]);

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
                <defs><linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#40776a" stopOpacity={0.3}/><stop offset="95%" stopColor="#40776a" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 6" stroke="#dfe3dc" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #dfe3dc" }} />
                <Legend />
                <Area type="monotone" name="Stimmung" dataKey="mood" stroke="#40776a" fill="url(#moodFill)" strokeWidth={3} />
                <Area type="monotone" name="Stress" dataKey="stress" stroke="#dd795e" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <div className="empty-state tall">Noch keine Daten für ein Diagramm vorhanden.</div>}
      </section>

      <section className="card ai-card">
        <div className="ai-card-header"><span className="ai-icon"><Sparkles size={24} /></span><div><span className="eyebrow">Optionale KI-Reflexion</span><h2>Deine Daten verständlich zusammengefasst</h2></div></div>
        <p>Beim Klick werden ausschließlich die letzten 14 Zahlenwerte und Kategorien verarbeitet – niemals deine freien Tagebuchtexte.</p>
        {!reflection && <button className="primary-button" onClick={createReflection} disabled={loading || checkIns.length < 3}>{loading ? <LoaderCircle className="spin" size={18} /> : <Brain size={18} />} Reflexion erstellen</button>}
        {checkIns.length < 3 && <small>Mindestens drei Check-ins sind erforderlich.</small>}
        {error && <div className="form-message error">{error}</div>}
        {reflection && (
          <div className="reflection-result">
            <h3>{reflection.headline}</h3><p>{reflection.summary}</p>
            <div className="reflection-columns"><div><h4>Beobachtungen</h4><ul>{reflection.observations.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Fragen für dich</h4><ul>{reflection.reflection_questions.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
            <p className="caveat">{reflection.safety_note}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function DataAndPrivacy({ checkIns, demoMode, onCleared }: { checkIns: CheckIn[]; demoMode: boolean; onCleared: () => void }) {
  const [status, setStatus] = useState("");

  function exportData() {
    const blob = new Blob([JSON.stringify(checkIns, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mindful-ai-export-${today}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function clearData() {
    if (!window.confirm("Möchtest du wirklich alle Check-ins unwiderruflich löschen?")) return;
    if (demoMode) {
      localStorage.removeItem("mindful-ai-demo-checkins");
      onCleared();
      setStatus("Die Demo-Daten wurden gelöscht.");
      return;
    }
    const { error } = await supabase!.from("check_ins").delete().not("id", "is", null);
    if (error) setStatus("Das Löschen ist fehlgeschlagen. Bitte versuche es erneut.");
    else { onCleared(); setStatus("Deine Check-ins wurden gelöscht."); }
  }

  return (
    <div className="page-container narrow-page">
      <header className="page-heading"><span className="eyebrow">Kontrolle behalten</span><h1>Deine Daten & dein Schutz</h1><p>Du entscheidest, was gespeichert, exportiert oder gelöscht wird.</p></header>
      <section className="privacy-grid">
        <article className="card privacy-card"><span><LockKeyhole /></span><h2>Geschützt übertragen</h2><p>Die Verbindung zu GitHub Pages und Supabase verwendet TLS. Die Datenbank liegt in einer europäischen Region.</p></article>
        <article className="card privacy-card"><span><ShieldCheck /></span><h2>Nur dein Zugriff</h2><p>Supabase Row-Level Security beschränkt jeden Eintrag auf dein angemeldetes Konto.</p></article>
        <article className="card privacy-card"><span><CircleHelp /></span><h2>Keine Diagnose</h2><p>Alle Hinweise sind Reflexionshilfen. Die App bewertet keine psychischen Erkrankungen.</p></article>
      </section>
      <section className="card data-actions">
        <div><h2>Deine Check-ins</h2><p>{checkIns.length} Einträge sind aktuell gespeichert.</p></div>
        <div><button className="secondary-button" onClick={exportData} disabled={!checkIns.length}><Download size={18} /> Daten exportieren</button><button className="danger-button" onClick={clearData} disabled={!checkIns.length}><Trash2 size={18} /> Alle Check-ins löschen</button></div>
        {status && <div className="form-message">{status}</div>}
      </section>
      <section className="help-card"><MessageCircleHeart size={25} /><div><h2>Wenn du Unterstützung brauchst</h2><p>Sprich mit einer vertrauten Person oder professionellen Beratungsstelle. Bei unmittelbarer Gefahr wähle 112. Die Telefonseelsorge erreichst du unter 0800 111 0 111.</p></div></section>
    </div>
  );
}

export default App;
