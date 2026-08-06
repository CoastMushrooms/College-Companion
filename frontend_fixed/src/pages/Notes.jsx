import { useEffect, useState } from "react";
import { api } from "../api";

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

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, course_id: Number(form.course_id) };
    try {
      if (editingId) {
        await api.updateNote(editingId, payload);
      } else {
        await api.createNote(payload);
      }
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
    await api.deleteNote(id);
    loadData();
  };

  const courseName = (id) => courses.find((c) => c.id === id)?.name || "Unknown";

  const toggleExpand = async (noteId) => {
    if (expandedNoteId === noteId) {
      setExpandedNoteId(null);
      return;
    }
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
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", content: "", course_id: "" }); }}>Cancel</button>}
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <strong>{n.title}</strong> — {courseName(n.course_id)}
            <p>{n.content}</p>
            <button onClick={() => handleEdit(n)}>Edit</button>
            <button onClick={() => handleDelete(n.id)}>Delete</button>
            <button onClick={() => toggleExpand(n.id)}>
              {expandedNoteId === n.id ? "Hide AI Tools" : "AI Tools"}
            </button>

            {expandedNoteId === n.id && (
              <div style={{ marginTop: "10px", paddingLeft: "10px", borderLeft: "2px solid #ddd" }}>
                <button onClick={() => handleSummarize(n)} disabled={aiLoading}>
                  {aiLoading ? "Working..." : "Summarize"}
                </button>
                <button onClick={() => handleGenerateFlashcards(n.id)} disabled={aiLoading}>
                  {aiLoading ? "Working..." : "Generate Flashcards"}
                </button>
                <button onClick={() => handleGenerateQuiz(n.id)} disabled={aiLoading}>
                  {aiLoading ? "Working..." : "Generate Quiz"}
                </button>

                {summary && (
                  <div>
                    <h4>Summary</h4>
                    <p>{summary}</p>
                  </div>
                )}

                {flashcards.length > 0 && (
                  <div>
                    <h4>Flashcards</h4>
                    <ul>
                      {flashcards.map((f) => (
                        <li key={f.id}><strong>Q:</strong> {f.question}<br /><strong>A:</strong> {f.answer}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {quiz.length > 0 && (
                  <div>
                    <h4>Quiz</h4>
                    <ul>
                      {quiz.map((q) => (
                        <li key={q.id}>
                          <strong>{q.question}</strong> ({q.type})
                          {q.options && <div>Options: {JSON.parse(q.options).join(", ")}</div>}
                          <div><em>Answer: {q.answer}</em></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}