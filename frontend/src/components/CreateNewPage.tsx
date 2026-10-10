import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import type { Job, MaterialType, MetricsResponse, Plan, ResourceEstimate, StatusResponse, Tier } from "../api/types";
import type { ContentKind, FlashcardsFormValues, ImageFormValues, PosterFormValues, SessionCreation, WorksheetFormValues } from "../types/ui";
import { HeroSection } from "./HeroSection";
import { CreationWorkspace } from "./CreationWorkspace";
import { QualitySelector } from "./QualitySelector";
import { ResourceEstimateSection } from "./ResourceEstimateSection";
import { GenerateAction } from "./GenerateAction";
import { JobResultCard } from "./JobResultCard";
import { TotalsSavingsPanel } from "./TotalsSavingsPanel";

const TIER_STEPS: Record<Tier, number> = {
  draft: 2,
  standard: 4,
  high: 8,
};

const DEFAULT_RECOMMENDATIONS: Record<ContentKind, { tier: Tier; reason: string }> = {
  image: {
    tier: "draft",
    reason: "Colouring outlines require clean contours rather than fine textures; lowest compute effort (2 steps) is sufficient.",
  },
  worksheet: {
    tier: "standard",
    reason: "Worksheet graphics must be legible and balanced at smaller page scales (4 steps).",
  },
  flashcards: {
    tier: "standard",
    reason: "Flashcards need instant visual recognition across small cards (4 steps).",
  },
  poster: {
    tier: "high",
    reason: "Posters are printed large (A3) and viewed from distance; high detail (8 steps) is needed.",
  },
};

interface CreateNewPageProps {
  onSessionCreationAdded?: (creation: SessionCreation) => void;
  online?: boolean | null;
}

export function CreateNewPage({ onSessionCreationAdded, online }: CreateNewPageProps) {
  const [selectedKind, setSelectedKind] = useState<ContentKind>("image");

  // Individual Form States — Strictly Isolated Per Material Type
  const [imageValues, setImageValues] = useState<ImageFormValues>({
    prompt: "",
    size: "A4 Portrait",
    style: "outline",
    count: 1,
  });

  const [worksheetValues, setWorksheetValues] = useState<WorksheetFormValues>({
    topic: "",
    activityType: "Matching",
    pageCount: 1,
    difficulty: "Beginner",
    paperSize: "A4",
  });

  const [flashcardsValues, setFlashcardsValues] = useState<FlashcardsFormValues>({
    topic: "",
    category: "Animals",
    cardCount: 6,
    layout: "Picture + word",
    language: "en",
    learnerLevel: "Early Years",
  });

  const [posterValues, setPosterValues] = useState<PosterFormValues>({
    topic: "",
    title: "",
    keyPoints: "",
    size: "A3",
    orientation: "Portrait",
    visualStyle: "Educational illustration",
  });

  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  // Plan and generation states
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [estimate, setEstimate] = useState<ResourceEstimate | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);
  const [serverMetrics, setServerMetrics] = useState<MetricsResponse | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOfflinePlan, setIsOfflinePlan] = useState(false);

  const pollingTimerRef = useRef<number | null>(null);

  // Derive form validity and count for current active kind
  const isFormValid = (() => {
    switch (selectedKind) {
      case "image":
        return imageValues.prompt.trim().length > 0;
      case "worksheet":
        return worksheetValues.topic.trim().length > 0;
      case "flashcards":
        return flashcardsValues.topic.trim().length > 0;
      case "poster":
        return posterValues.topic.trim().length > 0;
    }
  })();

  const activeCount = (() => {
    switch (selectedKind) {
      case "image":
        return imageValues.count;
      case "worksheet":
        return worksheetValues.pageCount;
      case "flashcards":
        return flashcardsValues.cardCount;
      case "poster":
        return 1;
    }
  })();

  // Recommendation & active tier
  const recommendation = (() => {
    if (selectedKind === "image" && imageValues.style === "color") {
      return {
        tier: "standard" as Tier,
        reason: "Full-colour illustrations benefit from Standard quality (4 steps) for balanced tone and details.",
      };
    }
    return DEFAULT_RECOMMENDATIONS[selectedKind];
  })();

  const activeTier: Tier = selectedTier || recommendation.tier;
  const activeSteps = TIER_STEPS[activeTier];

  // Build prompt and overrides strictly according to the active type's fields
  const buildGenerationPayload = (): {
    material_type: MaterialType;
    prompt: string;
    overrides: { count?: number; age_band?: string; language?: string; tier?: Tier };
  } => {
    switch (selectedKind) {
      case "image": {
        let p = imageValues.prompt.trim();
        if (imageValues.size !== "A4 Portrait") {
          p += ` [Aspect ratio: ${imageValues.size}]`;
        }
        if (imageValues.style === "outline") {
          p += " [Black and white colouring outline]";
        } else if (imageValues.style === "color") {
          p += " [Full colour classroom illustration]";
        }
        return {
          material_type: "colouring",
          prompt: p,
          overrides: {
            count: imageValues.count,
            tier: selectedTier || (imageValues.style === "outline" ? "draft" : "standard"),
          },
        };
      }
      case "worksheet": {
        let p = worksheetValues.topic.trim();
        p += ` [Activity: ${worksheetValues.activityType}]`;
        p += ` [Difficulty: ${worksheetValues.difficulty}]`;
        if (worksheetValues.paperSize !== "A4") {
          p += ` [Paper format: ${worksheetValues.paperSize}]`;
        }
        return {
          material_type: "worksheet",
          prompt: p,
          overrides: {
            count: worksheetValues.pageCount,
            tier: selectedTier || "standard",
          },
        };
      }
      case "flashcards": {
        let p = flashcardsValues.topic.trim();
        if (flashcardsValues.category !== "Custom") {
          p += ` [Category: ${flashcardsValues.category}]`;
        }
        p += ` [Layout: ${flashcardsValues.layout}]`;
        p += ` [Level: ${flashcardsValues.learnerLevel}]`;
        return {
          material_type: "flashcards",
          prompt: p,
          overrides: {
            count: flashcardsValues.cardCount,
            language: flashcardsValues.language,
            tier: selectedTier || "standard",
          },
        };
      }
      case "poster": {
        let p = posterValues.topic.trim();
        if (posterValues.title.trim()) {
          p = `"${posterValues.title.trim()}" - ${p}`;
        }
        if (posterValues.keyPoints.trim()) {
          p += ` [Key points: ${posterValues.keyPoints.trim()}]`;
        }
        p += ` [Style: ${posterValues.visualStyle}]`;
        if (posterValues.orientation !== "Portrait") {
          p += ` [Orientation: ${posterValues.orientation}]`;
        }
        return {
          material_type: "poster",
          prompt: p,
          overrides: {
            count: 1,
            tier: selectedTier || "high",
          },
        };
      }
    }
  };

  // Safe switching of content kind
  const handleSelectKind = (kind: ContentKind) => {
    setSelectedKind(kind);
    setSelectedTier(null);
    setCurrentPlan(null);
    setEstimate(null);
    setJobs([]);
    setServerMetrics(null);
    setPdfDownloadUrl(null);
    setIsOfflinePlan(false);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  // Helper to generate local offline estimate & plan when backend is unreachable
  const makeOfflinePlan = (promptText: string, tier: Tier, itemCount: number, mType: MaterialType): Plan => {
    const steps = TIER_STEPS[tier];
    const neuronsTable: Record<Tier, number> = { draft: 30.0, standard: 50.0, high: 90.0 };
    const neurons = neuronsTable[tier];
    const maxNeurons = 90.0;
    const costUsd = (neurons / 1000) * 0.011;
    const maxCostUsd = (maxNeurons / 1000) * 0.011;
    const savingPercent = ((maxNeurons - neurons) / maxNeurons) * 100;

    const est: ResourceEstimate = {
      tier,
      steps,
      neurons,
      cost_usd: costUsd,
      energy_wh: null,
      max_steps: 8,
      max_neurons: maxNeurons,
      max_cost_usd: maxCostUsd,
      max_energy_wh: null,
      saving_percent: Number(savingPercent.toFixed(1)),
      measured: false,
      placeholder: true,
      seconds: null,
      max_seconds: null,
      time_saving_percent: null,
      method: "offline-fallback",
      notes: [
        "Offline Fallback: Backend not connected. Values derived from project formulas in app/estimate.py.",
        "Cost computed at $0.011 per 1,000 neurons (Cloudflare paid rate).",
        "Neuron values are provisional placeholders.",
      ],
    };

    const planId = `offline-${Date.now().toString(36)}`;
    const mockJobs: Job[] = Array.from({ length: itemCount }, (_, i) => ({
      job_id: `${planId}-${(i + 1).toString().padStart(2, "0")}`,
      plan_id: planId,
      sequence: i + 1,
      item_key: `item-${i + 1}`,
      prompt: `${promptText} (Item ${i + 1})`,
      status: "pending",
      attempts: 0,
      steps,
      tier,
      estimate: est,
      asset_uri: null,
      error_code: null,
      cache_hit: i === 0 && itemCount > 1,
      provider: "mock",
      model: "flux-schnell",
      latency_ms: null,
      neurons: i === 0 && itemCount > 1 ? 0.0 : neurons,
    }));

    return {
      plan_id: planId,
      material_type: mType,
      original_prompt: promptText,
      page_format: selectedKind === "poster" ? "A3_PORTRAIT" : selectedKind === "flashcards" ? "CARD_3X5" : "A4_PORTRAIT",
      profile: `${mType}_${tier}`,
      steps,
      tier,
      tier_reason: selectedTier ? "Chosen by teacher override." : recommendation.reason,
      estimate: est,
      resolved: {
        count: { value: itemCount, source: "user" },
        tier: { value: tier, source: selectedTier ? "user" : "default" },
      },
      warnings: ["Offline Simulation: FastAPI backend is not running on port 8000. Operating in client preview mode."],
      jobs: mockJobs,
    };
  };

  // Pre-generation Plan Request
  const fetchEstimateAndPlan = useCallback(async () => {
    if (!isFormValid) return;
    setIsPlanning(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const payload = buildGenerationPayload();

    try {
      const plan = await api.createPlan({
        material_type: payload.material_type,
        prompt: payload.prompt,
        overrides: payload.overrides,
      });
      setCurrentPlan(plan);
      setEstimate(plan.estimate);
      setJobs(plan.jobs);
      setIsOfflinePlan(false);
    } catch (err) {
      const offline = makeOfflinePlan(payload.prompt, activeTier, payload.overrides.count || 1, payload.material_type);
      setCurrentPlan(offline);
      setEstimate(offline.estimate);
      setJobs(offline.jobs);
      setIsOfflinePlan(true);
      setStatusMessage("Backend server offline. Created offline preview plan adhering to app/estimate.py formulas.");
    } finally {
      setIsPlanning(false);
    }
  }, [isFormValid, selectedKind, imageValues, worksheetValues, flashcardsValues, posterValues, selectedTier, activeTier]);

  // Clean up polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        window.clearTimeout(pollingTimerRef.current);
      }
    };
  }, []);

  // Poll status endpoint
  const pollStatus = useCallback((planId: string) => {
    setIsPolling(true);

    const check = async () => {
      try {
        const res: StatusResponse = await api.status(planId);
        setJobs(res.jobs);

        if (res.complete || (res.completed + res.failed === res.total && res.total > 0)) {
          setIsPolling(false);
          setIsGenerating(false);
          setStatusMessage(`Generation completed! (${res.completed} completed, ${res.failed} failed)`);

          try {
            const m = await api.metrics(planId);
            setServerMetrics(m);
          } catch {
            // Metrics optional if backend not ready
          }

          if (currentPlan && onSessionCreationAdded) {
            onSessionCreationAdded({
              planId: currentPlan.plan_id,
              title: currentPlan.original_prompt,
              kind: selectedKind,
              materialType: currentPlan.material_type,
              tier: currentPlan.tier,
              steps: currentPlan.steps,
              createdAt: new Date().toLocaleTimeString(),
              pageCount: res.completed,
              status: res.failed > 0 ? (res.completed > 0 ? "partial" : "failed") : "complete",
              jobs: res.jobs,
              estimate: currentPlan.estimate,
              pdfDownloadUrl: null,
            });
          }
          return;
        }

        pollingTimerRef.current = window.setTimeout(check, 1500);
      } catch (err) {
        setIsPolling(false);
        setIsGenerating(false);
        setErrorMessage(`Status polling failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    pollingTimerRef.current = window.setTimeout(check, 1000);
  }, [currentPlan, selectedKind, onSessionCreationAdded]);

  // Simulated offline generation runner
  const runOfflineGeneration = (planToUse: Plan) => {
    setIsGenerating(true);
    setIsPolling(true);
    setStatusMessage("Running offline generation simulation...");

    let currentJobIdx = 0;
    const total = planToUse.jobs.length;
    const workingJobs = [...planToUse.jobs];

    const step = () => {
      if (currentJobIdx < total) {
        workingJobs[currentJobIdx] = {
          ...workingJobs[currentJobIdx],
          status: "processing",
        };
        setJobs([...workingJobs]);

        setTimeout(() => {
          const isReused = workingJobs[currentJobIdx].cache_hit;
          workingJobs[currentJobIdx] = {
            ...workingJobs[currentJobIdx],
            status: "completed",
            latency_ms: isReused ? 120 : workingJobs[currentJobIdx].steps * 380,
            neurons: isReused ? 0.0 : workingJobs[currentJobIdx].estimate?.neurons ?? 30.0,
            asset_uri: `/api/v1/jobs/${workingJobs[currentJobIdx].job_id}/asset`,
          };
          setJobs([...workingJobs]);
          currentJobIdx++;
          setTimeout(step, 800);
        }, 1000);
      } else {
        setIsGenerating(false);
        setIsPolling(false);
        setStatusMessage("Offline demo generation complete!");

        if (onSessionCreationAdded) {
          onSessionCreationAdded({
            planId: planToUse.plan_id,
            title: planToUse.original_prompt,
            kind: selectedKind,
            materialType: planToUse.material_type,
            tier: planToUse.tier,
            steps: planToUse.steps,
            createdAt: new Date().toLocaleTimeString(),
            pageCount: total,
            status: "complete",
            jobs: workingJobs,
            estimate: planToUse.estimate,
            pdfDownloadUrl: null,
          });
        }
      }
    };

    setTimeout(step, 500);
  };

  // Start generation
  const handleGenerate = async () => {
    if (!isFormValid) return;
    setErrorMessage(null);

    const payload = buildGenerationPayload();
    let planToUse = currentPlan;

    if (!planToUse) {
      try {
        planToUse = await api.createPlan({
          material_type: payload.material_type,
          prompt: payload.prompt,
          overrides: payload.overrides,
        });
        setCurrentPlan(planToUse);
        setEstimate(planToUse.estimate);
        setJobs(planToUse.jobs);
      } catch (err) {
        planToUse = makeOfflinePlan(payload.prompt, activeTier, payload.overrides.count || 1, payload.material_type);
        setCurrentPlan(planToUse);
        setEstimate(planToUse.estimate);
        setJobs(planToUse.jobs);
        setIsOfflinePlan(true);
      }
    }

    if (isOfflinePlan || online === false) {
      runOfflineGeneration(planToUse);
      return;
    }

    setIsGenerating(true);
    setStatusMessage("Triggering generation runner in backend pipeline...");

    try {
      const res = await api.generate(planToUse.plan_id);
      if (res.accepted) {
        setStatusMessage("Generation accepted! Polling job runner...");
        pollStatus(planToUse.plan_id);
      }
    } catch (err) {
      setIsGenerating(false);
      setErrorMessage(`Generation endpoint failed: ${err instanceof Error ? err.message : String(err)}. Falling back to demo simulation.`);
      runOfflineGeneration(planToUse);
    }
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.job_id === updatedJob.job_id ? updatedJob : j)));
  };

  const handleExportPdf = async () => {
    if (!currentPlan) return;
    setIsExporting(true);
    try {
      const exp = await api.exportPdf(currentPlan.plan_id);
      setPdfDownloadUrl(exp.download_url);
      setStatusMessage("PDF exported successfully! Tap 'Download PDF' to download.");
    } catch (err) {
      setErrorMessage(`PDF export error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  const hasGeneratedItems = jobs.length > 0 && (isGenerating || jobs.some((j) => j.status !== "pending"));

  return (
    <div id="panel-create" role="tabpanel" aria-labelledby="nav-tab-create" className="page-content">
      {/* Welcoming Hero Section */}
      <HeroSection />

      {/* Step 1: Content Creation Workspace with Dynamic Per-Type Forms */}
      <CreationWorkspace
        selectedKind={selectedKind}
        onSelectKind={handleSelectKind}
        imageValues={imageValues}
        onChangeImageValues={(vals) => {
          setImageValues(vals);
          setCurrentPlan(null);
          setEstimate(null);
        }}
        worksheetValues={worksheetValues}
        onChangeWorksheetValues={(vals) => {
          setWorksheetValues(vals);
          setCurrentPlan(null);
          setEstimate(null);
        }}
        flashcardsValues={flashcardsValues}
        onChangeFlashcardsValues={(vals) => {
          setFlashcardsValues(vals);
          setCurrentPlan(null);
          setEstimate(null);
        }}
        posterValues={posterValues}
        onChangePosterValues={(vals) => {
          setPosterValues(vals);
          setCurrentPlan(null);
          setEstimate(null);
        }}
        onGetEstimate={fetchEstimateAndPlan}
        isPlanning={isPlanning}
        warnings={currentPlan?.warnings}
        isFormValid={isFormValid}
      />

      {/* Step 2: Quality Tier Selection */}
      <QualitySelector
        selectedTier={selectedTier}
        recommendedTier={recommendation.tier}
        recommendationReason={recommendation.reason}
        onSelectTier={(tier) => {
          setSelectedTier(tier);
          setCurrentPlan(null);
          setEstimate(null);
        }}
      />

      {/* Step 3: Resource Estimate & Savings Section (Available Before Generation) */}
      <ResourceEstimateSection
        estimate={estimate}
        count={activeCount}
      />

      {/* Step 4: Clear Generate Action Area */}
      <GenerateAction
        contentKind={selectedKind}
        prompt={isFormValid ? "valid" : ""}
        count={activeCount}
        tier={activeTier}
        steps={activeSteps}
        isGenerating={isGenerating || isPolling}
        onGenerate={handleGenerate}
        statusMessage={statusMessage}
        errorMessage={errorMessage}
        isOffline={isOfflinePlan || online === false}
      />

      {/* Step 5: Live Generation Results & Per-Item Cost Badges */}
      {hasGeneratedItems && (
        <section aria-labelledby="results-heading" style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 id="results-heading" className="card-title" style={{ fontSize: "18px" }}>
                Generated Results & Cost Badges
              </h3>
              <p className="card-subtitle">
                Individual item telemetry, tier step allocation, and compute savings vs. High baseline
              </p>
            </div>
            {isPolling && (
              <span className="brand-badge" style={{ background: "var(--color-primary-light)" }}>
                Live Polling (every 1.5s)
              </span>
            )}
          </div>

          <div className="creations-grid">
            {jobs.map((job) => (
              <JobResultCard
                key={job.job_id}
                job={job}
                onJobUpdated={handleJobUpdated}
              />
            ))}
          </div>

          {/* Step 6: Aggregate Totals & Savings Panel */}
          <TotalsSavingsPanel
            jobs={jobs}
            estimate={estimate}
            serverMetrics={serverMetrics}
            onExportPdf={handleExportPdf}
            isExporting={isExporting}
            pdfDownloadUrl={pdfDownloadUrl}
          />
        </section>
      )}
    </div>
  );
}
