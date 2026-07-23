import { describe, expect, it } from "vitest";
import { isCompassResult, type CompassResult } from "./compassResult";

const validResult: CompassResult = {
  title: "Dein ruhiger Kompass für den nächsten Schritt",
  summary: "Deine Angaben zeigen mehrere gleichzeitige Anforderungen. Eine kleine, selbstbestimmte Auswahl kann jetzt entlasten.",
  parts: [
    {
      name: "Der Orientierungs-Anteil",
      score: 72,
      need: "Er braucht eine überschaubare Reihenfolge und eine klare Grenze.",
      risk: "Zu viele parallele Möglichkeiten können zusätzlichen Druck erzeugen.",
      microAction: "Wähle für heute genau ein Werkzeug und eine kleine Aufgabe.",
    },
    {
      name: "Der Vergleichs-Anteil",
      score: 64,
      need: "Er braucht den Blick auf deine eigene Lernkurve und dein Tempo.",
      risk: "Der ständige Vergleich kann die eigenen Fortschritte unsichtbar machen.",
      microAction: "Notiere eine Fähigkeit, die du unabhängig von KI mitbringst.",
    },
    {
      name: "Der Handlungs-Anteil",
      score: 78,
      need: "Er braucht einen konkreten, überprüfbaren nächsten Schritt.",
      risk: "Ohne klare Grenze kann aus Neugier schnell Zerstreuung werden.",
      microAction: "Arbeite zwanzig Minuten und prüfe danach bewusst die Wirkung.",
    },
  ],
  solution: "Reduziere die Auswahl für eine Woche auf einen konkreten Anwendungsfall. Prüfe nach jeder Nutzung kurz, ob das Werkzeug dir Zeit, Klarheit oder Ruhe gebracht hat, und passe deinen Umgang entsprechend an.",
  plan: [
    "Tag 1: Einen einzigen Anwendungsfall auswählen.",
    "Tag 2: Eine persönliche Nutzungsgrenze formulieren.",
    "Tag 3: Zwanzig Minuten konzentriert ausprobieren.",
    "Tag 4: Die Wirkung in einem Satz festhalten.",
    "Tag 5: Eine hilfreiche Vorgehensweise wiederholen.",
    "Tag 6: Eine bewusste digitale Pause einplanen.",
    "Tag 7: Entscheiden, was bleibt und was wegfällt.",
  ],
  authenticity: "KI darf deine Arbeit unterstützen, ohne deine eigene Sprache, Entscheidung und persönliche Grenze zu ersetzen.",
  safetyNote: "Diese KI-erstellte Reflexion kann Fehler enthalten, ist keine Diagnose und sollte bei Bedarf menschlich geprüft werden.",
};

describe("KI-Kompass-Ausgabe", () => {
  it("akzeptiert eine vollständige, nutzerfreundliche Auswertung", () => {
    expect(isCompassResult(validResult)).toBe(true);
  });

  it("verwirft interne Platzhalter und Schema-Arbeitsnotizen", () => {
    expect(isCompassResult({
      ...validResult,
      authenticity: "authenticity__placeholder__attention__not_used__in_schema__fix__output__valid_json__without_extra_keys",
    })).toBe(false);
  });

  it("verwirft unvollständige Unterobjekte trotz korrekter Anzahl", () => {
    expect(isCompassResult({
      ...validResult,
      parts: [{ name: "A" }, { name: "B" }, { name: "C" }],
    })).toBe(false);
  });
});
