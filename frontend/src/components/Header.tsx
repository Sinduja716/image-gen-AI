import type { ActivePage } from "../types/ui";

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  online?: boolean | null;
}

export function Header({ activePage, onNavigate }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-wrapper">
          <div className="brand-logo-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
              <path d="m14 14 2 2 4-4" />
            </svg>
          </div>
          <div className="brand-text-block">
            <div className="brand-title-row">
              <h1 className="brand-title">EduCreate AI</h1>
              <span className="brand-badge">Track 3</span>
            </div>
            <p className="brand-tagline">
              Generate print-ready educational materials with compute effort matched to classroom purpose.
            </p>
          </div>
        </div>

        <nav className="nav-bar" role="tablist" aria-label="Main Navigation">
          <button
            type="button"
            role="tab"
            id="nav-tab-create"
            aria-selected={activePage === "create"}
            aria-controls="panel-create"
            className={`nav-tab ${activePage === "create" ? "active" : ""}`}
            onClick={() => onNavigate("create")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Create New
          </button>
          <button
            type="button"
            role="tab"
            id="nav-tab-creations"
            aria-selected={activePage === "creations"}
            aria-controls="panel-creations"
            className={`nav-tab ${activePage === "creations" ? "active" : ""}`}
            onClick={() => onNavigate("creations")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            My Creations
          </button>
        </nav>
      </div>
    </header>
  );
}

