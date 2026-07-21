import { AlertTriangle, BrainCircuit, Building2, Check, ExternalLink, FileCheck2, GraduationCap, LockKeyhole, Scale, ShieldCheck, UserCheck, Users } from "lucide-react";

export function CompanyView() {
  return (
    <div className="page-container company-page">
      <section className="company-hero">
        <div><span className="eyebrow">Mitarbeitergesundheit im Mittelstand</span><h1>KI-Kompetenz braucht emotionale Gesundheit.</h1><p>Mindful AI verbindet Selbstreflexion, gesunde Arbeitsrhythmen und verantwortungsvolle Tool-Nutzung – ohne individuelle Beschäftigtendaten zur Leistungskontrolle zu machen.</p>
          <a className="primary-button" href="mailto:trainer@the-undercover-trainer.com?subject=Pilot%20Mindful%20AI">Unverbindlichen Pilot besprechen</a>
        </div><div className="company-symbol"><Building2 size={58}/></div>
      </section>
      <section className="business-benefits">
        <article className="card"><Users/><h2>Für Beschäftigte</h2><p>Private Check-ins, klare Grenzen, Pausen und konkrete Selbsthilfe fördern Selbstwirksamkeit statt zusätzlichen Leistungsdruck.</p></article>
        <article className="card"><ShieldCheck/><h2>Für Unternehmen</h2><p>Ein strukturierter Rahmen für gesunde KI-Nutzung, Datenschutz, Führungsgespräche und digitale Gesundheitskompetenz.</p></article>
        <article className="card"><LockKeyhole/><h2>Ohne Überwachung</h2><p>Individuelle Einträge bleiben privat. Es gibt keine Emotionserkennung, Leistungsbewertung oder Weitergabe individueller Gesundheitsdaten an Arbeitgeber.</p></article>
      </section>
      <section className="card pilot-card"><div><span className="eyebrow">Vorschlag für einen 4-Wochen-Pilot</span><h2>Klein starten, gemeinsam lernen</h2></div><ol><li><strong>Woche 1:</strong> Ziele, Datenschutz, Betriebsrat und Freiwilligkeit klären.</li><li><strong>Woche 2:</strong> Kurzworkshop zu gesundem Prompten und Informationsschutz.</li><li><strong>Woche 3:</strong> Individuelle Nutzung der App ohne Zugriff der Führungskräfte.</li><li><strong>Woche 4:</strong> Freiwilliges, anonymes Feedback und gemeinsame Verbesserungen.</li></ol></section>
      <section className="card prohibited-use"><AlertTriangle size={25}/><div><span className="eyebrow">Verbindliche Nutzungsgrenze</span><h2>Kein Instrument für Personalentscheidungen</h2><p>Mindful AI darf weder Emotionen am Arbeitsplatz aus biometrischen Daten ableiten noch zur Überwachung, Leistungs- oder Verhaltensbewertung, Bewerberauswahl, Beförderung, Kündigung oder Zuweisung von Aufgaben eingesetzt werden. Die App verarbeitet ausschließlich freiwillige Selbstauskünfte für die Person selbst.</p></div></section>
      <section className="company-principles"><h2>Leitplanken für einen verantwortungsvollen Einsatz</h2><div>{["Keine Diagnose oder Eignungsbewertung", "Keine Emotionserkennung aus Stimme, Gesicht oder Verhalten", "Keine individuellen Gesundheitsdaten für Arbeitgeber", "Freiwilligkeit ohne Nachteile", "Betriebsrat und Datenschutz früh beteiligen", "Menschliche Verantwortung bleibt erhalten", "KI-Ausgaben klar kennzeichnen", "Löschung und Ausstieg jederzeit möglich", "KI-Kompetenz der Beteiligten schulen"].map((item) => <span key={item}><Check size={17}/>{item}</span>)}</div></section>
    </div>
  );
}

export function ImprintView() {
  return <LegalLayout title="Impressum" updated="Stand: 21. Juli 2026">
    <h2>Angaben gemäß § 5 DDG</h2><p>Rascha Al-Nemer<br/>The-Undercover-Trainer<br/>Rathausstraße 132<br/>68519 Viernheim<br/>Deutschland</p>
    <h2>Kontakt</h2><p>Telefon: <a href="tel:+4917636721988">+49 176 36721988</a><br/>E-Mail: <a href="mailto:trainer@the-undercover-trainer.com">trainer@the-undercover-trainer.com</a><br/>Website: <a href="https://the-undercover-trainer.com" target="_blank" rel="noreferrer">the-undercover-trainer.com</a></p>
    <h2>Verbraucherstreitbeilegung</h2><p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    <h2>Haftung für Inhalte und Links</h2><p>Wir erstellen die Inhalte dieser App mit Sorgfalt. Allgemeine Reflexions- und Selbsthilfehinweise ersetzen keine medizinische, psychologische oder rechtliche Beratung. Für Inhalte externer Links sind ausschließlich deren Betreiber verantwortlich.</p>
    <div className="legal-notice">Dieser Text wurde an die App angepasst, ist aber keine Rechtsberatung. Vor einer öffentlichen geschäftlichen Nutzung sollte das Impressum anwaltlich geprüft werden.</div>
  </LegalLayout>;
}

export function PrivacyView() {
  return <LegalLayout title="Datenschutzerklärung" updated="Stand: 21. Juli 2026 · Entwurf zur juristischen Prüfung">
    <div className="legal-notice"><strong>Wichtig:</strong> Diese Fassung beschreibt die aktuell geplante Technik. Vor dem öffentlichen Betrieb müssen die tatsächlich aktivierten Anbieter, Verträge, Löschfristen und Unternehmensprozesse geprüft und ergänzt werden.</div>
    <h2>1. Verantwortliche Stelle</h2><p>Rascha Al-Nemer, The-Undercover-Trainer, Rathausstraße 132, 68519 Viernheim. E-Mail: <a href="mailto:trainer@the-undercover-trainer.com">trainer@the-undercover-trainer.com</a>.</p>
    <h2>2. Zweck der App</h2><p>Die App unterstützt Nutzerinnen und Nutzer dabei, KI-Nutzungszeiten, subjektives Wohlbefinden, Selbstchecks und persönliche Reflexionen festzuhalten. Sie ist kein Medizinprodukt und führt keine Diagnosen durch.</p>
    <h2>3. Welche Daten verarbeitet werden</h2><ul><li>Kontodaten wie E-Mail-Adresse und Authentifizierungsdaten,</li><li>freiwillige Check-ins zu Stimmung, Stress, Schlaf, Verbundenheit und KI-Nutzung,</li><li>Selbstcheck-Ergebnisse, Fokus- und Tool-Nutzungszeiten sowie freiwillige Notizen,</li><li>technische Verbindungs- und Protokolldaten, die Hosting- und Sicherheitsanbieter verarbeiten können.</li></ul>
    <h2>4. Gesundheitsdaten und Rechtsgrundlagen</h2><p>Angaben zum emotionalen Befinden können Gesundheitsdaten im Sinne von Art. 9 DSGVO sein. Sie sollen nur nach ausdrücklicher, freiwilliger Einwilligung verarbeitet werden. Die Einwilligung kann mit Wirkung für die Zukunft widerrufen werden. Soweit Daten für Anmeldung, Sicherheit und Bereitstellung erforderlich sind, kommen daneben Art. 6 Abs. 1 lit. b oder lit. f DSGVO in Betracht. Die konkrete Rechtsgrundlagenprüfung muss vor dem Live-Betrieb abgeschlossen werden.</p>
    <h2>5. Empfänger und technische Dienste</h2><ul><li><strong>GitHub Pages:</strong> Auslieferung des statischen Frontends; GitHub kann technische Zugriffsdaten verarbeiten.</li><li><strong>Supabase:</strong> Passwortlose Anmeldung, Datenbank und serverseitige Funktionen. Das Projekt soll in einer europäischen Region betrieben werden; Row-Level Security trennt Benutzerkonten.</li><li><strong>Sprachmodell-Anbieter:</strong> Nur nach einer ausdrücklichen Aktion für die optionale KI-Reflexion. Dabei werden ausschließlich ausgewählte Zahlenwerte und Kategorien, keine freien Notizen, übertragen. Anbieter, Region, Auftragsverarbeitung und internationale Transfers sind vor Aktivierung verbindlich zu dokumentieren.</li><li><strong>OAuth-Anbieter:</strong> Nur wenn eine Anmeldung über den freiwillig gewählten Anbieter aktiviert und genutzt wird.</li></ul>
    <h2>6. Lokale Speicherung, Cookies und TLS</h2><p>Im Demo-Modus werden Eingaben ausschließlich im lokalen Speicher des Browsers abgelegt. Timer-Zustände können ebenfalls lokal gespeichert werden. Die App setzt selbst keine Marketing- oder Analyse-Cookies ein. Technisch notwendige Speicherzugriffe dienen der ausdrücklich gewünschten App-Funktion. Verbindungen werden per TLS verschlüsselt.</p>
    <h2>7. Drittlandtransfers</h2><p>Bei GitHub, Authentifizierungs- oder KI-Anbietern kann eine Verarbeitung außerhalb der EU bzw. des EWR nicht vollständig ausgeschlossen werden. Vor dem Live-Betrieb sind Angemessenheitsbeschlüsse, Standardvertragsklauseln und zusätzliche Schutzmaßnahmen je Anbieter zu prüfen und konkret zu benennen.</p>
    <h2>8. Speicherdauer und Löschung</h2><p>Persönliche App-Daten bleiben gespeichert, bis sie in der App gelöscht oder das Konto beendet wird, soweit keine gesetzlichen Pflichten entgegenstehen. Technische Protokolle der Dienstleister richten sich nach den vertraglich festgelegten Fristen. Verbindliche Löschfristen sind vor Veröffentlichung im Verzeichnis der Verarbeitungstätigkeiten festzulegen.</p>
    <h2>9. Rechte betroffener Personen</h2><p>Du hast – abhängig von den gesetzlichen Voraussetzungen – Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Widerruf einer Einwilligung. Außerdem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.</p>
    <h2>10. Beschäftigtenkontext und EU AI Act</h2><p>Bei einem Unternehmenseinsatz dürfen individuelle Gesundheits- und Nutzungsdaten nicht für Leistungs- oder Verhaltenskontrollen bereitgestellt werden. Die App darf keine Emotionen aus biometrischen Daten, Stimme, Gesichtsausdruck oder beobachtetem Verhalten ableiten. Sie verarbeitet ausschließlich freiwillige Selbstauskünfte für die betroffene Person. Freiwilligkeit, Rollen- und Berechtigungskonzept, Betriebsrat, Datenschutz-Folgenabschätzung, AI-Act-Einstufung und Rechtsgrundlage nach Beschäftigtendatenschutz sind vor jedem Pilotprojekt gesondert zu prüfen.</p>
    <h2>11. KI-Transparenz und menschliche Kontrolle</h2><p>Die optionale Sprachmodell-Reflexion ist als KI-generiert gekennzeichnet. Vor dem Start werden Zweck, Datenumfang und Grenzen erklärt. Die Ausgabe ist unverbindlich, kann Fehler enthalten und darf keine medizinische, arbeitsrechtliche oder personelle Entscheidung ersetzen. Hinweise oder Vorfälle können an die verantwortliche Stelle gemeldet werden.</p>
    <h2>12. Sicherheitsmaßnahmen</h2><p>Vorgesehen sind TLS, verschlüsselte Speicherung durch den Infrastrukturprovider, Zugriffstrennung per Row-Level Security, Datenminimierung, keine Übertragung freier Notizen an das Sprachmodell sowie Export- und Löschfunktionen.</p>
    <p className="legal-links"><a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub-Datenschutz <ExternalLink size={14}/></a><a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Supabase-Datenschutz <ExternalLink size={14}/></a></p>
  </LegalLayout>;
}

export function AiActView() {
  return (
    <div className="page-container ai-act-page">
      <header className="page-heading"><span className="eyebrow">EU AI Act · Transparenz & Grenzen</span><h1>So wird KI in dieser App eingesetzt</h1><p>Stand: 21. Juli 2026. Diese Produktinformation schafft Transparenz, ersetzt aber keine individuelle rechtliche Konformitätsprüfung vor dem Live-Betrieb.</p></header>

      <section className="ai-act-summary">
        <article className="card"><BrainCircuit/><span className="eyebrow">KI-Funktion</span><h2>Begrenzte Reflexion</h2><p>Nur die freiwillig gestartete Reflexion verwendet ein Sprachmodell. Selbstcheck, Timer, Diagramme und Tool-Navigator arbeiten ohne generative KI.</p></article>
        <article className="card"><UserCheck/><span className="eyebrow">Menschliche Kontrolle</span><h2>Keine automatische Entscheidung</h2><p>Ausgaben sind Vorschläge. Nutzerinnen und Nutzer prüfen sie selbst; sie haben keine Wirkung auf Behandlung, Arbeit oder Personalentscheidungen.</p></article>
        <article className="card"><ShieldCheck/><span className="eyebrow">Risikogrenze</span><h2>Keine Emotionserkennung</h2><p>Die App analysiert weder Gesicht, Stimme noch andere biometrische oder beobachtete Verhaltenssignale. Sie nutzt nur bewusste Selbstauskünfte.</p></article>
      </section>

      <section className="card intended-purpose"><Scale size={27}/><div><span className="eyebrow">Dokumentierter Verwendungszweck</span><h2>Persönliche Reflexions- und Präventionshilfe</h2><p>Mindful AI hilft erwachsenen Nutzerinnen und Nutzern, ihre selbst berichtete KI-Nutzung, Arbeitsrhythmen und ihr subjektives Befinden zu reflektieren. Die App ist kein Medizinprodukt, kein Diagnosesystem und kein System zur Bewertung von Beschäftigten.</p></div></section>

      <section className="card prohibited-list"><span className="eyebrow">Ausdrücklich untersagt</span><h2>Diese Nutzungen sind nicht Bestandteil der App</h2><div>{[
        "Emotionen aus Gesicht, Stimme, Körperdaten oder Verhalten ableiten",
        "Beschäftigte überwachen oder Leistung, Verhalten und Produktivität individuell bewerten",
        "Bewerbung, Einstellung, Beförderung, Kündigung oder Aufgabenzuweisung beeinflussen",
        "Psychische Erkrankungen, Krisen, Eignung oder Arbeitsfähigkeit diagnostizieren",
        "Nutzer durch manipulative oder täuschende Gestaltung zu Entscheidungen drängen",
        "KI-Ausgaben ungeprüft als professionelle oder verbindliche Entscheidung verwenden",
      ].map((item) => <p key={item}><AlertTriangle size={17}/>{item}</p>)}</div></section>

      <section className="compliance-grid">
        <article className="card"><FileCheck2/><h2>Transparenz</h2><p>KI-Funktionen und KI-generierte Texte werden sichtbar gekennzeichnet. Zweck, verwendete Daten, Grenzen und menschliche Verantwortung werden vor der Nutzung erklärt.</p></article>
        <article className="card"><GraduationCap/><h2>KI-Kompetenz</h2><p>Unternehmen müssen Mitarbeitende und Verantwortliche passend zu Rolle, Erfahrung und Nutzungskontext schulen. Der Pilot beginnt deshalb mit einer dokumentierten Einweisung.</p></article>
        <article className="card"><LockKeyhole/><h2>Kontrolle & Meldung</h2><p>Daten lassen sich exportieren und löschen. Fehlerhafte, diskriminierende oder unerwartete KI-Ausgaben können gemeldet und die KI-Funktion kann deaktiviert werden.</p><a href="mailto:trainer@the-undercover-trainer.com?subject=Hinweis%20zur%20KI-Funktion">KI-Vorfall oder Hinweis melden</a></article>
      </section>

      <section className="legal-notice ai-act-notice"><strong>Vor einem Unternehmenseinsatz erforderlich:</strong> Verantwortliche Rolle festlegen, Anbieter und Modell dokumentieren, Risikoklassifizierung bestätigen, KI-Kompetenzmaßnahmen nachweisen, Datenschutz-Folgenabschätzung prüfen, Betriebsrat einbeziehen, Vorfall- und Abschaltprozess testen und die Zweckbindung vertraglich absichern.</section>

      <p className="legal-links"><a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noreferrer">EU AI Act im Original <ExternalLink size={14}/></a><a href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" target="_blank" rel="noreferrer">EU-Kommission: Überblick <ExternalLink size={14}/></a></p>
    </div>
  );
}

function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return <div className="page-container legal-page"><header className="page-heading"><span className="eyebrow">The Undercover Trainer</span><h1>{title}</h1><p>{updated}</p></header><article className="card legal-copy">{children}</article></div>;
}
