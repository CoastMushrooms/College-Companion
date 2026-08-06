import { useEffect, useState } from "react";
import { api } from "../api";

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
      <ul>
        {sorted.map((e) => (
          <li key={`${e.type}-${e.id}`}>{e.date} — {e.title} ({e.type}, {e.status})</li>
        ))}
      </ul>
    </div>
  );
}