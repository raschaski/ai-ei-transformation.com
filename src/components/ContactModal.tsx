import { FormEvent, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Check, LoaderCircle, LockKeyhole, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { ContactRequest } from "../types";

const CONSENT_VERSION = "2026-07-23-v1";

interface ContactModalProps {
  open: boolean;
  demoMode: boolean;
  session: Session | null;
  initialContact?: ContactRequest;
  requiredForAccess?: boolean;
  onClose: () => void;
  onSaved: (contact: ContactRequest) => void;
}

export function ContactModal({ open, demoMode, session, initialContact, requiredForAccess = false, onClose, onSaved }: ContactModalProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [healthDataConsent, setHealthDataConsent] = useState(false);
  const [contactConsent, setContactConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setFullName(initialContact?.full_name ?? "");
    setEmail(initialContact?.email ?? session?.user.email ?? "");
    setPhone(initialContact?.phone ?? "");
    setPrivacyAcknowledged(initialContact?.privacy_acknowledged ?? false);
    setHealthDataConsent(initialContact?.health_data_consent ?? false);
    setContactConsent(initialContact?.contact_consent ?? false);
    setStatus("idle");
    setMessage("");
    document.body.classList.add("modal-open");
    const focusTimer = window.setTimeout(() => nameInput.current?.focus(), 50);

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !requiredForAccess) onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("modal-open");
    };
  }, [initialContact, onClose, open, requiredForAccess, session?.user.email]);

  if (!open) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!demoMode && (!session || !supabase)) {
      setStatus("error");
      setMessage("Bitte melde dich zuerst mit deiner E-Mail-Adresse an, damit die Einwilligung sicher deinem Konto zugeordnet werden kann.");
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    if (cleanName.length < 2 || !cleanEmail || !privacyAcknowledged || !healthDataConsent) {
      setStatus("error");
      setMessage("Bitte fülle Name und E-Mail aus und bestätige die Datenschutzerklärung sowie die Verarbeitung deiner Gesundheitsangaben.");
      return;
    }

    setStatus("saving");
    if (demoMode) {
      const now = new Date().toISOString();
      const localContact: ContactRequest = {
        id: initialContact?.id ?? crypto.randomUUID(),
        user_id: "demo",
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        privacy_acknowledged: true,
        privacy_text_version: CONSENT_VERSION,
        privacy_acknowledged_at: now,
        health_data_consent: true,
        health_consent_text_version: CONSENT_VERSION,
        health_data_consented_at: now,
        contact_consent: contactConsent,
        contact_consent_text_version: CONSENT_VERSION,
        contact_consented_at: contactConsent ? now : null,
        contact_withdrawn_at: contactConsent ? null : now,
        consent_text_version: CONSENT_VERSION,
        consented_at: now,
        updated_at: now,
        created_at: initialContact?.created_at ?? now,
      };
      onSaved(localContact);
      setStatus("saved");
      setMessage("Danke. Deine Auswahl wurde für diesen Demo-Browser gespeichert.");
      return;
    }

    if (!supabase || !session) {
      setStatus("error");
      setMessage("Die Anmeldung konnte nicht bestätigt werden. Bitte melde dich erneut an.");
      return;
    }

    const { data, error } = await supabase
      .from("contact_requests")
      .upsert({
        user_id: session.user.id,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        privacy_acknowledged: true,
        privacy_text_version: CONSENT_VERSION,
        health_data_consent: true,
        health_consent_text_version: CONSENT_VERSION,
        contact_consent: contactConsent,
        contact_consent_text_version: CONSENT_VERSION,
        consent_text_version: CONSENT_VERSION,
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error(error);
      setStatus("error");
      setMessage("Die Kontaktdaten konnten nicht gespeichert werden. Bitte prüfe die Supabase-Einrichtung oder versuche es später erneut.");
      return;
    }

    onSaved(data as ContactRequest);
    setStatus("saved");
    setMessage("Danke. Deine Datenschutz- und Einwilligungsauswahl wurde gespeichert.");
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !requiredForAccess) onClose();
    }}>
      <section
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        aria-describedby="contact-modal-description"
      >
        {!requiredForAccess && <button className="modal-close" type="button" onClick={onClose} aria-label="Kontaktfenster schließen">
          <X size={21} />
        </button>}
        {requiredForAccess && demoMode && (
          <button className="modal-back-to-website" type="button" onClick={onClose}>
            Zur Website
          </button>
        )}
        <span className="eyebrow">{requiredForAccess ? "Bevor du startest" : "Datenschutz & Kontakt"}</span>
        <h2 id="contact-modal-title">{requiredForAccess ? "Deine Angaben und Einwilligungen" : "Kontaktdaten verwalten"}</h2>
        <p id="contact-modal-description">
          {requiredForAccess
            ? "Bitte vervollständige zunächst deine Angaben und entscheide anschließend getrennt über Datenschutz, Gesundheitsdaten und Kontaktaufnahme."
            : "Hier kannst du deine Angaben aktualisieren oder eine Kontakteinwilligung erteilen beziehungsweise widerrufen."}
        </p>

        {!session && !demoMode && (
          <div className="contact-login-note">
            <LockKeyhole size={20} />
            <div><strong>Anmeldung erforderlich</strong><p>Beende den Demo-Modus und melde dich an, um deine Einwilligung sicher zu speichern.</p></div>
          </div>
        )}

        <form className="contact-form" onSubmit={submit}>
          <label htmlFor="contact-name">Name <span aria-hidden="true">*</span></label>
          <input
            ref={nameInput}
            id="contact-name"
            name="name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            minLength={2}
            maxLength={120}
            required
          />

          <label htmlFor="contact-email">E-Mail-Adresse <span aria-hidden="true">*</span></label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
          />

          <label htmlFor="contact-phone">Telefonnummer <small>freiwillig</small></label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={40}
          />

          <label className="consent-check contact-consent">
            <input type="checkbox" checked={privacyAcknowledged} onChange={(event) => setPrivacyAcknowledged(event.target.checked)} required />
            <span>
              Ich habe die <a href={`${import.meta.env.BASE_URL}datenschutz.html`} target="_blank" rel="noreferrer">Datenschutzerklärung</a> gelesen
              und bestätige, dass ich über Zwecke, Empfänger, Speicherdauer, meine Rechte und Widerrufsmöglichkeiten informiert wurde.
            </span>
          </label>

          <label className="consent-check contact-consent">
            <input type="checkbox" checked={healthDataConsent} onChange={(event) => setHealthDataConsent(event.target.checked)} required />
            <span>
              Ich willige ausdrücklich und freiwillig ein, dass meine selbst eingegebenen Angaben zum emotionalen Befinden
              als Gesundheitsdaten für die persönlichen App-Funktionen verarbeitet werden. Ich kann diese Einwilligung
              jederzeit mit Wirkung für die Zukunft widerrufen und meine Daten löschen.
            </span>
          </label>

          <label className="consent-check contact-consent optional-consent">
            <input type="checkbox" checked={contactConsent} onChange={(event) => setContactConsent(event.target.checked)} />
            <span>
              <strong>Freiwillig:</strong> Rascha Al-Nemer / The Undercover Trainer darf mich per E-Mail und – falls angegeben –
              telefonisch zu meiner Teilnahme, Rückfragen und Informationen zu Mindful AI kontaktieren. Eine Ablehnung hat
              keine Nachteile für die App-Nutzung. Ich kann die Einwilligung jederzeit widerrufen.
            </span>
          </label>

          <div className="contact-trust">
            <Check size={19} />
            <p>
              Deine Kontaktdaten werden weder verkauft noch an fremde Unternehmen für deren Werbung oder Vertrieb weitergegeben.
              Für die sichere Speicherung und technische Bereitstellung wird Supabase als vertraglich gebundener
              Auftragsverarbeiter eingesetzt.
            </p>
          </div>
          <p className="contact-privacy-link">
            Mehr dazu in der <a href={`${import.meta.env.BASE_URL}datenschutz.html`} target="_blank" rel="noreferrer">Datenschutzerklärung</a>.
            Widerruf ist per E-Mail an <a href="mailto:trainer@the-undercover-trainer.com">trainer@the-undercover-trainer.com</a> oder durch Löschen unter „Daten &amp; Schutz“ möglich.
          </p>

          <button className="primary-button full" disabled={(!session && !demoMode) || !privacyAcknowledged || !healthDataConsent || status === "saving"}>
            {status === "saving" ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}
            {requiredForAccess ? "Auswahl speichern und App starten" : "Auswahl speichern"}
          </button>
          {requiredForAccess && !demoMode && <button className="text-button" type="button" onClick={onClose}>Abmelden</button>}
          {message && <div role="status" className={status === "error" ? "form-message error" : "form-message"}>{message}</div>}
        </form>
      </section>
    </div>
  );
}
