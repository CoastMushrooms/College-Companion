import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">Study<span>Companion</span></div>

      <div className="sidebar-group">
        <div className="sidebar-label">Core</div>
        <NavLink to="/" className={linkClass} end>Dashboard</NavLink>
        <NavLink to="/courses" className={linkClass}>Courses</NavLink>
        <NavLink to="/assignments" className={linkClass}>Assignments</NavLink>
        <NavLink to="/notes" className={linkClass}>Notes</NavLink>
        <NavLink to="/calendar" className={linkClass}>Calendar</NavLink>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-label">AI Tools</div>
        <NavLink to="/explain" className={linkClass}>Explain</NavLink>
        <NavLink to="/ask" className={linkClass}>Ask</NavLink>
        <NavLink to="/planner" className={linkClass}>Planner</NavLink>
        <NavLink to="/agent" className={linkClass}>Agent</NavLink>
        <NavLink to="/study" className={linkClass}>Study</NavLink>
      </div>

      <div className="sidebar-group">
        <div className="sidebar-label">Utilities</div>
        <NavLink to="/documents" className={linkClass}>Documents</NavLink>
        <NavLink to="/timer" className={linkClass}>Timer</NavLink>
        <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
        <NavLink to="/quick-note" className={linkClass}>Quick Note</NavLink>
      </div>

      <button className="sidebar-logout" onClick={logout}>Log out</button>
    </nav>
  );
}