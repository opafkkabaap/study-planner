import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>study planner 📖</h2>
        <button className="hamburger">☰</button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon"></span> dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/pomodoro" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon"></span> pomodoro timer
            </NavLink>
          </li>
          <li>
            <NavLink to="/schedule" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon"></span> week's schedule
            </NavLink>
          </li>
          <li>
            <NavLink to="/progress" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon"></span> track progress
            </NavLink>
          </li>
          <li>
            <NavLink to="/exams" className={({ isActive }) => isActive ? "active" : ""}>
              <span className="icon"></span> exam dates
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/account" className={({ isActive }) => isActive ? "active footer-active" : ""}>
          <span className="icon">⚙️</span> account settings
        </NavLink>
      </div>
    </aside>
  );
}