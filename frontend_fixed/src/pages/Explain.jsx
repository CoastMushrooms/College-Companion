import { useState } from "react";
import { api } from "../api";

export default function Explain() {
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("freshman");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.explain(concept, style);
      setExplanation(res.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Explain a Concept</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="e.g. Fourier Series" value={concept} onChange={(e) => setConcept(e.target.value)} required />
        <input placeholder="e.g. freshman, 5 year old" value={style} onChange={(e) => setStyle(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Thinking…" : "Explain"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {explanation && (
        <div className="card">
          <h2 style={{ marginTop: 0, fontSize: 16 }}>{concept}</h2>
          <p style={{ whiteSpace: "pre-wrap", color: "var(--ink)" }}>{explanation}</p>
        </div>
      )}
    </div>
  );
}