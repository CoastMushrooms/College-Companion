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
      return <ul>{item.response.map((q, i) => <li key={i}>{q.question} — <em>{q.answer}</em></li>)}</ul>;
    }
    return <p style={{ whiteSpace: "pre-wrap", color: "var(--ink)", margin: 0 }}>{item.response}</p>;
  };

  return (
    <div>
      <h1>Ask Anything</h1>
      <p>Routes automatically to the right specialist: tutor, planner, research, quiz, writing, or career.</p>

      <div style={{ marginBottom: 20 }}>
        {history.map((item, i) =>
          item.role === "user" ? (
            <p key={i} className="chat-bubble-user"><strong>You:</strong> {item.text}</p>
          ) : (
            <div key={i} className="chat-bubble-agent">
              <div className="chat-agent-label">{item.agent} agent</div>
              {renderResponse(item)}
            </div>
          )
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Ask about a concept, plan your week, review writing…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading}>{loading ? "Thinking…" : "Send"}</button>
      </form>
    </div>
  );
}