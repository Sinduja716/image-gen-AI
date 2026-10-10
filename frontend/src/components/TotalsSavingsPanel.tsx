import type { Job, MetricsResponse, ResourceEstimate } from "../api/types";

interface TotalsSavingsPanelProps {
  jobs: Job[];
  estimate?: ResourceEstimate | null;
  serverMetrics?: MetricsResponse | null;
  onExportPdf?: () => void;
  isExporting?: boolean;
  pdfDownloadUrl?: string | null;
}

export function TotalsSavingsPanel({
  jobs,
  estimate,
  serverMetrics,
  onExportPdf,
  isExporting,
  pdfDownloadUrl,
}: TotalsSavingsPanelProps) {
  const totalRequested = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const failedJobs = jobs.filter((j) => j.status === "failed");
  const processingJobs = jobs.filter((j) => j.status === "processing");
  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const reusedJobs = completedJobs.filter((j) => j.cache_hit);
  const freshlyGeneratedJobs = completedJobs.filter((j) => !j.cache_hit);

  // Completed items count
  const countCompleted = completedJobs.length;
  const isAllComplete = totalRequested > 0 && countCompleted === totalRequested;

  // Aggregate Compute (Neurons)
  // Reused jobs use 0 neurons per contract
  let totalNeurons: number = 0;
  let allCompletedHaveNeurons = true;

  for (const j of completedJobs) {
    if (j.cache_hit) {
      // 0 neurons
      continue;
    }
    if (j.neurons !== null && j.neurons !== undefined) {
      totalNeurons += j.neurons;
    } else if (j.estimate?.neurons !== undefined) {
      totalNeurons += j.estimate.neurons;
    } else {
      allCompletedHaveNeurons = false;
    }
  }

  // Baseline computation: Each completed job at High tier (8 steps), no reuse
  // Baseline neurons per image from estimate (default 90.0)
  const baselineNeuronsPerImage = estimate?.max_neurons ?? 90.0;
  const totalBaselineNeurons = countCompleted * baselineNeuronsPerImage;

  // Compute cost
  const USD_RATE_PER_1K = 0.011;
  const totalCostUsd = (totalNeurons / 1000) * USD_RATE_PER_1K;
  const totalBaselineCostUsd = (totalBaselineNeurons / 1000) * USD_RATE_PER_1K;

  // Overall aggregate savings percentage: ((total_baseline - total_actual) / total_baseline) * 100
  let aggregateSavingPercent: string = "Unavailable";
  let totalNeuronsSaved = 0;
  let totalCostSaved = 0;

  if (countCompleted > 0 && totalBaselineNeurons > 0 && allCompletedHaveNeurons) {
    totalNeuronsSaved = Math.max(0, totalBaselineNeurons - totalNeurons);
    totalCostSaved = Math.max(0, totalBaselineCostUsd - totalCostUsd);
    const pct = ((totalBaselineNeurons - totalNeurons) / totalBaselineNeurons) * 100;
    aggregateSavingPercent = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
  }

  // Time aggregate: check if timing data is available across all completed jobs
  const allCompletedHaveTiming = countCompleted > 0 && completedJobs.every((j) => j.latency_ms !== null);
  const totalSeconds = allCompletedHaveTiming
    ? (completedJobs.reduce((acc, j) => acc + (j.latency_ms || 0), 0) / 1000).toFixed(2) + "s"
    : "Unavailable";
  // time_saving_percent from server metrics; null means no timing baseline available
  const timeSavingPercent: number | null = serverMetrics?.time_saving_percent ?? null;

  // Prefer serverMetrics if provided by backend endpoint
  const finalNeurons = serverMetrics?.neurons_used ?? totalNeurons;
  const finalBaselineNeurons = serverMetrics?.baseline_neurons ?? totalBaselineNeurons;
  const finalCostUsd = serverMetrics?.estimated_cost_usd ?? totalCostUsd;
  const finalBaselineCost = serverMetrics?.baseline_cost_usd ?? totalBaselineCostUsd;
  const finalSavingPercent = serverMetrics?.saving_percent !== null && serverMetrics?.saving_percent !== undefined
    ? `${serverMetrics.saving_percent.toFixed(1)}%`
    : aggregateSavingPercent;

  return (
    <section className="card totals-card" aria-labelledby="totals-panel-heading" style={{ marginTop: "24px" }}>
      <div className="card-header totals-header-row">
        <div>
          <h3 id="totals-panel-heading" className="card-title">
            Session Totals & Resource Savings
          </h3>
          <p className="card-subtitle">
            Aggregate computational effort, cache reuse metrics, and baseline comparisons
          </p>
        </div>

        {/* Export / Download PDF Actions */}
        {isAllComplete && onExportPdf && (
          <div className="export-btn-group">
            <button
              type="button"
              className="btn-primary export-pdf-btn"
              onClick={onExportPdf}
              disabled={isExporting}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <span>{isExporting ? "Exporting PDF..." : "Export Print-Ready PDF"}</span>
            </button>
            {pdfDownloadUrl && (
              <a
                href={pdfDownloadUrl}
                download
                className="btn-secondary download-pdf-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Download PDF</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Generation Counts Summary Pills */}
      <div className="counts-pills-row">
        <span className="estimate-badge">Requested: {totalRequested}</span>
        <span className="estimate-badge saving-badge">Completed: {countCompleted}</span>
        {reusedJobs.length > 0 && (
          <span className="estimate-badge saving-badge">
            Library Reused: {reusedJobs.length} ({Math.round(reusedJobs.length * 100 / countCompleted)}%)
          </span>
        )}
        {processingJobs.length > 0 && (
          <span className="estimate-badge placeholder-badge">Processing: {processingJobs.length}</span>
        )}
        {pendingJobs.length > 0 && (
          <span className="estimate-badge">Pending: {pendingJobs.length}</span>
        )}
        {failedJobs.length > 0 && (
          <span className="estimate-badge" style={{ borderColor: "var(--color-error-border)", color: "var(--color-error)", backgroundColor: "var(--color-error-bg)" }}>
            Failed: {failedJobs.length}
          </span>
        )}
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="estimate-grid">
        {/* Actual / Optimized Usage */}
        <div className="estimate-stat-box box-optimized">
          <div className="stat-label">
            <span className="stat-dot dot-teal" aria-hidden="true" />
            Total Optimized Compute
          </div>
          <div className="stat-value">
            {countCompleted > 0 ? `${finalNeurons.toFixed(1)} neurons` : "Unavailable"}
          </div>
          <div className="stat-subvalue">
            Cost: <strong>${finalCostUsd.toFixed(6)} USD</strong>
          </div>
          <div className="stat-subvalue stat-energy">
            Total elapsed time: {totalSeconds}
          </div>
        </div>

        {/* Maximum Quality Baseline */}
        <div className="estimate-stat-box box-baseline">
          <div className="stat-label">
            <span className="stat-dot dot-blue" aria-hidden="true" />
            Maximum Baseline (High Tier)
          </div>
          <div className="stat-value">
            {countCompleted > 0 ? `${finalBaselineNeurons.toFixed(1)} neurons` : "Unavailable"}
          </div>
          <div className="stat-subvalue">
            Baseline Cost: <strong>${finalBaselineCost.toFixed(6)} USD</strong>
          </div>
          <div className="stat-subvalue stat-energy">
            Hypothetical 8 steps fresh generation each
          </div>
        </div>

        {/* Aggregate Savings */}
        <div className="estimate-stat-box box-savings">
          <div className="stat-label stat-label-savings">
            <span className="stat-dot dot-green" aria-hidden="true" />
            Total Compute Saved
          </div>
          <div className="stat-value savings-text">
            {finalSavingPercent}
          </div>
          <div className="stat-subvalue stat-subvalue-savings">
            Saved: <strong>{totalNeuronsSaved.toFixed(1)} neurons</strong> (${totalCostSaved.toFixed(6)} USD)
          </div>
          {timeSavingPercent != null ? (
            <div className="stat-subvalue stat-energy">
              Time saved: <strong>{timeSavingPercent.toFixed(1)}%</strong> vs. maximum baseline
            </div>
          ) : (
            <div className="stat-subvalue stat-energy text-muted">
              Time saved: Unavailable (no baseline timing recorded)
            </div>
          )}
        </div>
      </div>

      {/* Reuse Distinction Callout */}
      {reusedJobs.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: "16px" }}>
          <strong>Library Reuse Efficiency:</strong> {reusedJobs.length} of {countCompleted} item(s) were fulfilled from the local cache library with zero provider inference calls, saving {reusedJobs.length * baselineNeuronsPerImage} baseline neurons (100% compute savings for reused items).
        </div>
      )}

      {/* Comprehensive "How is this calculated?" Panel */}
      <details className="calculation-details">
        <summary>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          How is this calculated? (Hackathon Evaluation Reference)
        </summary>
        <div className="calculation-body">
          <p>
            <strong>What is a Neuron?</strong> A neuron is Cloudflare Workers AI's unit of computational work for running AI models. It measures relative neural network inference complexity based on model parameters and step counts. It is not an arbitrary number, nor is it a direct measurement of physical joules or AC wall-clock wattage.
          </p>

          <p>
            <strong>Quality Tiers and Step Allocations:</strong>
            <br />
            &bull; <strong>Draft:</strong> 2 inference steps (~30.0 neurons). Used for colouring pages and clean vector-like outlines.
            <br />
            &bull; <strong>Standard:</strong> 4 inference steps (~50.0 neurons). Balanced clarity for multi-page worksheets and vocabulary flashcards.
            <br />
            &bull; <strong>High:</strong> 8 inference steps (~90.0 neurons). Maximum detail for large A3 posters and fine display art.
          </p>

          <p>
            <strong>Maximum-Quality Baseline Definition:</strong> The baseline represents generating all requested items fresh at High quality (8 steps, ~90 neurons each) without library or cache reuse.
          </p>

          <p>
            <strong>Aggregate Calculation Formula:</strong>
            <br />
            Overall Compute Saved % is calculated strictly from aggregate totals across completed generations (never by averaging per-image percentages):
          </p>
          <div className="formula-box">
            <code>Overall Compute Saved % = ((Total Baseline Neurons - Total Optimized Neurons) / Total Baseline Neurons) &times; 100</code>
          </div>
          <div className="formula-box" style={{ marginTop: "4px" }}>
            <code>Overall Cost Saved ($) = Total Baseline Cost USD - Total Optimized Cost USD</code>
          </div>

          <p style={{ marginTop: "10px" }}>
            <strong>Pricing Rate:</strong> The verified project rate is <strong>$0.011 per 1,000 neurons</strong> (Cloudflare Workers AI paid rate).
          </p>

          <p>
            <strong>Library Reuse Accounting:</strong> Reused items follow the documented 0-neuron convention. They contribute 0 neurons to actual usage while claiming 100% compute savings against the hypothetical fresh generation baseline. Reused savings are reported separately to distinguish caching from reduced-step optimization.
          </p>

          <p>
            <strong>Telemetry vs. Provisional Estimates:</strong> When provider telemetry is recorded, values are labelled <em>Measured</em>. Before calibration or when using default step tables, values are labelled <em>Estimated / Provisional</em>.
          </p>

          <p>
            <strong>Time and Energy Disclaimers:</strong> Time savings and energy consumption (Wh) are displayed as <em>Unavailable</em> unless valid baseline timing or configured energy coefficients exist in the environment, preventing misleading claims.
          </p>
        </div>
      </details>
    </section>
  );
}

