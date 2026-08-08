import { useEffect, useState } from "react";
import { api } from "../api";
import { getCourseColor } from "../utils/courseColor";

const STATUS_OPTIONS = ["not_started", "in_progress", "done"];

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", due_date: "", priority: 1, status: "not_started", course_id: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadData = () => {
    api.getAssignments().then(setAssignments).catch((e) => setError(e.message));
    api.getCourses().then(setCourses).catch((e) => setError(e.message));
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, priority: Number(form.priority), course_id: Number(form.course_id) };
    try {
      if (editingId) await api.updateAssignment(editingId, payload);
      else await api.createAssignment(payload);
      setForm({ title: "", due_date: "", priority: 1, status: "not_started", course_id: "" });
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (a) => {
    setForm({ title: a.title, due_date: a.due_date, priority: a.priority, status: a.status, course_id: a.course_id });
    setEditingId(a.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await api.deleteAssignment(id);
    loadData();
  };

  const courseName = (id) => courses.find((c) => c.id === id)?.name || "Unknown";
  const isOverdue = (a) => a.status !== "done" && a.due_date < new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1>Assignments</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
        <input type="number" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} required />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Assignment</button>
        {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ title: "", due_date: "", priority: 1, status: "not_started", course_id: "" }); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}

      {assignments.length === 0 ? (
        <div className="empty-state">No assignments yet.</div>
      ) : (
        <ul>
          {assignments.map((a) => (
            <li key={a.id} className="card tabbed" style={{ borderLeftColor: getCourseColor(a.course_id) }}>
              <div className="page-header">
                <div>
                  <div className="card-title">{a.title}</div>
                  <div className="card-meta">{courseName(a.course_id)} · due {a.due_date} · priority {a.priority}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`badge ${a.status === "done" ? "done" : isOverdue(a) ? "overdue" : ""}`}>
                    {isOverdue(a) ? "overdue" : a.status.replace("_", " ")}
                  </span>
                  <button className="secondary" onClick={() => handleEdit(a)}>Edit</button>
                  <button className="secondary" onClick={() => handleDelete(a.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}