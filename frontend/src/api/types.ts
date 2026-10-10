// Mirrors backend/app/schemas.py. FROZEN: only the integrator changes this file.
export type MaterialType = "colouring" | "worksheet" | "flashcards" | "poster" | "thumbnail" | "auto";
export type Tier = "draft" | "standard" | "high";
export type JobStatus = "pending" | "processing" | "completed" | "failed";
export type PageFormat = "A4_PORTRAIT" | "A3_PORTRAIT" | "CARD_3X5" | "SQUARE_SMALL";

export interface Overrides {
  count?: number | null;
  age_band?: string | null;
  language?: string | null;
  tier?: Tier | null;
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
export interface ResourceEstimate {
  tier: Tier;
  steps: number;
  neurons: number;
  cost_usd: number;
  energy_wh: number | null;
  max_steps: number;
  max_neurons: number;
  max_cost_usd: number;
  max_energy_wh: number | null;
  saving_percent: number;
  measured: boolean;
  placeholder: boolean;
  seconds: number | null;
  max_seconds: number | null;
  time_saving_percent: number | null;
  method: string;
  notes: string[];
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
  tier: Tier;
  estimate: ResourceEstimate | null;
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
  tier: Tier;
  tier_reason: string;
  estimate: ResourceEstimate;
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
  seconds_used: number | null;
  baseline_seconds: number | null;
  time_saving_percent: number | null;
  energy_wh_used: number | null;
  baseline_energy_wh: number | null;
  energy_saved_wh: number | null;
  tier_counts: Record<string, number>;
  notes: string[];
}

export interface EstimateMethod {
  summary: string;
  unit: string;
  maximum_setting: { tier: Tier; steps: number };
  tiers: { tier: Tier; steps: number; neurons: number; seconds: number }[];
  formulas: string[];
  energy: string;
  measured: boolean;
  caveats: string[];
}
