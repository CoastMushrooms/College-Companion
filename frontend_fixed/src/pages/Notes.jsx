import { useEffect, useState } from "react";
import { api } from "../api";
import { getCourseColor } from "../utils/courseColor";
import QuizQuestionItem from "../components/QuizQuestionItem";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", course_id: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = () => {
    api.getNotes().then(setNotes).catch((e) => setError(e.message));
    api.getCourses().then(setCourses).catch((e) => setError(e.message));
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, course_id: Number(form.course_id) };
    try {
      if (editingId) await api.updateNote(editingId, payload);
      else await api.createNote(payload);
      setForm({ title: "", content: "", course_id: "" });
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (n) => {
    setForm({ title: n.title, content: n.content, course_id: n.course_id });
    setEditingId(n.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    await api.deleteNote(id);
    loadData();
  };

  const courseName = (id) => courses.find((c) => c.id === id)?.name || "Unknown";

  const toggleExpand = async (noteId) => {
    if (expandedNoteId === noteId) { setExpandedNoteId(null); return; }
    setExpandedNoteId(noteId);
    setSummary("");
    setFlashcards([]);
    setQuiz([]);
    try {
      const [fc, qz] = await Promise.all([api.getFlashcards(noteId), api.getQuiz(noteId)]);
      setFlashcards(fc);
      setQuiz(qz);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSummarize = async (note) => {
    setAiLoading(true);
    setError("");
    try {
      const res = await api.summarize(note.content);
      setSummary(res.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateFlashcards = async (noteId) => {
    setAiLoading(true);
    setError("");
    try {
      const cards = await api.generateFlashcards(noteId);
      setFlashcards((prev) => [...prev, ...cards]);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuiz = async (noteId) => {
    setAiLoading(true);
    setError("");
    try {
      const questions = await api.generateQuiz(noteId);
      setQuiz((prev) => [...prev, ...questions]);
    } catch (err) {
      setError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div>
      <h1>Notes</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Note</button>
        {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ title: "", content: "", course_id: "" }); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}

      {notes.length === 0 ? (
        <div className="empty-state">No notes yet.</div>
      ) : (
        <ul>
          {notes.map((n) => (
            <li key={n.id} className="card tabbed" style={{ borderLeftColor: getCourseColor(n.course_id) }}>
              <div className="page-header">
                <div>
                  <div className="card-title">{n.title}</div>
                  <div className="card-meta">{courseName(n.course_id)}</div>
                </div>
                <div>
                  <button className="secondary" onClick={() => handleEdit(n)}>Edit</button>{" "}
                  <button className="secondary" onClick={() => handleDelete(n.id)}>Delete</button>{" "}
                  <button className="secondary" onClick={() => toggleExpand(n.id)}>
                    {expandedNoteId === n.id ? "Hide AI Tools" : "AI Tools"}
                  </button>
                </div>
              </div>
              <p style={{ marginTop: 8, marginBottom: 0 }}>{n.content}</p>

              {expandedNoteId === n.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <button className="secondary" onClick={() => handleSummarize(n)} disabled={aiLoading}>
                      {aiLoading ? "Working…" : "Summarize"}
                    </button>
                    <button className="secondary" onClick={() => handleGenerateFlashcards(n.id)} disabled={aiLoading}>
                      {aiLoading ? "Working…" : "Generate Flashcards"}
                    </button>
                    <button className="secondary" onClick={() => handleGenerateQuiz(n.id)} disabled={aiLoading}>
                      {aiLoading ? "Working…" : "Generate Quiz"}
                    </button>
                  </div>

                  {summary && <div className="card"><strong>Summary</strong><p>{summary}</p></div>}

                  {flashcards.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: 15, marginTop: 12 }}>Flashcards</h2>
                      {flashcards.map((f) => (
                        <div key={f.id} className="card">
                          <div className="card-title">Q: {f.question}</div>
                          <div className="card-meta">A: {f.answer}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {quiz.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: 15, marginTop: 12 }}>Quiz</h2>
                      {quiz.map((q) => <QuizQuestionItem key={q.id} question={q} />)}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}