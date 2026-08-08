import { useState } from "react";
import { api } from "../api";

export default function Planner() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getPlanner();
      setPlan(res.plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Study Planner</h1>
      <button onClick={handleGenerate} disabled={loading}>{loading ? "Planning…" : "Generate 7-Day Plan"}</button>
      {error && <p className="error">{error}</p>}
      {plan && <div className="card"><p style={{ whiteSpace: "pre-wrap", color: "var(--ink)" }}>{plan}</p></div>}
    </div>
  );
}