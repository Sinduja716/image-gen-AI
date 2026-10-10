import { useState } from "react";
import { api } from "../api/client";
import type { ContentKind, SampleCreation, SessionCreation } from "../types/ui";
import { JobResultCard } from "./JobResultCard";

interface MyCreationsPageProps {
  sessionCreations: SessionCreation[];
  onNavigateToCreate: () => void;
  onUpdateSessionCreation?: (updated: SessionCreation) => void;
}

// Explicit sample reference data to demonstrate layout, statuses, tiers, and savings
// Clearly separated and labelled as "Sample data — not saved creations" per instructions.
const SAMPLE_CREATIONS: SampleCreation[] = [
  {
    id: "sample-01",
    title: "African Savanna Animals Colouring Book",
    kind: "image",
    materialType: "colouring",
    status: "completed",
    tier: "draft",
    steps: 2,
    createdAt: "Sample",
    pageCount: 1,
    neurons: 30.0,
    baselineNeurons: 90.0,
    costUsd: 0.000330,
    baselineCostUsd: 0.000990,
    savingPercent: 66.7,
    reused: false,
    previewDescription: "Clean outline of elephant & giraffe for kindergarten colouring",
  },
  {
    id: "sample-02",
    title: "Solar System Planets Identification Worksheet",
    kind: "worksheet",
    materialType: "worksheet",
    status: "completed",
    tier: "standard",
    steps: 4,
    createdAt: "Sample",
    pageCount: 3,
    neurons: 150.0,
    baselineNeurons: 270.0,
    costUsd: 0.001650,
    baselineCostUsd: 0.002970,
    savingPercent: 44.4,
    reused: false,
    previewDescription: "3-page primary worksheet with planet diagrams and vocab",
  },
  {
    id: "sample-03",
    title: "Basic Geometric Shapes Flashcard Set",
    kind: "flashcards",
    materialType: "flashcards",
    status: "completed",
    tier: "standard",
    steps: 4,
    createdAt: "Sample",
    pageCount: 6,
    neurons: 0.0,
    baselineNeurons: 540.0,
    costUsd: 0.000000,
    baselineCostUsd: 0.005940,
    savingPercent: 100.0,
    reused: true,
    previewDescription: "6 shape cards (circle, square, triangle...) matched from cache library",
  },
  {
    id: "sample-04",
    title: "Water Cycle Illustrated Science Classroom Poster",
    kind: "poster",
    materialType: "poster",
    status: "processing",
    tier: "high",
    steps: 8,
    createdAt: "Sample",
    pageCount: 1,
    neurons: 90.0,
    baselineNeurons: 90.0,
    costUsd: 0.000990,
    baselineCostUsd: 0.000990,
    savingPercent: 0.0,
    reused: false,
    previewDescription: "A3 Portrait high-resolution poster with evaporation & precipitation",
  },
  {
    id: "sample-05",
    title: "Fractions and Decimals Match-Up Cards",
    kind: "flashcards",
    materialType: "flashcards",
    status: "failed",
    tier: "standard",
    steps: 4,
    createdAt: "Sample",
    pageCount: 8,
    neurons: 0.0,
    baselineNeurons: 720.0,
    costUsd: 0.000000,
    baselineCostUsd: 0.007920,
    savingPercent: 0.0,
    reused: false,
    previewDescription: "Math flashcards - provider timeout on card 4 (retry eligible)",
  },
];

type FilterType = "all" | ContentKind;

export function MyCreationsPage({
  sessionCreations,
  onNavigateToCreate,
  onUpdateSessionCreation,
}: MyCreationsPageProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportingPlanId, setExportingPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Search filter helper
  const matchesSearch = (title: string, desc?: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || (desc && desc.toLowerCase().includes(q));
  };

  // Filter session creations
  const filteredSessionCreations = sessionCreations.filter((item) => {
    const matchesCategory = filter === "all" || item.kind === filter;
    return matchesCategory && matchesSearch(item.title);
  });

  // Filter sample reference creations
  const filteredSampleCreations = SAMPLE_CREATIONS.filter((item) => {
    const matchesCategory = filter === "all" || item.kind === filter;
    return matchesCategory && matchesSearch(item.title, item.previewDescription);
  });

  // Calculate session savings if session creations exist
  const sessionTotalNeurons = sessionCreations.reduce(
    (acc, sc) => acc + sc.jobs.filter((j) => j.status === "completed").reduce((sum, j) => sum + (j.cache_hit ? 0 : (j.neurons ?? j.estimate?.neurons ?? 0)), 0),
    0
  );
  const sessionBaselineNeurons = sessionCreations.reduce(
    (acc, sc) => acc + sc.jobs.filter((j) => j.status === "completed").length * (sc.estimate?.max_neurons ?? 90.0),
    0
  );
  const sessionSavedNeurons = Math.max(0, sessionBaselineNeurons - sessionTotalNeurons);
  const sessionSavedCost = (sessionSavedNeurons / 1000) * 0.011;
  const sessionSavingPercent = sessionBaselineNeurons > 0
    ? ((sessionBaselineNeurons - sessionTotalNeurons) / sessionBaselineNeurons) * 100
    : 0;

  // Handle Export PDF on session creations
  const handleExportPdf = async (creation: SessionCreation) => {
    setExportingPlanId(creation.planId);
    try {
      const exp = await api.exportPdf(creation.planId);
      if (onUpdateSessionCreation) {
        onUpdateSessionCreation({
          ...creation,
          pdfDownloadUrl: exp.download_url,
        });
      }
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExportingPlanId(null);
    }
  };

  return (
    <div id="panel-creations" role="tabpanel" aria-labelledby="nav-tab-creations" className="page-content">
      {/* Top Header & Navigation */}
      <div className="creations-header-row">
        <div>
          <h2 className="card-title" style={{ fontSize: "22px", margin: "0 0 4px" }}>
            My Creations
          </h2>
          <p className="card-subtitle">
            Classroom teaching materials generated with purpose-matched compute
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onNavigateToCreate}
          aria-label="Navigate to Create New"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Material
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="creations-controls-bar">
        <div className="filter-tabs" role="tablist" aria-label="Creations Category Filter">
          <button
            type="button"
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({sessionCreations.length + SAMPLE_CREATIONS.length})
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "image" ? "active" : ""}`}
            onClick={() => setFilter("image")}
          >
            Images
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "worksheet" ? "active" : ""}`}
            onClick={() => setFilter("worksheet")}
          >
            Worksheets
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "flashcards" ? "active" : ""}`}
            onClick={() => setFilter("flashcards")}
          >
            Flashcards
          </button>
          <button
            type="button"
            className={`filter-tab ${filter === "poster" ? "active" : ""}`}
            onClick={() => setFilter("poster")}
          >
            Posters
          </button>
        </div>

        <div className="search-input-wrapper">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="Search creations by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search creations"
          />
        </div>
      </div>

      {/* SECTION 1: ACTIVE SESSION CREATIONS */}
      <section aria-labelledby="session-creations-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h3 id="session-creations-heading" className="card-title" style={{ fontSize: "17px", margin: 0 }}>
              Active Session Creations ({sessionCreations.length})
            </h3>
            <p className="card-subtitle" style={{ fontSize: "13px", marginTop: "2px" }}>
              Generations produced during your current application session
            </p>
          </div>
          {sessionCreations.length > 0 && (
            <span className="estimate-badge saving-badge" style={{ padding: "4px 10px", fontSize: "12px" }}>
              {sessionSavingPercent.toFixed(1)}% Session Compute Saved (${sessionSavedCost.toFixed(5)} USD)
            </span>
          )}
        </div>

        {filteredSessionCreations.length === 0 ? (
          <div className="card empty-creations-card">
            <div className="empty-icon" aria-hidden="true">📂</div>
            <p className="empty-title">
              {sessionCreations.length === 0
                ? "No materials generated in your active session yet."
                : "No session creations match the selected filter or search."}
            </p>
            <p className="empty-subtitle">
              Go to the <strong>Create New</strong> tab to select an educational format, configure prompt & quality tier, and run a generation.
            </p>
            <button type="button" className="btn-secondary" onClick={onNavigateToCreate}>
              Start New Generation
            </button>
          </div>
        ) : (
          <div className="creations-grid">
            {filteredSessionCreations.map((creation) => {
              const isExpanded = expandedPlanId === creation.planId;
              const isAllComplete = creation.jobs.length > 0 && creation.jobs.every((j) => j.status === "completed");

              return (
                <article key={creation.planId} className="creation-card session-card">
                  <div className="creation-preview-box">
                    <div>
                      <div className="preview-kind-tag">
                        [{creation.kind.toUpperCase()}] Active Generation
                      </div>
                      <div className="preview-title-sub">{creation.title}</div>
                      <div className="preview-meta-sub">
                        {creation.pageCount} items &bull; Tier: {creation.tier.toUpperCase()} ({creation.steps} steps)
                      </div>
                    </div>
                  </div>

                  <div className="creation-card-body">
                    <h4 className="creation-card-title">{creation.title}</h4>

                    <div className="creation-meta-row">
                      <span className={`status-pill status-${creation.status}`}>
                        {creation.status}
                      </span>
                      <span className="plan-id-pill">
                        Plan: {creation.planId}
                      </span>
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "10px" }}>
                      Created at {creation.createdAt}
                    </div>

                    <div className="creation-card-actions">
                      {isAllComplete && (
                        <button
                          type="button"
                          className="btn-primary card-action-btn"
                          disabled={exportingPlanId === creation.planId}
                          onClick={() => handleExportPdf(creation)}
                        >
                          {exportingPlanId === creation.planId
                            ? "Exporting..."
                            : creation.pdfDownloadUrl
                            ? "Download PDF"
                            : "Export PDF"}
                        </button>
                      )}

                      {creation.pdfDownloadUrl && (
                        <a
                          href={creation.pdfDownloadUrl}
                          download
                          className="btn-secondary card-action-btn"
                          style={{ textDecoration: "none" }}
                        >
                          Download PDF
                        </a>
                      )}

                      <button
                        type="button"
                        className="btn-secondary card-action-btn"
                        onClick={() => setExpandedPlanId(isExpanded ? null : creation.planId)}
                      >
                        {isExpanded ? "Hide Items" : `View Items (${creation.jobs.length})`}
                      </button>
                    </div>

                    {/* Expandable items view */}
                    {isExpanded && (
                      <div className="expanded-telemetry-view">
                        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px", color: "var(--color-navy)" }}>
                          Individual Page Telemetry:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {creation.jobs.map((job) => (
                            <JobResultCard
                              key={job.job_id}
                              job={job}
                              onJobUpdated={(updated) => {
                                const newJobs = creation.jobs.map((j) => (j.job_id === updated.job_id ? updated : j));
                                if (onUpdateSessionCreation) {
                                  onUpdateSessionCreation({ ...creation, jobs: newJobs });
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: SAMPLE REFERENCE GALLERY (CLEARLY SEPARATED) */}
      <section aria-labelledby="sample-creations-heading" className="reference-gallery-section">
        {/* Mock Data Notice Banner */}
        <div className="mock-notice-banner" role="note">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              <strong>Sample Reference Gallery:</strong> The backend does not expose persistent history storage. Active generations appear above; cards below demonstrate layout, tiers, and savings.
            </span>
          </div>
          <span className="brand-badge" style={{ fontSize: "10px" }}>Reference Gallery</span>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <h3 id="sample-creations-heading" className="card-title" style={{ fontSize: "17px", margin: "0 0 2px" }}>
            Reference Gallery (Mock Layout Cards)
          </h3>
          <p className="card-subtitle">
            Illustrates completed, processing, and retryable failed states across quality tiers
          </p>
        </div>

        <div className="creations-grid">
          {filteredSampleCreations.map((creation) => (
            <article key={creation.id} className="creation-card" aria-labelledby={`sample-title-${creation.id}`}>
              <div className="creation-preview-box">
                <div>
                  <div className="preview-kind-tag">
                    [{creation.kind.toUpperCase()}] Sample
                  </div>
                  <div className="preview-title-sub">{creation.previewDescription}</div>
                  <div className="preview-meta-sub">
                    {creation.pageCount} page(s) &bull; Format: {creation.materialType}
                  </div>
                </div>
              </div>

              <div className="creation-card-body">
                <h4 id={`sample-title-${creation.id}`} className="creation-card-title">
                  {creation.title}
                </h4>

                <div className="creation-meta-row">
                  <span className={`status-pill status-${creation.status}`}>
                    {creation.status}
                  </span>
                  <span className="tier-steps-badge">
                    {creation.tier.toUpperCase()} ({creation.steps} steps)
                  </span>
                </div>

                <div className="creation-savings-row">
                  <div>
                    <strong>{creation.neurons.toFixed(1)} neurons</strong>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      ${creation.costUsd.toFixed(6)} USD
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {creation.reused ? (
                      <span className="text-success" style={{ fontWeight: 600 }}>
                        100% Reused
                      </span>
                    ) : creation.savingPercent > 0 ? (
                      <span className="text-success" style={{ fontWeight: 600 }}>
                        {creation.savingPercent.toFixed(1)}% Saved
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>
                        High Baseline
                      </span>
                    )}
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      vs {creation.baselineNeurons.toFixed(1)} base
                    </div>
                  </div>
                </div>

                <div className="creation-card-actions" style={{ marginTop: "12px" }}>
                  {creation.status === "completed" && (
                    <button type="button" className="btn-secondary card-action-btn">
                      Download PDF (Sample)
                    </button>
                  )}
                  {creation.status === "failed" && (
                    <button
                      type="button"
                      className="btn-secondary card-action-btn retry-btn"
                      onClick={() => alert("Sample card retry demonstration. Real retries execute on active session jobs.")}
                    >
                      Retry Item (Demo)
                    </button>
                  )}
                  {creation.status === "processing" && (
                    <button type="button" className="btn-secondary card-action-btn" disabled>
                      Processing...
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

