export type InnerPart = {
  name: string;
  score: number;
  need: string;
  risk: string;
  microAction: string;
};

export type CompassResult = {
  title: string;
  summary: string;
  parts: InnerPart[];
  solution: string;
  plan: string[];
  authenticity: string;
  safetyNote: string;
};

const internalOutputPattern =
  /(?:__|placeholder|not[_ -]?used|valid[_ -]?json|internal[_ -]?instruction|just[_ -]?final[_ -]?json|no[_ -]?comments|schema[_ -]?(?:fix|field|required)|authenticity[_ -]?field|safetyNote[_ -]?field)/i;

function isUserFacingText(value: unknown, minLength: number, maxLength: number): value is string {
  if (typeof value !== "string") return false;
  const text = value.trim();
  return text.length >= minLength && text.length <= maxLength && !internalOutputPattern.test(text);
}

function isInnerPart(value: unknown): value is InnerPart {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<InnerPart>;
  return isUserFacingText(item.name, 3, 80)
    && Number.isInteger(item.score) && Number(item.score) >= 1 && Number(item.score) <= 100
    && isUserFacingText(item.need, 12, 500)
    && isUserFacingText(item.risk, 12, 500)
    && isUserFacingText(item.microAction, 12, 500);
}

export function isCompassResult(value: unknown): value is CompassResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<CompassResult>;
  return isUserFacingText(item.title, 10, 180)
    && isUserFacingText(item.summary, 40, 1000)
    && Array.isArray(item.parts) && item.parts.length === 3 && item.parts.every(isInnerPart)
    && isUserFacingText(item.solution, 80, 1800)
    && Array.isArray(item.plan) && item.plan.length === 7
    && item.plan.every((entry) => isUserFacingText(entry, 12, 320))
    && isUserFacingText(item.authenticity, 30, 800)
    && isUserFacingText(item.safetyNote, 30, 800);
}
