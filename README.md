# Mindful AI

Eine einfache Webapp zur Reflexion darüber, wie sich die persönliche Nutzung von KI auf Stimmung, Stress, Verbundenheit und Schlaf auswirken kann.

Die App ist ein Reflexionswerkzeug. Sie stellt keine Diagnosen und ersetzt keine medizinische, psychologische oder therapeutische Beratung.

## Was bereits funktioniert

- statische React-/HTML-Webapp für GitHub Pages
- passwortlose Anmeldung per Supabase Magic Link
- optionale Google-Anmeldung
- tägliche Check-ins in Supabase Postgres
- persönliche Zugriffsregeln mit Row-Level Security
- Diagramme mit Recharts
- lokale Korrelationshinweise
- optionaler KI-Rückblick über eine geschützte Supabase Edge Function
- Export und Löschen der eigenen Check-ins
- Demo-Modus ohne Backend-Konfiguration

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
- `src/styles.css`: responsive Gestaltung
- `supabase/schema.sql`: Datenbank und Zugriffsregeln
- `supabase/functions/health-reflection/index.ts`: optionale KI-Funktion
- `.github/workflows/deploy-pages.yml`: automatische Veröffentlichung
- `KI-Health-App-Projektplan.md`: fachlicher Projektplan

## Datenschutz-Hinweis

Die technische Grundstruktur reduziert Risiken durch TLS, Supabase Row-Level Security und einen serverseitig geschützten KI-Schlüssel. Vor einer öffentlichen Nutzung mit echten Gesundheitsdaten sind trotzdem eine professionelle Datenschutzprüfung, eine Datenschutzerklärung, ein Löschkonzept und gegebenenfalls eine rechtliche Prüfung erforderlich.
