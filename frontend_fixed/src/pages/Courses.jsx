import { useEffect, useState } from "react";
import { api } from "../api";
import { getCourseColor } from "../utils/courseColor";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: "", professor: "", credits: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadCourses = () => {
    api.getCourses().then(setCourses).catch((e) => setError(e.message));
  };

  useEffect(() => { loadCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, credits: Number(form.credits) };
    try {
      if (editingId) await api.updateCourse(editingId, payload);
      else await api.createCourse(payload);
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
    if (!window.confirm("Delete this course?")) return;
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
        {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ name: "", professor: "", credits: "" }); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}

      {courses.length === 0 ? (
        <div className="empty-state">No courses yet — add your first one above.</div>
      ) : (
        <ul>
          {courses.map((c) => (
            <li key={c.id} className="card tabbed" style={{ borderLeftColor: getCourseColor(c.id) }}>
              <div className="page-header">
                <div>
                  <div className="card-title">{c.name}</div>
                  <div className="card-meta">{c.professor} · {c.credits} credits</div>
                </div>
                <div>
                  <button className="secondary" onClick={() => handleEdit(c)}>Edit</button>{" "}
                  <button className="secondary" onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}