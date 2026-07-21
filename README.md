# Mindful AI

Eine einfache Webapp zur Reflexion darüber, wie sich die persönliche Nutzung von KI auf Stimmung, Stress, Verbundenheit und Schlaf auswirken kann.

Die App ist ein Reflexionswerkzeug. Sie stellt keine Diagnosen und ersetzt keine medizinische, psychologische oder therapeutische Beratung.

## Was bereits funktioniert

- statische React-/HTML-Webapp für GitHub Pages
- passwortlose Anmeldung per Supabase Magic Link
- optionale Google-Anmeldung
- tägliche Check-ins in Supabase Postgres
- vollständig eingearbeiteter, siebenstufiger KI-Kompass aus der Original-`index.html` mit Startseite, inneren Anteilen, Handlungsschritten und 7-Tage-Plan
- wahlweise lokale Auswertung oder ausdrücklich aktivierte KI-Vertiefung über eine geschützte Edge Function
- Pomodoro-Timer mit 25 Minuten Fokus und fünfminütigen Pausenimpulsen
- Emotionscheck, Atemübung, Mini-Meditation und Reflexionsfragen
- lokaler KI-Tool-Navigator mit Datenschutzwarnungen
- Zeiterfassung und Effektivitäts-/Belastungscheck für KI-Tools
- gemeinsame Trendansicht für Wohlbefinden, Fokus und Tool-Nutzung
- eigener Bereich für einen datenschutzorientierten Mittelstands-Pilot
- persönliche Zugriffsregeln mit Row-Level Security
- Diagramme mit Recharts
- lokale Korrelationshinweise
- optionaler KI-Rückblick über eine geschützte Supabase Edge Function
- Export und Löschen aller eigenen App-Daten
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

## Wichtige Dateien

- `src/App.tsx`: Oberfläche und Nutzerabläufe
- `src/components/`: Fokus, Selbstcheck, KI-Navigator, Unternehmen und Rechtstexte
- `src/styles.css`: responsive Gestaltung
- `supabase/schema.sql`: Datenbank und Zugriffsregeln
- `supabase/functions/health-reflection/index.ts`: optionale KI-Funktion
- `supabase/functions/overwhelm-compass/index.ts`: optionale strukturierte KI-Kompass-Vertiefung
- `.github/workflows/deploy-pages.yml`: automatische Veröffentlichung
- `KI-Health-App-Projektplan.md`: fachlicher Projektplan
- `EU-AI-ACT-CHECKLISTE.md`: KI-Inventar, Risikogrenzen und offene Compliance-Schritte

## Datenschutz-Hinweis

Die technische Grundstruktur reduziert Risiken durch TLS, Supabase Row-Level Security, Datenminimierung und einen serverseitig geschützten KI-Schlüssel. Die App enthält angepasste Entwürfe für Impressum und Datenschutz. Vor einer öffentlichen Nutzung mit echten Gesundheits- oder Beschäftigtendaten müssen diese dennoch professionell geprüft und die tatsächlich eingesetzten Anbieter, Verträge, Löschfristen, Einwilligungen und Unternehmensprozesse dokumentiert werden.
