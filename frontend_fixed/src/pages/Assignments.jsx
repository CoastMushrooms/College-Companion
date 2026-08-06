import { useEffect, useState } from "react";
import { api } from "../api";

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

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, priority: Number(form.priority), course_id: Number(form.course_id) };
    try {
      if (editingId) {
        await api.updateAssignment(editingId, payload);
      } else {
        await api.createAssignment(payload);
      }
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
    await api.deleteAssignment(id);
    loadData();
  };

  const courseName = (id) => courses.find((c) => c.id === id)?.name || "Unknown";

  return (
    <div>
      <h1>Assignments</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
        <input type="number" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} required />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Assignment</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", due_date: "", priority: 1, status: "not_started", course_id: "" }); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {assignments.map((a) => (
          <li key={a.id}>
            <strong>{a.title}</strong> — {courseName(a.course_id)} — due {a.due_date} — {a.status} (priority {a.priority})
            <button onClick={() => handleEdit(a)}>Edit</button>
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}