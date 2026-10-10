import type { WorksheetFormValues } from "../../types/ui";

interface WorksheetFormProps {
  values: WorksheetFormValues;
  onChange: (updated: WorksheetFormValues) => void;
}

export function WorksheetForm({ values, onChange }: WorksheetFormProps) {
  return (
    <div className="dynamic-material-form" aria-label="Worksheet Generation Requirements">
      {/* 1. Topic / Learning Activity */}
      <div className="form-group">
        <label htmlFor="worksheet-topic" className="form-label">
          <span>Topic / Learning Activity</span>
          <span className="form-required-badge">* Required</span>
        </label>
        <textarea
          id="worksheet-topic"
          className="form-textarea"
          rows={3}
          value={values.topic}
          onChange={(e) => onChange({ ...values, topic: e.target.value })}
          placeholder="e.g., Solar system planet identification with word bank and handwriting practice lines"
          aria-required="true"
        />
        <p className="form-help">
          Specify the lesson concept, subject area, and target exercise questions or diagrams.
        </p>
      </div>

      <div className="form-row">
        {/* 2. Worksheet Activity Type */}
        <div className="form-group">
          <label htmlFor="worksheet-activity-type" className="form-label">
            Worksheet Activity Type
          </label>
          <select
            id="worksheet-activity-type"
            className="form-select"
            value={values.activityType}
            onChange={(e) =>
              onChange({
                ...values,
                activityType: e.target.value as WorksheetFormValues["activityType"],
              })
            }
          >
            <option value="Matching">Matching (Connect terms & illustrations)</option>
            <option value="Tracing">Tracing (Letters, words & line contours)</option>
            <option value="Colouring">Colouring (Educational diagram colouring)</option>
            <option value="Fill in the blanks">Fill in the blanks (Sentence completion)</option>
            <option value="Quiz">Quiz (Multiple-choice / short identification)</option>
          </select>
          <p className="form-help">
            Passed as prompt instruction for AI layout; backend schemas handle activities via prompt synthesis.
          </p>
        </div>

        {/* 3. Difficulty Level */}
        <div className="form-group">
          <label htmlFor="worksheet-difficulty" className="form-label">
            Difficulty Level
          </label>
          <select
            id="worksheet-difficulty"
            className="form-select"
            value={values.difficulty}
            onChange={(e) =>
              onChange({
                ...values,
                difficulty: e.target.value as WorksheetFormValues["difficulty"],
              })
            }
          >
            <option value="Beginner">Beginner (Foundational / Primary K-2)</option>
            <option value="Intermediate">Intermediate (Grades 3-5)</option>
            <option value="Advanced">Advanced (Grades 6+)</option>
          </select>
          <p className="form-help">
            Encoded into prompt guidance to calibrate vocabulary complexity.
          </p>
        </div>
      </div>

      <div className="form-row">
        {/* 4. Number of Pages */}
        <div className="form-group">
          <label htmlFor="worksheet-pages" className="form-label">
            Number of Pages
          </label>
          <input
            id="worksheet-pages"
            type="number"
            className="form-input"
            min={1}
            max={30}
            value={values.pageCount}
            onChange={(e) =>
              onChange({
                ...values,
                pageCount: Math.max(1, Math.min(30, parseInt(e.target.value) || 1)),
              })
            }
          />
          <p className="form-help">Default: 1 page (Supported range: 1 to 30 pages).</p>
        </div>

        {/* 5. Paper Size */}
        <div className="form-group">
          <label htmlFor="worksheet-paper-size" className="form-label">
            Paper Format
          </label>
          <select
            id="worksheet-paper-size"
            className="form-select"
            value={values.paperSize}
            onChange={(e) =>
              onChange({
                ...values,
                paperSize: e.target.value as WorksheetFormValues["paperSize"],
              })
            }
          >
            <option value="A4">A4 Portrait (Backend standard PDF export)</option>
            <option value="Letter">Letter (8.5 &times; 11 in — visual guideline)</option>
          </select>
          <p className="form-help">
            A4 Portrait is the confirmed backend printable document format.
          </p>
        </div>
      </div>
    </div>
  );
}
