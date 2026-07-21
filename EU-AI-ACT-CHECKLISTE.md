# EU-AI-Act-Checkliste für Mindful AI

**Stand:** 21. Juli 2026  
**Dokumentstatus:** Technische Arbeitsgrundlage – vor Live-Betrieb und jedem Unternehmenseinsatz rechtlich prüfen.  
**Verantwortliche Anbieterin der App:** Rascha Al-Nemer, The-Undercover-Trainer

## 1. KI-Inventar

| Funktion | Technik | KI-System? | Daten | Entscheidung |
|---|---|---:|---|---|
| Optionale KI-Reflexion | externes Sprachmodell über Supabase Edge Function | Ja | höchstens 14 selbst eingegebene Zahlenwerte und Kategorien | Nein, nur unverbindliche Reflexion |
| Optionale KI-Kompass-Vertiefung | externes Sprachmodell über Supabase Edge Function | Ja | sieben ausdrücklich freigegebene Testantworten einschließlich zweier Freitexte | Nein, nur unverbindliche Reflexion |
| Überforderungs-Selbstcheck | feste Punktelogik | Nein | bewusste Selbstauskunft | Nein |
| KI-Tool-Navigator | lokale Stichwortregeln | Nein | lokal eingegebene Aufgabenbeschreibung | Nein |
| Diagramme und lokale Trends | feste Berechnungen | Nein | eigene Check-ins und Nutzungszeiten | Nein |
| Pomodoro-Timer | Zeitsteuerung | Nein | Zeit und Pausenaktivität | Nein |

Aktuell verwendetes Sprachmodell laut Edge Function: `gpt-5.6-luna`. Vor jeder Bereitstellung sind Modellname, Anbieter, Version, Region, Vertrag und Änderungen erneut zu dokumentieren.

## 2. Rollen und vorläufige Risikoeinstufung

- The-Undercover-Trainer ist voraussichtlich **Anbieterin des integrierten KI-Systems**, wenn die App unter eigenem Namen bereitgestellt wird.
- Ein Unternehmen, das die App im eigenen Betrieb einsetzt, ist voraussichtlich **Betreiber/Deployer**.
- Der externe Sprachmodell-Anbieter ist Anbieter des zugrunde liegenden General-Purpose-AI-Modells.
- Die optionale Reflexion ist nach dem dokumentierten Verwendungszweck voraussichtlich kein Hochrisiko-System. Voraussetzung ist, dass sie weder medizinische Entscheidungen noch Beschäftigten-, Eignungs-, Leistungs- oder Personalentscheidungen beeinflusst.
- Eine verbindliche rechtliche Klassifizierung muss vor Markteinführung und nach jeder wesentlichen Zweck- oder Funktionsänderung wiederholt werden.

## 3. Dokumentierter Verwendungszweck

Mindful AI ist eine persönliche Reflexions- und Präventionshilfe für erwachsene Nutzerinnen und Nutzer. Die App unterstützt beim bewussten Umgang mit KI-Arbeitszeit, Pausen und selbst berichtetem subjektivem Befinden. Sie ist kein Medizinprodukt, kein Diagnosesystem und kein Instrument zur Bewertung von Beschäftigten.

## 4. Verbotene und nicht freigegebene Nutzungen

- Emotionen aus Gesicht, Stimme, Körperdaten, biometrischen Merkmalen oder beobachtetem Verhalten ableiten
- Beschäftigte überwachen oder ihre Leistung, Produktivität, ihr Verhalten oder ihre Eignung bewerten
- Entscheidungen über Bewerbung, Einstellung, Arbeitsaufgaben, Beförderung, Vergütung oder Kündigung vorbereiten
- Erkrankungen, Krisen, Arbeitsfähigkeit oder Behandlungsbedarf diagnostizieren
- besonders schutzbedürftige Personen manipulieren oder mit täuschenden Mustern zu Entscheidungen drängen
- individuelle Gesundheitsdaten an Arbeitgeber oder Führungskräfte weitergeben
- KI-Ausgaben ohne menschliche Prüfung als professionelle oder verbindliche Entscheidung verwenden

Eine Änderung in eine dieser Richtungen ist kein gewöhnliches Produktupdate. Sie erfordert einen Entwicklungsstopp, eine neue rechtliche Einstufung und eine gesonderte Freigabe.

## 5. Bereits technisch umgesetzt

- [x] KI-Funktion sichtbar als KI gekennzeichnet
- [x] Zweck, Datenumfang und Grenzen vor jeder KI-Reflexion erklärt
- [x] bewusste Aktivierung der einzelnen KI-Reflexion
- [x] keine freien Tagebuchtexte in der Modellanfrage
- [x] strukturierte Modellausgabe mit festem JSON-Schema
- [x] Prompt verbietet Diagnose, Emotionserkennung, Leistungs- und Eignungsableitung
- [x] Ausgabe als fehleranfällig und menschlich zu prüfen gekennzeichnet
- [x] keine automatische Entscheidung und keine Arbeitgeberansicht
- [x] Selbstcheck und Tool-Navigator ausdrücklich als nicht-generative, regelbasierte Funktionen erklärt
- [x] Export- und Löschfunktion für persönliche Daten
- [x] Row-Level Security und explizite Datenbankrechte für persönliche Datensätze
- [x] Meldeweg für unerwartete oder problematische KI-Ausgaben

## 6. Vor dem öffentlichen Live-Betrieb offen

- [ ] Verantwortliche Person für AI-Act-Compliance und Stellvertretung benennen
- [ ] verbindliche juristische Risikoklassifizierung dokumentieren
- [ ] Anbieter-, Modell-, Versions- und Änderungsregister führen
- [ ] Verträge, Modellinformationen und technische Dokumentation des Sprachmodell-Anbieters prüfen
- [ ] Testfälle für Halluzinationen, diskriminierende Ausgaben, unzulässige Diagnosen und Sicherheitsgrenzen dokumentieren
- [ ] Abschaltmöglichkeit der KI-Funktion und manuellen Fallback testen
- [ ] Protokoll für Vorfälle, Beschwerden, Korrekturen und Modellwechsel verabschieden
- [ ] KI-Kompetenzschulung nach Rolle, Vorwissen und Nutzungskontext durchführen und nachweisen
- [ ] Datenschutz-Folgenabschätzung und Beschäftigtendatenschutz prüfen
- [ ] Barrierefreiheit, Verbraucherinformation und Einwilligung juristisch prüfen
- [ ] Informationspflichten, Anbieterkennzeichnung und Aufbewahrungsfristen finalisieren
- [ ] turnusmäßige Überprüfung mindestens jährlich und bei jeder wesentlichen Änderung festlegen

## 7. Zusätzliche Anforderungen für Unternehmen

1. Betriebsrat und Datenschutzbeauftragte vor einem Pilotprojekt beteiligen.
2. Freiwilligkeit sicherstellen; Nichtteilnahme darf keine Nachteile verursachen.
3. Arbeitgebern keinen Zugriff auf individuelle Check-ins, Selbstchecks oder Nutzungswerte geben.
4. Falls später Organisationsstatistiken entstehen, nur anonyme oder wirksam aggregierte Werte mit ausreichender Mindestgruppengröße verwenden.
5. Zweckbindung vertraglich festhalten und Leistungs-/Verhaltenskontrolle ausdrücklich ausschließen.
6. Mitarbeitende, Führungskräfte, Administration und Support passend zu ihren Rollen schulen.
7. Beschwerden und KI-Vorfälle ohne Nachteile meldbar machen.

## 8. Relevante Zeitpunkte

- Verbote bestimmter KI-Praktiken und die Pflicht zu ausreichender KI-Kompetenz gelten seit **2. Februar 2025**.
- Die Transparenzpflichten nach Artikel 50 gelten ab **2. August 2026**. Mindful AI setzt die sichtbare Kennzeichnung bereits vor diesem Datum um.
- Zeitpläne und Auslegung können sich ändern. Vor dem Live-Betrieb sind die jeweils aktuellen Fassungen und Leitlinien der EU-Kommission zu prüfen.

## 9. Primärquellen

- [Verordnung (EU) 2024/1689 – EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [EU-Kommission: AI Act und Anwendungszeitplan](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- [EU-Kommission: Transparenzpflichten nach Artikel 50](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act)
- [EU-Kommission: KI-Kompetenz nach Artikel 4](https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers)
