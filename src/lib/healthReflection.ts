import type { AiReflection } from "../types";

export const MIN_HEALTH_REFLECTION_CHECK_INS = 1;

const internalOutputPattern =
  /(?:__|placeholder|not[_ -]?used|valid[_ -]?json|internal[_ -]?instruction|just[_ -]?final[_ -]?json|no[_ -]?comments|schema[_ -]?(?:fix|field|required)|safety[_ -]?note[_ -]?field)/i;

function isUserFacingText(value: unknown, minLength: number, maxLength: number): value is string {
  if (typeof value !== "string") return false;
  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength && !internalOutputPattern.test(text);
}

export function isHealthReflection(value: unknown): value is AiReflection {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<AiReflection>;
  return isUserFacingText(item.headline, 10, 180)
    && isUserFacingText(item.summary, 40, 1200)
    && Array.isArray(item.observations) && item.observations.length >= 2 && item.observations.length <= 4
    && item.observations.every((entry) => isUserFacingText(entry, 15, 450))
    && Array.isArray(item.reflection_questions) && item.reflection_questions.length >= 2 && item.reflection_questions.length <= 4
    && item.reflection_questions.every((entry) => isUserFacingText(entry, 15, 450))
    && isUserFacingText(item.safety_note, 40, 800);
}
