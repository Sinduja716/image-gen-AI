// TRACK 3 owns src/api/client.ts. All backend calls go through here. Never hard-code provider names or keys.
import type {
  ExportResponse, GenerateResponse, GenerationRequest, Job, MetricsResponse, Plan, StatusResponse,
} from "./types";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

export const api = {
  health: () => call<{ status: string }>("/api/v1/health"),
  createPlan: (req: GenerationRequest) => call<Plan>("/api/v1/plans", { method: "POST", body: JSON.stringify(req) }),
  generate: (planId: string) => call<GenerateResponse>(`/api/v1/plans/${planId}/generate`, { method: "POST" }),
  status: (planId: string) => call<StatusResponse>(`/api/v1/plans/${planId}/status`),
  retry: (jobId: string) => call<Job>(`/api/v1/jobs/${jobId}/retry`, { method: "POST" }),
  exportPdf: (planId: string) => call<ExportResponse>(`/api/v1/plans/${planId}/export`, { method: "POST" }),
  metrics: (planId: string) => call<MetricsResponse>(`/api/v1/plans/${planId}/metrics`),
};
