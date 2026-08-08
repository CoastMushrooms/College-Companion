import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../api";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [warning, setWarning] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAnalytics().then(setData).catch((e) => setError(e.message));
    api.getDeadlineWarning().then(setWarning).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h1>Analytics</h1>

      {warning && (
        <div className="card" style={{ borderColor: warning.at_risk ? "var(--danger)" : "var(--success)" }}>
          <p style={{ color: warning.at_risk ? "var(--danger)" : "var(--success)", margin: 0 }}>{warning.message}</p>
        </div>
      )}

      <div className="stat-row" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-value">{data.total_study_hours}</div>
          <div className="stat-label">Total study hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.completion_rate}%</div>
          <div className="stat-label">Completion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.completed_assignments}/{data.total_assignments}</div>
          <div className="stat-label">Assignments done</div>
        </div>
      </div>

      <h2>Study Hours Over Time</h2>
      {data.hours_by_day.length === 0 ? (
        <div className="empty-state">No study sessions logged yet — use the Timer to start tracking.</div>
      ) : (
        <div className="card">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.hours_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hours" stroke="var(--amber)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}