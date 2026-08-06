const API_URL = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Something went wrong" }));
    throw new Error(error.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (email, password) =>
    request("/register", { method: "POST", body: JSON.stringify({ email, password }) }),

  login: async (email, password) => {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error("Invalid email or password");
    return res.json();
  },

  getCourses: () => request("/courses"),
  createCourse: (data) => request("/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (id, data) => request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: "DELETE" }),

  getAssignments: () => request("/assignments"),
  createAssignment: (data) => request("/assignments", { method: "POST", body: JSON.stringify(data) }),
  updateAssignment: (id, data) => request(`/assignments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAssignment: (id) => request(`/assignments/${id}`, { method: "DELETE" }),

  getNotes: () => request("/notes"),
  createNote: (data) => request("/notes", { method: "POST", body: JSON.stringify(data) }),
  updateNote: (id, data) => request(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: "DELETE" }),

  getDashboard: () => request("/dashboard"),
  getCalendar: () => request("/calendar"),

  generateFlashcards: (noteId) => request(`/notes/${noteId}/flashcards`, { method: "POST" }),
  getAllFlashcards: () => request("/flashcards/all"),
  getFlashcards: (noteId) => request(`/notes/${noteId}/flashcards`),

  generateQuiz: (noteId) => request(`/notes/${noteId}/quiz`, { method: "POST" }),
  getQuiz: (noteId) => request(`/notes/${noteId}/quiz`),

  summarize: (content) => request("/summarize", { method: "POST", body: JSON.stringify({ content }) }),
  explain: (concept, style) => request("/explain", { method: "POST", body: JSON.stringify({ concept, style }) }),
  uploadDocument: async (file, courseId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", courseId);
    const token = getToken();
    const res = await fetch(`${API_URL}/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail);
    }
    return res.json();
  },

  getDocuments: () => request("/documents"),
  ragQuery: (question) => request("/rag/query", { method: "POST", body: JSON.stringify({ question }) }),
  getPlanner: () => request("/planner"),

  logStudySession: (durationMinutes, courseId) =>
    request("/study-sessions", { method: "POST", body: JSON.stringify({ duration_minutes: durationMinutes, course_id: courseId }) }),
  getAnalytics: () => request("/analytics"),
  getDeadlineWarning: () => request("/deadline-warning"),
  askAgent: (message) => request("/agent", { method: "POST", body: JSON.stringify({ message }) }),
  generateDocumentFlashcards: (documentId) => request(`/documents/${documentId}/flashcards`, { method: "POST" }),
  getDocumentFlashcards: (documentId) => request(`/documents/${documentId}/flashcards`),
};