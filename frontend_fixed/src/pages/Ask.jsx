import { useState } from "react";
import { api } from "../api";

export default function Ask() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.ragQuery(question);
      setAnswer(res.answer);
      setSources(res.sources);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Ask Your Documents</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="What did the professor say about recursion?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          style={{ width: "100%" }}
        />
        <button type="submit" disabled={loading}>{loading ? "Searching…" : "Ask"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {answer && (
        <div className="card">
          <p style={{ whiteSpace: "pre-wrap", color: "var(--ink)" }}>{answer}</p>
          {sources.length > 0 && <div className="card-meta">Sources: {sources.join(", ")}</div>}
        </div>
      )}
    </div>
  );
}