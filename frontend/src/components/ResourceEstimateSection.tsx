import type { ResourceEstimate } from "../api/types";

interface ResourceEstimateSectionProps {
  estimate: ResourceEstimate | null;
  count?: number;
  isReused?: boolean;
}

export function ResourceEstimateSection({
  estimate,
  count = 1,
  isReused = false,
}: ResourceEstimateSectionProps) {
  if (!estimate) {
    return (
      <section className="card estimate-card" aria-labelledby="estimate-heading">
        <div className="card-header">
          <div className="step-indicator-heading">
            <span className="step-badge">4</span>
            <div>
              <h3 id="estimate-heading" className="card-title">
                Resource Estimate & Savings
              </h3>
              <p className="card-subtitle">
                Computational effort and cost analysis vs. maximum-quality generation
              </p>
            </div>
          </div>
        </div>
        <div className="estimate-unavailable">
          <div className="estimate-empty-icon" aria-hidden="true">⚡</div>
          <p style={{ margin: "0 0 6px", fontWeight: 600 }}>Estimate waiting for inputs</p>
          <span>Enter your prompt and configure requirements above to calculate purpose-matched compute and savings.</span>
        </div>
      </section>
    );
  }

  const multiplier = Math.max(1, count);
  const totalNeurons = Number((estimate.neurons * (isReused ? 0 : multiplier)).toFixed(3));
  const totalCost = Number((estimate.cost_usd * (isReused ? 0 : multiplier)).toFixed(6));
  const baselineNeurons = Number((estimate.max_neurons * multiplier).toFixed(3));
  const baselineCost = Number((estimate.max_cost_usd * multiplier).toFixed(6));

  const absoluteNeuronsSaved = Math.max(0, baselineNeurons - totalNeurons);
  const absoluteCostSaved = Math.max(0, baselineCost - totalCost);

  // Percentage saved formula: (baseline - optimized) / baseline * 100
  const percentageSaved = isReused
    ? 100
    : baselineNeurons > 0
    ? Math.max(0, Math.min(100, ((baselineNeurons - totalNeurons) / baselineNeurons) * 100))
    : 0;

  return (
    <section className="card estimate-card" aria-labelledby="estimate-heading">
      <div className="card-header">
        <div className="estimate-header-row">
          <div className="step-indicator-heading">
            <span className="step-badge">4</span>
            <div>
              <h3 id="estimate-heading" className="card-title">
                Resource Estimate & Savings
              </h3>
              <p className="card-subtitle">
                Computational effort and cost comparison vs. maximum-quality baseline
              </p>
            </div>
          </div>

          <div className="estimate-badge-group">
            {isReused && (
              <span className="estimate-badge saving-badge">
                Library Reuse: 100% Saved
              </span>
            )}
            {estimate.placeholder ? (
              <span className="estimate-badge placeholder-badge" title="Neuron values are provisional placeholders until calibrated">
                Provisional Estimate
              </span>
            ) : estimate.measured ? (
              <span className="estimate-badge measured-badge">
                Measured reading
              </span>
            ) : (
              <span className="estimate-badge">
                Estimated profile
              </span>
            )}
            <span className="estimate-badge tier-pill-badge">
              Tier: {estimate.tier.toUpperCase()} ({estimate.steps} steps)
            </span>
          </div>
        </div>
      </div>

      <div className="estimate-grid">
        {/* Optimized Resource Usage */}
        <div className="estimate-stat-box box-optimized">
          <div className="stat-label">
            <span className="stat-dot dot-teal" aria-hidden="true" />
            Optimized Compute
          </div>
          <div className="stat-value">
            {totalNeurons.toLocaleString()} <span className="stat-unit">neurons</span>
          </div>
          <div className="stat-subvalue">
            Est. cost: <strong>${totalCost.toFixed(6)} USD</strong>
            {multiplier > 1 && ` (${multiplier} items)`}
          </div>
          {estimate.energy_wh !== null && (
            <div className="stat-subvalue stat-energy">
              Energy: {(estimate.energy_wh * (isReused ? 0 : multiplier)).toFixed(6)} Wh
            </div>
          )}
        </div>

        {/* Maximum Quality Baseline */}
        <div className="estimate-stat-box box-baseline">
          <div className="stat-label">
            <span className="stat-dot dot-blue" aria-hidden="true" />
            Maximum Baseline (High)
          </div>
          <div className="stat-value">
            {baselineNeurons.toLocaleString()} <span className="stat-unit">neurons</span>
          </div>
          <div className="stat-subvalue">
            Baseline cost: <strong>${baselineCost.toFixed(6)} USD</strong>
            {multiplier > 1 && ` (8 steps each)`}
          </div>
          {estimate.max_energy_wh !== null && (
            <div className="stat-subvalue stat-energy">
              Baseline energy: {(estimate.max_energy_wh * multiplier).toFixed(6)} Wh
            </div>
          )}
        </div>

        {/* Savings */}
        <div className="estimate-stat-box box-savings">
          <div className="stat-label stat-label-savings">
            <span className="stat-dot dot-green" aria-hidden="true" />
            Compute Saved
          </div>
          <div className="stat-value savings-text">
            {percentageSaved.toFixed(1)}% Saved
          </div>
          <div className="stat-subvalue stat-subvalue-savings">
            Saved: <strong>{absoluteNeuronsSaved.toFixed(1)} neurons</strong> (${absoluteCostSaved.toFixed(6)})
          </div>
        </div>
      </div>

      {/* Expandable Explanation: How is this calculated? */}
      <details className="calculation-details">
        <summary>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          How is this calculated?
        </summary>
        <div className="calculation-body">
          <p>
            <strong>EduCreate AI Efficiency Principle:</strong> Standard image pipelines generate every graphic at maximum quality (8 steps), consuming high GPU compute regardless of whether the output is a small icon, a clean colouring outline, or a high-res poster.
          </p>
          <p>
            <strong>Compute Metric:</strong> Compute is quantified in <em>Neurons</em> (Cloudflare Workers AI compute units).
            The current active tiers are <strong>Draft (2 steps, ~30 neurons)</strong>, <strong>Standard (4 steps, ~50 neurons)</strong>, and <strong>High (8 steps, ~90 neurons)</strong>.
          </p>
          <p>
            <strong>Baseline Definition:</strong> The baseline represents generating all requested pages fresh at <strong>High quality (8 steps)</strong> with zero cache or library reuse.
          </p>
          <div className="formula-box">
            <code>Percentage Saved = ((Baseline Neurons - Optimized Neurons) / Baseline Neurons) &times; 100</code>
          </div>
          <p>
            <strong>Pricing Calculation:</strong> Estimated cost uses the verified rate of <strong>$0.011 per 1,000 neurons</strong> (Cloudflare paid rate).
          </p>

          {estimate.notes && estimate.notes.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <strong>Backend Calculation Notes:</strong>
              <ul className="calculation-notes">
                {estimate.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}

