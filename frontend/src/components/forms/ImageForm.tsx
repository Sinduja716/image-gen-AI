import type { ImageFormValues } from "../../types/ui";

interface ImageFormProps {
  values: ImageFormValues;
  onChange: (updated: ImageFormValues) => void;
}

export function ImageForm({ values, onChange }: ImageFormProps) {
  return (
    <div className="dynamic-material-form" aria-label="Image Generation Requirements">
      {/* 1. Image Prompt / Subject */}
      <div className="form-group">
        <label htmlFor="image-prompt" className="form-label">
          <span>Image Prompt / Subject</span>
          <span className="form-required-badge">* Required</span>
        </label>
        <textarea
          id="image-prompt"
          className="form-textarea"
          rows={3}
          value={values.prompt}
          onChange={(e) => onChange({ ...values, prompt: e.target.value })}
          placeholder="e.g., A friendly cartoon elephant drinking water from a river, bold clean lines"
          aria-required="true"
        />
        <p className="form-help">
          Describe the subject, central characters, or objects to illustrate for classroom use.
        </p>
      </div>

      <div className="form-row">
        {/* 2. Image Style */}
        <div className="form-group">
          <label htmlFor="image-style" className="form-label">
            Image Style
          </label>
          <select
            id="image-style"
            className="form-select"
            value={values.style}
            onChange={(e) => onChange({ ...values, style: e.target.value as ImageFormValues["style"] })}
          >
            <option value="outline">Black-and-white outline (Colouring page — Draft 2 steps)</option>
            <option value="color">Colour illustration (Standard 4 steps)</option>
            <option value="auto">Auto (Let system planner decide)</option>
          </select>
          <p className="form-help">
            Outlines require minimal compute steps; backend OpenCV contour caching is prioritized.
          </p>
        </div>

        {/* 3. Image Size / Aspect Ratio */}
        <div className="form-group">
          <label htmlFor="image-size" className="form-label">
            Image Canvas Size
          </label>
          <select
            id="image-size"
            className="form-select"
            value={values.size}
            onChange={(e) => onChange({ ...values, size: e.target.value as ImageFormValues["size"] })}
          >
            <option value="A4 Portrait">A4 Portrait (Print-ready default)</option>
            <option value="Square (1:1)">Square (1:1 — Icon / Tile)</option>
            <option value="Portrait (2:3)">Portrait (2:3)</option>
            <option value="Landscape (3:2)">Landscape (3:2)</option>
            <option value="A4 Landscape">A4 Landscape</option>
          </select>
          <p className="form-help">
            UI dimension guideline (encoded in prompt; backend pipeline exports to A4 format).
          </p>
        </div>

        {/* 4. Number of Images */}
        <div className="form-group">
          <label htmlFor="image-count" className="form-label">
            Number of Images
          </label>
          <input
            id="image-count"
            type="number"
            className="form-input"
            min={1}
            max={30}
            value={values.count}
            onChange={(e) =>
              onChange({
                ...values,
                count: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)),
              })
            }
          />
          <p className="form-help">Default: 1 (Maximum 30 items per plan).</p>
        </div>
      </div>
    </div>
  );
}
