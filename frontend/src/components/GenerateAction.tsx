import type { Tier } from "../api/types";
import type { ContentKind } from "../types/ui";

interface GenerateActionProps {
  contentKind: ContentKind;
  prompt: string;
  count: number;
  tier: Tier;
  steps: number;
  isGenerating: boolean;
  onGenerate: () => void;
  statusMessage?: string | null;
  errorMessage?: string | null;
  isOffline?: boolean;
}

export function GenerateAction({
  contentKind,
  prompt,
  count,
  tier,
  steps,
  isGenerating,
  onGenerate,
  statusMessage,
  errorMessage,
  isOffline,
}: GenerateActionProps) {
  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  return (
    <div className="card generate-card" aria-labelledby="generate-heading">
      <div className="generate-action-layout">
        <div className="generate-meta">
          <div className="step-indicator-heading">
            <span className="step-badge">5</span>
            <div>
              <h3 id="generate-heading" className="card-title">
                Generate Classroom Material
              </h3>
              <p className="card-subtitle">
                {prompt.trim()
                  ? `Ready to generate ${count} ${contentKind} item(s) at ${tier.toUpperCase()} quality (${steps} steps).`
                  : "Enter requirements and prompt above to proceed with generation."}
              </p>
            </div>
          </div>

          <div className="generate-pipeline-hint">
            <span className="pipeline-dot" aria-hidden="true" />
            <span>Workflow: Cache check &rarr; Purpose-matched compute &rarr; Print-ready export</span>
          </div>

          {isOffline && (
            <div className="offline-inline-notice" role="note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>Offline Simulation Active: Backend unavailable on port 8000. Operating in preview simulation.</span>
            </div>
          )}
        </div>

        <div className="generate-btn-wrapper">
          <button
            type="button"
            id="btn-generate"
            className="btn-primary generate-main-btn"
            disabled={!canGenerate}
            onClick={onGenerate}
            aria-busy={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Generating Materials...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                </svg>
                <span>Generate {contentKind.charAt(0).toUpperCase() + contentKind.slice(1)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="alert alert-info generate-feedback" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error generate-feedback" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

