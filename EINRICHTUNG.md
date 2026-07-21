# Mindful AI einrichten – einfache Schritt-für-Schritt-Anleitung

Für den Demo-Modus musst du nichts konfigurieren. Für echte Benutzerkonten und gespeicherte Check-ins führst du die folgenden Schritte einmal aus.

## 1. Supabase-Projekt erstellen

1. Öffne [supabase.com](https://supabase.com) und erstelle ein Konto.
2. Wähle **New project**.
3. Wähle als Region **Central EU (Frankfurt)** oder eine andere passende EU-Region.
4. Bewahre das Datenbankpasswort sicher auf.

## 2. Datenbank vorbereiten

1. Öffne im Supabase-Projekt den Bereich **SQL Editor**.
2. Erstelle eine neue Abfrage.
3. Kopiere den vollständigen Inhalt aus `supabase/schema.sql` hinein.
4. Klicke auf **Run**.

Das Skript erstellt die Tabellen `check_ins`, `tool_sessions`, `self_checks` und `focus_sessions`. Die Zugriffsregeln sorgen dafür, dass ein angemeldeter Nutzer ausschließlich seine eigenen Einträge lesen und – je nach Datentyp – anlegen, ändern oder löschen kann.

## 3. Passwortlose Anmeldung konfigurieren

Öffne in Supabase **Authentication → URL Configuration** und trage ein:

- Site URL: `https://raschaski.github.io/-ki-health-app/`
- zusätzliche Redirect URL: `https://raschaski.github.io/-ki-health-app/`
- für lokale Tests zusätzlich: `http://localhost:5173/`

Magic Links per E-Mail sind in Supabase standardmäßig aktiviert. Für einen öffentlichen Produktivbetrieb benötigst du einen eigenen SMTP-E-Mail-Dienst. Der eingebaute Testversand ist nur für freigegebene Projektadressen gedacht.

### Google-Anmeldung – optional

Wenn du Google OAuth nicht einrichtest, funktioniert die Anmeldung per E-Mail weiterhin. Du kannst den Google-Provider später unter **Authentication → Providers → Google** aktivieren.

## 4. Öffentliche Supabase-Werte kopieren

Öffne **Project Settings → API Keys** und kopiere:

- Project URL
- Publishable Key

Der Publishable Key darf in einer Browser-App verwendet werden. Verwende dort niemals einen Secret Key oder den alten `service_role`-Schlüssel.

## 5. GitHub Pages vorbereiten

Öffne im GitHub-Repository:

1. **Settings → Secrets and variables → Actions → Variables**
2. Lege `VITE_SUPABASE_URL` mit der Project URL an.
3. Lege `VITE_SUPABASE_PUBLISHABLE_KEY` mit dem Publishable Key an.
4. Öffne **Settings → Pages**.
5. Wähle bei Source **GitHub Actions**.

Nach dem nächsten Push auf `main` baut und veröffentlicht GitHub die Website automatisch.

## 6. Optionale KI-Reflexion aktivieren

Die App funktioniert auch ohne diesen Schritt. Ohne KI-Funktion bleiben Check-ins, Diagramme und lokale Hinweise vollständig nutzbar.

Die Datei `supabase/functions/health-reflection/index.ts` enthält die fertige Edge Function. Sie:

- akzeptiert nur angemeldete Nutzer,
- übermittelt höchstens 14 Check-ins,
- übermittelt keine freien Tagebuchtexte,
- speichert die OpenAI-Antwort nicht dauerhaft,
- erwartet ein fest definiertes JSON-Format,
- darf keine Diagnose oder Therapieempfehlung formulieren.

### Bereitstellung mit Supabase CLI

```bash
supabase login
supabase link --project-ref DEINE_PROJEKT_ID
supabase functions deploy health-reflection
supabase functions deploy overwhelm-compass
supabase secrets set OPENAI_API_KEY=DEIN_OPENAI_API_SCHLUESSEL
supabase secrets set APP_ORIGIN=https://raschaski.github.io
```

Der OpenAI-Schlüssel gehört ausschließlich in die Supabase-Secrets und niemals in GitHub, `.env.local`, eine HTML-Datei oder den Browser-Code. Die alte Testdatei mit einem direkt eingebetteten Schlüssel darf nicht veröffentlicht werden.

## 7. Vor einer öffentlichen Veröffentlichung

- die in der App enthaltene Datenschutzerklärung juristisch prüfen und alle Platzhalter zu Anbietern, Verträgen und Löschfristen konkretisieren
- Impressum juristisch prüfen
- Einwilligungstexte prüfen lassen
- Aufbewahrungs- und Löschfristen festlegen
- Auftragsverarbeitungsverträge mit Supabase, E-Mail- und KI-Anbietern abschließen und Drittlandtransfers dokumentieren
- bei Unternehmenseinsatz Betriebsrat, Datenschutzbeauftragte und Beschäftigtendatenschutz frühzeitig einbeziehen
- individuelle Gesundheitsdaten niemals für Leistungs- oder Verhaltenskontrollen bereitstellen
- professionelles SMTP für Magic Links einrichten
- Krisenkontakte für die vorgesehene Zielregion prüfen
- Sicherheits- und Datenschutzprüfung durchführen
- keine medizinische Wirksamkeit versprechen
- die [EU-AI-ACT-CHECKLISTE.md](EU-AI-ACT-CHECKLISTE.md) vollständig bearbeiten und verantwortliche Person benennen
- KI-Funktion, Modell, Anbieter, Version und dokumentierten Verwendungszweck in einem Änderungsregister pflegen
- KI-Kompetenzschulung für alle Personen dokumentieren, die die KI-Funktion im Namen des Anbieters oder eines Unternehmens betreiben oder unterstützen
- sicherstellen, dass die App niemals zur Emotionserkennung, Beschäftigtenüberwachung oder Personalentscheidung verwendet wird

## Häufiges Problem: Die App zeigt nur den Demo-Modus

Dann fehlen beim GitHub-Build meist die beiden Repository-Variablen aus Schritt 5. Prüfe die Schreibweise und starte den Workflow unter **Actions** erneut.

## Häufiges Problem: Magic Link führt nicht zurück zur App

Prüfe in Supabase die Site URL und Redirect URL. Beide müssen den vollständigen GitHub-Pages-Pfad `https://raschaski.github.io/-ki-health-app/` enthalten.
