// TRACK 3 builds the real UI here. This starter proves the backend connection works.
import { useEffect, useState } from "react";
import { api } from "./api/client";
import type { MaterialType, Plan } from "./api/types";

const BUTTONS: { type: MaterialType; label: string }[] = [
  { type: "colouring", label: "Colouring page" },
  { type: "worksheet", label: "Worksheet" },
  { type: "flashcards", label: "Flashcards" },
  { type: "poster", label: "Poster" },
  { type: "thumbnail", label: "Thumbnail / icon" },
  { type: "auto", label: "Let the system decide" },
];

export default function App() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [type, setType] = useState<MaterialType | null>(null);
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.health().then(() => setOnline(true)).catch(() => setOnline(false));
  }, []);

  async function makePlan() {
    if (!type || !prompt.trim()) return;
    try {
      setError(null);
      setPlan(await api.createPlan({ material_type: type, prompt }));
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>EduCreate AI</h1>
      <p>Backend: {online === null ? "checking..." : online ? "connected" : "not reachable"}</p>
      <div style={{ display: "flex", gap: 8 }}>
        {BUTTONS.map((b) => (
          <button key={b.type} onClick={() => setType(b.type)} aria-pressed={type === b.type}>
            {b.label}
          </button>
        ))}
      </div>
      {type && (
        <p>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="What do you need?" style={{ width: "70%" }} />{" "}
          <button onClick={makePlan}>Plan</button>
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {plan && <pre>{JSON.stringify(plan, null, 2)}</pre>}
    </main>
  );
}
