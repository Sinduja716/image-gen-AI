import type { Tier } from "../api/types";

interface QualitySelectorProps {
  selectedTier: Tier | null;
  recommendedTier: Tier;
  recommendationReason: string;
  onSelectTier: (tier: Tier | null) => void;
}

interface TierOption {
  tier: Tier;
  name: string;
  steps: number;
  badgeText: string;
  description: string;
  typicalNeuronCost: string;
  accentClass: string;
}

const TIERS: TierOption[] = [
  {
    tier: "draft",
    name: "Draft",
    steps: 2,
    badgeText: "2 Steps • Lowest Compute",
    description: "Fast, minimal compute. Ideal for clean black-and-white outlines, colouring pages, and thumbnails.",
    typicalNeuronCost: "~30 neurons / item (66.7% compute savings)",
    accentClass: "tier-draft",
  },
  {
    tier: "standard",
    name: "Standard",
    steps: 4,
    badgeText: "4 Steps • Balanced Detail",
    description: "Harmonious balance of graphic clarity and compute. Perfect for multi-page worksheets and flashcards.",
    typicalNeuronCost: "~50 neurons / item (44.4% compute savings)",
    accentClass: "tier-standard",
  },
  {
    tier: "high",
    name: "High",
    steps: 8,
    badgeText: "8 Steps • Maximum Resolution",
    description: "Maximum sharpness and detail. Recommended for large A3 posters and intricate display graphics.",
    typicalNeuronCost: "~90 neurons / item (Baseline fresh generation)",
    accentClass: "tier-high",
  },
];

export function QualitySelector({
  selectedTier,
  recommendedTier,
  recommendationReason,
  onSelectTier,
}: QualitySelectorProps) {
  const isAuto = selectedTier === null;

  return (
    <div className="card quality-selector-card" aria-labelledby="quality-tier-heading">
      <div className="card-header">
        <div className="quality-header-row">
          <div className="step-indicator-heading">
            <span className="step-badge">3</span>
            <div>
              <h3 id="quality-tier-heading" className="card-title">
                Quality Tier Selection
              </h3>
              <p className="card-subtitle">
                Computational effort matched to your classroom material
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`auto-recommend-btn ${isAuto ? "active" : ""}`}
            onClick={() => onSelectTier(null)}
            aria-pressed={isAuto}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
            </svg>
            <span>{isAuto ? `Auto: ${recommendedTier.toUpperCase()} Recommended` : `Reset to Auto (${recommendedTier.toUpperCase()})`}</span>
          </button>
        </div>
      </div>

      <div className="recommendation-notice-box">
        <div className="recommendation-icon" aria-hidden="true">💡</div>
        <div className="recommendation-text">
          <strong>Planner Recommendation: </strong>
          {recommendationReason}
        </div>
      </div>

      <div className="tier-grid" role="radiogroup" aria-label="Quality Tiers">
        {TIERS.map((item) => {
          const isSelected = selectedTier === item.tier || (isAuto && recommendedTier === item.tier);
          const isRecommended = recommendedTier === item.tier;
          const isManualChoice = selectedTier === item.tier;

          return (
            <div
              key={item.tier}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              className={`tier-card ${item.accentClass} ${isSelected ? "active" : ""}`}
              onClick={() => onSelectTier(item.tier)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTier(item.tier);
                }
              }}
            >
              <div className="tier-header">
                <div className="tier-name-group">
                  <span className="tier-name">{item.name}</span>
                  {isRecommended && (
                    <span className="tier-recommended-pill">Recommended</span>
                  )}
                </div>
                <span className="tier-steps-badge">{item.steps} Steps</span>
              </div>

              <p className="tier-desc">{item.description}</p>

              <div className="tier-cost-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>{item.typicalNeuronCost}</span>
              </div>

              {isManualChoice && (
                <div className="tier-override-notice">
                  Teacher override active
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

