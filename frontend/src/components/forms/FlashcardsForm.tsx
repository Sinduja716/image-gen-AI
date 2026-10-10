import type { FlashcardsFormValues } from "../../types/ui";

interface FlashcardsFormProps {
  values: FlashcardsFormValues;
  onChange: (updated: FlashcardsFormValues) => void;
}

export function FlashcardsForm({ values, onChange }: FlashcardsFormProps) {
  return (
    <div className="dynamic-material-form" aria-label="Flashcards Generation Requirements">
      {/* 1. Topic / Vocabulary Category Prompt */}
      <div className="form-group">
        <label htmlFor="flashcard-topic" className="form-label">
          <span>Topic / Vocabulary Subject</span>
          <span className="form-required-badge">* Required</span>
        </label>
        <textarea
          id="flashcard-topic"
          className="form-textarea"
          rows={2}
          value={values.topic}
          onChange={(e) => onChange({ ...values, topic: e.target.value })}
          placeholder="e.g., Common farm animals (cow, sheep, pig, chicken, horse, duck)"
          aria-required="true"
        />
        <p className="form-help">
          The planner splits this into ordered cards (Item 1 to N) with clear, distinct subject visuals.
        </p>
      </div>

      <div className="form-row">
        {/* 2. Category Dropdown */}
        <div className="form-group">
          <label htmlFor="flashcard-category" className="form-label">
            Curriculum Category
          </label>
          <select
            id="flashcard-category"
            className="form-select"
            value={values.category}
            onChange={(e) =>
              onChange({
                ...values,
                category: e.target.value as FlashcardsFormValues["category"],
              })
            }
          >
            <option value="Animals">Animals & Wildlife</option>
            <option value="Fruits & Vegetables">Fruits & Vegetables</option>
            <option value="Numbers & Counting">Numbers & Counting (1 to N)</option>
            <option value="Alphabet & Phonics">Alphabet & Phonics (A to Z)</option>
            <option value="General Vocabulary">General Vocabulary</option>
            <option value="Custom">Custom Curriculum Topic</option>
          </select>
          <p className="form-help">Guides word list matching and library cache lookup.</p>
        </div>

        {/* 3. Number of Flashcards */}
        <div className="form-group">
          <label htmlFor="flashcard-count" className="form-label">
            Number of Flashcards
          </label>
          <input
            id="flashcard-count"
            type="number"
            className="form-input"
            min={1}
            max={30}
            value={values.cardCount}
            onChange={(e) =>
              onChange({
                ...values,
                cardCount: Math.max(1, Math.min(30, parseInt(e.target.value) || 6)),
              })
            }
          />
          <p className="form-help">Default: 6 cards (Supported: 1 to 30 cards per set).</p>
        </div>
      </div>

      <div className="form-row">
        {/* 4. Card Layout */}
        <div className="form-group">
          <label htmlFor="flashcard-layout" className="form-label">
            Card Visual Layout
          </label>
          <select
            id="flashcard-layout"
            className="form-select"
            value={values.layout}
            onChange={(e) =>
              onChange({
                ...values,
                layout: e.target.value as FlashcardsFormValues["layout"],
              })
            }
          >
            <option value="Picture + word">Picture + Word (Standard vocabulary card)</option>
            <option value="Picture only">Picture only (Memory & identification test)</option>
            <option value="Word only">Word only (Reading fluency card)</option>
          </select>
          <p className="form-help">Cards use standard 3&times;5 format per defaults.</p>
        </div>

        {/* 5. Language (Directly supported by API contract overrides.language) */}
        <div className="form-group">
          <label htmlFor="flashcard-language" className="form-label">
            Target Language
          </label>
          <select
            id="flashcard-language"
            className="form-select"
            value={values.language}
            onChange={(e) => onChange({ ...values, language: e.target.value })}
          >
            <option value="en">English (en)</option>
            <option value="es">Spanish (es)</option>
            <option value="fr">French (fr)</option>
            <option value="de">German (de)</option>
          </select>
          <p className="form-help">Directly sent via backend <code>overrides.language</code>.</p>
        </div>

        {/* 6. Difficulty / Learner Level */}
        <div className="form-group">
          <label htmlFor="flashcard-level" className="form-label">
            Learner Level
            <span className="form-label-optional">(Optional)</span>
          </label>
          <select
            id="flashcard-level"
            className="form-select"
            value={values.learnerLevel}
            onChange={(e) =>
              onChange({
                ...values,
                learnerLevel: e.target.value as FlashcardsFormValues["learnerLevel"],
              })
            }
          >
            <option value="Early Years">Early Years (Ages 3-5)</option>
            <option value="Primary">Primary (Ages 6-8)</option>
            <option value="Intermediate">Intermediate (Ages 9-11)</option>
          </select>
          <p className="form-help">Passed to planner for visual clarity calibration.</p>
        </div>
      </div>
    </div>
  );
}
