import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Today's Tasks</h2>
      {data.todays_tasks.length === 0 && <p>Nothing due today.</p>}
      <ul>
        {data.todays_tasks.map((a) => (
          <li key={a.id}>{a.title} — {a.status}</li>
        ))}
      </ul>
      <h2>Upcoming Assignments</h2>
      <ul>
        {data.upcoming_assignments.map((a) => (
          <li key={a.id}>{a.title} — due {a.due_date} — {a.status}</li>
        ))}
      </ul>
    </div>
  );
}