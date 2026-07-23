import { describe, expect, it } from "vitest";
import { isHealthReflection, MIN_HEALTH_REFLECTION_CHECK_INS } from "./healthReflection";

const validReflection = {
  headline: "Ein vorsichtiger Blick auf deine letzten Tage",
  summary: "In deinen Einträgen wechseln sich ruhigere und stärker belastete Tage ab. Die wenigen Werte erlauben noch keine allgemeine Aussage.",
  observations: [
    "An zwei Tagen hast du die KI-Nutzung als hilfreich eingeordnet.",
    "Der höchste Stresswert fällt zeitlich mit einer längeren Nutzung zusammen, ohne dass daraus eine Ursache folgt.",
  ],
  reflection_questions: [
    "Was war an den hilfreich bewerteten Tagen anders als sonst?",
    "Welche kurze Pause möchtest du nach einer längeren Nutzung ausprobieren?",
  ],
  safety_note: "Diese KI-generierte Reflexion kann Fehler enthalten, ist keine Diagnose und sollte von dir oder einer geeigneten Person geprüft werden.",
};

describe("KI-Gesundheitsreflexion", () => {
  it("kann bereits einen gespeicherten Tages-Check-in reflektieren", () => {
    expect(MIN_HEALTH_REFLECTION_CHECK_INS).toBe(1);
  });

  it("akzeptiert eine vollständige, verständliche Reflexion", () => {
    expect(isHealthReflection(validReflection)).toBe(true);
  });

  it("verwirft interne Schema- und Platzhaltertexte", () => {
    expect(isHealthReflection({
      ...validReflection,
      safety_note: "safety_note__placeholder__valid_json__schema_field_required__just_final_json",
    })).toBe(false);
  });

  it("verwirft leere Beobachtungen", () => {
    expect(isHealthReflection({ ...validReflection, observations: [] })).toBe(false);
  });
});
