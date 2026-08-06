import { useEffect, useState } from "react";
import { api } from "../api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", professor: "", credits: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadCourses = () => {
    api.getCourses().then(setCourses).catch((e) => setError(e.message));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, credits: Number(form.credits) };
    try {
      if (editingId) {
        await api.updateCourse(editingId, payload);
      } else {
        await api.createCourse(payload);
      }
      setForm({ name: "", professor: "", credits: "" });
      setEditingId(null);
      loadCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (course) => {
    setForm({ name: course.name, professor: course.professor, credits: course.credits });
    setEditingId(course.id);
  };

  const handleDelete = async (id) => {
    await api.deleteCourse(id);
    loadCourses();
  };

  return (
    <div>
      <h1>Courses</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Course name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Professor" value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} required />
        <input placeholder="Credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} required />
        <button type="submit">{editingId ? "Update" : "Add"} Course</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", professor: "", credits: "" }); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> — {c.professor} ({c.credits} credits)
            <button onClick={() => handleEdit(c)}>Edit</button>
            <button onClick={() => handleDelete(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}