import type { ReactNode } from "react";
import type { ContentKind, ContentKindOption, FlashcardsFormValues, ImageFormValues, PosterFormValues, WorksheetFormValues } from "../types/ui";
import { ImageForm } from "./forms/ImageForm";
import { WorksheetForm } from "./forms/WorksheetForm";
import { FlashcardsForm } from "./forms/FlashcardsForm";
import { PosterForm } from "./forms/PosterForm";

interface ExtendedOption extends ContentKindOption {
  icon: ReactNode;
  accentClass: string;
}

export const CONTENT_OPTIONS: ExtendedOption[] = [
  {
    kind: "image",
    materialType: "colouring",
    title: "Image",
    badge: "Colouring & Art",
    description: "Single educational images, colouring outlines (Draft, 2 steps) or full-colour illustrations.",
    defaultTier: "draft",
    defaultSteps: 2,
    accentClass: "accent-lavender",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
      </svg>
    ),
  },
  {
    kind: "worksheet",
    materialType: "worksheet",
    title: "Worksheet",
    badge: "Multi-page",
    description: "Curriculum worksheets with multiple pages, activity prompts, and exercise layouts.",
    defaultTier: "standard",
    defaultSteps: 4,
    accentClass: "accent-blue",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    ),
  },
  {
    kind: "flashcards",
    materialType: "flashcards",
    title: "Flashcards",
    badge: "Configurable Sets",
    description: "Vocabulary and concept cards with custom categories and item counts (e.g., A-Z, numbers).",
    defaultTier: "standard",
    defaultSteps: 4,
    accentClass: "accent-amber",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="18" x="8" y="4" rx="2" />
        <path d="M4 8v12a2 2 0 0 0 2 2h10" />
        <circle cx="15" cy="11" r="2" />
        <path d="M11 17h8" />
      </svg>
    ),
  },
  {
    kind: "poster",
    materialType: "poster",
    title: "Poster",
    badge: "A3 High-Res",
    description: "Large format classroom posters with high graphic detail and vibrant pedagogical layouts.",
    defaultTier: "high",
    defaultSteps: 8,
    accentClass: "accent-emerald",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 9 3-3 3 3" />
        <path d="M12 6v12" />
        <path d="m9 15 3 3 3-3" />
      </svg>
    ),
  },
];

interface CreationWorkspaceProps {
  selectedKind: ContentKind;
  onSelectKind: (kind: ContentKind) => void;
  imageValues: ImageFormValues;
  onChangeImageValues: (values: ImageFormValues) => void;
  worksheetValues: WorksheetFormValues;
  onChangeWorksheetValues: (values: WorksheetFormValues) => void;
  flashcardsValues: FlashcardsFormValues;
  onChangeFlashcardsValues: (values: FlashcardsFormValues) => void;
  posterValues: PosterFormValues;
  onChangePosterValues: (values: PosterFormValues) => void;
  onGetEstimate: () => void;
  isPlanning: boolean;
  warnings?: string[];
  isFormValid: boolean;
}

export function CreationWorkspace({
  selectedKind,
  onSelectKind,
  imageValues,
  onChangeImageValues,
  worksheetValues,
  onChangeWorksheetValues,
  flashcardsValues,
  onChangeFlashcardsValues,
  posterValues,
  onChangePosterValues,
  onGetEstimate,
  isPlanning,
  warnings,
  isFormValid,
}: CreationWorkspaceProps) {
  const currentOption = CONTENT_OPTIONS.find((opt) => opt.kind === selectedKind) || CONTENT_OPTIONS[0];

  return (
    <div className="card workspace-card" aria-labelledby="workspace-heading">
      <div className="card-header">
        <div className="step-indicator-heading">
          <span className="step-badge">1</span>
          <div>
            <h2 id="workspace-heading" className="card-title">
              Select Material Type
            </h2>
            <p className="card-subtitle">
              Choose the educational format. The requirements below adjust dynamically to your selection.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Content Options Grid */}
      <div className="type-selector-grid" role="radiogroup" aria-label="Educational Material Types">
        {CONTENT_OPTIONS.map((opt) => {
          const isSelected = opt.kind === selectedKind;
          return (
            <button
              key={opt.kind}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`type-button ${opt.accentClass} ${isSelected ? "active" : ""}`}
              onClick={() => onSelectKind(opt.kind)}
            >
              <div className="type-button-header">
                <div className="type-icon-box" aria-hidden="true">
                  {opt.icon}
                </div>
                <span className="type-badge-pill">{opt.badge}</span>
              </div>
              <div className="type-button-info">
                <span className="type-button-title">{opt.title}</span>
                <p className="type-button-desc">{opt.description}</p>
              </div>
              {isSelected && (
                <div className="type-selected-indicator" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Form Area — Strictly Per-Type */}
      <div id="content-form-area" className="dynamic-form-container">
        <div className="dynamic-form-header">
          <div className="step-indicator-heading">
            <span className="step-badge">2</span>
            <div>
              <h3 className="card-title" style={{ fontSize: "16px", margin: 0 }}>
                {currentOption.title} Requirements
              </h3>
              <p className="card-subtitle" style={{ fontSize: "13px", marginTop: "2px" }}>
                Tailored fields for high-quality {currentOption.title.toLowerCase()} generation
              </p>
            </div>
          </div>
          <span className="active-format-pill">
            Format: {selectedKind.toUpperCase()}
          </span>
        </div>

        {/* Dynamic Form Rendered Strictly According to Selected Type */}
        <div className="dynamic-form-body">
          {selectedKind === "image" && (
            <ImageForm values={imageValues} onChange={onChangeImageValues} />
          )}

          {selectedKind === "worksheet" && (
            <WorksheetForm values={worksheetValues} onChange={onChangeWorksheetValues} />
          )}

          {selectedKind === "flashcards" && (
            <FlashcardsForm values={flashcardsValues} onChange={onChangeFlashcardsValues} />
          )}

          {selectedKind === "poster" && (
            <PosterForm values={posterValues} onChange={onChangePosterValues} />
          )}
        </div>

        {/* Warnings from planner */}
        {warnings && warnings.length > 0 && (
          <div className="alert alert-warning" role="alert" style={{ marginTop: "16px" }}>
            <strong>Planner Notice: </strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Refresh / Update Estimate Button */}
        <div className="form-action-footer">
          <button
            type="button"
            className="btn-secondary recalculate-btn"
            onClick={onGetEstimate}
            disabled={!isFormValid || isPlanning}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            {isPlanning ? "Calculating Estimate..." : "Recalculate Estimate"}
          </button>
        </div>
      </div>
    </div>
  );
}

