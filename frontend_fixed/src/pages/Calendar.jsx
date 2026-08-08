import { useEffect, useState } from "react";
import { api } from "../api";
import { getCourseColor } from "../utils/courseColor";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCalendar().then(setEvents).catch((e) => setError(e.message));
  }, []);

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Calendar</h1>
      {sorted.length === 0 ? (
        <div className="empty-state">No upcoming events.</div>
      ) : (
        <ul>
          {sorted.map((e) => (
            <li key={`${e.type}-${e.id}`} className="card tabbed" style={{ borderLeftColor: getCourseColor(e.id) }}>
              <div className="page-header">
                <div>
                  <div className="card-title">{e.title}</div>
                  <div className="card-meta">{e.date} · {e.type}</div>
                </div>
                <span className={`badge ${e.status === "done" ? "done" : ""}`}>{e.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}