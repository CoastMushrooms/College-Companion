import { useEffect, useState } from "react";
import { api } from "../api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [generatingId, setGeneratingId] = useState(null);
  const [expandedDocId, setExpandedDocId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  const loadData = () => {
    api.getDocuments().then(setDocuments).catch((e) => setError(e.message));
    api.getCourses().then(setCourses).catch((e) => setError(e.message));
  };

  useEffect(() => { loadData(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);
    try {
      await api.uploadDocument(file, Number(courseId));
      setFile(null);
      setCourseId("");
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateFlashcards = async (documentId) => {
    setGeneratingId(documentId);
    setError("");
    try {
      const cards = await api.generateDocumentFlashcards(documentId);
      setExpandedDocId(documentId);
      setFlashcards((prev) => [...prev, ...cards]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const toggleExpand = async (documentId) => {
    if (expandedDocId === documentId) { setExpandedDocId(null); return; }
    setExpandedDocId(documentId);
    setError("");
    try {
      const cards = await api.getDocumentFlashcards(documentId);
      setFlashcards(cards);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document and all its flashcards?")) return;
    setError("");
    try {
      await api.deleteDocument(id);
      if (expandedDocId === id) { setExpandedDocId(null); setFlashcards([]); }
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Documents</h1>
      <form onSubmit={handleUpload}>
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required />
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
          <option value="">Select course</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload PDF"}</button>
      </form>
      {error && <p className="error">{error}</p>}

      {documents.length === 0 ? (
        <div className="empty-state">No documents uploaded yet.</div>
      ) : (
        <ul>
          {documents.map((d) => (
            <li key={d.id} className="card">
              <div className="page-header">
                <div className="card-title">{d.filename}</div>
                <div>
                  <button className="secondary" onClick={() => handleGenerateFlashcards(d.id)} disabled={generatingId === d.id}>
                    {generatingId === d.id ? "Generating…" : "Generate Flashcards"}
                  </button>{" "}
                  <button className="secondary" onClick={() => toggleExpand(d.id)}>
                    {expandedDocId === d.id ? "Hide" : "View Flashcards"}
                  </button>{" "}
                  <button className="secondary" onClick={() => handleDelete(d.id)}>Delete</button>
                </div>
              </div>

              {expandedDocId === d.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                  {flashcards.length === 0 ? (
                    <p>No flashcards yet — click "Generate Flashcards" above.</p>
                  ) : (
                    flashcards.map((f) => (
                      <div key={f.id} className="card">
                        <div className="card-title">Q: {f.question}</div>
                        <div className="card-meta">A: {f.answer}</div>
                      </div>
                    ))
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