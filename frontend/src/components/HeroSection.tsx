export function HeroSection() {
  return (
    <section className="hero-section" aria-label="Welcome to EduCreate AI">
      <div className="hero-content">
        <div className="hero-eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
          </svg>
          <span>AI-POWERED LEARNING STUDIO</span>
        </div>

        <h2 className="hero-title">
          Create something amazing for your classroom.
        </h2>

        <p className="hero-subtitle">
          Turn your ideas into engaging worksheets, flashcards, illustrations, and classroom posters &mdash; while making every generation count.
        </p>

        <div className="hero-chips">
          <div className="hero-chip hero-chip-teal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Purpose-aware AI generation</span>
          </div>

          <div className="hero-chip hero-chip-blue">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span>Transparent compute savings</span>
          </div>
        </div>
      </div>

      {/* Decorative education visual on the right */}
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-card-stack">
          {/* Card 1: Poster (back) */}
          <div className="hero-mini-card hero-card-poster">
            <div className="mini-card-header">
              <span className="mini-card-tag tag-purple">Poster • A3</span>
              <span className="mini-card-steps">8 Steps</span>
            </div>
            <div className="mini-card-preview poster-art">
              <div className="mini-sun" />
              <div className="mini-mountains" />
            </div>
            <div className="mini-card-label">Water Cycle Poster</div>
          </div>

          {/* Card 2: Worksheet (middle) */}
          <div className="hero-mini-card hero-card-worksheet">
            <div className="mini-card-header">
              <span className="mini-card-tag tag-blue">Worksheet</span>
              <span className="mini-card-steps">4 Steps</span>
            </div>
            <div className="mini-card-lines">
              <div className="mini-line w-80" />
              <div className="mini-line w-60" />
              <div className="mini-line w-90" />
            </div>
            <div className="mini-card-label">Solar System Quiz</div>
          </div>

          {/* Card 3: Flashcards (front) */}
          <div className="hero-mini-card hero-card-flashcard">
            <div className="mini-card-header">
              <span className="mini-card-tag tag-teal">Flashcards</span>
              <span className="mini-savings-pill">66% Saved</span>
            </div>
            <div className="mini-card-body-flash">
              <div className="mini-icon-circle">🦁</div>
              <div className="mini-flash-word">Lion / Le&oacute;n</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
