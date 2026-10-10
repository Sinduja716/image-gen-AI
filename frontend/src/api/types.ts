// Mirrors backend/app/schemas.py. FROZEN: only the integrator changes this file.
export type MaterialType = "colouring" | "worksheet" | "flashcards" | "poster";
export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type PageFormat = "A4_PORTRAIT" | "A3_PORTRAIT" | "CARD_3X5";

export interface Overrides {
  count?: number | null;
  age_band?: string | null;
  language?: string | null;
}
export interface GenerationRequest {
  material_type: MaterialType;
  prompt: string;
  overrides?: Overrides | null;
}
export interface ResolvedField {
  value: string | number;
  source: "user" | "planner" | "default";
}
export interface Job {
  job_id: string;
  plan_id: string;
  sequence: number;
  item_key: string;
  prompt: string;
  status: JobStatus;
  attempts: number;
  steps: number;
  asset_uri: string | null;
  error_code: string | null;
  cache_hit: boolean;
  provider: string | null;
  model: string | null;
  latency_ms: number | null;
  neurons: number | null;
}
export interface Plan {
  plan_id: string;
  material_type: MaterialType;
  original_prompt: string;
  page_format: PageFormat;
  profile: string;
  steps: number;
  resolved: Record<string, ResolvedField>;
  warnings: string[];
  jobs: Job[];
}
export interface StatusResponse {
  plan_id: string;
  total: number;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
  complete: boolean;
  jobs: Job[];
}
export interface GenerateResponse { plan_id: string; accepted: boolean }
export interface ExportResponse { plan_id: string; download_url: string }
export interface MetricsResponse {
  plan_id: string;
  image_calls: number;
  cache_hits: number;
  neurons_used: number | null;
  estimated_cost_usd: number | null;
  baseline_neurons: number | null;
  baseline_cost_usd: number | null;
  saving_percent: number | null;
  notes: string[];
}
