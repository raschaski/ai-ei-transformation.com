# Mindful AI

Eine einfache Webapp zur Reflexion darüber, wie sich die persönliche Nutzung von KI auf Stimmung, Stress, Verbundenheit und Schlaf auswirken kann.

Die App ist ein Reflexionswerkzeug. Sie stellt keine Diagnosen und ersetzt keine medizinische, psychologische oder therapeutische Beratung.

## Was bereits funktioniert

- statische React-/HTML-Webapp für GitHub Pages
- installierbare Progressive Web App (PWA)
- native Android-Hülle mit Capacitor und automatischem App-Bundle-Build
- passwortlose Anmeldung per Supabase Magic Link
- optionale Google-Anmeldung
- tägliche Check-ins in Supabase Postgres
- vollständig eingearbeiteter, siebenstufiger KI-Kompass aus der Original-`index.html` mit Startseite, inneren Anteilen, Handlungsschritten und 7-Tage-Plan
- wahlweise lokale Auswertung oder ausdrücklich aktivierte KI-Vertiefung über eine geschützte Edge Function
- Pomodoro-Timer mit 25 Minuten Fokus und fünfminütigen Pausenimpulsen
- Emotionscheck, Atemübung, Mini-Meditation und Reflexionsfragen
- KI-Tool-Navigator mit lokaler Einordnung und optionaler strukturierter OpenAI-Arbeitsanleitung
- Zeiterfassung und Effektivitäts-/Belastungscheck für KI-Tools
- gemeinsame Trendansicht für Wohlbefinden, Fokus und Tool-Nutzung
- eigener Bereich für einen datenschutzorientierten Mittelstands-Pilot
- persönliche Zugriffsregeln mit Row-Level Security
- Diagramme mit Recharts
- lokale Korrelationshinweise
- optionaler KI-Rückblick über eine geschützte Supabase Edge Function
- Export und Löschen aller eigenen App-Daten
- vorgeschalteter Startschritt mit Name, E-Mail, optionaler Telefonnummer, Datenschutzbestätigung, Gesundheitsdaten-Einwilligung und gesonderter freiwilliger Kontaktfreigabe
- vollständige Kontolöschung in der App und öffentliche Löschanfrage
- Demo-Modus ohne Backend-Konfiguration
- Branding, Impressum und ein technikspezifischer Datenschutzentwurf
- EU-AI-Act-Transparenzseite, KI-Kennzeichnung und dokumentierte Nutzungsgrenzen

## Einmalige Einrichtung ohne Serverprogrammierung

Die ausführlichen Schritte stehen in [EINRICHTUNG.md](EINRICHTUNG.md). Du benötigst Konten bei GitHub und Supabase. Für die optionale KI-Reflexion wird zusätzlich ein OpenAI-API-Schlüssel benötigt.

## Lokal starten

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Ohne `.env.local` startet die App automatisch im Demo-Modus.

## Als Android-App

Das Verzeichnis `android/` enthält das fertige Capacitor-Projekt mit Paket-ID `com.theundercovertrainer.mindfulai`. Es verwendet Android API 36, benötigt nur Internetzugriff und öffnet Supabase-Anmeldelinks wieder in der App.

```bash
pnpm build:android
pnpm android:open
```

Ohne lokale Android-Entwicklungsumgebung kann unter GitHub über den Workflow **Android-App bauen** automatisch ein testbares `.aab` erzeugt werden. Die vollständige Veröffentlichung ist in [PLAY-STORE-VEROEFFENTLICHUNG.md](PLAY-STORE-VEROEFFENTLICHUNG.md) erklärt.

## Wichtige Dateien

- `src/App.tsx`: Oberfläche und Nutzerabläufe
- `src/components/`: Fokus, Selbstcheck, KI-Navigator, Unternehmen und Rechtstexte
- `src/styles.css`: responsive Gestaltung
- `supabase/schema.sql`: Datenbank, Kontakt-Einwilligungsnachweise und Zugriffsregeln
- `supabase/functions/health-reflection/index.ts`: optionale KI-Funktion
- `supabase/functions/overwhelm-compass/index.ts`: optionale strukturierte KI-Kompass-Vertiefung
- `supabase/functions/tool-navigator-advice/index.ts`: genaue Tool- und Prompt-Anleitung über OpenAI
- `supabase/functions/delete-account/index.ts`: sichere vollständige Kontolöschung
- `.github/workflows/deploy-pages.yml`: automatische Veröffentlichung
- `.github/workflows/android-build.yml`: Android-App-Bundle für Tests und Play Store
- `capacitor.config.json` und `android/`: native Android-App
- `public/manifest.webmanifest` und `public/sw.js`: installierbare PWA
- `public/datenschutz.html`: öffentlich erreichbare Datenschutzerklärung
- `public/account-loeschen.html`: öffentlich erreichbare Löschanfrage
- `KI-Health-App-Projektplan.md`: fachlicher Projektplan
- `EU-AI-ACT-CHECKLISTE.md`: KI-Inventar, Risikogrenzen und offene Compliance-Schritte
- `PLAY-STORE-VEROEFFENTLICHUNG.md`: einfache Store-Checkliste und fertige Beschreibungstexte

## Datenschutz-Hinweis

Die technische Grundstruktur reduziert Risiken durch TLS, Supabase Row-Level Security, Datenminimierung und einen serverseitig geschützten KI-Schlüssel. Die App enthält angepasste Entwürfe für Impressum und Datenschutz. Vor einer öffentlichen Nutzung mit echten Gesundheits- oder Beschäftigtendaten müssen diese dennoch professionell geprüft und die tatsächlich eingesetzten Anbieter, Verträge, Löschfristen, Einwilligungen und Unternehmensprozesse dokumentiert werden.
