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

  useEffect(() => {
    loadData();
  }, []);

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
    if (expandedDocId === documentId) {
      setExpandedDocId(null);
      return;
    }
    setExpandedDocId(documentId);
    setError("");
    try {
      const cards = await api.getDocumentFlashcards(documentId);
      setFlashcards(cards);
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
        <button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload PDF"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {documents.map((d) => (
          <li key={d.id}>
            {d.filename}
            <button onClick={() => handleGenerateFlashcards(d.id)} disabled={generatingId === d.id}>
              {generatingId === d.id ? "Generating..." : "Generate Flashcards"}
            </button>
            <button onClick={() => toggleExpand(d.id)}>
              {expandedDocId === d.id ? "Hide Flashcards" : "View Flashcards"}
            </button>

            {expandedDocId === d.id && (
              <div style={{ marginTop: "10px", paddingLeft: "10px", borderLeft: "2px solid #ddd" }}>
                {flashcards.length === 0 ? (
                  <p>No flashcards yet — click "Generate Flashcards" above.</p>
                ) : (
                  <ul>
                    {flashcards.map((f) => (
                      <li key={f.id}><strong>Q:</strong> {f.question}<br /><strong>A:</strong> {f.answer}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}