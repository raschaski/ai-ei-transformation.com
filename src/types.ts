export type AiPurpose = "arbeit" | "lernen" | "unterhaltung" | "emotionale_unterstuetzung";
export type AiEffect = "hilfreich" | "neutral" | "belastend";

export interface CheckIn {
  id: string;
  user_id: string;
  entry_date: string;
  created_at: string;
  mood: number;
  stress: number;
  loneliness: number;
  sleep: number;
  ai_minutes: number;
  ai_purpose: AiPurpose;
  ai_effect: AiEffect;
  note: string | null;
}

export interface CheckInInput {
  entry_date: string;
  mood: number;
  stress: number;
  loneliness: number;
  sleep: number;
  ai_minutes: number;
  ai_purpose: AiPurpose;
  ai_effect: AiEffect;
  note: string;
}

export interface AiReflection {
  headline: string;
  summary: string;
  observations: string[];
  reflection_questions: string[];
  safety_note: string;
}
