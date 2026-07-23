# Mindful AI im Google Play Store veröffentlichen

Diese Anleitung ist bewusst für eine Umsetzung mit wenig Technikwissen geschrieben. Die Webapp und das Android-Projekt sind vorbereitet. Für die tatsächliche Veröffentlichung werden noch ein Google-Play-Entwicklerkonto, eine öffentliche GitHub-Pages-Adresse, ein fertig eingerichtetes Supabase-Projekt und ein sicher verwahrter Upload-Schlüssel benötigt.

## Technischer Stand

- App-Name: **Mindful AI**
- Android-Paket-ID: `com.theundercovertrainer.mindfulai`
- Version: `1.0` / Version Code `1`
- Mindestversion: Android 7.0 / API 24
- Zielversion: Android 16 / API 36
- Geräteberechtigungen: ausschließlich Internetzugriff
- Anmeldung: E-Mail-Magic-Link oder optional Google OAuth
- Datenbank und Konten: Supabase
- öffentliche Datenschutzerklärung: `https://raschaski.github.io/-ki-health-app/datenschutz.html`
- öffentliche Kontolöschung: `https://raschaski.github.io/-ki-health-app/account-loeschen.html`

Die Paket-ID sollte nach dem ersten Upload nicht mehr geändert werden.

## 1. Supabase produktionsbereit machen

1. Projekt in einer EU-Region anlegen.
2. `supabase/schema.sql` im SQL Editor ausführen.
3. Unter **Authentication → URL Configuration** freigeben:
   - `https://raschaski.github.io/-ki-health-app/`
   - `com.theundercovertrainer.mindfulai://auth-callback`
4. Die drei Funktionen bereitstellen:

```bash
supabase login
supabase link --project-ref DEINE_PROJEKT_ID
supabase functions deploy health-reflection
supabase functions deploy overwhelm-compass
supabase functions deploy tool-navigator-advice
supabase functions deploy delete-account
supabase secrets set OPENAI_API_KEY=DEIN_OPENAI_API_SCHLUESSEL
supabase secrets set APP_ORIGIN=https://raschaski.github.io
```

5. Für Magic Links vor dem öffentlichen Start einen eigenen SMTP-Anbieter einrichten.
6. Anmeldung, Datenexport, Datenlöschung und vollständige Kontolöschung testen.

## 2. Webversion öffentlich bereitstellen

Im GitHub-Repository unter **Settings → Pages** als Quelle **GitHub Actions** wählen. Unter **Settings → Secrets and variables → Actions → Variables** diese Werte anlegen:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Nach einem Push auf `main` veröffentlicht der vorhandene Workflow die Webapp. Anschließend insbesondere diese Seiten ohne Anmeldung prüfen:

- Datenschutzerklärung
- Kontolöschung
- Impressum
- Gesundheitshinweis auf der Startseite

## 3. Upload-Schlüssel einmalig erstellen

Der Upload-Schlüssel signiert jede zukünftige Version. Er darf nicht verloren gehen und niemals in das Repository eingecheckt werden. Am einfachsten wird er in Android Studio unter **Build → Generate Signed Bundle / APK → Android App Bundle** erstellt.

Für den automatischen GitHub-Build werden anschließend vier Repository-Secrets benötigt:

- `ANDROID_KEYSTORE_BASE64`: Base64-Inhalt der Keystore-Datei
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Die eigentliche Keystore-Datei zusätzlich verschlüsselt an einem sicheren Ort sichern. Sie ist durch `.gitignore` vom Repository ausgeschlossen.

## 4. Signiertes App-Bundle erzeugen

1. GitHub-Repository öffnen.
2. **Actions → Android-App bauen → Run workflow** starten.
3. Nach erfolgreichem Lauf unter **Artifacts** `mindful-ai-play-store` herunterladen.
4. Darin befindet sich `app-release.aab`.

Ohne die vier Signierungs-Secrets wird nur `mindful-ai-android-test` für technische Tests erzeugt.

## 5. Play-Console-Eintrag anlegen

1. In der Google Play Console eine neue App **Mindful AI** anlegen.
2. Standardsprache Deutsch und Kategorie **Gesundheit & Fitness** oder **Lifestyle** wählen.
3. Das signierte `app-release.aab` zuerst in den internen Test hochladen.
4. Play App Signing aktivieren.
5. Kontakt-E-Mail und Support-Website angeben.
6. Die öffentliche Datenschutzerklärung und die öffentliche Kontolöschseite eintragen.

## 6. Vorgeschlagene Store-Texte

### App-Name

`Mindful AI`

### Kurzbeschreibung

`KI-Nutzung reflektieren, Fokus stärken und gesunde Pausen etablieren.`

### Ausführliche Beschreibung

> Mindful AI unterstützt dich dabei, bewusster und emotional gesünder mit KI-Werkzeugen zu arbeiten.
>
> Erfasse freiwillig Stimmung, Stress, Schlaf, Fokuszeiten und deine Nutzung von KI-Tools. Der KI-Überforderungskompass, ein Pomodoro-Timer mit Pausenimpulsen, Atemübungen, Mini-Meditationen und Klarheitsfragen helfen dir dabei, deine Arbeitsweise zu reflektieren. Ein Tool-Navigator ordnet Aufgaben lokal ein und kann auf deinen ausdrücklichen Wunsch eine KI-generierte Schritt-für-Schritt-Anleitung mit Werkzeugtypen, Beispiel-Prompts und Prüfschritten erstellen. Trends zu Zeit, subjektivem Nutzen und Belastung bleiben für dich nachvollziehbar.
>
> Für Unternehmen bietet Mindful AI einen freiwilligen, datenschutzorientierten Rahmen für KI-Kompetenz und Mitarbeitergesundheit. Die App ist kein Instrument zur Leistungs- oder Verhaltenskontrolle und erkennt keine Emotionen aus Gesicht, Stimme oder Verhalten.
>
> Mindful AI ist kein Medizinprodukt und diagnostiziert, behandelt, heilt oder verhindert keine Erkrankung. Die Inhalte ersetzen keine medizinische oder psychologische Beratung. Bei gesundheitlichen Fragen wende dich an eine qualifizierte Fachperson.

Die optionale Sprachmodell-Auswertung muss auch in Store-Screenshots klar als KI-generiert gekennzeichnet bleiben.

## 7. Angaben für „App-Inhalte“

### Health-Apps-Erklärung

Die App hat gesundheitsbezogene Funktionen. Voraussichtlich passende Kategorien:

- Stress Management, Relaxation, Mental Acuity
- gegebenenfalls weitere Kategorien nur, wenn die tatsächliche veröffentlichte Funktion sie erfüllt

Dabei klar angeben:

- persönliche Reflexions- und Präventionshilfe
- keine Diagnose oder Behandlung
- kein Medizinprodukt
- keine Verbindung zu medizinischer Hardware oder Health Connect

### Datensicherheit

Die Erklärung muss anhand der tatsächlichen Produktionskonfiguration ausgefüllt werden. Zu prüfen und offen anzugeben sind insbesondere:

- E-Mail-Adresse für Anmeldung und Kontoverwaltung
- freiwillige gesundheitsbezogene Selbstauskünfte
- freiwillige App-Aktivität wie Check-ins, Fokus- und Tool-Sitzungen
- technische Daten, die Supabase, GitHub Pages, OAuth-, SMTP- oder KI-Anbieter verarbeiten
- Verschlüsselung bei der Übertragung
- Löschmöglichkeit in der App und über eine öffentliche Webseite

Keine Angabe pauschal übernehmen, wenn später Analyse-, Werbe-, Crash-, Zahlungs- oder weitere SDKs ergänzt werden.

### Zielgruppe und Inhalte

- Zielgruppe: Erwachsene
- keine Werbung
- keine In-App-Käufe, solange keine Bezahlfunktion eingebaut ist
- keine Standort-, Kamera-, Mikrofon-, Kontakt-, Sensor- oder Health-Connect-Berechtigung

### KI und Mitarbeitergesundheit

Die App darf nicht als System zur Emotionserkennung, Beschäftigtenüberwachung, Eignungsbewertung oder Personalentscheidung beworben oder eingesetzt werden. Unternehmen erhalten keine individuellen Gesundheits- oder Nutzungsdaten von Beschäftigten.

## 8. Vor dem Produktionsstart testen

- Installation und Start auf mindestens einem echten Android-Gerät
- E-Mail-Magic-Link kehrt in die Android-App zurück
- Google OAuth kehrt in die Android-App zurück, falls aktiviert
- Check-in, KI-Kompass, Timer, Übungen und Tool-Erfassung
- App im Hintergrund und nach erneutem Öffnen
- Export und Löschung aller App-Daten
- vollständige Kontolöschung
- Datenschutzerklärung und Löschseite ohne Anmeldung erreichbar
- Darstellung bei großer Schrift und auf kleinem Bildschirm
- keine geheimen Schlüssel im App-Bundle
- keine medizinischen Versprechen in Texten und Bildern

Erst danach vom internen Test in den geschlossenen Test und anschließend in die Produktion wechseln.

## 9. Für jede neue Version

In `android/app/build.gradle`:

1. `versionCode` immer um mindestens 1 erhöhen.
2. `versionName` verständlich fortschreiben, zum Beispiel von `1.0` auf `1.1`.
3. Workflow erneut starten.
4. Änderungen an Datenverarbeitung, Berechtigungen, KI-Anbietern, Gesundheitsfunktionen und Rechtstexten in der Play Console nachziehen.

## Rechtlicher Hinweis

Diese Checkliste ist eine technische und redaktionelle Vorbereitung, keine Rechtsberatung. Datenschutzerklärung, Einwilligung, Google-Play-Angaben, Beschäftigtenkonzept und EU-AI-Act-Einstufung müssen vor einem öffentlichen oder betrieblichen Produktivbetrieb anhand der tatsächlich verwendeten Dienste professionell geprüft werden.
