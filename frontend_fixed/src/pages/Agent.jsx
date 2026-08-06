import { useState } from "react";
import { api } from "../api";

export default function Agent() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setError("");
    setLoading(true);
    const userMessage = message;
    setMessage("");
    try {
      const res = await api.askAgent(userMessage);
      setHistory((prev) => [...prev, { role: "user", text: userMessage }, { role: "agent", agent: res.agent, response: res.response }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = (item) => {
    if (Array.isArray(item.response)) {
      return (
        <ul>
          {item.response.map((q, i) => <li key={i}>{q.question} — <em>{q.answer}</em></li>)}
        </ul>
      );
    }
    return <p style={{ whiteSpace: "pre-wrap" }}>{item.response}</p>;
  };

  return (
    <div>
      <h1>Ask Anything</h1>
      <p style={{ color: "#888" }}>Routes automatically to the right specialist: tutor, planner, research, quiz, writing, or career.</p>

      <div style={{ marginBottom: "20px" }}>
        {history.map((item, i) =>
          item.role === "user" ? (
            <p key={i}><strong>You:</strong> {item.text}</p>
          ) : (
            <div key={i} style={{ background: "white", padding: "12px", borderRadius: "6px", marginBottom: "10px" }}>
              <p style={{ color: "#888", fontSize: "12px", textTransform: "uppercase", margin: 0 }}>{item.agent} agent</p>
              {renderResponse(item)}
            </div>
          )
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Ask about a concept, plan your week, review writing, anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "70%" }}
        />
        <button type="submit" disabled={loading}>{loading ? "Thinking..." : "Send"}</button>
      </form>
    </div>
  );
}