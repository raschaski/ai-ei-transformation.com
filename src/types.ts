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

export interface ToolSession {
  id: string;
  user_id: string;
  tool_name: string;
  task: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  effectiveness: number;
  burden: number;
  notes: string | null;
  created_at: string;
}

export type SelfCheckAnswers = Record<string, string | number>;

export interface SelfCheckResult {
  id: string;
  user_id: string;
  score: number;
  answers: SelfCheckAnswers;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  break_activity: string | null;
  completed: boolean;
  created_at: string;
}

export interface ContactRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  privacy_acknowledged: boolean;
  privacy_text_version: string;
  privacy_acknowledged_at: string | null;
  health_data_consent: boolean;
  health_consent_text_version: string;
  health_data_consented_at: string | null;
  contact_consent: boolean;
  contact_consent_text_version: string;
  contact_consented_at: string | null;
  contact_withdrawn_at: string | null;
  consent_text_version: string;
  consented_at: string;
  updated_at: string;
  created_at: string;
}
