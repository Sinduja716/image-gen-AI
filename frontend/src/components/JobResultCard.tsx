import { useState } from "react";
import { api } from "../api/client";
import type { Job } from "../api/types";

interface JobResultCardProps {
  job: Job;
  onJobUpdated?: (updatedJob: Job) => void;
}

export function JobResultCard({ job, onJobUpdated }: JobResultCardProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Compute resource & cost values according to contract
  const isReused = job.cache_hit;
  const isHighTier = job.tier === "high";

  // Baseline figures (High tier 8 steps fresh generation)
  const baselineNeurons = job.estimate?.max_neurons ?? 90.0;
  const baselineCostUsd = job.estimate?.max_cost_usd ?? (baselineNeurons / 1000) * 0.011;

  // Actual compute
  let actualNeurons: number | null = null;
  let isMeasured = false;
  let isProvisional = false;

  if (isReused) {
    actualNeurons = 0;
  } else if (job.neurons !== null && job.neurons !== undefined) {
    actualNeurons = job.neurons;
    isMeasured = true;
  } else if (job.estimate?.neurons !== undefined) {
    actualNeurons = job.estimate.neurons;
    isMeasured = job.estimate.measured;
    isProvisional = job.estimate.placeholder;
  }

  // Actual cost
  let actualCostUsd: number | null = null;
  if (isReused) {
    actualCostUsd = 0.0;
  } else if (actualNeurons !== null) {
    actualCostUsd = (actualNeurons / 1000) * 0.011;
  }

  // Compute saved %
  let computeSavedPercent: string = "Unavailable";
  if (isReused) {
    computeSavedPercent = "100.0%";
  } else if (actualNeurons !== null && baselineNeurons > 0) {
    if (isHighTier && actualNeurons === baselineNeurons) {
      computeSavedPercent = "0.0%";
    } else {
      const pct = Math.max(0, Math.min(100, ((baselineNeurons - actualNeurons) / baselineNeurons) * 100));
      computeSavedPercent = `${pct.toFixed(1)}%`;
    }
  }

  // Cost saved
  let costSavedText: string = "Unavailable";
  if (isReused) {
    costSavedText = `$${baselineCostUsd.toFixed(6)}`;
  } else if (actualCostUsd !== null) {
    const saved = baselineCostUsd - actualCostUsd;
    if (isHighTier && Math.abs(saved) < 0.0000001) {
      costSavedText = "$0.000000";
    } else {
      costSavedText = `$${Math.max(0, saved).toFixed(6)}`;
    }
  }

  // Time in seconds
  const timeSecondsText =
    job.latency_ms !== null && job.latency_ms !== undefined
      ? `${(job.latency_ms / 1000).toFixed(2)}s`
      : "Unavailable";

  // Time saved: Contract does not record baseline timing for hypothetical fresh high-tier generation
  const timeSavedText = "Unavailable";

  // Retry failed item
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      const updated = await api.retry(job.job_id);
      if (onJobUpdated) onJobUpdated(updated);
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div
      className={`creation-card ${isReused ? "is-reused" : ""}`}
      style={{
        border: isReused ? "1px solid var(--color-success-border)" : "1px solid var(--color-border)",
      }}
      aria-label={`Job Item ${job.sequence}: ${job.prompt}`}
    >
      {/* Image Preview / Status Area */}
      <div className="creation-preview-box">
        {job.status === "completed" && job.asset_uri && !imageError ? (
          <img
            src={api.assetUrl(job.job_id)}
            alt={job.prompt}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="preview-status-center">
            {job.status === "processing" && (
              <>
                <div className="status-spinner" aria-hidden="true" />
                <div className="status-spinner-text">Processing Generation...</div>
                <div className="status-spinner-sub">Executing {job.steps} inference steps</div>
              </>
            )}
            {job.status === "pending" && (
              <>
                <div className="status-pending-title">Queued Sequence #{job.sequence}</div>
                <div className="status-pending-sub">Awaiting worker runner</div>
              </>
            )}
            {job.status === "failed" && (
              <>
                <div className="status-failed-title">Generation Failed</div>
                <div className="status-failed-sub">
                  {job.error_code || "Provider error / timeout"}
                </div>
              </>
            )}
            {job.status === "completed" && imageError && (
              <>
                <div className="status-complete-title">Generated Successfully</div>
                <div className="status-complete-sub">
                  [Asset generated; mock image display]
                </div>
              </>
            )}
          </div>
        )}

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className="sequence-badge">
            #{job.sequence}
          </span>
          <span className={`status-pill status-${job.status}`}>
            {job.status}
          </span>
        </div>

        {isReused && (
          <div className="card-top-right-badge">
            <span className="estimate-badge saving-badge">
              Reused from library
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="creation-card-body">
        <h4 className="creation-card-title">
          {job.prompt}
        </h4>

        {/* Detailed Per-Image Cost & Resource Badges Grid */}
        <div className="telemetry-grid">
          {/* Tier */}
          <div className="telemetry-item">
            <span className="telemetry-label">Tier:</span>
            <span className="telemetry-val"><strong>{job.tier.toUpperCase()}</strong> ({job.steps} steps)</span>
          </div>

          {/* Telemetry status */}
          <div className="telemetry-item">
            <span className="telemetry-label">Reading:</span>
            {isReused ? (
              <span className="telemetry-val text-success">Library Cache</span>
            ) : isMeasured ? (
              <span className="telemetry-val text-success">Measured</span>
            ) : isProvisional ? (
              <span className="telemetry-val text-warning">Provisional Est.</span>
            ) : (
              <span className="telemetry-val">Estimated</span>
            )}
          </div>

          {/* Neurons */}
          <div className="telemetry-item">
            <span className="telemetry-label">Compute:</span>
            <span className="telemetry-val"><strong>{actualNeurons !== null ? `${actualNeurons.toFixed(1)} neurons` : "Unavailable"}</strong></span>
          </div>

          {/* Cost USD */}
          <div className="telemetry-item">
            <span className="telemetry-label">Cost:</span>
            <span className="telemetry-val"><strong>{actualCostUsd !== null ? `$${actualCostUsd.toFixed(6)}` : "Unavailable"}</strong></span>
          </div>

          {/* Time (seconds) */}
          <div className="telemetry-item">
            <span className="telemetry-label">Time:</span>
            <span className="telemetry-val"><strong>{timeSecondsText}</strong></span>
          </div>

          {/* Time Saved */}
          <div className="telemetry-item">
            <span className="telemetry-label">Time Saved:</span>
            <span className="telemetry-val text-muted">{timeSavedText}</span>
          </div>

          {/* Compute Saved % */}
          <div className="telemetry-item">
            <span className="telemetry-label">Compute Saved:</span>
            <strong className={`telemetry-val ${isReused || computeSavedPercent !== "0.0%" ? "text-success" : ""}`}>
              {computeSavedPercent}
            </strong>
          </div>

          {/* Cost Saved */}
          <div className="telemetry-item">
            <span className="telemetry-label">Cost Saved:</span>
            <strong className="telemetry-val text-success">{costSavedText}</strong>
          </div>
        </div>

        {/* Retry button if failed */}
        {job.status === "failed" && (
          <div style={{ marginTop: "auto", paddingTop: "8px" }}>
            <button
              type="button"
              className="btn-secondary retry-btn"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              {isRetrying ? "Retrying..." : "Retry Failed Item"}
            </button>
            {retryError && (
              <div className="retry-error-text">
                {retryError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

