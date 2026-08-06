import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/">Dashboard</Link>
      <Link to="/courses">Courses</Link>
      <Link to="/assignments">Assignments</Link>
      <Link to="/notes">Notes</Link>
      <Link to="/calendar">Calendar</Link>
      <Link to="/explain">Explain</Link>
      <Link to="/study">Study</Link>
      <Link to="/documents">Documents</Link>
      <Link to="/ask">Ask</Link>
      <Link to="/planner">Planner</Link>
      <Link to="/timer">Timer</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/agent">Agent</Link>
      <Link to="/quick-note">Quick Note</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}