import { useEffect, useState } from "react";
import { api } from "./api/client";
import type { ActivePage, SessionCreation } from "./types/ui";
import { Header } from "./components/Header";
import { CreateNewPage } from "./components/CreateNewPage";
import { MyCreationsPage } from "./components/MyCreationsPage";

export default function App() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>("create");
  const [sessionCreations, setSessionCreations] = useState<SessionCreation[]>([]);

  useEffect(() => {
    // Health check verifying connection to FastAPI backend
    api.health()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const handleAddSessionCreation = (creation: SessionCreation) => {
    setSessionCreations((prev) => [creation, ...prev.filter((c) => c.planId !== creation.planId)]);
  };

  const handleUpdateSessionCreation = (updated: SessionCreation) => {
    setSessionCreations((prev) => prev.map((c) => (c.planId === updated.planId ? updated : c)));
  };

  return (
    <div className="app-container">
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        online={online}
      />

      <main>
        {activePage === "create" ? (
          <CreateNewPage
            onSessionCreationAdded={handleAddSessionCreation}
            online={online}
          />
        ) : (
          <MyCreationsPage
            sessionCreations={sessionCreations}
            onNavigateToCreate={() => setActivePage("create")}
            onUpdateSessionCreation={handleUpdateSessionCreation}
          />
        )}
      </main>
    </div>
  );
}
