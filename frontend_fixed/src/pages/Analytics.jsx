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
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Analytics</h1>

      {warning && (
        <div style={{
          padding: "12px",
          borderRadius: "6px",
          background: warning.at_risk ? "#fdecea" : "#e8f5e9",
          color: warning.at_risk ? "#c62828" : "#2e7d32",
          marginBottom: "20px"
        }}>
          {warning.message}
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="stat-card">
          <h3>{data.total_study_hours}</h3>
          <p>Total study hours</p>
        </div>
        <div className="stat-card">
          <h3>{data.completion_rate}%</h3>
          <p>Assignment completion rate</p>
        </div>
        <div className="stat-card">
          <h3>{data.completed_assignments} / {data.total_assignments}</h3>
          <p>Assignments done</p>
        </div>
      </div>

      <h2>Study Hours Over Time</h2>
      {data.hours_by_day.length === 0 ? (
        <p>No study sessions logged yet, use the Timer to start tracking.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.hours_by_day}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}