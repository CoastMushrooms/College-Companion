import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Assignments from "./pages/Assignments";
import Notes from "./pages/Notes";
import CalendarPage from "./pages/Calendar";
import Explain from "./pages/Explain";
import Study from "./pages/Study";
import Documents from "./pages/Documents";
import Ask from "./pages/Ask";
import Planner from "./pages/Planner";
import Timer from "./pages/Timer";
import Analytics from "./pages/Analytics";
import Agent from "./pages/Agent";
import QuickNote from "./pages/QuickNote";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const { token } = useAuth();

  return (
    <>
      {token && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
          <Route path="/ask" element={<ProtectedRoute><Ask /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
          <Route path="/explain" element={<ProtectedRoute><Explain /></ProtectedRoute>} />
          <Route path="/timer" element={<ProtectedRoute><Timer /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/agent" element={<ProtectedRoute><Agent /></ProtectedRoute>} />
          <Route path="/quick-note" element={<ProtectedRoute><QuickNote /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}