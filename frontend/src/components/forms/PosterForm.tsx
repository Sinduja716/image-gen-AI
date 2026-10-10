import type { PosterFormValues } from "../../types/ui";

interface PosterFormProps {
  values: PosterFormValues;
  onChange: (updated: PosterFormValues) => void;
}

export function PosterForm({ values, onChange }: PosterFormProps) {
  return (
    <div className="dynamic-material-form" aria-label="Poster Generation Requirements">
      {/* 1. Poster Title (Optional) */}
      <div className="form-group">
        <label htmlFor="poster-title" className="form-label">
          <span>Poster Main Title</span>
          <span className="form-optional-badge">(Optional)</span>
        </label>
        <input
          id="poster-title"
          type="text"
          className="form-input"
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          placeholder="e.g., The Water Cycle: Nature's Endless Journey"
        />
        <p className="form-help">Large header banner text for the classroom poster.</p>
      </div>

      {/* 2. Poster Topic / Description */}
      <div className="form-group">
        <label htmlFor="poster-topic" className="form-label">
          <span>Poster Topic / Visual Description</span>
          <span className="form-required-badge">* Required</span>
        </label>
        <textarea
          id="poster-topic"
          className="form-textarea"
          rows={3}
          value={values.topic}
          onChange={(e) => onChange({ ...values, topic: e.target.value })}
          placeholder="e.g., Complete water cycle diagram illustrating ocean evaporation, cloud condensation, rain precipitation, mountain snowmelt, and river runoff"
          aria-required="true"
        />
        <p className="form-help">
          Describe the core visual layout, flow of information, and graphic elements needed.
        </p>
      </div>

      {/* 3. Supporting Text / Key Points (Optional) */}
      <div className="form-group">
        <label htmlFor="poster-key-points" className="form-label">
          Supporting Text / Key Pedagogical Points
          <span className="form-label-optional">(Optional)</span>
        </label>
        <textarea
          id="poster-key-points"
          className="form-textarea"
          rows={2}
          value={values.keyPoints}
          onChange={(e) => onChange({ ...values, keyPoints: e.target.value })}
          placeholder="e.g., Stage 1: Evaporation; Stage 2: Condensation; Stage 3: Precipitation; Stage 4: Collection"
        />
        <p className="form-help">
          Bullet points, callout labels, or explanatory captions to embed into the design.
        </p>
      </div>

      <div className="form-row">
        {/* 4. Visual Style */}
        <div className="form-group">
          <label htmlFor="poster-style" className="form-label">
            Visual Style
          </label>
          <select
            id="poster-style"
            className="form-select"
            value={values.visualStyle}
            onChange={(e) =>
              onChange({
                ...values,
                visualStyle: e.target.value as PosterFormValues["visualStyle"],
              })
            }
          >
            <option value="Educational illustration">Educational illustration (Detailed pedagogical style)</option>
            <option value="Colourful & Vibrant">Colourful & Vibrant (High contrast classroom display)</option>
            <option value="Minimal / Clean infographic">Minimal / Clean infographic (Modern structured flow)</option>
          </select>
          <p className="form-help">Passed to the planner to guide composition and sharpness.</p>
        </div>

        {/* 5. Poster Size */}
        <div className="form-group">
          <label htmlFor="poster-size" className="form-label">
            Poster Size
          </label>
          <select
            id="poster-size"
            className="form-select"
            value={values.size}
            onChange={(e) =>
              onChange({
                ...values,
                size: e.target.value as PosterFormValues["size"],
              })
            }
          >
            <option value="A3">A3 (Standard Classroom Poster — backend default)</option>
            <option value="A4">A4 (Compact Display Format)</option>
            <option value="Custom">Custom Dimensions (UI guideline only)</option>
          </select>
          <p className="form-help">
            Backend PDF pipeline renders A3 format natively for high resolution print.
          </p>
        </div>

        {/* 6. Orientation */}
        <div className="form-group">
          <label htmlFor="poster-orientation" className="form-label">
            Orientation
          </label>
          <select
            id="poster-orientation"
            className="form-select"
            value={values.orientation}
            onChange={(e) =>
              onChange({
                ...values,
                orientation: e.target.value as PosterFormValues["orientation"],
              })
            }
          >
            <option value="Portrait">Portrait (Standard pipeline format A3_PORTRAIT)</option>
            <option value="Landscape">Landscape (Visual guideline)</option>
          </select>
          <p className="form-help">
            A3_PORTRAIT is the confirmed backend layout format.
          </p>
        </div>
      </div>
    </div>
  );
}
