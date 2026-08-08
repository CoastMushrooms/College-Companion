import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function QuickNote() {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!content.trim()) return;
    setError("");
    try {
      const allCourses = await api.getCourses();
      const fallbackCourseId = allCourses[0]?.id;
      if (!fallbackCourseId) { setError("Create a course first before saving quick notes."); return; }
      await api.createNote({ title: "Quick Note", content, course_id: fallbackCourseId });
      setSaved(true);
      setTimeout(() => navigate("/notes"), 800);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Quick Note</h1>
      <textarea
        autoFocus
        placeholder="Jot something down fast…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", minHeight: 150, fontSize: 16 }}
      />
      <button onClick={handleSave} style={{ width: "100%", padding: 14 }}>Save</button>
      {saved && <p className="success">Saved.</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}