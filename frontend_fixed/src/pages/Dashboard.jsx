import { useEffect, useState } from "react";
import { api } from "../api";
import { getCourseColor } from "../utils/courseColor";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
    api.getCourses().then(setCourses).catch(() => {});
  }, []);

  const courseName = (id) => courses.find((c) => c.id === id)?.name || "General";

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ marginTop: -8, marginBottom: 28 }}>{today}</p>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{data.todays_tasks.length}</div>
          <div className="stat-label">Due today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.upcoming_assignments.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
      </div>

      <h2>Today</h2>
      {data.todays_tasks.length === 0 ? (
        <div className="empty-state">Nothing due today — good time to get ahead.</div>
      ) : (
        <ul>
          {data.todays_tasks.map((a) => (
            <li key={a.id} className="card tabbed" style={{ borderLeftColor: getCourseColor(a.course_id) }}>
              <div className="card-title">{a.title}</div>
              <div className="card-meta">{courseName(a.course_id)}</div>
            </li>
          ))}
        </ul>
      )}

      <h2>Upcoming</h2>
      {data.upcoming_assignments.length === 0 ? (
        <div className="empty-state">Nothing on the horizon.</div>
      ) : (
        <ul>
          {data.upcoming_assignments.map((a) => (
            <li key={a.id} className="card tabbed" style={{ borderLeftColor: getCourseColor(a.course_id) }}>
              <div className="card-title">{a.title}</div>
              <div className="card-meta">{courseName(a.course_id)} · due {a.due_date}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}